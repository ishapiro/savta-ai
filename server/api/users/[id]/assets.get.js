// Nuxt server API endpoint to get assets for a specific user
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

  // Get assets for the specific user
  const { data, error } = await supabase
    .from('assets')
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