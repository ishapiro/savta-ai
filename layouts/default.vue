<template>
  <div class="min-h-screen flex flex-col bg-white">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center">
              <img src="/savta-pink.png" alt="Savta AI" class="h-8 w-auto" />
              <span class="ml-2 text-xl font-semibold text-gray-900">Savta AI</span>
            </NuxtLink>
          </div>

          <!-- Navigation -->
          <nav class="hidden md:flex space-x-8">
            <NuxtLink to="/" class="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium">
              Home
            </NuxtLink>
            <NuxtLink to="/reviews" class="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium">
              Reviews
            </NuxtLink>
            <NuxtLink to="/admin" class="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium">
              Admin
            </NuxtLink>
            <NuxtLink to="/about" class="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium">
              About
            </NuxtLink>
          </nav>

          <!-- Profile/Auth -->
          <div class="flex items-center space-x-4">
            <!-- Commented out profile retrieval for now -->
            <!-- <div v-if="user" class="flex items-center space-x-2">
              <img :src="user.avatar_url" :alt="user.name" class="h-8 w-8 rounded-full" />
              <span class="text-sm text-gray-700">{{ user.name }}</span>
            </div> -->
            <Button label="Sign In" class="bg-purple-600 hover:bg-purple-700 text-white" />
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <NuxtPage />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Company Info -->
          <div class="col-span-1 md:col-span-2">
            <div class="flex items-center mb-4">
              <img src="/savta-pink.png" alt="Savta AI" class="h-8 w-auto" />
              <span class="ml-2 text-xl font-semibold">Savta AI</span>
            </div>
            <p class="text-gray-400 mb-4">
              Using AI to help families keep their memories alive with beautiful weekly newsletters.
            </p>
          </div>

          <!-- Quick Links -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Quick Links</h3>
            <ul class="space-y-2">
              <li><NuxtLink to="/" class="text-gray-400 hover:text-white">Home</NuxtLink></li>
              <li><NuxtLink to="/reviews" class="text-gray-400 hover:text-white">Reviews</NuxtLink></li>
              <li><NuxtLink to="/admin" class="text-gray-400 hover:text-white">Admin</NuxtLink></li>
              <li><NuxtLink to="/about" class="text-gray-400 hover:text-white">About</NuxtLink></li>
            </ul>
          </div>

          <!-- Legal -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Legal</h3>
            <ul class="space-y-2">
              <li><NuxtLink to="/privacy" class="text-gray-400 hover:text-white">Privacy Policy</NuxtLink></li>
              <li><NuxtLink to="/terms" class="text-gray-400 hover:text-white">Terms of Service</NuxtLink></li>
              <li><NuxtLink to="/contact" class="text-gray-400 hover:text-white">Contact</NuxtLink></li>
            </ul>
          </div>
        </div>

        <div class="border-t border-gray-800 mt-8 pt-8 text-center">
          <p class="text-gray-400">&copy; 2025 Savta AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Commented out profile retrieval for now
// const user = useSupabaseUser()
</script> 