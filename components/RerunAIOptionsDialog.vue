<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  totalPhotos: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:visible', 'start'])

// Reprocessing options
const options = ref({
  faces: true,
  captions: false,
  tags: false,
  location: false,
  onlyMissing: false
})

// Toggle select all/none (excluding onlyMissing flag)
const toggleAll = () => {
  const processingOptions = {
    faces: options.value.faces,
    captions: options.value.captions,
    tags: options.value.tags,
    location: options.value.location
  }
  const allSelected = Object.values(processingOptions).every(v => v)
  const newValue = !allSelected
  
  options.value.faces = newValue
  options.value.captions = newValue
  options.value.tags = newValue
  options.value.location = newValue
  // Keep onlyMissing as-is
}

// Check if all processing options selected (excluding onlyMissing)
const allSelected = computed(() => {
  return options.value.faces && options.value.captions && options.value.tags && options.value.location
})

// Check if any processing option selected (excluding onlyMissing)
const anySelected = computed(() => {
  return options.value.faces || options.value.captions || options.value.tags || options.value.location
})

// Cost estimation (rough estimates)
const estimatedCost = computed(() => {
  let cost = 0
  const photosCount = props.totalPhotos || 1
  
  if (options.value.faces) {
    // IndexFaces: $0.001 per image
    // SearchFaces: ~$0.002 per image (avg 2 faces)
    cost += photosCount * 0.003
  }
  
  if (options.value.captions || options.value.tags) {
    // OpenAI Vision: $0.01 per image
    cost += photosCount * 0.01
  }
  
  if (options.value.location) {
    // Geocoding: $0.005 per request (only if no location)
    cost += photosCount * 0.0025 // Estimate 50% need geocoding
  }
  
  return cost.toFixed(2)
})

// Start reprocessing
const startReprocessing = () => {
  emit('start', { ...options.value })
  emit('update:visible', false)
}

// Close dialog
const close = () => {
  emit('update:visible', false)
}
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    modal
    :closable="true"
    header="Reprocess Photos"
    class="w-[95vw] max-w-lg"
  >
    <div class="space-y-6">
      <!-- Description -->
      <div class="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <i class="pi pi-info-circle text-blue-400 text-xl"></i>
          </div>
          <div class="ml-3">
            <p class="text-sm text-blue-700">
              Select which AI features to reprocess for {{ totalPhotos }} {{ totalPhotos === 1 ? 'photo' : 'photos' }}.
              Only selected features will be updated.
            </p>
          </div>
        </div>
      </div>

      <!-- Select All Toggle -->
      <div class="flex items-center justify-between pb-4 border-b border-gray-200">
        <span class="text-sm font-medium text-gray-700">Select all options</span>
        <button
          @click="toggleAll"
          class="inline-flex items-center px-6 py-2 font-medium rounded transition-colors border-0"
          :class="allSelected ? 'bg-brand-dialog-edit hover:bg-brand-dialog-edit-hover text-white' : 'bg-brand-dialog-secondary hover:bg-brand-dialog-secondary-hover text-brand-primary'"
        >
          <i :class="allSelected ? 'pi pi-check-square' : 'pi pi-square'" class="mr-2"></i>
          {{ allSelected ? 'Deselect All' : 'Select All' }}
        </button>
      </div>

      <!-- Options List -->
      <div class="space-y-4">
        <!-- Face Recognition -->
        <div class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            id="opt-faces"
            v-model="options.faces"
            class="mt-1 h-5 w-5 text-brand-highlight rounded focus:ring-brand-highlight focus:ring-2"
          />
          <div class="flex-1">
            <label for="opt-faces" class="block text-sm font-medium text-gray-900 cursor-pointer">
              Face Recognition
            </label>
            <p class="text-xs text-gray-600 mt-1">
              Detect and match faces using AWS Rekognition Collections. Auto-assigns high-confidence matches.
            </p>
            <p class="text-xs text-gray-500 mt-1">
              Cost: ~$0.003 per photo
            </p>
          </div>
        </div>

        <!-- Captions & Descriptions -->
        <div class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            id="opt-captions"
            v-model="options.captions"
            class="mt-1 h-5 w-5 text-brand-highlight rounded focus:ring-brand-highlight focus:ring-2"
          />
          <div class="flex-1">
            <label for="opt-captions" class="block text-sm font-medium text-gray-900 cursor-pointer">
              Captions & Descriptions
            </label>
            <p class="text-xs text-gray-600 mt-1">
              Generate AI captions and detailed descriptions using OpenAI vision analysis.
            </p>
            <p class="text-xs text-gray-500 mt-1">
              Cost: ~$0.01 per photo
            </p>
          </div>
        </div>

        <!-- Tags & Objects -->
        <div class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            id="opt-tags"
            v-model="options.tags"
            class="mt-1 h-5 w-5 text-brand-highlight rounded focus:ring-brand-highlight focus:ring-2"
          />
          <div class="flex-1">
            <label for="opt-tags" class="block text-sm font-medium text-gray-900 cursor-pointer">
              Tags & Objects
            </label>
            <p class="text-xs text-gray-600 mt-1">
              Identify objects, scenes, and activities in photos for better organization.
            </p>
            <p class="text-xs text-gray-500 mt-1">
              Cost: Included with captions (~$0.01 per photo)
            </p>
          </div>
        </div>

        <!-- Location Data -->
        <div class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            id="opt-location"
            v-model="options.location"
            class="mt-1 h-5 w-5 text-brand-highlight rounded focus:ring-brand-highlight focus:ring-2"
          />
          <div class="flex-1">
            <label for="opt-location" class="block text-sm font-medium text-gray-900 cursor-pointer">
              Location Data
            </label>
            <p class="text-xs text-gray-600 mt-1">
              Extract GPS coordinates from EXIF and convert to readable location names.
            </p>
            <p class="text-xs text-gray-500 mt-1">
              Cost: ~$0.0025 per photo (only if geocoding needed)
            </p>
          </div>
        </div>
      </div>

      <!-- Filtering Options -->
      <div class="border-t border-gray-200 pt-4">
        <h3 class="text-sm font-semibold text-gray-900 mb-3">Processing Filter</h3>
        
        <!-- Only Missing Data -->
        <div class="flex items-start space-x-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <input
            type="checkbox"
            id="opt-only-missing"
            v-model="options.onlyMissing"
            class="mt-1 h-5 w-5 text-brand-highlight rounded focus:ring-brand-highlight focus:ring-2"
          />
          <div class="flex-1">
            <label for="opt-only-missing" class="block text-sm font-medium text-gray-900 cursor-pointer">
              Only Process Photos Missing Data
            </label>
            <p class="text-xs text-gray-600 mt-1">
              Skip photos that already have the selected data. For example, if you select "Captions" and enable this option, only photos without captions will be processed.
            </p>
            <p class="text-xs text-blue-600 mt-2 font-medium">
              <i class="pi pi-info-circle mr-1"></i>
              This can significantly reduce costs by avoiding unnecessary reprocessing.
            </p>
          </div>
        </div>
      </div>

      <!-- Cost Summary -->
      <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">Estimated Cost:</span>
          <span class="text-lg font-bold text-brand-primary">
            ${{ estimatedCost }}
          </span>
        </div>
        <p class="text-xs text-gray-500 mt-2">
          Based on {{ totalPhotos }} {{ totalPhotos === 1 ? 'photo' : 'photos' }} × selected options
        </p>
      </div>

      <!-- Warning -->
      <div v-if="!anySelected" class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <i class="pi pi-exclamation-triangle text-yellow-400 text-xl"></i>
          </div>
          <div class="ml-3">
            <p class="text-sm text-yellow-700">
              Please select at least one option to reprocess.
            </p>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <Button
          label="Cancel"
          @click="close"
          class="bg-brand-dialog-secondary hover:bg-brand-dialog-secondary-hover text-brand-primary border-0 px-6 py-2 rounded"
        />
        <Button
          label="Start Reprocessing"
          @click="startReprocessing"
          :disabled="!anySelected"
          icon="pi pi-refresh"
          class="bg-brand-dialog-edit hover:bg-brand-dialog-edit-hover text-white border-0 px-6 py-2 rounded"
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
/* Custom checkbox styles if needed */
input[type="checkbox"]:checked {
  background-color: var(--brand-highlight, #4F46E5);
  border-color: var(--brand-highlight, #4F46E5);
}
</style>

