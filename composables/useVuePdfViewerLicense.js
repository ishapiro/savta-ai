import { ref } from 'vue'

// Global state for license
const licenseKey = ref(null)
const licenseInitialized = ref(false)
const licenseLoading = ref(false)

export const useVuePdfViewerLicense = () => {
  const initializeLicense = async () => {
    // Only initialize once
    if (licenseInitialized.value || licenseLoading.value) {
      return
    }

    licenseLoading.value = true

    try {
      const response = await $fetch('/api/vpv-license-key')
      if (response?.licenseKey) {
        licenseKey.value = response.licenseKey
        licenseInitialized.value = true
        console.log('Vue PDF Viewer license key fetched globally')
      } else {
        console.warn('No license key received from API')
        licenseInitialized.value = true // Mark as initialized even without license
      }
    } catch (error) {
      console.warn('Failed to fetch Vue PDF Viewer license:', error)
      licenseInitialized.value = true // Mark as initialized even if failed
    } finally {
      licenseLoading.value = false
    }
  }

  return {
    licenseKey,
    licenseInitialized,
    licenseLoading,
    initializeLicense
  }
} 