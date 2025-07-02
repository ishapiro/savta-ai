<template>
  <div class="max-w-full sm:max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 sm:py-8">
    <div class="text-center mb-8 sm:mb-12">
      <h1 class="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Welcome to Savta AI</h1>
      <p class="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
        Your AI-powered family newsletter platform. Create beautiful weekly scrapbooks from your photos and memories.
      </p>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
      <!-- Feature Cards -->
      <div class="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
        <div class="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
          <span class="text-xl sm:text-2xl">📸</span>
        </div>
        <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Photo Upload</h3>
        <p class="text-gray-600 text-sm sm:text-base">Upload your weekly photos and let AI organize them into beautiful layouts.</p>
      </div>
      <div class="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
        <div class="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
          <span class="text-xl sm:text-2xl">🤖</span>
        </div>
        <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">AI Generation</h3>
        <p class="text-gray-600 text-sm sm:text-base">Our AI creates engaging content and captions for your family memories.</p>
      </div>
      <div class="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
        <div class="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
          <span class="text-xl sm:text-2xl">📧</span>
        </div>
        <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Weekly Delivery</h3>
        <p class="text-gray-600 text-sm sm:text-base">Beautiful newsletters delivered to your family every weekend.</p>
      </div>
    </div>
    <div class="mt-8 text-center">
      <Button 
        label="Get Started" 
        class="bg-purple-600 hover:bg-purple-700 text-white px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-semibold rounded-lg w-full max-w-xs sm:max-w-md mx-auto"
        @click="() => navigateTo('/reviews')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// No additional setup needed
</script> 