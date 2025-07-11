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
    
    // Check if the book is ready for processing
    if (book.status !== 'ready') {
      console.log('❌ Book not ready for processing, status:', book.status)
      throw createError({
        statusCode: 400,
        statusMessage: 'Memory book is not ready for processing'
      })
    }

    // Update status to indicate background generation
    await updatePdfStatus(supabase, book.id, user.id, 'Creating beautiful background design...')
    
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

    // Gather all unique tags from the assets
    const allTags = Array.from(new Set(
      assets.flatMap(asset => Array.isArray(asset.tags) ? asset.tags : [])
    ))
    const tagsPrompt = allTags.length > 0 ? `, theme: ${allTags.join(', ')}` : ''
    
    // 2. Generate a DALL-E 3 background image
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
    
    // Upload background to Supabase Storage (using assets bucket with memory_book subdirectory)
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