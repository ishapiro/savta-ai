<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
    <!-- Hero Section - Mobile Optimized -->
    <div class="w-full px-4 sm:px-6 lg:px-8 pt-8 pb-10 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-100">
      <div class="max-w-2xl mx-auto text-center mb-12">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tight">
          Memories Don’t Keep Themselves
        </h1>
        <h2 class="italic text-xl sm:text-2xl lg:text-3xl text-purple-700 font-medium mb-4">
          That’s What Savta’s For
        </h2>
        <div class="flex items-center justify-center gap-2 mb-2 text-sm text-gray-600">
          <span class="flex items-center gap-1">
            <span class="text-yellow-500">⭐</span>
            <span>Join 1,000+ families</span>
          </span>
          <span>•</span>
          <span>Free to start</span>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
      
      <!-- Left side - Chunked content for mobile -->
      <div class="space-y-6">
        <!-- Problem Statement -->
        <div class="bg-blue-50 rounded-xl p-4 sm:p-6">
          <div class="flex items-start gap-3">
            <span class="text-2xl">📱</span>
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">Got Photos Everywhere?</h3>
              <p class="text-sm sm:text-base text-gray-700 leading-relaxed">
                Thousands of photos scattered across your phone, computer, and that old tablet you forgot about?
              </p>
            </div>
          </div>
        </div>

        <!-- Solution Statement -->
        <div class="bg-purple-50 rounded-xl p-4 sm:p-6">
          <div class="flex items-start gap-3">
            <span class="text-2xl">✨</span>
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">I'm Your Digital Grandma</h3>
              <p class="text-sm sm:text-base text-gray-700 leading-relaxed">
                I actually understand technology (shocking, I know)! I turn your digital chaos into beautiful memory cards and books.
              </p>
            </div>
          </div>
        </div>

        <!-- Value Props - Bullet Points -->
        <div class="space-y-3">
          <h3 class="font-semibold text-gray-900 text-lg">What I Do For You:</h3>
          <div class="space-y-2">
            <div class="flex items-center gap-3">
              <span class="text-pink-500 text-lg">🎯</span>
              <span class="text-sm sm:text-base text-gray-700">Pick the perfect photos automatically</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-pink-500 text-lg">✍️</span>
              <span class="text-sm sm:text-base text-gray-700">Write stories that capture the moment</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-pink-500 text-lg">🎨</span>
              <span class="text-sm sm:text-base text-gray-700">Design beautiful layouts you'll love</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-pink-500 text-lg">📤</span>
              <span class="text-sm sm:text-base text-gray-700">Make it easy to share with family</span>
            </div>
          </div>
        </div>

        <!-- Call to Action -->
        <div class="bg-pink-50 rounded-xl p-4 sm:p-6 text-center lg:text-left">
          <h3 class="font-semibold text-gray-900 mb-2">Ready to Get Started?</h3>
          <p class="text-sm sm:text-base text-gray-700 mb-4">
            Turn your digital chaos into something your grandchildren will actually want to look at!
          </p>
        </div>
      </div>
      
      <!-- Right side - Streamlined CTA -->
      <div class="flex flex-col items-center lg:items-start space-y-6">
        <div class="text-center lg:text-left space-y-4">
          <h2 class="text-2xl sm:text-3xl font-semibold text-gray-900">
            Create Your First Memory Card
          </h2>
          <p class="text-gray-600 text-sm sm:text-base max-w-md lg:max-w-none">
            Beautiful results in just 2-3 minutes. No design skills needed!
          </p>
        </div>
        
        <!-- Primary CTA Button -->
        <Button
          label="Start Creating Now"
          class="w-full sm:w-auto bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          @click="openMagicMemoryDialog('quick')"
        />
        
        <!-- Trust Indicators -->
        <div class="text-center lg:text-left space-y-2">
          <p class="text-sm text-gray-500">
            ✨ Just enter your email • No credit card required
          </p>
          <p class="text-sm text-gray-500">
            🎨 AI-powered • Beautiful designs
          </p>
        </div>
      </div>
    </div>
    
    <!-- Bottom section - Simplified for mobile -->
    <div class="mt-12 pt-8 border-t border-gray-200">
      <h3 class="text-center font-semibold text-gray-900 mb-6">How It Works</h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div class="text-center space-y-2">
          <div class="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto">
            <span class="text-xl">📸</span>
          </div>
          <h4 class="font-medium text-gray-900 text-sm">Upload Photos</h4>
          <p class="text-xs text-gray-600">Drop in your favorite moments</p>
        </div>
        
        <div class="text-center space-y-2">
          <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
            <span class="text-xl">✨</span>
          </div>
          <h4 class="font-medium text-gray-900 text-sm">AI Magic</h4>
          <p class="text-xs text-gray-600">I organize everything</p>
        </div>
        
        <div class="text-center space-y-2">
          <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <span class="text-xl">💝</span>
          </div>
          <h4 class="font-medium text-gray-900 text-sm">Beautiful Results</h4>
          <p class="text-xs text-gray-600">Shareable memory cards</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

definePageMeta({
  layout: 'home-page'
})

// Enhanced flow: Check if user is authenticated, then check for approved photos
const openMagicMemoryDialog = async (buttonType = 'quick') => {
  const { useSupabaseUser } = await import('~/composables/useSupabase')
  const user = useSupabaseUser()
  
  console.log('[HOME] openMagicMemoryDialog called, user authenticated:', !!user.value)
  
  if (!user.value) {
    // User not signed up, redirect to signup first with origin in localStorage
    console.log('[HOME] User not authenticated, redirecting to signup with origin=home')
    localStorage.setItem('auth_origin', 'home')
    await navigateTo('/app/signup')
  } else {
    // User is signed up, check if they have approved photos
    console.log('[HOME] User authenticated, checking for approved photos')
    try {
      const { useDatabase } = await import('~/composables/useDatabase')
      const db = useDatabase()
      const assets = await db.assets.getAssets({ approved: true })
      const hasApprovedPhotos = assets && assets.length > 0
      
      console.log('[HOME] Found approved photos:', hasApprovedPhotos, 'count:', assets?.length || 0)
      
      if (hasApprovedPhotos) {
        // User has approved photos, go directly to magic memory dialog
        console.log('[HOME] User has approved photos, going to memory books with dialog')
        await navigateTo('/app/memory-books?openDialog=quick')
      } else {
        // User has no approved photos, go to upload dialog first
        console.log('[HOME] User has no approved photos, going to memory books with upload dialog')
        await navigateTo('/app/memory-books?openUploadDialog=true')
      }
    } catch (error) {
      console.error('[HOME] Error checking assets:', error)
      // Fallback: go to memory books page and let it handle the flow
      await navigateTo('/app/memory-books')
    }
  }
}

// Auto-check flow when page loads (for users coming from signup/login)
onMounted(async () => {
  const { useSupabaseUser } = await import('~/composables/useSupabase')
  const user = useSupabaseUser()
  
  console.log('[HOME] onMounted - checking flow, user authenticated:', !!user.value)
  
  // Only auto-check if user is authenticated
  if (user.value) {
    console.log('[HOME] onMounted - user authenticated, checking flow')
    
    // Check if user came from signup/login (has auth_origin in localStorage)
    const authOrigin = localStorage.getItem('auth_origin')
    console.log('[HOME] onMounted - auth_origin from localStorage:', authOrigin)
    
    if (authOrigin === 'home') {
      console.log('[HOME] onMounted - user came from signup/login, checking for approved photos')
      
      try {
        const { useDatabase } = await import('~/composables/useDatabase')
        const db = useDatabase()
        const assets = await db.assets.getAssets({ approved: true })
        const hasApprovedPhotos = assets && assets.length > 0
        
        console.log('[HOME] onMounted - Found approved photos:', hasApprovedPhotos, 'count:', assets?.length || 0)
        
        // Clear the auth_origin since we're handling it now
        localStorage.removeItem('auth_origin')
        
        if (hasApprovedPhotos) {
          // User has approved photos, go directly to magic memory dialog
          console.log('[HOME] onMounted - User has approved photos, redirecting to memory books with dialog')
          await navigateTo('/app/memory-books?openDialog=quick')
        } else {
          // User has no approved photos, go to upload dialog first
          console.log('[HOME] onMounted - User has no approved photos, redirecting to memory books with upload dialog')
          await navigateTo('/app/memory-books?openUploadDialog=true')
        }
      } catch (error) {
        console.error('[HOME] onMounted - Error checking assets:', error)
        // Clear auth_origin and stay on home page
        localStorage.removeItem('auth_origin')
      }
    } else {
      console.log('[HOME] onMounted - no auth_origin found, staying on home page')
    }
  }
})
</script> 