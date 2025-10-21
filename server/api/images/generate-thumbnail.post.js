/**
 * Generate Thumbnail API
 * 
 * Generates optimized thumbnails from full-resolution images using Sharp.
 * Thumbnails are 400px wide in WebP format for optimal performance.
 * 
 * CRITICAL: Thumbnails are for UI display ONLY. PDF generation must use full-resolution images.
 */

import { getHeader, createError } from 'h3'
import sharp from 'sharp'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceRoleKey || config.public.supabaseKey
  )

  // Validate authentication
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
  }

  // Get request body
  const body = await readBody(event)
  const { imageUrl, userId, originalFileName } = body

  if (!imageUrl || !userId || !originalFileName) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Missing required fields: imageUrl, userId, originalFileName' 
    })
  }

  // Verify user owns this resource
  if (user.id !== userId) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  try {
    console.log('🖼️ Starting thumbnail generation for:', originalFileName)

    // Fetch the full-resolution image from Supabase Storage
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`)
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())
    console.log('📥 Downloaded image buffer:', imageBuffer.length, 'bytes')

    // Generate thumbnail using Sharp
    // - Resize to 400px width (maintaining aspect ratio)
    // - Convert to WebP format for optimal compression
    // - Quality 80% for good balance of size vs quality
    const thumbnailBuffer = await sharp(imageBuffer)
      .resize(400, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 80 })
      .toBuffer()

    console.log('✨ Generated thumbnail:', thumbnailBuffer.length, 'bytes')

    // Get thumbnail metadata
    const metadata = await sharp(thumbnailBuffer).metadata()
    const thumbnailWidth = metadata.width
    const thumbnailHeight = metadata.height

    console.log(`📐 Thumbnail dimensions: ${thumbnailWidth}x${thumbnailHeight}`)

    // Upload thumbnail to Supabase Storage
    // Store in user-specific thumbnails subfolder
    const thumbnailFileName = `${userId}/thumbnails/${Date.now()}-${originalFileName.replace(/\.[^/.]+$/, '')}.webp`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('assets')
      .upload(thumbnailFileName, thumbnailBuffer, {
        contentType: 'image/webp',
        cacheControl: '31536000' // Cache for 1 year
      })

    if (uploadError) {
      console.error('❌ Thumbnail upload error:', uploadError)
      throw uploadError
    }

    // Get public URL for the thumbnail
    const { data: urlData } = supabase.storage
      .from('assets')
      .getPublicUrl(thumbnailFileName)

    const thumbnailUrl = urlData.publicUrl

    console.log('✅ Thumbnail uploaded successfully:', thumbnailUrl)

    // Return thumbnail information
    return {
      success: true,
      thumbnailUrl,
      thumbnailWidth,
      thumbnailHeight,
      originalSize: imageBuffer.length,
      thumbnailSize: thumbnailBuffer.length,
      compressionRatio: (thumbnailBuffer.length / imageBuffer.length * 100).toFixed(1) + '%'
    }

  } catch (error) {
    console.error('❌ Thumbnail generation failed:', error)
    throw createError({ 
      statusCode: 500, 
      statusMessage: `Thumbnail generation failed: ${error.message}` 
    })
  }
})

