// Update or reset a memory book
import { createError, getHeader, getRouterParam, defineEventHandler, readBody } from 'h3'

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

    // Get book ID from URL
    const bookId = getRouterParam(event, 'id')
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

    // Get request body to determine if this is an update or reset
    const body = await readBody(event)
    
    if (body && (body.asset_ids || body.story || body.background_type)) {
      // This is an update with AI results
      const updateData = {}
      if (body.asset_ids) updateData.created_from_assets = body.asset_ids
      if (body.story) updateData.magic_story = body.story
      if (body.background_type) updateData.background_type = body.background_type
      if (body.background_color) updateData.background_color = body.background_color
      
      // If we're updating a template with real data, change status to draft
      if (book.status === 'template' && body.asset_ids && body.story) {
        updateData.status = 'draft'
      }
      
      const { error: updateError } = await supabase
        .from('memory_books')
        .update(updateData)
        .eq('id', bookId)
      if (updateError) {
        throw createError({ statusCode: 500, statusMessage: updateError.message })
      }
    } else {
      // This is a reset for regeneration
      const { error: updateError } = await supabase
        .from('memory_books')
        .update({
          status: 'draft',
          background_url: null,
          pdf_url: null,
          magic_story: null
        })
        .eq('id', bookId)
      if (updateError) {
        throw createError({ statusCode: 500, statusMessage: updateError.message })
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Memory book update/reset error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to update/reset memory book'
    })
  }
}) 