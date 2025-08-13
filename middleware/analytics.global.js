export default defineNuxtRouteMiddleware((to, from) => {
  // Only track if we're on the client side
  if (process.client) {
    console.log('🔍 Analytics Global Middleware: Route change detected', { from: from?.path, to: to?.path })
    
    // Instead of calling useAnalytics directly, we'll make a simple API call
    // This avoids the Vue lifecycle issues in middleware context
    if (to.path) {
      console.log('🔍 Analytics Global Middleware: Tracking page visit', { path: to.path })
      
      // Get the current user's session token if available
      const { $supabase } = useNuxtApp()
      let headers = {}
      
      // Try to get the session token for authenticated users
      if ($supabase) {
        $supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`
          }
          
          // Make the API call with or without auth header
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
          
          // Still try to track without auth
          $fetch('/api/analytics/track', {
            method: 'POST',
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
        })
      } else {
        // Fallback if Supabase is not available
        $fetch('/api/analytics/track', {
          method: 'POST',
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
      }
    }
  }
})
