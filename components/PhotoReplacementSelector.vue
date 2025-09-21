<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="text-center">
      <div class="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-brand-flash to-brand-highlight rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
        <i class="pi pi-images text-xl sm:text-2xl text-white"></i>
      </div>
      <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-1">Choose which photos to replace</h3>
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
          :key="photo"
          class="relative cursor-pointer group"
          @click="togglePhotoReplacement(photo)"
        >
          <div class="aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300"
            :class="photosToReplace.includes(photo) 
              ? 'border-brand-flash bg-gradient-to-br from-brand-flash/10 to-brand-highlight/10 shadow-lg scale-105' 
              : 'border-gray-200 hover:border-brand-flash/50 hover:shadow-md'">
            <!-- Actual photo thumbnail -->
            <img 
              :src="getAssetThumbnail(photo)" 
              :alt="`Photo ${photo}`"
              class="w-full h-full object-contain"
              @error="handleImageError"
            />
            
            <!-- Fallback placeholder (hidden by default) -->
            <div class="image-placeholder w-full h-full bg-gray-100 flex items-center justify-center" style="display: none;">
              <i class="pi pi-image text-xl text-gray-400"></i>
            </div>
            
            <!-- Replace indicator -->
            <div v-if="photosToReplace.includes(photo)" class="absolute top-1 right-1">
              <div class="w-4 h-4 bg-brand-flash rounded-full flex items-center justify-center shadow-lg">
                <i class="pi pi-refresh text-white text-xs"></i>
              </div>
            </div>
            
            <!-- Keep indicator -->
            <div v-else class="absolute top-1 right-1">
              <div class="w-4 h-4 bg-brand-accent rounded-full flex items-center justify-center shadow-lg">
                <i class="pi pi-check text-white text-xs"></i>
              </div>
            </div>
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
import { useMemoryStudio } from '~/composables/useMemoryStudio'

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
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Use memory studio for asset thumbnails
const { getAssetThumbnail } = useMemoryStudio()

// Local state
const photosToReplace = ref([...props.modelValue])

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  photosToReplace.value = [...newValue]
}, { deep: true })

// Watch for changes to photosToReplace and emit updates
watch(photosToReplace, (newValue) => {
  emit('update:modelValue', [...newValue])
}, { deep: true })

// Photo replacement methods
const togglePhotoReplacement = (photoId) => {
  console.log('🔍 [PhotoReplacementSelector] togglePhotoReplacement called for photo:', photoId)
  const index = photosToReplace.value.indexOf(photoId)
  if (index > -1) {
    // Remove from replacement list
    photosToReplace.value.splice(index, 1)
  } else {
    // Add to replacement list
    photosToReplace.value.push(photoId)
  }
  console.log('🔍 [PhotoReplacementSelector] Photos to replace:', photosToReplace.value)
}

// Image error handler
const handleImageError = (event) => {
  console.log('🔍 [PhotoReplacementSelector] Image load error for:', event.target.src)
  // Hide the image and show placeholder
  event.target.style.display = 'none'
  const placeholder = event.target.nextElementSibling
  if (placeholder && placeholder.classList.contains('image-placeholder')) {
    placeholder.style.display = 'flex'
  }
}
</script>
