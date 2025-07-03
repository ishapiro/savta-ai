export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  // If user is not authenticated and trying to access protected route
  if (!user.value && to.path.startsWith('/app')) {
    // Check if user has insiders access via session storage
    const hasInsidersAccess = process.client ? sessionStorage.getItem('insiders-access') === 'true' : false
    
    if (!hasInsidersAccess) {
      return navigateTo('/app/login')
    }
  }

  // If user is authenticated and trying to access auth pages
  if (user.value && (to.path === '/app/login' || to.path === '/app/signup')) {
    return navigateTo('/app')
  }
}) 