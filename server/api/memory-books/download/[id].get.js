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

    console.log('🔄 PDF URL not found, checking if background is ready...')
    
    // Check if background is ready, if not, trigger background generation
    if (!book.background_url || book.status === 'ready') {
      console.log('🎨 Background not ready, triggering background generation...')
      
      // Call background generation endpoint
      const backgroundResponse = await $fetch(`/api/memory-books/generate-background/${bookId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!backgroundResponse.success) {
        throw new Error('Failed to generate background')
      }
      
      console.log('✅ Background generated successfully')
    }
    
    // Now generate the PDF
    console.log('📄 Generating PDF with background...')
    const pdfResponse = await $fetch(`/api/memory-books/generate-pdf/${bookId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
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
    
  } catch (error) {
    console.error('❌ Memory book download error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to generate download URL'
    })
  }
}) 