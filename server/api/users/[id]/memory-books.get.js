// Nuxt server API endpoint to get memory books for a specific user
export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'id')
  if (!userId) {
    event.res.statusCode = 400
    return { error: 'User ID is required' }
  }

  const config = useRuntimeConfig()
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceRoleKey || config.public.supabaseKey
  )

  // If ?count=1, return only the count
  const query = getQuery(event)
  if (query.count === '1') {
    const { count, error: countError } = await supabase
      .from('memory_books')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('deleted', false)
    if (countError) {
      event.res.statusCode = 500
      return { error: countError.message }
    }
    return { count }
  }

  // Get memory books for the specific user
  const { data, error } = await supabase
    .from('memory_books')
    .select('*')
    .eq('user_id', userId)
    .eq('deleted', false)
    .order('created_at', { ascending: false })

  if (error) {
    event.res.statusCode = 500
    return { error: error.message }
  }

  // If we have memory books with themes, fetch the theme data
  if (data && data.length > 0) {
    const booksWithThemes = data.filter(book => book.theme)
    if (booksWithThemes.length > 0) {
      const themeIds = [...new Set(booksWithThemes.map(book => book.theme))]
      
      const { data: themesData, error: themesError } = await supabase
        .from('themes')
        .select('id, name, description, background_color, header_font, body_font, signature_font, header_font_color, body_font_color, signature_font_color, layout_config, rounded, size')
        .in('id', themeIds)
      
      if (!themesError && themesData) {
        const themesMap = themesData.reduce((acc, theme) => {
          acc[theme.id] = theme
          return acc
        }, {})
        
        // Attach theme data to memory books
        data.forEach(book => {
          if (book.theme && themesMap[book.theme]) {
            book.theme = themesMap[book.theme]
          }
        })
      }
    }
  }

  return data || []
}) 