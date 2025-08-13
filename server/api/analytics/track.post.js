import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { events } = body

    if (!events || !Array.isArray(events)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid events data'
      })
    }

    // Get Supabase client
    const config = useRuntimeConfig()
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey
    )

    // Get user ID if authenticated (similar to other API endpoints)
    let userId = null
    const authHeader = event.req.headers['authorization'] || event.req.headers['Authorization']
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim()
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser(token)
        if (!userError && user) {
          userId = user.id
        }
      } catch (error) {
        console.warn('Analytics: Could not authenticate user, tracking as anonymous:', error.message)
      }
    }

    // Get client IP for geolocation
    const clientIP = getClientIP(event)
    const ipHash = hashIP(clientIP)

    // Process each event
    const processedEvents = events.map(eventData => ({
      user_id: userId,
      action: eventData.action,
      session_id: eventData.session_id,
      page_path: eventData.page_path,
      ip_hash: ipHash,
      device_type: eventData.device_type,
      browser: eventData.browser,
      session_duration: eventData.session_duration || 0,
      exit_page: eventData.exit_page || false,
      details: eventData.details || {},
      timestamp: eventData.timestamp || new Date().toISOString()
    }))

    // Insert events into activity_log
    const { data, error } = await supabase
      .from('activity_log')
      .insert(processedEvents)

    if (error) {
      console.error('Analytics tracking error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to track analytics events'
      })
    }

    return {
      success: true,
      eventsProcessed: processedEvents.length
    }

  } catch (error) {
    console.error('Analytics tracking error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})

// Helper function to get client IP
function getClientIP(event) {
  const forwarded = getHeader(event, 'x-forwarded-for')
  const realIP = getHeader(event, 'x-real-ip')
  const cfConnectingIP = getHeader(event, 'cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  return 'unknown'
}

// Simple hash function for IP addresses
function hashIP(ip) {
  if (!ip || ip === 'unknown') {
    return 'unknown'
  }
  
  let hash = 0
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash.toString(36)
}
