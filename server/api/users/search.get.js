// Nuxt server API endpoint for user autocomplete search
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = (query.q || '').toLowerCase().trim()
  if (!q) return []

  const config = useRuntimeConfig()
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceRoleKey || config.public.supabaseKey
  )

  // Search by email only (exclude deleted users)
  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, first_name, last_name, email')
    .ilike('email', `%${q}%`)
    .eq('deleted', false)  // Only active users (deleted is boolean, not null)
    .order('email', { ascending: true })
    .limit(15)

  if (error) {
    event.res.statusCode = 500
    return { error: error.message }
  }

  return data || []
}) 