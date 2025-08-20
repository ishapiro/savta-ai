<template>
  <!-- <div class="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4"> -->
  <div class="min-h-screen bg-brand-background shadow-sm border-b border-gray-200 p-4">
    <div class="max-w-7xl mx-auto">
    <!-- Guest Mode Warning Banner -->
    <div v-if="isGuestMode" class="mb-6 bg-brand-highlight/20 border border-brand-header/30 rounded-lg p-4">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <AlertTriangle class="w-5 h-5 text-brand-header" />
        </div>
        <div class="flex-1">
          <h3 class="text-sm font-medium text-brand-secondary mb-2 sm:mb-1">Guest Mode</h3>
          <p class="text-sm text-brand-primary mb-4 sm:mb-3">
            We detected an issue with your login session. You're viewing the dashboard in guest mode. 
            Please <button @click="navigateToLogin" class="text-brand-secondary underline font-medium">sign in again</button> to access all features.
          </p>
          <button 
            @click="clearGuestMode"
            class="text-sm bg-brand-highlight/30 hover:bg-brand-highlight/50 text-brand-secondary px-4 py-2 rounded border border-brand-header/30 transition-colors min-h-[44px]"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>

    <div class="text-center mb-8 sm:mb-12">
      <h2 class="text-2xl sm:text-h1 text-brand-header mb-3 sm:mb-4">Create Memory Cards</h2>
      <p class="text-base sm:text-xl text-brand-primary max-w-4xl mx-auto px-4 sm:px-0">
        Turn your photos into beautiful memory cards. Perfect for mailing to family members or sharing digitally.
      </p>
    </div>
    
    <!-- Primary Action: Create Special Memories -->
    <div class="mb-8 sm:mb-12">
      
      <div 
        class="bg-gradient-to-br from-brand-highlight/20 via-brand-header/10 to-brand-navigation/20 rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-12 border-2 border-brand-header/30 hover:shadow-3xl hover:scale-[1.02] transition-all duration-500 cursor-pointer group relative overflow-hidden"
        @click="handleCardClick('ai')"
      >
        <!-- Animated background elements -->
        <div class="absolute inset-0 opacity-10">
          <div class="absolute top-4 left-4 w-8 h-8 bg-brand-header rounded-full animate-ping"></div>
          <div class="absolute top-8 right-8 w-6 h-6 bg-brand-navigation rounded-full animate-ping" style="animation-delay: 0.5s;"></div>
          <div class="absolute bottom-8 left-8 w-4 h-4 bg-brand-highlight rounded-full animate-ping" style="animation-delay: 1s;"></div>
          <div class="absolute bottom-4 right-4 w-6 h-6 bg-brand-secondary rounded-full animate-ping" style="animation-delay: 1.5s;"></div>
        </div>
        
        <div class="relative z-10">
          <div class="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <!-- Left Column (2/3 width) -->
            <div class="lg:w-2/3 text-center lg:text-left">
              <div class="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-brand-header to-brand-secondary rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Wand2 class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
              </div>
              <h3 class="text-xl sm:text-h1 text-brand-secondary mb-4 tracking-tight leading-tight">Create a Memory Card</h3>
              <p class="text-brand-primary text-base sm:text-xl leading-relaxed mb-6 max-w-2xl font-medium">
                I'll pick your best photos, write heartwarming captions, and design beautiful layouts for you.
                Just upload your pictures and I'll create a stunning memory card that's perfect for mailing or sharing digitally.
              </p>
            </div>
            
            <!-- Right Column (1/3 width) -->
            <div class="lg:w-1/3 flex items-center justify-center">
              <div class="space-y-3 sm:space-y-2 w-full max-w-xs ml-0 md:ml-0 -mt-4 lg:mt-0">
                <div class="flex items-center gap-3 text-brand-secondary">
                  <div class="w-8 h-8 bg-brand-highlight/30 rounded-lg flex items-center justify-center">
                    <Image class="w-4 h-4 text-brand-header" />
                  </div>
                  <span class="font-semibold text-sm sm:text-base">Beautiful designs</span>
                </div>
                <div class="flex items-center gap-3 text-brand-secondary">
                  <div class="w-8 h-8 bg-brand-highlight/30 rounded-lg flex items-center justify-center">
                    <Grid class="w-4 h-4 text-brand-header" />
                  </div>
                  <span class="font-semibold text-sm sm:text-base">Perfect layouts</span>
                </div>
                <div class="flex items-center gap-3 text-brand-secondary">
                  <div class="w-8 h-8 bg-brand-highlight/30 rounded-lg flex items-center justify-center">
                    <Sparkles class="w-4 h-4 text-brand-header" />
                  </div>
                  <span class="font-semibold text-sm sm:text-base">Heartwarming stories</span>
                </div>
                <div class="flex items-center gap-3 text-brand-secondary">
                  <div class="w-8 h-8 bg-brand-highlight/30 rounded-lg flex items-center justify-center">
                    <Share2 class="w-4 h-4 text-brand-header" />
                  </div>
                  <span class="font-semibold text-sm sm:text-base">Ready to mail or share</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Secondary Actions -->
    <div class="mb-8">
      <div class="text-center mb-6">
        <h3 class="text-xl sm:text-h2 text-brand-secondary mb-3 tracking-tight">Manage Your Photos</h3>
        <p class="text-base sm:text-lg text-brand-primary font-medium px-4 sm:px-0">Upload, review, and organize your photos</p>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <!-- Photo Upload Card -->
        <div 
          class="bg-gradient-to-br from-brand-accent/20 to-brand-accent/10 rounded-xl shadow-lg p-6 sm:p-8 border border-brand-accent/30 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group min-h-[280px] sm:min-h-0"
          @click="handleCardClick('upload')"
        >
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-brand-accent to-brand-header rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Camera class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <h3 class="text-lg sm:text-h3 text-brand-secondary mb-4 tracking-tight">Add Photos</h3>
          <p class="text-brand-primary text-sm sm:text-lg leading-relaxed mb-6 font-medium">
            Upload photos from your phone, computer, or social media. I'll add captions and organize them for you.
          </p>
          <div class="space-y-3 sm:space-y-2">
            <div class="flex items-center gap-3 text-sm sm:text-base text-brand-secondary">
              <Tag class="w-4 h-4 text-brand-header" />
              <span class="font-semibold">Smart Tagging</span>
            </div>
            <div class="flex items-center gap-3 text-sm sm:text-base text-brand-secondary">
              <MessageCircle class="w-4 h-4 text-brand-header" />
              <span class="font-semibold">Automatic captions</span>
            </div>
              <div class="flex items-center gap-3 text-sm sm:text-base text-brand-secondary">
                <FileText class="w-4 h-4 text-brand-header" />
                <span class="font-semibold">Add Text Based Moments</span>
              </div>
          </div>
        </div>
        
        <!-- Review Memories Card -->
        <div 
          class="bg-gradient-to-br from-brand-warm/30 to-brand-warm/20 rounded-xl shadow-lg p-6 sm:p-8 border border-brand-warm/40 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group min-h-[280px] sm:min-h-0"
          @click="handleCardClick('review')"
        >
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-brand-secondary to-brand-highlight rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Edit class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <h3 class="text-lg sm:text-h3 text-brand-secondary mb-4 tracking-tight">Review Photos</h3>
          <p class="text-brand-primary text-sm sm:text-lg leading-relaxed mb-6 font-medium">
            Review and approve your photos. Edit captions, crop photos, and organize your collection.
          </p>
          <div class="space-y-3 sm:space-y-2">
            <div class="flex items-center gap-3 text-sm sm:text-base text-brand-secondary">
              <CheckCircle class="w-4 h-4 text-brand-header" />
              <span class="font-semibold">Approve/reject photos shared via email</span>
            </div>
            <div class="flex items-center gap-3 text-sm sm:text-base text-brand-secondary">
              <Edit class="w-4 h-4 text-brand-header" />
              <span class="font-semibold">Edit captions and tags</span>
            </div>
            <div class="flex items-center gap-3 text-sm sm:text-base text-brand-secondary">
              <Tag class="w-4 h-4 text-brand-header" />
              <span class="font-semibold">Crop and Adjust Photos</span>
            </div>
          </div>
        </div>
        
        <!-- Monthly Delivery Card -->
        <div 
          class="bg-gradient-to-br from-brand-highlight/20 to-brand-highlight/10 rounded-xl shadow-lg p-6 sm:p-8 border border-brand-highlight/30 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group min-h-[280px] sm:min-h-0"
          @click="handleCardClick('monthly')"
        >
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-brand-highlight to-brand-header rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Send class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <h3 class="text-lg sm:text-h3 text-brand-secondary mb-4 tracking-tight">Download & Share</h3>
          <p class="text-brand-primary text-sm sm:text-lg leading-relaxed mb-6 font-medium">
            Download your memory cards as PDFs to mail or share digitally with family and friends.
          </p>
          <div class="space-y-3 sm:space-y-2">
            <div class="flex items-center gap-3 text-sm sm:text-base text-brand-secondary">
              <Share2 class="w-4 h-4 text-brand-header" />
              <span class="font-semibold">Digital sharing</span>
            </div>
            <div class="flex items-center gap-3 text-sm sm:text-base text-brand-secondary">
              <Printer class="w-4 h-4 text-brand-header" />
              <span class="font-semibold">Print & mail</span>
            </div>
          </div>
        </div>
      </div>
    </div>

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
          <div class="w-10 h-10 bg-brand-highlight/30 rounded-full flex items-center justify-center">
            <Heart class="w-5 h-5 text-brand-header" />
          </div>
          <h3 class="text-xl font-semibold text-brand-secondary">Create Your Account</h3>
        </div>
      </template>
      
      <div class="text-center py-4">
        <div class="mb-6">
          <h4 class="text-lg font-medium text-brand-secondary mb-3">Start Creating Memory Cards</h4>
          <p class="text-brand-primary leading-relaxed">
            Create an account to start sharing beautiful memory cards with your family. 
            I'll help you pick the best moments and create stunning designs for you.
          </p>
        </div>
        
        <div class="space-y-3">
          <button
            @click="navigateToSignup"
            class="w-full bg-brand-header hover:bg-brand-secondary text-white font-semibold py-4 sm:py-3 px-6 rounded-lg transition-colors duration-200 min-h-[48px] sm:min-h-0"
          >
            Create Account
          </button>
          
          <div class="text-sm text-brand-primary">
            Already have an account? 
            <button 
              @click="navigateToLogin"
              class="text-brand-header hover:text-brand-secondary font-medium underline"
            >
              Sign in now
            </button>
          </div>
        </div>
      </div>
    </Dialog>
    </div>
  </div>
</template>

<script setup>
import { useSupabaseUser } from '~/composables/useSupabase'
import { watchEffect, ref } from 'vue'
import { 
  Wand2, 
  Sparkles, 
  Image, 
  Grid, 
  Share2, 
  BookOpen, 
  ArrowRight, 
  Camera, 
  Tag, 
  MessageCircle, 
  FileText,
  Upload, 
  Edit, 
  CheckCircle, 
  Eye, 
  Send, 
  Printer, 
  Heart, 
  AlertTriangle 
} from 'lucide-vue-next'

const user = useSupabaseUser()
const showAuthDialog = ref(false)
const isGuestMode = ref(false)

definePageMeta({
  layout: 'default'
})

const { hasInsidersAccess, checkInsidersAccess } = useInsidersAccess()

onMounted(() => {
  checkInsidersAccess()
  console.log('Dashboard mounted, insiders access:', hasInsidersAccess.value)
  
  // Check for guest mode
  if (process.client) {
    isGuestMode.value = sessionStorage.getItem('guestMode') === 'true'
  }
})

watchEffect(() => {
  console.log('[Dashboard] watchEffect user:', user)
  console.log('[Dashboard] watchEffect user.value:', user?.value)
})

const clearGuestMode = () => {
  if (process.client) {
    sessionStorage.removeItem('guestMode')
    isGuestMode.value = false
  }
}

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
  
  if (!user.value || isGuestMode.value) {
    // Show authentication dialog for non-authenticated users or guest mode
    showAuthDialog.value = true
    return
  }
  
  // Handle navigation for authenticated users
  switch (cardType) {
    case 'upload':
      navigateTo('/app/upload')
      break
    case 'review':
      navigateTo('/app/review')
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
  // Clear guest mode when going to login
  clearGuestMode()
  navigateTo('/app/login')
}
</script> 