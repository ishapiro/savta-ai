// Create Magic Memory Book endpoint
// Saves a new row in memory_books with layout_type='magic', created_from_assets, and magic_story

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

    const body = await readBody(event)
    const { asset_ids, story, title } = body
    if (!asset_ids || !Array.isArray(asset_ids) || asset_ids.length < 2 || asset_ids.length > 4 || !story) {
      throw createError({ statusCode: 400, statusMessage: '2-4 asset_ids and story are required' })
    }

    // Insert new memory book
    const { data, error } = await supabase
      .from('memory_books')
      .insert({
        user_id: user.id,
        title: title || 'Magic Memory',
        layout_type: 'magic',
        created_from_assets: asset_ids,
        magic_story: story,
        status: 'draft',
        grid_layout: '2x2',
        print_size: '7x5',
        include_captions: true,
        include_tags: true
      })
      .select()
      .single()

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }

    return {
      success: true,
      book_id: data.id
    }
  } catch (error) {
    console.error('Create Magic Memory error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to create Magic Memory'
    })
  }
}) 