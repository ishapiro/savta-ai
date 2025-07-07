<template>
  <div class="h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute top-20 left-4 sm:left-20 w-20 sm:w-32 h-20 sm:h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse-slow"></div>
      <div class="absolute top-40 right-8 sm:right-32 w-16 sm:w-24 h-16 sm:h-24 bg-purple-500/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 1s;"></div>
      <div class="absolute bottom-32 left-1/3 w-24 sm:w-40 h-24 sm:h-40 bg-pink-500/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 2s;"></div>
      <div class="absolute top-1/2 right-8 sm:right-20 w-12 sm:w-20 h-12 sm:h-20 bg-cyan-500/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 0.5s;"></div>
    </div>

    <!-- Confirmation Dialog -->
    <Dialog 
      v-model:visible="visible" 
      modal 
      :closable="false" 
      :dismissableMask="true" 
      :style="{ width: '100vw', maxWidth: '600px', maxHeight: '100vh' }" 
      class="z-10"
      @hide="onDialogHide"
    >
      <!-- Custom Close Button (top right) -->
      <div class="flex justify-end w-full mb-2">
        <Button
          icon="pi pi-times"
          rounded
          class="bg-pink-500 hover:bg-pink-600 text-white"
          @click="onDialogHide"
          style="box-shadow: none;"
        />
      </div>

      <!-- Main Content -->
      <div class="text-center mb-3 w-full">
        <div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
          <span class="text-2xl">{{ isNewUser ? '🎉' : '✅' }}</span>
        </div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
          {{ isNewUser ? 'Welcome to Savta AI!' : 'Welcome Back!' }}
        </h1>
        <p class="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
          {{ isNewUser ? 'Thank you for joining Savta AI. Your account is now active and ready to use.' : 'You are now successfully logged in to your Savta AI account.' }}
        </p>
      </div>

      <!-- User Information Card -->
      <div v-if="user" class="bg-gray-50 rounded-lg p-2 sm:p-3 mb-2 w-full">
        <h3 class="text-sm font-semibold text-gray-900 mb-1 flex items-center">
            <span class="text-purple-600 mr-2">👤</span>
            Your Account Details
          </h3>
          <div class="space-y-1">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between">
              <span class="text-gray-600 font-medium text-xs">Email Address:</span>
              <span class="text-gray-900 font-mono text-xs sm:text-sm">{{ user.email }}</span>
            </div>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between">
              <span class="text-gray-600 font-medium text-xs">Account Status:</span>
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span class="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                {{ isNewUser ? 'New Account' : 'Active' }}
              </span>
            </div>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between">
              <span class="text-gray-600 font-medium text-xs">Signup Date:</span>
              <span class="text-gray-900 text-xs sm:text-sm">{{ formatDate(user.created_at) }}</span>
            </div>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between">
              <span class="text-gray-600 font-medium text-xs">Last Sign In:</span>
              <span class="text-gray-900 text-xs sm:text-sm">{{ formatDate(user.last_sign_in_at) }}</span>
            </div>
            <div v-if="user.user_metadata" class="flex flex-col sm:flex-row sm:items-center justify-between">
              <span class="text-gray-600 font-medium text-xs">Provider:</span>
              <span class="text-gray-900 capitalize text-xs sm:text-sm">{{ user.app_metadata?.provider || 'Email' }}</span>
            </div>
          </div>
        </div>

      <!-- Next Steps -->
      <div class="bg-blue-50 rounded-lg p-2 sm:p-3 mb-2 w-full">
        <h3 class="text-sm font-semibold text-blue-900 mb-1 flex items-center">
            <span class="text-blue-600 mr-2">🚀</span>
            What's Next?
          </h3>
          <ul class="space-y-1 text-blue-800 text-xs">
            <li class="flex items-start">
              <span class="text-blue-600 mr-2 mt-1">•</span>
              <span>Explore your personalized dashboard</span>
            </li>
            <li class="flex items-start">
              <span class="text-blue-600 mr-2 mt-1">•</span>
              <span>Start creating your first family newsletter</span>
            </li>
            <li class="flex items-start">
              <span class="text-blue-600 mr-2 mt-1">•</span>
              <span>Invite family members to join</span>
            </li>
          </ul>
        </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-2 justify-center w-full">
        <Button 
          label="Go to Dashboard" 
          class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold text-sm"
          @click="goToDashboard"
        />
        <Button 
          label="Learn More" 
          class="bg-grey-500 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm"
          @click="goToAbout"
        />
      </div>
    </Dialog>
  </div>
</template>

<script setup>
// Set the layout for this page
definePageMeta({
  layout: 'default',
  ssr: false
})

// Get Supabase user data
const user = useSupabaseUser()
const supabase = useSupabaseClient()

// Dialog state
const visible = ref(true)

// Computed property to determine if this is a new user
const isNewUser = computed(() => {
  if (!user.value) return false
  
  // Check if the user was created recently (within the last few minutes)
  const createdDate = new Date(user.value.created_at)
  const now = new Date()
  const timeDiff = now.getTime() - createdDate.getTime()
  const minutesDiff = timeDiff / (1000 * 60)
  
  // If account was created within the last 5 minutes, consider it a new user
  return minutesDiff < 5
})

// Format date helper function
const formatDate = (dateString) => {
  if (!dateString) return 'Not available'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Invalid date'
  }
}

// Navigation functions
const goToDashboard = () => {
  visible.value = false
  navigateTo('/app')
}

const goToAbout = () => {
  visible.value = false
  navigateTo('/about')
}

const onDialogHide = () => {
  // When dialog is closed, navigate to dashboard
  navigateTo('/app')
}

// Handle OAuth callback and user state
onMounted(async () => {
  // Check if this is an OAuth callback
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Error getting session:', error)
    navigateTo('/app/login')
    return
  }
  
  // If no session after a short delay, redirect to login
  if (!session) {
    setTimeout(() => {
      if (!user.value) {
        navigateTo('/app/login')
      }
    }, 2000)
  }
})
</script>

<style scoped>
.animate-pulse-slow {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
</style> 