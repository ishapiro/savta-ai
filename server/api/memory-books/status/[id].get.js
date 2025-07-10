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

    // Get the PDF status
    const { data: pdfStatus, error: pdfError } = await supabase
      .from('pdf_status')
      .select('*')
      .eq('book_id', id)
      .eq('user_id', user.id)
      .single()

    if (pdfError && pdfError.code !== 'PGRST116') {
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