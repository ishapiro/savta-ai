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
      <div class="w-full px-1 sm:px-2 lg:px-3 xl:px-4 py-6 sm:py-6 lg:py-8">
        <!-- Compact Top Section: Logo + Headline -->
        <div class="mb-4 sm:mb-6">
          <!-- Logo -->
          <div class="flex items-center justify-center mb-3 sm:mb-4 animate-fade-in">
            <img src="/savta_image_only_color.svg" alt="Savta AI" class="h-12 sm:h-14 lg:h-16 w-auto" />
          </div>
          
          <!-- Headline -->
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center text-brand-secondary leading-tight tracking-tight animate-fade-in">
            Photos Come In. <br class="sm:hidden" />Beautiful Cards <span class="text-brand-highlight">Go Out. Automatically.</span>
          </h1>
          
          <!-- Subheadline -->
          <p class="text-center text-sm sm:text-base text-brand-primary/70 mt-2 px-4">
            Family texts photos OR you upload them—Savta does everything else
          </p>
        </div>

        <!-- Main Grid: Content + Card -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-start">
          <!-- Left Column: Description + CTA (2/3 width) -->
          <div class="lg:col-span-2 space-y-4 sm:space-y-4 animate-fade-in-left">
            <!-- Short Description -->
            <p class="text-xs sm:text-sm text-brand-primary/80 leading-loose">
              Not a DIY tool. AI handles design and delivery. You just collect photos.
            </p>

            <!-- Quick Benefits -->
            <div class="space-y-2">
              <div class="flex items-start gap-2">
                <span class="text-brand-highlight font-bold text-lg mt-0.5">📤💬</span>
                <p class="text-xs sm:text-sm text-brand-primary/70"><strong>Collect photos two ways:</strong> Upload from any device OR family texts them to Savta (no app needed)</p>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-brand-secondary font-bold text-lg mt-0.5">🤖</span>
                <p class="text-xs sm:text-sm text-brand-primary/70"><strong>AI curates and designs automatically:</strong> Best photos selected, layouts created, no design skills needed</p>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-brand-accent font-bold text-lg mt-0.5">✨</span>
                <p class="text-xs sm:text-sm text-brand-primary/70"><strong>Heartwarming captions written by AI:</strong> Personal stories generated from your family's memories</p>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-brand-highlight font-bold text-lg mt-0.5">📬</span>
                <p class="text-xs sm:text-sm text-brand-primary/70"><strong>Auto-delivered to loved ones:</strong> Share digitally or printed and mailed—completely automatic</p>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-brand-primary font-bold text-lg mt-0.5">⏱️</span>
                <p class="text-xs sm:text-sm text-brand-primary/70"><strong>Set it and forget it:</strong> Create once or set up recurring deliveries (monthly, quarterly, holidays)</p>
              </div>
            </div>

            <!-- Differentiator Box -->
            <div class="bg-brand-accent/10 border border-brand-accent/20 rounded-lg p-4 space-y-2">
              <p class="font-semibold text-brand-secondary text-sm">
                Why Savta vs. Shutterfly or iPhone collage apps?
              </p>
              <ul class="text-xs text-brand-primary/70 space-y-1.5 ml-1">
                <li class="flex items-start gap-2">
                  <span class="text-brand-highlight mt-0.5">✅</span>
                  <span><strong>Family can TEXT photos</strong> (no app, no login, no nagging)</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-brand-highlight mt-0.5">✅</span>
                  <span><strong>AI designs everything</strong> (no dragging, no layout decisions)</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-brand-highlight mt-0.5">✅</span>
                  <span><strong>Auto-delivered</strong> (no project management)</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-brand-highlight mt-0.5">✅</span>
                  <span><strong>Recurring option</strong> (monthly cards without lifting a finger)</span>
                </li>
              </ul>
            </div>

            <!-- CTA + Badge (Mobile/Tablet only) -->
            <div class="lg:hidden flex flex-col items-center sm:items-start gap-3 pt-2">
              <Button
                label="Create Your First Card"
                class="bg-brand-header hover:bg-brand-secondary text-white rounded-lg py-3 px-8 text-base font-semibold border-0 transition-colors w-full sm:w-auto"
                @click="openMagicMemoryDialog('quick')"
              />
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
                Early Access
              </span>
            </div>
          </div>

          <!-- Right Column: Sample Memory Card Stack (1/3 width) -->
          <div class="lg:col-span-1 hidden lg:flex lg:flex-col lg:items-center lg:justify-start animate-fade-in-right gap-6" style="animation-delay: 0.2s;">
            <!-- Stacked memory cards visual - 7:5 aspect ratio -->
            <div class="relative" style="width: 240px; height: 172px;">
              <!-- Back card -->
              <div class="absolute top-3 left-2 bg-white rounded-lg shadow-lg border border-brand-navigation/10 transform -rotate-3 opacity-40 overflow-hidden" style="width: 220px; height: 157px;">
                <img src="/sample-memory-card-v2.jpg" alt="Memory card" class="w-full h-full object-contain bg-white" />
              </div>
              
              <!-- Middle card -->
              <div class="absolute top-2 left-1 bg-white rounded-lg shadow-xl border border-brand-navigation/10 transform -rotate-1 opacity-60 overflow-hidden" style="width: 220px; height: 157px;">
                <img src="/sample-memory-card-v2.jpg" alt="Memory card" class="w-full h-full object-contain bg-white" />
              </div>
              
              <!-- Front card -->
              <div class="absolute top-0 left-0 bg-white rounded-lg shadow-2xl border border-brand-navigation/20 overflow-hidden" style="width: 220px; height: 157px;">
                <img src="/sample-memory-card-v2.jpg" alt="Sample memory card created by Savta" class="w-full h-full object-contain bg-white" />
              </div>
            </div>

            <!-- CTA + Badge (Desktop only) -->
            <div class="flex flex-col items-center gap-3">
              <Button
                label="Create Your First Card"
                class="bg-brand-header hover:bg-brand-secondary text-white rounded-lg py-3 px-8 text-base font-semibold border-0 transition-colors w-full"
                @click="openMagicMemoryDialog('quick')"
              />
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
                Early Access
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Loading Spinner Overlay -->
    <div v-if="isLoading" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="flex flex-col items-center gap-4">
        <div class="relative w-16 h-16">
          <svg class="animate-spin h-16 w-16 text-brand-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p class="text-white font-semibold">Loading your memories...</p>
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
const isLoading = ref(false)

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

// Enhanced flow: Check if user is authenticated, then navigate
const openMagicMemoryDialog = async (buttonType = 'quick') => {
  isLoading.value = true
  
  const { useSupabaseUser } = await import('~/composables/useSupabase')
  const user = useSupabaseUser()
  
  if (!user.value) {
    localStorage.setItem('auth_origin', 'home')
    isLoading.value = false
    await navigateTo('/app/signup')
  } else {
    // Navigate immediately to memory-books page without waiting for data
    // The memory-books page will lazy load the content
    await navigateTo('/app/memory-books')
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