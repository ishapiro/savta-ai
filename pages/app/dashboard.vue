<template>
  <div class="max-w-full sm:max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 sm:py-8">
    <div class="text-center mb-8 sm:mb-12">
      <h2 class="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Your Savta Scrapbook Dashboard</h2>
      <p class="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
        Create beautiful weekly scrapbooks from your photos and memories with AI assistance.
      </p>
    </div>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
      <!-- Feature Cards -->
      <div class="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
        <div class="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
          <span class="text-xl sm:text-2xl">📸</span>
        </div>
        <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Photo Upload</h3>
        <p class="text-gray-600 text-sm sm:text-base">Upload your photos, thoughts, and memories and let AI organize them into beautiful layouts.</p>
      </div>
      <div class="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
        <div class="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
          <span class="text-xl sm:text-2xl">🤖</span>
        </div>
        <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">AI Generation</h3>
        <p class="text-gray-600 text-sm sm:text-base">Our AI creates engaging content and captions for your family memories.</p>
      </div>
      <div class="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
        <div class="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
          <span class="text-xl sm:text-2xl">📧</span>
        </div>
        <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Monthly Delivery</h3>
        <p class="text-gray-600 text-sm sm:text-base">Beautiful memories delivered to your family every month.</p>
      </div>
    </div>
    
    <div class="mt-8 text-center">
      <button
        :class="[
          'flex items-center justify-center gap-2 font-bold rounded-full px-8 py-3 text-lg shadow transition-all duration-200 w-full max-w-xs sm:max-w-md mx-auto',
          user === null
            ? 'bg-gray-300 text-white opacity-60 cursor-not-allowed'
            : 'bg-green-500 hover:bg-green-600 text-white cursor-pointer'
        ]"
        @click="handleGetStarted"
        :disabled="user === null"
        :aria-disabled="user === null"
      >
        <i :class="['pi pi-book text-2xl', user === null ? '' : 'animate-bounce']"></i>
        Get Started
      </button>
    </div>
  </div>
</template>

<script setup>
import { useSupabaseUser } from '~/composables/useSupabase'
import { watchEffect } from 'vue'

const user = useSupabaseUser()

definePageMeta({
  layout: 'default'
})

const { hasInsidersAccess, checkInsidersAccess } = useInsidersAccess()

onMounted(() => {
  checkInsidersAccess()
  console.log('Dashboard mounted, insiders access:', hasInsidersAccess.value)
})

watchEffect(() => {
  console.log('[Dashboard] watchEffect user:', user)
  console.log('[Dashboard] watchEffect user.value:', user?.value)
})

const handleSignOut = async () => {
  try {
    console.log('Starting sign out process...')
    console.log('Current user state:', user.value ? 'Authenticated' : 'Not authenticated')
    if (user.value) {
      console.log('Signing out from Supabase...')
      const { error } = await useNuxtApp().$supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
      } else {
        console.log('Successfully signed out from Supabase')
      }
    } else {
      console.log('No authenticated user to sign out')
    }
    console.log('Clearing insiders access...')
    const { clearInsidersAccess } = useInsidersAccess()
    clearInsidersAccess()
    await new Promise(resolve => setTimeout(resolve, 100))
    console.log('Navigating to dashboard...')
    navigateTo('/app/dashboard')
  } catch (err) {
    console.error('Sign out error:', err)
    const { clearInsidersAccess } = useInsidersAccess()
    clearInsidersAccess()
    navigateTo('/app/dashboard')
  }
}

async function handleGetStarted() {
  console.log('[Dashboard] handleGetStarted user:', user)
  console.log('[Dashboard] handleGetStarted user.value:', user.value)
  if (user.value) {
    console.log('[Dashboard] Navigating to /app/upload')
    await navigateTo('/app/upload')
    console.log('[Dashboard] Navigation to /app/upload complete')
  } else {
    console.log('[Dashboard] Navigating to /app/login')
    await navigateTo('/app/login')
    console.log('[Dashboard] Navigation to /app/login complete')
  }
}
</script> 