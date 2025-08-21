export default defineNuxtRouteMiddleware((to, from) => {
  // Only track if we're on the client side
  if (process.client) {
    console.log('🔍 Analytics Global Middleware: Route change detected', { from: from?.path, to: to?.path })
    
    // Use the proper analytics tracking system
    if (to.path) {
      console.log('🔍 Analytics Global Middleware: Tracking page visit', { path: to.path })
      
      // Use the global analytics functions from the plugin
      const { $analytics } = useNuxtApp()
      
      if ($analytics && $analytics.trackPageVisit) {
        console.log('🔍 Analytics Global Middleware: Using analytics plugin for tracking')
        // Track the page visit with full engagement metrics
        $analytics.trackPageVisit(to.path)
      } else {
        console.log('🔍 Analytics Global Middleware: Analytics plugin not available, using fallback')
        console.log('🔍 Analytics Global Middleware: $analytics object:', $analytics)
        console.warn('🔍 Analytics Global Middleware: Analytics plugin not available, falling back to basic tracking')
        
        // Fallback to basic tracking if analytics plugin is not available
        const { $supabase } = useNuxtApp()
        let headers = {}
        
        if ($supabase) {
          $supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.access_token) {
              headers['Authorization'] = `Bearer ${session.access_token}`
            }
            
            $fetch('/api/analytics/track', {
              method: 'POST',
              headers,
              body: {
                events: [{
                  action: 'page_visit',
                  page_path: to.path,
                  timestamp: new Date().toISOString(),
                  details: {
                    url: window.location.href,
                    referrer: document.referrer,
                    user_agent: navigator.userAgent
                  }
                }]
              }
            }).catch(error => {
              console.error('🔍 Analytics Global Middleware: Failed to track page visit', error)
            })
          }).catch(error => {
            console.error('🔍 Analytics Global Middleware: Failed to get session', error)
          })
        }
      }
    }
  }
})
