// Face detection caching utilities
// Handles caching and retrieval of AWS Rekognition face detection results

import { createClient } from '@supabase/supabase-js';

/**
 * Check if cached face detection data exists for an asset
 * @param {string} assetId - The asset ID to check
 * @returns {Promise<Object|null>} Cached face detection data or null if not found
 */
export async function checkFaceDetectionCache(assetId) {
  try {
    const config = useRuntimeConfig();
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey || config.public.supabaseKey
    );
    
    const { data: asset, error } = await supabase
      .from('assets')
      .select('face_detection_data, face_detection_provider, face_detection_processed_at')
      .eq('id', assetId)
      .single();
    
    if (error) {
      console.warn('⚠️ Error checking face detection cache:', error.message);
      return null;
    }
    
    if (!asset?.face_detection_data) {
      console.log('📭 No cached face detection data found for asset:', assetId);
      return null;
    }
    
    console.log(`🎯 Found cached face detection data from ${asset.face_detection_provider} for asset:`, assetId);
    
    // Return cached data in the same format as the live API response
    return {
      success: true,
      faces: asset.face_detection_data.faces || [],
      faceCount: asset.face_detection_data.faceCount || 0,
      cached: true,
      provider: asset.face_detection_provider,
      processedAt: asset.face_detection_processed_at
    };
  } catch (error) {
    console.error('❌ Error checking face detection cache:', error);
    return null;
  }
}

/**
 * Save face detection results to cache
 * @param {string} assetId - The asset ID to cache results for
 * @param {Object} detectionResult - The face detection results to cache
 * @param {string} provider - The provider used ('aws_rekognition' or 'openai_vision')
 * @returns {Promise<boolean>} Success status
 */
export async function saveFaceDetectionCache(assetId, detectionResult, provider = 'aws_rekognition') {
  try {
    const config = useRuntimeConfig();
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey || config.public.supabaseKey
    );
    
    // Prepare the data to cache (remove any metadata we don't need to store)
    const cacheData = {
      faces: detectionResult.faces || [],
      faceCount: detectionResult.faceCount || 0,
      success: detectionResult.success
    };
    
    const { error } = await supabase
      .from('assets')
      .update({
        face_detection_data: cacheData,
        face_detection_provider: provider,
        face_detection_processed_at: new Date().toISOString()
      })
      .eq('id', assetId);
    
    if (error) {
      console.warn('⚠️ Failed to cache face detection results:', error.message);
      return false;
    }
    
    console.log(`✅ Face detection results cached successfully for asset: ${assetId} (${cacheData.faceCount} faces)`);
    return true;
  } catch (error) {
    console.error('❌ Error saving face detection cache:', error);
    return false;
  }
}

/**
 * Invalidate cached face detection data for an asset
 * @param {string} assetId - The asset ID to invalidate cache for
 * @returns {Promise<boolean>} Success status
 */
export async function invalidateFaceDetectionCache(assetId) {
  try {
    const config = useRuntimeConfig();
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey || config.public.supabaseKey
    );
    
    const { error } = await supabase
      .from('assets')
      .update({
        face_detection_data: null,
        face_detection_provider: null,
        face_detection_processed_at: null
      })
      .eq('id', assetId);
    
    if (error) {
      console.warn('⚠️ Failed to invalidate face detection cache:', error.message);
      return false;
    }
    
    console.log('🔄 Face detection cache invalidated for asset:', assetId);
    return true;
  } catch (error) {
    console.error('❌ Error invalidating face detection cache:', error);
    return false;
  }
}

/**
 * Invalidate face detection cache for multiple assets
 * @param {string[]} assetIds - Array of asset IDs to invalidate
 * @returns {Promise<number>} Number of assets successfully invalidated
 */
export async function invalidateFaceDetectionCacheForAssets(assetIds) {
  if (!assetIds || assetIds.length === 0) {
    return 0;
  }
  
  try {
    const config = useRuntimeConfig();
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey || config.public.supabaseKey
    );
    
    const { error, count } = await supabase
      .from('assets')
      .update({
        face_detection_data: null,
        face_detection_provider: null,
        face_detection_processed_at: null
      })
      .in('id', assetIds);
    
    if (error) {
      console.warn('⚠️ Failed to invalidate face detection cache for multiple assets:', error.message);
      return 0;
    }
    
    console.log(`🔄 Face detection cache invalidated for ${count || assetIds.length} assets`);
    return count || assetIds.length;
  } catch (error) {
    console.error('❌ Error invalidating face detection cache for multiple assets:', error);
    return 0;
  }
}
