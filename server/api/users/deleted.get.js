import { useRuntimeConfig } from '#imports'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  // Get the JWT from the Authorization header
  const authHeader = event.req.headers['authorization'] || event.req.headers['Authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('[deleted.get.js] No Bearer token in Authorization header')
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
    console.error('[deleted.get.js] Invalid token or user not found', userError)
    return { status: 401, body: { error: 'Unauthorized: Invalid token' } }
  }
  console.log('[deleted.get.js] User requesting deleted users list authenticated:', user.email, user.id)

  // Fetch the user's profile to check role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile) {
    console.error('[deleted.get.js] Profile not found or error:', profileError)
    return { status: 403, body: { error: 'Forbidden' } }
  }

  if (profile.role !== 'admin') {
    console.error('[deleted.get.js] User is not admin:', user.email)
    return { status: 403, body: { error: 'Forbidden' } }
  }

  // Fetch all deleted users
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('deleted', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[deleted.get.js] SQL error:', error)
    return { error: error.message, details: error }
  }

  console.log('[deleted.get.js] Supabase response data:', data)
  return data
}) 