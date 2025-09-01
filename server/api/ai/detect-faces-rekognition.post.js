import { RekognitionClient, DetectFacesCommand } from "@aws-sdk/client-rekognition";
import { checkFaceDetectionCache, saveFaceDetectionCache } from '~/server/utils/face-detection-cache.js';
import { createClient } from '@supabase/supabase-js';

const client = new RekognitionClient({
  region: process.env.AWS_REGION,
});

export default defineEventHandler(async (event) => {
  try {
    const { imageUrl, assetId = null, forceRefresh = false, userId: requestUserId = null } = await readBody(event);
    
    if (!imageUrl) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: "imageUrl required" 
      });
    }

    // Get user ID from auth if not provided
    let userId = requestUserId;
    if (!userId) {
      const user = event.context.user;
      if (!user) {
        throw createError({ 
          statusCode: 401, 
          statusMessage: "Authentication required" 
        });
      }
      userId = user.id;
    }

    // Check cache first (if assetId provided and not forcing refresh)
    if (assetId && !forceRefresh) {
      const cachedResult = await checkFaceDetectionCache(assetId);
      if (cachedResult) {
        console.log('🎯 Using cached face detection data for asset:', assetId);
        return cachedResult;
      }
    }

    console.log('🔍 AWS Rekognition: Starting fresh face detection for:', imageUrl);
    if (assetId) {
      console.log('📝 Asset ID:', assetId, '| Force refresh:', forceRefresh);
    }

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

    const awsResult = await client.send(cmd);
    
    const faces = awsResult.FaceDetails?.map(f => ({
      box: f.BoundingBox,  // {Left,Top,Width,Height} relative to [0,1]
      confidence: f.Confidence,
      ageRange: f.AgeRange,
      gender: f.Gender,
      emotions: f.Emotions,
      pose: f.Pose,
      quality: f.Quality,
      landmarks: f.Landmarks,
    })) || [];

    console.log('✅ AWS Rekognition: Detected', faces.length, 'faces');

    // Initialize Supabase client
    const config = useRuntimeConfig()
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey || config.public.supabaseKey
    )

    // Clear existing face data for the asset if re-running (force refresh or no cache)
    if (assetId && (forceRefresh || !await checkFaceDetectionCache(assetId))) {
      await clearExistingFaceData(supabase, assetId);
    }

    // Store faces directly in local database (hybrid approach)
    let storedFaces = [];
    if (faces.length > 0 && assetId) {
      storedFaces = await storeFacesLocally(supabase, {
        assetId,
        userId,
        faces
      });
    }

    const result = {
      success: true,
      faces: faces,
      faceCount: faces.length,
      storedFaces: storedFaces
    };

    // Cache the results (if assetId provided)
    if (assetId && result.success) {
      await saveFaceDetectionCache(assetId, result, 'aws_rekognition');
    }

    return result;

  } catch (error) {
    console.error('❌ AWS Rekognition face detection error:', error);
    
    // Preserve authentication errors
    if (error.statusCode === 401) {
      throw error;
    }
    
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

// Helper function to store faces locally in database (hybrid approach)
async function storeFacesLocally(supabase, params) {
  const { assetId, userId, faces } = params;
  
  try {
    console.log('💾 Storing faces locally in database (hybrid approach)');
    
    const storedFaces = [];
    
    for (const face of faces) {
      // Generate a unique face ID for local storage
      const localFaceId = `local-${assetId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Convert confidence from percentage (0-100) to decimal (0-1)
      const confidenceDecimal = face.confidence ? face.confidence / 100 : 0.5;
      
      // Create a simple vector representation for local storage
      // In a real implementation, you might want to use a more sophisticated approach
      // For now, we'll create a basic vector based on face position and features
      const faceVector = createBasicFaceVector(face);
      
      // Store face in database
      const { data: storedFace, error: insertError } = await supabase
        .from('faces')
        .insert({
          user_id: userId,
          asset_id: assetId,
          aws_face_id: localFaceId,
          face_vector: faceVector,
          bounding_box: face.box,
          confidence: confidenceDecimal,
          age_range: face.ageRange,
          gender: face.gender,
          emotions: face.emotions,
          pose: face.pose,
          quality: face.quality,
          landmarks: face.landmarks,
          is_fallback: false // This is now our primary approach
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error storing face locally:', insertError);
        continue;
      }

      storedFaces.push({
        id: storedFace.id,
        aws_face_id: localFaceId,
        confidence: face.confidence,
        bounding_box: face.box
      });

      console.log('💾 Stored face locally:', storedFace.id);
    }
    
    console.log('📊 Stored', storedFaces.length, 'faces locally');
    return storedFaces;

  } catch (error) {
    console.error('❌ Error in storeFacesLocally:', error);
    throw error;
  }
}

// Helper function to create a basic face vector for local storage
function createBasicFaceVector(face) {
  // Create a 128-dimensional vector based on face features
  // This is a simplified approach - in production you might want more sophisticated feature extraction
  
  const vector = new Array(128).fill(0);
  
  // Use bounding box position (normalized to 0-1)
  vector[0] = face.box.Left || 0;
  vector[1] = face.box.Top || 0;
  vector[2] = face.box.Width || 0;
  vector[3] = face.box.Height || 0;
  
  // Use confidence score
  vector[4] = face.confidence ? face.confidence / 100 : 0.5;
  
  // Use age range if available
  if (face.ageRange) {
    vector[5] = face.ageRange.Low ? face.ageRange.Low / 100 : 0;
    vector[6] = face.ageRange.High ? face.ageRange.High / 100 : 0;
  }
  
  // Use gender confidence if available
  if (face.gender) {
    vector[7] = face.gender.Confidence ? face.gender.Confidence / 100 : 0;
    vector[8] = face.gender.Value === 'Male' ? 1 : 0;
  }
  
  // Use pose information if available
  if (face.pose) {
    vector[9] = face.pose.Yaw ? (face.pose.Yaw + 180) / 360 : 0.5; // Normalize to 0-1
    vector[10] = face.pose.Pitch ? (face.pose.Pitch + 90) / 180 : 0.5; // Normalize to 0-1
    vector[11] = face.pose.Roll ? (face.pose.Roll + 180) / 360 : 0.5; // Normalize to 0-1
  }
  
  // Use quality metrics if available
  if (face.quality) {
    vector[12] = face.quality.Brightness ? face.quality.Brightness / 100 : 0.5;
    vector[13] = face.quality.Sharpness ? face.quality.Sharpness / 100 : 0.5;
  }
  
  // Fill remaining dimensions with random values for uniqueness
  for (let i = 14; i < 128; i++) {
    vector[i] = Math.random();
  }
  
  return vector;
}



// Helper function to clear existing face data for an asset
async function clearExistingFaceData(supabase, assetId) {
  try {
    console.log('🧹 Clearing existing face data for asset:', assetId);
    
    // Delete existing faces for this asset
    const { error: deleteError } = await supabase
      .from('faces')
      .delete()
      .eq('asset_id', assetId);

    if (deleteError) {
      console.error('❌ Error clearing existing faces:', deleteError);
      return;
    }

    console.log('✅ Cleared existing face data for asset:', assetId);
  } catch (error) {
    console.error('❌ Error in clearExistingFaceData:', error);
    // Don't throw error - continue with face detection even if clearing fails
  }
}
