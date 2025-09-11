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
        <h2 class="text-2xl sm:text-h1 text-brand-header mb-3 sm:mb-4">Getting Started</h2>
        <p class="text-base sm:text-xl text-brand-primary max-w-4xl mx-auto px-4 sm:px-0">
          Here's how Savta.ai works to create your beautiful memory books and cards
        </p>
      </div>
      
      <!-- 4-Step Process Flow -->
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <!-- Step 1: Upload Photos -->
          <div class="text-center group">
            <div class="relative mb-4">
              <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-brand-highlight to-brand-highlight/80 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Upload class="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <div class="absolute -top-2 -right-2 w-6 h-6 bg-brand-header text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
            </div>
            <h3 class="text-lg sm:text-xl font-semibold text-brand-secondary mb-2">Upload Photos</h3>
            <p class="text-sm sm:text-base text-brand-primary leading-relaxed">Add your favorite photos to create a collection</p>
          </div>
          
          <!-- Step 2: Give Instructions -->
          <div class="text-center group">
            <div class="relative mb-4">
              <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-brand-accent to-brand-accent/80 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <MessageCircle class="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <div class="absolute -top-2 -right-2 w-6 h-6 bg-brand-header text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
            </div>
            <h3 class="text-lg sm:text-xl font-semibold text-brand-secondary mb-2">Tell Savta</h3>
            <p class="text-sm sm:text-base text-brand-primary leading-relaxed">Give Savta instructions about what you want to create</p>
          </div>
          
          <!-- Step 3: Savta Works Magic -->
          <div class="text-center group">
            <div class="relative mb-4">
              <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-brand-header to-brand-header/80 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Wand2 class="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <div class="absolute -top-2 -right-2 w-6 h-6 bg-brand-header text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
            </div>
            <h3 class="text-lg sm:text-xl font-semibold text-brand-secondary mb-2">Savta Works Magic</h3>
            <p class="text-sm sm:text-base text-brand-primary leading-relaxed">Savta selects the best photos and writes captions</p>
          </div>
          
          <!-- Step 4: Get Memory Book -->
          <div class="text-center group">
            <div class="relative mb-4">
              <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-brand-secondary to-brand-secondary/80 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <BookOpen class="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <div class="absolute -top-2 -right-2 w-6 h-6 bg-brand-header text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
            </div>
            <h3 class="text-lg sm:text-xl font-semibold text-brand-secondary mb-2">Get Your Memory</h3>
            <p class="text-sm sm:text-base text-brand-primary leading-relaxed">Receive your beautiful memory card or book</p>
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
    <div class="mb-8 sm:mb-12">
      
      <div 
        data-savta="memory-books-tile"
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
              <h3 class="text-xl sm:text-h1 text-brand-secondary mb-4 tracking-tight leading-tight">Create A Memory</h3>
              <p class="text-brand-primary text-base sm:text-xl leading-relaxed  max-w-2xl font-medium">
                Ready to get started? Click here to begin creating your first memory card or book!
                Savta will guide you through the entire process.
              </p>
              <p class="mt-2 text-brand-primary text-base sm:text-xl leading-relaxed mb-6 max-w-2xl font-medium">
                This is your main starting point for creating beautiful memories with Savta's help.</p>
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
      target="[data-savta='memory-books-tile']"
      placement="center"
      :offset="0"
      heading="Hi, I'm Savta and I'm here to help you get started!"
      text="As a grandmother myself, I know how precious all those photos on your phone are. 
      I'll help you create very special memory cards and books for your family and friends.
      Click on 'Create a Memory' and I'll guide you through creating your very first one. 
      It's easier than you think."
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