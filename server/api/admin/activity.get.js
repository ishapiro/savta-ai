import { useRuntimeConfig } from '#imports'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  // Get the JWT from the Authorization header
  const authHeader = event.req.headers['authorization'] || event.req.headers['Authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('[activity.get.js] No Bearer token in Authorization header')
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
    console.error('[activity.get.js] Invalid token or user not found', userError)
    return { status: 401, body: { error: 'Unauthorized: Invalid token' } }
  }

  // Fetch the user's profile to check role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile) {
    console.error('[activity.get.js] Profile not found or error:', profileError)
    return { status: 403, body: { error: 'Forbidden' } }
  }

  if (profile.role !== 'admin') {
    console.error('[activity.get.js] User is not admin:', user.email)
    return { status: 403, body: { error: 'Forbidden' } }
  }

  // Get query parameters
  const query = getQuery(event)
  const page = parseInt(query.page) || 1
  const rows = parseInt(query.rows) || 50
  const userId = query.userId // Optional: filter by specific user
  const from = (page - 1) * rows
  const to = from + rows - 1

  try {
    let activityQuery = supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply user filter if specified
    if (userId) {
      activityQuery = activityQuery.eq('user_id', userId)
    }

    // Get total count for pagination
    const countQuery = userId 
      ? supabase.from('activity_log').select('*', { count: 'exact', head: true }).eq('user_id', userId)
      : supabase.from('activity_log').select('*', { count: 'exact', head: true })

    const [{ data, error }, { count, error: countError }] = await Promise.all([
      activityQuery.range(from, to),
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
        
        // Attach profile data to activity items
        data.forEach(item => {
          item.profiles = profileMap[item.user_id] || null
        })
      }
    }

    if (error) {
      console.error('[activity.get.js] Activity query error:', error)
      return { status: 500, body: { error: error.message } }
    }

    if (countError) {
      console.error('[activity.get.js] Count query error:', countError)
      return { status: 500, body: { error: countError.message } }
    }

    // Ensure data is valid and filter out any null/undefined items
    const validData = Array.isArray(data) ? data.filter(item => item !== null && item !== undefined) : []
    
    return {
      data: validData,
      totalCount: count || 0,
      page,
      rows,
      totalPages: Math.ceil((count || 0) / rows)
    }

  } catch (error) {
    console.error('[activity.get.js] Unexpected error:', error)
    return { status: 500, body: { error: 'Internal server error' } }
  }
})
