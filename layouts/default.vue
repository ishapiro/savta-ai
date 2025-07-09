<template>
  <div class="min-h-screen flex flex-col surface-ground">
    <!-- Header -->
    <header class="surface-section shadow-sm">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <NuxtLink to="/" class="flex items-center no-underline transition-all hover:opacity-80 focus:outline-none">
              <SavtaIcon :iconClass="'inline-block h-14 w-14'" />
            </NuxtLink>
            <span class="pb-1 pl-2 text-2xl font-extrabold text-pink-500 self-end font-sans tracking-tight">savta</span>
            <span class="ml-3 pb-2 self-end">
              <span class="inline-block bg-pink-100 text-pink-600 text-xs font-semibold px-3 py-1 rounded-full border border-pink-200 align-middle shadow-sm">beta: no warranty, no support</span>
            </span>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center space-x-4">
            <NuxtLink to="/app/dashboard" class="no-underline">
              <button class="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full px-6 py-2 text-base shadow transition-all duration-200 no-underline">
                <i class="pi pi-home text-xl"></i>
                <span class="hidden sm:inline">Home</span>
              </button>
            </NuxtLink>
            
            <template v-if="user">
              <!-- App Navigation -->
              <div class="flex items-center space-x-2">
                <NuxtLink to="/app/upload" class="no-underline">
                  <button class="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-full px-6 py-2 text-base shadow transition-all duration-200 no-underline">
                    <i class="pi pi-upload text-xl"></i>
                    <span class="hidden sm:inline">Upload</span>
                  </button>
                </NuxtLink>
                <NuxtLink to="/app/review" class="no-underline">
                  <button class="flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-full px-6 py-2 text-base shadow transition-all duration-200 no-underline">
                    <i class="pi pi-check-circle text-xl"></i>
                    <span class="hidden sm:inline">Review</span>
                  </button>
                </NuxtLink>
                <NuxtLink to="/app/memory-books" class="no-underline">
                  <button class="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full px-6 py-2 text-base shadow transition-all duration-200 no-underline">
                    <i class="pi pi-book text-xl"></i>
                    <span class="hidden sm:inline">Books</span>
                  </button>
                </NuxtLink>
                
                <!-- Admin/Editor Navigation -->
                <template v-if="userProfile && (userProfile.role === 'admin' || userProfile.role === 'editor')">
                  <NuxtLink to="/app/editor" class="no-underline">
                    <button class="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded-full px-6 py-2 text-base shadow transition-all duration-200 no-underline">
                      <i class="pi pi-palette text-xl"></i>
                      <span class="hidden sm:inline">Editor</span>
                    </button>
                  </NuxtLink>
                </template>
                
                <template v-if="userProfile && userProfile.role === 'admin'">
                  <NuxtLink to="/app/admin" class="no-underline">
                    <button class="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full px-6 py-2 text-base shadow transition-all duration-200 no-underline">
                      <i class="pi pi-cog text-xl"></i>
                      <span class="hidden sm:inline">Admin</span>
                    </button>
                  </NuxtLink>
                </template>
              </div>
              
              <button @click="handleSignOut" class="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-full px-6 py-2 text-base shadow transition-all duration-200">
                <i class="pi pi-sign-out text-xl"></i>
                <span class="hidden sm:inline">Sign out</span>
              </button>
            </template>
            <template v-else>
              <NuxtLink to="/app/login" class="no-underline">
                <button class="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full px-6 py-2 text-base shadow transition-all duration-200 no-underline">
                  <i class="pi pi-sign-in text-xl"></i>
                  <span class="hidden sm:inline">Sign in</span>
                </button>
              </NuxtLink>
              <NuxtLink to="/app/signup" class="no-underline">
                <button class="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full px-6 py-2 text-base shadow transition-all duration-200 no-underline">
                  <i class="pi pi-user-plus text-xl"></i>
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
              aria-label="Toggle mobile menu"
            />
          </div>
        </div>

        <!-- Mobile Navigation -->
        <div v-show="mobileMenuOpen" class="md:hidden border-t border-surface-border surface-section">
          <div class="px-2 pt-2 pb-3 space-y-1">
            <NuxtLink 
              to="/app/dashboard" 
              class="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full px-6 py-3 text-base shadow transition-all duration-200 mb-2 no-underline"
              @click="mobileMenuOpen = false"
            >
              <i class="pi pi-home mr-3 text-xl"></i>
              Home
            </NuxtLink>
            
            <template v-if="user">
              <!-- App Navigation -->
              <NuxtLink 
                to="/app/upload" 
                class="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-full px-6 py-3 text-base shadow transition-all duration-200 mb-2 no-underline"
                @click="mobileMenuOpen = false"
              >
                <i class="pi pi-upload mr-3 text-xl"></i>
                Upload
              </NuxtLink>
              <NuxtLink 
                to="/app/review" 
                class="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-full px-6 py-3 text-base shadow transition-all duration-200 mb-2 no-underline"
                @click="mobileMenuOpen = false"
              >
                <i class="pi pi-check-circle mr-3 text-xl"></i>
                Review
              </NuxtLink>
              <NuxtLink 
                to="/app/memory-books" 
                class="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full px-6 py-3 text-base shadow transition-all duration-200 mb-2 no-underline"
                @click="mobileMenuOpen = false"
              >
                <i class="pi pi-book mr-3 text-xl"></i>
                Books
              </NuxtLink>
              
              <!-- Admin/Editor Navigation -->
              <template v-if="userProfile && (userProfile.role === 'admin' || userProfile.role === 'editor')">
                <NuxtLink 
                  to="/app/editor" 
                  class="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded-full px-6 py-3 text-base shadow transition-all duration-200 mb-2 no-underline"
                  @click="mobileMenuOpen = false"
                >
                  <i class="pi pi-palette mr-3 text-xl"></i>
                  Editor
                </NuxtLink>
              </template>
              
              <template v-if="userProfile && userProfile.role === 'admin'">
                <NuxtLink 
                  to="/app/admin" 
                  class="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full px-6 py-3 text-base shadow transition-all duration-200 mb-2 no-underline"
                  @click="mobileMenuOpen = false"
                >
                  <i class="pi pi-cog mr-3 text-xl"></i>
                  Admin
                </NuxtLink>
              </template>
              
              <button
                @click="handleSignOut"
                class="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-full px-6 py-3 text-base shadow transition-all duration-200 w-full mb-2"
              >
                <i class="pi pi-sign-out mr-3 text-xl"></i>
                Sign out
              </button>
            </template>
            <template v-else>
              <NuxtLink 
                to="/app/login" 
                class="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full px-6 py-3 text-base shadow transition-all duration-200 mb-2 no-underline"
                @click="mobileMenuOpen = false"
              >
                <i class="pi pi-sign-in mr-3 text-xl"></i>
                Sign in
              </NuxtLink>
              <NuxtLink 
                to="/app/signup" 
                class="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full px-6 py-3 text-base shadow transition-all duration-200 mb-2 no-underline"
                @click="mobileMenuOpen = false"
              >
                <i class="pi pi-user-plus mr-3 text-xl"></i>
                Sign up
              </NuxtLink>
            </template>
          </div>
        </div>
      </nav>
    </header>

    <!-- Breadcrumb aligned with header content -->
    <div class="hidden md:block">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb :model="breadcrumbItems" class="text-sm outline-none focus:outline-none ring-0" />
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
const client = useSupabaseClient()
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const route = useRoute()

const mobileMenuOpen = ref(false)
const config = useRuntimeConfig()
const buildInfo = config.public.buildDate
const userProfile = ref(null)

// Load user profile when user changes
watch(user, async (newUser) => {
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
    if (user.value) {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
      }
    }
    if (process.client) {
      sessionStorage.removeItem('insiders-access')
    }
  } catch (err) {
    console.error('Sign out error:', err)
  }
}

const handleSignIn = () => {
  navigateTo('/app/login')
}

import SavtaIcon from '~/components/SavtaIcon.vue'
</script> 