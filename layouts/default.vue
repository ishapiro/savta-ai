<template>
  <div class="min-h-screen flex flex-col surface-ground">
    <!-- Header -->
    <header class="surface-section border-b border-surface-border sticky top-0 z-40 bg-white/95 backdrop-blur-sm">
      <nav class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center space-x-3 no-underline">
              <SavtaIcon class="h-14 w-auto" />
              <span class="text-2xl font-bold text-pink-500 no-underline">Savta</span>
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
                    <span>Memories</span>
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
                  <span class="hidden sm:inline">Memories</span>
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
            <button
              @click="toggleMobileMenu"
              class="relative w-8 h-8 flex flex-col justify-center items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-all duration-200"
              :class="mobileMenuOpen ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'"
              aria-label="Toggle mobile menu"
            >
              <!-- Hamburger Icon with Animation -->
              <span 
                class="w-5 h-0.5 bg-gray-700 rounded-full transition-all duration-300 ease-in-out"
                :class="mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''"
              ></span>
              <span 
                class="w-5 h-0.5 bg-gray-700 rounded-full transition-all duration-300 ease-in-out mt-1"
                :class="mobileMenuOpen ? 'opacity-0' : ''"
              ></span>
              <span 
                class="w-5 h-0.5 bg-gray-700 rounded-full transition-all duration-300 ease-in-out mt-1"
                :class="mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''"
              ></span>
            </button>
          </div>
        </div>
      </nav>
    </header>

    <!-- Mobile Menu Backdrop -->
    <div 
      v-if="mobileMenuOpen" 
      @click="closeMobileMenu"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300"
    ></div>

    <!-- Mobile Navigation -->
    <div 
      class="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-in-out"
      :class="mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <!-- Mobile Menu Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
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
        <button
          @click="closeMobileMenu"
          class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        >
          <i class="pi pi-times text-gray-500"></i>
        </button>
      </div>

      <!-- Mobile Menu Content -->
      <div class="flex-1 overflow-y-auto">
        <div class="p-4 space-y-2">
          <!-- Navigation Links -->
          <div class="space-y-1">
            <NuxtLink 
              to="/app/dashboard" 
              class="flex items-center justify-between p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 no-underline group"
              @click="closeMobileMenu"
            >
              <div class="flex items-center space-x-2">
                <div class="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                  <i class="pi pi-home text-lg"></i>
                </div>
                <div>
                  <p class="font-semibold text-sm">Savta Special Memory Home</p>
                  <p class="text-xs opacity-80">Create a memory card or book</p>
                </div>
              </div>
              <i class="pi pi-chevron-right text-sm opacity-60 group-hover:opacity-100 transition-opacity"></i>
            </NuxtLink>
            
            <template v-if="user">
              <!-- App Navigation -->
              <NuxtLink 
                to="/app/upload" 
                class="flex items-center justify-between p-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 no-underline group"
                @click="closeMobileMenu"
              >
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                    <i class="pi pi-upload text-lg"></i>
                  </div>
                  <div>
                    <p class="font-semibold text-sm">Upload</p>
                    <p class="text-xs opacity-80">Add photos & memories</p>
                  </div>
                </div>
                <i class="pi pi-chevron-right text-sm opacity-60 group-hover:opacity-100 transition-opacity"></i>
              </NuxtLink>
              
              <NuxtLink 
                to="/app/review" 
                class="flex items-center justify-between p-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 no-underline group"
                @click="closeMobileMenu"
              >
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                    <i class="pi pi-check-circle text-lg"></i>
                  </div>
                  <div>
                    <p class="font-semibold text-sm">Review</p>
                    <p class="text-xs opacity-80">Review & approve content</p>
                  </div>
                </div>
                <i class="pi pi-chevron-right text-sm opacity-60 group-hover:opacity-100 transition-opacity"></i>
              </NuxtLink>
              
              <NuxtLink 
                to="/app/memory-books" 
                class="flex items-center justify-between p-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 no-underline group"
                @click="closeMobileMenu"
              >
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                    <i class="pi pi-book text-lg"></i>
                  </div>
                  <div>
                    <p class="font-semibold text-sm">Savta's Magic Memories</p>
                    <p class="text-xs opacity-80">View your collections</p>
                  </div>
                </div>
                <i class="pi pi-chevron-right text-sm opacity-60 group-hover:opacity-100 transition-opacity"></i>
              </NuxtLink>
              
              <!-- Admin/Editor Navigation - Only for authenticated users -->
              <template v-if="userProfile && (userProfile.role === 'admin' || userProfile.role === 'editor')">
                <NuxtLink 
                  to="/app/editor" 
                  class="flex items-center justify-between p-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 no-underline group"
                  @click="closeMobileMenu"
                >
                  <div class="flex items-center space-x-2">
                    <div class="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                      <i class="pi pi-palette text-lg"></i>
                    </div>
                    <div>
                      <p class="font-semibold text-sm">Editor</p>
                      <p class="text-xs opacity-80">Content management</p>
                    </div>
                  </div>
                  <i class="pi pi-chevron-right text-sm opacity-60 group-hover:opacity-100 transition-opacity"></i>
                </NuxtLink>
              </template>
              
              <template v-if="userProfile && userProfile.role === 'admin'">
                <NuxtLink 
                  to="/app/admin" 
                  class="flex items-center justify-between p-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 no-underline group"
                  @click="closeMobileMenu"
                >
                  <div class="flex items-center space-x-2">
                    <div class="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                      <i class="pi pi-cog text-lg"></i>
                    </div>
                    <div>
                      <p class="font-semibold text-sm">Admin</p>
                      <p class="text-xs opacity-80">System administration</p>
                    </div>
                  </div>
                  <i class="pi pi-chevron-right text-sm opacity-60 group-hover:opacity-100 transition-opacity"></i>
                </NuxtLink>
              </template>
              
              <!-- Sign Out Button -->
              <button
                @click="handleSignOut"
                class="w-full flex items-center justify-between p-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 group"
              >
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                    <i class="pi pi-sign-out text-lg"></i>
                  </div>
                  <div>
                    <p class="font-semibold text-sm">Sign Out</p>
                    <p class="text-xs opacity-80">End your session</p>
                  </div>
                </div>
                <i class="pi pi-chevron-right text-sm opacity-60 group-hover:opacity-100 transition-opacity"></i>
              </button>
            </template>
            
            <template v-else>
              <!-- Auth Buttons -->
              <NuxtLink 
                to="/app/login" 
                class="flex items-center justify-between p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 no-underline group"
                @click="closeMobileMenu"
              >
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                    <i class="pi pi-sign-in text-lg"></i>
                  </div>
                  <div>
                    <p class="font-semibold text-sm">Sign In</p>
                    <p class="text-xs opacity-80">Access your account</p>
                  </div>
                </div>
                <i class="pi pi-chevron-right text-sm opacity-60 group-hover:opacity-100 transition-opacity"></i>
              </NuxtLink>
              
              <NuxtLink 
                to="/app/signup" 
                class="flex items-center justify-between p-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 no-underline group"
                @click="closeMobileMenu"
              >
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                    <i class="pi pi-user-plus text-lg"></i>
                  </div>
                  <div>
                    <p class="font-semibold text-sm">Sign Up</p>
                    <p class="text-xs opacity-80">Create new account</p>
                  </div>
                </div>
                <i class="pi pi-chevron-right text-sm opacity-60 group-hover:opacity-100 transition-opacity"></i>
              </NuxtLink>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb aligned with header content -->
    <div class="hidden md:block bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav class="flex items-center space-x-2 py-2 text-sm">
          <template v-for="(item, index) in breadcrumbItems" :key="index">
            <NuxtLink 
              v-if="item.to" 
              :to="item.to" 
              class="text-blue-600 hover:text-blue-800 transition-colors"
            >
              {{ item.label }}
            </NuxtLink>
            <span v-else class="text-gray-600">{{ item.label }}</span>
            <i v-if="index < breadcrumbItems.length - 1" class="pi pi-chevron-right text-gray-400 text-xs"></i>
          </template>
        </nav>
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
    <Toast position="bottom-right" style="min-width: 180px; max-width: 500px; font-size: 0.5rem; border-radius: 0.5rem; padding: 0.5rem 1rem;" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSupabaseUser } from '~/composables/useSupabase'
const supabase = useNuxtApp().$supabase
const user = useSupabaseUser()

// Debug: Watch user ref and log changes
import { watch } from 'vue'
watch(user, (val) => {
  console.log('Layout user changed:', val)
})

const route = useRoute()
const { hasInsidersAccess, checkInsidersAccess } = useInsidersAccess()

// Check insiders access immediately
checkInsidersAccess()

const mobileMenuOpen = ref(false)
const config = useRuntimeConfig()
const buildInfo = config.public.buildDate
const userProfile = ref(null)

// Mobile menu methods
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

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
  const crumbs = []
  
  // Always start with Dashboard as Home
  if (route.path.startsWith('/app/')) {
    crumbs.push({ label: 'Home', to: '/app/dashboard' })
  } else {
    crumbs.push({ label: 'Home', to: '/' })
  }
  
  // Add current page if not dashboard
  if (route.path !== '/app/dashboard' && route.name && route.name !== 'index') {
    // Convert route name to readable label
    let label = route.name.toString()
    if (label.includes('-')) {
      label = label.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    } else {
      label = label.charAt(0).toUpperCase() + label.slice(1)
    }
    crumbs.push({ label })
  }
  
  return crumbs
})

const handleSignOut = async () => {
  try {
    const supabase = useNuxtApp().$supabase
    const { data } = await supabase.auth.getSession()
    if (data.session) {
      await supabase.auth.signOut()
    }
  } catch (error) {
    // Suppress known 403 global logout error
    if (
      !(
        error?.message?.includes('Auth session missing') ||
        (error?.status === 403 && error?.message?.includes('logout'))
      )
    ) {
      console.warn('Sign out error:', error)
    }
  }
  // Always clear insiders access and navigate to dashboard (signed-out state)
    const { clearInsidersAccess } = useInsidersAccess()
    clearInsidersAccess()
  // Force clear the user ref
  import('~/composables/useSupabase').then(mod => {
    mod.globalUser.value = null
  })
    await new Promise(resolve => setTimeout(resolve, 100))
    navigateTo('/app/dashboard')
}

const handleSignIn = () => {
  navigateTo('/app/login')
}

import SavtaIcon from '~/components/SavtaIcon.vue'
</script> 