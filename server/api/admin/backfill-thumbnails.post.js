// Admin utility: Backfill thumbnails for existing assets
// Generates thumbnails for assets that don't have them yet

import { getHeader, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const { createClient } = await import('@supabase/supabase-js')
    
    // Use service role key for admin operations
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey || config.public.supabaseKey
    )
    
    // Authenticate user
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }
    
    // Verify user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()
    
    if (profileError || !profile || (profile.role !== 'admin' && profile.role !== 'editor')) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden: Admin access required'
      })
    }
    
    console.log('🔧 Starting thumbnail backfill process...')
    
    // Get request body
    const body = await readBody(event)
    const { userId, limit = 10 } = body || {}
    
    // Build query for assets without thumbnails
    let query = supabase
      .from('assets')
      .select('id, user_id, storage_url, type, created_at')
      .eq('type', 'photo')
      .eq('deleted', false)
      .is('thumbnail_url', null)
      .order('created_at', { ascending: true })
    
    // If userId provided, only process that user's assets
    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    // Limit batch size to prevent timeouts
    query = query.limit(limit)
    
    const { data: assetsWithoutThumbnails, error: queryError } = await query
    
    if (queryError) {
      console.error('❌ Error querying assets:', queryError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to query assets'
      })
    }
    
    if (!assetsWithoutThumbnails || assetsWithoutThumbnails.length === 0) {
      console.log('✅ No assets found without thumbnails')
      return {
        success: true,
        processed: 0,
        succeeded: 0,
        failed: 0,
        skipped: 0,
        message: 'All assets already have thumbnails'
      }
    }
    
    console.log(`📸 Found ${assetsWithoutThumbnails.length} assets without thumbnails`)
    
    // Process each asset
    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
      errors: []
    }
    
    for (const asset of assetsWithoutThumbnails) {
      results.processed++
      
      try {
        console.log(`🖼️ Processing asset ${asset.id} (${results.processed}/${assetsWithoutThumbnails.length})...`)
        
        // Validate storage_url
        if (!asset.storage_url) {
          console.warn(`⚠️ Asset ${asset.id} has no storage_url, skipping`)
          results.skipped++
          results.errors.push({
            assetId: asset.id,
            error: 'No storage_url available'
          })
          continue
        }
        
        // Get original filename from storage_url
        const urlParts = asset.storage_url.split('/')
        const originalFileName = urlParts[urlParts.length - 1]
        
        // Call thumbnail generation API
        const thumbnailResult = await $fetch('/api/images/generate-thumbnail', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: {
            imageUrl: asset.storage_url,
            userId: asset.user_id,
            originalFileName: originalFileName
          }
        })
        
        if (thumbnailResult.success) {
          // Update asset with thumbnail info
          const { error: updateError } = await supabase
            .from('assets')
            .update({
              thumbnail_url: thumbnailResult.thumbnailUrl,
              thumbnail_width: thumbnailResult.thumbnailWidth,
              thumbnail_height: thumbnailResult.thumbnailHeight
            })
            .eq('id', asset.id)
          
          if (updateError) {
            console.error(`❌ Failed to update asset ${asset.id}:`, updateError)
            results.failed++
            results.errors.push({
              assetId: asset.id,
              error: `Database update failed: ${updateError.message}`
            })
          } else {
            console.log(`✅ Successfully generated thumbnail for asset ${asset.id}`)
            results.succeeded++
          }
        } else {
          console.error(`❌ Thumbnail generation failed for asset ${asset.id}`)
          results.failed++
          results.errors.push({
            assetId: asset.id,
            error: 'Thumbnail generation failed'
          })
        }
      } catch (error) {
        console.error(`❌ Error processing asset ${asset.id}:`, error.message)
        results.failed++
        results.errors.push({
          assetId: asset.id,
          error: error.message
        })
      }
    }
    
    console.log('🎉 Thumbnail backfill completed:', results)
    
    return {
      success: true,
      ...results,
      message: `Processed ${results.processed} assets: ${results.succeeded} succeeded, ${results.failed} failed, ${results.skipped} skipped`
    }
    
  } catch (error) {
    console.error('❌ Thumbnail backfill error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Thumbnail backfill failed: ' + error.message
    })
  }
})

