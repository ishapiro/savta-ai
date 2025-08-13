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

    // Get geolocation data using MapBox API (Phase 2 enhancement)
    let geoData = { country: null, region: null, city: null }
    if (config.mapboxToken && clientIP && clientIP !== 'unknown') {
      try {
        geoData = await getGeolocation(clientIP, config.mapboxToken)
      } catch (error) {
        console.warn('Analytics: Failed to get geolocation data:', error.message)
      }
    }

    // Process each event with enhanced data (Phase 2)
    const processedEvents = events.map(eventData => ({
      user_id: userId,
      action: eventData.action,
      session_id: eventData.session_id,
      page_path: eventData.page_path,
      ip_hash: ipHash,
      country: geoData.country,
      region: geoData.region,
      city: geoData.city,
      device_type: eventData.device_type,
      browser: eventData.browser,
      session_duration: eventData.session_duration || 0,
      exit_page: eventData.exit_page || false,
      details: {
        ...eventData.details,
        // Phase 2: Enhanced engagement metrics
        time_on_page: eventData.time_on_page || 0,
        scroll_depth: eventData.scroll_depth || 0,
        interaction_count: eventData.interaction_count || 0,
        referrer_domain: eventData.referrer_domain || null,
        utm_source: eventData.utm_source || null,
        utm_medium: eventData.utm_medium || null,
        utm_campaign: eventData.utm_campaign || null,
        screen_resolution: eventData.screen_resolution || null,
        viewport_size: eventData.viewport_size || null,
        connection_type: eventData.connection_type || null,
        language: eventData.language || null,
        timezone: eventData.timezone || null
      },
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
      eventsProcessed: processedEvents.length,
      geoData: geoData
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

// Phase 2: Geolocation function using MapBox API
async function getGeolocation(ip, mapboxToken) {
  try {
    // Skip private IP ranges
    if (isPrivateIP(ip)) {
      return { country: null, region: null, city: null }
    }

    const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${ip}.json?access_token=${mapboxToken}&types=country,region,place`)
    
    if (!response.ok) {
      throw new Error(`MapBox API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.features || data.features.length === 0) {
      return { country: null, region: null, city: null }
    }

    let country = null
    let region = null
    let city = null

    // Parse the geocoding response
    for (const feature of data.features) {
      const placeType = feature.place_type[0]
      const placeName = feature.text

      switch (placeType) {
        case 'country':
          country = placeName
          break
        case 'region':
          region = placeName
          break
        case 'place':
          city = placeName
          break
      }
    }

    return { country, region, city }
  } catch (error) {
    console.error('Geolocation error:', error)
    return { country: null, region: null, city: null }
  }
}

// Helper function to check if IP is private
function isPrivateIP(ip) {
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^127\./,
    /^169\.254\./,
    /^::1$/,
    /^fc00:/,
    /^fe80:/
  ]
  
  return privateRanges.some(range => range.test(ip))
}
