// PDF preview endpoint
// Serves PDF with proper headers for inline viewing

export default defineEventHandler(async (event) => {
  try {
    console.log('📄 Starting PDF preview endpoint')
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
    
    // Check if the book has a PDF URL
    if (!book.pdf_url) {
      console.log('❌ No PDF URL found for book')
      throw createError({
        statusCode: 404,
        statusMessage: 'PDF not found for this memory book'
      })
    }

    console.log('📄 Fetching PDF from storage:', book.pdf_url)
    
    // Fetch the PDF from Supabase Storage
    const pdfResponse = await fetch(book.pdf_url)
    if (!pdfResponse.ok) {
      console.error('❌ Failed to fetch PDF:', pdfResponse.status, pdfResponse.statusText)
      throw createError({
        statusCode: 404,
        statusMessage: 'PDF not found'
      })
    }
    
    const pdfBuffer = await pdfResponse.arrayBuffer()
    console.log('✅ PDF fetched, size:', pdfBuffer.byteLength, 'bytes')
    
    // Set proper headers for inline PDF viewing
    setResponseHeaders(event, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="memory-book-${bookId.slice(-6)}.pdf"`,
      'Content-Length': pdfBuffer.byteLength.toString(),
      'Cache-Control': 'public, max-age=3600'
    })
    
    // Return the PDF buffer
    return Buffer.from(pdfBuffer)
    
  } catch (error) {
    console.error('❌ PDF preview error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to preview PDF'
    })
  }
}) 