<template>
  <div class="min-h-screen flex flex-col surface-ground">
    <!-- Add Google Fonts -->
    <Head>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=EB+Garamond:wght@400;500;600;700&display=swap" rel="stylesheet">
    </Head>
    <!-- Header -->
    <header class="border-0 bg-brand-background sticky top-0 z-40">
      <nav class="w-full px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center justify-center sm:justify-start flex-1 sm:flex-none">
            <NuxtLink to="/" class="flex items-center space-x-2 no-underline">
              <SavtaIcon class="h-12 w-auto" />
              <span class="text-xl font-bold text-brand-secondary no-underline">Savta</span>
            </NuxtLink>
          </div>

          <!-- Desktop Navigation - Hamburger Menu -->
          <div class="hidden xl:flex items-center">
            <div class="relative desktop-menu-container" @click="handleClickOutside">
              <!-- Hamburger Icon -->
              <button
                @click="toggleDesktopMenu"
                @mouseenter="showDesktopMenu = true"
                class="relative w-10 h-10 flex flex-col justify-center items-center focus:outline-none focus:ring-2 focus:ring-brand-header focus:ring-offset-2 rounded-lg transition-all duration-200 bg-brand-background hover:bg-brand-highlight/20"
                :class="desktopMenuOpen ? 'bg-brand-accent/20' : ''"
                aria-label="Toggle navigation menu"
              >
                <!-- Hamburger Icon with Animation -->
                <span 
                  class="w-5 h-0.5 bg-brand-secondary rounded-full transition-all duration-300 ease-in-out"
                  :class="desktopMenuOpen ? 'rotate-45 translate-y-1.5' : ''"
                ></span>
                <span 
                  class="w-5 h-0.5 bg-brand-secondary rounded-full transition-all duration-300 ease-in-out mt-1"
                  :class="desktopMenuOpen ? 'opacity-0' : ''"
                ></span>
                <span 
                  class="w-5 h-0.5 bg-brand-secondary rounded-full transition-all duration-300 ease-in-out mt-1"
                  :class="desktopMenuOpen ? '-rotate-45 -translate-y-1.5' : ''"
                ></span>
              </button>

              <!-- Desktop Navigation Modal -->
              <div
                v-if="showDesktopMenu || desktopMenuOpen"
                @mouseleave="showDesktopMenu = false"
                class="absolute top-12 right-0 w-80 xl:w-96 2xl:w-[28rem] bg-brand-background border border-brand-highlight/30 rounded-xl shadow-2xl z-50 overflow-hidden"
              >
                <!-- Modal Header -->
                <div class="bg-gradient-to-r from-brand-header/10 to-brand-secondary/10 p-4 border-b border-brand-highlight/30">
                  <h3 class="text-lg font-semibold text-brand-secondary flex items-center gap-2">
                    <i class="pi pi-th-large text-brand-header"></i>
                    Navigation
                  </h3>
                </div>

                <!-- Modal Content -->
                <div class="p-4 space-y-3">
                  <!-- Primary Actions -->
                  <div class="space-y-2">
                    <h4 class="text-sm font-medium text-brand-primary/70 uppercase tracking-wide">Main</h4>
                    
                    <!-- Home -->
                    <NuxtLink to="/app/home" class="flex items-center gap-3 p-3 hover:bg-brand-highlight/20 transition rounded-lg group" @click="closeDesktopMenu">
                      <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <i class="pi pi-home text-white text-sm"></i>
                      </div>
                      <div class="flex-1">
                        <div class="font-medium text-brand-secondary text-sm">Home</div>
                        <div class="text-xs text-brand-primary/70">Welcome page</div>
                      </div>
                    </NuxtLink>

                    <!-- Getting Started -->
                    <NuxtLink to="/getting-started" class="flex items-center gap-3 p-3 hover:bg-brand-highlight/20 transition rounded-lg group" @click="closeDesktopMenu">
                      <div class="w-8 h-8 bg-brand-primary/70 rounded-lg flex items-center justify-center">
                        <i class="pi pi-th-large text-white text-sm"></i>
                      </div>
                      <div class="flex-1">
                        <div class="font-medium text-brand-secondary text-sm">Getting Started</div>
                        <div class="text-xs text-brand-primary/70">How Savta.ai works</div>
                      </div>
                    </NuxtLink>
                  </div>

                  <!-- User Actions -->
                  <template v-if="user && userProfile && !userProfile.deleted">
                    <div class="space-y-2">
                      <h4 class="text-sm font-medium text-brand-primary/70 uppercase tracking-wide">Manage</h4>
                      
                      <!-- Upload -->
                      <NuxtLink to="/app/upload" class="flex items-center gap-3 p-3 hover:bg-brand-highlight/20 transition rounded-lg group" @click="closeDesktopMenu">
                        <div class="w-8 h-8 bg-brand-highlight rounded-lg flex items-center justify-center">
                          <i class="pi pi-upload text-white text-sm"></i>
                        </div>
                        <div class="flex-1">
                          <div class="font-medium text-brand-secondary text-sm">Add Photos</div>
                          <div class="text-xs text-brand-primary/70">Upload to Photo Box</div>
                        </div>
                      </NuxtLink>

                      <!-- Review -->
                      <NuxtLink to="/app/review" class="flex items-center gap-3 p-3 hover:bg-brand-highlight/20 transition rounded-lg group" @click="closeDesktopMenu">
                        <div class="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center">
                          <i class="pi pi-check-circle text-white text-sm"></i>
                        </div>
                        <div class="flex-1">
                          <div class="font-medium text-brand-secondary text-sm">Photo Box</div>
                          <div class="text-xs text-brand-primary/70">Review & edit</div>
                        </div>
                      </NuxtLink>

                      <!-- Memory Books -->
                      <NuxtLink to="/app/memory-books" class="flex items-center gap-3 p-3 hover:bg-brand-highlight/20 transition rounded-lg group" @click="closeDesktopMenu">
                        <div class="w-8 h-8 bg-brand-header rounded-lg flex items-center justify-center">
                          <i class="pi pi-book text-white text-sm"></i>
                        </div>
                        <div class="flex-1">
                          <div class="font-medium text-brand-secondary text-sm">Create Memories</div>
                          <div class="text-xs text-brand-primary/70">Create & manage</div>
                        </div>
                      </NuxtLink>

                      <!-- People -->
                      <NuxtLink to="/app/person-manager" class="flex items-center gap-3 p-3 hover:bg-brand-highlight/20 transition rounded-lg group" @click="closeDesktopMenu">
                        <div class="w-8 h-8 bg-brand-flash rounded-lg flex items-center justify-center">
                          <i class="pi pi-users text-white text-sm"></i>
                        </div>
                        <div class="flex-1">
                          <div class="font-medium text-brand-secondary text-sm">People</div>
                          <div class="text-xs text-brand-primary/70">Manage family</div>
                        </div>
                      </NuxtLink>

                      <!-- Admin -->
                      <template v-if="userProfile && (userProfile.role === 'admin' || userProfile.role === 'editor')">
                        <NuxtLink to="/app/admin" class="flex items-center gap-3 p-3 hover:bg-brand-highlight/20 transition rounded-lg group" @click="logEditorClick; closeDesktopMenu">
                          <div class="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                            <i class="pi pi-palette text-white text-sm"></i>
                          </div>
                          <div class="flex-1">
                            <div class="font-medium text-brand-secondary text-sm">Admin</div>
                            <div class="text-xs text-brand-primary/70">System settings</div>
                          </div>
                        </NuxtLink>
                      </template>
                    </div>
                  </template>

                  <!-- Auth Actions -->
                  <template v-if="!user">
                    <div class="space-y-2">
                      <h4 class="text-sm font-medium text-brand-primary/70 uppercase tracking-wide">Account</h4>
                      
                      <NuxtLink :to="`/app/login?origin=${route.path === '/app/home' ? 'home' : 'dashboard'}`" class="flex items-center gap-3 p-3 hover:bg-brand-highlight/20 transition rounded-lg group" @click="closeDesktopMenu">
                        <div class="w-8 h-8 bg-brand-header rounded-lg flex items-center justify-center">
                          <i class="pi pi-sign-in text-white text-sm"></i>
                        </div>
                        <div class="flex-1">
                          <div class="font-medium text-brand-secondary text-sm">Sign In</div>
                          <div class="text-xs text-brand-primary/70">Access your account</div>
                        </div>
                      </NuxtLink>

                      <NuxtLink :to="`/app/signup?origin=${route.path === '/app/home' ? 'home' : 'dashboard'}`" class="flex items-center gap-3 p-3 hover:bg-brand-highlight/20 transition rounded-lg group" @click="closeDesktopMenu">
                        <div class="w-8 h-8 bg-brand-highlight rounded-lg flex items-center justify-center">
                          <i class="pi pi-user-plus text-white text-sm"></i>
                        </div>
                        <div class="flex-1">
                          <div class="font-medium text-brand-secondary text-sm">Sign Up</div>
                          <div class="text-xs text-brand-primary/70">Create new account</div>
                        </div>
                      </NuxtLink>
                    </div>
                  </template>

                  <!-- Sign Out -->
                  <template v-if="user && userProfile && !userProfile.deleted">
                    <div class="border-t border-brand-highlight/30 pt-3">
                      <button @click="handleSignOut" class="flex items-center gap-3 p-3 hover:bg-brand-highlight/20 transition rounded-lg group w-full text-left">
                        <div class="w-8 h-8 bg-brand-background border border-brand-highlight/30 rounded-lg flex items-center justify-center">
                          <i class="pi pi-sign-out text-brand-secondary text-sm"></i>
                        </div>
                        <div class="flex-1">
                          <div class="font-medium text-brand-secondary text-sm">Sign Out</div>
                          <div class="text-xs text-brand-primary/70">End your session</div>
                        </div>
                      </button>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <!-- Hamburger button and drawer remain as flex lg:hidden and lg:hidden respectively -->
          <!-- Mobile Menu Button -->
          <div class="flex xl:hidden items-center">
            <button
              @click="toggleMobileMenu"
              class="relative w-8 h-8 flex flex-col justify-center items-center focus:outline-none focus:ring-2 focus:ring-brand-header focus:ring-offset-2 rounded-lg transition-all duration-200"
              :class="mobileMenuOpen ? 'bg-brand-accent/20' : 'bg-brand-background hover:bg-brand-highlight/20'"
              aria-label="Toggle mobile menu"
            >
              <!-- Hamburger Icon with Animation -->
              <span 
                class="w-5 h-0.5 bg-brand-secondary rounded-full transition-all duration-300 ease-in-out"
                :class="mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''"
              ></span>
              <span 
                class="w-5 h-0.5 bg-brand-secondary rounded-full transition-all duration-300 ease-in-out mt-1"
                :class="mobileMenuOpen ? 'opacity-0' : ''"
              ></span>
              <span 
                class="w-5 h-0.5 bg-brand-secondary rounded-full transition-all duration-300 ease-in-out mt-1"
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

    <!-- Mobile Navigation Modal -->
    <div
      class="fixed top-4 left-4 right-4 max-w-sm mx-auto bg-brand-background border border-brand-highlight/30 rounded-xl shadow-2xl z-50 xl:hidden transform transition-all duration-300 ease-in-out"
      :class="mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'"
    >
      <!-- Modal Header -->
      <div class="bg-gradient-to-r from-brand-header/10 to-brand-secondary/10 p-4 border-b border-brand-highlight/30 rounded-t-xl">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-brand-secondary flex items-center gap-2">
            <i class="pi pi-th-large text-brand-header"></i>
            Navigation
          </h3>
          <button @click="closeMobileMenu" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-highlight/20 transition-colors">
            <i class="pi pi-times text-brand-secondary text-sm"></i>
          </button>
        </div>
      </div>

      <!-- Modal Content -->
      <div class="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
        <!-- Primary Actions -->
        <div class="space-y-2">
          <h4 class="text-sm font-medium text-brand-primary/70 uppercase tracking-wide">Main</h4>
          
          <!-- Home -->
          <NuxtLink to="/app/home" class="flex items-center gap-3 p-3 hover:bg-brand-highlight/20 transition rounded-lg group" @click="closeMobileMenu">
            <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <i class="pi pi-home text-white text-sm"></i>
            </div>
            <div class="flex-1">
              <div class="font-medium text-brand-secondary text-sm">Home</div>
              <div class="text-xs text-brand-primary/70">Welcome page</div>
            </div>
          </NuxtLink>

          <!-- Getting Started -->
          <NuxtLink to="/getting-started" class="flex items-center gap-3 p-3 hover:bg-brand-highlight/20 transition rounded-lg group" @click="closeMobileMenu">
            <div class="w-8 h-8 bg-brand-primary/70 rounded-lg flex items-center justify-center">
              <i class="pi pi-th-large text-white text-sm"></i>
            </div>
            <div class="flex-1">
              <div class="font-medium text-brand-secondary text-sm">Getting Started</div>
              <div class="text-xs text-brand-primary/70">How Savta.ai works</div>
            </div>
          </NuxtLink>
        </div>

        <!-- User Actions -->
        <template v-if="user && userProfile && !userProfile.deleted">
          <div class="space-y-2">
            <h4 class="text-sm font-medium text-brand-primary/70 uppercase tracking-wide">Manage</h4>
            
            <!-- Upload -->
            <NuxtLink to="/app/upload" class="flex items-center gap-3 p-3 hover:bg-brand-highlight/20 transition rounded-lg group" @click="closeMobileMenu">
              <div class="w-8 h-8 bg-brand-highlight rounded-lg flex items-center justify-center">
                <i class="pi pi-upload text-white text-sm"></i>
              </div>
              <div class="flex-1">
                <div class="font-medium text-brand-secondary text-sm">Add Photos</div>
                <div class="text-xs text-brand-primary/70">Upload & organize</div>
              </div>
            </NuxtLink>

            <!-- Review -->
            <NuxtLink to="/app/review" class="flex items-center gap-3 p-3 hover:bg-brand-highlight/20 transition rounded-lg group" @click="closeMobileMenu">
              <div class="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center">
                <i class="pi pi-check-circle text-white text-sm"></i>
              </div>
              <div class="flex-1">
                <div class="font-medium text-brand-secondary text-sm">Photo Box</div>
                <div class="text-xs text-brand-primary/70">Review & edit</div>
              </div>
            </NuxtLink>

            <!-- Memory Books -->
            <NuxtLink to="/app/memory-books" class="flex items-center gap-3 p-3 hover:bg-brand-highlight/20 transition rounded-lg group" @click="closeMobileMenu">
              <div class="w-8 h-8 bg-brand-header rounded-lg flex items-center justify-center">
                <i class="pi pi-book text-white text-sm"></i>
              </div>
              <div class="flex-1">
                <div class="font-medium text-brand-secondary text-sm">Memories</div>
                <div class="text-xs text-brand-primary/70">Create & manage</div>
              </div>
            </NuxtLink>

            <!-- People -->
            <NuxtLink to="/app/person-manager" class="flex items-center gap-3 p-3 hover:bg-brand-highlight/20 transition rounded-lg group" @click="closeMobileMenu">
              <div class="w-8 h-8 bg-brand-flash rounded-lg flex items-center justify-center">
                <i class="pi pi-users text-white text-sm"></i>
              </div>
              <div class="flex-1">
                <div class="font-medium text-brand-secondary text-sm">People</div>
                <div class="text-xs text-brand-primary/70">Manage family</div>
              </div>
            </NuxtLink>

            <!-- Admin -->
            <template v-if="userProfile && (userProfile.role === 'admin' || userProfile.role === 'editor')">
              <NuxtLink to="/app/admin" class="flex items-center gap-3 p-3 hover:bg-brand-highlight/20 transition rounded-lg group" @click="logEditorClick; closeMobileMenu">
                <div class="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                  <i class="pi pi-palette text-white text-sm"></i>
                </div>
                <div class="flex-1">
                  <div class="font-medium text-brand-secondary text-sm">Admin</div>
                  <div class="text-xs text-brand-primary/70">System settings</div>
                </div>
              </NuxtLink>
            </template>
          </div>
        </template>

        <!-- Auth Actions -->
        <template v-if="!user">
          <div class="space-y-2">
            <h4 class="text-sm font-medium text-brand-primary/70 uppercase tracking-wide">Account</h4>
            
            <NuxtLink to="/app/login" class="flex items-center gap-3 p-3 hover:bg-brand-highlight/20 transition rounded-lg group" @click="closeMobileMenu">
              <div class="w-8 h-8 bg-brand-header rounded-lg flex items-center justify-center">
                <i class="pi pi-sign-in text-white text-sm"></i>
              </div>
              <div class="flex-1">
                <div class="font-medium text-brand-secondary text-sm">Sign In</div>
                <div class="text-xs text-brand-primary/70">Access your account</div>
              </div>
            </NuxtLink>

            <NuxtLink to="/app/signup" class="flex items-center gap-3 p-3 hover:bg-brand-highlight/20 transition rounded-lg group" @click="closeMobileMenu">
              <div class="w-8 h-8 bg-brand-highlight rounded-lg flex items-center justify-center">
                <i class="pi pi-user-plus text-white text-sm"></i>
              </div>
              <div class="flex-1">
                <div class="font-medium text-brand-secondary text-sm">Sign Up</div>
                <div class="text-xs text-brand-primary/70">Create new account</div>
              </div>
            </NuxtLink>
          </div>
        </template>

        <!-- Sign Out -->
        <template v-if="user && userProfile && !userProfile.deleted">
          <div class="border-t border-brand-highlight/30 pt-3">
            <button @click="handleSignOut" class="flex items-center gap-3 p-3 hover:bg-brand-highlight/20 transition rounded-lg group w-full text-left">
              <div class="w-8 h-8 bg-brand-background border border-brand-highlight/30 rounded-lg flex items-center justify-center">
                <i class="pi pi-sign-out text-brand-secondary text-sm"></i>
              </div>
              <div class="flex-1">
                <div class="font-medium text-brand-secondary text-sm">Sign Out</div>
                <div class="text-xs text-brand-primary/70">End your session</div>
              </div>
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- Breadcrumb aligned with header content -->
    <div class="hidden md:block bg-brand-background">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav class="flex items-center space-x-2 py-2 text-sm">
          <template v-for="(item, index) in breadcrumbItems" :key="index">
            <NuxtLink 
              v-if="item.to" 
              :to="item.to" 
              class="text-primary hover:text-primary/80 transition-colors"
            >
              {{ item.label }}
            </NuxtLink>
            <span v-else class="text-primary">{{ item.label }}</span>
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
    <footer class="bg-brand-background">
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

    <!-- Tawk to button -->
    <TawkButton />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSupabaseUser } from '~/composables/useSupabase'

// Initialize analytics system
const { trackPageVisit, trackEvent, flushEvents } = useAnalytics()

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
const desktopMenuOpen = ref(false)
const showDesktopMenu = ref(false)
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

// Desktop menu methods
const toggleDesktopMenu = () => {
  desktopMenuOpen.value = !desktopMenuOpen.value
  showDesktopMenu.value = desktopMenuOpen.value
}

const closeDesktopMenu = () => {
  desktopMenuOpen.value = false
  showDesktopMenu.value = false
}

// Close desktop menu when clicking outside
const handleClickOutside = (event) => {
  if (desktopMenuOpen.value && !event.target.closest('.desktop-menu-container')) {
    closeDesktopMenu()
  }
}

// Add event listener for click outside
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Load user profile when user changes
watch(() => user.value, async (newUser) => {
  if (newUser) {
    try {
      const db = useDatabase()
      userProfile.value = await db.getCurrentProfile()
      console.log('[NAV] Loaded userProfile:', userProfile.value)
      
      // If profile is null and user still exists, it might be a deleted user
      if (!userProfile.value && newUser) {
        console.warn('[NAV] User exists but no profile found - user may have been deleted')
        // The getCurrentProfile method should handle signing out deleted users
      }
    } catch (error) {
      console.error('[NAV] Error loading user profile:', error)
      userProfile.value = null
      
      // If there's a persistent error loading profile, it might indicate a deleted user
      // Let the user continue but with limited functionality
    }
  } else {
    userProfile.value = null
    console.log('[NAV] Cleared userProfile (no user)')
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
    
    // Add Getting Started if not on home page
    if (route.path !== '/app/home') {
      crumbs.push({ label: 'Getting Started', to: '/getting-started' })
    }
  } else {
    crumbs.push({ label: 'Home', to: '/' })
  }
  
  // Add current page if not home or getting started
  if (route.path !== '/app/home' && route.path !== '/getting-started' && route.name && route.name !== 'index') {
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
  // Always clear insiders access and navigate to memory books (signed-out state)
    const { clearInsidersAccess } = useInsidersAccess()
    clearInsidersAccess()
  // Force clear the user ref
  import('~/composables/useSupabase').then(mod => {
    mod.globalUser.value = null
  })
    await new Promise(resolve => setTimeout(resolve, 100))
    navigateTo('/app/memory-books')
}

const handleSignIn = () => {
  navigateTo('/app/login')
}

import SavtaIcon from '~/components/SavtaIcon.vue'
const logEditorClick = () => {
  console.log('[NAV] Editor button clicked. user:', user.value, 'userProfile:', userProfile.value)
}
</script> 