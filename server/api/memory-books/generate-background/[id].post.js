// Background generation endpoint
// Generates DALL-E background image for memory book

export default defineEventHandler(async (event) => {
  try {
    console.log('🎨 Starting background generation endpoint')
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
    
    // Check if the book is ready for processing
    if (book.status !== 'ready' && book.status !== 'draft' && book.status !== 'background_ready') {
      console.log('❌ Book not ready for processing, status:', book.status)
      throw createError({
        statusCode: 400,
        statusMessage: 'Memory book is not ready for processing'
      })
    }

    // Update status to indicate background generation
    await updatePdfStatus(supabase, book.id, user.id, 'Creating beautiful background design...')
    
    // 0. Delete old background files if they exist (try both old and new patterns)
    console.log('🗑️ Deleting old background files...')
    try {
      // Try to delete files with both old pattern and new timestamp pattern
      const oldFilePattern = `${user.id}/memory_book/backgrounds/${book.id}.jpg`
      const timestampPattern = `${user.id}/memory_book/backgrounds/${book.id}_*.jpg`
      
      // List files in the background directory to find old files
      const { data: files, error: listError } = await supabase.storage
        .from('assets')
        .list(`${user.id}/memory_book/backgrounds/`)
      
      if (!listError && files) {
        const filesToDelete = files
          .filter(file => file.name.startsWith(`${book.id}`))
          .map(file => `${user.id}/memory_book/backgrounds/${file.name}`)
        
        if (filesToDelete.length > 0) {
          const { error: deleteError } = await supabase.storage
            .from('assets')
            .remove(filesToDelete)
          
          if (deleteError) {
            console.warn('⚠️ Failed to delete old background files:', deleteError.message)
          } else {
            console.log('✅ Old background files deleted successfully:', filesToDelete.length, 'files')
          }
        } else {
          console.log('ℹ️ No old background files found to delete')
        }
      }
    } catch (error) {
      console.warn('⚠️ Error deleting old background files:', error.message)
    }
    
    // Check if we need to call magic memory first (missing assets or story)
    const needsMagicMemory = (!book.created_from_assets || book.created_from_assets.length === 0) || (!book.magic_story || book.magic_story.trim() === '')
    
    console.log('🔍 Magic memory check for background generation:', {
      hasCreatedFromAssets: !!book.created_from_assets,
      createdFromAssetsLength: book.created_from_assets?.length || 0,
      hasMagicStory: !!book.magic_story,
      magicStoryLength: book.magic_story?.length || 0,
      needsMagicMemory,
      bookId: book.id,
      bookStatus: book.status
    })
    
    // Force magic memory if created_from_assets is null/empty, regardless of story
    const forceMagicMemory = !book.created_from_assets || book.created_from_assets.length === 0
    console.log('🔍 Force magic memory check:', { forceMagicMemory })
    
    if (needsMagicMemory || forceMagicMemory) {
      console.log('🔄 Missing assets or story, calling magic memory endpoint first')
      
      // Calculate photo count for magic memory
      let photoCount = 3 // Default fallback
      if (book.layout_type === 'theme' && book.theme_id) {
        const { data: theme, error: themeError } = await supabase
          .from('themes')
          .select('*')
          .eq('id', book.theme_id)
          .single()
        
        if (!themeError && theme) {
          const layoutConfig = typeof theme.layout_config === 'string' 
            ? JSON.parse(theme.layout_config) 
            : theme.layout_config
          
          if (layoutConfig && layoutConfig.photos) {
            photoCount = layoutConfig.photos.length
          }
        }
      }
      
      // Call magic memory endpoint
      console.log('🔄 Calling magic memory endpoint with:', {
        memoryBookId: book.id,
        userId: user.id,
        photoCount: photoCount
      })
      
      const magicRes = await fetch(`${config.public.siteUrl}/api/ai/magic-memory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          memoryBookId: book.id,
          userId: user.id,
          photoCount: photoCount
        })
      })
      
      console.log('🔄 Magic memory response status:', magicRes.status)
      
      if (!magicRes.ok) {
        const errorText = await magicRes.text()
        console.error('❌ Magic memory generation failed', `Status: ${magicRes.status}`, errorText)
        throw new Error(`Magic memory generation failed: ${magicRes.status} - ${errorText}`)
      }
      
      const magicData = await magicRes.json()
      
      console.log('🔄 Magic memory response data:', {
        success: magicData.success,
        hasStory: !!magicData.story,
        storyLength: magicData.story?.length || 0,
        hasSelectedPhotoIds: !!magicData.selected_photo_ids,
        selectedPhotoIdsLength: magicData.selected_photo_ids?.length || 0,
        hasReasoning: !!magicData.reasoning,
        reasoningLength: magicData.reasoning?.length || 0
      })
      
      if (!magicData.success) {
        console.error('❌ Magic memory generation failed', magicData.error)
        throw new Error('Magic memory generation failed: ' + magicData.error)
      }
      
      // Update the book with the new story and asset IDs
      const { error: updateError } = await supabase.from('memory_books').update({
        magic_story: magicData.story,
        created_from_assets: magicData.selected_photo_ids || [],
        ai_photo_selection_reasoning: magicData.reasoning || null
      }).eq('id', book.id)
      
      if (updateError) {
        console.error('❌ Failed to update book with magic memory results', updateError.message)
        throw new Error(`Failed to update book: ${updateError.message}`)
      }
      
      // Re-fetch the book to get updated values
      const { data: updatedBook, error: bookError } = await supabase
        .from('memory_books')
        .select('*')
        .eq('id', book.id)
        .single()
      
      if (!bookError && updatedBook) {
        book = updatedBook
        console.log('✅ Book updated with magic memory results')
      } else {
        console.error('❌ Failed to re-fetch updated book', bookError?.message)
        throw new Error(`Failed to re-fetch book: ${bookError?.message}`)
      }
    }
    
    // 1. Fetch approved assets for this book to get tags
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
    
    // 2. Generate a DALL-E 3 background image
    console.log('🎨 Generating DALL-E background image...')
    const openaiApiKey = config.openaiApiKey || process.env.OPENAI_API_KEY
    if (!openaiApiKey) throw new Error('Missing OpenAI API key')
    
    let dallePrompt = `Abstract background with soft, neutral colors and smooth gradients. Subtle texture for depth. 
        No letters, no numbers, no words, no symbols, no text of any kind. No people, no animals. 
        Pure ambient design. Do not include any written language, signage, characters, glyphs, or typographic elements. 
        The image must be entirely free of any writing or visual text-like shapes.
        The photos include these subjects which are the main focus of the page: ${tagsPrompt}`
    
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
    
    // Upload background to Supabase Storage (using assets bucket with memory_book subdirectory)
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
        status: 'background_ready',
        pdf_url: null // Clear old PDF URL since we're regenerating
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
    
    return {
      success: true,
      backgroundUrl: backgroundStorageUrl,
      message: 'Background generated successfully'
    }
    
  } catch (error) {
    console.error('❌ Background generation error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to generate background'
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