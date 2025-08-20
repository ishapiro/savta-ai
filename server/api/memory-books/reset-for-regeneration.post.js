// Reset a memory book for regeneration (clears background, PDF, and story)
import { createError, getHeader, defineEventHandler, readBody } from 'h3'

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

    // Get book ID from request body
    const body = await readBody(event)
    const bookId = body.bookId
    if (!bookId) {
      throw createError({ statusCode: 400, statusMessage: 'Book ID is required' })
    }

    // Fetch the book and check ownership
    const { data: book, error: bookError } = await supabase
      .from('memory_books')
      .select('*')
      .eq('id', bookId)
      .eq('user_id', user.id)
      .single()
    if (bookError || !book) {
      throw createError({ statusCode: 404, statusMessage: 'Memory book not found' })
    }

    // Store previously used photos before clearing them
    const previouslyUsedPhotos = book.created_from_assets || []
    
    // Reset fields for regeneration - clear photo selection and story to force regeneration
    const { error: updateError } = await supabase
      .from('memory_books')
      .update({
        status: 'draft',
        background_url: null,
        pdf_url: null,
        created_from_assets: null,
        magic_story: null,
        ai_photo_selection_reasoning: null,
        previously_used_assets: previouslyUsedPhotos // Store previously used photos to exclude them
        // Clear photo selection and story to force AI to rerun with updated prompt
      })
      .eq('id', bookId)
    if (updateError) {
      throw createError({ statusCode: 500, statusMessage: updateError.message })
    }

    return { success: true }
  } catch (error) {
    console.error('Reset for regeneration error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to reset memory book for regeneration'
    })
  }
}) 