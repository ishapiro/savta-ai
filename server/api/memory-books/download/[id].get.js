// Memory book PDF download endpoint
// Generates real PDF with 30-second timeout, one page at a time

import { PDFDocument, rgb } from 'pdf-lib'

export default defineEventHandler(async (event) => {
  try {
    console.log('🚀 Starting memory book download endpoint')
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
    
    // Check if the book is ready for download
    if (book.status !== 'ready') {
      console.log('❌ Book not ready for download, status:', book.status)
      throw createError({
        statusCode: 400,
        statusMessage: 'Memory book is not ready for download'
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
    // Otherwise, generate and upload the PDF
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('PDF generation timeout')), 30000)
    })
    const pdfPromise = generatePDFWithTimeout(supabase, book, config, user)
    const result = await Promise.race([pdfPromise, timeoutPromise])
    console.log('✅ PDF generation completed successfully')
    return {
      success: true,
      downloadUrl: result
    }
  } catch (error) {
    console.error('❌ Memory book download error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to generate download URL'
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

// Generate PDF with step-by-step approach
async function generatePDFWithTimeout(supabase, book, config, user) {
  try {
    await updatePdfStatus(supabase, book.id, user.id, 'Starting PDF generation...')
    console.log('🎨 Starting PDF generation for book:', book.id)
    
    // 1. Fetch approved assets for this book
    await updatePdfStatus(supabase, book.id, user.id, 'Fetching your photos and memories...')
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

    // Gather all unique tags from the assets
    const allTags = Array.from(new Set(
      assets.flatMap(asset => Array.isArray(asset.tags) ? asset.tags : [])
    ))
    const tagsPrompt = allTags.length > 0 ? `, theme: ${allTags.join(', ')}` : ''
    
    // 2. Generate a DALL-E 3 background image (one per book)
    await updatePdfStatus(supabase, book.id, user.id, 'Creating beautiful background design...')
    console.log('🎨 Generating DALL-E background image...')
    const openaiApiKey = config.openaiApiKey || process.env.OPENAI_API_KEY
    if (!openaiApiKey) throw new Error('Missing OpenAI API key')
    const dallePrompt = `scrapbook page background, soft colors, subtle texture, no text, no people, no objects, DO NOT INCLUDE ANY IMAGES OF PEOPLE OR ANIMALS${tagsPrompt}`
    const dalleRes = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: dallePrompt,
        n: 1,
        size: '1024x1024'
      })
    })
    if (!dalleRes.ok) {
      const errorText = await dalleRes.text()
      console.error('❌ OpenAI DALL-E API error:', dalleRes.status, errorText)
      throw new Error(`OpenAI DALL-E API error: ${dalleRes.status} - ${errorText}`)
    }
    const dalleData = await dalleRes.json()
    const backgroundUrl = dalleData.data[0].url
    console.log('✅ DALL-E background generated:', backgroundUrl)
    
    // Download the background image
    await updatePdfStatus(supabase, book.id, user.id, 'Downloading background design...')
    console.log('⬇️ Downloading background image...')
    const bgRes = await fetch(backgroundUrl)
    const bgBuffer = Buffer.from(await bgRes.arrayBuffer())
    console.log('✅ Background image downloaded, size:', bgBuffer.length, 'bytes')
    
    // We'll embed as PNG (DALL-E returns PNG)
    // 3. Create PDF document
    await updatePdfStatus(supabase, book.id, user.id, 'Setting up PDF document...')
    console.log('📄 Creating PDF document...')
    const pdfDoc = await PDFDocument.create()
    const pdfBgImage = await pdfDoc.embedPng(bgBuffer)
    console.log('✅ PDF document created with background image')
    
    await updatePdfStatus(supabase, book.id, user.id, 'Background ready, creating pages...')
    // 4. Layout assets into pages (4 assets per page in a 2x2 grid)
    const assetsPerPage = 4
    const totalPages = Math.ceil(assets.length / assetsPerPage)
    
    console.log(`📄 Generating PDF with ${totalPages} pages for ${assets.length} assets`)
    
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const pageNumStr = (pageIndex + 1) + (pageIndex === 0 ? 'st' : pageIndex === 1 ? 'nd' : pageIndex === 2 ? 'rd' : 'th')
      await updatePdfStatus(supabase, book.id, user.id, `Creating ${pageNumStr} page (${pageIndex + 1}/${totalPages})`)
      console.log(`📄 Creating page ${pageIndex + 1}/${totalPages}`)
      const startIndex = pageIndex * assetsPerPage
      const pageAssets = assets.slice(startIndex, startIndex + assetsPerPage)
      
      // Add page to PDF
      const page = pdfDoc.addPage([595, 842]) // A4 size
      const { width, height } = page.getSize()
      
      // Margins
      const topMargin = 60 // for heading
      const bottomMargin = 50 // for page number
      const gridYOffset = (pageIndex === 0) ? topMargin : 0
      const availableHeight = height - gridYOffset - bottomMargin
      
      // Draw DALL-E background image, scaled to fill page, at 50% opacity
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
            
            let pdfImage
            if (asset.storage_url.endsWith('.png')) {
              pdfImage = await pdfDoc.embedPng(imageBuffer)
            } else {
              pdfImage = await pdfDoc.embedJpg(imageBuffer)
            }
            console.log(`✅ Image embedded in PDF`)
            
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
              page.drawText(asset.ai_caption.substring(0, 50) + '...', {
                x: x + 10,
                y: y + 20,
                size: 8,
                color: rgb(0.5, 0.5, 0.5)
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
              page.drawText(asset.ai_caption.substring(0, 50) + '...', {
                x: x + 10,
                y: y + 20,
                size: 8,
                color: rgb(0.5, 0.5, 0.5)
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
    
    const fileName = `memory-books/${book.id}.pdf`
    await updatePdfStatus(supabase, book.id, user.id, 'Uploading PDF to cloud storage...')
    console.log('📤 Uploading PDF to Supabase Storage:', fileName)
    
    // Upload to Supabase Storage (memory-books bucket)
    const { data: uploadData, error: uploadError } = await supabase.storage.from('memory-books').upload(fileName, pdfBytes, {
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
    const { data: publicUrlData } = supabase.storage.from('memory-books').getPublicUrl(fileName)
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
      .update({ pdf_url: publicUrl })
      .eq('id', book.id)
      .select()
    
    if (updateError) {
      console.error('❌ Error updating book with PDF URL:', updateError)
      // Don't throw here, as the PDF was successfully uploaded
    } else {
      console.log('✅ Memory book updated with PDF URL successfully')
    }
    
    await updatePdfStatus(supabase, book.id, user.id, 'PDF ready for download!')
    console.log('🎉 PDF generated and uploaded successfully')
    setTimeout(() => {
      console.log('🧹 Cleaning up PDF status...')
      supabase.from('pdf_status').delete().eq('book_id', book.id).eq('user_id', user.id)
    }, 10000)
    return publicUrl
    
  } catch (error) {
    console.error('❌ PDF generation error:', error)
    await updatePdfStatus(supabase, book.id, user.id, 'Error: ' + error.message)
    setTimeout(() => {
      console.log('🧹 Cleaning up PDF status after error...')
      supabase.from('pdf_status').delete().eq('book_id', book.id).eq('user_id', user.id)
    }, 10000)
    throw error
  }
} 