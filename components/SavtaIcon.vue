<template>
  <img 
    src="/savta-pink.png" 
    alt="Savta AI Logo" 
    :class="iconClass"
  />
</template>

<script setup>
defineProps({
  iconClass: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
/* No extra styles needed for image */
</style> 