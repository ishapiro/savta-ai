export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  
  // If user is not authenticated, redirect to login
  if (!user.value) {
    return navigateTo('/login')
  }
  
  // Check if user has editor or admin role
  const db = useDatabase()
  try {
    const profile = await db.getCurrentProfile()
    console.log('[MIDDLEWARE] editor.js profile:', profile)
    
    if (!profile || (profile.role !== 'editor' && profile.role !== 'admin')) {
      console.warn('[MIDDLEWARE] editor.js access denied. Profile:', profile)
      // Redirect to app dashboard if not editor or admin
      return navigateTo('/app/dashboard')
    }
    console.log('[MIDDLEWARE] editor.js access granted. Profile:', profile)
  } catch (error) {
    console.error('[MIDDLEWARE] Error checking editor role:', error)
    // Redirect to app dashboard on error
    return navigateTo('/app/dashboard')
  }
}) 