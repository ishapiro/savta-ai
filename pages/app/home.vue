<template>
  <div class="min-h-screen flex flex-col bg-brand-background relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute top-20 left-4 sm:left-20 w-20 sm:w-32 h-20 sm:h-32 bg-brand-highlight/20 rounded-full blur-xl animate-pulse-slow"></div>
      <div class="absolute top-40 right-8 sm:right-32 w-16 sm:w-24 h-16 sm:h-24 bg-brand-accent/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 1s;"></div>
      <div class="absolute bottom-32 left-1/3 w-24 sm:w-40 h-24 sm:h-40 bg-brand-secondary/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 2s;"></div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 w-full flex-1 flex flex-col justify-center">
      <div class="w-full px-4 sm:px-[10px] lg:px-[15px] py-6 sm:py-6 lg:py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-center">
          <!-- Left Column: Hero Content (2/3 width) -->
          <div class="lg:col-span-2 space-y-6 sm:space-y-8 animate-fade-in-left">
            <!-- Main Headline -->
            <div class="space-y-6">
              <div class="space-y-3">
                <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-brand-secondary leading-tight tracking-tight">
                  Turn photos into <span class="text-brand-highlight">beautiful memory cards</span>
                </h1>
                <p class="text-xl text-brand-primary/80 leading-relaxed max-w-2xl">
                  Our AI picks your best moments, writes heartwarming captions, and designs stunning cards—all automatically. No design skills needed.
                </p>
              </div>
            </div>

            <!-- How It Works -->
            <div class="space-y-4">
              <h2 class="text-2xl font-bold text-brand-secondary">How it works</h2>
              <div class="space-y-3">
                <div class="flex items-start gap-4">
                  <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-highlight/20 flex items-center justify-center">
                    <span class="text-lg">🎯</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-brand-secondary mb-1">Upload & Select</h3>
                    <p class="text-sm text-brand-primary/70">Share photos from your phone, computer, or cloud storage</p>
                  </div>
                </div>
                <div class="flex items-start gap-4">
                  <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-secondary/20 flex items-center justify-center">
                    <span class="text-lg">✨</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-brand-secondary mb-1">AI Creates Magic</h3>
                    <p class="text-sm text-brand-primary/70">We pick the best photos, write captions, and design beautiful layouts</p>
                  </div>
                </div>
                <div class="flex items-start gap-4">
                  <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-accent/20 flex items-center justify-center">
                    <span class="text-lg">📤</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-brand-secondary mb-1">Share or Print</h3>
                    <p class="text-sm text-brand-primary/70">Send digitally or we'll print and mail them to your loved ones</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- CTA Button -->
            <div class="flex flex-col items-center sm:items-start">
              <Button
                label="Get Started"
                class="bg-brand-header hover:bg-brand-secondary text-white rounded-lg py-4 px-8 text-lg font-semibold border-0 transition-colors w-full sm:w-auto"
                @click="openMagicMemoryDialog('quick')"
              />
              <p class="text-sm text-brand-primary/70 mt-3 flex items-center gap-2">
                <span>Takes under 3 minutes</span>
                <span>🤞</span>
              </p>
            </div>
          </div>

          <!-- Right Column: Feature Cards (1/3 width) -->
          <div class="hidden lg:flex lg:flex-col gap-4 animate-fade-in-right" style="animation-delay: 0.2s;">
            <!-- Feature Card 1 -->
            <div class="bg-white/50 backdrop-blur-sm rounded-xl border border-brand-navigation/20 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div class="text-3xl mb-3">📱</div>
              <h3 class="font-semibold text-brand-secondary text-sm mb-2">Photos Everywhere</h3>
              <p class="text-xs text-brand-primary/70 leading-relaxed">Find your best moments from phone, computer & cloud</p>
            </div>

            <!-- Feature Card 2 -->
            <div class="bg-white/50 backdrop-blur-sm rounded-xl border border-brand-navigation/20 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div class="text-3xl mb-3">🎨</div>
              <h3 class="font-semibold text-brand-secondary text-sm mb-2">Design Auto-Done</h3>
              <p class="text-xs text-brand-primary/70 leading-relaxed">Beautiful layouts created automatically for you</p>
            </div>

            <!-- Feature Card 3 -->
            <div class="bg-white/50 backdrop-blur-sm rounded-xl border border-brand-navigation/20 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div class="text-3xl mb-3">✍️</div>
              <h3 class="font-semibold text-brand-secondary text-sm mb-2">Captions Included</h3>
              <p class="text-xs text-brand-primary/70 leading-relaxed">AI writes heartwarming captions that tell your story</p>
            </div>
          </div>
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
      // Check for memory books
      const books = await db.memoryBooks.getMemoryBooks()
      console.log('books', books)
      if (books && books.length > 0) {
        await navigateTo('/app/memory-books')
      } else {
        // No memory books, navigate to memory books page (will auto-handle dialog)
        await navigateTo('/app/memory-books')
      }
    } catch (error) {
      // Fallback: navigate to memory books page if error
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
          await navigateTo('/app/memory-books')
        } else {
          await navigateTo('/app/memory-books')
        }
      } catch (error) {
        localStorage.removeItem('auth_origin')
      }
    }
  }
})
</script> 