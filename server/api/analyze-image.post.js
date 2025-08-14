import { analyzeLocation } from '~/server/utils/openai-client.js';

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

    console.log('🔍 Starting location analysis for:', imageUrl);

    // Use the centralized OpenAI client
    const locationResult = await analyzeLocation(imageUrl);

    if (!locationResult) {
      console.warn('⚠️ No location analysis result returned');
      throw createError({
        statusCode: 500,
        statusMessage: 'No location analysis result returned'
      });
    }

    console.log('✅ Location analysis completed successfully');
    console.log('📍 Location result:', JSON.stringify(locationResult, null, 2));

    return {
      success: true,
      data: locationResult
    };

  } catch (error) {
    console.error('❌ Location analysis error:', error);
    
    if (error.message?.includes('OpenAI API error')) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Location analysis failed'
    });
  }
}); 