<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute top-20 left-4 sm:left-20 w-20 sm:w-32 h-20 sm:h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse-slow"></div>
      <div class="absolute top-40 right-8 sm:right-32 w-16 sm:w-24 h-16 sm:h-24 bg-purple-500/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 1s;"></div>
      <div class="absolute bottom-32 left-1/3 w-24 sm:w-40 h-24 sm:h-40 bg-pink-500/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 2s;"></div>
      <div class="absolute top-1/2 right-8 sm:right-20 w-12 sm:w-20 h-12 sm:h-20 bg-cyan-500/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 0.5s;"></div>
    </div>

    <!-- Main content -->
    <div class="relative z-10 w-full max-w-lg sm:max-w-2xl mx-auto flex-1 flex items-center justify-center px-2 sm:px-0">
      <div class="coming-soon-card text-center w-full px-2 py-8 sm:p-8 rounded-2xl">
        <div class="mb-8 animate-fade-in-down">
          <div class="w-20 sm:w-24 h-20 sm:h-24 bg-white mx-auto mb-6 rounded-full flex items-center justify-center floating-element">
            <img src="/savta-pink.png" alt="savta.ai Logo" class="h-12 sm:h-14 w-auto" />
          </div>
          <h1 class="text-xl sm:text-2xl md:text-3xl font-semibold text-white mb-2">Savta AI</h1>
          <p class="text-gray-300 text-sm sm:text-base">The simplest way to turn your cherished moments — photos, stories, and milestones — into a family letter, with a sprinkle of AI magic.</p>
        </div>
        <div class="mb-8 animate-fade-in-up" style="animation-delay: 0.3s;">
          <h2 class="animated-text mb-4 text-3xl sm:text-4xl md:text-5xl">Coming Soon</h2>
          <p class="text-base sm:text-xl md:text-2xl text-gray-300 mb-6">Something amazing is brewing...</p>
        </div>
        <div class="flex flex-col items-center mt-8 animate-fade-in-up" style="animation-delay: 0.6s;">
          <div class="w-full flex flex-col items-center">
            <div class="text-gray-300 text-sm sm:text-base mb-1 text-center">
              Be the first to bring Savta&apos;s magic to your family
            </div>
            <InputText
              v-model="email"
              type="email"
              placeholder="Enter your email"
              class="mx-auto w-full max-w-xs sm:max-w-xl text-center text-base py-2 px-3 sm:px-4 rounded border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              :class="{ 'border-red-500': messageType === 'error' }"
            />
          </div>
          <Button
            type="button"
            label="Notify Me When It's Ready"
            class="mt-5 w-full max-w-xs sm:max-w-md bg-purple-600 hover:bg-purple-700 text-white rounded-full py-3 text-base sm:text-lg font-semibold"
            :loading="loading"
            @click="handleSubscribe"
          />
          <div v-if="message" :class="messageType === 'success' ? 'text-green-500' : 'text-white'">
            {{ message }}
          </div>
        </div>
        <!-- Insiders Button -->
        <div class="mt-8 pt-6 border-t border-white/20">
          <Button
            type="button"
            label="Insiders"
            class="w-full max-w-xs sm:max-w-fit bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-full py-2 px-6 font-medium"
            @click="showPasswordDialog = true"
          />
        </div>
        <!-- Password Dialog -->
        <div v-if="showPasswordDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-4 sm:p-6 w-full max-w-xs sm:max-w-md mx-2 sm:mx-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Insiders Access</h3>
            <p class="text-gray-600 mb-4">Enter the password to access the insider area:</p>
            <InputText
              v-model="password"
              type="password"
              placeholder="Enter password"
              class="w-full mb-4"
              @keyup.enter="checkPassword"
            />
            <div class="flex flex-col sm:flex-row gap-2 sm:space-x-3">
              <Button
                label="Cancel"
                class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700"
                @click="cancelPassword"
              />
              <Button
                label="Enter"
                class="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                @click="checkPassword"
              />
            </div>
            <div v-if="passwordError" class="text-red-500 text-sm mt-2">
              {{ passwordError }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Set the layout for this page
// @ts-ignore - Nuxt composables
definePageMeta({
  layout: 'landing-page'
})

const email = ref('')
const loading = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error' | null>(null)

// Password protection
const showPasswordDialog = ref(false)
const password = ref('')
const passwordError = ref('')

// Get runtime config
// @ts-ignore - Nuxt composables
const config = useRuntimeConfig()

const handleSubscribe = async () => {
  // @ts-ignore - Supabase composables will be available after dev server restart
  const supabase = useSupabaseClient()
  message.value = ''
  messageType.value = null

  // Email validation regex that allows Gmail plus addressing
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  
  if (!email.value || !emailRegex.test(email.value)) {
    message.value = 'Please enter a valid email address.'
    messageType.value = 'error'
    return
  }

  loading.value = true
  try {
    // Check if email exists
    const { data: existing, error: selectError } = await supabase
      .from('email_subscriptions')
      .select('id')
      .eq('email', email.value)
      .single()

    if (existing) {
      message.value = 'You are already subscribed!'
      messageType.value = 'success'
    } else {
      // Insert new email
      const { error: insertError } = await supabase
        .from('email_subscriptions')
        .insert([{ email: email.value }])

      if (insertError) throw insertError

      message.value = 'Thank you! You will receive future updates.'
      messageType.value = 'success'
      email.value = ''
    }
  } catch (err: any) {
    message.value = 'An error occurred. Please try again later.'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}

const checkPassword = () => {
  if (password.value === config.public.insidersPassword) {
    showPasswordDialog.value = false
    password.value = ''
    passwordError.value = ''
    // Set insiders access in session storage
    if (process.client) {
      sessionStorage.setItem('insiders-access', 'true')
    }
    // @ts-ignore - Nuxt composables
    navigateTo('/app')
  } else {
    passwordError.value = 'Incorrect password. Please try again.'
    password.value = ''
  }
}

const cancelPassword = () => {
  showPasswordDialog.value = false
  password.value = ''
  passwordError.value = ''
}
</script> 