import { aiCropRecommendation } from '~/server/utils/openai-client.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { imageUrl, targetWidth = 800, targetHeight = 600 } = body;

    if (!imageUrl) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Image URL is required'
      });
    }

    console.log('🔍 Starting AI crop recommendation for:', imageUrl);
    console.log(`📏 Target dimensions: ${targetWidth}x${targetHeight}`);

    // Use the centralized OpenAI client
    const cropResult = await aiCropRecommendation(imageUrl, targetWidth, targetHeight);

    if (!cropResult) {
      console.warn('⚠️ No crop recommendation result returned');
      throw createError({
        statusCode: 500,
        statusMessage: 'No crop recommendation result returned'
      });
    }

    console.log('✅ AI crop recommendation completed successfully');
    console.log('✂️ Crop recommendation result:', JSON.stringify(cropResult, null, 2));

    // Extract faces from priority subjects for backward compatibility
    const faces = cropResult.priority_subjects?.filter(subject => subject.type === 'face') || [];
    console.log(`👥 AI detected ${faces.length} faces`);

    return {
      success: true,
      data: cropResult,
      faces: faces, // Add the faces array for backward compatibility
      crop_area: cropResult.crop_area,
      priority_subjects: cropResult.priority_subjects,
      reasoning: cropResult.reasoning,
      confidence: cropResult.confidence
    };

  } catch (error) {
    console.error('❌ AI crop recommendation error:', error);
    
    if (error.message?.includes('OpenAI API error')) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'AI crop recommendation failed'
    });
  }
}); 