import { ref, onMounted, onUnmounted, readonly, getCurrentInstance } from 'vue'

export const useAnalytics = () => {
  // Check if we're in a Vue component context
  const instance = getCurrentInstance()
  if (!instance) {
    console.warn('🔍 Analytics: useAnalytics should only be used within Vue components')
    // Return a no-op version for non-component contexts
    return {
      trackEvent: () => {},
      trackPageVisit: () => {},
      flushEvents: () => Promise.resolve(),
      sessionId: readonly(ref(null))
    }
  }

  const eventBuffer = ref([])
  const sessionId = ref(null)
  const sessionStartTime = ref(null)
  const currentPage = ref(null)
  const pageStartTime = ref(null)
  
  // Phase 2: Enhanced tracking variables
  const scrollDepth = ref(0)
  const interactionCount = ref(0)
  const timeOnPage = ref(0)
  const lastScrollTime = ref(0)
  const lastInteractionTime = ref(0)
  
  // Configuration
  const BATCH_SIZE = 10
  const BATCH_TIMEOUT = 30000 // 30 seconds
  const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
  const SCROLL_THROTTLE = 1000 // 1 second
  const INTERACTION_THROTTLE = 500 // 500ms

  // Initialize session
  const initSession = () => {
    sessionId.value = generateSessionId()
    sessionStartTime.value = Date.now()
    
    console.log('🔍 Analytics: Session initialized', { sessionId: sessionId.value })
    
    // Track session start
    trackEvent('session_start', {
      session_id: sessionId.value,
      page_path: currentPage.value || window.location.pathname
    })
  }

  // Generate unique session ID
  const generateSessionId = () => {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  // Get device and browser information (Phase 2 enhanced)
  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent
    let deviceType = 'desktop'
    let browser = 'unknown'

    // Detect device type
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      deviceType = 'mobile'
    } else if (/iPad|Android.*Tablet/i.test(userAgent)) {
      deviceType = 'tablet'
    }

    // Detect browser
    if (userAgent.includes('Chrome')) {
      browser = 'Chrome'
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox'
    } else if (userAgent.includes('Safari')) {
      browser = 'Safari'
    } else if (userAgent.includes('Edge')) {
      browser = 'Edge'
    }

    return { deviceType, browser }
  }

  // Phase 2: Get enhanced device and connection information
  const getEnhancedDeviceInfo = () => {
    const { deviceType, browser } = getDeviceInfo()
    
    return {
      device_type: deviceType,
      browser,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      connection_type: navigator.connection ? navigator.connection.effectiveType : 'unknown',
      language: navigator.language || 'unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown'
    }
  }

  // Phase 2: Get UTM parameters and referrer information
  const getUTMParameters = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const referrer = document.referrer
    
    return {
      utm_source: urlParams.get('utm_source'),
      utm_medium: urlParams.get('utm_medium'),
      utm_campaign: urlParams.get('utm_campaign'),
      referrer_domain: referrer ? new URL(referrer).hostname : null
    }
  }

  // Hash IP address for privacy (client-side approximation)
  const hashIP = (ip) => {
    // This is a simple hash - in production you'd want a more secure hash
    let hash = 0
    for (let i = 0; i < ip.length; i++) {
      const char = ip.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(36)
  }

  // Phase 2: Track scroll depth
  const trackScroll = () => {
    const now = Date.now()
    if (now - lastScrollTime.value < SCROLL_THROTTLE) return
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
    const newScrollDepth = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0
    
    if (newScrollDepth > scrollDepth.value) {
      scrollDepth.value = newScrollDepth
      lastScrollTime.value = now
    }
  }

  // Phase 2: Track user interactions
  const trackInteraction = () => {
    const now = Date.now()
    if (now - lastInteractionTime.value < INTERACTION_THROTTLE) return
    
    interactionCount.value++
    lastInteractionTime.value = now
  }

  // Phase 2: Update time on page
  const updateTimeOnPage = () => {
    if (pageStartTime.value) {
      timeOnPage.value = Math.floor((Date.now() - pageStartTime.value) / 1000)
    }
  }

  // Track page visit (Phase 2 enhanced)
  const trackPageVisit = (pagePath) => {
    console.log('🔍 Analytics: Tracking page visit', { pagePath, currentPage: currentPage.value })
    
    const now = Date.now()
    const timeSpent = pageStartTime.value ? Math.floor((now - pageStartTime.value) / 1000) : 0
    
    // Track previous page exit if we have one
    if (currentPage.value && pageStartTime.value) {
      trackEvent('page_visit', {
        page_path: currentPage.value,
        session_duration: timeSpent,
        exit_page: true,
        time_on_page: timeOnPage.value,
        scroll_depth: scrollDepth.value,
        interaction_count: interactionCount.value
      })
    }

    // Reset tracking variables for new page
    scrollDepth.value = 0
    interactionCount.value = 0
    timeOnPage.value = 0
    lastScrollTime.value = 0
    lastInteractionTime.value = 0

    // Start tracking new page
    currentPage.value = pagePath
    pageStartTime.value = now

    // Track new page visit
    trackEvent('page_visit', {
      page_path: pagePath,
      session_duration: 0,
      exit_page: false,
      time_on_page: 0,
      scroll_depth: 0,
      interaction_count: 0
    })
  }

  // Track custom event (Phase 2 enhanced)
  const trackEvent = (action, details = {}) => {
    const deviceInfo = getEnhancedDeviceInfo()
    const utmInfo = getUTMParameters()
    
    // Update time on page before tracking
    updateTimeOnPage()
    
    const event = {
      action,
      session_id: sessionId.value,
      page_path: currentPage.value || window.location.pathname,
      device_type: deviceInfo.device_type,
      browser: deviceInfo.browser,
      timestamp: new Date().toISOString(),
      details: {
        ...details,
        url: window.location.href,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        // Phase 2: Enhanced engagement metrics
        time_on_page: timeOnPage.value,
        scroll_depth: scrollDepth.value,
        interaction_count: interactionCount.value,
        referrer_domain: utmInfo.referrer_domain,
        utm_source: utmInfo.utm_source,
        utm_medium: utmInfo.utm_medium,
        utm_campaign: utmInfo.utm_campaign,
        screen_resolution: deviceInfo.screen_resolution,
        viewport_size: deviceInfo.viewport_size,
        connection_type: deviceInfo.connection_type,
        language: deviceInfo.language,
        timezone: deviceInfo.timezone
      }
    }

    console.log('🔍 Analytics: Tracking event', { action, sessionId: sessionId.value, pagePath: event.page_path })

    eventBuffer.value.push(event)

    // Flush if buffer is full
    if (eventBuffer.value.length >= BATCH_SIZE) {
      console.log('🔍 Analytics: Buffer full, flushing events')
      flushEvents()
    }
  }

  // Flush events to server
  const flushEvents = async () => {
    if (eventBuffer.value.length === 0) return

    const events = [...eventBuffer.value]
    eventBuffer.value = []

    console.log('🔍 Analytics: Flushing events to server', { count: events.length, events })

    try {
      await $fetch('/api/analytics/track', {
        method: 'POST',
        body: { events }
      })
      console.log('🔍 Analytics: Events sent successfully')
    } catch (error) {
      console.error('🔍 Analytics: Failed to send analytics:', error)
      // Could implement retry logic here
    }
  }

  // Handle page visibility change
  const handleVisibilityChange = () => {
    if (document.hidden) {
      console.log('🔍 Analytics: Page hidden, tracking exit')
      // Page hidden - track exit
      if (currentPage.value && pageStartTime.value) {
        updateTimeOnPage()
        trackEvent('page_visit', {
          page_path: currentPage.value,
          session_duration: Math.floor((Date.now() - pageStartTime.value) / 1000),
          exit_page: true,
          time_on_page: timeOnPage.value,
          scroll_depth: scrollDepth.value,
          interaction_count: interactionCount.value
        })
      }
    } else {
      console.log('🔍 Analytics: Page visible again')
      // Page visible again - check if session expired
      if (sessionStartTime.value && (Date.now() - sessionStartTime.value) > SESSION_TIMEOUT) {
        console.log('🔍 Analytics: Session expired, reinitializing')
        initSession()
      }
    }
  }

  // Handle beforeunload (user leaving page)
  const handleBeforeUnload = () => {
    console.log('🔍 Analytics: Page unloading, tracking exit')
    if (currentPage.value && pageStartTime.value) {
      updateTimeOnPage()
      trackEvent('page_visit', {
        page_path: currentPage.value,
        session_duration: Math.floor((Date.now() - pageStartTime.value) / 1000),
        exit_page: true,
        time_on_page: timeOnPage.value,
        scroll_depth: scrollDepth.value,
        interaction_count: interactionCount.value
      })
    }
    
    // Force flush events
    flushEvents()
  }

  // Initialize analytics
  onMounted(() => {
    console.log('🔍 Analytics: Composable mounted, initializing session')
    initSession()
    
    // Set up event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    // Phase 2: Enhanced tracking listeners
    window.addEventListener('scroll', trackScroll, { passive: true })
    document.addEventListener('click', trackInteraction, { passive: true })
    document.addEventListener('keydown', trackInteraction, { passive: true })
    document.addEventListener('touchstart', trackInteraction, { passive: true })
    
    // Set up periodic flush and time tracking
    const interval = setInterval(() => {
      console.log('🔍 Analytics: Periodic flush triggered')
      updateTimeOnPage()
      flushEvents()
    }, BATCH_TIMEOUT)
    
    // Cleanup on unmount
    onUnmounted(() => {
      console.log('🔍 Analytics: Composable unmounting, cleaning up')
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('scroll', trackScroll)
      document.removeEventListener('click', trackInteraction)
      document.removeEventListener('keydown', trackInteraction)
      document.removeEventListener('touchstart', trackInteraction)
      clearInterval(interval)
      
      // Final flush
      flushEvents()
    })
  })

  return {
    trackEvent,
    trackPageVisit,
    flushEvents,
    sessionId: readonly(sessionId)
  }
}
