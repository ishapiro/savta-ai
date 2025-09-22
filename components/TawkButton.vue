<script setup>
import { ref, onMounted } from 'vue'

const { $tawk } = useNuxtApp()
const ready = ref(false)

onMounted(async () => {
  try {
    await $tawk.ready
  } finally {
    ready.value = true
  }
})

function openChat() {
  $tawk.open()
}
</script>

<template>
  <button
    :disabled="!ready"
    @click="openChat"
    aria-label="Chat with us"
    title="Chat"
    class="fixed z-50
           top-4 left-4              /* mobile: top-left */
           md:top-auto md:left-auto  /* desktop overrides */
           md:bottom-6 md:right-6    /* desktop: bottom-right */
           h-10 w-10 md:h-12 md:w-12 rounded-full
           bg-white border shadow-lg
           flex items-center justify-center
           disabled:opacity-60"
  >
    <!-- Replace this with your SVG/icon -->
    💬
  </button>
</template>