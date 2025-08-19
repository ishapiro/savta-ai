import { generateStoryFromAttributes } from '~/server/utils/openai-client'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { selectedAssets, aiSupplementalPrompt, photoSelectionReasoning } = body

    // Create Supabase client
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    if (!selectedAssets || !Array.isArray(selectedAssets) || selectedAssets.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Selected assets are required'
      })
    }
    
    if (!aiSupplementalPrompt) {
      throw createError({
        statusCode: 400,
        statusMessage: 'AI supplemental prompt is required'
      })
    }
    
    console.log('📝 STEP 2: STORY GENERATION - Request details:', {
      selectedAssetsCount: selectedAssets?.length || 0,
      aiSupplementalPrompt: aiSupplementalPrompt,
      hasPhotoSelectionReasoning: !!photoSelectionReasoning,
      photoSelectionReasoning: photoSelectionReasoning || 'none'
    })
    
    // Generate story from selected assets
    const storyResult = await generateStoryFromAttributes(selectedAssets, aiSupplementalPrompt, photoSelectionReasoning)
    
    return {
      success: true,
      story: storyResult.story
    }
    
  } catch (error) {
    console.error('❌ STEP 2: STORY GENERATION - Story generation failed:', error.message)
    console.error('❌ STEP 2: STORY GENERATION - Error details:', {
      message: error.message,
      stack: error.stack
    })
    
    return {
      success: false,
      error: error.message
    }
  }
})
