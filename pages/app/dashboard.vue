<template>
  <!-- <div class="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4"> -->
  <div class="min-h-screen bg-brand-background p-4">
    <div class="max-w-7xl mx-auto">
    <!-- Guest Mode Warning Banner -->
    <div v-if="isGuestMode" class="mb-6 bg-brand-highlight/20 border border-brand-header/30 rounded-lg p-4">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <AlertTriangle class="w-5 h-5 text-brand-header" />
        </div>
        <div class="flex-1">
          <h3 class="text-sm font-medium text-brand-subheader mb-1">Guest Mode</h3>
          <p class="text-sm text-brand-text mb-3">
            We detected an issue with your login session. You're viewing the dashboard in guest mode. 
            Please <button @click="navigateToLogin" class="text-brand-subheader underline font-medium">sign in again</button> to access all features.
          </p>
          <button 
            @click="clearGuestMode"
            class="text-xs bg-brand-highlight/30 hover:bg-brand-highlight/50 text-brand-subheader px-3 py-1 rounded border border-brand-header/30 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>

    <div class="text-center mb-8 sm:mb-12">
      <h2 class="text-h1 text-brand-subheader mb-2 sm:mb-4">Savta Special Memory Home</h2>
      <p class="text-base sm:text-xl text-brand-text max-w-4xl mx-auto">
        Using a bit of AI to create beautiful Savta Special Memories ready for sharing with family and friends.
      </p>
    </div>
    
    <!-- Primary Action: Create Special Memories -->
    <div class="mb-8 sm:mb-12">
      <div class="text-center mb-6">
        <h3 class="text-h2 text-brand-subheader mb-3 tracking-tight">✨ Get Started ✨</h3>
        <p class="text-base sm:text-lg text-brand-text font-medium">Begin your special journey here</p>
      </div>
      
      <div 
        class="bg-gradient-to-br from-brand-highlight/20 via-brand-header/10 to-brand-navigation/20 rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-12 border-2 border-brand-header/30 hover:shadow-3xl hover:scale-[1.02] transition-all duration-500 cursor-pointer group relative overflow-hidden"
        @click="handleCardClick('ai')"
      >
        <!-- Animated background elements -->
        <div class="absolute inset-0 opacity-10">
          <div class="absolute top-4 left-4 w-8 h-8 bg-brand-header rounded-full animate-ping"></div>
          <div class="absolute top-8 right-8 w-6 h-6 bg-brand-navigation rounded-full animate-ping" style="animation-delay: 0.5s;"></div>
          <div class="absolute bottom-8 left-8 w-4 h-4 bg-brand-highlight rounded-full animate-ping" style="animation-delay: 1s;"></div>
          <div class="absolute bottom-4 right-4 w-6 h-6 bg-brand-subheader rounded-full animate-ping" style="animation-delay: 1.5s;"></div>
        </div>
        
        <div class="relative z-10">
          <div class="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <!-- Left Column (2/3 width) -->
            <div class="lg:w-2/3 text-center lg:text-left">
              <div class="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-brand-header to-brand-subheader rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Wand2 class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
              </div>
              <h3 class="text-h1 text-brand-subheader mb-4 tracking-tight leading-tight">Capture a Special Memory</h3>
              <p class="text-brand-text text-lg sm:text-xl leading-relaxed mb-6 max-w-2xl font-medium">
                Our AI organizes your moments (photos and posts) into beautiful Memory Cards and Books with custom backgrounds perfect for sharing.
              </p>
            </div>
            
            <!-- Right Column (1/3 width) -->
            <div class="lg:w-1/3 flex items-center justify-center">
              <div class="space-y-2 w-full max-w-xs ml-12 md:ml-0 -mt-4 lg:mt-0">
                <div class="flex items-center gap-3 text-brand-subheader">
                  <div class="w-8 h-8 bg-brand-highlight/30 rounded-lg flex items-center justify-center">
                    <Image class="w-4 h-4 text-brand-header" />
                  </div>
                  <span class="font-semibold text-sm sm:text-base">Beautiful backgrounds</span>
                </div>
                <div class="flex items-center gap-3 text-brand-subheader">
                  <div class="w-8 h-8 bg-brand-highlight/30 rounded-lg flex items-center justify-center">
                    <Grid class="w-4 h-4 text-brand-header" />
                  </div>
                  <span class="font-semibold text-sm sm:text-base">Organized memories</span>
                </div>
                <div class="flex items-center gap-3 text-brand-subheader">
                  <div class="w-8 h-8 bg-brand-highlight/30 rounded-lg flex items-center justify-center">
                    <Sparkles class="w-4 h-4 text-brand-header" />
                  </div>
                  <span class="font-semibold text-sm sm:text-base">AI-powered memories</span>
                </div>
                <div class="flex items-center gap-3 text-brand-subheader">
                  <div class="w-8 h-8 bg-brand-highlight/30 rounded-lg flex items-center justify-center">
                    <Share2 class="w-4 h-4 text-brand-header" />
                  </div>
                  <span class="font-semibold text-sm sm:text-base">Ready to share</span>
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
        <h3 class="text-h2 text-brand-subheader mb-3 tracking-tight">Other Actions</h3>
        <p class="text-base sm:text-lg text-brand-text font-medium">Additional tools to enhance your experience</p>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <!-- Photo Upload Card -->
        <div 
          class="bg-gradient-to-br from-brand-navigation/10 to-brand-navigation/20 rounded-xl shadow-lg p-6 sm:p-8 border border-brand-navigation/30 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
          @click="handleCardClick('upload')"
        >
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-brand-navigation to-brand-subheader rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Camera class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <h3 class="text-h3 text-brand-subheader mb-4 tracking-tight">Upload Moments</h3>
          <p class="text-brand-text text-base sm:text-lg leading-relaxed mb-6 font-medium">
            Upload your photos and memories. Our AI adds captions and smart tags automatically.
          </p>
          <div class="space-y-2">
            <div class="flex items-center gap-3 text-sm sm:text-base text-brand-subheader">
              <Tag class="w-4 h-4 text-brand-navigation" />
              <span class="font-semibold">Smart Tagging</span>
            </div>
            <div class="flex items-center gap-3 text-sm sm:text-base text-brand-subheader">
              <MessageCircle class="w-4 h-4 text-brand-navigation" />
              <span class="font-semibold">Automatic AI Generated Captions</span>
            </div>
              <div class="flex items-center gap-3 text-sm sm:text-base text-brand-subheader">
                <FileText class="w-4 h-4 text-brand-navigation" />
                <span class="font-semibold">Add Text Based Moments</span>
              </div>
          </div>
        </div>
        
        <!-- Review Memories Card -->
        <div 
          class="bg-gradient-to-br from-brand-highlight/20 to-brand-header/10 rounded-xl shadow-lg p-6 sm:p-8 border border-brand-header/30 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
          @click="handleCardClick('review')"
        >
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-brand-header to-brand-highlight rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Edit class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <h3 class="text-h3 text-brand-subheader mb-4 tracking-tight">Review Moments</h3>
          <p class="text-brand-text text-base sm:text-lg leading-relaxed mb-6 font-medium">
            Review and refine your moments. Approve or reject AI suggestions, edit captions, and add keywords.
          </p>
          <div class="space-y-2">
            <div class="flex items-center gap-3 text-sm sm:text-base text-brand-subheader">
              <CheckCircle class="w-4 h-4 text-brand-header" />
              <span class="font-semibold">Approve/reject photos shared via email</span>
            </div>
            <div class="flex items-center gap-3 text-sm sm:text-base text-brand-subheader">
              <Edit class="w-4 h-4 text-brand-header" />
              <span class="font-semibold">Edit captions and tags</span>
            </div>
            <div class="flex items-center gap-3 text-sm sm:text-base text-brand-subheader">
              <Tag class="w-4 h-4 text-brand-header" />
              <span class="font-semibold">Crop and Adjust Photos</span>
            </div>
          </div>
        </div>
        
        <!-- Monthly Delivery Card -->
        <div 
          class="bg-gradient-to-br from-brand-subheader/10 to-brand-subheader/20 rounded-xl shadow-lg p-6 sm:p-8 border border-brand-subheader/30 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
          @click="handleCardClick('monthly')"
        >
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-brand-subheader to-brand-navigation rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Send class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <h3 class="text-h3 text-brand-subheader mb-4 tracking-tight">Share & Deliver</h3>
          <p class="text-brand-text text-base sm:text-lg leading-relaxed mb-6 font-medium">
            Share digitally or send printed cards to the people you love.
          </p>
          <div class="space-y-2">
            <div class="flex items-center gap-3 text-sm sm:text-base text-brand-subheader">
              <Share2 class="w-4 h-4 text-brand-navigation" />
              <span class="font-semibold">Digital sharing</span>
            </div>
            <div class="flex items-center gap-3 text-sm sm:text-base text-brand-subheader">
              <Printer class="w-4 h-4 text-brand-navigation" />
              <span class="font-semibold">Printed cards</span>
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
          <h3 class="text-xl font-semibold text-brand-subheader">Join the Family</h3>
        </div>
      </template>
      
      <div class="text-center py-4">
        <div class="mb-6">
          <h4 class="text-lg font-medium text-brand-subheader mb-3">Create Your First Savta Special Memory</h4>
          <p class="text-brand-text leading-relaxed">
            Start preserving your precious family moments with Savta Special Cards and Books. 
            Create an account to begin your journey of capturing and sharing beautiful memories.
          </p>
        </div>
        
        <div class="space-y-3">
          <button
            @click="navigateToSignup"
            class="w-full bg-brand-header hover:bg-brand-subheader text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Create Account
          </button>
          
          <div class="text-sm text-brand-text">
            Already have an account? 
            <button 
              @click="navigateToLogin"
              class="text-brand-header hover:text-brand-subheader font-medium underline"
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