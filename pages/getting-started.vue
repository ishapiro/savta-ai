<template>
  <div class="max-w-full sm:max-w-4xl mx-auto px-2 sm:px-4 lg:px-8 py-6 sm:py-8">
    <div class="text-center mb-8 sm:mb-12">
      <h1 class="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Contact Us</h1>
      <p class="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
        Get in touch with the Savta AI team.
      </p>
    </div>
    <div class="bg-white rounded-lg shadow-md p-4 sm:p-8 border border-gray-200 max-w-xl mx-auto">
      <div class="text-center">
        <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-2xl">📧</span>
        </div>
        <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Coming Soon</h2>
        <p class="text-gray-600 mb-6 text-base sm:text-lg">
          This page will use a wizard to walk the user throught the creation of their first newsletter (family scrabook)
        </p>
        <Button 
          label="Back to Home" 
          class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg w-full max-w-xs mx-auto"
          @click="() => navigateTo('/app')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
// No additional setup needed
</script> 