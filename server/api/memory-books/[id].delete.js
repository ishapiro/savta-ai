import { getHeader, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey || config.public.supabaseKey
    )

    // Get user from auth token
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
    }

    const bookId = event.context.params.id
    if (!bookId) {
      throw createError({ statusCode: 400, statusMessage: 'Missing book id' })
    }

    // Only allow deleting own books
    const { data: book, error: bookError } = await supabase
      .from('memory_books')
      .select('id, user_id')
      .eq('id', bookId)
      .single()
    if (bookError || !book) {
      throw createError({ statusCode: 404, statusMessage: 'Book not found' })
    }
    if (book.user_id !== user.id) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    // Soft delete
    const { error: updateError } = await supabase
      .from('memory_books')
      .update({ deleted: true })
      .eq('id', bookId)
    if (updateError) {
      throw createError({ statusCode: 500, statusMessage: updateError.message })
    }

    return { success: true }
  } catch (error) {
    console.error('Delete Memory Book error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to delete Memory Book'
    })
  }
}) 