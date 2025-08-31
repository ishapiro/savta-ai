// AI processing endpoint for assets
// Handles image analysis, caption generation, and tagging using OpenAI

import { analyzeImage, analyzeText } from '~/server/utils/openai-client.js';
import { createClient } from '@supabase/supabase-js';
import { invalidateFaceDetectionCache } from '~/server/utils/face-detection-cache.js';
import { enhanceLocationDetection, hasUsefulExifData } from '~/server/utils/location-detection.js';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceRoleKey || config.public.supabaseKey
  )
  
  try {
    console.log('🔄 Starting asset processing endpoint')
    const config = useRuntimeConfig()
    
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
    const { assetUrl, storageUrl, assetType, assetId, userId, memoryBookId } = body
    
    // Support both assetUrl and storageUrl for backward compatibility
    const finalAssetUrl = assetUrl || storageUrl
    
    if (!finalAssetUrl) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Asset URL is required'
      })
    }
    
    if (!assetType) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Asset type is required'
      })
    }
    
    // Get user ID from request body or from request context
    let finalUserId = userId
    if (!finalUserId) {
      // Try to get user from request headers (JWT token)
      const authHeader = event.req.headers['authorization'] || event.req.headers['Authorization']
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '').trim()
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser(token)
        if (!userError && currentUser) {
          finalUserId = currentUser.id
        }
      }
      
      // If still no user ID, try to get it from the asset record itself
      if (!finalUserId && assetId) {
        const { data: assetData, error: assetError } = await supabase
          .from('assets')
          .select('user_id')
          .eq('id', assetId)
          .single()
        
        if (!assetError && assetData) {
          finalUserId = assetData.user_id
        }
      }
      
      if (!finalUserId) {
        throw createError({
          statusCode: 400,
          statusMessage: 'User ID is required'
        })
      }
    }
    
    console.log('📁 Processing asset:', finalAssetUrl)
    console.log('📋 Asset type:', assetType)
    console.log('👤 User ID:', finalUserId)
    console.log('📚 Memory Book ID:', memoryBookId)
    
    // STEP 1: Invalidate face detection cache when AI rerun is triggered
    if (assetId) {
      await invalidateFaceDetectionCache(assetId);
      console.log('🔄 Face detection cache invalidated for asset:', assetId);
    }
    
    let analysisResult = null
    
    // Use centralized OpenAI client based on asset type
    if (assetType === 'image' || assetType === 'photo') {
      console.log('🖼️ Processing image asset...')
      analysisResult = await analyzeImage(finalAssetUrl)
    } else if (assetType === 'text') {
      console.log('📝 Processing text asset...')
      analysisResult = await analyzeText(finalAssetUrl) // finalAssetUrl contains the text content
    } else {
      throw createError({
        statusCode: 400,
        statusMessage: 'Unsupported asset type. Must be "image", "photo", or "text"'
      })
    }
    
    if (!analysisResult) {
      console.error('❌ No analysis result returned')
      throw createError({
        statusCode: 500,
        statusMessage: 'Asset analysis failed'
      })
    }
    
    console.log('✅ Asset analysis completed:', analysisResult)
    
    // STEP 2: Enhanced location detection for image assets
    let enhancedLocationData = null;
    let hasExifData = false;
    
    if ((assetType === 'image' || assetType === 'photo') && analysisResult) {
      console.log('🌍 Running enhanced location detection...');
      
      // Extract EXIF data from analysis result
      const exifData = analysisResult.exif_data || {};
      hasExifData = hasUsefulExifData(exifData);
      
      console.log(`📊 EXIF data available: ${hasExifData}`);
      if (hasExifData) {
        console.log('📍 GPS coordinates:', exifData.gps_latitude, exifData.gps_longitude);
      }
      
      // Enhance location detection with Mapbox fallback
      enhancedLocationData = await enhanceLocationDetection(analysisResult, exifData);
      console.log('🌍 Enhanced location data:', enhancedLocationData);
    }
    
    // STEP 3: Run face detection for image assets (only after successful AI analysis)
    if ((assetType === 'image' || assetType === 'photo') && assetId) {
      console.log('🔍 Running face detection as part of AI rerun...');
      try {
        const config = useRuntimeConfig();
        const faceDetectionResponse = await fetch(`${config.public.siteUrl}/api/ai/detect-faces-rekognition`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            imageUrl: finalAssetUrl,
            assetId: assetId,
            forceRefresh: true // Always fresh since we just invalidated cache
          })
        });
        
        if (faceDetectionResponse.ok) {
          const faceData = await faceDetectionResponse.json();
          console.log(`✅ Face detection completed: ${faceData.faceCount} faces detected`);
        } else {
          const errorText = await faceDetectionResponse.text();
          console.warn('⚠️ Face detection failed during AI rerun:', errorText);
        }
      } catch (faceError) {
        console.warn('⚠️ Face detection error during AI rerun:', faceError.message);
        // Continue with AI processing even if face detection fails
      }
    }
    
    // Update existing asset with AI analysis results
    console.log('💾 Updating asset with AI analysis...')
    
    // Get the asset ID from the request
    if (!assetId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Asset ID is required'
      })
    }
    
    const updateData = {
      ai_caption: analysisResult.caption || '',
      ai_description: analysisResult.ai_description || '',
      tags: analysisResult.tags || [],
      people_detected: analysisResult.people_detected || [],
      ai_processed: true,
      has_exif_data: hasExifData,
      updated_at: new Date().toISOString()
    }
    
    // Add enhanced location data if available
    if (enhancedLocationData) {
      if (enhancedLocationData.location) {
        updateData.location = enhancedLocationData.location;
      }
      if (enhancedLocationData.city) {
        updateData.city = enhancedLocationData.city;
      }
      if (enhancedLocationData.state) {
        updateData.state = enhancedLocationData.state;
      }
      if (enhancedLocationData.country) {
        updateData.country = enhancedLocationData.country;
      }
      if (enhancedLocationData.zip_code) {
        updateData.zip_code = enhancedLocationData.zip_code;
      }
    } else if (analysisResult.location) {
      // Fallback to original AI location if enhancement failed
      updateData.location = analysisResult.location;
    }
    
    const { data: updatedAsset, error: updateError } = await supabase
      .from('assets')
      .update(updateData)
      .eq('id', assetId)
      .eq('user_id', finalUserId)
      .select()
      .single()
    
    if (updateError) {
      console.error('❌ Error updating asset:', updateError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update asset'
      })
    }
    
    console.log('✅ Asset updated with AI analysis:', updatedAsset.id)
    
    return {
      success: true,
      data: {
        asset_id: updatedAsset.id,
        analysis: analysisResult
      }
    }
    
  } catch (error) {
    console.error('❌ Asset processing error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Asset processing failed'
    })
  }
}) 