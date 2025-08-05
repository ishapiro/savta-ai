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
    
    // Verify the memory book exists and belongs to the user (or user is editor)
    console.log('📚 Fetching memory book from database...')
    
    // First, get the user's profile to check their role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()
    
    if (profileError) {
      console.error('❌ Profile error:', profileError)
      throw createError({
        statusCode: 401,
        statusMessage: 'User profile not found'
      })
    }
    
    // Build the query based on user role
    let bookQuery = supabase
      .from('memory_books')
      .select('*')
      .eq('id', bookId)
    
    // If user is not an editor, only allow access to their own books
    if (profile.role !== 'editor' && profile.role !== 'admin') {
      bookQuery = bookQuery.eq('user_id', user.id)
    }
    
    const { data: book, error: bookError } = await bookQuery.single()
    
    if (bookError || !book) {
      console.error('❌ Book error:', bookError)
      throw createError({
        statusCode: 404,
        statusMessage: 'Memory book not found'
      })
    }
    console.log('✅ Memory book found:', book.id, 'Status:', book.status, 'User role:', profile.role)
    
    // Check if the book is ready for download
    console.log('📋 Checking book status for download...')
    console.log('📋 Book status:', book.status)
    console.log('📋 Book pdf_url:', book.pdf_url)
    console.log('📋 Book background_url:', book.background_url)
    
    if (book.status !== 'ready' && book.status !== 'draft' && book.status !== 'approved') {
      console.log('❌ Book not ready for download, status:', book.status)
      console.log('❌ Allowed statuses: ready, draft, approved')
      console.log('❌ Current status:', book.status)
      throw createError({
        statusCode: 400,
        statusMessage: 'Memory book is not ready for download'
      })
    }

    // If pdf_url exists, return it directly (fast download)
    if (book.pdf_url && book.pdf_url.startsWith('https://')) {
      console.log('✅ PDF URL available for download, returning:', book.pdf_url)
      return {
        success: true,
        downloadUrl: book.pdf_url
      }
    }

    console.log('🔄 PDF URL not found, starting generation process...')
    
    // For regeneration, clear existing files from storage
    if (book.status === 'ready' && (book.background_url || book.pdf_url)) {
      console.log('🔄 Regenerating memory book, clearing existing files...')
      
      // Clear background files if they exist
      if (book.background_url) {
        try {
          // List and delete all background files for this book
          const { data: bgFiles, error: listError } = await supabase.storage
            .from('assets')
            .list(`${user.id}/memory_book/backgrounds/`)
          
          if (!listError && bgFiles) {
            const bgFilesToDelete = bgFiles
              .filter(file => file.name.startsWith(`${book.id}`))
              .map(file => `${user.id}/memory_book/backgrounds/${file.name}`)
            
            if (bgFilesToDelete.length > 0) {
              await supabase.storage.from('assets').remove(bgFilesToDelete)
              console.log('✅ Cleared existing background files:', bgFilesToDelete.length, 'files')
            }
          }
        } catch (clearError) {
          console.warn('⚠️ Failed to clear background files:', clearError)
        }
      }
      
      // Clear PDF files if they exist
      if (book.pdf_url) {
        try {
          // List and delete all PDF files for this book
          const { data: pdfFiles, error: listError } = await supabase.storage
            .from('assets')
            .list(`${user.id}/memory_book/pdfs/`)
          
          if (!listError && pdfFiles) {
            const pdfFilesToDelete = pdfFiles
              .filter(file => file.name.startsWith(`${book.id}`))
              .map(file => `${user.id}/memory_book/pdfs/${file.name}`)
            
            if (pdfFilesToDelete.length > 0) {
              await supabase.storage.from('assets').remove(pdfFilesToDelete)
              console.log('✅ Cleared existing PDF files:', pdfFilesToDelete.length, 'files')
            }
          }
        } catch (clearError) {
          console.warn('⚠️ Failed to clear PDF files:', clearError)
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
    
    // Step 1: Generate background if not already present, AI background is enabled, and background type is not white or solid
    if (!book.background_url && book.ai_background !== false && book.background_type !== 'white' && book.background_type !== 'solid') {
      console.log('🎨 Background not ready, AI background enabled, and background type is not white or solid, generating background...')
      
      try {
        // Update status to indicate background generation
        await updatePdfStatus(supabase, book.id, user.id, 'Creating beautiful background design...')
        
        // Fetch approved assets for this book to get tags
        const assetIds = book.created_from_assets || []
        
        console.log('📸 Fetching assets for book:', assetIds)
        console.log('Book layout type:', book.layout_type)
        console.log('Photo selection pool:', book.photo_selection_pool)
        console.log('Created from assets:', book.created_from_assets)
        
        const { data: assets, error: assetsError } = await supabase
          .from('assets')
          .select('*')
          .in('id', assetIds)
          .eq('approved', true)
          .eq('deleted', false)

        if (assetsError) {
          console.error('❌ Error fetching assets:', assetsError)
          throw new Error(`Failed to fetch assets: ${assetsError.message}`)
        }

        console.log('✅ Found assets:', assets?.length || 0)

        if (!assets || assets.length === 0) {
          console.error('❌ No assets found for book:', {
            layout_type: book.layout_type,
            photo_selection_pool: book.photo_selection_pool,
            created_from_assets: book.created_from_assets,
            assetIds: assetIds
          })
          throw new Error('No approved assets found for this book')
        }

        // Gather all unique tags and captions from the assets
        const allTags = Array.from(new Set(
          assets.flatMap(asset => Array.isArray(asset.tags) ? asset.tags : [])
        ))
        
        // Gather all captions from the assets
        const allCaptions = assets
          .map(asset => asset.ai_caption || asset.user_caption)
          .filter(caption => caption && caption.trim())
        
        // Create enhanced prompt with both tags and captions, but limit length to avoid DALL-E API limits
        let tagsPrompt = ''
        
        // Limit tags to first 10 unique tags to keep prompt manageable
        const limitedTags = allTags.slice(0, 10)
        if (limitedTags.length > 0) {
          tagsPrompt += `, theme: ${limitedTags.join(', ')}`
        }
        
        // Limit captions to first 3 to keep prompt manageable
        const limitedCaptions = allCaptions.slice(0, 3)
        if (limitedCaptions.length > 0) {
          // Truncate each caption to max 100 characters to prevent excessive length
          const truncatedCaptions = limitedCaptions.map(caption => 
            caption.length > 100 ? caption.substring(0, 100) + '...' : caption
          )
          tagsPrompt += `, content: ${truncatedCaptions.join('; ')}`
        }
        
        // Generate a DALL-E 3 background image
        console.log('🎨 Generating DALL-E background image...')
        const openaiApiKey = config.openaiApiKey || process.env.OPENAI_API_KEY
        if (!openaiApiKey) throw new Error('Missing OpenAI API key')
        
        let dallePrompt = `Empty scrapbook page background with soft pastel colors and subtle texture. 
                Minimalistic design. Do not include any people, animals, objects, illustrations, or figures. 
                Background only. No characters, no faces, no silhouettes, no living creatures. 
                No text or decorations.${tagsPrompt}`
        
        // Ensure prompt doesn't exceed DALL-E's 4000 character limit (using 3500 to be safe)
        if (dallePrompt.length > 3500) { // Leave some buffer
          console.warn(`⚠️ Prompt too long (${dallePrompt.length} chars), truncating to fit DALL-E limits`)
          dallePrompt = dallePrompt.substring(0, 3500) + '...'
        }
        
        console.log(`📝 DALL-E prompt length: ${dallePrompt.length} characters`)
        
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
        const timestamp = Date.now()
        const bgFileName = `${user.id}/memory_book/backgrounds/${book.id}_${timestamp}.jpg`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('assets')
          .upload(bgFileName, bgBuffer, {
            contentType: 'image/jpeg',
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
    } else if (book.background_type === 'white') {
      console.log('ℹ️ Background type is white, skipping background generation')
    } else if (book.ai_background === false) {
      console.log('ℹ️ AI background is disabled, skipping background generation')
    } else if (book.background_url) {
      console.log('ℹ️ Background already exists, skipping background generation')
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