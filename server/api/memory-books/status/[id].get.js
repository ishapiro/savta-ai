export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const { data: { user } } = await getServerSupabaseClient(event).auth.getUser()

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  console.log(`[STATUS] Checking status for book ${id} by user ${user.id}`)

  try {
    const supabase = getServerSupabaseClient(event)
    
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

    // Only throw error if it's not a "table doesn't exist" error
    if (pdfError && pdfError.code !== 'PGRST116' && pdfError.code !== '42P01') {
      console.log(`[STATUS] Error fetching PDF status: ${pdfError.message}`)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch PDF status'
      })
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
    throw error
  }
}) 