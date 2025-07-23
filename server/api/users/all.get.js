import { useRuntimeConfig } from '#imports'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  // Get the JWT from the Authorization header
  const authHeader = event.req.headers['authorization'] || event.req.headers['Authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('[all.get.js] No Bearer token in Authorization header')
    return { status: 401, body: { error: 'Unauthorized: No Bearer token' } }
  }
  const token = authHeader.replace('Bearer ', '').trim()

  const config = useRuntimeConfig()
  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceRoleKey || config.public.supabaseKey
  )

  // Get the user from the JWT
  const { data: { user }, error: userError } = await supabase.auth.getUser(token)
  if (userError || !user) {
    console.error('[all.get.js] Invalid token or user not found', userError)
    return { status: 401, body: { error: 'Unauthorized: Invalid token' } }
  }
  // console.log('[all.get.js] Authenticated user:', user.email, user.id)

  // Fetch the user's profile to check role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile) {
    console.error('[all.get.js] Profile not found or error:', profileError)
    return { status: 403, body: { error: 'Forbidden' } }
  }

  if (profile.role !== 'admin') {
    console.error('[all.get.js] User is not admin:', user.email)
    return { status: 403, body: { error: 'Forbidden' } }
  }

  // Get sort and paging parameters from query
  const query = getQuery(event)
  const sortField = query.sortField || 'created_at'
  const sortOrder = query.sortOrder === 'asc' ? true : false
  const page = parseInt(query.page) || 1
  const rows = parseInt(query.rows) || 10
  const from = (page - 1) * rows
  const to = from + rows - 1

  // Fetch total count
  const { count: totalCount, error: countError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.error('[all.get.js] Count error:', countError)
    return { error: countError.message, details: countError }
  }

  // Fetch paged users with DB-level sorting
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order(sortField, { ascending: sortOrder })
    .range(from, to)

  if (error) {
    console.error('[all.get.js] SQL error:', error)
    return { error: error.message, details: error }
  }

  return { data, totalCount }
}) 