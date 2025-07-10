// Memory book PDF download endpoint
// Generates real PDF with 30-second timeout, one page at a time

import { PDFDocument, rgb } from 'pdf-lib'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const { createClient } = await import('@supabase/supabase-js')
    
    // Use the service role key for server-side operations
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey || config.public.supabaseKey
    )
    
    // Get the book ID from the URL
    const bookId = getRouterParam(event, 'id')
    
    if (!bookId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Book ID is required'
      })
    }
    
    // Get user from auth token
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
    
    // Verify the memory book exists and belongs to the user
    const { data: book, error: bookError } = await supabase
      .from('memory_books')
      .select('*')
      .eq('id', bookId)
      .eq('user_id', user.id)
      .single()
    
    if (bookError || !book) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Memory book not found'
      })
    }
    
    // Check if the book is ready for download
    if (book.status !== 'ready') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Memory book is not ready for download'
      })
    }

    // Always generate a new PDF, do not check or update book.pdf_url
    // (Remove any caching logic)
    // Set timeout for the entire operation (30 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('PDF generation timeout')), 30000)
    })

    // Generate PDF with timeout
    const pdfPromise = generatePDFWithTimeout(supabase, book, config, user)
    
    const result = await Promise.race([pdfPromise, timeoutPromise])
    
    return { 
      success: true, 
      downloadUrl: result 
    }
    
  } catch (error) {
    console.error('Memory book download error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to generate download URL'
    })
  }
})

async function updatePdfStatus(supabase, bookId, userId, status) {
  try {
    await supabase.from('pdf_status').upsert({
      book_id: bookId,
      user_id: userId,
      status,
      updated_at: new Date().toISOString()
    }, { onConflict: ['book_id', 'user_id'] })
  } catch (error) {
    console.log('PDF status table might not exist yet, continuing without status updates:', error.message)
  }
}

// Generate PDF with step-by-step approach
async function generatePDFWithTimeout(supabase, book, config, user) {
  try {
    await updatePdfStatus(supabase, book.id, user.id, 'Generating custom background')
    console.log('Starting PDF generation for book:', book.id)
    
    // 1. Fetch approved assets for this book
    console.log('Fetching assets for book:', book.created_from_assets)
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('*')
      .in('id', book.created_from_assets || [])
      .eq('approved', true)
      .eq('deleted', false)

    if (assetsError) {
      console.error('Error fetching assets:', assetsError)
      throw new Error(`Failed to fetch assets: ${assetsError.message}`)
    }

    console.log('Found assets:', assets?.length || 0)

    if (!assets || assets.length === 0) {
      throw new Error('No approved assets found for this book')
    }

    // Gather all unique tags from the assets
    const allTags = Array.from(new Set(
      assets.flatMap(asset => Array.isArray(asset.tags) ? asset.tags : [])
    ))
    const tagsPrompt = allTags.length > 0 ? `, theme: ${allTags.join(', ')}` : ''
    // 2. Generate a DALL-E 3 background image (one per book)
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
      throw new Error(`OpenAI DALL-E API error: ${dalleRes.status} - ${errorText}`)
    }
    const dalleData = await dalleRes.json()
    const backgroundUrl = dalleData.data[0].url
    // Download the background image
    const bgRes = await fetch(backgroundUrl)
    const bgBuffer = Buffer.from(await bgRes.arrayBuffer())
    // We'll embed as PNG (DALL-E returns PNG)
    // 3. Create PDF document
    const pdfDoc = await PDFDocument.create()
    const pdfBgImage = await pdfDoc.embedPng(bgBuffer)
    
    await updatePdfStatus(supabase, book.id, user.id, 'Custom background ready, creating pages')
    // 4. Layout assets into pages (4 assets per page in a 2x2 grid)
    const assetsPerPage = 4
    const totalPages = Math.ceil(assets.length / assetsPerPage)
    
    console.log(`Generating PDF with ${totalPages} pages for ${assets.length} assets`)
    
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const pageNumStr = (pageIndex + 1) + (pageIndex === 0 ? 'st' : pageIndex === 1 ? 'nd' : pageIndex === 2 ? 'rd' : 'th')
      await updatePdfStatus(supabase, book.id, user.id, `Creating ${pageNumStr} page`)
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
        const col = i % gridCols
        const row = Math.floor(i / gridCols)
        
        const x = col * cellWidth + cellWidth * 0.1
        // Y is measured from the top, so subtract row*cellHeight from top
        const y = height - gridYOffset - (row + 1) * cellHeight + cellHeight * 0.1
        const drawWidth = cellWidth * 0.8
        const drawHeight = cellHeight * 0.8
        
        if (asset.type === 'photo' && asset.storage_url) {
          try {
            // Download the image from storage_url
            const imageRes = await fetch(asset.storage_url)
            const imageBuffer = Buffer.from(await imageRes.arrayBuffer())
            let pdfImage
            if (asset.storage_url.endsWith('.png')) {
              pdfImage = await pdfDoc.embedPng(imageBuffer)
            } else {
              pdfImage = await pdfDoc.embedJpg(imageBuffer)
            }
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
            console.error('Failed to embed image for asset', asset.id, err)
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
    await updatePdfStatus(supabase, book.id, user.id, 'Finalizing PDF...')
    // 5. Save PDF and return as data URL
    console.log('Saving PDF...')
    const pdfBytes = await pdfDoc.save()
    
    // Convert to base64 data URL
    const base64 = Buffer.from(pdfBytes).toString('base64')
    const dataUrl = `data:application/pdf;base64,${base64}`
    
    console.log('PDF generated successfully as data URL')
    
    // Update the book with the data URL
    console.log('Updating book record with PDF data URL...')
    const { error: updateError } = await supabase
      .from('memory_books')
      .update({ pdf_url: dataUrl })
      .eq('id', book.id)
    
    if (updateError) {
      console.error('Error updating book:', updateError)
    }
    
    console.log('PDF generated successfully')
    await updatePdfStatus(supabase, book.id, user.id, 'done')
    setTimeout(() => {
      supabase.from('pdf_status').delete().eq('book_id', book.id).eq('user_id', user.id)
    }, 10000)
    return dataUrl
    
  } catch (error) {
    await updatePdfStatus(supabase, book.id, user.id, 'error')
    setTimeout(() => {
      supabase.from('pdf_status').delete().eq('book_id', book.id).eq('user_id', user.id)
    }, 10000)
    console.error('PDF generation error:', error)
    throw error
  }
} 