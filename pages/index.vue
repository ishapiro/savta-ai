<template>
  <div class="min-h-screen flex flex-col bg-brand-background relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute top-20 left-4 sm:left-20 w-20 sm:w-32 h-20 sm:h-32 bg-brand-highlight/20 rounded-full blur-xl animate-pulse-slow"></div>
      <div class="absolute top-40 right-8 sm:right-32 w-16 sm:w-24 h-16 sm:h-24 bg-brand-accent/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 1s;"></div>
      <div class="absolute bottom-32 left-1/3 w-24 sm:w-40 h-24 sm:h-40 bg-brand-secondary/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 2s;"></div>
    </div>

    <!-- Restricted Release Overlay -->
    <div v-if="showRestrictedOverlay" class="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div class="bg-brand-background rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-brand-secondary mb-2">🚀 Restricted Release</h1>
          <p class="text-brand-primary/80 text-sm">Savta.ai is currently in exclusive early access. Enter the insider code to continue.</p>
        </div>

        <form @submit.prevent="handleRestrictedAccess" class="space-y-4">
          <InputText
            v-model="restrictedCode"
            type="password"
            placeholder="Enter insider code"
            class="w-full py-3 px-4 text-center tracking-widest"
            @keyup.enter="handleRestrictedAccess"
          />
          <div v-if="restrictedError" class="text-red-500 text-sm text-center">
            {{ restrictedError }}
          </div>
          <Button
            type="submit"
            label="Continue"
            class="w-full bg-brand-header hover:bg-brand-secondary text-white py-3 font-semibold border-0 transition-colors"
          />
        </form>

        <p class="text-xs text-brand-primary/60 text-center">
          Don't have a code? <a href="https://savta.ai" target="_blank" class="text-brand-secondary hover:text-brand-header">Join the waitlist</a>
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 w-full flex-1 flex flex-col justify-center" v-if="!showRestrictedOverlay">
      <div class="w-full px-1 sm:px-[5px] lg:px-[8px]">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-center">
          <!-- Left Column: Hero Content (2/3 width) -->
          <div class="lg:col-span-2 space-y-8 animate-fade-in-left">
            <!-- Main Headline -->
            <div class="space-y-6">
              <div class="space-y-4">
                <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-brand-secondary leading-tight tracking-tight">
                  Craft special memories <span class="text-brand-highlight">without the fuss</span>
                </h1>
                <p class="text-xl text-brand-primary/80 leading-relaxed max-w-2xl">
                  Savta.ai is not another photo printing service. We handle the creative work for you—no dragging, no dropping, no design skills needed. Upload photos, we write beautiful captions, design stunning cards, and mail them to your loved ones. It's that simple.
                </p>
              </div>

              <div class="inline-block">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-700 border border-red-200">
                  <span class="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                  Limited Early Access
                </span>
              </div>
            </div>

            <!-- What Makes Us Different -->
            <div class="space-y-4">
              <h2 class="text-2xl font-bold text-brand-secondary">Why Savta is different</h2>
              <div class="space-y-3">
                <div class="flex items-start gap-4">
                  <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-highlight/20 flex items-center justify-center">
                    <span class="text-lg">✨</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-brand-secondary mb-1">AI Writes Your Story</h3>
                    <p class="text-sm text-brand-primary/70">Savta writes heartwarming captions and stories about your photos—capturing the feeling, not just the moment</p>
                  </div>
                </div>
                <div class="flex items-start gap-4">
                  <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-secondary/20 flex items-center justify-center">
                    <span class="text-lg">🎨</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-brand-secondary mb-1">No Design Work</h3>
                    <p class="text-sm text-brand-primary/70">Layouts, colors, and designs are all done for you. Zero dragging photos around</p>
                  </div>
                </div>
                <div class="flex items-start gap-4">
                  <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-accent/20 flex items-center justify-center">
                    <span class="text-lg">📬</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-brand-secondary mb-1">Beautiful in Your Hands</h3>
                    <p class="text-sm text-brand-primary/70">Professionally printed memory cards delivered to grandparents, parents, and loved ones who treasure them</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- CTA Button -->
            <div>
              <Button
                label="Get Started"
                class="bg-brand-header hover:bg-brand-secondary text-white rounded-lg py-4 px-8 text-lg font-semibold border-0 transition-colors"
                @click="openMagicMemoryDialog('quick')"
              />
              <p class="text-sm text-brand-primary/70 mt-3 flex items-center gap-2">
                <span>Takes under 3 minutes</span>
                <span>🤞</span>
              </p>
            </div>
          </div>

          <!-- Right Column: Feature Highlight (1/3 width) -->
          <div class="hidden lg:flex lg:flex-col gap-4 animate-fade-in-right" style="animation-delay: 0.2s;">
            <!-- Feature Card 1 -->
            <div class="bg-white/50 backdrop-blur-sm rounded-xl border border-brand-navigation/20 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div class="text-3xl mb-3">📸</div>
              <h3 class="font-semibold text-brand-secondary text-sm mb-2">Simple Upload</h3>
              <p class="text-xs text-brand-primary/70 leading-relaxed">Share photos from your phone, computer, or cloud</p>
            </div>

            <!-- Feature Card 2 -->
            <div class="bg-white/50 backdrop-blur-sm rounded-xl border border-brand-navigation/20 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div class="text-3xl mb-3">✍️</div>
              <h3 class="font-semibold text-brand-secondary text-sm mb-2">AI Creativity</h3>
              <p class="text-xs text-brand-primary/70 leading-relaxed">We write captions, pick photos, and design everything</p>
            </div>

            <!-- Feature Card 3 -->
            <div class="bg-white/50 backdrop-blur-sm rounded-xl border border-brand-navigation/20 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div class="text-3xl mb-3">🎁</div>
              <h3 class="font-semibold text-brand-secondary text-sm mb-2">Beautiful Delivery</h3>
              <p class="text-xs text-brand-primary/70 leading-relaxed">Premium printed cards mailed to loved ones</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'landing-page'
})

const showRestrictedOverlay = ref(false)
const restrictedCode = ref('')
const restrictedError = ref('')

// Check if restricted access should be shown
const checkRestrictedAccess = async () => {
  // Check if user has already granted access via sessionStorage
  if (process.client && sessionStorage.getItem('restricted-access-granted') === 'true') {
    showRestrictedOverlay.value = false
    return
  }

  // Check if user is authenticated - bypass overlay for authenticated users (e.g., OAuth redirect)
  const { useSupabaseUser } = await import('~/composables/useSupabase')
  const user = useSupabaseUser()
  if (user.value) {
    showRestrictedOverlay.value = false
    return
  }

  // Check if we should show restricted overlay (use environment variable to disable)
  const config = useRuntimeConfig()
  const enableRestricted = config.public.enableRestrictedRelease !== 'false'
  
  if (enableRestricted) {
    showRestrictedOverlay.value = true
  }
}

const handleRestrictedAccess = async () => {
  const config = useRuntimeConfig()
  const correctCode = config.public.insidersPassword || ''
  
  if ((restrictedCode.value || '').toLowerCase() === (correctCode || '').toLowerCase()) {
    restrictedError.value = ''
    if (process.client) {
      sessionStorage.setItem('restricted-access-granted', 'true')
    }
    showRestrictedOverlay.value = false
  } else {
    restrictedError.value = 'Invalid code. Please try again.'
    restrictedCode.value = ''
  }
}

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
      const books = await db.memoryBooks.getMemoryBooks()
      if (books && books.length > 0) {
        await navigateTo('/app/memory-books')
      } else {
        await navigateTo('/app/memory-books')
      }
    } catch (error) {
      await navigateTo('/app/memory-books')
    }
  }
}

onMounted(async () => {
  await checkRestrictedAccess()

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