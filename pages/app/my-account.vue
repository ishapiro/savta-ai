<template>
  <div class="min-h-screen flex flex-col lg:flex-row bg-brand-background">
    <!-- Left Sidebar Navigation -->
    <div class="hidden lg:block w-64 bg-brand-navigation/5 border-r border-brand-highlight/20 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <div class="p-6 space-y-2">
        <h3 class="text-sm font-semibold text-brand-primary/70 uppercase tracking-wide mb-4">Account</h3>
        
        <!-- My Account (Active) -->
        <NuxtLink 
          to="/app/my-account" 
          class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors"
          :class="isCurrentPage('my-account') ? 'bg-brand-highlight/20 text-brand-secondary' : 'text-brand-primary/70 hover:bg-brand-highlight/10'"
        >
          <i class="pi pi-user text-sm"></i>
          <span class="font-medium">My Account</span>
        </NuxtLink>

        <!-- Other account links could go here -->
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl sm:text-4xl font-bold text-brand-secondary mb-2">My Account</h1>
          <p class="text-brand-primary/70">Manage your account and view your activity</p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="space-y-6">
          <Skeleton height="10rem" class="w-full"></Skeleton>
          <Skeleton height="20rem" class="w-full"></Skeleton>
        </div>

        <!-- Content -->
        <div v-else class="space-y-6">
          <!-- User Information Card -->
          <div v-if="user" class="bg-white rounded-lg border border-brand-highlight/20 p-6 sm:p-8 shadow-sm">
            <h2 class="text-xl font-semibold text-brand-secondary mb-6 flex items-center gap-2">
              <i class="pi pi-user-circle text-brand-header"></i>
              Account Details
            </h2>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p class="text-sm text-brand-primary/60 font-medium mb-1">Email Address</p>
                <p class="text-base font-mono text-brand-primary">{{ user.email }}</p>
              </div>

              <div>
                <p class="text-sm text-brand-primary/60 font-medium mb-1">Account Status</p>
                <div class="flex items-center gap-2">
                  <span v-if="!isUserDisabled" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-highlight/20 text-brand-highlight">
                    <span class="w-2 h-2 rounded-full bg-brand-highlight mr-2"></span>
                    Active
                  </span>
                  <span v-else class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <span class="w-2 h-2 rounded-full bg-red-400 mr-2"></span>
                    Disabled
                  </span>
                </div>
              </div>

              <div>
                <p class="text-sm text-brand-primary/60 font-medium mb-1">Signup Date</p>
                <p class="text-base text-brand-primary">{{ formatDate(user.created_at) }}</p>
              </div>

              <div>
                <p class="text-sm text-brand-primary/60 font-medium mb-1">Last Sign In</p>
                <p class="text-base text-brand-primary">{{ formatDate(user.last_sign_in_at) }}</p>
              </div>

              <div>
                <p class="text-sm text-brand-primary/60 font-medium mb-1">Provider</p>
                <p class="text-base text-brand-primary capitalize">{{ user.app_metadata?.provider || 'Email' }}</p>
              </div>

              <div v-if="userProfile">
                <p class="text-sm text-brand-primary/60 font-medium mb-1">Subscription</p>
                <p class="text-base capitalize text-brand-primary">{{ userProfile.subscription_type || 'Regular' }}</p>
              </div>
            </div>

            <!-- Disabled Account Message -->
            <div v-if="isUserDisabled" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-red-800 font-semibold mb-1">Your account has been disabled</p>
              <p class="text-red-700 text-sm">Please contact customer support for more information.</p>
            </div>
          </div>

          <!-- Activity Statistics Section -->
          <div>
            <h3 class="text-lg font-semibold text-brand-secondary mb-4">Your Activity</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <!-- PDF Downloads -->
              <div class="bg-white rounded-lg border border-brand-highlight/20 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i class="pi pi-download text-blue-600"></i>
                  </div>
                </div>
                <p class="text-sm text-brand-primary/60 font-medium mb-2">Memory Book Downloads</p>
                <p class="text-3xl font-bold text-brand-primary">{{ stats.pdfDownloads }}</p>
              </div>

              <!-- Image Downloads -->
              <div class="bg-white rounded-lg border border-brand-highlight/20 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i class="pi pi-image text-purple-600"></i>
                  </div>
                </div>
                <p class="text-sm text-brand-primary/60 font-medium mb-2">Memory Card Downloads</p>
                <p class="text-3xl font-bold text-brand-primary">{{ stats.imageDownloads }}</p>
              </div>

              <!-- PDF Shares -->
              <div class="bg-white rounded-lg border border-brand-highlight/20 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <i class="pi pi-share-alt text-green-600"></i>
                  </div>
                </div>
                <p class="text-sm text-brand-primary/60 font-medium mb-2">Memory Book Shares</p>
                <p class="text-3xl font-bold text-brand-primary">{{ stats.pdfShares }}</p>
              </div>

              <!-- Image/Card Shares -->
              <div class="bg-white rounded-lg border border-brand-highlight/20 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i class="pi pi-share-alt text-purple-600"></i>
                  </div>
                </div>
                <p class="text-sm text-brand-primary/60 font-medium mb-2">Memory Card Shares</p>
                <p class="text-3xl font-bold text-brand-primary">{{ stats.imageShares }}</p>
              </div>
            </div>
          </div>

          <!-- Content Statistics Section -->
          <div>
            <h3 class="text-lg font-semibold text-brand-secondary mb-4">Your Content</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Photos Uploaded -->
              <div class="bg-white rounded-lg border border-brand-highlight/20 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-10 h-10 bg-brand-highlight/20 rounded-lg flex items-center justify-center">
                    <i class="pi pi-image text-brand-highlight"></i>
                  </div>
                </div>
                <p class="text-sm text-brand-primary/60 font-medium mb-2">Photos Uploaded</p>
                <p class="text-3xl font-bold text-brand-primary">{{ stats.photosUploaded }}</p>
              </div>

              <!-- Memory Cards -->
              <div class="bg-white rounded-lg border border-brand-highlight/20 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-10 h-10 bg-brand-header/20 rounded-lg flex items-center justify-center">
                    <i class="pi pi-credit text-brand-header"></i>
                  </div>
                </div>
                <p class="text-sm text-brand-primary/60 font-medium mb-2">Memory Cards</p>
                <p class="text-3xl font-bold text-brand-primary">{{ stats.memoryCardsCreated }}</p>
              </div>

              <!-- Memory Books -->
              <div class="bg-white rounded-lg border border-brand-highlight/20 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-10 h-10 bg-brand-secondary/20 rounded-lg flex items-center justify-center">
                    <i class="pi pi-book text-brand-secondary"></i>
                  </div>
                </div>
                <p class="text-sm text-brand-primary/60 font-medium mb-2">Memory Books</p>
                <p class="text-3xl font-bold text-brand-primary">{{ stats.memoryBooksCreated }}</p>
              </div>

              <!-- People Identified -->
              <div class="bg-white rounded-lg border border-brand-highlight/20 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-10 h-10 bg-brand-flash/20 rounded-lg flex items-center justify-center">
                    <i class="pi pi-users text-brand-flash"></i>
                  </div>
                </div>
                <p class="text-sm text-brand-primary/60 font-medium mb-2">People Identified</p>
                <p class="text-3xl font-bold text-brand-primary">{{ stats.peopleIdentified }}</p>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3">
            <NuxtLink 
              to="/app/memory-books"
              class="flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg font-medium transition-colors"
            >
              <i class="pi pi-arrow-right text-sm"></i>
              <span>Go to Memory Books</span>
            </NuxtLink>

            <button 
              @click="handleSignOut"
              class="flex items-center justify-center gap-2 px-4 py-2 bg-brand-navigation/10 hover:bg-brand-navigation/20 text-brand-primary rounded-lg font-medium transition-colors border border-brand-highlight/20"
            >
              <i class="pi pi-sign-out text-sm"></i>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useSupabaseUser } from '~/composables/useSupabase'
import { useDatabase } from '~/composables/useDatabase'

definePageMeta({
  layout: 'default',
  ssr: false,

})

// Get Supabase user data
const supabase = useNuxtApp().$supabase
const user = useSupabaseUser()
const { getCurrentProfile } = useDatabase()

// State
const loading = ref(true)
const isUserDisabled = ref(false)
const userProfile = ref(null)
const stats = ref({
  photosUploaded: 0,
  memoryCardsCreated: 0,
  memoryBooksCreated: 0,
  peopleIdentified: 0,
  pdfDownloads: 0,
  imageDownloads: 0,
  pdfShares: 0,
  imageShares: 0,
  memoryBookShares: 0,
  memoryBookShareFailed: 0
})

// Helper function to check current page
const isCurrentPage = (page) => {
  const route = useRoute()
  return route.path.includes(page)
}

// Format date helper function
const formatDate = (dateString) => {
  if (!dateString) return 'Not available'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Invalid date'
  }
}

// Load user profile
const loadUserProfile = async () => {
  try {
    userProfile.value = await getCurrentProfile()
    console.log('[MY_ACCOUNT] Loaded user profile:', userProfile.value)
  } catch (error) {
    console.error('[MY_ACCOUNT] Error loading user profile:', error)
  }
}

// Check if user is disabled
const checkUserDisabled = async () => {
  if (user.value) {
    try {
      const res = await fetch(`/api/users/${user.value.id}/info`)
      
      if (!res.ok) {
        console.warn('[MY_ACCOUNT] User info API returned error:', res.status)
        isUserDisabled.value = true
        return
      }
      
      const profile = await res.json()
      console.log('[MY_ACCOUNT] Profile:', profile)
      
      if (profile.deleted === true || profile.exists === false) {
        console.log('[MY_ACCOUNT] User is deleted or does not exist')
        isUserDisabled.value = true
      } else {
        isUserDisabled.value = false
      }
    } catch (error) {
      console.error('[MY_ACCOUNT] Error checking user status:', error)
      isUserDisabled.value = true
    }
  }
}

// Load account statistics
const loadAccountStats = async () => {
  if (!user.value?.id) return
  
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token
    
    if (!accessToken) {
      throw new Error('No access token available')
    }
    
    const response = await fetch(`/api/users/${user.value.id}/account-stats`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('[MY_ACCOUNT] Account stats:', data.stats)
    stats.value = data.stats
  } catch (error) {
    console.error('❌ Failed to load account stats:', error)
    // Stats will remain at default values
  }
}

let refreshInterval = null

// Initialize page
onMounted(async () => {
  try {
    console.log('[MY_ACCOUNT] onMounted - user:', !!user.value)
    
    if (user.value) {
      await Promise.all([
        checkUserDisabled(),
        loadUserProfile(),
        loadAccountStats()
      ])
    }
  } catch (error) {
    console.error('[MY_ACCOUNT] Error in onMounted:', error)
  } finally {
    loading.value = false
  }

  // Set up auto-refresh: reload stats every 5 seconds to reflect real-time activity
  refreshInterval = setInterval(async () => {
    console.log('[MY_ACCOUNT] Auto-refresh: Loading account stats')
    await loadAccountStats()
  }, 5000)

  // Also refresh when page becomes visible (in case user switched tabs)
  const handleVisibilityChange = async () => {
    if (!document.hidden) {
      console.log('[MY_ACCOUNT] Page became visible, refreshing stats')
      await loadAccountStats()
    }
  }
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

// Watch for user changes
watch(() => user.value, async (newUser) => {
  if (newUser) {
    loading.value = true
    try {
      await Promise.all([
        checkUserDisabled(),
        loadUserProfile(),
        loadAccountStats()
      ])
    } finally {
      loading.value = false
    }
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})

// Sign out handler
const handleSignOut = async () => {
  try {
    const supabase = useNuxtApp().$supabase
    const { data } = await supabase.auth.getSession()
    if (data.session) {
      await supabase.auth.signOut()
    }
  } catch (error) {
    if (
      !(
        error?.message?.includes('Auth session missing') ||
        (error?.status === 403 && error?.message?.includes('logout'))
      )
    ) {
      console.warn('Sign out error:', error)
    }
  }
  
  const { clearInsidersAccess } = useInsidersAccess()
  clearInsidersAccess()
  
  import('~/composables/useSupabase').then(mod => {
    mod.globalUser.value = null
  })
  
  await new Promise(resolve => setTimeout(resolve, 100))
  navigateTo('/app/memory-books')
}
</script>
