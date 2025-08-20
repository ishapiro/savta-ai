import { analyzeLocation } from '~/server/utils/openai-client.js';

export default defineEventHandler(async (event) => {
  try {
    // Check if this is a FormData request
    const contentType = event.req.headers['content-type'] || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData case where file is sent instead of URL
      console.log('⚠️ FormData provided, skipping location analysis');
      return {
        success: true,
        metadata: {
          width: null,
          height: null,
          orientation: null,
          location: null,
          city: null,
          state: null,
          country: null,
          zip_code: null,
          asset_date: null
        }
      };
    }
    
    // Handle JSON request
    const body = await readBody(event);
    let imageUrl = body.imageUrl;

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