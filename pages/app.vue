<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Welcome to Savta AI</h1>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto">
        Your AI-powered family newsletter platform. Create beautiful weekly scrapbooks from your photos and memories.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- Feature Cards -->
      <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
          <span class="text-2xl">📸</span>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Photo Upload</h3>
        <p class="text-gray-600">Upload your weekly photos and let AI organize them into beautiful layouts.</p>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
          <span class="text-2xl">🤖</span>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">AI Generation</h3>
        <p class="text-gray-600">Our AI creates engaging content and captions for your family memories.</p>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
          <span class="text-2xl">📧</span>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Weekly Delivery</h3>
        <p class="text-gray-600">Beautiful newsletters delivered to your family every weekend.</p>
      </div>
    </div>

    <div class="mt-12 text-center">
              <Button 
          label="Get Started" 
          class="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg font-semibold rounded-lg"
          @click="() => navigateTo('/reviews')"
        />
    </div>
  </div>
</template>

<script setup lang="ts">
// No additional setup needed
</script> 