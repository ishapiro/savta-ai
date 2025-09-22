<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="text-center">
      <div class="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-brand-flash to-brand-highlight rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
        <i class="pi pi-images text-xl sm:text-2xl text-white"></i>
      </div>
      <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-1">Choose the photos to replace</h3>
      <p class="text-xs sm:text-base text-gray-600 mb-2">
        Tap on photos you want to replace with new ones. I'll keep the ones you don't select and find new photos for the ones you mark.
      </p>
      <p class="text-xs text-brand-flash font-medium">📸 Current photos from your {{ itemType }}</p>
    </div>

    <!-- Current Photos Grid -->
    <div class="w-full max-w-lg mx-auto">
      <div class="grid grid-cols-3 gap-2 sm:gap-3">
        <div 
          v-for="photo in existingAssets || []" 
          :key="`photo-${photo}`"
          class="relative cursor-pointer"
          @click="togglePhotoReplacement(photo)"
        >
          <div class="aspect-square rounded-md overflow-hidden border"
            :class="photosToReplace.includes(photo)
              ? 'border-orange-500 ring-2 ring-orange-500 bg-orange-50'
              : 'border-gray-200'">
            <!-- Actual photo thumbnail -->
            <img 
              v-if="getPhotoThumbnail(photo) && !imageErrorStates[photo]"
              :src="getPhotoThumbnail(photo)" 
              :alt="`Photo ${photo}`"
              class="w-full h-full object-contain"
              @error="handleImageError"
              @load="handleImageLoad"
            />
            
            <!-- Fallback placeholder (shown when no thumbnail or error) -->
            <div v-else class="image-placeholder w-full h-full bg-gray-100 flex items-center justify-center">
              <i class="pi pi-image text-xl text-gray-400"></i>
            </div>
            
            <!-- Minimal selected badge -->
            <div v-if="photosToReplace.includes(photo)" class="absolute top-1 right-1 text-[10px] px-1.5 py-0.5 rounded bg-orange-500 text-white">Replace</div>
          </div>
          
          <!-- Photo status text -->
          <div class="text-center mt-1">
            <span class="text-xs font-medium"
              :class="photosToReplace.includes(photo) ? 'text-brand-flash' : 'text-brand-accent'">
              {{ photosToReplace.includes(photo) ? 'Replace' : 'Keep' }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Summary -->
      <div class="mt-4 text-center">
        <p class="text-sm text-gray-600">
          <span class="font-medium text-brand-accent">{{ (existingAssets?.length || 0) - photosToReplace.length }}</span> photos to keep, 
          <span class="font-medium text-brand-flash">{{ photosToReplace.length }}</span> photos to replace
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

// Props
const props = defineProps({
  existingAssets: {
    type: Array,
    default: () => []
  },
  itemType: {
    type: String,
    default: 'memory book'
  },
  modelValue: {
    type: Array,
    default: () => []
  },
  assetThumbnails: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Local state
const photosToReplace = ref([...props.modelValue])
const imageLoadingStates = ref({})
const imageErrorStates = ref({})

// Method to get photo thumbnail from passed props
const getPhotoThumbnail = (photoId) => {
  if (!photoId) return null
  
  // Get thumbnail from passed props
  return props.assetThumbnails[photoId] || null
}

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue, oldValue) => {
  console.log('🔍 [PhotoReplacementSelector] modelValue changed from:', oldValue, 'to:', newValue)
  // Only update if the values are actually different to prevent loops
  if (JSON.stringify(newValue) !== JSON.stringify(photosToReplace.value)) {
    photosToReplace.value = [...newValue]
  }
}, { deep: true })

// Watch for changes to photosToReplace and emit updates
watch(photosToReplace, (newValue, oldValue) => {
  console.log('🔍 [PhotoReplacementSelector] photosToReplace changed from:', oldValue, 'to:', newValue)
  // Only emit if the values are actually different to prevent loops
  if (JSON.stringify(newValue) !== JSON.stringify(props.modelValue)) {
    emit('update:modelValue', [...newValue])
  }
}, { deep: true })

// Watch for thumbnail availability and set loading states
watch(() => props.existingAssets, (newAssets) => {
  if (newAssets && newAssets.length > 0) {
    newAssets.forEach(photoId => {
      if (getPhotoThumbnail(photoId)) {
        imageLoadingStates.value[photoId] = true
      }
    })
  }
}, { immediate: true })

// Photo replacement methods
const togglePhotoReplacement = (photoId) => {
  console.log('🔍 [PhotoReplacementSelector] togglePhotoReplacement called for photo:', photoId)
  const startTime = performance.now()
  
  try {
    const index = photosToReplace.value.indexOf(photoId)
    console.log('🔍 [PhotoReplacementSelector] Found index:', index)
    
    if (index > -1) {
      // Remove from replacement list
      console.log('🔍 [PhotoReplacementSelector] Removing photo from replacement list')
      photosToReplace.value.splice(index, 1)
    } else {
      // Add to replacement list
      console.log('🔍 [PhotoReplacementSelector] Adding photo to replacement list')
      photosToReplace.value.push(photoId)
    }
    
    const endTime = performance.now()
    console.log('🔍 [PhotoReplacementSelector] togglePhotoReplacement completed in:', endTime - startTime, 'ms')
    console.log('🔍 [PhotoReplacementSelector] Photos to replace after:', [...photosToReplace.value])
  } catch (error) {
    const endTime = performance.now()
    console.error('🔍 [PhotoReplacementSelector] Error in togglePhotoReplacement after:', endTime - startTime, 'ms:', error)
    console.error('🔍 [PhotoReplacementSelector] Error stack:', error.stack)
    // Don't let this error crash the component
  }
}

// Image load handler
const handleImageLoad = (event) => {
  console.log('🔍 [PhotoReplacementSelector] Image loaded successfully for:', event.target.src)
  const startTime = performance.now()
  
  try {
    // Find the photo ID from the src and clear loading state
    const photoId = Object.keys(imageLoadingStates.value).find(id => 
      getPhotoThumbnail(id) === event.target.src
    )
    if (photoId) {
      imageLoadingStates.value[photoId] = false
      console.log('🔍 [PhotoReplacementSelector] Cleared loading state for photo:', photoId)
    } else {
      console.log('🔍 [PhotoReplacementSelector] Could not find photo ID for loaded image:', event.target.src)
    }
  } catch (error) {
    console.error('🔍 [PhotoReplacementSelector] Error in handleImageLoad:', error)
  } finally {
    const endTime = performance.now()
    console.log('🔍 [PhotoReplacementSelector] handleImageLoad completed in:', endTime - startTime, 'ms')
  }
}

// Image error handler
const handleImageError = (event) => {
  console.log('🔍 [PhotoReplacementSelector] Image load error for:', event.target.src)
  const startTime = performance.now()
  
  try {
    // Find the photo ID from the src and mark as error
    const photoId = Object.keys(imageErrorStates.value).find(id => 
      getPhotoThumbnail(id) === event.target.src
    ) || Object.keys(imageLoadingStates.value).find(id => 
      getPhotoThumbnail(id) === event.target.src
    )
    
    if (photoId) {
      imageErrorStates.value[photoId] = true
      imageLoadingStates.value[photoId] = false
      console.log('🔍 [PhotoReplacementSelector] Marked photo as error:', photoId)
    } else {
      console.log('🔍 [PhotoReplacementSelector] Could not find photo ID for error image:', event.target.src)
    }
  } catch (error) {
    console.error('🔍 [PhotoReplacementSelector] Error in handleImageError:', error)
    console.error('🔍 [PhotoReplacementSelector] Error stack:', error.stack)
  } finally {
    const endTime = performance.now()
    console.log('🔍 [PhotoReplacementSelector] handleImageError completed in:', endTime - startTime, 'ms')
  }
}
</script>
