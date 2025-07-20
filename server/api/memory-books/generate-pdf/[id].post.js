// PDF generation endpoint
// Generates PDF using pre-generated background

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import sharp from 'sharp'

export default defineEventHandler(async (event) => {
  try {
    console.log('📄 Starting PDF generation endpoint')
    const config = useRuntimeConfig()
    const { createClient } = await import('@supabase/supabase-js')
    
    // Use the service role key for server-side operations
    console.log('🔧 Creating Supabase client with service role')
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey || config.public.supabaseKey
    )
    
    // Get the book ID from the URL
    const bookId = getRouterParam(event, 'id')
    console.log('📖 Book ID from URL:', bookId)
    
    if (!bookId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Book ID is required'
      })
    }
    
    // Get user from auth token
    console.log('🔐 Getting user from auth token')
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }
    
    const token = authHeader.replace('Bearer ', '')
    console.log('🔑 Token extracted, getting user...')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('❌ Auth error:', authError)
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }
    console.log('✅ User authenticated:', user.id)
    
    // Verify the memory book exists and belongs to the user
    console.log('📚 Fetching memory book from database...')
    let { data: book, error: bookError } = await supabase
      .from('memory_books')
      .select('*')
      .eq('id', bookId)
      .eq('user_id', user.id)
      .single()
    
    if (bookError || !book) {
      console.error('❌ Book error:', bookError)
      throw createError({
        statusCode: 404,
        statusMessage: 'Memory book not found'
      })
    }
    console.log('✅ Memory book found:', book.id, 'Status:', book.status)
    
    // Check if this is a magic memory book
    if (book.layout_type === 'magic') {
      console.log('✨ Magic memory detected, generating a new magic story for regeneration')
      
      // Update status for magic story generation
      await updatePdfStatus(supabase, book.id, user.id, '✨ Crafting your magical story... ✨')
      
      // Fetch the photos from the user's selection pool (up to 12 photos they want to consider)
      // For existing books without photo_selection_pool, fall back to created_from_assets
      const photoPool = book.photo_selection_pool && book.photo_selection_pool.length > 0 
        ? book.photo_selection_pool 
        : book.created_from_assets || []
      
      console.log('📸 Fetching photos from user selection pool...')
      console.log('Photo pool to use:', photoPool)
      
      const { data: assets, error: assetsError } = await supabase
        .from('assets')
        .select('*')
        .in('id', photoPool)
        .eq('approved', true)
        .eq('deleted', false)

      if (assetsError || !assets || assets.length === 0) {
        console.error('❌ No photos found in selection pool:', photoPool)
        throw new Error('Failed to fetch photos from selection pool for magic memory regeneration')
      }

      console.log("****************************")
      console.log("Photos in user selection pool:")
      console.log("****************************")
      console.log("Number of assets:", assets.length)
      console.log("Photo selection pool:", photoPool)
      console.log("Original photo_selection_pool:", book.photo_selection_pool)
      console.log("Photos used in final memory:", book.created_from_assets)
      assets.forEach((asset, index) => {
        console.log(`Asset ${index + 1}:`, {
          id: asset.id,
          in_pool: photoPool.includes(asset.id) ? 'YES' : 'NO',
          in_final: book.created_from_assets?.includes(asset.id) ? 'YES' : 'NO',
          ai_caption: asset.ai_caption,
          people_detected: asset.people_detected,
          tags: asset.tags
        })
      })
      console.log("****************************")

      // Convert assets to photos format expected by magic-memory endpoint
      const photos = assets.map(asset => ({
        id: asset.id,
        width: asset.width,
        height: asset.height,
        orientation: asset.orientation,
        ai_caption: asset.ai_caption || '',
        people_detected: asset.people_detected || [],
        tags: asset.tags || [],
        user_tags: asset.user_tags || [],
        city: asset.city || null,
        state: asset.state || null,
        country: asset.country || null,
        zip_code: asset.zip_code || null,
        asset_date: asset.asset_date || null
      }))

      // Determine photo count based on the user's selection (1, 4, or 6 photos)
      // This follows the original pipeline: user selects pool, AI selects best ones from pool
      const photoCount = Math.min(assets.length, 4) // Default to 4, but could be 1 or 6 based on user preference

      // Always generate a new magic story for magic memory books
      const magicRes = await fetch(`${config.public.siteUrl}/api/ai/magic-memory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          photos: photos,
          title: book.title,
          memory_event: book.memory_event,
          theme: book.theme || 'classic',
          photo_count: photoCount,
          background_type: book.background_type || 'white'
        })
      })
      if (!magicRes.ok) {
        console.error('❌ Magic memory generation failed:', magicRes.status)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to generate magic memory'
        })
      }
      const magicData = await magicRes.json()
      // Update the book with the new magic story and selected photos
      const { error: updateError } = await supabase
        .from('memory_books')
        .update({ 
          magic_story: magicData.story,
          created_from_assets: magicData.selected_photo_ids
        })
        .eq('id', book.id)
      if (updateError) {
        console.error('❌ Failed to update book with magic story and selected photos:', updateError)
      } else {
        console.log('✨ Magic story and selected photos updated successfully')
        console.log('Selected photo IDs:', magicData.selected_photo_ids)
      }
      
      // Refresh the book object to get the updated magic_story
      const { data: updatedBook, error: refreshError } = await supabase
        .from('memory_books')
        .select('*')
        .eq('id', book.id)
        .single()
      
      if (refreshError) {
        console.error('❌ Failed to refresh book object:', refreshError)
      } else {
        console.log('✅ Book object refreshed with new magic story')
        book = updatedBook // Update the book object with the new data
      }
      
      // Continue with standard PDF generation but with magic layout
      console.log('✨ Proceeding with magic memory PDF creation')
    }

    // Check if the book has background ready
    if (book.status !== 'background_ready' && book.status !== 'ready' && book.status !== 'draft') {
      console.log('❌ Book not ready for PDF generation, status:', book.status)
      throw createError({
        statusCode: 400,
        statusMessage: 'Memory book background is not ready'
      })
    }

    // If pdf_url exists, return it directly (fast download)
    if (book.pdf_url && book.pdf_url.startsWith('https://')) {
      console.log('✅ PDF URL already exists, returning:', book.pdf_url)
      return {
        success: true,
        downloadUrl: book.pdf_url
      }
    }

    console.log('🔄 PDF URL not found, generating new PDF...')
    
    // Update status - use magic-specific messages for magic books
    const statusMessage = book.layout_type === 'magic' ? 'Gathering your magical memories...' : 'Retrieving your memories...'
    await updatePdfStatus(supabase, book.id, user.id, statusMessage)
    
    // 1. Fetch approved assets for this book
    console.log('📸 Fetching assets for book:', book.created_from_assets)
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('*')
      .in('id', book.created_from_assets || [])
      .eq('approved', true)
      .eq('deleted', false)

    if (assetsError) {
      console.error('❌ Error fetching assets:', assetsError)
      throw new Error(`Failed to fetch assets: ${assetsError.message}`)
    }

    console.log('✅ Found assets:', assets?.length || 0)

    if (!assets || assets.length === 0) {
      throw new Error('No approved assets found for this book')
    }

    // 2. Get the background image from storage
    console.log('🎨 Loading background image from storage...')

    // Update status - use magic-specific messages for magic books
    const bgStatusMessage = book.layout_type === 'magic' ? 'Retrieving magical background...' : 'Retrieving background image...'
    await updatePdfStatus(supabase, book.id, user.id, bgStatusMessage)
    let backgroundBuffer
    
    if (book.background_url) {
      // Download background from storage
      console.log('⬇️ Downloading background from storage:', book.background_url)
      const bgRes = await fetch(book.background_url)
      if (!bgRes.ok) {
        console.error('❌ Failed to fetch background:', bgRes.status, bgRes.statusText)
        throw new Error(`Failed to fetch background: ${bgRes.status}`)
      }
      backgroundBuffer = Buffer.from(await bgRes.arrayBuffer())
      console.log('✅ Background downloaded, size:', backgroundBuffer.length, 'bytes')
    } else if (book.background_type === 'magical') {
      // Generate background for magical background type
      console.log('🎨 Generating magical background...')
      await updatePdfStatus(supabase, book.id, user.id, 'Creating magical background...')
      
      try {
        const bgGenRes = await fetch(`${config.public.siteUrl}/api/memory-books/generate-background/${book.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!bgGenRes.ok) {
          console.error('❌ Background generation failed:', bgGenRes.status)
          throw new Error(`Background generation failed: ${bgGenRes.status}`)
        }
        
        const bgGenData = await bgGenRes.json()
        console.log('✅ Background generated successfully:', bgGenData.backgroundUrl)
        
        // Download the newly generated background
        console.log('⬇️ Downloading newly generated background...')
        const bgRes = await fetch(bgGenData.backgroundUrl)
        if (!bgRes.ok) {
          console.error('❌ Failed to fetch generated background:', bgRes.status, bgRes.statusText)
          throw new Error(`Failed to fetch generated background: ${bgRes.status}`)
        }
        backgroundBuffer = Buffer.from(await bgRes.arrayBuffer())
        console.log('✅ Generated background downloaded, size:', backgroundBuffer.length, 'bytes')
        
        // Update the book with the new background URL
        const { error: updateError } = await supabase
          .from('memory_books')
          .update({ background_url: bgGenData.backgroundUrl })
          .eq('id', book.id)
        
        if (updateError) {
          console.error('❌ Failed to update book with background URL:', updateError)
        } else {
          console.log('✅ Book updated with new background URL')
        }
      } catch (bgError) {
        console.error('❌ Background generation error:', bgError)
        console.warn('⚠️ Proceeding with white background due to generation failure')
        // Continue with white background if generation fails
      }
    } else {
      console.log('ℹ️ No background URL found and background_type is white, proceeding with white background.')
      // Continue without throwing; background will be white
    }
    
    // 3. Create PDF document
    console.log('📄 Creating PDF document...')
    const pdfDoc = await PDFDocument.create()
    let pdfBgImage = null
    if (backgroundBuffer) {
      pdfBgImage = await pdfDoc.embedPng(backgroundBuffer)
      console.log('✅ PDF document created with background image')
    } else {
      console.log('✅ PDF document created with blank background')
    }
    
    // Helper function to process image orientation
    async function processImageOrientation(imageBuffer, format) {
      try {
        console.log(`🔄 Processing image orientation for ${format} image...`)
        const processedImage = await sharp(imageBuffer)
          .rotate() // Auto-rotate based on EXIF orientation
          .toFormat(format === 'png' ? 'png' : 'jpeg')
          .toBuffer()
        console.log(`✅ Image orientation processed successfully`)
        return processedImage
      } catch (error) {
        console.warn(`⚠️ Failed to process image orientation, using original:`, error.message)
        return imageBuffer // Fallback to original if processing fails
      }
    }

    // Helper function to check if caption should be used (not blank, not filename)
    function isValidCaption(caption) {
      if (!caption || caption.trim() === '') return false
      const lowerCaption = caption.toLowerCase()
      return !lowerCaption.includes('.jpg') && !lowerCaption.includes('.png') && !lowerCaption.includes('.jpeg')
    }

    // Helper function to process image shape with AI analysis
    async function processImageShape(imageBuffer, shape, targetWidth, targetHeight, imageUrl) {
      try {
        console.log(`🔄 Processing image shape: ${shape}`)
        let processedImage
        
        // Get AI analysis for shape recommendation and intelligent cropping
        let aiAnalysis = null
        let recommendedShape = shape // Default to using the requested shape
        
        // If shape is 'magic', we'll use AI to determine the best shape
        if (shape === 'magic' && imageUrl) {
          try {
            console.log('🤖 Getting AI analysis for magic shape detection...')
            const analysisRes = await fetch(`${config.public.siteUrl}/api/ai/analyze-photo`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                imageUrl: imageUrl,
                targetShape: 'magic', // This will trigger the comprehensive shape analysis
                targetWidth: targetWidth,
                targetHeight: targetHeight
              })
            })
            
            if (analysisRes.ok) {
              const analysisData = await analysisRes.json()
              aiAnalysis = analysisData.analysis
              console.log('✅ AI analysis received:', aiAnalysis)
              
              // Use AI's recommended shape
              if (aiAnalysis && aiAnalysis.bestShape) {
                recommendedShape = aiAnalysis.bestShape
                console.log('🎯 AI recommends shape:', recommendedShape, 'for magic mode')
                
                // Update the shape to use AI's recommendation
                shape = recommendedShape
              }
              
              // Check fit quality for logging
              if (aiAnalysis && aiAnalysis.fitQuality) {
                console.log('📊 Fit quality for magic shape:', aiAnalysis.fitQuality)
              }
            } else {
              console.warn('⚠️ AI analysis failed, using original shape for magic mode')
              shape = 'original'
            }
          } catch (aiError) {
            console.warn('⚠️ AI analysis error, using original shape for magic mode:', aiError.message)
            shape = 'original'
          }
        } else if (imageUrl && (shape === 'round' || shape === 'oval')) {
          // For explicit round/oval shapes, use AI for center point detection
          try {
            console.log('🤖 Getting AI analysis for shape recommendation...')
            const analysisRes = await fetch(`${config.public.siteUrl}/api/ai/analyze-photo`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                imageUrl: imageUrl,
                targetShape: shape,
                targetWidth: targetWidth,
                targetHeight: targetHeight
              })
            })
            
            if (analysisRes.ok) {
              const analysisData = await analysisRes.json()
              aiAnalysis = analysisData.analysis
              console.log('✅ AI analysis received:', aiAnalysis)
              
              // Use AI's recommended shape if available
              if (aiAnalysis && aiAnalysis.bestShape) {
                recommendedShape = aiAnalysis.bestShape
                console.log('🎯 AI recommends shape:', recommendedShape, 'instead of requested:', shape)
                
                // Update the shape to use AI's recommendation
                shape = recommendedShape
              }
              
              // Check fit quality for logging
              if (aiAnalysis && aiAnalysis.fitQuality) {
                console.log('📊 Fit quality for recommended shape:', aiAnalysis.fitQuality)
              }
            } else {
              console.warn('⚠️ AI analysis failed, using requested shape')
            }
          } catch (aiError) {
            console.warn('⚠️ AI analysis error, using requested shape:', aiError.message)
          }
        }
        
        switch (shape) {
          case 'square':
            // Create square crop with AI-guided cropping
            if (aiAnalysis) {
              // Use AI analysis for intelligent cropping
              const { centerX, centerY, zoom } = aiAnalysis
              console.log('🎯 AI Analysis values for square:', { centerX, centerY, zoom })
              
              // Get actual image dimensions
              const imageInfo = await sharp(imageBuffer).metadata()
              const originalWidth = imageInfo.width || 1000
              const originalHeight = imageInfo.height || 1000
              console.log('📐 Original image dimensions:', { width: originalWidth, height: originalHeight })
              
              // Calculate crop area based on AI analysis with aggressive containment
              const cropWidth = originalWidth / zoom
              const cropHeight = originalHeight / zoom
              
              // Calculate center point with more aggressive bounds checking
              let cropX = (centerX * originalWidth) - (cropWidth / 2)
              let cropY = (centerY * originalHeight) - (cropHeight / 2)
              
              // Ensure crop area stays within image bounds
              cropX = Math.max(0, Math.min(originalWidth - cropWidth, cropX))
              cropY = Math.max(0, Math.min(originalHeight - cropHeight, cropY))
              
              // Additional safety check: if crop would go outside bounds, adjust zoom
              if (cropWidth > originalWidth || cropHeight > originalHeight) {
                console.log('⚠️ Crop area too large, adjusting zoom for safety')
                const safeZoom = Math.max(zoom, Math.max(originalWidth / targetWidth, originalHeight / targetHeight))
                const adjustedCropWidth = originalWidth / safeZoom
                const adjustedCropHeight = originalHeight / safeZoom
                cropX = Math.max(0, Math.min(originalWidth - adjustedCropWidth, (centerX * originalWidth) - (adjustedCropWidth / 2)))
                cropY = Math.max(0, Math.min(originalHeight - adjustedCropHeight, (centerY * originalHeight) - (adjustedCropHeight / 2)))
              }
              
              // Final safety check: ensure crop coordinates are valid
              if (cropX < 0 || cropY < 0 || cropX + cropWidth > originalWidth || cropY + cropHeight > originalHeight) {
                console.log('⚠️ Crop coordinates invalid, using fallback cropping')
                // Use fallback to default cropping
                processedImage = await sharp(imageBuffer)
                  .resize(targetWidth, targetHeight, { fit: 'cover' })
                  .png()
                  .toBuffer()
                console.log('✅ Fallback crop applied successfully')
                return processedImage
              }
              
              console.log('✂️ Calculated crop area for square:', {
                cropX: Math.round(cropX),
                cropY: Math.round(cropY),
                cropWidth: Math.round(cropWidth),
                cropHeight: Math.round(cropHeight),
                zoom: zoom
              })
              
              console.log('🔄 Applying AI-guided square crop with Sharp...')
              try {
                processedImage = await sharp(imageBuffer)
                  .extract({
                    left: Math.round(cropX),
                    top: Math.round(cropY),
                    width: Math.round(cropWidth),
                    height: Math.round(cropHeight)
                  })
                  .resize(targetWidth, targetHeight, { fit: 'cover' })
                  .png()
                  .toBuffer()
                console.log('✅ AI-guided square crop applied successfully')
              } catch (cropError) {
                console.warn('⚠️ AI-guided square crop failed, using fallback:', cropError.message)
                // Use fallback to default cropping
                processedImage = await sharp(imageBuffer)
                  .resize(targetWidth, targetHeight, { fit: 'cover' })
                  .png()
                  .toBuffer()
                console.log('✅ Fallback square crop applied successfully')
              }
            } else {
              // Fallback to default square cropping
              console.log('⚠️ Using default center cropping for square (no AI analysis)')
              processedImage = await sharp(imageBuffer)
                .resize(targetWidth, targetHeight, { fit: 'cover' })
                .png()
                .toBuffer()
            }
            break
            
          case 'round':
            // Create circular mask with AI-guided cropping
            const circleSvg = `<svg><circle cx="${targetWidth/2}" cy="${targetHeight/2}" r="${Math.min(targetWidth, targetHeight)/2}" fill="white"/></svg>`
            
            if (aiAnalysis) {
              // Use AI analysis for intelligent cropping
              const { centerX, centerY, zoom } = aiAnalysis
              console.log('🎯 AI Analysis values:', { centerX, centerY, zoom })
              
              // Get actual image dimensions
              const imageInfo = await sharp(imageBuffer).metadata()
              const originalWidth = imageInfo.width || 1000
              const originalHeight = imageInfo.height || 1000
              console.log('📐 Original image dimensions:', { width: originalWidth, height: originalHeight })
              
              // Calculate crop area based on AI analysis with aggressive containment
              const cropWidth = originalWidth / zoom
              const cropHeight = originalHeight / zoom
              
              // Calculate center point with more aggressive bounds checking
              let cropX = (centerX * originalWidth) - (cropWidth / 2)
              let cropY = (centerY * originalHeight) - (cropHeight / 2)
              
              // Ensure crop area stays within image bounds
              cropX = Math.max(0, Math.min(originalWidth - cropWidth, cropX))
              cropY = Math.max(0, Math.min(originalHeight - cropHeight, cropY))
              
              // Additional safety check: if crop would go outside bounds, adjust zoom
              if (cropWidth > originalWidth || cropHeight > originalHeight) {
                console.log('⚠️ Crop area too large, adjusting zoom for safety')
                const safeZoom = Math.max(zoom, Math.max(originalWidth / targetWidth, originalHeight / targetHeight))
                const adjustedCropWidth = originalWidth / safeZoom
                const adjustedCropHeight = originalHeight / safeZoom
                cropX = Math.max(0, Math.min(originalWidth - adjustedCropWidth, (centerX * originalWidth) - (adjustedCropWidth / 2)))
                cropY = Math.max(0, Math.min(originalHeight - adjustedCropHeight, (centerY * originalHeight) - (adjustedCropHeight / 2)))
              }
              
              // Final safety check: ensure crop coordinates are valid
              if (cropX < 0 || cropY < 0 || cropX + cropWidth > originalWidth || cropY + cropHeight > originalHeight) {
                console.log('⚠️ Crop coordinates invalid, using fallback cropping')
                // Use fallback to default cropping
                processedImage = await sharp(imageBuffer)
                  .resize(targetWidth, targetHeight, { fit: 'cover' })
                  .composite([{
                    input: Buffer.from(circleSvg),
                    blend: 'dest-in'
                  }])
                  .png()
                  .toBuffer()
                console.log('✅ Fallback crop applied successfully')
                return processedImage
              }
              
              console.log('✂️ Calculated crop area:', {
                cropX: Math.round(cropX),
                cropY: Math.round(cropY),
                cropWidth: Math.round(cropWidth),
                cropHeight: Math.round(cropHeight),
                zoom: zoom
              })
              
              console.log('🔄 Applying AI-guided crop with Sharp...')
              try {
                processedImage = await sharp(imageBuffer)
                  .extract({
                    left: Math.round(cropX),
                    top: Math.round(cropY),
                    width: Math.round(cropWidth),
                    height: Math.round(cropHeight)
                  })
                  .resize(targetWidth, targetHeight, { fit: 'cover' })
                  .composite([{
                    input: Buffer.from(circleSvg),
                    blend: 'dest-in'
                  }])
                  .png()
                  .toBuffer()
                console.log('✅ AI-guided crop applied successfully')
              } catch (cropError) {
                console.warn('⚠️ AI-guided crop failed, using fallback:', cropError.message)
                // Use fallback to default cropping
                processedImage = await sharp(imageBuffer)
                  .resize(targetWidth, targetHeight, { fit: 'cover' })
                  .composite([{
                    input: Buffer.from(circleSvg),
                    blend: 'dest-in'
                  }])
                  .png()
                  .toBuffer()
                console.log('✅ Fallback crop applied successfully')
              }
            } else {
              // Fallback to default cropping
              console.log('⚠️ Using default center cropping (no AI analysis)')
              processedImage = await sharp(imageBuffer)
                .resize(targetWidth, targetHeight, { fit: 'cover' })
                .composite([{
                  input: Buffer.from(circleSvg),
                  blend: 'dest-in'
                }])
                .png()
                .toBuffer()
            }
            break
            
          case 'oval':
            // Create elliptical mask with AI-guided cropping
            const ellipseSvg = `<svg><ellipse cx="${targetWidth/2}" cy="${targetHeight/2}" rx="${targetWidth/2}" ry="${targetHeight/2}" fill="white"/></svg>`
            
            if (aiAnalysis) {
              // Use AI analysis for intelligent cropping
              const { centerX, centerY, zoom } = aiAnalysis
              console.log('🎯 AI Analysis values:', { centerX, centerY, zoom })
              
              // Get actual image dimensions
              const imageInfo = await sharp(imageBuffer).metadata()
              const originalWidth = imageInfo.width || 1000
              const originalHeight = imageInfo.height || 1000
              console.log('📐 Original image dimensions:', { width: originalWidth, height: originalHeight })
              
              // Calculate crop area based on AI analysis with aggressive containment
              const cropWidth = originalWidth / zoom
              const cropHeight = originalHeight / zoom
              
              // Calculate center point with more aggressive bounds checking
              let cropX = (centerX * originalWidth) - (cropWidth / 2)
              let cropY = (centerY * originalHeight) - (cropHeight / 2)
              
              // Ensure crop area stays within image bounds
              cropX = Math.max(0, Math.min(originalWidth - cropWidth, cropX))
              cropY = Math.max(0, Math.min(originalHeight - cropHeight, cropY))
              
              // Additional safety check: if crop would go outside bounds, adjust zoom
              if (cropWidth > originalWidth || cropHeight > originalHeight) {
                console.log('⚠️ Crop area too large, adjusting zoom for safety')
                const safeZoom = Math.max(zoom, Math.max(originalWidth / targetWidth, originalHeight / targetHeight))
                const adjustedCropWidth = originalWidth / safeZoom
                const adjustedCropHeight = originalHeight / safeZoom
                cropX = Math.max(0, Math.min(originalWidth - adjustedCropWidth, (centerX * originalWidth) - (adjustedCropWidth / 2)))
                cropY = Math.max(0, Math.min(originalHeight - adjustedCropHeight, (centerY * originalHeight) - (adjustedCropHeight / 2)))
              }
              
              // Final safety check: ensure crop coordinates are valid
              if (cropX < 0 || cropY < 0 || cropX + cropWidth > originalWidth || cropY + cropHeight > originalHeight) {
                console.log('⚠️ Crop coordinates invalid, using fallback cropping')
                // Use fallback to default cropping
                processedImage = await sharp(imageBuffer)
                  .resize(targetWidth, targetHeight, { fit: 'cover' })
                  .composite([{
                    input: Buffer.from(ellipseSvg),
                    blend: 'dest-in'
                  }])
                  .png()
                  .toBuffer()
                console.log('✅ Fallback crop applied successfully')
                return processedImage
              }
              
              console.log('✂️ Calculated crop area:', {
                cropX: Math.round(cropX),
                cropY: Math.round(cropY),
                cropWidth: Math.round(cropWidth),
                cropHeight: Math.round(cropHeight),
                zoom: zoom
              })
              
              console.log('🔄 Applying AI-guided crop with Sharp...')
              try {
                processedImage = await sharp(imageBuffer)
                  .extract({
                    left: Math.round(cropX),
                    top: Math.round(cropY),
                    width: Math.round(cropWidth),
                    height: Math.round(cropHeight)
                  })
                  .resize(targetWidth, targetHeight, { fit: 'cover' })
                  .composite([{
                    input: Buffer.from(ellipseSvg),
                    blend: 'dest-in'
                  }])
                  .png()
                  .toBuffer()
                console.log('✅ AI-guided crop applied successfully')
              } catch (cropError) {
                console.warn('⚠️ AI-guided crop failed, using fallback:', cropError.message)
                // Use fallback to default cropping
                processedImage = await sharp(imageBuffer)
                  .resize(targetWidth, targetHeight, { fit: 'cover' })
                  .composite([{
                    input: Buffer.from(ellipseSvg),
                    blend: 'dest-in'
                  }])
                  .png()
                  .toBuffer()
                console.log('✅ Fallback crop applied successfully')
              }
            } else {
              // Fallback to default cropping
              console.log('⚠️ Using default center cropping (no AI analysis)')
              processedImage = await sharp(imageBuffer)
                .resize(targetWidth, targetHeight, { fit: 'cover' })
                .composite([{
                  input: Buffer.from(ellipseSvg),
                  blend: 'dest-in'
                }])
                .png()
                .toBuffer()
            }
            break
            
          case 'original':
          default:
            // Keep original aspect ratio
            processedImage = await sharp(imageBuffer)
              .resize(targetWidth, targetHeight, { fit: 'inside' })
              .png()
              .toBuffer()
            break
        }
        
        console.log(`✅ Image shape processed successfully: ${shape}`)
        return processedImage
      } catch (error) {
        console.warn(`⚠️ Failed to process image shape, using original:`, error.message)
        return imageBuffer // Fallback to original if processing fails
      }
    }
    
    await updatePdfStatus(supabase, book.id, user.id, 'Background ready, creating pages...')
    
    // Check for Magic Memory layout
    const isMagicMemory = book.layout_type === 'magic'
    if (isMagicMemory) {
      // Magic Memory: 7x5 inch (504x360 points)
      const pageWidth = 504
      const pageHeight = 360
      const margin = 18 // 1/4 inch margin everywhere
      const page = pdfDoc.addPage([pageWidth, pageHeight])
      
      console.log(`📐 Magic Memory page dimensions: ${pageWidth}x${pageHeight} points (${(pageWidth/72).toFixed(2)}x${(pageHeight/72).toFixed(2)} inches)`)
      
      // Add border at 1/8" inside the page edge (1/8" = 9 points)
      const borderMargin = 9
      page.drawRectangle({
        x: borderMargin,
        y: borderMargin,
        width: pageWidth - 2 * borderMargin,
        height: pageHeight - 2 * borderMargin,
        borderColor: rgb(0, 0, 0),
        borderWidth: 3, // Increased from 1 to 3 points for better visibility
        color: rgb(1, 1, 1) // white fill
      })
      console.log(`🖼️ Magic Memory border drawn: ${borderMargin} points from edge, width: ${pageWidth - 2 * borderMargin}x${pageHeight - 2 * borderMargin}`)
      
      // Use the same background handling as standard books, but respect background type
      if (pdfBgImage && book.background_type !== 'white') {
        // Draw background image to fill the page with opacity from database
        // Safety feature: if opacity is 0, use 30% instead
        const backgroundOpacity = book.background_opacity || 30
        const opacity = (backgroundOpacity === 0 ? 30 : backgroundOpacity) / 100 // Convert percentage to decimal
        page.drawImage(pdfBgImage, {
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
          opacity: opacity
        })
        console.log(`✅ Magic memory background image applied with ${backgroundOpacity}% opacity`)
      } else {
        // Use white background (either no background image or white background type)
        page.drawRectangle({
          x: 0, y: 0, width: pageWidth, height: pageHeight,
          color: rgb(1, 1, 1), // white
          opacity: 1
        })
        console.log('✅ Magic memory using white background')
      }
      // Draw photos based on count - single photo gets special treatment
      const assetIds = book.created_from_assets || []
      const photoAssets = assets.filter(a => assetIds.includes(a.id))
      
      // Determine layout based on photo count
      let photoLayout
      if (photoAssets.length === 1) {
        // Single photo: fill 50% of the card area (left half)
        photoLayout = {
          type: 'single',
          photoArea: {
            x: margin,
            y: margin,
            width: pageWidth / 2 - margin, // 50% of card width minus margin
            height: pageHeight - 2 * margin // Full height minus margins
          }
        }
      } else {
        // Multiple photos: determine grid layout based on photo count
        let gridCols, gridRows
        if (photoAssets.length === 2) {
          gridCols = 2
          gridRows = 1
        } else if (photoAssets.length === 4) {
          gridCols = 2
          gridRows = 2
        } else if (photoAssets.length === 6) {
          gridCols = 3
          gridRows = 2
        } else {
          // Fallback for other counts
          gridCols = 2
          gridRows = 2
        }
        
        photoLayout = {
          type: 'grid',
          gridCols: gridCols,
          gridRows: gridRows,
          photoGridLeft: margin,
          photoGridTop: margin,
          photoGridWidth: pageWidth / 2 - margin,
          photoGridHeight: pageHeight - 2 * margin,
          photoCellWidth: (pageWidth / 2 - margin - margin) / gridCols, // Account for margin between cells
          photoCellHeight: (pageHeight - 2 * margin - margin) / gridRows // Account for margin between cells
        }
        
        // Calculate positions for grid layout
        photoLayout.positions = []
        for (let row = 0; row < photoLayout.gridRows; row++) {
          for (let col = 0; col < photoLayout.gridCols; col++) {
            if (photoLayout.positions.length < photoAssets.length) {
              photoLayout.positions.push({
                x: photoLayout.photoGridLeft + col * (photoLayout.photoCellWidth + (photoLayout.gridCols > 1 ? margin / (photoLayout.gridCols - 1) : 0)),
                y: pageHeight - margin - (row + 1) * photoLayout.photoCellHeight - row * (photoLayout.gridRows > 1 ? margin / (photoLayout.gridRows - 1) : 0)
              })
            }
          }
        }
      }
      // Draw photos based on layout type
      for (let i = 0; i < photoAssets.length; i++) {
        const asset = photoAssets[i]
        try {
          const imageRes = await fetch(asset.storage_url)
          if (!imageRes.ok) throw new Error('Failed to fetch image')
          const imageBuffer = Buffer.from(await imageRes.arrayBuffer())
          
          // Get image dimensions and calculate aspect ratio
          const imageInfo = await sharp(imageBuffer).metadata()
          const aspectRatio = imageInfo.width / imageInfo.height
          
          let finalWidth, finalHeight, imgX, imgY
          
          if (photoLayout.type === 'single') {
            // Single photo: fill the entire photo area (50% of card)
            const photoArea = photoLayout.photoArea
            
            // For single photos, prioritize portrait orientation to fill the area better
            if (aspectRatio < 1) {
              // Portrait photo - can fill more of the area
              finalHeight = photoArea.height
              finalWidth = photoArea.height * aspectRatio
              if (finalWidth > photoArea.width) {
                finalWidth = photoArea.width
                finalHeight = photoArea.width / aspectRatio
              }
            } else {
              // Landscape photo - fit to width and crop height if needed
              finalWidth = photoArea.width
              finalHeight = photoArea.width / aspectRatio
              if (finalHeight > photoArea.height) {
                finalHeight = photoArea.height
                finalWidth = photoArea.height * aspectRatio
              }
            }
            
            // Center image in photo area
            imgX = photoArea.x + (photoArea.width - finalWidth) / 2
            imgY = photoArea.y + (photoArea.height - finalHeight) / 2
            
            console.log(`📸 Single photo layout: ${finalWidth}x${finalHeight} in ${photoArea.width}x${photoArea.height} area`)
          } else {
            // Grid layout: fit image inside cell, preserving aspect ratio
            const photoCellWidth = photoLayout.photoCellWidth
            const photoCellHeight = photoLayout.photoCellHeight
            
            if (aspectRatio > 1) {
              finalWidth = photoCellWidth
              finalHeight = photoCellWidth / aspectRatio
              if (finalHeight > photoCellHeight) {
                finalHeight = photoCellHeight
                finalWidth = photoCellHeight * aspectRatio
              }
            } else {
              finalHeight = photoCellHeight
              finalWidth = photoCellHeight * aspectRatio
              if (finalWidth > photoCellWidth) {
                finalWidth = photoCellWidth
                finalHeight = photoCellWidth / aspectRatio
              }
            }
            
            // Center image in cell
            imgX = photoLayout.positions[i].x + (photoCellWidth - finalWidth) / 2
            imgY = photoLayout.positions[i].y + (photoCellHeight - finalHeight) / 2
          }
          
          // Process image at higher resolution for quality
          const targetWidth = Math.round(finalWidth * 2)
          const targetHeight = Math.round(finalHeight * 2)
          const processedImage = await processImageShape(imageBuffer, 'original', targetWidth, targetHeight, asset.storage_url)
          const pdfImage = await pdfDoc.embedPng(processedImage)
          page.drawImage(pdfImage, {
            x: imgX,
            y: imgY,
            width: finalWidth,
            height: finalHeight
          })
          console.log(`✅ Photo ${i + 1} processed: ${finalWidth}x${finalHeight} (${photoLayout.type} layout)`)
        } catch (err) {
          console.warn(`⚠️ Failed to process photo ${i + 1}:`, err.message)
          // Draw placeholder if image fails
          if (photoLayout.type === 'single') {
            const photoArea = photoLayout.photoArea
            page.drawRectangle({
              x: photoArea.x, y: photoArea.y, width: photoArea.width, height: photoArea.height, color: rgb(0.9, 0.9, 1)
            })
          } else {
            page.drawRectangle({
              x: photoLayout.positions[i].x, y: photoLayout.positions[i].y, 
              width: photoLayout.photoCellWidth, height: photoLayout.photoCellHeight, color: rgb(0.9, 0.9, 1)
            })
          }
        }
      }
      // --- Story area: right half ---
      const storyAreaLeft = pageWidth / 2 + margin
      const storyAreaRight = pageWidth - margin
      const storyAreaTop = margin
      const storyAreaBottom = pageHeight - margin
      
      // Add 1/2" margin (36 points) around the story text within the story area
      const storyMargin = 36 // 1/2 inch in points
      const storyTextLeft = storyAreaLeft + storyMargin
      const storyTextRight = storyAreaRight - storyMargin
      const storyTextTop = storyAreaTop + storyMargin
      const storyTextBottom = storyAreaBottom - storyMargin
      const storyAreaWidth = storyTextRight - storyTextLeft
      const storyAreaHeight = storyTextBottom - storyTextTop
      // Draw the story in the calculated area
              const story = book.magic_story || 'A special family story.'
      
      console.log("****************************")
      console.log("Story being used in PDF:")
      console.log("****************************")
      console.log("book.magic_story:", book.magic_story)
      console.log("Final story:", story)
      console.log("****************************")
      
      // Embed Times Bold Italic font for semi-bold appearance
      const timesBoldItalicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic)
      let fontSize = 18 // Slightly smaller to make bold appear more like semi-bold
      // Function to wrap text to fit the story area width
      function wrapText(text, font, fontSize, maxWidth) {
        const words = text.split(' ')
      const lines = []
      let line = ''
      for (const word of words) {
          const testLine = line ? line + ' ' + word : word
          const testLineWidth = font.widthOfTextAtSize(testLine, fontSize)
          if (testLineWidth <= maxWidth) {
            line = testLine
        } else {
          if (line) lines.push(line)
          line = word
        }
      }
      if (line) lines.push(line)
        return lines
      }
      // Try to fit the text with the largest font size possible
      let lines = wrapText(story, timesBoldItalicFont, fontSize, storyAreaWidth)
      let lineHeight = fontSize * 2.0
      let totalTextHeight = lines.length * lineHeight
      let adjustedFontSize = fontSize
      while (totalTextHeight > storyAreaHeight && adjustedFontSize > 10) {
        adjustedFontSize -= 1
        lines = wrapText(story, timesBoldItalicFont, adjustedFontSize, storyAreaWidth)
        lineHeight = adjustedFontSize * 2.0
        totalTextHeight = lines.length * lineHeight
      }
      // Draw the story text, left-aligned, vertically centered
      let textY = storyTextTop + (storyAreaHeight - totalTextHeight) / 2
      for (let i = 0; i < lines.length; i++) {
        page.drawText(lines[i], {
          x: storyTextLeft,
          y: textY + (lines.length - i - 1) * lineHeight,
          size: adjustedFontSize,
          color: rgb(0.2, 0.2, 0.2),
          font: timesBoldItalicFont
        })
      }
      // End magic memory layout
      await updatePdfStatus(supabase, book.id, user.id, '✨ Magic Memory PDF created! ✨')
      const pdfBytes = await pdfDoc.save()
      // Upload PDF to storage and return download URL (copy from normal logic)
      const pdfFileName = `${user.id}/memory_book/pdfs/${book.id}_${Date.now()}.pdf`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('assets')
        .upload(pdfFileName, pdfBytes, {
          contentType: 'application/pdf',
          upsert: true
        })
      if (uploadError) {
        throw createError({ statusCode: 500, statusMessage: 'Failed to upload PDF: ' + uploadError.message })
      }
      // Get public URL for PDF
      const { data: pdfUrlData } = supabase.storage
        .from('assets')
        .getPublicUrl(pdfFileName)
      const pdfStorageUrl = pdfUrlData?.publicUrl
      if (!pdfStorageUrl) {
        throw createError({ statusCode: 500, statusMessage: 'Failed to get public URL for PDF' })
      }
      // Update book with PDF URL and status
      await supabase.from('memory_books').update({
        pdf_url: pdfStorageUrl,
        status: 'ready',
        generated_at: new Date().toISOString()
      }).eq('id', book.id)
      await updatePdfStatus(supabase, book.id, user.id, '✨ Your Magic Memory is ready! ✨')
      return { success: true, downloadUrl: pdfStorageUrl }
    }
    
    // 4. Layout assets into pages (using grid_layout from book settings)
    const gridLayout = book.grid_layout || '2x2'
    
    // Calculate assets per page from grid layout
    let assetsPerPage
    switch (gridLayout) {
      case '1x1':
        assetsPerPage = 1
        break
      case '2x1':
        assetsPerPage = 2
        break
      case '2x2':
        assetsPerPage = 4
        break
      case '3x2':
        assetsPerPage = 6
        break
      case '3x3':
        assetsPerPage = 9
        break
      case '3x4':
        assetsPerPage = 12
        break
      case '4x4':
        assetsPerPage = 16
        break
      default:
        assetsPerPage = 4
    }
    
    // Get print size from request body or use defaults from book
    const body = await readBody(event).catch(() => ({}))
    const printSize = body.printSize || book.print_size || '8x10'
    
    console.log('📄 PDF generation parameters:', { printSize })
    
    // Calculate page dimensions based on print size
    let pageWidth, pageHeight
    switch (printSize) {
      case '7x5':
        pageWidth = 504 // 7x5 inches in points (7 * 72)
        pageHeight = 360 // 5 inches in points (5 * 72)
        break
      case '8x10':
        pageWidth = 595 // A4 width in points
        pageHeight = 842 // A4 height in points
        break
      case '11x14':
        pageWidth = 792 // 11x14 inches in points (11 * 72)
        pageHeight = 1008 // 14 inches in points (14 * 72)
        break
      case '12x12':
        pageWidth = 864 // 12x12 inches in points (12 * 72)
        pageHeight = 864 // 12 inches in points (12 * 72)
        break
      case 'a4':
        pageWidth = 595 // A4 width in points
        pageHeight = 842 // A4 height in points
        break
      default:
        pageWidth = 595 // Default to A4
        pageHeight = 842
    }
    
    // Calculate exactly how many pages we need for the assets, with a hard limit of 10 pages
    const calculatedPages = Math.ceil(assets.length / assetsPerPage)
    const totalPages = Math.min(calculatedPages, 10)
    const totalPhotos = assets.length
    
    console.log(`📄 Generating PDF with ${totalPages} pages for ${assets.length} assets (${assetsPerPage} assets per page, max 10 pages)`)
    
    if (calculatedPages > 10) {
      console.log(`⚠️ Warning: ${assets.length} assets would require ${calculatedPages} pages, but limiting to 10 pages`)
    }
    
    let processedPhotos = 0
    
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const pageNumStr = (pageIndex + 1) + (pageIndex === 0 ? 'st' : pageIndex === 1 ? 'nd' : pageIndex === 2 ? 'rd' : 'th')
      await updatePdfStatus(supabase, book.id, user.id, `Creating ${pageNumStr} page (${pageIndex + 1}/${totalPages})`)
      console.log(`📄 Creating page ${pageIndex + 1}/${totalPages}`)
      const startIndex = pageIndex * assetsPerPage
      const pageAssets = assets.slice(startIndex, startIndex + assetsPerPage)
      
      // Add page to PDF with calculated dimensions
      const page = pdfDoc.addPage([pageWidth, pageHeight])
      const { width, height } = page.getSize()
      
      console.log(`📐 Page ${pageIndex + 1} dimensions: ${width}x${height} points (${(width/72).toFixed(2)}x${(height/72).toFixed(2)} inches)`)
      
      // Add border at 1/8" inside the page edge (1/8" = 9 points)
      const borderMargin = 9
      page.drawRectangle({
        x: borderMargin,
        y: borderMargin,
        width: width - 2 * borderMargin,
        height: height - 2 * borderMargin,
        borderColor: rgb(0, 0, 0),
        borderWidth: 3, // Increased from 1 to 3 points for better visibility
        color: rgb(1, 1, 1) // white fill
      })
      console.log(`🖼️ Border drawn: ${borderMargin} points from edge, width: ${width - 2 * borderMargin}x${height - 2 * borderMargin}`)
      
      // Margins
      const topMargin = 60 // for heading
      const bottomMargin = 50 // for page number
      const gridYOffset = (pageIndex === 0) ? topMargin : 0
      const availableHeight = height - gridYOffset - bottomMargin
      
      // Draw background image, scaled to fill page, with opacity from database (only if present and not white background)
      if (pdfBgImage && book.background_type !== 'white') {
        const bgScale = Math.max(width / pdfBgImage.width, height / pdfBgImage.height)
        const bgW = pdfBgImage.width * bgScale
        const bgH = pdfBgImage.height * bgScale
        const bgX = (width - bgW) / 2
        const bgY = (height - bgH) / 2
        // Safety feature: if opacity is 0, use 30% instead
        const backgroundOpacity = book.background_opacity || 30
        const opacity = (backgroundOpacity === 0 ? 30 : backgroundOpacity) / 100 // Convert percentage to decimal
        page.drawImage(pdfBgImage, {
          x: bgX,
          y: bgY,
          width: bgW,
          height: bgH,
          opacity: opacity
        })
      }
      
      // Draw title on first page, with extra space below
      if (pageIndex === 0) {
        const headingY = height - 60
        const title = (book.title || 'Memory Book').trim() // Use user's title or fallback, trim whitespace
        const titleWidth = title.length * 12 // Approximate width based on character count for font size 24
        const titleX = (width - titleWidth) / 2 // Center the title
        
        page.drawText(title, {
          x: titleX,
          y: headingY,
          size: 24,
          color: rgb(0.2, 0.2, 0.2)
        })
      }
      
      // Calculate grid layout from grid layout string
      const [gridCols, gridRows] = gridLayout.split('x').map(Number)
      
      const cellWidth = width / gridCols
      const cellHeight = availableHeight / gridRows
      
      for (let i = 0; i < pageAssets.length; i++) {
        const asset = pageAssets[i]
        processedPhotos++
        const progressPercent = Math.round((processedPhotos / totalPhotos) * 100)
        await updatePdfStatus(supabase, book.id, user.id, `Processing photo ${processedPhotos}/${totalPhotos} (${progressPercent}%)`)
        console.log(`🖼️ Processing asset ${i + 1}/${pageAssets.length}:`, asset.id, 'Type:', asset.type)
        const col = i % gridCols
        const row = Math.floor(i / gridCols)
        
        const x = col * cellWidth + cellWidth * 0.1
        // Y is measured from the top, so subtract row*cellHeight from top
        const y = height - gridYOffset - (row + 1) * cellHeight + cellHeight * 0.1
        const drawWidth = cellWidth * 0.8
        const drawHeight = cellHeight * 0.8
        
        if (asset.type === 'photo' && asset.storage_url) {
          try {
            console.log(`📸 Downloading image from storage URL:`, asset.storage_url)
            // Download the image from storage_url
            const imageRes = await fetch(asset.storage_url)
            if (!imageRes.ok) {
              console.error('❌ Failed to fetch image:', imageRes.status, imageRes.statusText)
              throw new Error(`Failed to fetch image: ${imageRes.status}`)
            }
            const imageBuffer = Buffer.from(await imageRes.arrayBuffer())
            console.log(`✅ Image downloaded, size:`, imageBuffer.length, 'bytes')
            
            // Process image orientation and shape
            const isPng = asset.storage_url.endsWith('.png')
            const processedImageBuffer = await processImageOrientation(imageBuffer, isPng ? 'png' : 'jpeg')
            console.log(`🔄 After orientation processing, size:`, processedImageBuffer.length, 'bytes')
            
            // Get memory shape from book settings
            const memoryShape = book.memory_shape || 'original'
            
            // Process image shape if needed
            let finalImageBuffer = processedImageBuffer
            if (memoryShape !== 'original') {
              // Calculate target dimensions for shape processing
              const targetWidth = Math.round(drawWidth * 2) // Higher resolution for better quality
              const targetHeight = Math.round(drawHeight * 2)
              console.log(`🔄 Processing shape: ${memoryShape} with dimensions: ${targetWidth}x${targetHeight}`)
              finalImageBuffer = await processImageShape(processedImageBuffer, memoryShape, targetWidth, targetHeight, asset.storage_url)
              console.log(`✅ Shape processing complete. Final buffer size: ${finalImageBuffer.length} bytes`)
            } else {
              console.log(`ℹ️ Using original aspect ratio (no shape processing)`)
            }
            
            let pdfImage
            if (memoryShape !== 'original' || isPng) {
              console.log(`📄 Embedding PNG image (processed shape or PNG format)`)
              pdfImage = await pdfDoc.embedPng(finalImageBuffer)
            } else {
              console.log(`📄 Embedding JPG image (original format)`)
              pdfImage = await pdfDoc.embedJpg(finalImageBuffer)
            }
            console.log(`✅ Image embedded in PDF with correct orientation`)
            
            // Get image dimensions
            const imgDims = pdfImage.scale(1)
            // Calculate scale to fit image inside cell (no cropping, no rotation)
            const scale = Math.min(drawWidth / imgDims.width, drawHeight / imgDims.height)
            const imgDisplayWidth = imgDims.width * scale
            const imgDisplayHeight = imgDims.height * scale
            // Center image in cell
            const imgX = x + (drawWidth - imgDisplayWidth) / 2
            const imgY = y + (drawHeight - imgDisplayHeight) / 2
            // Draw white border (4px)
            page.drawRectangle({
              x: imgX - 2,
              y: imgY - 2,
              width: imgDisplayWidth + 4,
              height: imgDisplayHeight + 4,
              color: rgb(1, 1, 1)
            })
            // Draw the image
            page.drawImage(pdfImage, {
              x: imgX,
              y: imgY,
              width: imgDisplayWidth,
              height: imgDisplayHeight
            })
            // Draw caption if available
            // Use user_caption if it's valid (not blank, not filename), otherwise use ai_caption
            let captionText = ''
            if (isValidCaption(asset.user_caption) && asset.user_caption !== asset.title) {
              captionText = asset.user_caption
            } else if (asset.ai_caption) {
              captionText = asset.ai_caption
            }
            
            if (captionText) {
              // Create caption image using sharp and SVG
              const maxCaptionHeight = Math.min(imgDisplayHeight * 0.4, 80); // Cap at 80px or 40% of photo height
              const captionWidth = Math.round(imgDisplayWidth * 0.9); // Use 90% of photo width
              console.log('Caption parameters:', { 
                captionText: captionText.substring(0, 50) + '...', 
                imgDisplayWidth, 
                imgDisplayHeight, 
                maxCaptionHeight,
                captionWidth
              });
              const captionImage = await createCaptionImage(captionText, captionWidth, maxCaptionHeight);
              
              if (captionImage) {
                // Embed the caption image into the PDF
                const pdfCaptionImage = await pdfDoc.embedPng(captionImage.buffer);
                
                // Position caption within the actual photo area, not the cell area
                // For shaped photos, this ensures the caption appears within the visible photo area
                const captionX = imgX + (imgDisplayWidth - captionImage.width) / 2;
                const captionY = imgY + 5; // 5px margin from bottom of actual photo
                
                page.drawImage(pdfCaptionImage, {
                  x: captionX,
                  y: captionY,
                  width: captionImage.width,
                  height: captionImage.height
                });
              }
            }
          } catch (err) {
            console.error('❌ Failed to embed image for asset', asset.id, err)
            // Fallback: draw placeholder rectangle
            page.drawRectangle({
              x,
              y,
              width: drawWidth,
              height: drawHeight,
              color: rgb(0.9, 0.9, 0.9),
              borderColor: rgb(0.7, 0.7, 0.7),
              borderWidth: 1
            })
            page.drawText(`Photo: ${asset.id.slice(-6)}`, {
              x: x + 10,
              y: y + drawHeight / 2,
              size: 12,
              color: rgb(0.3, 0.3, 0.3)
            })
            // Draw caption if available (same logic as above)
            let captionText = ''
            if (isValidCaption(asset.user_caption) && asset.user_caption !== asset.title) {
              captionText = asset.user_caption
            } else if (asset.ai_caption) {
              captionText = asset.ai_caption
            }
            
            if (captionText) {
              // Create caption image using sharp and SVG
              const maxCaptionHeight = Math.min(imgDisplayHeight * 0.4, 80); // Cap at 80px or 40% of photo height
              const captionWidth = Math.round(imgDisplayWidth * 0.9); // Use 90% of photo width
              console.log('Caption parameters (fallback):', { 
                captionText: captionText.substring(0, 50) + '...', 
                imgDisplayWidth, 
                imgDisplayHeight, 
                maxCaptionHeight,
                captionWidth
              });
              const captionImage = await createCaptionImage(captionText, captionWidth, maxCaptionHeight);
              
              if (captionImage) {
                // Embed the caption image into the PDF
                const pdfCaptionImage = await pdfDoc.embedPng(captionImage.buffer);
                
                // Position caption within the actual photo area, not the cell area
                // For shaped photos, this ensures the caption appears within the visible photo area
                const captionX = imgX + (imgDisplayWidth - captionImage.width) / 2;
                const captionY = imgY + 5; // 5px margin from bottom of actual photo
                
                page.drawImage(pdfCaptionImage, {
                  x: captionX,
                  y: captionY,
                  width: captionImage.width,
                  height: captionImage.height
                });
              }
            }
          }
        } else if (asset.type === 'text') {
          console.log(`📝 Processing text asset:`, asset.id)
          // For text assets, draw the text content
          page.drawText((isValidCaption(asset.user_caption) ? asset.user_caption : null) || asset.ai_caption || 'Text content', {
            x: x + 10,
            y: y + drawHeight / 2,
            size: 12,
            color: rgb(0.2, 0.2, 0.2),
            maxWidth: drawWidth - 20
          })
        }
      }
      // Draw footer text on left side
      const currentDate = new Date()
      const dateString = currentDate.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      })
      page.drawText(`Crafted with magic and love on ${dateString}`, {
        x: 20,
        y: bottomMargin / 2,
        size: 10,
        color: rgb(0.5, 0.5, 0.5)
      })
      
      // Draw page number in reserved bottom margin (only if multiple pages)
      if (totalPages > 1) {
        page.drawText(`Page ${pageIndex + 1}`, {
          x: width - 80,
          y: bottomMargin / 2,
          size: 10,
          color: rgb(0.5, 0.5, 0.5)
        })
      }
    }
    
    await updatePdfStatus(supabase, book.id, user.id, 'Finalizing PDF document...')
    
    // 5. Save PDF and upload to Supabase Storage
    console.log('💾 Saving PDF to buffer...')
    const pdfBytes = await pdfDoc.save()
    console.log('✅ PDF saved, size:', pdfBytes.length, 'bytes')
    
    const timestamp = Date.now()
    const fileName = `${user.id}/memory_book/pdfs/${book.id}_${timestamp}.pdf`
    
    // Delete old PDF files if they exist (try both old and new patterns)
    console.log('🗑️ Deleting old PDF files...')
    try {
      // List files in the PDF directory to find old files
      const { data: files, error: listError } = await supabase.storage
        .from('assets')
        .list(`${user.id}/memory_book/pdfs/`)
      
      if (!listError && files) {
        const filesToDelete = files
          .filter(file => file.name.startsWith(`${book.id}`))
          .map(file => `${user.id}/memory_book/pdfs/${file.name}`)
        
        if (filesToDelete.length > 0) {
          const { error: deleteError } = await supabase.storage
            .from('assets')
            .remove(filesToDelete)
          
          if (deleteError) {
            console.warn('⚠️ Failed to delete old PDF files:', deleteError.message)
          } else {
            console.log('✅ Old PDF files deleted successfully:', filesToDelete.length, 'files')
          }
        } else {
          console.log('ℹ️ No old PDF files found to delete')
        }
      }
    } catch (error) {
      console.warn('⚠️ Error deleting old PDF files:', error.message)
    }
    
    await updatePdfStatus(supabase, book.id, user.id, 'Uploading PDF to cloud storage...')
    console.log('📤 Uploading PDF to Supabase Storage:', fileName)
    
    // Upload to Supabase Storage (using assets bucket with memory_book subdirectory)
    const { data: uploadData, error: uploadError } = await supabase.storage.from('assets').upload(fileName, pdfBytes, {
      contentType: 'application/pdf',
      upsert: true
    })
    
    if (uploadError) {
      console.error('❌ Failed to upload PDF to storage:', uploadError)
      throw new Error('Failed to upload PDF to storage: ' + uploadError.message)
    }
    console.log('✅ PDF uploaded to storage successfully:', uploadData)
    
    // Get public URL
    await updatePdfStatus(supabase, book.id, user.id, 'Generating download link...')
    console.log('🔗 Getting public URL for uploaded PDF...')
    const { data: publicUrlData } = supabase.storage.from('assets').getPublicUrl(fileName)
    const publicUrl = publicUrlData?.publicUrl
    if (!publicUrl) {
      console.error('❌ Failed to get public URL for PDF')
      throw new Error('Failed to get public URL for PDF')
    }
    console.log('✅ Public URL generated:', publicUrl)
    
    // Update the book with the public URL
    await updatePdfStatus(supabase, book.id, user.id, 'Saving PDF link to database...')
    console.log('📝 Updating memory book with PDF URL...')
    const { data: updateData, error: updateError } = await supabase
      .from('memory_books')
      .update({ 
        pdf_url: publicUrl
      })
      .eq('id', book.id)
      .select()
    
    if (updateError) {
      console.error('❌ Error updating book with PDF URL:', updateError)
      // Don't throw here, as the PDF was successfully uploaded
    } else {
      console.log('✅ Memory book updated with PDF URL successfully')
    }
    
    await updatePdfStatus(supabase, book.id, user.id, 'Working our magic ...')
    console.log('🎉 PDF generated and uploaded successfully')
    
    // Set a final status that the frontend can wait for
    await updatePdfStatus(supabase, book.id, user.id, 'PDF generation completed successfully')
    
    // Immediately clean up and update book status (no delays)
    console.log('🧹 Cleaning up PDF status...')
    await supabase.from('pdf_status').delete().eq('book_id', book.id).eq('user_id', user.id)
    
    // Now update the book status to ready immediately
    console.log('📝 Final update: setting memory book status to ready')
    const { data: finalUpdateData, error: finalUpdateError } = await supabase
      .from('memory_books')
      .update({ status: 'ready' })
      .eq('id', book.id)
      .select()
    
    if (finalUpdateError) {
      console.error('❌ Error updating book status to ready:', finalUpdateError)
    } else {
      console.log('✅ Book status updated to ready successfully:', finalUpdateData)
    }
    
    // Verify the update worked
    const { data: verifyData, error: verifyError } = await supabase
      .from('memory_books')
      .select('status')
      .eq('id', book.id)
      .single()
    
    if (verifyError) {
      console.error('❌ Error verifying book status update:', verifyError)
    } else {
      console.log('✅ Verified book status is now:', verifyData.status)
    }
    
    // Small delay to ensure database transaction is committed
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      success: true,
      downloadUrl: publicUrl,
      message: 'PDF generated successfully'
    }
    
  } catch (error) {
    console.error('❌ PDF generation error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to generate PDF'
    })
  }
})

async function updatePdfStatus(supabase, bookId, userId, status) {
  try {
    console.log('📊 Updating PDF status:', status, 'for book:', bookId)
    const { data, error } = await supabase.from('pdf_status').upsert({
      book_id: bookId,
      user_id: userId,
      status,
      updated_at: new Date().toISOString()
    }, { onConflict: ['book_id', 'user_id'] })
    
    if (error) {
      console.error('❌ PDF status update error:', error)
    } else {
      console.log('✅ PDF status updated successfully')
    }
  } catch (error) {
    console.log('⚠️ PDF status table might not exist yet, continuing without status updates:', error.message)
  }
} 

// Helper function to create caption images using sharp and SVG
async function createCaptionImage(captionText, maxWidth, maxHeight) {
  try {
    // Validate input parameters
    if (!captionText || typeof captionText !== 'string') {
      console.warn('Invalid caption text provided:', captionText);
      return null;
    }
    
    if (!maxWidth || !maxHeight || isNaN(maxWidth) || isNaN(maxHeight) || maxWidth <= 0 || maxHeight <= 0) {
      console.warn('Invalid dimensions provided:', { maxWidth, maxHeight });
      return null;
    }
    
    console.log('Creating caption image with dimensions:', { maxWidth, maxHeight, captionText: captionText.substring(0, 50) + '...' });
    
    // Dynamic font sizing to fit text optimally
    const minFontSize = 6;
    const maxFontSize = 14;
    const padding = 12;
    const scaleFactor = 2; // Create at 2x resolution for better sharpness
    let fontSize = maxFontSize;
    let displayLines = [];
    let captionHeight = 0;
    let captionWidth = maxWidth;
    
    // Try different font sizes until text fits
    while (fontSize >= minFontSize) {
      const lineHeight = fontSize * 2.0; // Proportional line height (60% of font size)
      const charWidth = fontSize * 0.6; // Approximate character width
      const maxCharsPerLine = Math.floor((maxWidth - padding * 2) / charWidth);
      
      console.log(`Trying font size ${fontSize}px with maxCharsPerLine: ${maxCharsPerLine}`);
      
      // Wrap text for current font size
      const words = captionText.split(' ');
      const lines = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        if (testLine.length <= maxCharsPerLine) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            // Word is too long, split it
            lines.push(word.substring(0, maxCharsPerLine));
            currentLine = word.substring(maxCharsPerLine);
          }
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
      
      // Limit to 4 lines maximum
      const testLines = lines.slice(0, 4);
      const testHeight = testLines.length * lineHeight + padding * 2;
      
      // Check if this font size works
      if (testHeight <= maxHeight) {
        displayLines = testLines;
        captionHeight = testHeight;
        break;
      }
      
      // Try smaller font size
      fontSize -= 1;
    }
    
    // If we couldn't fit the text even with minimum font size, use the smallest size
    if (displayLines.length === 0) {
      fontSize = minFontSize;
      const lineHeight = fontSize * 2.0; // Proportional line height (60% of font size)
      const charWidth = fontSize * 0.6;
      const maxCharsPerLine = Math.floor((maxWidth - padding * 2) / charWidth);
      
      // Simple word wrapping for minimum font size
      const words = captionText.split(' ');
      const lines = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        if (testLine.length <= maxCharsPerLine) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            lines.push(word.substring(0, maxCharsPerLine));
            currentLine = word.substring(maxCharsPerLine);
          }
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
      
      displayLines = lines.slice(0, 4);
      captionHeight = displayLines.length * lineHeight + padding * 2;
    }
    
    console.log('Final caption parameters:', { 
      fontSize, 
      displayLines: displayLines.length, 
      captionHeight, 
      maxHeight,
      textPreview: displayLines.join(' | ')
    });
    
    // Final validation of calculated dimensions
    if (captionWidth <= 0 || captionHeight <= 0 || isNaN(captionWidth) || isNaN(captionHeight)) {
      console.warn('Invalid calculated dimensions:', { captionWidth, captionHeight, maxWidth, maxHeight });
      return null;
    }
    
    console.log('Caption dimensions calculated:', { captionWidth, captionHeight, displayLines: displayLines.length });
    
    // Create SVG with gradient background and text
    const lineHeight = fontSize * 2.0; // Proportional line height (60% of font size)
    const totalTextHeight = displayLines.length * lineHeight;
    const textStartY = (captionHeight - totalTextHeight) / 2 + lineHeight / 2 - 5; // Center the text block, moved up 5px
    
    const svgLines = displayLines.map((line, i) => 
      `<tspan x="50%" dy="${i === 0 ? '0' : lineHeight + 'px'}">${line}</tspan>`
    ).join('');
    
    const svg = `
      <svg width="${captionWidth * scaleFactor}" height="${captionHeight * scaleFactor}">
        <!-- Gradient background with soft edges -->
        <defs>
          <radialGradient id="captionGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:white;stop-opacity:0.85" />
            <stop offset="70%" style="stop-color:white;stop-opacity:0.75" />
            <stop offset="100%" style="stop-color:white;stop-opacity:0.3" />
          </radialGradient>
        </defs>
        
        <!-- Background with rounded corners and gradient -->
        <rect x="${4 * scaleFactor}" y="${4 * scaleFactor}" width="${(captionWidth - 8) * scaleFactor}" height="${(captionHeight - 8) * scaleFactor}" 
              rx="${6 * scaleFactor}" ry="${6 * scaleFactor}" fill="url(#captionGradient)" 
              stroke="white" stroke-width="${1 * scaleFactor}" stroke-opacity="0.3"/>
        
        <!-- Text with improved sharpness -->
        <text x="50%" y="${textStartY * scaleFactor}" text-anchor="middle" 
              font-size="${fontSize * scaleFactor}" fill="#3a277a" font-family="sans-serif" 
              font-weight="600" dominant-baseline="hanging"
              style="text-rendering: optimizeLegibility; font-smooth: never;">
          ${svgLines}
        </text>
      </svg>
    `;
    
    // Create image using sharp with validated dimensions and enhanced sharpness
    const buffer = await sharp(Buffer.from(svg))
      .resize(Math.round(captionWidth), Math.round(captionHeight), {
        kernel: 'lanczos3',
        fit: 'fill'
      })
      .png({ quality: 100, compressionLevel: 0 })
      .toBuffer();
    
    console.log('Caption image created successfully:', { width: captionWidth, height: captionHeight, bufferSize: buffer.length });
    return { buffer, width: captionWidth, height: captionHeight };
  } catch (error) {
    console.error('Error creating caption image:', error);
    console.error('Error details:', { maxWidth, maxHeight, captionText: captionText?.substring(0, 50) });
    // Fallback to simple text - return null so the PDF generator can use its fallback
    return null;
  }
} 