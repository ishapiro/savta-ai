<template>
  <div class="h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute top-20 left-4 sm:left-20 w-20 sm:w-32 h-20 sm:h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse-slow"></div>
      <div class="absolute top-40 right-8 sm:right-32 w-16 sm:w-24 h-16 sm:h-24 bg-purple-500/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 1s;"></div>
      <div class="absolute bottom-32 left-1/3 w-24 sm:w-40 h-24 sm:h-40 bg-pink-500/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 2s;"></div>
      <div class="absolute top-1/2 right-8 sm:right-20 w-12 sm:w-20 h-12 sm:h-20 bg-cyan-500/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 0.5s;"></div>
    </div>

    <!-- Login Dialog -->
    <Dialog v-model:visible="visible" modal :closable="true" :dismissableMask="true" :style="{ width: '100vw', maxWidth: '500px', maxHeight: '100vh' }" class="z-10" @hide="onDialogHide">
      <div class="flex flex-col items-center w-full px-2 sm:px-4 py-3 bg-white rounded-2xl shadow-2xl" style="max-height:90vh;overflow-y:auto;">
        <!-- Header -->
        <div class="flex flex-col items-center mb-2 w-full">
          <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center shadow mb-1">
            <img src="/savta-pink.png" alt="Savta AI Logo" class="h-8 w-auto" />
          </div>
          <h1 class="text-xl font-bold text-gray-900 mb-1">Welcome Back</h1>
          <p class="text-gray-500 text-sm">Sign in to your account</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleEmailLogin" class="flex flex-col gap-2 w-full max-w-xs sm:max-w-sm mx-auto">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <InputText
              id="email"
              v-model="email"
              type="email"
              placeholder="Enter your email"
              class="w-full"
              :class="{ 'border-red-500': emailError }"
              @blur="validateEmail"
              autocomplete="username"
            />
            <small v-if="emailError" class="text-red-500 text-xs mt-1">{{ emailError }}</small>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <Password
              id="password"
              v-model="password"
              placeholder="Enter your password"
              class="w-full"
              :class="{ 'border-red-500': passwordError }"
              toggleMask
              autocomplete="current-password"
              inputClass="w-full"
              panelClass="z-50"
            />
            <small v-if="passwordError" class="text-red-500 text-xs mt-1">{{ passwordError }}</small>
          </div>

          <Button
            type="submit"
            label="Sign In"
            class="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg shadow transition disabled:opacity-60"
            :loading="emailLoading"
            :disabled="!email || !password"
          />
        </form>

        <!-- Divider -->
        <div class="flex items-center w-full my-2">
          <div class="flex-grow border-t border-gray-200"></div>
          <span class="mx-2 text-gray-400 text-sm">or</span>
          <div class="flex-grow border-t border-gray-200"></div>
        </div>

        <!-- Google Login -->
        <Button
          class="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold py-2 rounded-lg shadow-sm flex items-center justify-center gap-2 transition"
          :loading="googleLoading"
          @click="handleGoogleLogin"
        >
          <span class="flex items-center justify-center">
            <!-- Color Google SVG Icon -->
            <svg class="h-5 w-5 mr-2" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_17_40)">
                <path d="M47.532 24.552c0-1.636-.146-3.2-.418-4.684H24.48v9.02h12.98c-.56 3.02-2.24 5.58-4.78 7.3v6.06h7.74c4.54-4.18 7.11-10.34 7.11-17.696z" fill="#4285F4"/>
                <path d="M24.48 48c6.48 0 11.92-2.14 15.89-5.82l-7.74-6.06c-2.15 1.44-4.9 2.3-8.15 2.3-6.26 0-11.56-4.22-13.46-9.9H2.5v6.22C6.46 43.98 14.7 48 24.48 48z" fill="#34A853"/>
                <path d="M11.02 28.52c-.5-1.44-.78-2.98-.78-4.52s.28-3.08.78-4.52v-6.22H2.5A23.98 23.98 0 000 24c0 3.98.96 7.74 2.5 11.02l8.52-6.5z" fill="#FBBC05"/>
                <path d="M24.48 9.48c3.52 0 6.64 1.22 9.12 3.62l6.84-6.84C36.4 2.14 30.96 0 24.48 0 14.7 0 6.46 4.02 2.5 10.98l8.52 6.22c1.9-5.68 7.2-9.9 13.46-9.9z" fill="#EA4335"/>
              </g>
              <defs>
                <clipPath id="clip0_17_40">
                  <path fill="#fff" d="M0 0h48v48H0z"/>
                </clipPath>
              </defs>
            </svg>
            <span class="text-purple-600">Sign in with Google</span>
          </span>
        </Button>

        <!-- Error Message -->
        <div v-if="error" class="mt-3 w-full p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <!-- Footer -->
        <div class="mt-4 w-full text-center">
          <p class="text-gray-600 text-sm">
            Don't have an account?
            <a href="/app/signup" class="text-purple-600 hover:text-purple-500 font-medium">Sign up</a>
          </p>
        </div>
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

import { useSupabaseUser } from '~/composables/useSupabase'

const email = ref('')
const password = ref('')
const emailLoading = ref(false)
const googleLoading = ref(false)
const error = ref('')
const emailError = ref('')
const passwordError = ref('')
const visible = ref(true)

// Get Supabase client
const supabase = useNuxtApp().$supabase
const user = useSupabaseUser()

// Redirect if already logged in
watchEffect(() => {
  if (user.value) {
    navigateTo('/app/dashboard')
  }
})

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.value) {
    emailError.value = 'Email is required'
  } else if (!emailRegex.test(email.value)) {
    emailError.value = 'Please enter a valid email address'
  } else {
    emailError.value = ''
  }
}

const validatePassword = () => {
  if (!password.value) {
    passwordError.value = 'Password is required'
  } else {
    passwordError.value = ''
  }
}

const handleEmailLogin = async () => {
  validateEmail()
  validatePassword()
  
  if (emailError.value || passwordError.value) {
    return
  }

  emailLoading.value = true
  error.value = ''

  try {
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })

    if (authError) {
      error.value = authError.message
    } else {
      // Clear guest mode flag on successful login
      if (process.client) {
        sessionStorage.removeItem('guestMode')
      }
      // Success - user will be redirected by the watchEffect
      navigateTo('/app/dashboard')
    }
  } catch (err) {
    error.value = 'An unexpected error occurred. Please try again.'
    console.error('Login error:', err)
  } finally {
    emailLoading.value = false
  }
}

const handleGoogleLogin = async () => {
  googleLoading.value = true
  error.value = ''
  const config = useRuntimeConfig()
  console.log("Debug:config.public.siteUrl", config.public.siteUrl)

  try {
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${config.public.siteUrl}/app/confirm`
      }
    })

    if (authError) {
      error.value = authError.message
    } else {
      // Clear guest mode flag on successful OAuth login
      if (process.client) {
        sessionStorage.removeItem('guestMode')
      }
    }
  } catch (err) {
    error.value = 'An unexpected error occurred. Please try again.'
    console.error('Google login error:', err)
  } finally {
    googleLoading.value = false
  }
}

const onDialogHide = () => {
  // When dialog is closed, navigate away (e.g., to /app/dashboard or /)
  navigateTo('/app/dashboard')
}

// Clear guest mode flag when page loads
onMounted(() => {
  if (process.client) {
    sessionStorage.removeItem('guestMode')
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