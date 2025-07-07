export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  
  // If user is not authenticated, redirect to login
  if (!user.value) {
    return navigateTo('/login')
  }
  
  // Check if user has admin role
  const db = useDatabase()
  try {
    const profile = await db.getCurrentProfile()
    
    if (!profile || profile.role !== 'admin') {
      // Redirect to app dashboard if not admin
      return navigateTo('/app/dashboard')
    }
  } catch (error) {
    console.error('Error checking admin role:', error)
    // Redirect to app dashboard on error
    return navigateTo('/app/dashboard')
  }
}) 