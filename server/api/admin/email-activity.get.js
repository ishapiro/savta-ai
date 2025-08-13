import { useRuntimeConfig } from '#imports'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  // Get the JWT from the Authorization header
  const authHeader = event.req.headers['authorization'] || event.req.headers['Authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('[email-activity.get.js] No Bearer token in Authorization header')
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
    console.error('[email-activity.get.js] Invalid token or user not found', userError)
    return { status: 401, body: { error: 'Unauthorized: Invalid token' } }
  }

  // Fetch the user's profile to check role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile) {
    console.error('[email-activity.get.js] Profile not found or error:', profileError)
    return { status: 403, body: { error: 'Forbidden' } }
  }

  if (profile.role !== 'admin') {
    console.error('[email-activity.get.js] User is not admin:', user.email)
    return { status: 403, body: { error: 'Forbidden' } }
  }

  // Get query parameters
  const query = getQuery(event)
  const page = parseInt(query.page) || 1
  const rows = parseInt(query.rows) || 50
  const userId = query.userId // Optional: filter by specific user
  const email = query.email // Optional: filter by specific email
  const eventType = query.eventType // Optional: filter by event type
  const from = (page - 1) * rows
  const to = from + rows - 1

  try {
    let emailQuery = supabase
      .from('email_events')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (userId) {
      emailQuery = emailQuery.eq('user_id', userId)
    }
    if (email) {
      emailQuery = emailQuery.eq('email', email)
    }
    if (eventType) {
      emailQuery = emailQuery.eq('event_type', eventType)
    }

    // Get total count for pagination
    let countQuery = supabase.from('email_events').select('*', { count: 'exact', head: true })
    if (userId) {
      countQuery = countQuery.eq('user_id', userId)
    }
    if (email) {
      countQuery = countQuery.eq('email', email)
    }
    if (eventType) {
      countQuery = countQuery.eq('event_type', eventType)
    }

    const [{ data, error }, { count, error: countError }] = await Promise.all([
      emailQuery.range(from, to),
      countQuery
    ])

    // If we have data, fetch user profiles for the user_ids
    if (data && data.length > 0) {
      const userIds = [...new Set(data.filter(item => item.user_id).map(item => item.user_id))]
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, email, first_name, last_name')
          .in('user_id', userIds)
        
        // Create a map for quick lookup
        const profileMap = {}
        if (profiles) {
          profiles.forEach(profile => {
            profileMap[profile.user_id] = profile
          })
        }
        
        // Attach profile data to email items
        data.forEach(item => {
          item.profiles = profileMap[item.user_id] || null
        })
      }
    }

    if (error) {
      console.error('[email-activity.get.js] Email query error:', error)
      return { status: 500, body: { error: error.message } }
    }

    if (countError) {
      console.error('[email-activity.get.js] Count query error:', countError)
      return { status: 500, body: { error: countError.message } }
    }

    return {
      data: data || [],
      totalCount: count || 0,
      page,
      rows,
      totalPages: Math.ceil((count || 0) / rows)
    }

  } catch (error) {
    console.error('[email-activity.get.js] Unexpected error:', error)
    return { status: 500, body: { error: 'Internal server error' } }
  }
})
