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
    
    // Validate that ai_supplemental_prompt is set
    if (!memoryBook.ai_supplemental_prompt || memoryBook.ai_supplemental_prompt.trim() === '') {
      console.error('❌ Memory book ai_supplemental_prompt is empty')
      throw createError({
        statusCode: 400,
        statusMessage: 'Memory book prompt is required. Please set a description for your memory book before generating.'
      })
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
    
    if (memoryBook.photo_selection_method === 'photo_library') {
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
      const availableCount = assets.length - previouslyUsedCount
      await updatePdfStatus(supabase, memoryBookId, userId, `🎯 Step 1: Analyzing ${availableCount} available photos (excluding ${previouslyUsedCount} previously used) to find ${photoCount} best matches for "${memoryBook.ai_supplemental_prompt}"...`)
      
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
      
      // Validate that we got the requested number of photos
      if (selectedPhotoIndices.length !== photoCount) {
        console.error(`❌ Photo selection returned ${selectedPhotoIndices.length} photos, expected ${photoCount}`)
        throw createError({
          statusCode: 500,
          statusMessage: `Photo selection returned ${selectedPhotoIndices.length} photos, expected ${photoCount}`
        })
      }
      
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
    
    // Step 4: Update the memory book with selected photos
    console.log('REASONING: Photo selection reasoning:', photoSelectionResult.reasoning)
    
    // Add note about using different photos if this is a recreation
    let finalReasoning = photoSelectionResult.reasoning
    if (memoryBook.previously_used_assets && memoryBook.previously_used_assets.length > 0) {
      finalReasoning += ` (Using different photos from the previous version to give you a fresh perspective)`
    }
    
    const { error: updateError } = await supabase
      .from('memory_books')
      .update({
        created_from_assets: selectedAssets.map(asset => asset.id),
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
    
    // Step 5: Return the results
    return {
      success: true,
      selected_photo_ids: selectedAssets.map(asset => asset.id),
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