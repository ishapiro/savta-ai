import { getHeader, createError } from 'h3'
import { RekognitionClient, IndexFacesCommand, SearchFacesCommand } from "@aws-sdk/client-rekognition"
import { ensureUserCollection, saveCollectionToDb } from '~/server/utils/rekognition-collections.js'
import { processFacesWithMatches } from '~/server/utils/process-face-matches.js'

const rekognitionClient = new RekognitionClient({ 
  region: process.env.AWS_REGION || 'us-east-1'
})

/**
 * Index faces in an image using AWS Rekognition Collections
 * - Creates user collection if doesn't exist
 * - Calls IndexFaces to detect and index faces
 * - Calls SearchFaces for each detected face to find matches
 * - Auto-assigns faces with high similarity (>= 95%)
 * - Returns faces needing user input for assignment
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceRoleKey || config.public.supabaseKey
  )
  
  // Validate authentication
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  
  const token = authHeader.replace('Bearer ', '')
  
  // Check if this is a service role key (for backfill script)
  let user
  if (token === config.supabaseServiceRoleKey) {
    // Service role authentication - get user ID from header
    const userId = getHeader(event, 'x-user-id')
    if (!userId) {
      throw createError({ statusCode: 400, statusMessage: 'X-User-Id header required for service role' })
    }
    
    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, email')
      .eq('user_id', userId)
      .single()
    
    if (profileError || !profile) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }
    
    user = { id: profile.user_id, email: profile.email }
  } else {
    // Regular user authentication
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !authUser) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
    }
    
    user = authUser
  }
  
  // Get request body
  const body = await readBody(event)
  const { imageUrl, assetId, reprocessOptions } = body
  
  if (!imageUrl || !assetId) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Missing required parameters: imageUrl, assetId' 
    })
  }
  
  // Check if we should process faces based on reprocessOptions
  if (reprocessOptions && !reprocessOptions.faces) {
    console.log(`⏭️ Skipping face recognition (not requested)`)
    return { 
      success: true, 
      skipped: true,
      message: 'Face recognition not requested' 
    }
  }
  
  console.log(`🎯 Starting face indexing for asset ${assetId}`)
  console.log(`📸 Image URL: ${imageUrl}`)
  
  try {
    // 1. Check if this asset already has faces indexed
    const { data: existingFaces, error: checkError } = await supabase
      .from('faces')
      .select('id, rekognition_face_id')
      .eq('asset_id', assetId)
      .eq('deleted', false)
    
    if (checkError) {
      console.error('❌ Error checking existing faces:', checkError)
      throw checkError
    }
    
    if (existingFaces && existingFaces.length > 0) {
      console.log(`⏭️ Asset ${assetId} already has ${existingFaces.length} face(s) indexed - skipping reindexing`)
      console.log(`   Existing face IDs: ${existingFaces.map(f => f.rekognition_face_id).join(', ')}`)
      
      // Return empty results to avoid duplicate processing
      return {
        success: true,
        alreadyProcessed: true,
        facesDetected: existingFaces.length,
        autoAssigned: [],
        needsUserInput: []
      }
    }
    
    // 2. Ensure user has a collection
    const { collectionId, arn, faceCount } = await ensureUserCollection(user.id)
    
    // 3. Save/update collection in database
    await saveCollectionToDb(supabase, user.id, collectionId, arn, faceCount)
    
    // 4. Download image bytes
    console.log(`📥 Downloading image...`)
    const imageBytes = await fetchImageBytes(imageUrl)
    
    // 5. Call IndexFaces to detect and index faces with size threshold
    console.log(`🔍 Calling IndexFaces with quality filter and face size threshold...`)
    const indexResult = await rekognitionClient.send(new IndexFacesCommand({
      CollectionId: collectionId,
      Image: { Bytes: imageBytes },
      ExternalImageId: assetId,
      DetectionAttributes: ['DEFAULT'],
      MaxFaces: 10,
      QualityFilter: 'AUTO' // Filter out low quality faces
    }))
    
    console.log(`👥 IndexFaces detected ${indexResult.FaceRecords?.length || 0} faces`)
    
    if (!indexResult.FaceRecords || indexResult.FaceRecords.length === 0) {
      return {
        success: true,
        facesDetected: 0,
        autoAssigned: [],
        needsUserInput: []
      }
    }
    
    // 6. Filter faces by minimum size threshold
    // BoundingBox dimensions are in percentage (0.0 to 1.0)
    // A face that's 5% of image width and 5% of image height = 0.0025 area
    // We want faces that are at least 3% of image width OR 3% of image height
    const MIN_FACE_WIDTH = 0.03  // 3% of image width
    const MIN_FACE_HEIGHT = 0.03 // 3% of image height
    
    const filteredFaceRecords = indexResult.FaceRecords.filter(faceRecord => {
      const bbox = faceRecord.Face.BoundingBox
      const width = bbox.Width || 0
      const height = bbox.Height || 0
      
      // Face must meet minimum width OR height threshold
      const meetsThreshold = width >= MIN_FACE_WIDTH || height >= MIN_FACE_HEIGHT
      
      if (!meetsThreshold) {
        console.log(`⏭️ Skipping tiny face ${faceRecord.Face.FaceId} (${(width * 100).toFixed(1)}% x ${(height * 100).toFixed(1)}% - too small)`)
      }
      
      return meetsThreshold
    })
    
    console.log(`✅ After size filtering: ${filteredFaceRecords.length} meaningful faces (filtered out ${indexResult.FaceRecords.length - filteredFaceRecords.length} tiny faces)`)
    
    if (filteredFaceRecords.length === 0) {
      return {
        success: true,
        facesDetected: 0,
        autoAssigned: [],
        needsUserInput: [],
        message: 'All detected faces were too small to be meaningful'
      }
    }
    
    // 7. For each indexed face, search for matches
    const facesWithMatches = []
    
    for (const faceRecord of filteredFaceRecords) {
      const faceId = faceRecord.Face.FaceId
      
      console.log(`🔎 Searching for matches for face ${faceId}...`)
      
      try {
        // Search for similar faces
        const searchResult = await rekognitionClient.send(new SearchFacesCommand({
          CollectionId: collectionId,
          FaceId: faceId,
          FaceMatchThreshold: 80, // Minimum 80% similarity
          MaxFaces: 5
        }))
        
        console.log(`📊 Found ${searchResult.FaceMatches?.length || 0} matches`)
        
        facesWithMatches.push({
          faceId,
          boundingBox: faceRecord.Face.BoundingBox,
          confidence: faceRecord.Face.Confidence,
          matches: searchResult.FaceMatches || []
        })
      } catch (searchError) {
        // If search fails (e.g., only face in collection), continue with no matches
        console.warn(`⚠️ Search failed for face ${faceId}:`, searchError.message)
        facesWithMatches.push({
          faceId,
          boundingBox: faceRecord.Face.BoundingBox,
          confidence: faceRecord.Face.Confidence,
          matches: []
        })
      }
    }
    
    // 6. Process faces with matches (auto-assign or flag for user input)
    const results = await processFacesWithMatches(
      facesWithMatches,
      assetId,
      user.id,
      collectionId,
      supabase
    )
    
    // 7. Update asset face detection metadata
    await supabase
      .from('assets')
      .update({
        face_detection_data: {
          facesDetected: facesWithMatches.length,
          autoAssigned: results.autoAssigned.length,
          needsUserInput: results.needsUserInput.length
        },
        face_detection_provider: 'aws_rekognition_collections',
        face_detection_processed_at: new Date().toISOString()
      })
      .eq('id', assetId)
    
    console.log(`✅ Face indexing complete for asset ${assetId}`)
    
    return {
      success: true,
      facesDetected: facesWithMatches.length,
      autoAssigned: results.autoAssigned,
      needsUserInput: results.needsUserInput
    }
    
  } catch (error) {
    console.error('❌ Error indexing faces:', error)
    throw createError({ 
      statusCode: 500, 
      statusMessage: `Face indexing failed: ${error.message}` 
    })
  }
})

/**
 * Fetch image bytes from URL
 * 
 * @param {string} imageUrl - Image URL
 * @returns {Promise<Buffer>} Image bytes
 */
async function fetchImageBytes(imageUrl) {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error) {
    console.error('❌ Error fetching image:', error)
    throw error
  }
}

