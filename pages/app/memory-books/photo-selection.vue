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
            {{ selectedAssets.length }} photo{{ selectedAssets.length !== 1 ? 's' : '' }} selected
          </span>
          <button
            @click="continueWithSelection"
            :disabled="selectedAssets.length === 0"
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
  if (isWizardFlow.value) {
    // Return to wizard with selected photos
    router.push('/app/memory-books?wizardStep=photos&selectedPhotos=' + selectedAssets.value.join(','))
  } else {
    // Continue to memory book creation with selected photos
    router.push('/app/memory-books?createBook=true&selectedPhotos=' + selectedAssets.value.join(','))
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
