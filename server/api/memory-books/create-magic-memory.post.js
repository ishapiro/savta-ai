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
    const { asset_ids, photo_selection_pool, story, title, background_type = 'white', background_color, photo_count = 4, theme_id, output = 'PDF', print_size = '8.5x11', photo_selection_method } = body
    if (!asset_ids || !Array.isArray(asset_ids) || asset_ids.length < 1 || asset_ids.length > 6 || !story) {
      throw createError({ statusCode: 400, statusMessage: '1-6 asset_ids and story are required' })
    }

    // Determine grid layout based on photo count
    let gridLayout = '2x2' // default for 4 photos
    if (photo_count === 2) {
      gridLayout = '2x1'
    } else if (photo_count === 3) {
      gridLayout = '2x2' // 2x2 with one empty space
    } else if (photo_count === 4) {
      gridLayout = '2x2'
    } else if (photo_count === 5) {
      gridLayout = '3x2' // 3x2 with one empty space
    } else if (photo_count === 6) {
      gridLayout = '3x2'
    }

    // Determine layout type based on whether a theme is selected
    const layoutType = theme_id ? 'theme' : 'grid'
    
    // Insert new memory book
    const { data, error } = await supabase
      .from('memory_books')
      .insert({
        user_id: user.id,
        ai_supplemental_prompt: title || 'Magic Memory',
        layout_type: layoutType,
        created_from_assets: asset_ids,
        photo_selection_pool: photo_selection_pool || asset_ids,
        magic_story: story,
        background_type: background_type,
        background_color: background_color,
        theme_id: theme_id || null,
        status: 'draft',
        grid_layout: gridLayout,
        print_size: print_size,
        include_captions: true,
        include_tags: true,
        memory_shape: 'rounded',
        output: output,
        photo_selection_method: photo_selection_method || null
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