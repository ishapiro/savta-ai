<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <!-- Header with just the logo -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
              <SavtaIcon class="h-14 w-auto" />
              <span class="ml-5 text-2xl font-bold text-pink-500">Savta</span>
          </div>
          
          <!-- Right side - could add user menu or other elements later -->
          <div class="flex items-center space-x-4">
            <NuxtLink 
              to="/app/dashboard" 
              class="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Go to Dashboard
            </NuxtLink>
          </div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1">
      <NuxtPage />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="text-center text-sm text-gray-500">
          <p>Made with love by Savta • Beta version - no warranty, no support</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
// No additional setup needed
</script> 