<template>
  <div class="min-h-screen flex flex-col surface-ground">
    <!-- Header -->
    <header class="surface-section shadow-sm">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <NuxtLink to="/" class="flex items-center no-underline transition-all hover:opacity-80 focus:outline-none">
              <img src="/savta.webp" alt="savta.ai Logo" class="h-14 w-auto" />
            </NuxtLink>
            <span class="pb-1 pl-2 text-xl font-bold text-primary self-end">savta</span>
            <span class="pb-2 pl-5 text-sm font-bold text-primary-300 self-end">(beta: no warranty, no support)</span>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center space-x-4">
            <NuxtLink to="/app/dashboard">
              <Button icon="pi pi-home" rounded aria-label="Home" />
            </NuxtLink>
            
            <template v-if="user">
              <!-- App Navigation -->
              <div class="flex items-center space-x-2">
                <NuxtLink to="/app/upload">
                  <Button label="Upload" severity="primary" text-sm />
                </NuxtLink>
                <NuxtLink to="/app/review">
                  <Button label="Review" severity="info" text-sm />
                </NuxtLink>
                <NuxtLink to="/app/memory-books">
                  <Button label="Books" severity="success" text-sm />
                </NuxtLink>
                
                <!-- Admin/Editor Navigation -->
                <template v-if="userProfile && (userProfile.role === 'admin' || userProfile.role === 'editor')">
                  <NuxtLink to="/app/editor">
                    <Button label="Editor" severity="warning" text-sm />
                  </NuxtLink>
                </template>
                
                <template v-if="userProfile && userProfile.role === 'admin'">
                  <NuxtLink to="/app/admin">
                    <Button label="Admin" severity="danger" text-sm />
                  </NuxtLink>
                </template>
              </div>
              
              <Button
                @click="handleSignOut"
                icon="pi pi-sign-out"
                rounded
                aria-label="Sign out"
              />
            </template>
            <template v-else>
              <NuxtLink to="/app/login">
                <Button label="Sign in" />
              </NuxtLink>
              <NuxtLink to="/app/signup">
                <Button label="Sign up" />
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
              class="flex items-center px-3 py-2 text-base font-medium text-color hover:text-color hover:bg-surface-100 rounded-md transition-colors"
              @click="mobileMenuOpen = false"
            >
              <i class="pi pi-home mr-3 text-primary"></i>
              Home
            </NuxtLink>
            
            <template v-if="user">
              <!-- App Navigation -->
              <NuxtLink 
                to="/app/upload" 
                class="flex items-center px-3 py-2 text-base font-medium text-color hover:text-color hover:bg-surface-100 rounded-md transition-colors"
                @click="mobileMenuOpen = false"
              >
                <i class="pi pi-upload mr-3 text-primary"></i>
                Upload
              </NuxtLink>
              <NuxtLink 
                to="/app/review" 
                class="flex items-center px-3 py-2 text-base font-medium text-color hover:text-color hover:bg-surface-100 rounded-md transition-colors"
                @click="mobileMenuOpen = false"
              >
                <i class="pi pi-check-circle mr-3 text-info"></i>
                Review
              </NuxtLink>
              <NuxtLink 
                to="/app/memory-books" 
                class="flex items-center px-3 py-2 text-base font-medium text-color hover:text-color hover:bg-surface-100 rounded-md transition-colors"
                @click="mobileMenuOpen = false"
              >
                <i class="pi pi-book mr-3 text-success"></i>
                Books
              </NuxtLink>
              
              <!-- Admin/Editor Navigation -->
              <template v-if="userProfile && (userProfile.role === 'admin' || userProfile.role === 'editor')">
                <NuxtLink 
                  to="/app/editor" 
                  class="flex items-center px-3 py-2 text-base font-medium text-color hover:text-color hover:bg-surface-100 rounded-md transition-colors"
                  @click="mobileMenuOpen = false"
                >
                  <i class="pi pi-palette mr-3 text-warning"></i>
                  Editor
                </NuxtLink>
              </template>
              
              <template v-if="userProfile && userProfile.role === 'admin'">
                <NuxtLink 
                  to="/app/admin" 
                  class="flex items-center px-3 py-2 text-base font-medium text-color hover:text-color hover:bg-surface-100 rounded-md transition-colors"
                  @click="mobileMenuOpen = false"
                >
                  <i class="pi pi-cog mr-3 text-danger"></i>
                  Admin
                </NuxtLink>
              </template>
              
              <button
                @click="handleSignOut"
                class="flex items-center w-full px-3 py-2 text-base font-medium text-primary hover:text-primary hover:bg-primary-50 rounded-md transition-colors"
              >
                <i class="pi pi-sign-out mr-3 text-primary"></i>
                Sign out
              </button>
            </template>
            <template v-else>
              <NuxtLink 
                to="/app/login" 
                class="flex items-center px-3 py-2 text-base font-medium text-primary hover:text-primary hover:bg-primary-50 rounded-md transition-colors"
                @click="mobileMenuOpen = false"
              >
                <i class="pi pi-sign-in mr-3 text-primary"></i>
                Sign in
              </NuxtLink>
              <NuxtLink 
                to="/app/signup" 
                class="flex items-center px-3 py-2 text-base font-medium text-primary hover:text-primary hover:bg-primary-50 rounded-md transition-colors"
                @click="mobileMenuOpen = false"
              >
                <i class="pi pi-user-plus mr-3 text-primary"></i>
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
</script> 