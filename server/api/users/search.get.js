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

  // Search by email only
  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, first_name, last_name, email')
    .ilike('email', `%${q}%`)
    .order('email', { ascending: true })
    .limit(15)

  if (error) {
    event.res.statusCode = 500
    return { error: error.message }
  }

  return data || []
}) 