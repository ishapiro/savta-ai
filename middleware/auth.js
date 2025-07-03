export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()
  const insiders = process.client ? sessionStorage.getItem('insiders-access') === 'true' : false

  console.log('[AUTH MW] Route:', to.path, '| User:', !!user.value, '| Insiders:', insiders)

  // Allow access to login and signup if not authenticated
  if (!user.value && ['/app/login', '/app/signup'].includes(to.path)) {
    console.log('[AUTH MW] Allowing access to', to.path, '- not authenticated')
    return
  }

  // If not insiders and not authenticated, redirect to landing for /app routes
  if (!insiders && !user.value && to.path.startsWith('/app')) {
    console.log('[AUTH MW] Redirecting to / - not insiders and not authenticated')
    return navigateTo('/')
  }

  // If user is authenticated and tries to access login/signup, redirect to /app
  if (user.value && ['/app/login', '/app/signup'].includes(to.path)) {
    console.log('[AUTH MW] Redirecting to /app - already authenticated')
    return navigateTo('/app')
  }

  // If insiders and tries to go to landing, redirect to /app
  if (insiders && to.path === '/') {
    console.log('[AUTH MW] Redirecting to /app - insiders access, landing page')
    return navigateTo('/app')
  }

  // Log when no redirect occurs
  console.log('[AUTH MW] No redirect, access allowed to', to.path)
}) 