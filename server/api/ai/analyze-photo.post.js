import { analyzePhotoShape } from '~/server/utils/openai-client.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { imageUrl } = body;

    if (!imageUrl) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Image URL is required'
      });
    }

    console.log('🔍 Starting photo shape analysis for:', imageUrl);

    // Use the centralized OpenAI client
    const analysisResult = await analyzePhotoShape(imageUrl);

    if (!analysisResult) {
      console.warn('⚠️ No photo analysis result returned');
      throw createError({
        statusCode: 500,
        statusMessage: 'No photo analysis result returned'
      });
    }

    console.log('✅ Photo shape analysis completed successfully');
    console.log('📊 Analysis result:', JSON.stringify(analysisResult, null, 2));

    return {
      success: true,
      data: analysisResult
    };

  } catch (error) {
    console.error('❌ Photo analysis error:', error);
    
    if (error.message?.includes('OpenAI API error')) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Photo analysis failed'
    });
  }
});