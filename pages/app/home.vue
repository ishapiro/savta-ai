<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
    <!-- Hero Section - Mobile Optimized -->
    <div class="text-center lg:text-left mb-8 lg:mb-12">
      <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
        Your Family's 
        <span class="text-pink-500">Memory Assistant</span>
      </h1>
      
      <!-- Social Proof - Above the fold on mobile -->
      <div class="flex items-center justify-center lg:justify-start gap-2 mb-6 text-sm text-gray-600">
        <span class="flex items-center gap-1">
          <span class="text-yellow-500">⭐</span>
          <span>Join 1,000+ families</span>
        </span>
        <span class="hidden sm:inline">•</span>
        <span class="hidden sm:inline">Free to start</span>
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
definePageMeta({
  layout: 'home-page'
})

// Check if user is authenticated, if not redirect to signup, then open magic memory dialog
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
    // User is signed up, go directly to memory books with dialog
    console.log('[HOME] User authenticated, going to memory books with dialog')
    await navigateTo('/app/memory-books?openDialog=quick')
  }
}
</script> 