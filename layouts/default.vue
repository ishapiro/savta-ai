<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Header -->
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <NuxtLink to="/" class="flex items-center no-underline transition-all hover:opacity-80 focus:outline-none">
              <img src="/savta.webp" alt="savta.ai Logo" class="h-14 w-auto" />
            </NuxtLink>
            <span class="pb-1 pl-2 text-xl font-bold text-purple-600 self-end">savta</span>
            <span class="pb-2 pl-5 text-sm font-bold text-purple-300 self-end">(beta: no warranty, no support)</span>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center space-x-4">
            <NuxtLink to="/app">
              <Button icon="pi pi-home" rounded aria-label="Home" />
            </NuxtLink>
            
            <template v-if="user">
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
        <div v-show="mobileMenuOpen" class="md:hidden border-t border-gray-200 bg-white">
          <div class="px-2 pt-2 pb-3 space-y-1">
            <NuxtLink 
              to="/app" 
              class="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              @click="mobileMenuOpen = false"
            >
              <i class="pi pi-home mr-3 text-primary-600"></i>
              Home
            </NuxtLink>
            
            <template v-if="user">
              <button
                @click="handleSignOut"
                class="flex items-center w-full px-3 py-2 text-base font-medium text-primary-700 hover:text-primary-900 hover:bg-primary-50 rounded-md transition-colors"
              >
                <i class="pi pi-sign-out mr-3 text-primary-600"></i>
                Sign out
              </button>
            </template>
            <template v-else>
              <NuxtLink 
                to="/app/login" 
                class="flex items-center px-3 py-2 text-base font-medium text-primary-700 hover:text-primary-900 hover:bg-primary-50 rounded-md transition-colors"
                @click="mobileMenuOpen = false"
              >
                <i class="pi pi-sign-in mr-3 text-primary-600"></i>
                Sign in
              </NuxtLink>
              <NuxtLink 
                to="/app/signup" 
                class="flex items-center px-3 py-2 text-base font-medium text-primary-700 hover:text-primary-900 hover:bg-primary-50 rounded-md transition-colors"
                @click="mobileMenuOpen = false"
              >
                <i class="pi pi-user-plus mr-3 text-primary-600"></i>
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
        <Breadcrumb
          :model="breadcrumbItems"
          separatorIcon="pi pi-chevron-right"
          class="text-sm flex items-center space-x-2 list-none p-0 m-0 [&_ol]:flex [&_ol]:flex-row [&_li]:m-0 [&_li]:p-0 [&_li]:list-none [&_.p-breadcrumb-separator]:mx-2 [&_.p-breadcrumb-separator]:inline-flex [&_.p-breadcrumb-separator]:items-center"
        />
      </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1">
      <NuxtPage />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-8">
      <div class="max-w-full mx-auto px-4 sm:px-8 py-6 flex flex-col md:flex-row items-center justify-between">
        <div class="text-gray-400 text-sm text-center md:text-left w-full md:w-auto">
          Savta is a Cogitations Property.  &copy; 2025 Cogitations, llc.  All rights reserved.
          <span v-if="buildInfo" class="ml-2 text-smc text-gray-300">Build: {{ buildInfo }}</span>
        </div>
        <div class="flex space-x-6 mt-4 md:mt-0 w-full md:w-auto justify-center md:justify-end">
          <NuxtLink to="/about" class="text-gray-500 hover:text-purple-600 text-sm">About</NuxtLink>
          <NuxtLink to="/privacy" class="text-gray-500 hover:text-purple-600 text-sm">Privacy</NuxtLink>
          <NuxtLink to="/terms" class="text-gray-500 hover:text-purple-600 text-sm">Terms</NuxtLink>
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

// Improved: dynamic breadcrumb for nested routes
const breadcrumbItems = computed(() => {
  const crumbs = []
  const pathArray = route.path.split('/').filter(Boolean)
  let path = ''
  if (pathArray.length === 0) {
    crumbs.push({ label: 'Home', to: '/' })
  } else {
    crumbs.push({ label: 'Home', to: '/' })
    pathArray.forEach((segment, idx) => {
      path += '/' + segment
      // Capitalize and replace dashes/underscores
      const label = segment.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      crumbs.push({ label, to: idx === pathArray.length - 1 ? undefined : path })
    })
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