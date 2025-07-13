// PDF generation endpoint
// Generates PDF using pre-generated background

import { PDFDocument, rgb } from 'pdf-lib'
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
    const { data: book, error: bookError } = await supabase
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
    
    // Update status 
    await updatePdfStatus(supabase, book.id, user.id, 'Retrieving you memories ...')
    
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

    // Update status 
    await updatePdfStatus(supabase, book.id, user.id, 'Retrieving background image ...')
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
    } else {
      throw new Error('No background URL found for this book')
    }
    
    // 3. Create PDF document
    console.log('📄 Creating PDF document...')
    const pdfDoc = await PDFDocument.create()
    const pdfBgImage = await pdfDoc.embedPng(backgroundBuffer)
    console.log('✅ PDF document created with background image')
    
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
    
    await updatePdfStatus(supabase, book.id, user.id, 'Background ready, creating pages...')
    
    // 4. Layout assets into pages (4 assets per page in a 2x2 grid)
    const assetsPerPage = 4
    
    // Get print size from request body or use defaults from book
    const body = await readBody(event).catch(() => ({}))
    const printSize = body.printSize || book.print_size || '8x10'
    
    console.log('📄 PDF generation parameters:', { printSize })
    
    // Calculate page dimensions based on print size
    let pageWidth, pageHeight
    switch (printSize) {
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
    
    console.log(`📄 Generating PDF with ${totalPages} pages for ${assets.length} assets (${assetsPerPage} assets per page, max 10 pages)`)
    
    if (calculatedPages > 10) {
      console.log(`⚠️ Warning: ${assets.length} assets would require ${calculatedPages} pages, but limiting to 10 pages`)
    }
    
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const pageNumStr = (pageIndex + 1) + (pageIndex === 0 ? 'st' : pageIndex === 1 ? 'nd' : pageIndex === 2 ? 'rd' : 'th')
      await updatePdfStatus(supabase, book.id, user.id, `Creating ${pageNumStr} page (${pageIndex + 1}/${totalPages})`)
      console.log(`📄 Creating page ${pageIndex + 1}/${totalPages}`)
      const startIndex = pageIndex * assetsPerPage
      const pageAssets = assets.slice(startIndex, startIndex + assetsPerPage)
      
      // Add page to PDF with calculated dimensions
      const page = pdfDoc.addPage([pageWidth, pageHeight])
      const { width, height } = page.getSize()
      
      // Margins
      const topMargin = 60 // for heading
      const bottomMargin = 50 // for page number
      const gridYOffset = (pageIndex === 0) ? topMargin : 0
      const availableHeight = height - gridYOffset - bottomMargin
      
      // Draw background image, scaled to fill page, at 50% opacity
      const bgScale = Math.max(width / pdfBgImage.width, height / pdfBgImage.height)
      const bgW = pdfBgImage.width * bgScale
      const bgH = pdfBgImage.height * bgScale
      const bgX = (width - bgW) / 2
      const bgY = (height - bgH) / 2
      page.drawImage(pdfBgImage, {
        x: bgX,
        y: bgY,
        width: bgW,
        height: bgH,
        opacity: 0.5
      })
      
      // Draw title on first page, with extra space below
      if (pageIndex === 0) {
        const headingY = height - 60
        page.drawText('Memory Book', {
          x: 50,
          y: headingY,
          size: 24,
          color: rgb(0.2, 0.2, 0.2)
        })
      }
      
      // Draw assets in 2x2 grid
      const gridCols = 2
      const gridRows = 2
      const cellWidth = width / gridCols
      const cellHeight = availableHeight / gridRows
      
      for (let i = 0; i < pageAssets.length; i++) {
        const asset = pageAssets[i]
        await updatePdfStatus(supabase, book.id, user.id, `Processing ${asset.type} ${i + 1}/${pageAssets.length} on page ${pageIndex + 1}`)
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
            
            // Process image orientation
            const isPng = asset.storage_url.endsWith('.png')
            const processedImageBuffer = await processImageOrientation(imageBuffer, isPng ? 'png' : 'jpeg')
            
            let pdfImage
            if (isPng) {
              pdfImage = await pdfDoc.embedPng(processedImageBuffer)
            } else {
              pdfImage = await pdfDoc.embedJpg(processedImageBuffer)
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
            if (asset.ai_caption) {
              const captionText = asset.ai_caption.substring(0, 50) + '...'
              const textWidth = captionText.length * 4.5 // Approximate width
              const textHeight = 12
              
              // Draw white background rectangle for caption
              page.drawRectangle({
                x: x + 5,
                y: y + 15,
                width: textWidth + 10,
                height: textHeight + 6,
                color: rgb(1, 1, 1)
              })
              
              // Draw black text
              page.drawText(captionText, {
                x: x + 10,
                y: y + 20,
                size: 8,
                color: rgb(0, 0, 0)
              })
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
            if (asset.ai_caption) {
              const captionText = asset.ai_caption.substring(0, 50) + '...'
              const textWidth = captionText.length * 4.5 // Approximate width
              const textHeight = 12
              
              // Draw white background rectangle for caption
              page.drawRectangle({
                x: x + 5,
                y: y + 15,
                width: textWidth + 10,
                height: textHeight + 6,
                color: rgb(1, 1, 1)
              })
              
              // Draw black text
              page.drawText(captionText, {
                x: x + 10,
                y: y + 20,
                size: 8,
                color: rgb(0, 0, 0)
              })
            }
          }
        } else if (asset.type === 'text') {
          console.log(`📝 Processing text asset:`, asset.id)
          // For text assets, draw the text content
          page.drawText(asset.user_caption || asset.ai_caption || 'Text content', {
            x: x + 10,
            y: y + drawHeight / 2,
            size: 12,
            color: rgb(0.2, 0.2, 0.2),
            maxWidth: drawWidth - 20
          })
        }
      }
      // Draw page number in reserved bottom margin
      page.drawText(`Page ${pageIndex + 1}`, {
        x: width - 80,
        y: bottomMargin / 2,
        size: 10,
        color: rgb(0.5, 0.5, 0.5)
      })
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
        pdf_url: publicUrl,
        status: 'ready'
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
    
    setTimeout(() => {
      console.log('🧹 Cleaning up PDF status...')
      supabase.from('pdf_status').delete().eq('book_id', book.id).eq('user_id', user.id)
    }, 10000)
    
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