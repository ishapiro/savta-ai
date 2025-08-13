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
  
  // Configuration
  const BATCH_SIZE = 10
  const BATCH_TIMEOUT = 30000 // 30 seconds
  const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

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

  // Get device and browser information
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

  // Track page visit
  const trackPageVisit = (pagePath) => {
    console.log('🔍 Analytics: Tracking page visit', { pagePath, currentPage: currentPage.value })
    
    const now = Date.now()
    const timeSpent = pageStartTime.value ? Math.floor((now - pageStartTime.value) / 1000) : 0
    
    // Track previous page exit if we have one
    if (currentPage.value && pageStartTime.value) {
      trackEvent('page_visit', {
        page_path: currentPage.value,
        session_duration: timeSpent,
        exit_page: true
      })
    }

    // Start tracking new page
    currentPage.value = pagePath
    pageStartTime.value = now

    // Track new page visit
    trackEvent('page_visit', {
      page_path: pagePath,
      session_duration: 0,
      exit_page: false
    })
  }

  // Track custom event
  const trackEvent = (action, details = {}) => {
    const { deviceType, browser } = getDeviceInfo()
    
    const event = {
      action,
      session_id: sessionId.value,
      page_path: currentPage.value || window.location.pathname,
      device_type: deviceType,
      browser,
      timestamp: new Date().toISOString(),
      details: {
        ...details,
        url: window.location.href,
        referrer: document.referrer,
        user_agent: navigator.userAgent
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
        const timeSpent = Math.floor((Date.now() - pageStartTime.value) / 1000)
        trackEvent('page_visit', {
          page_path: currentPage.value,
          session_duration: timeSpent,
          exit_page: true
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
      const timeSpent = Math.floor((Date.now() - pageStartTime.value) / 1000)
      trackEvent('page_visit', {
        page_path: currentPage.value,
        session_duration: timeSpent,
        exit_page: true
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
    
    // Set up periodic flush
    const interval = setInterval(() => {
      console.log('🔍 Analytics: Periodic flush triggered')
      flushEvents()
    }, BATCH_TIMEOUT)
    
    // Cleanup on unmount
    onUnmounted(() => {
      console.log('🔍 Analytics: Composable unmounting, cleaning up')
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
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
