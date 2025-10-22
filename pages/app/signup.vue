<template>
  <div class="h-screen flex items-center justify-center bg-brand-background relative overflow-hidden">
    <!-- Backdrop overlay -->
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-0"></div>
    
    <!-- Animated background elements -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute top-20 left-4 sm:left-20 w-20 sm:w-32 h-20 sm:h-32 bg-brand-highlight/20 rounded-full blur-xl animate-pulse-slow"></div>
      <div class="absolute top-40 right-8 sm:right-32 w-16 sm:w-24 h-16 sm:h-24 bg-brand-secondary/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 1s;"></div>
      <div class="absolute bottom-32 left-1/3 w-24 sm:w-40 h-24 sm:h-40 bg-brand-header/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 2s;"></div>
      <div class="absolute top-1/2 right-8 sm:right-20 w-12 sm:w-20 h-12 sm:h-20 bg-brand-accent/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 0.5s;"></div>
    </div>
    <!-- Google OAuth Loading Overlay -->
    <div v-if="showGoogleLoading" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="flex flex-col items-center gap-4">
        <div class="relative w-16 h-16">
          <svg class="animate-spin h-16 w-16 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p class="text-white font-semibold text-lg">Connecting to Google...</p>
      </div>
    </div>

    <!-- Provider Selection Dialog -->
    <Dialog v-model:visible="providerSelectVisible" modal :closable="false" :dismissableMask="false" :style="{ width: '100vw', maxWidth: '400px', maxHeight: '100vh' }" class="z-30">
      <div class="flex flex-col w-full px-2 sm:px-4 py-6 bg-white rounded-2xl shadow-2xl">
        <!-- Selection Options at Top -->
        <div class="flex flex-col items-center gap-4 mb-6">
          <h2 class="text-xl font-bold text-brand-primary text-center">Create your account to safely save family memories</h2>
          <p class="text-sm text-brand-primary/70 text-center">Your memories are protected so only you can see them</p>
          
          <Button class="w-full bg-white hover:bg-gray-100 text-gray-700 font-semibold uppercase tracking-wider py-3 rounded shadow-elevation-2 hover:shadow-elevation-3 flex items-center justify-center gap-2 text-sm" :loading="googleLoading" @click="handleGoogleSignup">
            <svg class="h-6 w-6 mr-2" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_17_40)"><path d="M47.532 24.552c0-1.636-.146-3.2-.418-4.684H24.48v9.02h12.98c-.56 3.02-2.24 5.58-4.78 7.3v6.06h7.74c4.54-4.18 7.11-10.34 7.11-17.696z" fill="#4285F4"/><path d="M24.48 48c6.48 0 11.92-2.14 15.89-5.82l-7.74-6.06c-2.15 1.44-4.9 2.3-8.15 2.3-6.26 0-11.56-4.22-13.46-9.9H2.5v6.22C6.46 43.98 14.7 48 24.48 48z" fill="#34A853"/><path d="M11.02 28.52c-.5-1.44-.78-2.98-.78-4.52s.28-3.08.78-4.52v-6.22H2.5A23.98 23.98 0 000 24c0 3.98.96 7.74 2.5 11.02l8.52-6.5z" fill="#FBBC05"/><path d="M24.48 9.48c3.52 0 6.64 1.22 9.12 3.62l6.84-6.84C36.4 2.14 30.96 0 24.48 0 14.7 0 6.46 4.02 2.5 10.98l8.52 6.22c1.9-5.68 7.2-9.9 13.46-9.9z" fill="#EA4335"/></g><defs><clipPath id="clip0_17_40"><path fill="#fff" d="M0 0h48v48H0z"/></clipPath></defs></svg>
            <span class="text-brand-secondary">Continue with Google</span>
          </Button>
          <Button class="w-full bg-white hover:bg-gray-100 text-gray-700 font-semibold uppercase tracking-wider py-3 rounded shadow-elevation-2 hover:shadow-elevation-3 flex items-center justify-center gap-2 text-sm" @click="showEmailForm">
            <svg class="h-6 w-6 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>
            <span class="text-brand-secondary">Continue with Email</span>
          </Button>
        </div>
        
        <!-- Fine Print at Bottom -->
        <div class="border-t border-gray-200 pt-4">
          <p class="text-xs text-gray-500 text-center leading-relaxed">
            <strong>Get started without a credit card.</strong> We only need a credit card when you want printed and mailed memories. Some limits apply to users without a credit card on file.
          </p>
        </div>
      </div>
    </Dialog>
    <!-- Signup Dialog (email form) -->
    <Dialog v-model:visible="visible" modal :closable="true" :dismissableMask="true" :style="{ width: '100vw', maxWidth: '500px', maxHeight: '100vh' }" class="z-20" @hide="onDialogHide">
      <div v-if="!providerSelectVisible" class="flex flex-col items-center w-full px-2 sm:px-4 py-3 pb-6 bg-white rounded-2xl shadow-2xl" style="max-height:90vh;overflow-y:auto;">
        <!-- Header -->
        <div class="flex flex-col items-center mb-2 w-full">
          <div class="flex items-center justify-center">
            <img src="/savta_image_only_color.svg" alt="Savta AI Logo" class="h-20 w-auto" />
          </div>
          <h1 class="text-xl font-bold text-brand-primary mb-1">Join Savta</h1>
          <p class="text-brand-primary/70 text-sm">Start sharing beautiful family memories</p>
        </div>

        <!-- Signup Form -->
        <form @submit.prevent="handleEmailSignup" class="flex flex-col gap-2 w-full max-w-xs sm:max-w-sm mx-auto">
          <div>
            <label for="email" class="block text-sm font-medium text-brand-primary mb-1">Email</label>
            <InputText
              id="email"
              v-model="email"
              type="email"
              placeholder="Enter your email"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-header focus:border-brand-header transition"
              :class="{ 'border-red-500': emailError }"
              @blur="validateEmail"
              autocomplete="username"
            />
            <small v-if="emailError" class="text-red-500 text-xs mt-1">{{ emailError }}</small>
          </div>

          <div class="mb-2">
            <label for="password" class="block text-sm font-medium text-brand-primary mb-1">Password</label>
            <div>
              <Password
                id="password"
                v-model="password"
                placeholder="Create a password"
                class="w-full"
                inputClass="rounded-lg border-gray-300"
                toggleMask
                autocomplete="new-password"
              />
            </div>
            <small v-if="passwordError" class="text-red-500 text-xs mt-1">{{ passwordError }}</small>
          </div>

          <div class="mb-2">
            <label for="confirmPassword" class="block text-sm font-medium text-brand-primary mb-1">Confirm Password</label>
            <div>
              <Password
                id="confirmPassword"
                v-model="confirmPassword"
                placeholder="Confirm your password"
                class="w-full"
                inputClass="rounded-lg border-gray-300"
                :feedback="false"
                toggleMask
                autocomplete="new-password"
              />
            </div>
            <small v-if="confirmPasswordError" class="text-red-500 text-xs mt-1">{{ confirmPasswordError }}</small>
          </div>

          <div class="flex items-center">
            <input
              v-model="agreeToTerms"
              type="checkbox"
              id="terms"
              class="mr-2 w-4 h-4 border border-black rounded focus:ring-2 focus:ring-brand-secondary focus:ring-offset-0"
            />
            <label for="terms" class="text-xs text-brand-primary/70">
              I agree to the 
              <a href="/terms" class="text-brand-secondary hover:text-brand-header">Terms of Service</a>
              and
              <a href="/privacy" class="text-brand-secondary hover:text-brand-header">Privacy Policy</a>
            </label>
          </div>

          <Button
            type="submit"
            label="CREATE ACCOUNT"
            class="mt-3 w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold uppercase tracking-wider py-2 rounded shadow-elevation-2 hover:shadow-elevation-3 disabled:opacity-60 border-0"
            :loading="emailLoading"
            :disabled="!email || !password || !confirmPassword || !agreeToTerms"
          />
        </form>

        <!-- Divider -->
        <div class="flex items-center w-full my-2">
          <div class="flex-grow border-t border-brand-primary/20"></div>
          <span class="mx-2 text-brand-primary/50 text-sm">or</span>
          <div class="flex-grow border-t border-brand-primary/20"></div>
        </div>

        <!-- Google Signup -->
        <!-- <Button
          class="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2 rounded-lg shadow-sm flex items-center justify-center gap-2 transition"
          :loading="googleLoading"
          @click="handleGoogleSignup"
        >
          <span class="flex items-center justify-center">
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
            <span class="text-brand-header">Sign up with Google</span>
          </span>
        </Button> -->

        <!-- Error Message -->
        <div v-if="error" class="mt-3 w-full p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <!-- Footer -->
        <div class="mt-4 w-full text-center">
          <p class="text-brand-primary/70 text-sm">
            Already have an account?
            <NuxtLink :to="`/app/login?origin=${origin || 'dashboard'}`" class="text-brand-secondary hover:text-brand-header font-medium">Sign in</NuxtLink>
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
const confirmPassword = ref('')
const agreeToTerms = ref(false)
const emailLoading = ref(false)
const googleLoading = ref(false)
const showGoogleLoading = ref(false)
const error = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const visible = ref(true)
const providerSelectVisible = ref(true)

// Get Supabase client
const supabase = useNuxtApp().$supabase
const user = useSupabaseUser()

// Get origin from localStorage
const origin = process.client ? localStorage.getItem('auth_origin') || 'dashboard' : 'dashboard'
console.log('[SIGNUP] Origin from localStorage:', origin)

// Redirect if already logged in (this handles Google OAuth flow)
watchEffect(() => {
  if (user.value) {
    console.log('[SIGNUP] User authenticated, redirecting to memory books')
    // Always go straight to memory-books, skip confirm page
    navigateTo('/app/memory-books')
  }
})

const validateEmail = () => {
  // Updated regex to support Google Plus addressing (allows + in local part)
  const emailRegex = /^[^\s@]+(\+[^\s@]+)?@[^\s@]+\.[^\s@]+$/
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
  } else if (password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
  } else {
    passwordError.value = ''
  }
}

const validateConfirmPassword = () => {
  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Please confirm your password'
  } else if (confirmPassword.value !== password.value) {
    confirmPasswordError.value = 'Passwords do not match'
  } else {
    confirmPasswordError.value = ''
  }
}

const handleEmailSignup = async () => {
  validateEmail()
  validatePassword()
  validateConfirmPassword()
  
  if (emailError.value || passwordError.value || confirmPasswordError.value || !agreeToTerms.value) {
    return
  }

  emailLoading.value = true
  error.value = ''
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl
  console.log("SITE URL:", siteUrl)

  try {
    const redirectUrl = `${config.public.siteUrl}/app/memory-books`
    console.log('[SIGNUP] Email redirect URL:', redirectUrl)
    
    const { error: authError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        emailRedirectTo: redirectUrl
      }
    })

    if (authError) {
      error.value = authError.message
    } else {
      // Show success message and redirect to landing page
      console.log('[SIGNUP] Email signup successful, redirecting to landing page')
      
      // Show success message briefly
      error.value = 'Please check your email to confirm your account. Redirecting...'
      
      // Redirect to landing page after a brief delay
      setTimeout(() => {
        navigateTo('/')
      }, 2000)
    }
  } catch (err) {
    error.value = 'An unexpected error occurred. Please try again.'
    console.error('Signup error:', err)
  } finally {
    emailLoading.value = false
  }
}

const handleGoogleSignup = async () => {
  // Hide dialogs and show loading spinner
  providerSelectVisible.value = false
  visible.value = false
  showGoogleLoading.value = true
  
  error.value = ''
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl
  console.log("SITE URL:", siteUrl)

  try {
    const redirectUrl = `${config.public.siteUrl}/app/memory-books`
    console.log('[SIGNUP] OAuth redirect URL:', redirectUrl)
    
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          prompt: 'select_account'
        }
      }
    })

    if (authError) {
      error.value = authError.message
      // Show dialogs again if there's an error
      showGoogleLoading.value = false
      providerSelectVisible.value = true
    }
  } catch (err) {
    error.value = 'An unexpected error occurred. Please try again.'
    console.error('Google signup error:', err)
    // Show dialogs again if there's an error
    showGoogleLoading.value = false
    providerSelectVisible.value = true
  }
}

const showEmailForm = () => {
  providerSelectVisible.value = false
  visible.value = true
}

const onDialogHide = () => {
  // When dialog is closed, navigate to memory-books
  navigateTo('/app/memory-books')
}

onMounted(() => {
  providerSelectVisible.value = true
  visible.value = false
})
</script>

<style scoped>
.p-password .p-password-icon {
  right: 0.75rem !important;
}

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