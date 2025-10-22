import { useSupabaseUser } from '~/composables/useSupabase'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useSupabaseUser()
  const supabase = useNuxtApp().$supabase
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
      
      // Check for loop pattern (login -> memory-books -> login -> memory-books)
      const loginMemoryBooksPattern = recentHistory.filter(entry => 
        entry.from === '/app/login' && entry.to === '/app/memory-books' ||
        entry.from === '/app/memory-books' && entry.to === '/app/login'
      )
      
      if (loginMemoryBooksPattern.length >= 4) {
        console.warn('Login loop detected, forcing logout')
        
        // Force logout
        supabase.auth.signOut()
        
        // Clear user state
        const { globalUser } = useSupabaseUser()
        globalUser.value = null
        
        // Clear redirect history
        sessionStorage.removeItem('authRedirectHistory')
        
        // Set guest mode flag
        sessionStorage.setItem('guestMode', 'true')
        
        // Allow access to memory books in guest mode
        return
      }
      
      // Store updated history
      sessionStorage.setItem('authRedirectHistory', JSON.stringify(recentHistory))
    }
  }
  
  // Check for login loop before any redirects
  checkForLoginLoop()

  if (user.value) {
    try {
      // Fetch the user profile from the backend
      const res = await fetch(`/api/users/${user.value.id}/info`)
      
      if (res.ok) {
        const profile = await res.json()
        if (profile.deleted === true || profile.exists === false) {
          console.log('[AUTH] User is deleted or does not exist, signing out')
          await supabase.auth.signOut()
          return navigateTo('/app/login?disabled=1')
        }
      } else {
        // If API returns error, check if it's a 404 (user not found)
        if (res.status === 404) {
          console.log('[AUTH] User not found (404), signing out')
          await supabase.auth.signOut()
          return navigateTo('/app/login?disabled=1')
        }
        // For other errors, log but continue
        console.warn('[AUTH] Error checking user status:', res.status, res.statusText)
      }
    } catch (error) {
      console.error('[AUTH] Error checking user profile:', error)
      // On network errors, continue but user might have limited functionality
    }
  }
  
  // Allow access to auth pages regardless of authentication status
  if (to.path === '/app/login' || to.path === '/app/signup' || to.path === '/app/confirm') {
    return
  }
  
  // Allow access to getting started for users with insiders access, full authentication, or guest mode
  if (to.path === '/getting-started') {
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
  
  // If user is authenticated and trying to access auth pages, redirect to memory books
  if (user.value && (to.path === '/app/login' || to.path === '/app/signup' || to.path === '/app/confirm')) {
    // Always redirect authenticated users to memory books
    // Skip confirm page entirely and go straight to memory-books
    return navigateTo('/app/memory-books')
  }
}) 