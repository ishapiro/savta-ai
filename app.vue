<template>
  <NuxtLayout />
</template>

<script setup>
// Initialize Vue PDF Viewer license at application startup
const { initializeLicense } = useVuePdfViewerLicense()

// Initialize license when app starts
onMounted(() => {
  initializeLicense()
})
</script>

<script>
// Global script - no longer needed for OAuth cleanup
// localStorage approach eliminates the need for URL cleanup
</script>
