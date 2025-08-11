<template>
  <div class="h-screen flex items-center justify-center bg-brand-background relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute top-20 left-4 sm:left-20 w-20 sm:w-32 h-20 sm:h-32 bg-brand-highlight/20 rounded-full blur-xl animate-pulse-slow"></div>
      <div class="absolute top-40 right-8 sm:right-32 w-16 sm:w-24 h-16 sm:h-24 bg-brand-secondary/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 1s;"></div>
      <div class="absolute bottom-32 left-1/3 w-24 sm:w-40 h-24 sm:h-40 bg-brand-header/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 2s;"></div>
      <div class="absolute top-1/2 right-8 sm:right-20 w-12 sm:w-20 h-12 sm:h-20 bg-brand-accent/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 0.5s;"></div>
    </div>

    <!-- Confirmation Dialog -->
    <Dialog 
      v-model:visible="visible" 
      modal 
      :closable="false" 
      :dismissableMask="true" 
      :style="{ width: '100vw', maxWidth: '600px', maxHeight: '100vh' }" 
      class="z-10"
      @hide="onDialogHide"
    >
      <!-- Main Content -->
      <div class="text-center mb-3 w-full">
        <div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
          <span class="text-2xl">{{ isNewUser ? '🎉' : '✅' }}</span>
        </div>
        <h1 class="text-xl sm:text-2xl font-bold text-brand-primary mb-1">
          {{ isNewUser ? 'Welcome to Savta!' : 'Welcome Back!' }}
        </h1>
        <p class="text-sm sm:text-base text-brand-primary/80 max-w-2xl mx-auto">
          {{ isNewUser ? 'Thank you for joining! You can now start creating beautiful memory cards to share with your family.' : 'You are now signed in and ready to continue sharing family memories.' }}
        </p>
      </div>

      <!-- User Information Card -->
      <div v-if="user" class="bg-brand-navigation/20 rounded-lg p-2 sm:p-3 mb-2 w-full">
        <h3 class="text-sm font-semibold text-brand-secondary mb-1 flex items-center">
            <span class="text-brand-secondary mr-2">👤</span>
            Your Account Details
          </h3>
          <div class="space-y-1">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between">
              <span class="text-brand-primary/70 font-medium text-xs">Email Address:</span>
              <span class="text-brand-primary font-mono text-xs sm:text-sm">{{ user.email }}</span>
            </div>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between">
              <span class="text-brand-primary/70 font-medium text-xs">Account Status:</span>
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="isUserDisabled ? 'bg-red-100 text-red-800' : 'bg-brand-highlight/20 text-brand-highlight'">
                <span class="w-2 h-2 rounded-full mr-1"
                      :class="isUserDisabled ? 'bg-red-400' : 'bg-brand-highlight'"></span>
                {{ isUserDisabled ? 'Disabled' : (isNewUser ? 'New Account' : 'Active') }}
              </span>
            </div>
            <div v-if="isUserDisabled" class="text-center my-4">
              <span class="block font-bold text-2xl text-red-600">Your account has been disabled.</span>
              <span class="block font-semibold text-lg text-brand-primary mt-2">Please contact customer support for more information.</span>
            </div>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between">
              <span class="text-brand-primary/70 font-medium text-xs">Signup Date:</span>
              <span class="text-brand-primary text-xs sm:text-sm">{{ formatDate(user.created_at) }}</span>
            </div>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between">
              <span class="text-brand-primary/70 font-medium text-xs">Last Sign In:</span>
              <span class="text-brand-primary text-xs sm:text-sm">{{ formatDate(user.last_sign_in_at) }}</span>
            </div>
            <div v-if="user.user_metadata" class="flex flex-col sm:flex-row sm:items-center justify-between">
              <span class="text-brand-primary/70 font-medium text-xs">Provider:</span>
              <span class="text-brand-primary capitalize text-xs sm:text-sm">{{ user.app_metadata?.provider || 'Email' }}</span>
            </div>
          </div>
        </div>

      <!-- Hide Next Steps if user is disabled -->
      <div v-if="!isUserDisabled" class="bg-brand-highlight/10 rounded-lg p-2 sm:p-3 mb-2 w-full">
        <h3 class="text-sm font-semibold text-brand-highlight mb-1 flex items-center">
            <span class="text-brand-highlight mr-2">💝</span>
            Ready to Get Started?
          </h3>
          <ul class="space-y-1 text-brand-highlight/80 text-xs">
            <li class="flex items-start">
              <span class="text-brand-highlight mr-2 mt-1">•</span>
              <span>Upload your family photos</span>
            </li>
            <li class="flex items-start">
              <span class="text-brand-highlight mr-2 mt-1">•</span>
              <span>Create your first memory card</span>
            </li>
            <li class="flex items-start">
              <span class="text-brand-highlight mr-2 mt-1">•</span>
              <span>Share beautiful memories with loved ones</span>
            </li>
          </ul>
        </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-2 justify-center w-full">
        <Button
          v-if="!isUserDisabled"
          label="Create My First Memory Card"
          class="bg-brand-header hover:bg-brand-secondary text-white px-4 py-2 rounded-lg font-semibold text-sm"
          @click="goToDashboard"
        />
        <Button
          v-else
          label="Continue"
          class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold text-sm"
          @click="logoutAndRedirect"
        />
      </div>
    </Dialog>
  </div>
</template>

<script setup>
// Set the layout for this page
definePageMeta({
  layout: 'default',
  ssr: false
})

import { useSupabaseUser } from '~/composables/useSupabase'

// Get Supabase user data
const supabase = useNuxtApp().$supabase
const user = useSupabaseUser()

// Get origin from localStorage
const origin = process.client ? localStorage.getItem('auth_origin') || 'dashboard' : 'dashboard'
console.log('[CONFIRM] Origin from localStorage:', origin)
console.log('[CONFIRM] Full URL:', process.client ? window.location.href : 'SSR')

// Watch for user state changes
watchEffect(() => {
  console.log('[CONFIRM] User state changed:', { user: !!user.value, origin })
  
  // If user becomes available and we have an origin, we can proceed
  if (user.value && origin) {
    console.log('[CONFIRM] User authenticated with origin, ready to proceed')
  }
})


// Dialog state
const visible = ref(true)

// Computed property to determine if this is a new user
const isNewUser = computed(() => {
  if (!user.value) return false
  
  // Check if the user was created recently (within the last few minutes)
  const createdDate = new Date(user.value.created_at)
  const now = new Date()
  const timeDiff = now.getTime() - createdDate.getTime()
  const minutesDiff = timeDiff / (1000 * 60)
  
  // If account was created within the last 5 minutes, consider it a new user
  return minutesDiff < 5
})

// Format date helper function
const formatDate = (dateString) => {
  if (!dateString) return 'Not available'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Invalid date'
  }
}

// Navigation functions
const goToDashboard = () => {
  visible.value = false
  console.log('[CONFIRM] goToDashboard called, origin:', origin)
  
  if (origin === 'home') {
    console.log('[CONFIRM] Redirecting to home page for enhanced flow')
    navigateTo('/app/home')
  } else {
    console.log('[CONFIRM] Redirecting to dashboard')
    navigateTo('/app/dashboard')
  }
}

const goToAbout = () => {
  visible.value = false
  navigateTo('/about')
}

const onDialogHide = () => {
  // When dialog is closed, navigate based on origin
  console.log('[CONFIRM] onDialogHide called, origin:', origin)
  
  if (origin === 'home') {
    console.log('[CONFIRM] Dialog hide - redirecting to home page for enhanced flow')
    navigateTo('/app/home')
  } else {
    console.log('[CONFIRM] Dialog hide - redirecting to dashboard')
    navigateTo('/app/dashboard')
  }
}

const isUserDisabled = ref(false)

const checkUserDisabled = async () => {
  if (user.value) {
    // Fetch the user profile from the backend
    const res = await fetch(`/api/users/${user.value.id}/info`)
    const profile = await res.json()
    console.log('[CONFIRM] Profile:', profile)
    if (profile.deleted) {
      isUserDisabled.value = true
    }
  }
}

const logoutAndRedirect = async () => {
  await supabase.auth.signOut()
  navigateTo('/app/login')
}

// Handle OAuth callback and user state
onMounted(async () => {
  console.log('[CONFIRM] onMounted - checking OAuth callback')
  
  try {
    // Wait for session to be established
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Check if this is an OAuth callback
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error getting session:', error)
      // Don't redirect immediately on error, give it more time
      setTimeout(() => {
        if (!user.value) {
          console.log('[CONFIRM] No user after error, redirecting to login')
          navigateTo('/app/login')
        }
      }, 3000)
      return
    }
    
    console.log('[CONFIRM] Session check result:', { session: !!session, user: !!user.value })
    
    // If no session after a longer delay, redirect to login
    if (!session && !user.value) {
      setTimeout(() => {
        if (!user.value) {
          console.log('[CONFIRM] No session or user after delay, redirecting to login')
          navigateTo('/app/login')
        }
      }, 3000)
    }
    await checkUserDisabled()
  } catch (error) {
    console.error('[CONFIRM] Error in onMounted:', error)
    // Don't redirect on error, let the page handle it gracefully
  }
})
</script>

<style scoped>
.animate-pulse-slow {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
</style> 