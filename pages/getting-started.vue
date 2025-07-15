<template>
  <div class="max-w-full sm:max-w-4xl mx-auto px-2 sm:px-4 lg:px-8 py-6 sm:py-8">
    <div class="text-center mb-8 sm:mb-12">
      <h1 class="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Getting Started with Savta Magic Memories</h1>
      <p class="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
        Welcome! Savta helps you collect, organize, and share your family memories with the help of magic (some people call it AI). Here’s how to get started:
      </p>
    </div>
    <div class="bg-white rounded-lg shadow-md p-4 sm:p-8 border border-gray-200 max-w-xl mx-auto">
      <div class="text-center">
        <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="pi pi-sparkles text-2xl text-purple-500"></i>
        </div>
        <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Let’s Get Started!</h2>
        <div class="text-gray-600 mb-6 text-base sm:text-lg text-left">
          <ol class="list-decimal list-inside space-y-2">
            <li><b>Upload Memory Moments:</b> Click <span class="text-green-600 font-semibold">Add Your First Memory Moment</span> to upload photos and stories. Our AI will help organize and caption them for you.</li>
            <li><b>Review & Approve:</b> Go to the <span class="text-pink-600 font-semibold">Review</span> page to approve, edit, or delete your memories. 
              Only approved memories are included in your Savta Magic Memory.</li>
            <li><b>Generate Savta's Magic Memories:</b> When you’re ready, generate a beautiful Savta's Magic Memory from your approved memory moments. 
              Download or print to share with your family!</li>
            <li><b>Manage & Restore:</b> Accidentally deleted something? Visit the <span class="text-pink-600 font-semibold">Deleted Memory Moment</span> 
              page to restore memory moments.</li>
          </ol>
          <div class="mt-4 text-sm text-blue-700 bg-blue-50 rounded p-3">
            <b>Tip:</b> You can always upload and review memory moments, and create Savta Magic Memories from the top navigation bar.
          </div>
        </div>
        
        <div class="flex flex-col gap-4 mt-6">
          <button
            class="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full px-8 py-3 text-lg shadow transition-all duration-200 w-full max-w-xs mx-auto"
            @click="handleGetStarted"
            :disabled="user === null"
          >
            <i class="pi pi-plus-circle text-2xl animate-bounce"></i>
            Add Your First Memory Moments
          </button>
          <button
            class="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-full px-8 py-3 text-lg shadow transition-all duration-200 w-full max-w-xs mx-auto"
            @click="() => navigateTo('/app/dashboard')"
          >
            <i class="pi pi-home text-2xl"></i>
            Back to Memory Manor
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSupabaseUser } from '~/composables/useSupabase'
const user = useSupabaseUser()

function handleGetStarted() {
  // Debug log
  console.log('[GettingStarted] handleGetStarted user.value:', user.value)
  if (user.value) {
    console.log('[GettingStarted] Navigating to /app/upload')
    navigateTo('/app/upload')
  } else {
    console.log('[GettingStarted] Navigating to /app/login')
    navigateTo('/app/login')
  }
}
</script> 