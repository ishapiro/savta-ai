export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()
  const { hasInsidersAccess } = useInsidersAccess()
  
  // Loop detection logic
  const checkForLoginLoop = () => {
    if (process.client) {
      const now = Date.now()
      const redirectHistory = JSON.parse(sessionStorage.getItem('authRedirectHistory') || '[]')
      
      // Clean old entries (older than 10 seconds)
      const recentHistory = redirectHistory.filter(entry => now - entry.timestamp < 10000)
      
      // Add current redirect
      recentHistory.push({
        from: window.location.pathname,
        to: to.path,
        timestamp: now
      })
      
      // Check for loop pattern (login -> dashboard -> login -> dashboard)
      const loginDashboardPattern = recentHistory.filter(entry => 
        entry.from === '/app/login' && entry.to === '/app/dashboard' ||
        entry.from === '/app/dashboard' && entry.to === '/app/login'
      )
      
      if (loginDashboardPattern.length >= 4) {
        console.warn('Login loop detected, forcing logout')
        
        // Force logout
        const supabase = useNuxtApp().$supabase
        supabase.auth.signOut()
        
        // Clear user state
        const { globalUser } = useSupabaseUser()
        globalUser.value = null
        
        // Clear redirect history
        sessionStorage.removeItem('authRedirectHistory')
        
        // Set guest mode flag
        sessionStorage.setItem('guestMode', 'true')
        
        // Allow access to dashboard in guest mode
        return
      }
      
      // Store updated history
      sessionStorage.setItem('authRedirectHistory', JSON.stringify(recentHistory))
    }
  }
  
  // Check for login loop before any redirects
  checkForLoginLoop()
  
  // Allow access to auth pages regardless of authentication status
  if (to.path === '/app/login' || to.path === '/app/signup' || to.path === '/app/confirm') {
    return
  }
  
  // Allow access to dashboard for users with insiders access, full authentication, or guest mode
  if (to.path === '/app/dashboard') {
    // Check insiders access directly from sessionStorage for immediate access
    const insidersAccess = process.client ? ((sessionStorage.getItem('insiders-access') || '').toLowerCase() === 'true') : false;
    if (user.value || hasInsidersAccess.value || insidersAccess || (process.client && sessionStorage.getItem('guestMode') === 'true')) {
      return
    }
    // If no access, redirect to login
    return navigateTo('/app/login')
  }
  
  // For all other /app/ routes, require full authentication
  if (!user.value && to.path.startsWith('/app/')) {
    return navigateTo('/app/login')
  }
  
  // If user is authenticated and trying to access auth pages, redirect to app dashboard
  if (user.value && (to.path === '/app/login' || to.path === '/app/signup' || to.path === '/app/confirm')) {
    return navigateTo('/app/dashboard')
  }
}) 