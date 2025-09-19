<template>
  <div class="min-h-screen bg-brand-background p-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <button
          @click="goBack"
          class="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50 transition-colors focus:outline-none"
          aria-label="Go back"
        >
          <i class="pi pi-arrow-left text-lg text-brand-primary"></i>
        </button>
        <div>
          <h1 class="text-2xl lg:text-3xl font-bold text-brand-primary">Select Photos</h1>
          <p class="text-brand-text-muted">Choose photos for your {{ isWizardFlow ? 'memory card' : 'memory book' }}</p>
        </div>
      </div>

      <!-- Photo Selection Interface -->
      <PhotoSelectionInterface
        :filtered-assets="availableAssets"
        :loading-assets="loadingAssets"
        :selected-memories="selectedAssets"
        :method="photoSelectionMethod"
        :computed-available-tags="computedAvailableTags"
        :selected-tags="selectedTags"
        :selected-tag-filter="selectedTagFilter"
        :location-type="locationType"
        :selected-location="selectedLocation"
        :available-countries="availableCountries"
        :available-states="availableStates"
        :available-cities="availableCities"
        :date-range="dateRange"
        @update:method="updatePhotoSelectionMethod"
        @update:selected-tags="updateSelectedTags"
        @update:selected-tag-filter="updateSelectedTagFilter"
        @update:location-type="updateLocationType"
        @update:selected-location="updateSelectedLocation"
        @update:date-range="updateDateRange"
        @update:selectedMemories="updateSelectedMemories"
        @upload-photos="handleUploadMorePhotos"
        @toggle-asset="toggleAssetSelection"
        @load-more="loadMoreAssets"
      />

      <!-- Action Buttons -->
      <div class="flex justify-between items-center pt-6 border-t border-gray-100 mt-8">
        <button
          @click="goBack"
          class="px-4 py-2 text-brand-text-muted hover:text-brand-primary transition-colors"
        >
          Back
        </button>
        <div class="flex items-center gap-4">
          <span class="text-sm text-brand-text-muted">
            <span v-if="photoSelectionMethod === 'photo_library'">
              {{ selectedAssets.length }} photo{{ selectedAssets.length !== 1 ? 's' : '' }} selected
            </span>
            <span v-else>
              AI will choose from your photos
            </span>
          </span>
          <button
            @click="continueWithSelection"
            :disabled="!canContinue"
            class="bg-brand-highlight hover:bg-brand-highlight/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            {{ isWizardFlow ? 'Continue to Wizard' : 'Continue to Memory Book' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Set the layout for this page
definePageMeta({
  layout: 'default',
  ssr: false
})

import { usePhotoSelection } from '~/composables/usePhotoSelection'

// Get route and router
const route = useRoute()
const router = useRouter()

// Use the photo selection composable
const {
  photoSelection_method,
  photoSelection_dateRange,
  photoSelection_selectedTags,
  photoSelection_selectedTagFilter,
  photoSelection_locationType,
  photoSelection_selectedLocation,
  photoSelection_availableCountries,
  photoSelection_availableStates,
  photoSelection_availableCities,
  photoSelection_selectedMemories,
  photoSelection_availableAssets,
  photoSelection_loadingAssets,
  photoSelection_options,
  photoSelection_computedAvailableTags,
  photoSelection_filteredAssets,
  photoSelection_loadAvailableAssets,
  photoSelection_loadLocationData,
  photoSelection_toggleMemorySelection,
  photoSelection_resetSelection,
  photoSelection_getSelectedAssets
} = usePhotoSelection()

// Computed properties for template
const isWizardFlow = computed(() => route.query.return === 'wizard')
const availableAssets = computed(() => photoSelection_availableAssets.value)
const loadingAssets = computed(() => photoSelection_loadingAssets.value)
const selectedAssets = computed(() => photoSelection_selectedMemories.value)
const photoSelectionMethod = computed(() => photoSelection_method.value)
const photoSelectionOptions = computed(() => photoSelection_options.value)
const computedAvailableTags = computed(() => photoSelection_computedAvailableTags.value)
const selectedTags = computed(() => photoSelection_selectedTags.value)
const selectedTagFilter = computed(() => photoSelection_selectedTagFilter.value)
const locationType = computed(() => photoSelection_locationType.value)
const selectedLocation = computed(() => photoSelection_selectedLocation.value)
const availableCountries = computed(() => photoSelection_availableCountries.value)
const availableStates = computed(() => photoSelection_availableStates.value)
const availableCities = computed(() => photoSelection_availableCities.value)
const dateRange = computed(() => photoSelection_dateRange.value)

// Determine if user can continue based on selection method
const canContinue = computed(() => {
  const method = photoSelectionMethod.value
  const hasSelectedPhotos = selectedAssets.value.length > 0
  
  console.log('🔍 [Photo Selection] canContinue check:', {
    method,
    hasSelectedPhotos,
    selectedAssets: selectedAssets.value.length,
    selectedLocation: selectedLocation.value,
    dateRange: dateRange.value,
    selectedTags: selectedTags.value.length
  })
  
  // For AI-driven methods, user doesn't need to manually select photos
  const aiDrivenMethods = ['last_100', 'geo_code', 'date_range', 'tags']
  
  if (aiDrivenMethods.includes(method)) {
    // For AI-driven methods, check if we have the required parameters
    let canProceed = false
    switch (method) {
      case 'geo_code':
        canProceed = !!selectedLocation.value
        break
      case 'date_range':
        canProceed = !!(dateRange.value.start || dateRange.value.end)
        break
      case 'tags':
        canProceed = selectedTags.value.length > 0
        break
      case 'last_100':
        canProceed = true // No additional parameters needed
        break
      default:
        canProceed = true
    }
    console.log('🔍 [Photo Selection] AI-driven method result:', canProceed)
    return canProceed
  }
  
  // For manual selection (photo_library), require selected photos
  const result = hasSelectedPhotos
  console.log('🔍 [Photo Selection] Manual selection result:', result)
  return result
})

// Methods for template
const updatePhotoSelectionMethod = (method) => {
  photoSelection_method.value = method
}

const updateSelectedTags = (tags) => {
  photoSelection_selectedTags.value = tags
}

const updateSelectedTagFilter = (filter) => {
  photoSelection_selectedTagFilter.value = filter
}

const updateLocationType = (type) => {
  photoSelection_locationType.value = type
}

const updateSelectedLocation = (location) => {
  photoSelection_selectedLocation.value = location
}

const updateDateRange = (range) => {
  photoSelection_dateRange.value = range
}

const updateSelectedMemories = (memories) => {
  photoSelection_selectedMemories.value = memories
}

const toggleAssetSelection = (assetId) => {
  photoSelection_toggleMemorySelection(assetId)
}

const loadMoreAssets = () => {
  // Implement pagination if needed
  console.log('Load more assets')
}

// Handle upload more photos
const handleUploadMorePhotos = () => {
  // Preserve current selection in URL params
  const selectedPhotoIds = selectedAssets.value.map(asset => asset.id).join(',')
  const currentMethod = photoSelectionMethod.value
  
  // Navigate to upload with return parameters and current selection
  router.push(`/app/memory-books/upload?return=${isWizardFlow.value ? 'wizard' : 'memory-book'}&preserveSelection=${selectedPhotoIds}&method=${currentMethod}`)
}

// Initialize data
onMounted(async () => {
  try {
    await Promise.all([
      photoSelection_loadAvailableAssets(),
      photoSelection_loadLocationData()
    ])
    
    // Restore preserved selection if returning from upload
    const preserveSelection = route.query.preserveSelection
    const method = route.query.method
    
    if (preserveSelection) {
      const selectedPhotoIds = preserveSelection.split(',')
      console.log('🔍 [Photo Selection] Restoring preserved selection:', selectedPhotoIds)
      
      // Set the selected memories
      photoSelection_selectedMemories.value = selectedPhotoIds
      
      // Clear the preserveSelection from URL to avoid confusion
      router.replace({ 
        query: { 
          ...route.query, 
          preserveSelection: undefined 
        } 
      })
    }
    
    if (method) {
      console.log('🔍 [Photo Selection] Restoring preserved method:', method)
      photoSelection_method.value = method
      
      // Clear the method from URL
      router.replace({ 
        query: { 
          ...route.query, 
          method: undefined 
        } 
      })
    }
    
  } catch (error) {
    console.error('Error loading photo selection data:', error)
  }
})

// Continue with selection
const continueWithSelection = () => {
  console.log('🔍 [Photo Selection] continueWithSelection called')
  console.log('🔍 [Photo Selection] isWizardFlow:', isWizardFlow.value)
  console.log('🔍 [Photo Selection] selectedAssets:', selectedAssets.value)
  console.log('🔍 [Photo Selection] photoSelectionMethod:', photoSelectionMethod.value)
  
  if (isWizardFlow.value) {
    // Return to wizard with selected photos
    const selectedPhotoIds = selectedAssets.value.map(asset => asset.id).join(',')
    console.log('🔍 [Photo Selection] Navigating to wizard with photos:', selectedPhotoIds)
    router.push('/app/memory-books?wizardStep=photos&selectedPhotos=' + selectedPhotoIds)
  } else {
    // Continue to memory book creation with selected photos and method
    const method = photoSelectionMethod.value
    const selectedPhotoIds = selectedAssets.value.map(asset => asset.id).join(',')
    const url = '/app/memory-books?return=memory-book&selectedPhotos=' + selectedPhotoIds + '&method=' + method
    console.log('🔍 [Photo Selection] Navigating to memory book with photos:', selectedPhotoIds, 'method:', method)
    console.log('🔍 [Photo Selection] Full URL:', url)
    router.push(url)
  }
}

// Go back
const goBack = () => {
  if (isWizardFlow.value) {
    router.push('/app/memory-books')
  } else {
    router.push('/app/memory-books')
  }
}
</script>
