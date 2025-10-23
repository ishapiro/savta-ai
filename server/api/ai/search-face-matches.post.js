import { getHeader, createError } from 'h3'
import { SearchFacesCommand, RekognitionClient } from "@aws-sdk/client-rekognition"

const rekognitionClient = new RekognitionClient({ 
  region: process.env.AWS_REGION || 'us-east-1'
})

/**
 * Search for matches for an already-indexed face
 * Used by "Search Similar Faces" feature in People Manager
 * 
 * This is different from index-face-rekognition which detects NEW faces
 * This searches for matches for faces that are ALREADY in Rekognition
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
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  
  if (authError || !user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
  }
  
  // Get request body
  const body = await readBody(event)
  const { faceId, rekognitionFaceId } = body
  
  if (!faceId || !rekognitionFaceId) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Missing required parameters: faceId, rekognitionFaceId' 
    })
  }
  
  console.log(`🔍 Searching for matches for face ${faceId} (Rekognition ID: ${rekognitionFaceId})`)
  
  try {
    // 0. Check if this face's asset is a duplicate of another asset with assigned faces
    // Get the current face's asset
    const { data: currentFace, error: currentFaceError } = await supabase
      .from('faces')
      .select('asset_id, assets(title, created_at)')
      .eq('id', faceId)
      .single()
    
    if (!currentFaceError && currentFace) {
      // Look for other assets with the same title (potential duplicates)
      const { data: duplicateAssets, error: dupError } = await supabase
        .from('assets')
        .select('id')
        .eq('title', currentFace.assets.title)
        .eq('user_id', user.id)
        .eq('deleted', false)
        .neq('id', currentFace.asset_id)
      
      if (!dupError && duplicateAssets && duplicateAssets.length > 0) {
        console.log(`🔄 Found ${duplicateAssets.length} potential duplicate asset(s) with same filename`)
        
        // Check if any faces in those duplicate assets are assigned
        // Use a simpler query approach - get face_person_links directly
        const { data: assignedLinks, error: dupFaceError } = await supabase
          .from('face_person_links')
          .select(`
            id,
            face_id,
            person_group_id,
            faces!inner (
              id,
              asset_id
            ),
            person_groups (
              id,
              name,
              display_name,
              relationship
            )
          `)
          .in('faces.asset_id', duplicateAssets.map(a => a.id))
          .eq('deleted', false)
          .eq('faces.deleted', false)
        
        console.log(`   📝 Duplicate query result: ${assignedLinks?.length || 0} assigned face(s) found ${dupFaceError ? `(Error: ${dupFaceError.message})` : ''}`)
        
        if (!dupFaceError && assignedLinks && assignedLinks.length > 0) {
          // Found assigned faces in duplicate photos - auto-assign to the same person
          const assignedLink = assignedLinks[0]
          const person = assignedLink.person_groups
          
          if (!person || !person.id) {
            console.log(`⚠️ Duplicate face found but no person data available`)
          } else {
            console.log(`🎯 AUTO-ASSIGNING to ${person.display_name || person.name} (duplicate photo match)`)
          
          // Create face_person_link
          const { error: linkError } = await supabase
            .from('face_person_links')
            .insert({
              face_id: faceId,
              person_group_id: person.id,
              assigned_by: 'system',
              confidence: 1.0 // 100% - it's the same photo
            })
          
          if (linkError) {
            console.error('❌ Error creating face_person_link for duplicate:', linkError)
          } else {
            // Update face record
            await supabase
              .from('faces')
              .update({
                needs_assignment: false,
                auto_assigned: true
              })
              .eq('id', faceId)
            
            return {
              success: true,
              action: 'auto_assigned',
              matchCount: 1,
              suggestionCount: 1,
              autoAssigned: [{
                faceId,
                personId: person.id,
                personName: person.display_name || person.name,
                similarity: 100,
                matchCount: 1,
                reason: 'duplicate_photo'
              }],
              needsUserInput: []
            }
          }
          }
        }
      }
    }
    
    // 1. Get user's collection ID
    const { data: collection, error: collectionError } = await supabase
      .from('face_collections')
      .select('aws_collection_id')
      .eq('user_id', user.id)
      .single()
    
    if (collectionError || !collection) {
      throw createError({ 
        statusCode: 404, 
        statusMessage: 'User collection not found' 
      })
    }
    
    // 2. Search for similar faces in the collection
    console.log(`🔎 Calling SearchFaces for ${rekognitionFaceId} in collection ${collection.aws_collection_id}`)
    
    let searchResult
    try {
      searchResult = await rekognitionClient.send(new SearchFacesCommand({
        CollectionId: collection.aws_collection_id,
        FaceId: rekognitionFaceId,
        FaceMatchThreshold: 80, // Minimum 80% similarity
        MaxFaces: 5
      }))
    } catch (searchError) {
      // If search fails (e.g., only face in collection), return no matches
      console.warn(`⚠️ Search failed for face ${rekognitionFaceId}:`, searchError.message)
      searchResult = { FaceMatches: [] }
    }
    
    console.log(`📊 Found ${searchResult.FaceMatches?.length || 0} potential matches`)
    
    // 3. Process matches to find person assignments
    const matches = searchResult.FaceMatches || []
    const personAssignments = new Map() // personId -> { personId, name, matchCount, avgSimilarity }
    
    for (const match of matches) {
      const matchedFaceId = match.Face.FaceId
      const similarity = match.Similarity
      
      // Look up this face in our database to see if it's assigned to a person
      // Use a simpler query - lookup face_person_links directly
      const { data: matchedLinks, error: faceError } = await supabase
        .from('face_person_links')
        .select(`
          id,
          person_group_id,
          faces!inner (
            id,
            rekognition_face_id
          ),
          person_groups (
            id,
            name,
            display_name,
            relationship
          )
        `)
        .eq('faces.rekognition_face_id', matchedFaceId)
        .eq('deleted', false)
        .eq('faces.deleted', false)
      
      if (faceError || !matchedLinks || matchedLinks.length === 0) {
        console.log(`   ⚪ Match ${matchedFaceId} (${similarity.toFixed(1)}%) - not assigned to anyone`)
        continue
      }
      
      const matchedLink = matchedLinks[0]
      const person = matchedLink.person_groups
      if (!person) {
        console.log(`   ⚪ Match ${matchedFaceId} (${similarity.toFixed(1)}%) - person data not loaded`)
        continue
      }
      
      console.log(`   ✅ Match ${matchedFaceId} (${similarity.toFixed(1)}%) - assigned to ${person.display_name || person.name}`)
      
      // Aggregate matches by person
      if (!personAssignments.has(person.id)) {
        personAssignments.set(person.id, {
          personId: person.id,
          name: person.name,
          displayName: person.display_name,
          relationship: person.relationship,
          matchCount: 0,
          totalSimilarity: 0,
          avgSimilarity: 0,
          maxSimilarity: 0
        })
      }
      
      const personData = personAssignments.get(person.id)
      personData.matchCount++
      personData.totalSimilarity += similarity
      personData.maxSimilarity = Math.max(personData.maxSimilarity, similarity)
      personData.avgSimilarity = personData.totalSimilarity / personData.matchCount
    }
    
    // 4. Convert to array and sort by confidence
    const suggestions = Array.from(personAssignments.values())
      .sort((a, b) => b.maxSimilarity - a.maxSimilarity)
    
    console.log(`👥 Identified ${suggestions.length} person suggestion(s)`)
    
    // 5. Determine action based on best match
    let action = 'no_match'
    let autoAssigned = null
    let needsUserInput = null
    
    if (suggestions.length > 0) {
      const bestMatch = suggestions[0]
      
      // Auto-assign if:
      // - Max similarity >= 95% (very high confidence)
      // - At least 2 matching faces OR single match with >97% similarity
      const shouldAutoAssign = 
        (bestMatch.maxSimilarity >= 95 && bestMatch.matchCount >= 2) ||
        (bestMatch.maxSimilarity >= 97)
      
      if (shouldAutoAssign) {
        console.log(`🎯 AUTO-ASSIGNING to ${bestMatch.displayName || bestMatch.name} (${bestMatch.maxSimilarity.toFixed(1)}% similarity, ${bestMatch.matchCount} match(es))`)
        
        // Create face_person_link
        const { error: linkError } = await supabase
          .from('face_person_links')
          .insert({
            face_id: faceId,
            person_group_id: bestMatch.personId,
            assigned_by: 'system',
            confidence: bestMatch.maxSimilarity / 100
          })
        
        if (linkError) {
          console.error('❌ Error creating face_person_link:', linkError)
          throw linkError
        }
        
        // Update face record
        await supabase
          .from('faces')
          .update({
            needs_assignment: false,
            auto_assigned: true
          })
          .eq('id', faceId)
        
        action = 'auto_assigned'
        autoAssigned = {
          faceId,
          personId: bestMatch.personId,
          personName: bestMatch.displayName || bestMatch.name,
          similarity: bestMatch.maxSimilarity,
          matchCount: bestMatch.matchCount
        }
      } else {
        console.log(`❓ Needs user confirmation for ${bestMatch.displayName || bestMatch.name} (${bestMatch.maxSimilarity.toFixed(1)}% similarity)`)
        
        // Get face details for user confirmation
        const { data: faceDetails } = await supabase
          .from('faces')
          .select(`
            id,
            asset_id,
            rekognition_face_id,
            bounding_box,
            confidence,
            assets (
              id,
              storage_url,
              thumbnail_url,
              title
            )
          `)
          .eq('id', faceId)
          .single()
        
        action = 'needs_user_input'
        needsUserInput = {
          ...faceDetails,
          suggestions: suggestions.map(s => ({
            personId: s.personId,
            name: s.displayName || s.name,
            relationship: s.relationship,
            similarity: s.maxSimilarity,
            matchCount: s.matchCount
          }))
        }
      }
    } else {
      console.log(`⚪ No matches found - face needs manual assignment`)
      
      // Get face details for user to create new person
      const { data: faceDetails } = await supabase
        .from('faces')
        .select(`
          id,
          asset_id,
          rekognition_face_id,
          bounding_box,
          confidence,
          assets (
            id,
            storage_url,
            thumbnail_url,
            title
          )
        `)
        .eq('id', faceId)
        .single()
      
      action = 'needs_user_input'
      needsUserInput = {
        ...faceDetails,
        suggestions: []
      }
    }
    
    return {
      success: true,
      action,
      matchCount: matches.length,
      suggestionCount: suggestions.length,
      autoAssigned: autoAssigned ? [autoAssigned] : [],
      needsUserInput: needsUserInput ? [needsUserInput] : []
    }
    
  } catch (error) {
    console.error('❌ Error searching for face matches:', error)
    throw createError({ 
      statusCode: 500, 
      statusMessage: `Face search failed: ${error.message}` 
    })
  }
})

