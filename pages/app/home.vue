<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-100">
    <!-- Hero Section -->
    <div class="w-full px-4 sm:px-6 lg:px-8 pt-10 pb-8 text-center">
      <div class="max-w-3xl mx-auto">
        <h1 class="font-extrabold text-gray-900 mb-4 tracking-tight leading-normal">
          <span class="block text-left text-4xl sm:text-5xl lg:text-6xl mb-2">Your best moments.</span>
          <span class="block text-right text-lg sm:text-xl lg:text-2xl text-pink-600 mb-2">Sharable, printable,</span>
          <span class="block text-center text-2xl sm:text-3xl lg:text-4xl text-purple-700">fridge-worthy.</span>
        </h1>
      </div>
      <h2 class="italic text-base sm:text-lg lg:text-xl text-purple-700 font-medium mb-6 leading-snug">
        Savta helps you turn your favorite photos and memories<br />
        into something you can hold, display, or share. All in minutes.
      </h2>
      <Button
        label="Let's Do This"
        class="w-full sm:w-auto bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 mb-3"
        @click="openMagicMemoryDialog('quick')"
      />
      <div class="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-gray-600 mb-2">
        <span class="flex items-center gap-1">
          <span class="text-yellow-500">⭐</span>
          <span>Join 1,000+ families</span>
        </span>
        <span class="hidden sm:inline">•</span>
        <span>Free to start</span>
      </div>
    </div>

    <!-- Value Props / Features -->
    <div class="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 px-4 mb-10">
      <div class="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
        <span class="text-2xl">📱</span>
        <div>
          <h3 class="font-semibold text-gray-900 mb-2">Got Photos Everywhere?</h3>
          <p class="text-sm sm:text-base text-gray-700 leading-relaxed">
            Thousands of photos scattered across your phone, computer, and that old tablet you forgot about?
          </p>
        </div>
      </div>
      <div class="bg-purple-50 rounded-xl p-4 flex items-start gap-3">
        <span class="text-2xl">✨</span>
        <div>
          <h3 class="font-semibold text-gray-900 mb-2">I'm Your Digital Grandma</h3>
          <p class="text-sm sm:text-base text-gray-700 leading-relaxed">
            I actually understand technology (shocking, I know)! I turn your digital chaos into beautiful memory cards and books.
          </p>
        </div>
      </div>
      <div class="bg-pink-50 rounded-xl p-4 flex items-start gap-3 col-span-1 sm:col-span-2">
        <div class="flex flex-col gap-2 w-full">
          <h3 class="font-semibold text-gray-900 text-lg mb-1">What I Do For You:</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
      </div>
    </div>

    <!-- How It Works -->
    <div class="max-w-4xl mx-auto mt-8 pt-8 border-t border-gray-200 px-4">
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
  
  if (!user.value) {
    localStorage.setItem('auth_origin', 'home')
    await navigateTo('/app/signup')
  } else {
    try {
      const { useDatabase } = await import('~/composables/useDatabase')
      const db = useDatabase()
      const assets = await db.assets.getAssets({ approved: true })
      const hasApprovedPhotos = assets && assets.length > 0
      if (hasApprovedPhotos) {
        await navigateTo('/app/memory-books?openDialog=quick')
      } else {
        await navigateTo('/app/memory-books?openUploadDialog=true')
      }
    } catch (error) {
      await navigateTo('/app/memory-books')
    }
  }
}

onMounted(async () => {
  const { useSupabaseUser } = await import('~/composables/useSupabase')
  const user = useSupabaseUser()
  if (user.value) {
    const authOrigin = localStorage.getItem('auth_origin')
    if (authOrigin === 'home') {
      try {
        const { useDatabase } = await import('~/composables/useDatabase')
        const db = useDatabase()
        const assets = await db.assets.getAssets({ approved: true })
        const hasApprovedPhotos = assets && assets.length > 0
        localStorage.removeItem('auth_origin')
        if (hasApprovedPhotos) {
          await navigateTo('/app/memory-books?openDialog=quick')
        } else {
          await navigateTo('/app/memory-books?openUploadDialog=true')
        }
      } catch (error) {
        localStorage.removeItem('auth_origin')
      }
    }
  }
})
</script> 