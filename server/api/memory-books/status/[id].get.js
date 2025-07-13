export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  if (!id || id === 'null' || id.length < 10) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid or missing book ID'
    })
  }
  
  // Get the authorization header
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - No valid token'
    })
  }

  const token = authHeader.replace('Bearer ', '')
  
  // Create Supabase client with service role
  const config = useRuntimeConfig()
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceRoleKey || config.public.supabaseKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // Verify the token and get user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  
  if (authError || !user) {
    console.log('Auth error:', authError)
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - Invalid token'
    })
  }

  console.log(`[STATUS] Checking status for book ${id} by user ${user.id}`)

  try {
    
    // Get the memory book
    const { data: book, error: bookError } = await supabase
      .from('memory_books')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (bookError || !book) {
      console.log(`[STATUS] Book not found or access denied: ${bookError?.message}`)
      throw createError({
        statusCode: 404,
        statusMessage: 'Memory book not found'
      })
    }

    // Get the PDF status (with error handling for missing table)
    let pdfStatus = null
    let pdfError = null
    
    try {
      const { data: statusData, error: statusError } = await supabase
        .from('pdf_status')
        .select('*')
        .eq('book_id', id)
        .eq('user_id', user.id)
        .single()
      
      pdfStatus = statusData
      pdfError = statusError
    } catch (tableError) {
      console.log(`[STATUS] PDF status table might not exist yet: ${tableError.message}`)
      // Continue without PDF status - this is expected if the table hasn't been created yet
    }

    // Only throw error if it's not a "table doesn't exist" error or "no rows returned" error
    if (pdfError && 
        pdfError.code !== 'PGRST116' && 
        pdfError.code !== '42P01' && 
        pdfError.code !== 'PGRST116') {
      console.log(`[STATUS] Error fetching PDF status: ${pdfError.message}`)
      // Don't throw error, just log it and continue with default values
    }

    const status = {
      book_id: id,
      user_id: user.id,
      book_status: book.status,
      background_url: book.background_url,
      pdf_url: book.pdf_url,
      pdf_status: pdfStatus?.status || 'not_started',
      pdf_error: pdfStatus?.error_message || null,
      created_at: pdfStatus?.created_at || null,
      updated_at: pdfStatus?.updated_at || null
    }

    console.log(`[STATUS] Status for book ${id}:`, status)

    return status
  } catch (error) {
    console.error(`[STATUS] Error checking status for book ${id}:`, error)
    
    // Return a default status instead of throwing an error
    return {
      book_id: id,
      user_id: user?.id || 'unknown',
      book_status: 'error',
      background_url: null,
      pdf_url: null,
      pdf_status: 'error',
      pdf_error: error.message || 'Unknown error',
      created_at: null,
      updated_at: null
    }
  }
}) 