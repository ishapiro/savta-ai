// Memory book PDF download endpoint
// Uses two-step process: background generation + PDF generation

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
    if (book.status !== 'ready' && book.status !== 'draft') {
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

    console.log('🔄 PDF URL not found, starting generation process...')
    
    // For regeneration, clear existing files from storage
    if (book.status === 'ready' && (book.background_url || book.pdf_url)) {
      console.log('🔄 Regenerating memory book, clearing existing files...')
      
      // Clear background file if it exists
      if (book.background_url) {
        try {
          const bgFileName = `${user.id}/memory_book/backgrounds/${book.id}.png`
          await supabase.storage.from('assets').remove([bgFileName])
          console.log('✅ Cleared existing background file')
        } catch (clearError) {
          console.warn('⚠️ Failed to clear background file:', clearError)
        }
      }
      
      // Clear PDF file if it exists
      if (book.pdf_url) {
        try {
          const pdfFileName = `${user.id}/memory_book/pdfs/${book.id}.pdf`
          await supabase.storage.from('assets').remove([pdfFileName])
          console.log('✅ Cleared existing PDF file')
        } catch (clearError) {
          console.warn('⚠️ Failed to clear PDF file:', clearError)
        }
      }
      
      // Clear URLs from database
      await supabase
        .from('memory_books')
        .update({ 
          background_url: null,
          pdf_url: null,
          status: 'draft'
        })
        .eq('id', book.id)
      
      console.log('✅ Cleared existing URLs from database')
    }
    
    // Step 1: Generate background if not already present
    if (!book.background_url) {
      console.log('🎨 Background not ready, generating background...')
      
      try {
        // Update status to indicate background generation
        await updatePdfStatus(supabase, book.id, user.id, 'Creating beautiful background design...')
        
        // Fetch approved assets for this book to get tags
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
        
        // Generate a DALL-E 3 background image
        console.log('🎨 Generating DALL-E background image...')
        const openaiApiKey = config.openaiApiKey || process.env.OPENAI_API_KEY
        if (!openaiApiKey) throw new Error('Missing OpenAI API key')
        const dallePrompt = `Empty scrapbook page background with soft pastel colors and subtle texture. 
                Minimalistic design. Do not include any people, animals, objects, illustrations, or figures. 
                Background only. No characters, no faces, no silhouettes, no living creatures. 
                No text or decorations.${tagsPrompt}`
        
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
        
        // Upload background to Supabase Storage
        await updatePdfStatus(supabase, book.id, user.id, 'Saving background to storage...')
        console.log('📤 Uploading background to storage...')
        const bgFileName = `${user.id}/memory_book/backgrounds/${book.id}.png`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('assets')
          .upload(bgFileName, bgBuffer, {
            contentType: 'image/png',
            upsert: true
          })
        
        if (uploadError) {
          console.error('❌ Failed to upload background to storage:', uploadError)
          throw new Error('Failed to upload background to storage: ' + uploadError.message)
        }
        
        // Get public URL for background
        const { data: bgUrlData } = supabase.storage
          .from('assets')
          .getPublicUrl(bgFileName)
        
        const backgroundStorageUrl = bgUrlData?.publicUrl
        if (!backgroundStorageUrl) {
          console.error('❌ Failed to get public URL for background')
          throw new Error('Failed to get public URL for background')
        }
        
        console.log('✅ Background uploaded to storage:', backgroundStorageUrl)
        
        // Update the book with background URL
        console.log('📝 Updating memory book with background URL...')
        const { data: updateData, error: updateError } = await supabase
          .from('memory_books')
          .update({ 
            background_url: backgroundStorageUrl,
            status: 'background_ready'
          })
          .eq('id', book.id)
          .select()
        
        if (updateError) {
          console.error('❌ Error updating book with background URL:', updateError)
        } else {
          console.log('✅ Memory book updated with background URL successfully')
        }
        
        await updatePdfStatus(supabase, book.id, user.id, 'Background ready for PDF generation')
        console.log('🎉 Background generation completed successfully')
        
      } catch (backgroundError) {
        console.error('❌ Background generation failed:', backgroundError)
        throw new Error('Failed to generate background: ' + backgroundError.message)
      }
    }
    
    // Step 2: Generate the PDF
    console.log('📄 Generating PDF with background...')
    try {
      // Get print size from query parameters or use defaults from book
      const query = getQuery(event)
      const printSize = query.printSize || book.print_size || '8x10'
      
      console.log('📄 PDF generation parameters:', { printSize })
      
      // Call the PDF generation endpoint with parameters
      const pdfResponse = await $fetch(`/api/memory-books/generate-pdf/${bookId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: {
          printSize
        }
      })
      
      if (!pdfResponse.success) {
        throw new Error('Failed to generate PDF')
      }
      
      console.log('✅ PDF generation completed successfully')
      return {
        success: true,
        downloadUrl: pdfResponse.downloadUrl
      }
    } catch (pdfError) {
      console.error('❌ PDF generation failed:', pdfError)
      throw new Error('Failed to generate PDF: ' + pdfError.message)
    }
    
  } catch (error) {
    console.error('❌ Memory book download error:', error)
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      statusMessage: error.statusMessage
    })
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to generate download URL: ' + error.message
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