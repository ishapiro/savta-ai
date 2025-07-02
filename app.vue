<template>
  <NuxtLayout />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const email = ref<string>('')
const loading = ref<boolean>(false)
const message = ref<string>('')
const messageType = ref<'error' | 'success'>('' as 'error' | 'success')

const subscribe = async (): Promise<void> => {
  if (!email.value) {
    message.value = 'Please enter your email address'
    messageType.value = 'error'
    return
  }

  if (!email.value.includes('@')) {
    message.value = 'Please enter a valid email address'
    messageType.value = 'error'
    return
  }

  loading.value = true
  message.value = ''
  
  try {
    // Simulate API call
    await new Promise<void>(resolve => setTimeout(resolve, 1000))
    message.value = 'Thank you! We\'ll notify you when we launch.'
    messageType.value = 'success'
    email.value = ''
  } catch (error) {
    message.value = 'Something went wrong. Please try again.'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Additional custom styles */
.pi {
  display: inline-block;
}
</style> 