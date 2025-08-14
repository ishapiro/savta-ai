import { detectFaces } from '~/server/utils/openai-client.js';

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

    console.log('🔍 Starting OpenAI person detection for:', imageUrl);

    // Use the centralized OpenAI client
    const faceDetectionResult = await detectFaces(imageUrl);

    if (!faceDetectionResult) {
      console.warn('⚠️ No face detection result returned');
      throw createError({
        statusCode: 500,
        statusMessage: 'No face detection result returned'
      });
    }

    console.log('✅ OpenAI person detection completed successfully');
    console.log('👥 Face detection result:', JSON.stringify(faceDetectionResult, null, 2));

    // Convert the detections array to the expected 'faces' format for compatibility
    const faces = faceDetectionResult.detections || [];
    console.log(`👥 OpenAI detected ${faces.length} people`);

    return {
      success: true,
      data: faceDetectionResult,
      faces: faces // Add the faces array for backward compatibility
    };

  } catch (error) {
    console.error('❌ Face detection error:', error);
    
    if (error.message?.includes('OpenAI API error')) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Face detection failed'
    });
  }
}); 