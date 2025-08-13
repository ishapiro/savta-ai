import { useRuntimeConfig } from '#imports'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  // Get the JWT from the Authorization header
  const authHeader = event.req.headers['authorization'] || event.req.headers['Authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('[analytics-dashboard.get.js] No Bearer token in Authorization header')
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
    console.error('[analytics-dashboard.get.js] Invalid token or user not found', userError)
    return { status: 401, body: { error: 'Unauthorized: Invalid token' } }
  }

  // Fetch the user's profile to check role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile) {
    console.error('[analytics-dashboard.get.js] Profile not found or error:', profileError)
    return { status: 403, body: { error: 'Forbidden' } }
  }

  if (profile.role !== 'admin') {
    console.error('[analytics-dashboard.get.js] User is not admin:', user.email)
    return { status: 403, body: { error: 'Forbidden' } }
  }

  // Get query parameters
  const query = getQuery(event)
  const timeRange = query.timeRange || '7d' // 7d, 30d, 90d, 1y
  const userId = query.userId // Optional: filter by specific user

  try {
    // Calculate date range
    const now = new Date()
    let startDate
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Build base query
    let baseQuery = supabase
      .from('activity_log')
      .select('*')
      .gte('created_at', startDate.toISOString())

    if (userId) {
      baseQuery = baseQuery.eq('user_id', userId)
    }

    // Get all activity data for the time range
    const { data: activities, error: activitiesError } = await baseQuery

    if (activitiesError) {
      console.error('[analytics-dashboard.get.js] Activities query error:', activitiesError)
      return { status: 500, body: { error: activitiesError.message } }
    }

    // Process analytics data
    const analytics = processAnalyticsData(activities || [], timeRange)

    return {
      success: true,
      analytics,
      timeRange,
      totalActivities: activities?.length || 0
    }

  } catch (error) {
    console.error('[analytics-dashboard.get.js] Unexpected error:', error)
    return { status: 500, body: { error: 'Internal server error' } }
  }
})

// Process analytics data into meaningful metrics
function processAnalyticsData(activities, timeRange) {
  const analytics = {
    overview: {
      totalSessions: 0,
      totalPageViews: 0,
      uniqueUsers: 0,
      averageSessionDuration: 0,
      averageTimeOnPage: 0,
      averageScrollDepth: 0,
      averageInteractions: 0
    },
    userEngagement: {
      pageViewsByDay: {},
      sessionsByDay: {},
      topPages: {},
      userFlow: {},
      engagementScores: []
    },
    geographic: {
      countries: {},
      regions: {},
      cities: {}
    },
    technical: {
      devices: {},
      browsers: {},
      screenResolutions: {},
      connectionTypes: {}
    },
    marketing: {
      referrers: {},
      utmSources: {},
      utmMediums: {},
      utmCampaigns: {}
    },
    content: {
      exitPages: {},
      entryPages: {},
      pagePerformance: {}
    }
  }

  // Track unique users and sessions
  const uniqueUsers = new Set()
  const sessions = new Set()
  const pageViews = []
  const sessionDurations = []
  const timeOnPages = []
  const scrollDepths = []
  const interactionCounts = []

  activities.forEach(activity => {
    // Track unique users
    if (activity.user_id) {
      uniqueUsers.add(activity.user_id)
    }

    // Track sessions
    if (activity.session_id) {
      sessions.add(activity.session_id)
    }

    // Track page views
    if (activity.action === 'page_visit') {
      pageViews.push(activity)
      
      // Track page performance
      const pagePath = activity.page_path || 'unknown'
      if (!analytics.content.pagePerformance[pagePath]) {
        analytics.content.pagePerformance[pagePath] = {
          views: 0,
          totalTime: 0,
          totalScrollDepth: 0,
          totalInteractions: 0,
          exits: 0
        }
      }
      
      analytics.content.pagePerformance[pagePath].views++
      
      // Track engagement metrics
      const timeOnPage = activity.details?.time_on_page || 0
      const scrollDepth = activity.details?.scroll_depth || 0
      const interactions = activity.details?.interaction_count || 0
      
      if (timeOnPage > 0) {
        analytics.content.pagePerformance[pagePath].totalTime += timeOnPage
        timeOnPages.push(timeOnPage)
      }
      
      if (scrollDepth > 0) {
        analytics.content.pagePerformance[pagePath].totalScrollDepth += scrollDepth
        scrollDepths.push(scrollDepth)
      }
      
      if (interactions > 0) {
        analytics.content.pagePerformance[pagePath].totalInteractions += interactions
        interactionCounts.push(interactions)
      }
      
      if (activity.exit_page) {
        analytics.content.pagePerformance[pagePath].exits++
      }

      // Track top pages
      analytics.userEngagement.topPages[pagePath] = (analytics.userEngagement.topPages[pagePath] || 0) + 1

      // Track by day
      const day = new Date(activity.created_at).toISOString().split('T')[0]
      analytics.userEngagement.pageViewsByDay[day] = (analytics.userEngagement.pageViewsByDay[day] || 0) + 1
    }

    // Track session starts
    if (activity.action === 'session_start') {
      const day = new Date(activity.created_at).toISOString().split('T')[0]
      analytics.userEngagement.sessionsByDay[day] = (analytics.userEngagement.sessionsByDay[day] || 0) + 1
    }

    // Track session duration
    if (activity.session_duration > 0) {
      sessionDurations.push(activity.session_duration)
    }

    // Track geographic data
    if (activity.country) {
      analytics.geographic.countries[activity.country] = (analytics.geographic.countries[activity.country] || 0) + 1
    }
    if (activity.region) {
      analytics.geographic.regions[activity.region] = (analytics.geographic.regions[activity.region] || 0) + 1
    }
    if (activity.city) {
      analytics.geographic.cities[activity.city] = (analytics.geographic.cities[activity.city] || 0) + 1
    }

    // Track technical data
    if (activity.device_type) {
      analytics.technical.devices[activity.device_type] = (analytics.technical.devices[activity.device_type] || 0) + 1
    }
    if (activity.browser) {
      analytics.technical.browsers[activity.browser] = (analytics.technical.browsers[activity.browser] || 0) + 1
    }

    // Track marketing data
    const details = activity.details || {}
    if (details.referrer_domain) {
      analytics.marketing.referrers[details.referrer_domain] = (analytics.marketing.referrers[details.referrer_domain] || 0) + 1
    }
    if (details.utm_source) {
      analytics.marketing.utmSources[details.utm_source] = (analytics.marketing.utmSources[details.utm_source] || 0) + 1
    }
    if (details.utm_medium) {
      analytics.marketing.utmMediums[details.utm_medium] = (analytics.marketing.utmMediums[details.utm_medium] || 0) + 1
    }
    if (details.utm_campaign) {
      analytics.marketing.utmCampaigns[details.utm_campaign] = (analytics.marketing.utmCampaigns[details.utm_campaign] || 0) + 1
    }

    // Track technical details
    if (details.screen_resolution) {
      analytics.technical.screenResolutions[details.screen_resolution] = (analytics.technical.screenResolutions[details.screen_resolution] || 0) + 1
    }
    if (details.connection_type) {
      analytics.technical.connectionTypes[details.connection_type] = (analytics.technical.connectionTypes[details.connection_type] || 0) + 1
    }
  })

  // Calculate overview metrics
  analytics.overview.totalSessions = sessions.size
  analytics.overview.totalPageViews = pageViews.length
  analytics.overview.uniqueUsers = uniqueUsers.size
  analytics.overview.averageSessionDuration = sessionDurations.length > 0 
    ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length 
    : 0
  analytics.overview.averageTimeOnPage = timeOnPages.length > 0 
    ? timeOnPages.reduce((a, b) => a + b, 0) / timeOnPages.length 
    : 0
  analytics.overview.averageScrollDepth = scrollDepths.length > 0 
    ? scrollDepths.reduce((a, b) => a + b, 0) / scrollDepths.length 
    : 0
  analytics.overview.averageInteractions = interactionCounts.length > 0 
    ? interactionCounts.reduce((a, b) => a + b, 0) / interactionCounts.length 
    : 0

  // Calculate engagement scores for pages
  Object.keys(analytics.content.pagePerformance).forEach(pagePath => {
    const perf = analytics.content.pagePerformance[pagePath]
    if (perf.views > 0) {
      const avgTime = perf.totalTime / perf.views
      const avgScroll = perf.totalScrollDepth / perf.views
      const avgInteractions = perf.totalInteractions / perf.views
      const exitRate = perf.exits / perf.views
      
      // Simple engagement score (0-100)
      const engagementScore = Math.min(100, Math.round(
        (avgTime / 60) * 20 + // Time weight
        (avgScroll / 100) * 30 + // Scroll weight
        (avgInteractions / 10) * 30 + // Interaction weight
        ((1 - exitRate) * 100) * 20 // Exit rate weight
      ))
      
      analytics.userEngagement.engagementScores.push({
        page: pagePath,
        score: engagementScore,
        views: perf.views,
        avgTime: avgTime,
        avgScroll: avgScroll,
        avgInteractions: avgInteractions,
        exitRate: exitRate
      })
    }
  })

  // Sort engagement scores
  analytics.userEngagement.engagementScores.sort((a, b) => b.score - a.score)

  return analytics
}
