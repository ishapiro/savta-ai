import { RekognitionClient, DetectFacesCommand } from "@aws-sdk/client-rekognition";

const client = new RekognitionClient({
  region: process.env.AWS_REGION,
});

export default defineEventHandler(async (event) => {
  try {
    const { imageUrl } = await readBody(event);
    
    if (!imageUrl) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: "imageUrl required" 
      });
    }

    console.log('🔍 AWS Rekognition: Starting face detection for:', imageUrl);

    // Download the image (must be raw bytes for Rekognition)
    const res = await fetch(imageUrl);
    if (!res.ok) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: `Failed to fetch image: ${res.status}` 
      });
    }
    
    const buf = Buffer.from(await res.arrayBuffer());
    console.log('📥 AWS Rekognition: Downloaded image, size:', buf.length, 'bytes');

    const cmd = new DetectFacesCommand({
      Image: { Bytes: buf },
      Attributes: ["DEFAULT"], // or ["ALL"] if you want age/gender/emotion
    });

    const result = await client.send(cmd);
    
    const faces = result.FaceDetails?.map(f => ({
      box: f.BoundingBox,  // {Left,Top,Width,Height} relative to [0,1]
      confidence: f.Confidence,
    })) || [];

    console.log('✅ AWS Rekognition: Detected', faces.length, 'faces');

    return {
      success: true,
      faces: faces,
      faceCount: faces.length
    };

  } catch (error) {
    console.error('❌ AWS Rekognition face detection error:', error);
    
    if (error.name === 'InvalidParameterException') {
      throw createError({ 
        statusCode: 400, 
        statusMessage: "Invalid image format or size" 
      });
    }
    
    if (error.name === 'AccessDeniedException') {
      throw createError({ 
        statusCode: 500, 
        statusMessage: "AWS Rekognition access denied - check credentials" 
      });
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: `Face detection failed: ${error.message}` 
    });
  }
});
