<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
      <p class="text-xl text-gray-600">
        How we protect and handle your data.
      </p>
    </div>

    <div class="bg-white rounded-lg shadow-md p-8 border border-gray-200">
      <div class="text-center">
        <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-3xl">🔒</span>
        </div>
        <h2 class="text-2xl font-semibold text-gray-900 mb-2">Coming Soon</h2>
        <p class="text-gray-600 mb-6">
          Our privacy policy is currently under development. We're committed to protecting your family's privacy and will have detailed information here soon.
        </p>
        <Button 
          label="Back to Home" 
          class="bg-purple-700 text-white px-6 py-2 rounded-lg"
          @click="() => navigateTo('/app')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No additional setup needed
</script> 