export default defineNuxtPlugin(() => {
  // Only run on client side
  if (process.client) {
    console.log('🔍 Analytics Plugin: Initializing global analytics system')
    
    try {
      // Initialize the analytics composable globally
      const { trackPageVisit, trackEvent, flushEvents } = useAnalytics()
      
      console.log('🔍 Analytics Plugin: Analytics functions loaded successfully', {
        hasTrackPageVisit: !!trackPageVisit,
        hasTrackEvent: !!trackEvent,
        hasFlushEvents: !!flushEvents
      })
      
      // Make analytics functions available globally
      return {
        provide: {
          analytics: {
            trackPageVisit,
            trackEvent,
            flushEvents
          }
        }
      }
    } catch (error) {
      console.error('🔍 Analytics Plugin: Failed to initialize analytics system', error)
      
      // Return empty functions as fallback
      return {
        provide: {
          analytics: {
            trackPageVisit: () => console.warn('Analytics not available'),
            trackEvent: () => console.warn('Analytics not available'),
            flushEvents: () => Promise.resolve()
          }
        }
      }
    }
  }
})
