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

    // Get book ID and photo selection preference from request body
    const body = await readBody(event)
    const bookId = body.bookId
    const useNewPhotos = body.useNewPhotos || false
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

    // Prepare update object based on photo selection preference
    let updateData = {
      status: 'draft',
      background_url: null,
      pdf_url: null,
      magic_story: null, // Always clear story to regenerate it
      ai_photo_selection_reasoning: null
    }
    
    if (useNewPhotos) {
      // User wants new photos - clear current selection and store them as previously used
      const previouslyUsedPhotos = book.created_from_assets || []
      updateData.created_from_assets = null
      updateData.previously_used_assets = previouslyUsedPhotos
      console.log(`🔄 Regenerating with NEW photos for book ${bookId}`)
    } else {
      // User wants same photos - clear previously used list so AI can reuse them
      updateData.previously_used_assets = null
      console.log(`🔄 Regenerating with SAME photos for book ${bookId}`)
      // Keep created_from_assets as is, but clear previously_used_assets
    }
    
    // Reset fields for regeneration
    const { error: updateError } = await supabase
      .from('memory_books')
      .update(updateData)
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