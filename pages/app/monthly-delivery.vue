<template>
  <div class="max-w-full sm:max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 sm:py-8">
    <div class="text-center mb-8 sm:mb-12">
      <div class="w-20 h-20 sm:w-24 sm:h-24 bg-brand-navigation rounded-full flex items-center justify-center mx-auto mb-6">
        <i class="pi pi-calendar text-brand-secondary text-3xl sm:text-4xl"></i>
      </div>
      <h2 class="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Print & Mail Service</h2>
      <p class="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
        Print and mail your memory cards and books to family members, or share them digitally.
      </p>
    </div>
    
    <div class="bg-white rounded-lg shadow-lg p-8 sm:p-12 text-center max-w-2xl mx-auto">
      <div class="mb-8">
        <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="pi pi-clock text-yellow-500 text-2xl"></i>
        </div>
        <h3 class="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">Print & Mail Service Coming Soon!</h3>
        <p class="text-gray-600 leading-relaxed">
          We're working hard to bring you automatic print and mail service. 
          Soon you'll be able to set up subscriptions to automatically print and mail 
          your memory cards and books to family members on a schedule you choose.
        </p>
        <p class="mt-2 mx-3 text-gray-600 leading-relaxed">
          During beta, you can download your memory cards and books as PDFs to share digitally. 
          Print and mail service will be available after our initial launch.
        </p>
      </div>
      
      <div class="space-y-4">
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-semibold text-gray-900 mb-2">Subscription options coming soon:</h4>
          <ul class="text-sm text-gray-600 space-y-1 text-left">
            <li class="flex items-center gap-2">
              <i class="pi pi-check text-green-500"></i>
              Weekly, monthly, or on-demand delivery
            </li>
            <li class="flex items-center gap-2">
              <i class="pi pi-check text-green-500"></i>
              Memory cards and books printed and mailed
            </li>
            <li class="flex items-center gap-2">
              <i class="pi pi-check text-green-500"></i>
              Multiple family members per subscription
            </li>
            <li class="flex items-center gap-2">
              <i class="pi pi-check text-green-500"></i>
              Pause or cancel anytime
            </li>
          </ul>
        </div>
        
        <button
          @click="navigateToUpload"
          class="bg-brand-secondary hover:bg-brand-secondary/80 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
        >
          Create Memory Cards Now
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