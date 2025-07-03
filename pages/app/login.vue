<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute top-20 left-4 sm:left-20 w-20 sm:w-32 h-20 sm:h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse-slow"></div>
      <div class="absolute top-40 right-8 sm:right-32 w-16 sm:w-24 h-16 sm:h-24 bg-purple-500/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 1s;"></div>
      <div class="absolute bottom-32 left-1/3 w-24 sm:w-40 h-24 sm:h-40 bg-pink-500/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 2s;"></div>
      <div class="absolute top-1/2 right-8 sm:right-20 w-12 sm:w-20 h-12 sm:h-20 bg-cyan-500/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 0.5s;"></div>
    </div>

    <!-- Login Card -->
    <div class="relative z-10 w-full max-w-md mx-auto px-4">
      <Card class="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <template #header>
          <div class="text-center">
            <div class="w-16 h-16 bg-white mx-auto mb-4 rounded-full flex items-center justify-center shadow-lg">
              <img src="/savta-pink.png" alt="Savta AI Logo" class="h-10 w-auto" />
            </div>
            <h1 class="text-2xl font-bold text-gray-900">Welcome to Savta AI</h1>
            <p class="text-gray-600 mt-2">Sign in to your account</p>
          </div>
        </template>

        <template #content>
          <form @submit.prevent="handleEmailLogin" class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <InputText
                id="email"
                v-model="email"
                type="email"
                placeholder="Enter your email"
                class="w-full"
                :class="{ 'p-invalid': emailError }"
                @blur="validateEmail"
              />
              <small v-if="emailError" class="text-red-500 text-sm">{{ emailError }}</small>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <Password
                id="password"
                v-model="password"
                placeholder="Enter your password"
                class="w-full"
                :class="{ 'p-invalid': passwordError }"
                :feedback="false"
                toggleMask
              />
              <small v-if="passwordError" class="text-red-500 text-sm">{{ passwordError }}</small>
            </div>

            <div class="flex items-center justify-between">
              <Checkbox
                v-model="rememberMe"
                :binary="true"
                inputId="remember"
              />
              <label for="remember" class="text-sm text-gray-600">Remember me</label>
              <a href="#" class="text-sm text-purple-600 hover:text-purple-500">Forgot password?</a>
            </div>

            <Button
              type="submit"
              label="Sign In"
              class="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
              :loading="emailLoading"
              :disabled="!email || !password"
            />
          </form>

          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <Button
            label="Sign in with Google"
            icon="pi pi-google"
            class="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 py-3"
            :loading="googleLoading"
            @click="handleGoogleLogin"
          />

          <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p class="text-red-600 text-sm">{{ error }}</p>
          </div>
        </template>

        <template #footer>
          <div class="text-center">
            <p class="text-gray-600 text-sm">
              Don't have an account?
              <a href="/app/signup" class="text-purple-600 hover:text-purple-500 font-medium">Sign up</a>
            </p>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Set the layout for this page
definePageMeta({
  layout: 'landing-page'
})

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const emailLoading = ref(false)
const googleLoading = ref(false)
const error = ref('')
const emailError = ref('')
const passwordError = ref('')

// Get Supabase client
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Redirect if already logged in
watchEffect(() => {
  if (user.value) {
    navigateTo('/app')
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
  } else if (password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
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
      // Success - user will be redirected by watchEffect
    }
  } catch (err: any) {
    error.value = 'An unexpected error occurred. Please try again.'
    console.error('Login error:', err)
  } finally {
    emailLoading.value = false
  }
}

const handleGoogleLogin = async () => {
  googleLoading.value = true
  error.value = ''

  try {
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/app`
      }
    })

    if (authError) {
      error.value = authError.message
    }
  } catch (err: any) {
    error.value = 'An unexpected error occurred. Please try again.'
    console.error('Google login error:', err)
  } finally {
    googleLoading.value = false
  }
}
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