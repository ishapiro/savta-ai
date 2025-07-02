<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse-slow"></div>
      <div class="absolute top-40 right-32 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 1s;"></div>
      <div class="absolute bottom-32 left-1/3 w-40 h-40 bg-pink-500/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 2s;"></div>
      <div class="absolute top-1/2 right-20 w-20 h-20 bg-cyan-500/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 0.5s;"></div>
    </div>

    <!-- Main content -->
    <div class="relative z-10 w-full max-w-2xl mx-auto flex-1 flex items-center justify-center">
      <div class="coming-soon-card text-center">
        <div class="mb-8 animate-fade-in-down">
          <div class="w-24 h-24 bg-white mx-auto mb-6 rounded-full flex items-center justify-center floating-element">
            <img src="/savta-pink.png" alt="savta.ai Logo" class="h-14 w-auto" />
          </div>
          <h1 class="text-2xl md:text-3xl font-semibold text-white mb-2">Savta AI</h1>
          <p class="text-gray-300 text-lg">The Future of AI-Powered Solutions</p>
        </div>
        <div class="mb-8 animate-fade-in-up" style="animation-delay: 0.3s;">
          <h2 class="animated-text mb-4">Coming Soon</h2>
          <p class="text-xl md:text-2xl text-gray-300 mb-6">Something amazing is brewing...</p>
        </div>
        <div class="flex flex-col items-center mt-8 space-y-4 animate-fade-in-up" style="animation-delay: 0.6s;">
          <InputText
            v-model="email"
            type="email"
            placeholder="Enter your email"
            class="w-full max-w-xs"
            :class="{ 'border-red-500': messageType === 'error' }"
          />
          <Button
            type="button"
            label="Subscribe"
            class="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white"
            :loading="loading"
            @click="handleSubscribe"
          />
          <div v-if="message" :class="messageType === 'success' ? 'text-green-500' : 'text-red-500'">
            {{ message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const loading = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error' | null>(null)

const handleSubscribe = async () => {
  // @ts-ignore - Supabase composables will be available after dev server restart
  const supabase = useSupabaseClient()
  message.value = ''
  messageType.value = null

  if (!email.value || !email.value.includes('@')) {
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
</script> 