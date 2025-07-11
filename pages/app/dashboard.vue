<template>
  <div class="max-w-full sm:max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 sm:py-8">
    <div class="text-center mb-8 sm:mb-12">
      <h2 class="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Getting Started</h2>
      <p class="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
        Using a bit of AI Magic dust, create beautiful Savta Cards ready for sharing with family and friends.
      </p>
    </div>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      <!-- Photo Upload Card -->
      <div 
        class="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg p-6 sm:p-8 border border-blue-200 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
        @click="handleCardClick('upload')"
      >
        <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <span class="text-2xl sm:text-3xl">📸</span>
        </div>
        <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-3">Upload Memories</h3>
        <p class="text-gray-700 text-sm sm:text-base leading-relaxed mb-4">
          Upload your photos, thoughts, and memories. Our AI automatically adds compelling captions and classifies each memory with smart tags.
        </p>
        <div class="space-y-2">
          <div class="flex items-center gap-2 text-sm text-blue-700">
            <i class="pi pi-tag text-blue-500"></i>
            <span>Smart classification & tagging</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-blue-700">
            <i class="pi pi-comments text-blue-500"></i>
            <span>AI-generated compelling captions</span>
          </div>
        </div>
      </div>
      
      <!-- AI Generation Card -->
      <div 
        class="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl shadow-lg p-6 sm:p-8 border border-purple-200 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
        @click="handleCardClick('ai')"
      >
        <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <span class="text-2xl sm:text-3xl">✨</span>
        </div>
        <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-3">AI Magic</h3>
        <p class="text-gray-700 text-sm sm:text-base leading-relaxed mb-4">
          Our AI uses your tags and captions to organize memories into beautiful cards with custom backgrounds perfect for sharing.
        </p>
        <div class="space-y-2">
          <div class="flex items-center gap-2 text-sm text-purple-700">
            <i class="pi pi-image text-purple-500"></i>
            <span>AI-generated beautiful backgrounds</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-purple-700">
            <i class="pi pi-th-large text-purple-500"></i>
            <span>Stunning organized memory cards</span>
          </div>
        </div>
      </div>
      
      <!-- Monthly Delivery Card -->
      <div 
        class="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-lg p-6 sm:p-8 border border-green-200 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
        @click="handleCardClick('monthly')"
      >
        <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <span class="text-2xl sm:text-3xl">💌</span>
        </div>
        <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-3">Share & Deliver</h3>
        <p class="text-gray-700 text-sm sm:text-base leading-relaxed mb-4">
          Choose your frequency and share digitally or send traditional printed cards to the people you love.
        </p>
        <div class="space-y-2">
          <div class="flex items-center gap-2 text-sm text-green-700">
            <i class="pi pi-share-alt text-green-500"></i>
            <span>Digital sharing options</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-green-700">
            <i class="pi pi-print text-green-500"></i>
            <span>Traditional printed cards</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- <div class="mt-8 text-center">
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
    </div> -->

    <!-- Authentication Dialog -->
    <Dialog 
      v-model:visible="showAuthDialog" 
      modal 
      :closable="true"
      :dismissable-mask="true"
      class="w-full max-w-md mx-auto"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
            <i class="pi pi-heart text-pink-500 text-lg"></i>
          </div>
          <h3 class="text-xl font-semibold text-gray-900">Join the Family</h3>
        </div>
      </template>
      
      <div class="text-center py-4">
        <div class="mb-6">
          <h4 class="text-lg font-medium text-gray-900 mb-3">Create Your First Memory Book</h4>
          <p class="text-gray-600 leading-relaxed">
            Start preserving your precious family moments with AI-powered scrapbooks. 
            Create an account to begin your journey of capturing and sharing beautiful memories.
          </p>
        </div>
        
        <div class="space-y-3">
          <button
            @click="navigateToSignup"
            class="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Create Account
          </button>
          
          <div class="text-sm text-gray-500">
            Already have an account? 
            <button 
              @click="navigateToLogin"
              class="text-pink-500 hover:text-pink-600 font-medium underline"
            >
              Sign in now
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { useSupabaseUser } from '~/composables/useSupabase'
import { watchEffect, ref } from 'vue'

const user = useSupabaseUser()
const showAuthDialog = ref(false)

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

function handleCardClick(cardType) {
  console.log('[Dashboard] Card clicked:', cardType, 'User:', user.value)
  
  if (!user.value) {
    // Show authentication dialog for non-authenticated users
    showAuthDialog.value = true
    return
  }
  
  // Handle navigation for authenticated users
  switch (cardType) {
    case 'upload':
      navigateTo('/app/upload')
      break
    case 'ai':
      navigateTo('/app/memory-books')
      break
    case 'monthly':
      navigateTo('/app/monthly-delivery')
      break
    default:
      console.warn('Unknown card type:', cardType)
  }
}

function navigateToSignup() {
  showAuthDialog.value = false
  navigateTo('/app/signup')
}

function navigateToLogin() {
  showAuthDialog.value = false
  navigateTo('/app/login')
}
</script> 