// PDF status endpoint - returns current status of PDF generation
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
    
    // Get the PDF status for this book
    let status = null
    try {
      const { data, error: statusError } = await supabase
        .from('pdf_status')
        .select('*')
        .eq('book_id', bookId)
        .eq('user_id', user.id)
        .single()
      
      if (statusError && statusError.code !== 'PGRST116') {
        // PGRST116 is "not found" which is fine
        console.log('PDF status table might not exist yet:', statusError.message)
      } else {
        status = data
      }
    } catch (error) {
      console.log('Error accessing pdf_status table:', error.message)
    }
    
    return {
      success: true,
      status: status || null
    }
    
  } catch (error) {
    console.error('PDF status error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to get PDF status'
    })
  }
}) 