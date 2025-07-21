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
          <div class="hidden xl:flex items-center space-x-2 xl:space-x-4">
            <NuxtLink to="/app/home" class="no-underline">
              <button class="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full px-2 py-1 text-xs lg:px-2 lg:py-1 lg:text-xs xl:px-4 xl:py-1.5 xl:text-sm 2xl:px-6 2xl:py-2 2xl:text-base shadow transition-all duration-200 no-underline">
                <i class="pi pi-home text-lg"></i>
                <span>Home</span>
              </button>
            </NuxtLink>
            <NuxtLink to="/app/dashboard" class="no-underline">
              <button class="flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-full px-2 py-1 text-xs lg:px-2 lg:py-1 lg:text-xs xl:px-4 xl:py-1.5 xl:text-sm 2xl:px-6 2xl:py-2 2xl:text-base shadow transition-all duration-200 no-underline">
                <i class="pi pi-th-large text-lg"></i>
                <span>Dashboard</span>
              </button>
            </NuxtLink>
            <template v-if="user">
              <!-- App Navigation -->
              <div class="flex items-center space-x-2">
                <NuxtLink to="/app/upload" class="no-underline">
                  <button class="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-full px-2 py-1 text-xs lg:px-2 lg:py-1 lg:text-xs xl:px-4 xl:py-1.5 xl:text-sm 2xl:px-6 2xl:py-2 2xl:text-base shadow transition-all duration-200 no-underline">
                    <i class="pi pi-upload text-lg"></i>
                    <span>Upload</span>
                  </button>
                </NuxtLink>
                <NuxtLink to="/app/review" class="no-underline">
                  <button class="flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-full px-2 py-1 text-xs lg:px-2 lg:py-1 lg:text-xs xl:px-4 xl:py-1.5 xl:text-sm 2xl:px-6 2xl:py-2 2xl:text-base shadow transition-all duration-200 no-underline">
                    <i class="pi pi-check-circle text-lg"></i>
                    <span>Review</span>
                  </button>
                </NuxtLink>
                <NuxtLink to="/app/memory-books" class="no-underline">
                  <button class="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full px-2 py-1 text-xs lg:px-2 lg:py-1 lg:text-xs xl:px-4 xl:py-1.5 xl:text-sm 2xl:px-6 2xl:py-2 2xl:text-base shadow transition-all duration-200 no-underline">
                    <i class="pi pi-book text-lg"></i>
                    <span>Memories</span>
                  </button>
                </NuxtLink>
                
                <!-- Admin/Editor Navigation - Only for authenticated users -->
                <template v-if="userProfile && (userProfile.role === 'admin' || userProfile.role === 'editor')">
                  <NuxtLink to="/app/editor" class="no-underline">
                    <button class="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded-full px-2 py-1 text-xs lg:px-2 lg:py-1 lg:text-xs xl:px-4 xl:py-1.5 xl:text-sm 2xl:px-6 2xl:py-2 2xl:text-base shadow transition-all duration-200 no-underline">
                      <i class="pi pi-palette text-lg"></i>
                      <span>Editor</span>
                    </button>
                  </NuxtLink>
                </template>
                
                <template v-if="userProfile && userProfile.role === 'admin'">
                  <NuxtLink to="/app/admin" class="no-underline">
                    <button class="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full px-2 py-1 text-xs lg:px-2 lg:py-1 lg:text-xs xl:px-4 xl:py-1.5 xl:text-sm 2xl:px-6 2xl:py-2 2xl:text-base shadow transition-all duration-200 no-underline">
                      <i class="pi pi-cog text-lg"></i>
                      <span>Admin</span>
                    </button>
                  </NuxtLink>
                </template>
              </div>
              
              <button @click="handleSignOut" class="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-full px-2 py-1 text-xs lg:px-2 lg:py-1 lg:text-xs xl:px-4 xl:py-1.5 xl:text-sm 2xl:px-6 2xl:py-2 2xl:text-base shadow transition-all duration-200">
                <i class="pi pi-sign-out text-lg"></i>
                <span>Sign out</span>
              </button>
            </template>
            <template v-else>
              <NuxtLink :to="`/app/login?origin=${route.path === '/app/home' ? 'home' : 'dashboard'}`" class="no-underline">
                <button class="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full px-2 py-1 text-xs lg:px-2 lg:py-1 lg:text-xs xl:px-4 xl:py-1.5 xl:text-sm 2xl:px-6 2xl:py-2 2xl:text-base shadow transition-all duration-200 no-underline">
                  <i class="pi pi-sign-in text-lg"></i>
                  <span>Sign in</span>
                </button>
              </NuxtLink>
              <NuxtLink :to="`/app/signup?origin=${route.path === '/app/home' ? 'home' : 'dashboard'}`" class="no-underline">
                <button class="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full px-2 py-1 text-xs lg:px-2 lg:py-1 lg:text-xs xl:px-4 xl:py-1.5 xl:text-sm 2xl:px-6 2xl:py-2 2xl:text-base shadow transition-all duration-200 no-underline">
                  <i class="pi pi-user-plus text-lg"></i>
                  <span>Sign up</span>
                </button>
              </NuxtLink>
            </template>
          </div>

          <!-- Hamburger button and drawer remain as flex lg:hidden and lg:hidden respectively -->
          <!-- Mobile Menu Button -->
          <div class="flex xl:hidden items-center">
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
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 xl:hidden transition-opacity duration-300"
    ></div>

    <!-- Mobile Drawer Navigation (Gmail style) -->
    <div
      class="fixed top-0 left-0 h-full w-72 max-w-[90vw] bg-white shadow-2xl z-50 xl:hidden transform transition-transform duration-300 ease-in-out rounded-r-2xl border-r border-gray-200"
      :class="mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Profile Section -->
      <div class="flex items-center gap-3 p-6 border-b border-gray-100">
        <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow">
          <i class="pi pi-user text-white text-2xl"></i>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-base font-semibold text-gray-900 truncate">{{ user ? user.email : 'Guest' }}</p>
          <p class="text-xs text-gray-500 truncate">{{ user ? 'Authenticated' : 'Limited access' }}</p>
        </div>
      </div>
      <div class="overflow-y-auto flex-1">
        <nav class="py-2">
          <NuxtLink to="/app/home" class="flex items-center gap-3 px-6 py-3 hover:bg-gray-100 transition rounded-xl" @click="closeMobileMenu">
            <i class="pi pi-home text-xl text-blue-600"></i>
            <span class="font-medium text-gray-900">Home</span>
          </NuxtLink>
          <NuxtLink to="/app/upload" class="flex items-center gap-3 px-6 py-3 hover:bg-gray-100 transition rounded-xl" @click="closeMobileMenu">
            <i class="pi pi-upload text-xl text-purple-600"></i>
            <span class="font-medium text-gray-900">Upload</span>
          </NuxtLink>
          <NuxtLink to="/app/review" class="flex items-center gap-3 px-6 py-3 hover:bg-gray-100 transition rounded-xl" @click="closeMobileMenu">
            <i class="pi pi-check-circle text-xl text-pink-600"></i>
            <span class="font-medium text-gray-900">Review</span>
          </NuxtLink>
          <NuxtLink to="/app/memory-books" class="flex items-center gap-3 px-6 py-3 hover:bg-gray-100 transition rounded-xl" @click="closeMobileMenu">
            <i class="pi pi-book text-xl text-green-600"></i>
            <span class="font-medium text-gray-900">Memories</span>
          </NuxtLink>
          <div class="my-2 border-t border-gray-200"></div>
          <template v-if="userProfile && (userProfile.role === 'admin' || userProfile.role === 'editor')">
            <NuxtLink to="/app/editor" class="flex items-center gap-3 px-6 py-3 hover:bg-gray-100 transition rounded-xl" @click="closeMobileMenu">
              <i class="pi pi-palette text-xl text-yellow-600"></i>
              <span class="font-medium text-gray-900">Editor</span>
            </NuxtLink>
          </template>
          <template v-if="userProfile && userProfile.role === 'admin'">
            <NuxtLink to="/app/admin" class="flex items-center gap-3 px-6 py-3 hover:bg-gray-100 transition rounded-xl" @click="closeMobileMenu">
              <i class="pi pi-cog text-xl text-red-600"></i>
              <span class="font-medium text-gray-900">Admin</span>
            </NuxtLink>
          </template>
          <div class="my-2 border-t border-gray-200"></div>
          <template v-if="user">
            <button @click="handleSignOut" class="flex items-center gap-3 px-6 py-3 w-full hover:bg-gray-100 transition rounded-xl">
              <i class="pi pi-sign-out text-xl text-gray-600"></i>
              <span class="font-medium text-gray-900">Sign Out</span>
            </button>
          </template>
          <template v-else>
            <NuxtLink to="/app/login" class="flex items-center gap-3 px-6 py-3 hover:bg-gray-100 transition rounded-xl" @click="closeMobileMenu">
              <i class="pi pi-sign-in text-xl text-blue-600"></i>
              <span class="font-medium text-gray-900">Sign In</span>
            </NuxtLink>
            <NuxtLink to="/app/signup" class="flex items-center gap-3 px-6 py-3 hover:bg-gray-100 transition rounded-xl" @click="closeMobileMenu">
              <i class="pi pi-user-plus text-xl text-green-600"></i>
              <span class="font-medium text-gray-900">Sign Up</span>
            </NuxtLink>
          </template>
        </nav>
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
          <span v-if="userProfile && userProfile.role === 'admin'" class="ml-2 text-sm text-red-600 font-semibold">administrator</span>
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
  
  // Always start with Home
  if (route.path.startsWith('/app/')) {
    crumbs.push({ label: 'Home', to: '/app/home' })
    
    // Add Dashboard if not on home page
    if (route.path !== '/app/home') {
      crumbs.push({ label: 'Dashboard', to: '/app/dashboard' })
    }
  } else {
    crumbs.push({ label: 'Home', to: '/' })
  }
  
  // Add current page if not home or dashboard
  if (route.path !== '/app/home' && route.path !== '/app/dashboard' && route.name && route.name !== 'index') {
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