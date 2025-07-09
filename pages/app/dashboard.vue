<template>
  <div class="max-w-full sm:max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 sm:py-8">
    <div class="text-center mb-8 sm:mb-12">
      <h2 class="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Your Savta Scrapbook Dashboard</h2>
      <p class="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
        Create beautiful weekly scrapbooks from your photos and memories with AI assistance.
      </p>
    </div>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
      <!-- Feature Cards -->
      <div class="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
        <div class="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
          <span class="text-xl sm:text-2xl">📸</span>
        </div>
        <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Photo Upload</h3>
        <p class="text-gray-600 text-sm sm:text-base">Upload your photos, thoughts, and memories and let AI organize them into beautiful layouts.</p>
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
        <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Monthly Delivery</h3>
        <p class="text-gray-600 text-sm sm:text-base">Beautiful memories delivered to your family every month.</p>
      </div>
    </div>
    
    <div class="mt-8 text-center">
      <button
        class="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full px-8 py-3 text-lg shadow transition-all duration-200 w-full max-w-xs sm:max-w-md mx-auto"
        @click="goToReviews"
      >
        <i class="pi pi-book text-2xl animate-bounce"></i>
        Get Started
      </button>
    </div>
  </div>
</template>

<script setup>
// Set the layout for this page
definePageMeta({
  layout: 'default'
})

// Get user and Supabase client
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const { hasInsidersAccess, checkInsidersAccess } = useInsidersAccess()

// Refresh insiders access state when component mounts
onMounted(() => {
  checkInsidersAccess()
  console.log('Dashboard mounted, insiders access:', hasInsidersAccess.value)
})

const handleSignOut = async () => {
  try {
    console.log('Starting sign out process...')
    console.log('Current user state:', user.value ? 'Authenticated' : 'Not authenticated')
    
    // Always try to sign out from Supabase if user exists
    if (user.value) {
      console.log('Signing out from Supabase...')
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
      } else {
        console.log('Successfully signed out from Supabase')
      }
    } else {
      console.log('No authenticated user to sign out')
    }
    
    // Clear insiders access
    console.log('Clearing insiders access...')
    const { clearInsidersAccess } = useInsidersAccess()
    clearInsidersAccess()
    
    // Force a small delay to ensure state updates
    await new Promise(resolve => setTimeout(resolve, 100))
    
    console.log('Navigating to landing page...')
    // Navigate back to landing page
    navigateTo('/')
  } catch (err) {
    console.error('Sign out error:', err)
    // Even if there's an error, still clear insiders access and navigate
    const { clearInsidersAccess } = useInsidersAccess()
    clearInsidersAccess()
    navigateTo('/')
  }
}

const goToReviews = () => {
  navigateTo('/app/upload')
}
</script> 