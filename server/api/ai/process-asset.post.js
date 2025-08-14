// AI processing endpoint for assets
// Handles image analysis, caption generation, and tagging using OpenAI

import { analyzeImage, analyzeText } from '~/server/utils/openai-client.js';

export default defineEventHandler(async (event) => {
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
    const { assetUrl, assetType, userId, memoryBookId } = body
    
    if (!assetUrl) {
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
    
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }
    
    console.log('📁 Processing asset:', assetUrl)
    console.log('📋 Asset type:', assetType)
    console.log('👤 User ID:', userId)
    console.log('📚 Memory Book ID:', memoryBookId)
    
    let analysisResult = null
    
    // Use centralized OpenAI client based on asset type
    if (assetType === 'image') {
      console.log('🖼️ Processing image asset...')
      analysisResult = await analyzeImage(assetUrl)
    } else if (assetType === 'text') {
      console.log('📝 Processing text asset...')
      analysisResult = await analyzeText(assetUrl) // assetUrl contains the text content
    } else {
      throw createError({
        statusCode: 400,
        statusMessage: 'Unsupported asset type. Must be "image" or "text"'
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
    
    // Save to database
    console.log('💾 Saving asset to database...')
    const { data: supabase } = await $fetch('/api/supabase/client')
    
    const assetData = {
      user_id: userId,
      memory_book_id: memoryBookId,
      asset_url: assetUrl,
      asset_type: assetType,
      caption: analysisResult.caption || '',
      tags: analysisResult.tags || [],
      people_detected: analysisResult.people_detected || [],
      objects: analysisResult.objects || [],
      location: analysisResult.location || '',
      created_at: new Date().toISOString()
    }
    
    const { data: newAsset, error: insertError } = await supabase
      .from('assets')
      .insert(assetData)
      .select()
      .single()
    
    if (insertError) {
      console.error('❌ Error saving asset:', insertError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to save asset'
      })
    }
    
    console.log('✅ Asset saved to database:', newAsset.id)
    
    return {
      success: true,
      data: {
        asset_id: newAsset.id,
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