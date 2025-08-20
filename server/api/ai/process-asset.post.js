// AI processing endpoint for assets
// Handles image analysis, caption generation, and tagging using OpenAI

import { analyzeImage, analyzeText } from '~/server/utils/openai-client.js';
import { createClient } from '@supabase/supabase-js'

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
      updated_at: new Date().toISOString()
    }
    
    // Add location data if available
    if (analysisResult.location) {
      updateData.location = analysisResult.location
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