<template>
  <!-- <div class="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4"> -->
  <div class="min-h-screen bg-brand-background shadow-sm border-b border-gray-200 p-4 no-zoom">
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

    <!-- How Savta.ai Works - Visual Process Flow -->
    <div class="mb-12 sm:mb-16">
        <div class="text-center mb-8 sm:mb-12">
          <h2 class="text-2xl sm:text-h1 text-brand-header mb-3 sm:mb-4 cursor-pointer hover:text-brand-secondary transition-colors duration-200 font-serif" @click="handleCardClick('ai')">Click to Get Started</h2>
          <p class="text-base sm:text-xl text-brand-primary max-w-4xl mx-auto px-4 sm:px-0">
            Here's how Savta.ai works to create your beautiful memory books and cards
          </p>
        </div>
      
      <!-- 4-Step Process Flow -->
      <div class="mt-15 max-w-6xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <!-- Step 1: Upload Photos -->
          <div class="text-center group cursor-pointer" @click="handleCardClick('ai')">
            <div class="relative mb-4">
              <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-brand-highlight to-brand-highlight/80 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Upload class="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <div class="absolute -top-2 -left-2 w-6 h-6 bg-brand-header text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
            </div>
            <h3 class="text-lg sm:text-xl font-semibold text-brand-secondary mb-2 font-serif">Upload Photos</h3>
            <ul class="text-sm sm:text-base text-brand-primary list-disc pl-5 text-left space-y-1 mx-auto max-w-[20rem]">
              <li>Gather photos from your phone, computer, and social media.</li>
              <li>Your Savta.ai Photo Box is where favorites live.</li>
              <li>Upload directly from your phone or computer.</li>
              <li>Ask family to text favorites—I'll add them to your Photo Box.</li>
            </ul>
          </div>
          
          <!-- Step 2: Give Instructions -->
          <div class="text-center group cursor-pointer" @click="handleCardClick('ai')">
            <div class="relative mb-4">
              <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-brand-accent to-brand-accent/80 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <MessageCircle class="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <div class="absolute -top-2 -left-2 w-6 h-6 bg-brand-header text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
            </div>
            <h3 class="text-lg sm:text-xl font-semibold text-brand-secondary mb-2 font-serif">Tell Savta</h3>
            <ul class="text-sm sm:text-base text-brand-primary list-disc pl-5 text-left space-y-1 mx-auto max-w-[20rem]">
              <li>When you're ready, tell me what you want to create.</li>
              <li>Example: “A card for our trip to Florida with our grandchildren.”</li>
            </ul>
          </div>
          
          <!-- Step 3: Savta Works Magic -->
          <div class="text-center group cursor-pointer" @click="handleCardClick('ai')">
            <div class="relative mb-4">
              <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-brand-header to-brand-header/80 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Wand2 class="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <div class="absolute -top-2 -left-2 w-6 h-6 bg-brand-header text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
            </div>
            <h3 class="text-lg sm:text-xl font-semibold text-brand-secondary mb-2 font-serif">Savta Works Magic</h3>
            <ul class="text-sm sm:text-base text-brand-primary list-disc pl-5 text-left space-y-1 mx-auto max-w-[20rem]">
              <li>I’ll select the best photos based on your instructions.</li>
              <li>I’ll write warm captions to bring your story to life.</li>
            </ul>
          </div>
          
          <!-- Step 4: Get Memory Book -->
          <div class="text-center group cursor-pointer" @click="handleCardClick('ai')">
            <div class="relative mb-4">
              <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-brand-secondary to-brand-secondary/80 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <BookOpen class="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <div class="absolute -top-2 -left-2 w-6 h-6 bg-brand-header text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
            </div>
            <h3 class="text-lg sm:text-xl font-semibold text-brand-secondary mb-2 font-serif">Get Your Memory</h3>
            <ul class="text-sm sm:text-base text-brand-primary list-disc pl-5 text-left space-y-1 mx-auto max-w-[20rem]">
              <li>Download or share your digital memory card with family.</li>
              <li>Or ask me to print and mail it to loved ones.</li>
            </ul>
          </div>
        </div>
        
        <!-- Connecting Arrows (hidden on mobile) -->
        <div class="hidden lg:flex items-center justify-center mt-8 space-x-4">
          <div class="flex-1 h-0.5 bg-gradient-to-r from-transparent via-brand-highlight/30 to-brand-accent/30"></div>
          <ArrowRight class="w-6 h-6 text-brand-accent" />
          <div class="flex-1 h-0.5 bg-gradient-to-r from-brand-accent/30 via-brand-header/30 to-brand-secondary/30"></div>
          <ArrowRight class="w-6 h-6 text-brand-header" />
          <div class="flex-1 h-0.5 bg-gradient-to-r from-brand-header/30 via-brand-secondary/30 to-transparent"></div>
          <ArrowRight class="w-6 h-6 text-brand-secondary" />
          <div class="flex-1 h-0.5 bg-gradient-to-r from-brand-secondary/30 to-transparent"></div>
        </div>
      </div>
    </div>
    
    <!-- Primary Action: Create Special Memories -->
    <!-- COMMENTED OUT: Original memory-books-tile section - functionality moved to How Savta.ai works tiles above -->
    

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

    <!-- Savta Bubble for New Users -->
    <SavtaBubble
      v-model:open="showSavtaBubble"
      target=".grid.grid-cols-1.md\:grid-cols-2.lg\:grid-cols-4"
      placement="center"
      :offset="0"
      heading="Hi, I'm Savta and I'm here to help you get started!"
      text="Start by uploading just your favorite photos to your Photo Box—not your whole
      camera roll. 📸
      \n\nI’ll use a little AI magic to pick photos that belong together, arrange them
      beautifully on each card, and write warm captions. ✨
      \n\nTake a quick look at the steps above, and I’ll guide you through your first
      memory card. 💛"
      variant="instruction"
      :dismissible="true"
      :show-avatar="true"
    />
    </div>
  </div>
</template>

<script setup>
import { useSupabaseUser } from '~/composables/useSupabase'
import { watchEffect, ref, onMounted } from 'vue'
import SavtaBubble from '~/components/SavtaBubble.vue'
import { 
  Wand2, 
  Sparkles, 
  Image, 
  Grid, 
  Share2, 
  BookOpen, 
  ArrowRight, 
  MessageCircle, 
  Upload, 
  Eye, 
  Heart, 
  AlertTriangle 
} from 'lucide-vue-next'

const user = useSupabaseUser()
const showAuthDialog = ref(false)
const isGuestMode = ref(false)
const showSavtaBubble = ref(false)
const hasAssets = ref(false)
const memoryBooks = ref([])

definePageMeta({
  layout: 'default'
})

const { hasInsidersAccess, checkInsidersAccess } = useInsidersAccess()

onMounted(async () => {
  checkInsidersAccess()
  console.log('Dashboard mounted, insiders access:', hasInsidersAccess.value)
  
  // Check for guest mode
  if (process.client) {
    isGuestMode.value = sessionStorage.getItem('guestMode') === 'true'
  }

  // Check if user is new (no memory books or assets) and show Savta bubble
  if (user.value && !isGuestMode.value) {
    await checkIfNewUser()
  }
})

// Watch for user changes and check if new user
watchEffect(async () => {
  console.log('[Dashboard] watchEffect user:', user)
  console.log('[Dashboard] watchEffect user.value:', user?.value)
  
  if (user.value && !isGuestMode.value) {
    console.log('[Dashboard] User detected, checking if new user...')
    // Add a small delay to ensure everything is loaded
    await new Promise(resolve => setTimeout(resolve, 500))
    await checkIfNewUser()
  }
})

async function checkIfNewUser() {
  try {
    console.log('[Dashboard] checkIfNewUser: Starting check...')
    const db = useDatabase()
    
    // Check for assets
    console.log('[Dashboard] checkIfNewUser: Checking assets...')
    const assetsResponse = await db.assets.getAssets()
    hasAssets.value = assetsResponse && assetsResponse.length > 0
    console.log('[Dashboard] checkIfNewUser: Assets response:', assetsResponse)
    console.log('[Dashboard] checkIfNewUser: hasAssets:', hasAssets.value)
    
    // Check for memory books
    console.log('[Dashboard] checkIfNewUser: Checking memory books...')
    const booksResponse = await db.memoryBooks.getMemoryBooks()
    memoryBooks.value = booksResponse || []
    console.log('[Dashboard] checkIfNewUser: Memory books response:', booksResponse)
    console.log('[Dashboard] checkIfNewUser: memoryBooks length:', memoryBooks.value.length)
    
    // Show Savta bubble if user has no memory books and no assets
    console.log('[Dashboard] checkIfNewUser: Checking conditions - memoryBooks.length === 0:', memoryBooks.value.length === 0, '!hasAssets:', !hasAssets.value)
    if (memoryBooks.value.length === 0 && !hasAssets.value) {
      console.log('[Dashboard] New user detected, showing Savta bubble')
      showSavtaBubble.value = true
      console.log('[Dashboard] showSavtaBubble set to:', showSavtaBubble.value)
    } else {
      console.log('[Dashboard] User is not new, not showing Savta bubble')
    }
  } catch (error) {
    console.error('[Dashboard] Error checking if new user:', error)
  }
}

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
    case 'ai':
      navigateTo('/app/memory-books')
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

// Add meta viewport for mobile to disable zoom
useHead({
  meta: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no'
    }
  ]
})
</script>

<style scoped>
/* Disable zoom on mobile devices */
.no-zoom {
  touch-action: manipulation;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.no-zoom * {
  touch-action: manipulation;
}

/* Prevent double-tap zoom */
.no-zoom, .no-zoom * {
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
}

/* Additional mobile zoom prevention */
@media screen and (max-width: 768px) {
  .no-zoom {
    -webkit-text-size-adjust: 100%;
    -moz-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }
}
</style> 