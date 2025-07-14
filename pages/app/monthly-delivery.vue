<template>
  <div class="max-w-full sm:max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 sm:py-8">
    <div class="text-center mb-8 sm:mb-12">
      <div class="w-20 h-20 sm:w-24 sm:h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <i class="pi pi-calendar text-pink-500 text-3xl sm:text-4xl"></i>
      </div>
      <h2 class="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Monthly Delivery</h2>
      <p class="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
        Beautiful memories delivered to your family every month.
      </p>
    </div>
    
    <div class="bg-white rounded-lg shadow-lg p-8 sm:p-12 text-center max-w-2xl mx-auto">
      <div class="mb-8">
        <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="pi pi-clock text-yellow-500 text-2xl"></i>
        </div>
        <h3 class="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">Coming Soon!</h3>
        <p class="text-gray-600 leading-relaxed">
          We're working hard to bring you monthly memory book deliveries. 
          This feature will allow you to automatically receive beautiful, 
          AI-generated scrapbooks of your family's precious moments every month.
        </p>
        <p class="mt-2 mx-3 text-gray-600 leading-relaxed">
          While you are waiting for book deliveries you can download your memories as a PDF.
        </p>
      </div>
      
      <div class="space-y-4">
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-semibold text-gray-900 mb-2">What to expect:</h4>
          <ul class="text-sm text-gray-600 space-y-1 text-left">
            <li class="flex items-center gap-2">
              <i class="pi pi-check text-green-500"></i>
              Monthly curated memory books
            </li>
            <li class="flex items-center gap-2">
              <i class="pi pi-check text-green-500"></i>
              Beautiful layouts and captions
            </li>
            <li class="flex items-center gap-2">
              <i class="pi pi-check text-green-500"></i>
              Family sharing and collaboration
            </li>
            <li class="flex items-center gap-2">
              <i class="pi pi-check text-green-500"></i>
              Customizable delivery preferences
            </li>
          </ul>
        </div>
        
        <button
          @click="navigateToUpload"
          class="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
        >
          Start Creating Memories Now
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default'
})

function navigateToUpload() {
  navigateTo('/app/upload')
}
</script> 