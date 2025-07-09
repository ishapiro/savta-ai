export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()
  const { hasInsidersAccess } = useInsidersAccess()
  
  // Allow access to auth pages regardless of authentication status
  if (to.path === '/app/login' || to.path === '/app/signup' || to.path === '/app/confirm') {
    return
  }
  
  // Allow access to dashboard for users with insiders access or full authentication
  if (to.path === '/app/dashboard') {
    if (user.value || hasInsidersAccess.value) {
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