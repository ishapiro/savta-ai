<template>
  <div class="min-h-screen flex flex-col surface-ground">
    <!-- Header -->
    <header class="surface-section border-b border-surface-border sticky top-0 z-40 bg-white/95 backdrop-blur-sm">
      <nav class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center space-x-4 no-underline">
              <SavtaIcon class="h-10 w-auto" />
              <span class="text-xl font-bold text-pink-500 no-underline">Savta</span>
            </NuxtLink>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden lg:flex items-center space-x-4">
            <NuxtLink to="/app/dashboard" class="no-underline">
              <button class="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full px-6 py-2 text-base shadow transition-all duration-200 no-underline">
                <i class="pi pi-home text-xl"></i>
                <span>Home</span>
              </button>
            </NuxtLink>
            <template v-if="user">
              <!-- App Navigation -->
              <div class="flex items-center space-x-2">
                <NuxtLink to="/app/upload" class="no-underline">
                  <button class="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-full px-6 py-2 text-base shadow transition-all duration-200 no-underline">
                    <i class="pi pi-upload text-xl"></i>
                    <span>Upload</span>
                  </button>
                </NuxtLink>
                <NuxtLink to="/app/review" class="no-underline">
                  <button class="flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-full px-6 py-2 text-base shadow transition-all duration-200 no-underline">
                    <i class="pi pi-check-circle text-xl"></i>
                    <span>Review</span>
                  </button>
                </NuxtLink>
                <NuxtLink to="/app/memory-books" class="no-underline">
                  <button class="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full px-6 py-2 text-base shadow transition-all duration-200 no-underline">
                    <i class="pi pi-book text-xl"></i>
                    <span>Books</span>
                  </button>
                </NuxtLink>
                
                <!-- Admin/Editor Navigation - Only for authenticated users -->
                <template v-if="userProfile && (userProfile.role === 'admin' || userProfile.role === 'editor')">
                  <NuxtLink to="/app/editor" class="no-underline">
                    <button class="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded-full px-6 py-2 text-base shadow transition-all duration-200 no-underline">
                      <i class="pi pi-palette text-xl"></i>
                      <span>Editor</span>
                    </button>
                  </NuxtLink>
                </template>
                
                <template v-if="userProfile && userProfile.role === 'admin'">
                  <NuxtLink to="/app/admin" class="no-underline">
                    <button class="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full px-6 py-2 text-base shadow transition-all duration-200 no-underline">
                      <i class="pi pi-cog text-xl"></i>
                      <span>Admin</span>
                    </button>
                  </NuxtLink>
                </template>
              </div>
              
              <button @click="handleSignOut" class="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-full px-6 py-2 text-base shadow transition-all duration-200">
                <i class="pi pi-sign-out text-xl"></i>
                <span>Sign out</span>
              </button>
            </template>
            <template v-else>
              <NuxtLink to="/app/login" class="no-underline">
                <button class="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full px-6 py-2 text-base shadow transition-all duration-200 no-underline">
                  <i class="pi pi-sign-in text-xl"></i>
                  <span>Sign in</span>
                </button>
              </NuxtLink>
              <NuxtLink to="/app/signup" class="no-underline">
                <button class="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full px-6 py-2 text-base shadow transition-all duration-200 no-underline">
                  <i class="pi pi-user-plus text-xl"></i>
                  <span>Sign up</span>
                </button>
              </NuxtLink>
            </template>
          </div>

          <!-- Tablet Navigation (Compact) -->
          <div class="hidden md:flex lg:hidden items-center space-x-2">
            <NuxtLink to="/app/dashboard" class="no-underline">
              <button class="flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full px-3 py-2 text-sm shadow transition-all duration-200 no-underline">
                <i class="pi pi-home text-lg"></i>
                <span class="hidden sm:inline">Home</span>
              </button>
            </NuxtLink>
            <template v-if="user">
              <NuxtLink to="/app/upload" class="no-underline">
                <button class="flex items-center justify-center gap-1 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-full px-3 py-2 text-sm shadow transition-all duration-200 no-underline">
                  <i class="pi pi-upload text-lg"></i>
                  <span class="hidden sm:inline">Upload</span>
                </button>
              </NuxtLink>
              <NuxtLink to="/app/review" class="no-underline">
                <button class="flex items-center justify-center gap-1 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-full px-3 py-2 text-sm shadow transition-all duration-200 no-underline">
                  <i class="pi pi-check-circle text-lg"></i>
                  <span class="hidden sm:inline">Review</span>
                </button>
              </NuxtLink>
              <NuxtLink to="/app/memory-books" class="no-underline">
                <button class="flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full px-3 py-2 text-sm shadow transition-all duration-200 no-underline">
                  <i class="pi pi-book text-lg"></i>
                  <span class="hidden sm:inline">Books</span>
                </button>
              </NuxtLink>
              
              <!-- Admin/Editor Navigation - Only for authenticated users -->
              <template v-if="userProfile && (userProfile.role === 'admin' || userProfile.role === 'editor')">
                <NuxtLink to="/app/editor" class="no-underline">
                  <button class="flex items-center justify-center gap-1 bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded-full px-3 py-2 text-sm shadow transition-all duration-200 no-underline">
                    <i class="pi pi-palette text-lg"></i>
                    <span class="hidden sm:inline">Editor</span>
                  </button>
                </NuxtLink>
              </template>
              
              <template v-if="userProfile && userProfile.role === 'admin'">
                <NuxtLink to="/app/admin" class="no-underline">
                  <button class="flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full px-3 py-2 text-sm shadow transition-all duration-200 no-underline">
                    <i class="pi pi-cog text-lg"></i>
                    <span class="hidden sm:inline">Admin</span>
                  </button>
                </NuxtLink>
              </template>
              
              <button @click="handleSignOut" class="flex items-center justify-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-full px-3 py-2 text-sm shadow transition-all duration-200">
                <i class="pi pi-sign-out text-lg"></i>
                <span class="hidden sm:inline">Sign out</span>
              </button>
            </template>
            <template v-else>
              <NuxtLink to="/app/login" class="no-underline">
                <button class="flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full px-3 py-2 text-sm shadow transition-all duration-200 no-underline">
                  <i class="pi pi-sign-in text-lg"></i>
                  <span class="hidden sm:inline">Sign in</span>
                </button>
              </NuxtLink>
              <NuxtLink to="/app/signup" class="no-underline">
                <button class="flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full px-3 py-2 text-sm shadow transition-all duration-200 no-underline">
                  <i class="pi pi-user-plus text-lg"></i>
                  <span class="hidden sm:inline">Sign up</span>
                </button>
              </NuxtLink>
            </template>
          </div>

          <!-- Mobile Menu Button -->
          <div class="md:hidden flex items-center">
            <Button
              @click="mobileMenuOpen = !mobileMenuOpen"
              icon="pi pi-bars"
              rounded
              class="bg-gray-100 hover:bg-gray-200 text-gray-700"
              aria-label="Toggle mobile menu"
            />
          </div>
        </div>

        <!-- Mobile Navigation -->
        <div v-show="mobileMenuOpen" class="md:hidden border-t border-surface-border surface-section bg-white/95 backdrop-blur-sm">
          <div class="px-4 py-6 space-y-3">
            <!-- User Status -->
            <div class="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <i class="pi pi-user text-white text-lg"></i>
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-900">
                    {{ user ? 'Authenticated User' : 'Guest' }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ user ? user.email : 'Limited access mode' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Navigation Links -->
            <div class="space-y-2">
              <NuxtLink 
                to="/app/dashboard" 
                class="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 no-underline group"
                @click="mobileMenuOpen = false"
              >
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <i class="pi pi-home text-xl"></i>
                  </div>
                  <div>
                    <p class="font-semibold">Dashboard</p>
                    <p class="text-xs opacity-80">Your main workspace</p>
                  </div>
                </div>
                <i class="pi pi-chevron-right text-lg opacity-60 group-hover:opacity-100 transition-opacity"></i>
              </NuxtLink>
              
              <template v-if="user">
                <!-- App Navigation -->
                <NuxtLink 
                  to="/app/upload" 
                  class="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 no-underline group"
                  @click="mobileMenuOpen = false"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <i class="pi pi-upload text-xl"></i>
                    </div>
                    <div>
                      <p class="font-semibold">Upload</p>
                      <p class="text-xs opacity-80">Add photos & memories</p>
                    </div>
                  </div>
                  <i class="pi pi-chevron-right text-lg opacity-60 group-hover:opacity-100 transition-opacity"></i>
                </NuxtLink>
                
                <NuxtLink 
                  to="/app/review" 
                  class="flex items-center justify-between p-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 no-underline group"
                  @click="mobileMenuOpen = false"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <i class="pi pi-check-circle text-xl"></i>
                    </div>
                    <div>
                      <p class="font-semibold">Review</p>
                      <p class="text-xs opacity-80">Review & approve content</p>
                    </div>
                  </div>
                  <i class="pi pi-chevron-right text-lg opacity-60 group-hover:opacity-100 transition-opacity"></i>
                </NuxtLink>
                
                <NuxtLink 
                  to="/app/memory-books" 
                  class="flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 no-underline group"
                  @click="mobileMenuOpen = false"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <i class="pi pi-book text-xl"></i>
                    </div>
                    <div>
                      <p class="font-semibold">Memory Books</p>
                      <p class="text-xs opacity-80">View your collections</p>
                    </div>
                  </div>
                  <i class="pi pi-chevron-right text-lg opacity-60 group-hover:opacity-100 transition-opacity"></i>
                </NuxtLink>
                
                <!-- Admin/Editor Navigation - Only for authenticated users -->
                <template v-if="userProfile && (userProfile.role === 'admin' || userProfile.role === 'editor')">
                  <NuxtLink 
                    to="/app/editor" 
                    class="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 no-underline group"
                    @click="mobileMenuOpen = false"
                  >
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <i class="pi pi-palette text-xl"></i>
                      </div>
                      <div>
                        <p class="font-semibold">Editor</p>
                        <p class="text-xs opacity-80">Content management</p>
                      </div>
                    </div>
                    <i class="pi pi-chevron-right text-lg opacity-60 group-hover:opacity-100 transition-opacity"></i>
                  </NuxtLink>
                </template>
                
                <template v-if="userProfile && userProfile.role === 'admin'">
                  <NuxtLink 
                    to="/app/admin" 
                    class="flex items-center justify-between p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 no-underline group"
                    @click="mobileMenuOpen = false"
                  >
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <i class="pi pi-cog text-xl"></i>
                      </div>
                      <div>
                        <p class="font-semibold">Admin</p>
                        <p class="text-xs opacity-80">System administration</p>
                      </div>
                    </div>
                    <i class="pi pi-chevron-right text-lg opacity-60 group-hover:opacity-100 transition-opacity"></i>
                  </NuxtLink>
                </template>
                
                <!-- Sign Out Button -->
                <button
                  @click="handleSignOut"
                  class="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <i class="pi pi-sign-out text-xl"></i>
                    </div>
                    <div>
                      <p class="font-semibold">Sign Out</p>
                      <p class="text-xs opacity-80">End your session</p>
                    </div>
                  </div>
                  <i class="pi pi-chevron-right text-lg opacity-60 group-hover:opacity-100 transition-opacity"></i>
                </button>
              </template>
              
              <template v-else>
                <!-- Auth Buttons -->
                <NuxtLink 
                  to="/app/login" 
                  class="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 no-underline group"
                  @click="mobileMenuOpen = false"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <i class="pi pi-sign-in text-xl"></i>
                    </div>
                    <div>
                      <p class="font-semibold">Sign In</p>
                      <p class="text-xs opacity-80">Access your account</p>
                    </div>
                  </div>
                  <i class="pi pi-chevron-right text-lg opacity-60 group-hover:opacity-100 transition-opacity"></i>
                </NuxtLink>
                
                <NuxtLink 
                  to="/app/signup" 
                  class="flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 no-underline group"
                  @click="mobileMenuOpen = false"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <i class="pi pi-user-plus text-xl"></i>
                    </div>
                    <div>
                      <p class="font-semibold">Sign Up</p>
                      <p class="text-xs opacity-80">Create new account</p>
                    </div>
                  </div>
                  <i class="pi pi-chevron-right text-lg opacity-60 group-hover:opacity-100 transition-opacity"></i>
                </NuxtLink>
              </template>
            </div>
          </div>
        </div>
      </nav>
    </header>

    <!-- Breadcrumb aligned with header content -->
    <div class="hidden md:block bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb :model="breadcrumbItems" class="text-sm outline-none focus:outline-none ring-0 border-0 bg-gray-50" />
      </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1">
      <NuxtPage />
    </main>

    <!-- Footer -->
    <footer class="surface-section border-t border-surface-border mt-8">
      <div class="max-w-full mx-auto px-4 sm:px-8 py-6 flex flex-col md:flex-row items-center justify-between">
        <div class="text-color-secondary text-sm text-center md:text-left w-full md:w-auto">
          Savta is a Cogitations Property.  &copy; 2025 Cogitations, llc.  All rights reserved.
          <span v-if="buildInfo" class="ml-2 text-sm text-color-secondary">Build: {{ buildInfo }}</span>
        </div>
        <div class="flex space-x-6 mt-4 md:mt-0 w-full md:w-auto justify-center md:justify-end">
          <NuxtLink to="/about" class="text-color-secondary hover:text-primary text-sm">About</NuxtLink>
          <NuxtLink to="/privacy" class="text-color-secondary hover:text-primary text-sm">Privacy</NuxtLink>
          <NuxtLink to="/terms" class="text-color-secondary hover:text-primary text-sm">Terms</NuxtLink>
        </div>
      </div>
    </footer>
    
    <!-- Toast component for notifications -->
    <Toast />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSupabaseUser } from '~/composables/useSupabase'
const supabase = useNuxtApp().$supabase
const user = useSupabaseUser()

const route = useRoute()
const { hasInsidersAccess, checkInsidersAccess } = useInsidersAccess()

// Check insiders access immediately
checkInsidersAccess()

const mobileMenuOpen = ref(false)
const config = useRuntimeConfig()
const buildInfo = config.public.buildDate
const userProfile = ref(null)

// Load user profile when user changes
watch(() => user.value, async (newUser) => {
  if (newUser) {
    try {
      const db = useDatabase()
      userProfile.value = await db.getCurrentProfile()
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  } else {
    userProfile.value = null
  }
}, { immediate: true })

// Refresh insiders access state when route changes
watch(route, () => {
  checkInsidersAccess()
  console.log('Route changed, checking insiders access:', hasInsidersAccess.value)
}, { immediate: true })

// Monitor insiders access state changes
watch(hasInsidersAccess, (newValue) => {
  console.log('Insiders access state changed:', newValue)
})

// Example: dynamic breadcrumb based on route
const breadcrumbItems = computed(() => {
  // Simple example: Home > Current Page
  const crumbs = [
    { label: 'Home', to: '/' }
  ]
  if (route.name && route.name !== 'index') {
    crumbs.push({ label: route.name.charAt(0).toUpperCase() + route.name.slice(1) })
  }
  return crumbs
})

const handleSignOut = async () => {
  try {
    console.log('Starting sign out process...')
    console.log('Current user state:', user.value ? 'Authenticated' : 'Not authenticated')
    
    // Always try to sign out from Supabase if user exists
    if (user.value) {
      console.log('Signing out from Supabase...')
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
      } else {
        console.log('Successfully signed out from Supabase')
      }
    } else {
      console.log('No authenticated user to sign out')
    }
    
    // Clear insiders access
    console.log('Clearing insiders access...')
    const { clearInsidersAccess } = useInsidersAccess()
    clearInsidersAccess()
    
    // Force a small delay to ensure state updates
    await new Promise(resolve => setTimeout(resolve, 100))
    
    console.log('Navigating to dashboard...')
    // Navigate back to landing page
    navigateTo('/app/dashboard')
  } catch (err) {
    console.error('Sign out error:', err)
    // Even if there's an error, still clear insiders access and navigate
    const { clearInsidersAccess } = useInsidersAccess()
    clearInsidersAccess()
    navigateTo('/app/dashboard')
  }
}

const handleSignIn = () => {
  navigateTo('/app/login')
}

import SavtaIcon from '~/components/SavtaIcon.vue'
</script> 