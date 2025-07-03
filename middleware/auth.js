export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()
  
  // Only check insiders access on client side to avoid hydration mismatches
  const insiders = process.client ? sessionStorage.getItem('insiders-access') === 'true' : false

  // Allow access to login, signup, and confirm pages if not authenticated
  // (confirm page is for OAuth callbacks)
  if (!user.value && ['/app/login', '/app/signup', '/app/confirm'].includes(to.path)) {
    return
  }

  // If user is authenticated and tries to access login/signup, redirect to /app
  if (user.value && ['/app/login', '/app/signup'].includes(to.path)) {
    return navigateTo('/app')
  }

  // Only redirect on client side to avoid hydration issues
  if (process.client) {
    // If not insiders and not authenticated, redirect to landing for /app routes
    // But exclude confirm page from this check
    if (!insiders && !user.value && to.path.startsWith('/app') && to.path !== '/app/confirm') {
      return navigateTo('/')
    }

    // If insiders and tries to go to landing, redirect to /app
    if (insiders && to.path === '/') {
      return navigateTo('/app')
    }
  }
}) 