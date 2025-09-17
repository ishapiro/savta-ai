export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware on server-side for now, let client handle auth
  if (process.server) {
    return
  }
  
  const user = useSupabaseUser()
  
  // If user is not authenticated, redirect to login
  if (!user.value) {
    console.log('[MIDDLEWARE] admin.js - No user, redirecting to login')
    return navigateTo('/app/login')
  }
  
  // Check if user has editor or admin role
  const db = useDatabase()
  try {
    console.log('[MIDDLEWARE] admin.js - Checking profile for user:', user.value?.email)
    const profile = await db.getCurrentProfile()
    console.log('[MIDDLEWARE] admin.js profile:', profile)
    
    if (!profile || (profile.role !== 'editor' && profile.role !== 'admin')) {
      console.warn('[MIDDLEWARE] admin.js access denied. Profile:', profile)
      // Redirect to memory books if not editor or admin
      return navigateTo('/app/memory-books')
    }
    console.log('[MIDDLEWARE] admin.js access granted. Profile:', profile)
  } catch (error) {
    console.error('[MIDDLEWARE] Error checking admin role:', error)
    // Redirect to memory books on error
    return navigateTo('/app/memory-books')
  }
}) 