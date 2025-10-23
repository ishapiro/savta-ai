import { getHeader, createError } from 'h3'

/**
 * Reindex all faces for a user
 * Processes all user's photos through the new IndexFaces flow
 * Used for backfilling and bulk reprocessing
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
  
  console.log(`🔄 Starting reindex for user ${user.id}`)
  
  try {
    // 1. Get all user's assets with images
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('id, storage_url, file_name, media_type')
      .eq('user_id', user.id)
      .eq('deleted', false)
      .in('media_type', ['image', 'photo'])
      .order('created_at', { ascending: true })
    
    if (assetsError) {
      console.error('❌ Error fetching assets:', assetsError)
      throw createError({ 
        statusCode: 500, 
        statusMessage: `Failed to fetch assets: ${assetsError.message}` 
      })
    }
    
    if (!assets || assets.length === 0) {
      return {
        success: true,
        processed: 0,
        facesDetected: 0,
        autoAssigned: 0,
        needsUserInput: 0,
        message: 'No photos to process'
      }
    }
    
    console.log(`📸 Found ${assets.length} photos to reindex`)
    
    // 2. Process each asset
    let processed = 0
    let totalFacesDetected = 0
    let totalAutoAssigned = 0
    let totalNeedsUserInput = 0
    const errors = []
    
    for (const asset of assets) {
      try {
        console.log(`🔍 Processing asset ${asset.id} (${processed + 1}/${assets.length})`)
        
        // Call the index-face-rekognition endpoint
        const response = await $fetch('/api/ai/index-face-rekognition', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: {
            imageUrl: asset.storage_url,
            assetId: asset.id,
            reprocessOptions: { faces: true }
          }
        })
        
        processed++
        totalFacesDetected += response.facesDetected || 0
        totalAutoAssigned += response.autoAssigned?.length || 0
        totalNeedsUserInput += response.needsUserInput?.length || 0
        
        console.log(`✅ Asset ${asset.id}: ${response.facesDetected} faces, ${response.autoAssigned?.length || 0} auto-assigned`)
        
      } catch (error) {
        console.error(`❌ Error processing asset ${asset.id}:`, error)
        errors.push({
          assetId: asset.id,
          fileName: asset.file_name,
          error: error.message
        })
        // Continue processing other assets
      }
    }
    
    console.log(`🎉 Reindex complete: ${processed}/${assets.length} photos processed`)
    console.log(`📊 Stats: ${totalFacesDetected} faces, ${totalAutoAssigned} auto-assigned, ${totalNeedsUserInput} need input`)
    
    return {
      success: true,
      processed,
      total: assets.length,
      facesDetected: totalFacesDetected,
      autoAssigned: totalAutoAssigned,
      needsUserInput: totalNeedsUserInput,
      errors: errors.length > 0 ? errors : undefined,
      message: `Processed ${processed} photos. ${totalFacesDetected} faces detected, ${totalAutoAssigned} auto-assigned, ${totalNeedsUserInput} need your review.`
    }
    
  } catch (error) {
    console.error('❌ Error during reindex:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: `Reindex failed: ${error.message}` 
    })
  }
})

