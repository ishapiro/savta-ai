export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()
  
  // Allow access to auth pages regardless of authentication status
  if (to.path === '/app/login' || to.path === '/app/signup' || to.path === '/app/confirm') {
    return
  }
  
  // If user is not authenticated and trying to access protected route
  if (!user.value && to.path.startsWith('/app/')) {
    return navigateTo('/app/login')
  }
  
  // If user is authenticated and trying to access auth pages, redirect to app dashboard
  if (user.value && (to.path === '/app/login' || to.path === '/app/signup' || to.path === '/app/confirm')) {
    return navigateTo('/app/dashboard')
  }
}) 