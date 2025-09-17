import { selectPhotosByAttributes } from '~/server/utils/openai-client.js';

// Helper function to update PDF status
async function updatePdfStatus(supabase, bookId, userId, status) {
  try {
    const { error } = await supabase
      .from('pdf_status')
      .upsert({
        book_id: bookId,
        user_id: userId,
        status: status,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: ['book_id', 'user_id'] 
      })
    if (error) {
      console.error('Error updating PDF status:', error)
    }
  } catch (error) {
    console.error('Error updating PDF status:', error)
  }
}

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    
    // Create Supabase client
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey || config.public.supabaseKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // Get OpenAI API key
    const openaiApiKey = config.openaiApiKey || process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'OpenAI API key not configured'
      })
    }
    
    // Get request body
    const body = await readBody(event)
    const { memoryBookId, userId, photoCount = 3 } = body
    
    if (!memoryBookId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Memory book ID is required'
      })
    }
    
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }
    
    // Step 1: Fetch the memory book and validate ai_supplemental_prompt
    const { data: memoryBook, error: bookError } = await supabase
      .from('memory_books')
      .select('*')
      .eq('id', memoryBookId)
      .eq('user_id', userId)
      .single()
    
    if (bookError || !memoryBook) {
      console.error('❌ Error fetching memory book:', bookError)
      throw createError({
        statusCode: 404,
        statusMessage: 'Memory book not found'
      })
    }
    
    // Validate that ai_supplemental_prompt is set (optional for manual photo selection)
    if (memoryBook.photo_selection_method === 'ai' && (!memoryBook.ai_supplemental_prompt || memoryBook.ai_supplemental_prompt.trim() === '')) {
      console.error('❌ Memory book ai_supplemental_prompt is empty for AI photo selection')
      throw createError({
        statusCode: 400,
        statusMessage: 'Memory book prompt is required for AI photo selection. Please set a description for your memory book before generating.'
      })
    }
    
    // Set a default prompt if none provided and using manual selection
    if (!memoryBook.ai_supplemental_prompt || memoryBook.ai_supplemental_prompt.trim() === '') {
      memoryBook.ai_supplemental_prompt = 'Memory Book'
      console.log('📝 Using default prompt for manual photo selection')
    }
    
    // Step 2: Fetch assets from photo_selection_pool
    if (!memoryBook.photo_selection_pool || memoryBook.photo_selection_pool.length === 0) {
      console.error('❌ No photo selection pool found')
      throw createError({
        statusCode: 400,
        statusMessage: 'No photos available for selection. Please add photos to your library first.'
      })
    }
    
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('*')
      .in('id', memoryBook.photo_selection_pool)
      .eq('user_id', userId)
      .eq('approved', true)
      .eq('deleted', false)
    
    if (assetsError || !assets || assets.length === 0) {
      console.error('❌ Error fetching assets:', assetsError)
      throw createError({
        statusCode: 400,
        statusMessage: 'No approved photos found in selection pool'
      })
    }
    
    // Step 3: Handle photo selection based on method
    let selectedAssets
    let photoSelectionResult
    
    // Check if this is a photo replacement scenario
    const photosToReplace = memoryBook.photos_to_replace ? JSON.parse(memoryBook.photos_to_replace) : []
    const isPhotoReplacement = memoryBook.photo_selection_method === 'replace_selected' && photosToReplace.length > 0
    
    if (isPhotoReplacement) {
      // Photo replacement logic - keep some photos, replace others
      console.log('🔄 Photo replacement detected, replacing', photosToReplace.length, 'photos')
      console.log('🔄 DEBUG - photosToReplace:', photosToReplace)
      console.log('🔄 DEBUG - memoryBook.created_from_assets:', memoryBook.created_from_assets)
      
      // Get the original photos from the book
      // For recreation, use photo_selection_pool as the original photos since created_from_assets might be null
      const originalPhotos = memoryBook.created_from_assets || memoryBook.photo_selection_pool || []
      console.log('🔄 DEBUG - originalPhotos:', originalPhotos)
      
      // Keep photos that are NOT marked for replacement
      const photosToKeep = originalPhotos.filter(photoId => !photosToReplace.includes(photoId))
      console.log('🔄 DEBUG - photosToKeep:', photosToKeep)
      
      // Get new photos for replacement from the selection pool
      // For photo replacement, we can use any photo from the selection pool EXCEPT the ones marked for replacement
      console.log('🔄 DEBUG - assets in selection pool:', assets.map(a => a.id))
      const availableForReplacement = assets.filter(asset => !photosToReplace.includes(asset.id))
      console.log('🔄 DEBUG - availableForReplacement:', availableForReplacement.map(a => a.id))
      
      if (availableForReplacement.length < photosToReplace.length) {
        console.error('❌ Not enough new photos available for replacement')
        throw createError({
          statusCode: 400,
          statusMessage: `Not enough new photos available for replacement. Need ${photosToReplace.length} new photos, but only ${availableForReplacement.length} are available.`
        })
      }
      
      // Select new photos for replacement using AI
      const replacementCount = photosToReplace.length
      const replacementSelectionResult = await selectPhotosByAttributes(
        availableForReplacement, 
        memoryBook.ai_supplemental_prompt, 
        replacementCount, 
        []
      )
      
      if (!replacementSelectionResult || !replacementSelectionResult.selected_photo_numbers) {
        console.error('❌ No replacement photo selection result returned')
        throw createError({
          statusCode: 500,
          statusMessage: 'Photo replacement failed - unable to find suitable replacement photos.'
        })
      }
      
      const replacementPhotoIndices = replacementSelectionResult.selected_photo_numbers
      const replacementPhotos = replacementPhotoIndices.map(index => availableForReplacement[index].id)
      
      // Combine kept photos with replacement photos
      selectedAssets = [...photosToKeep, ...replacementPhotos]
      
      // Create reasoning for photo replacement
      photoSelectionResult = {
        reasoning: `Photo replacement: kept ${photosToKeep.length} original photos and replaced ${replacementPhotos.length} photos with new ones. ${replacementSelectionResult.reasoning || ''}`
      }
      
      await updatePdfStatus(supabase, memoryBookId, userId, `🔄 Replaced ${replacementPhotos.length} photos while keeping ${photosToKeep.length} original photos...`)
      
    } else if (memoryBook.photo_selection_method === 'photo_library') {
      // Manual selection - use the photos in the pool directly
      console.log('📸 Manual photo selection detected, using selected photos directly')
      selectedAssets = assets
      
      // Create a simple reasoning for manual selection
      photoSelectionResult = {
        reasoning: `You manually selected ${selectedAssets.length} photos for this memory book.`
      }
      
      await updatePdfStatus(supabase, memoryBookId, userId, `📸 Using your manually selected ${selectedAssets.length} photos...`)
    } else {
      // AI selection - use attribute-based photo selection
      const previouslyUsedCount = memoryBook.previously_used_assets?.length || 0
      const minimumRequiredPoolSize = photoCount * 3
      const assetsAfterExclusion = assets.length - previouslyUsedCount
      const willExcludePreviouslyUsed = assetsAfterExclusion >= minimumRequiredPoolSize
      
      const statusMessage = willExcludePreviouslyUsed 
        ? `🎯 Analyzing ${assetsAfterExclusion} available photos (excluding ${previouslyUsedCount} previously used) to find ${photoCount} best matches for "${memoryBook.ai_supplemental_prompt}"...`
        : `🎯 Analyzing ${assets.length} available photos to find ${photoCount} best matches for "${memoryBook.ai_supplemental_prompt}" (including previously used photos to ensure variety)...`
      
      await updatePdfStatus(supabase, memoryBookId, userId, statusMessage)
      
      // Get previously used photos to exclude them from selection
      const previouslyUsedAssetIds = memoryBook.previously_used_assets || []
      
      photoSelectionResult = await selectPhotosByAttributes(assets, memoryBook.ai_supplemental_prompt, photoCount, previouslyUsedAssetIds)
      
      if (!photoSelectionResult || !photoSelectionResult.selected_photo_numbers) {
        console.error('❌ No photo selection result returned')
        throw createError({
          statusCode: 500,
          statusMessage: 'Photo selection failed - unable to find suitable photos for your prompt.'
        })
      }
      
      const selectedPhotoIndices = photoSelectionResult.selected_photo_numbers
      
      // Validate that we got at least the requested number of photos
      if (selectedPhotoIndices.length < photoCount) {
        console.error(`❌ Photo selection returned ${selectedPhotoIndices.length} photos, expected at least ${photoCount}`)
        throw createError({
          statusCode: 500,
          statusMessage: `Photo selection returned ${selectedPhotoIndices.length} photos, expected at least ${photoCount}`
        })
      }
      
      console.log(`✅ Photo selection successful: ${selectedPhotoIndices.length} photos selected (requested: ${photoCount})`)
      
      // Get the selected assets
      selectedAssets = selectedPhotoIndices.map(index => assets[index]).filter(Boolean)
    }
    
    if (selectedAssets.length === 0) {
      console.error('❌ No valid assets found from selection')
      throw createError({
        statusCode: 500,
        statusMessage: 'No valid photos selected'
      })
    }
    
    // Step 4: Convert selectedAssets to IDs if they are asset objects
    let selectedAssetIds
    if (isPhotoReplacement) {
      // For photo replacement, selectedAssets is already an array of IDs
      selectedAssetIds = selectedAssets
    } else {
      // For normal selection, selectedAssets is an array of asset objects
      selectedAssetIds = selectedAssets.map(asset => asset.id)
    }
    
    // Step 5: Update the memory book with selected photos
    console.log('REASONING: Photo selection reasoning:', photoSelectionResult.reasoning)
    
    // Add note about using different photos if this is a recreation
    let finalReasoning = photoSelectionResult.reasoning
    if (memoryBook.previously_used_assets && memoryBook.previously_used_assets.length > 0) {
      finalReasoning += ` (Using different photos from the previous version to give you a fresh perspective)`
    }
    
    const { error: updateError } = await supabase
      .from('memory_books')
      .update({
        created_from_assets: selectedAssetIds,
        ai_photo_selection_reasoning: finalReasoning,
        status: 'draft',
        updated_at: new Date().toISOString()
      })
      .eq('id', memoryBookId)
      .eq('user_id', userId)
    
    if (updateError) {
      console.error('❌ Error updating memory book:', updateError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to save memory book results'
      })
    }
    
    // Step 6: Return the results
    return {
      success: true,
      selected_photo_ids: selectedAssetIds,
      reasoning: finalReasoning
    }
    
  } catch (error) {
    console.error('❌ Magic memory generation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Magic memory generation failed'
    })
  }
}) 