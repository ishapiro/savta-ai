import { ref, computed } from 'vue'

/**
 * Shared composable for handling photo replacement logic
 * Used by both MagicMemoryWizard and MemoryBookDialog
 */
export const usePhotoReplacement = () => {
  // State for photo replacement
  const photosToReplace = ref([])
  const existingBookForRecreation = ref(null)
  const isRecreateMode = ref(false)

  /**
   * Initialize photo replacement for recreation mode
   * @param {Object} bookData - The existing book data
   * @param {Array} existingAssets - The assets from the original book
   */
  const initializePhotoReplacement = (bookData, existingAssets = []) => {
    console.log('🔄 [usePhotoReplacement] Initializing photo replacement')
    console.log('🔄 [usePhotoReplacement] Book data:', bookData)
    console.log('🔄 [usePhotoReplacement] Existing assets:', existingAssets)
    
    existingBookForRecreation.value = {
      ...bookData,
      created_from_assets: existingAssets
    }
    isRecreateMode.value = true
    photosToReplace.value = []
    
    console.log('🔄 [usePhotoReplacement] Initialized with:', {
      existingBook: !!existingBookForRecreation.value,
      isRecreateMode: isRecreateMode.value,
      photosToReplace: photosToReplace.value.length
    })
  }

  /**
   * Reset photo replacement state
   */
  const resetPhotoReplacement = () => {
    console.log('🔄 [usePhotoReplacement] Resetting photo replacement state')
    photosToReplace.value = []
    existingBookForRecreation.value = null
    isRecreateMode.value = false
  }

  /**
   * Toggle a photo for replacement
   * @param {string} photoId - The photo ID to toggle
   */
  const togglePhotoReplacement = (photoId) => {
    const index = photosToReplace.value.indexOf(photoId)
    if (index > -1) {
      photosToReplace.value.splice(index, 1)
      console.log('🔄 [usePhotoReplacement] Removed photo from replacement:', photoId)
    } else {
      photosToReplace.value.push(photoId)
      console.log('🔄 [usePhotoReplacement] Added photo to replacement:', photoId)
    }
    console.log('🔄 [usePhotoReplacement] Photos to replace:', photosToReplace.value)
  }

  /**
   * Get the photo selection pool based on the current method
   * This is the complex logic that handles different photo selection methods
   * @param {string} photoSelectionMethod - The current photo selection method
   * @param {Function} populatePhotoSelectionPool - Function to populate normal photo selection pool
   * @param {Function} setSelectedMemories - Function to set selected memories for replace_selected
   * @returns {Array} The photo selection pool
   */
  const getPhotoSelectionPool = (photoSelectionMethod, populatePhotoSelectionPool, setSelectedMemories = null) => {
    console.log('🔄 [usePhotoReplacement] Getting photo selection pool for method:', photoSelectionMethod)
    console.log('🔄 [usePhotoReplacement] Is recreate mode:', isRecreateMode.value)
    console.log('🔄 [usePhotoReplacement] Has existing book:', !!existingBookForRecreation.value)
    
    if (photoSelectionMethod === 'replace_selected' && existingBookForRecreation.value) {
      // For photo replacement, we need to populate the selected memories with existing photos
      // so that photoSelection_populatePhotoSelectionPool can return them
      const existingPhotos = existingBookForRecreation.value.created_from_assets || []
      console.log('🔄 [usePhotoReplacement] Photo replacement mode: setting selected memories to existing photos:', existingPhotos.length)
      
      if (setSelectedMemories) {
        setSelectedMemories(existingPhotos)
      }
      
      const photoSelectionPool = populatePhotoSelectionPool()
      console.log('🔄 [usePhotoReplacement] Photo replacement mode: using populated photo selection pool')
      console.log('🔄 [usePhotoReplacement] Photo selection pool length:', photoSelectionPool.length)
      return photoSelectionPool
    } else if (photoSelectionMethod === 'keep_same' && existingBookForRecreation.value) {
      // For "keep_same", use the existing photos from the original book
      // This preserves the original photos without going through photo replacement
      const photoSelectionPool = existingBookForRecreation.value.created_from_assets || []
      console.log('🔄 [usePhotoReplacement] Keep same mode: using existing photos from original book')
      console.log('🔄 [usePhotoReplacement] Keep same mode: photoSelectionPool length:', photoSelectionPool.length)
      return photoSelectionPool
    } else {
      // Use the normal photo selection logic
      const photoSelectionPool = populatePhotoSelectionPool()
      console.log('🔄 [usePhotoReplacement] Normal mode: using photo selection pool')
      console.log('🔄 [usePhotoReplacement] Photo selection pool length:', photoSelectionPool.length)
      return photoSelectionPool
    }
  }

  /**
   * Get the photos to replace for the API call
   * @param {string} photoSelectionMethod - The current photo selection method
   * @returns {Array} The photos to replace
   */
  const getPhotosToReplace = (photoSelectionMethod) => {
    if (photoSelectionMethod === 'keep_same') {
      return []
    }
    return photosToReplace.value
  }

  /**
   * Computed property to check if we have photos selected for replacement
   */
  const hasPhotoReplacements = computed(() => {
    return photosToReplace.value.length > 0
  })

  /**
   * Computed property to get the count of photos to keep (not replace)
   */
  const photosToKeepCount = computed(() => {
    if (!existingBookForRecreation.value?.created_from_assets) return 0
    return existingBookForRecreation.value.created_from_assets.length - photosToReplace.value.length
  })

  /**
   * Computed property to get the count of photos to replace
   */
  const photosToReplaceCount = computed(() => {
    return photosToReplace.value.length
  })

  return {
    // State
    photosToReplace,
    existingBookForRecreation,
    isRecreateMode,
    
    // Methods
    initializePhotoReplacement,
    resetPhotoReplacement,
    togglePhotoReplacement,
    getPhotoSelectionPool,
    getPhotosToReplace,
    
    // Computed
    hasPhotoReplacements,
    photosToKeepCount,
    photosToReplaceCount
  }
}
