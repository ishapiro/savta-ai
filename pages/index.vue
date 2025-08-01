<template>
  <div class="min-h-screen flex flex-col bg-brand-background relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute top-20 left-4 sm:left-20 w-20 sm:w-32 h-20 sm:h-32 bg-brand-highlight/20 rounded-full blur-xl animate-pulse-slow"></div>
      <div class="absolute top-40 right-8 sm:right-32 w-16 sm:w-24 h-16 sm:h-24 bg-brand-accent/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 1s;"></div>
      <div class="absolute bottom-32 left-1/3 w-24 sm:w-40 h-24 sm:h-40 bg-brand-navigation/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 2s;"></div>
      <div class="absolute top-1/2 right-8 sm:right-20 w-12 sm:w-20 h-12 sm:h-20 bg-brand-primary/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 0.5s;"></div>
    </div>

    <!-- Main content -->
    <div class="relative z-10 w-full mx-auto flex-1 flex items-center justify-center px-4 sm:px-0">
      <div class="text-center w-full">
        <div class="mb-1 animate-fade-in-down">
          <div class="relative w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-1">
            <div class="absolute inset-0 rounded-full bg-brand-background/30 blur-md"></div>
            <SavtaIcon :iconClass="'relative max-w-[85%] max-h-[85%] object-contain z-10 block w-16 h-16 sm:w-24 sm:h-24 mx-auto'" />
          </div>
          <div class="flex flex-col items-center gap-1">
            <h1 class="text-xl sm:text-4xl font-extrabold text-brand-secondary font-sans tracking-tight">Savta</h1>
            <span class="inline-block bg-brand-background/80 text-brand-secondary text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full border border-brand-navigation/30 align-middle shadow-sm">beta: no warranty, no support</span>
          </div>
          <div class="max-w-xl mx-auto mt-1 px-3 py-1 text-center">
            <h2 class="text-xs sm:text-base font-semibold mb-1 text-brand-secondary drop-shadow-lg">
              Keep the memories that matter most, beautifully.
            </h2>
            <p class="text-[10px] sm:text-sm text-brand-secondary/90 leading-relaxed mb-0.5 drop-shadow-md">
              Each month, we turn your family's best photos, stories, and milestones into a themed, shareable booklet — curated with a gentle touch of AI magic.
            </p>
            <p class="text-[10px] sm:text-sm text-brand-secondary/80 leading-relaxed drop-shadow-md">
              No more scrolling through endless chats. Just one meaningful snapshot of your family's life, preserved with love.
            </p>
          </div>
        </div>
        <div class="mb-1 animate-fade-in-up" style="animation-delay: 0.3s;">
          <h2 class="text-lg sm:text-3xl text-brand-secondary">Coming Soon</h2>
        </div>
        <div class="flex flex-col items-center mt-1 animate-fade-in-up" style="animation-delay: 0.6s;">
          <div class="w-full flex flex-col items-center">
            <div class="text-brand-secondary text-[10px] sm:text-sm mb-1 text-center">
              Be the first to bring Savta&apos;s magic to your family
            </div>
            <InputText
              v-model="email"
              type="email"
              placeholder="Enter your email"
              class="mx-auto w-full max-w-xs sm:max-w-xl text-center text-xs sm:text-sm py-1 px-3 sm:px-4 bg-white rounded-lg border border-brand-primary/30 focus:border-brand-header focus:ring-2 focus:ring-brand-navigation/30"
              :class="{ 'border-red-500': messageType === 'error' }"
            />
          </div>
          <Button
            type="button"
            label="Notify Me When It's Ready"
            class="mt-1 w-full max-w-xs sm:max-w-md bg-brand-header hover:bg-brand-secondary text-white rounded-full py-1 text-xs sm:text-base font-semibold border-0"
            :loading="loading"
            @click="handleSubscribe"
          />
          <div v-if="message" :class="messageType === 'success' ? 'text-green-500' : 'text-brand-secondary'" class="text-[10px] sm:text-xs">
            {{ message }}
          </div>
        </div>
        <!-- Insiders Button -->
        <div class="mt-1 pt-3">
          <Button
            type="button"
            label="Insiders"
            class="w-full max-w-xs sm:max-w-fit bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-secondary border border-brand-primary/30 rounded-full py-1.5 px-6 font-medium text-xs border-0"
            @click="showPasswordDialog = true"
          />
        </div>
        <!-- Password Dialog -->
        <div v-if="showPasswordDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-brand-background rounded-lg p-4 sm:p-6 w-full max-w-xs sm:max-w-md mx-2 sm:mx-4">
            <h3 class="text-lg font-semibold text-brand-secondary mb-1">Insiders Access</h3>
            <p class="text-brand-primary mb-1">Enter the password to access the insider area:</p>
            <form @submit.prevent="checkPassword" role="form" aria-label="Password verification form">
              <!-- Hidden username field for accessibility -->
              <input type="text" name="username" autocomplete="username" style="display: none;" />
              <InputText
                v-model="password"
                type="password"
                placeholder="Enter password"
                class="w-full mb-1"
                autocomplete="current-password"
                aria-label="Password"
                @keyup.enter="checkPassword"
              />
              <div class="flex flex-col sm:flex-row gap-2 sm:space-x-3">
                <Button
                  type="button"
                  label="Cancel"
                  class="flex-1 bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-secondary border-0"
                  @click="cancelPassword"
                />
                <Button
                  type="submit"
                  label="Enter"
                  class="flex-1 bg-brand-header hover:bg-brand-secondary text-white border-0"
                />
              </div>
              <div v-if="passwordError" class="text-red-500 text-sm mt-1">
                {{ passwordError }}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Set the layout for this page
definePageMeta({
  layout: 'landing-page'
})

const email = ref('')
const loading = ref(false)
const message = ref('')
const messageType = ref(null)

// Password protection
const showPasswordDialog = ref(false)
const password = ref('')
const passwordError = ref('')

// Get runtime config
const config = useRuntimeConfig()

const handleSubscribe = async () => {
  // const supabase = useSupabaseClient()
  const supabase = useNuxtApp().$supabase
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
  } catch (err) {
    message.value = 'An error occurred. Please try again later.'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}

const checkPassword = () => {
  if ((password.value || '').toLowerCase() === (config.public.insidersPassword || '').toLowerCase()) {
    showPasswordDialog.value = false
    password.value = ''
    passwordError.value = ''
    // Set insiders access using the composable
    const { setInsidersAccess } = useInsidersAccess()
    setInsidersAccess()
    navigateTo('/app/home')
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

import SavtaIcon from '~/components/SavtaIcon.vue'
</script> 