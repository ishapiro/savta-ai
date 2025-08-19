import { selectPhotosByAttributes, generateStoryFromAttributes } from '~/server/utils/openai-client.js';

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
    console.log('🎭 Starting magic memory generation endpoint')
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
    
    console.log('📚 Memory Book ID:', memoryBookId)
    console.log('👤 User ID:', userId)
    
    // Step 1: Fetch the memory book and validate ai_supplemental_prompt
    console.log('📖 Step 1: Fetching memory book and validating prompt...')
    
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
    
    console.log('✅ Memory book prompt:', memoryBook.ai_supplemental_prompt)
    
    // Step 2: Fetch assets from photo_selection_pool
    console.log('📸 Step 2: Fetching assets from photo selection pool...')
    
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
    
    console.log(`✅ Found ${assets.length} assets in photo selection pool`)
    
    // Update status if we have a book ID
    await updatePdfStatus(supabase, memoryBookId, userId, `🎯 Step 1: Analyzing ${assets.length} photos to find ${photoCount} best matches for "${memoryBook.ai_supplemental_prompt}"...`)
    
    // Step 3: Use attribute-based photo selection
    console.log('🎯 Step 3: Selecting photos based on attributes...')
    
    const photoSelectionResult = await selectPhotosByAttributes(assets, memoryBook.ai_supplemental_prompt, photoCount)
    
    if (!photoSelectionResult || !photoSelectionResult.selected_photo_numbers) {
      console.error('❌ No photo selection result returned')
      throw createError({
        statusCode: 500,
        statusMessage: 'Photo selection failed - unable to find suitable photos for your prompt.'
      })
    }
    
    const selectedPhotoIndices = photoSelectionResult.selected_photo_numbers
    console.log('✅ Selected photo indices:', selectedPhotoIndices)
    
    // Validate that we got the requested number of photos
    if (selectedPhotoIndices.length !== photoCount) {
      console.error(`❌ Photo selection returned ${selectedPhotoIndices.length} photos, expected ${photoCount}`)
      throw createError({
        statusCode: 500,
        statusMessage: `Photo selection returned ${selectedPhotoIndices.length} photos, expected ${photoCount}`
      })
    }
    
    // Get the selected assets
    const selectedAssets = selectedPhotoIndices.map(index => assets[index]).filter(Boolean)
    console.log('✅ Selected assets count:', selectedAssets.length)
    
    if (selectedAssets.length === 0) {
      console.error('❌ No valid assets found from selection')
      throw createError({
        statusCode: 500,
        statusMessage: 'No valid photos selected'
      })
    }
    
    // Step 4: Generate story from asset attributes
    console.log('📖 Step 4: Generating story from asset attributes...')
    
    // Update status if we have a book ID
    await updatePdfStatus(supabase, memoryBookId, userId, '📖 Step 2: Generating story...')
    
    const storyResult = await generateStoryFromAttributes(selectedAssets)
    
    if (!storyResult || !storyResult.story) {
      console.error('❌ No story result returned')
      throw createError({
        statusCode: 500,
        statusMessage: 'Story generation failed'
      })
    }
    
    const story = storyResult.story
    console.log('✅ Generated story:', storyResult.story)
    
    // Step 5: Update the memory book with results
    console.log('💾 Step 5: Updating memory book with results...')
    
    const { error: updateError } = await supabase
      .from('memory_books')
      .update({
        created_from_assets: selectedAssets.map(asset => asset.id),
        magic_story: story,
        ai_photo_selection_reasoning: photoSelectionResult.reasoning,
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
    console.log('✅ Magic memory generation completed successfully')
    
    return {
      success: true,
      selected_photo_ids: selectedAssets.map(asset => asset.id),
      story: story,
      background_type: 'white', // Default background type
      reasoning: photoSelectionResult.reasoning
    }
    
  } catch (error) {
    console.error('❌ Magic memory generation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Magic memory generation failed'
    })
  }
}) 