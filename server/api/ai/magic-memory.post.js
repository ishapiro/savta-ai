import { selectPhotos, generateStory } from '~/server/utils/openai-client.js';

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
    const { photoUrls, photos, userId, memoryBookId } = body
    
    // Support both 'photoUrls' and 'photos' parameter names for compatibility
    const photoUrlsArray = photoUrls || photos
    
    if (!photoUrlsArray || !Array.isArray(photoUrlsArray) || photoUrlsArray.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Photo URLs array is required'
      })
    }
    
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }
    
    console.log('📸 Processing', photoUrlsArray.length, 'photos for magic memory')
    console.log('👤 User ID:', userId)
    console.log('📚 Memory Book ID:', memoryBookId)
    
    // Step 1: Use centralized OpenAI client for photo selection
    console.log('🎯 Step 1: Selecting best photos...')
    
    // Update status if we have a book ID
    if (memoryBookId) {
      await updatePdfStatus(supabase, memoryBookId, userId, `🎯 Step 1: Examining ${photoUrlsArray.length} photos to find ${body.photo_count || 3} best...`)
    }
    
    // Get photo count from request body or use default
    const photoCount = body.photo_count || 3
    
    // Check if we have enough photos to proceed
    if (photoUrlsArray.length < photoCount) {
      console.warn(`⚠️ Only ${photoUrlsArray.length} photos provided, but ${photoCount} requested. Using all available photos.`);
    }
    
    const photoSelectionResult = await selectPhotos(photoUrlsArray, photoCount)
    
    if (!photoSelectionResult || !photoSelectionResult.selected_photo_numbers) {
      console.error('❌ No photo selection result returned')
      throw createError({
        statusCode: 500,
        statusMessage: 'Photo selection failed - no valid images found. Please check that your images are accessible and not too large.'
      })
    }
    
    const selectedPhotoNumbers = photoSelectionResult.selected_photo_numbers
    console.log('✅ Selected photo numbers:', selectedPhotoNumbers)
    
    // Validate that we got at least some photos
    if (selectedPhotoNumbers.length === 0) {
      console.error('❌ No photos selected')
      throw createError({
        statusCode: 500,
        statusMessage: 'No photos could be selected. Please check that your images are accessible and not too large.'
      })
    }
    
    // Validate that we got the requested number of photos (or at least 1 if fewer were requested)
    const expectedCount = Math.min(photoCount, photoUrlsArray.length);
    if (selectedPhotoNumbers.length < Math.min(1, expectedCount)) {
      console.error(`❌ Photo selection returned ${selectedPhotoNumbers.length} photos, expected at least ${Math.min(1, expectedCount)}`)
      throw createError({
        statusCode: 500,
        statusMessage: `Photo selection returned ${selectedPhotoNumbers.length} photos, expected at least ${Math.min(1, expectedCount)}`
      })
    }
    
    // Validate that all selected numbers are valid indices (0-based)
    const validIndices = selectedPhotoNumbers.every(num => num >= 0 && num < photoUrlsArray.length && !isNaN(num))
    if (!validIndices) {
      console.error('❌ Photo selection contains invalid indices:', selectedPhotoNumbers)
      throw createError({
        statusCode: 500,
        statusMessage: 'Photo selection contains invalid indices'
      })
    }
    
    // Get the actual selected photo URLs
    const selectedPhotoUrls = selectedPhotoNumbers.map(num => {
      const photo = photoUrlsArray[num];
      if (!photo) return null;
      
      // Extract URL from photo object or use string directly
      const imageUrl = typeof photo === 'string' ? photo : photo.storage_url || photo.asset_url || photo.url;
      return imageUrl;
    }).filter(Boolean);
    
    console.log('📸 Selected photo URLs:', selectedPhotoUrls)
    
    if (selectedPhotoUrls.length === 0) {
      console.error('❌ No valid photo URLs found from selection')
      throw createError({
        statusCode: 500,
        statusMessage: 'No valid photos selected'
      })
    }
    
    // Step 2: Use centralized OpenAI client for story generation
    console.log('📖 Step 2: Generating story...')
    
    // Update status if we have a book ID
    if (memoryBookId) {
      await updatePdfStatus(supabase, memoryBookId, userId, '📖 Step 2: Generating story...')
    }
    
    const storyResult = await generateStory(selectedPhotoUrls)
    
    if (!storyResult || !storyResult.story) {
      console.error('❌ No story result returned')
      throw createError({
        statusCode: 500,
        statusMessage: 'Story generation failed'
      })
    }
    
    const story = storyResult.story
    console.log('✅ Generated story:', storyResult.story)
    
    // Step 3: Return the results (database saving is handled by the caller)
    console.log('💾 Step 3: Returning results...')
    
    return {
      success: true,
      selected_photo_ids: selectedPhotoNumbers.map(num => photoUrlsArray[num].id).filter(Boolean),
      story: storyResult.story,
      background_type: 'white' // Default background type
    }
    
  } catch (error) {
    console.error('❌ Magic memory generation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Magic memory generation failed'
    })
  }
}) 