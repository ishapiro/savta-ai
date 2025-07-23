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

  return data || []
}) 