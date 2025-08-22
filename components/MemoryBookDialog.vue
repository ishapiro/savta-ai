<template>
  <Dialog
    v-model:visible="showDialog"
    modal
    :header="isEditing ? 'Edit Memory Recipe' : 'Create a New Memory Recipe'"
    class="w-[95vw] max-w-4xl memory-book-dialog mt-3"
    :closable="false"
  >
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Book Details Section -->
      <div class="bg-gradient-to-r from-brand-highlight/10 to-brand-secondary/10 rounded-lg p-4 border border-brand-highlight/30">
        <h3 class="text-lg font-semibold text-brand-primary mb-4 flex items-center gap-2">
          <i class="pi pi-book text-brand-secondary"></i>
          Book Details
        </h3>
        <div class="space-y-4">
          <!-- AI Supplemental Prompt -->
          <div>
            <label for="ai_supplemental_prompt" class="block text-sm font-medium text-brand-primary mb-2">
              Tell me about your memory (dates, locations, events, people)
            </label>
            <InputText
              id="ai_supplemental_prompt"
              v-model="form.ai_supplemental_prompt"
              class="w-full"
              placeholder="Enter AI prompt for story creation."
            />
          </div>
          
          <!-- Memory Event -->
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-2">Optional Memory Event</label>
            <Dropdown
              v-model="form.memoryEvent"
              :options="memoryEventOptions"
              option-label="label"
              option-value="value"
              placeholder="Select event"
              class="w-full"
            />
            <InputText
              v-if="form.memoryEvent === 'custom'"
              v-model="form.customMemoryEvent"
              class="w-full mt-2"
              placeholder="Enter custom event"
            />
          </div>
        </div>
      </div>

      <!-- Layout & Print Section -->
      <div class="bg-gradient-to-r from-brand-header/10 to-brand-highlight/10 rounded-lg p-4 border border-brand-header/30">
        <h3 class="text-lg font-semibold text-brand-primary mb-4 flex items-center gap-2">
          <i class="pi pi-file-pdf text-brand-header"></i>
          Layout & Print
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Layout Type -->
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-2">Layout Type</label>
            <Dropdown
              v-model="form.layoutType"
              :options="layoutOptions"
              option-label="label"
              option-value="value"
              placeholder="Select layout"
              class="w-full"
            />
          </div>
          
          <!-- Theme (only show when layout type is 'theme') -->
          <div v-if="form.layoutType === 'theme'">
            <label class="block text-sm font-medium text-brand-primary mb-2">Theme</label>
            <Dropdown
              v-model="form.theme_id"
              :options="themeOptions"
              option-label="label"
              option-value="value"
              placeholder="Select theme"
              class="w-full"
              :loading="loadingThemes"
            />
            <small class="text-brand-primary/70 text-xs mt-1 block">
              Select a custom theme for your memory book layout
            </small>
          </div>
          
          <!-- Print Size -->
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-2">Print Size</label>
            <Dropdown
              v-model="form.printSize"
              :options="printSizeOptions"
              option-label="label"
              option-value="value"
              placeholder="Select size"
              class="w-full"
              :disabled="form.layoutType === 'theme'"
            />
            <small v-if="form.layoutType === 'theme'" class="text-brand-primary/70 text-xs mt-1 block">
              Print size is determined by the selected theme
            </small>
          </div>
          
          <!-- Quality -->
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-2">Quality</label>
            <Dropdown
              v-model="form.quality"
              :options="qualityOptions"
              option-label="label"
              option-value="value"
              placeholder="Select quality"
              class="w-full"
            />
          </div>
          
          <!-- Medium -->
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-2">Medium</label>
            <Dropdown
              v-model="form.medium"
              :options="mediumOptions"
              option-label="label"
              option-value="value"
              placeholder="Select medium"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- Grid & Shape Section -->
      <div v-if="form.layoutType !== 'theme'" class="bg-gradient-to-r from-brand-secondary/10 to-brand-accent/10 rounded-lg p-4 border border-brand-secondary/30">
        <h3 class="text-lg font-semibold text-brand-primary mb-4 flex items-center gap-2">
          <i class="pi pi-th-large text-brand-secondary"></i>
          Grid & Shape
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Grid Layout -->
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-2">Grid Layout</label>
            <Dropdown
              v-model="form.gridLayout"
              :options="gridLayoutOptions"
              option-label="label"
              option-value="value"
              placeholder="Select grid layout"
              class="w-full"
            />
          </div>
          
          <!-- Number of Pages Input -->
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-2">Number of Pages</label>
            <div class="flex items-center gap-3">
              <InputNumber
                v-model="form.page_count"
                :min="1"
                :max="maxPagesAllowed"
                :step="1"
                placeholder="Enter number of pages"
                class="flex-1"
                show-buttons
                button-layout="horizontal"
                spinner-mode="horizontal"
                :pt="{
                  input: 'text-center',
                  button: 'bg-brand-flash border-brand-flash text-white hover:bg-brand-highlight'
                }"
              />
              <span class="text-sm text-brand-primary/70 whitespace-nowrap">
                (max {{ maxPagesAllowed }} pages)
              </span>
            </div>
            <p class="text-xs text-brand-primary/60 mt-1">
              Total photos needed: {{ totalPhotosNeeded }} photos
            </p>
          </div>
        </div>
      </div>

      <!-- Background and Captions Section -->
      <div class="bg-gradient-to-r from-brand-accent/10 to-brand-header/10 rounded-lg p-4 border border-brand-accent/30">
        <h3 class="text-lg font-semibold text-brand-primary mb-4 flex items-center gap-2">
          <i class="pi pi-magic text-brand-accent"></i>
          Background and Captions
        </h3>
        <div class="space-y-4">
          <!-- Background Type Selection -->
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-2">Background Style</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                class="relative cursor-pointer"
                @click="form.backgroundType = 'white'"
              >
                <div
                  class="border-2 rounded-lg p-4 text-center transition-all duration-200 h-full bg-brand-background shadow-md"
                  :class="form.backgroundType === 'white' 
                    ? 'border-brand-highlight bg-brand-highlight/10 shadow-xl scale-105' 
                    : 'border-brand-primary/20 hover:border-brand-accent hover:bg-brand-accent/10 hover:shadow-lg'"
                >
                  <div class="w-8 h-8 bg-white border-2 border-brand-primary/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <i class="pi pi-file text-brand-primary text-sm"></i>
                  </div>
                  <div class="text-sm font-bold text-brand-primary mb-1">Clean & Simple</div>
                  <div class="text-xs text-brand-primary/70">Pure white background for a classic, elegant look</div>
                  <div v-if="form.backgroundType === 'white'" class="absolute top-2 right-2">
                    <i class="pi pi-check text-brand-highlight text-sm"></i>
                  </div>
                </div>
              </div>
              
              <div
                class="relative cursor-pointer"
                @click="form.backgroundType = 'magical'"
              >
                <div
                  class="border-2 rounded-lg p-4 text-center transition-all duration-200 h-full bg-brand-background shadow-md"
                  :class="form.backgroundType === 'magical' 
                    ? 'border-brand-highlight bg-brand-highlight/10 shadow-xl scale-105' 
                    : 'border-brand-primary/20 hover:border-brand-accent hover:bg-brand-accent/10 hover:shadow-lg'"
                >
                  <div class="w-8 h-8 bg-gradient-to-br from-brand-accent/30 via-brand-secondary/30 to-brand-highlight/30 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <i class="pi pi-sparkles text-brand-secondary text-sm"></i>
                  </div>
                  <div class="text-sm font-bold text-brand-primary mb-1">Magical Design</div>
                  <div class="text-xs text-brand-primary/70">AI-generated background that matches your theme</div>
                  <div v-if="form.backgroundType === 'magical'" class="absolute top-2 right-2">
                    <i class="pi pi-check text-brand-highlight text-sm"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Background Opacity (only show when magical background is selected) -->
          <div v-if="form.backgroundType === 'magical'" class="bg-white rounded-lg p-4 border border-brand-primary/20">
            <div class="space-y-3">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-gradient-to-br from-brand-accent/20 to-brand-header/20 rounded-full flex items-center justify-center">
                  <i class="pi pi-sliders-h text-brand-accent text-sm"></i>
                </div>
                <div class="flex-1">
                  <label class="text-sm font-semibold text-brand-primary">Background Opacity</label>
                  <p class="text-xs text-brand-primary/70">Adjust how transparent the background appears</p>
                </div>
                <div class="text-sm font-bold text-brand-primary min-w-[3rem] text-center">
                  {{ form.backgroundOpacity }}%
                </div>
              </div>
              <div class="px-2">
                <Slider
                  v-model="form.backgroundOpacity"
                  :min="10"
                  :max="100"
                  :step="5"
                  class="w-full"
                />
                <div class="flex justify-between text-xs text-brand-primary/50 mt-1">
                  <span>10%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- AI Captions Option -->
          <div class="bg-white rounded-lg p-4 border border-brand-primary/20">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-gradient-to-br from-brand-secondary/20 to-brand-header/20 rounded-full flex items-center justify-center">
                  <i class="pi pi-comment text-brand-secondary text-sm"></i>
                </div>
                <div>
                  <div class="flex items-center space-x-2">
                    <Checkbox
                      v-model="form.includeCaptions"
                      :binary="true"
                      input-id="includeCaptions"
                    />
                    <label for="includeCaptions" class="text-sm font-semibold text-brand-primary">Captions</label>
                  </div>
                  <p class="text-xs text-brand-primary/70 mt-1">Include AI or user provided captions with each photo</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Auto Enhance Option -->
          <div class="bg-white rounded-lg p-4 border border-brand-primary/20">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-gradient-to-br from-brand-accent/20 to-brand-secondary/20 rounded-full flex items-center justify-center">
                  <i class="pi pi-magic text-brand-accent text-sm"></i>
                </div>
                <div>
                  <div class="flex items-center space-x-2">
                    <Checkbox
                      v-model="form.autoEnhance"
                      :binary="true"
                      input-id="autoEnhance"
                    />
                    <label for="autoEnhance" class="text-sm font-semibold text-brand-primary">Auto Enhance</label>
                  </div>
                  <p class="text-xs text-brand-primary/70 mt-1">Automatically enhance photos with brightness, saturation, and sharpness improvements</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Photo Selection Section -->
      <div class="bg-gradient-to-r from-brand-secondary/10 to-brand-highlight/10 rounded-lg p-4 border border-brand-secondary/30">
        <h3 class="text-lg font-semibold text-brand-primary mb-4 flex items-center gap-2">
          <i class="pi pi-images text-brand-secondary"></i>
          Photo Selection
        </h3>
        <div class="space-y-4">
          <!-- Selected Assets Summary -->
          <div class="bg-white rounded-lg p-3 border border-brand-primary/20">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-gradient-to-br from-brand-secondary/20 to-brand-highlight/20 rounded-full flex items-center justify-center">
                  <i class="pi pi-heart text-brand-secondary text-sm"></i>
                </div>
                <div>
                  <p class="text-sm font-medium text-brand-primary">
                    {{ selectedAssets.length }} photos selected
                  </p>
                  <p class="text-xs text-brand-primary/70">
                    <span v-if="form.layoutType === 'theme' && selectedThemePhotoCount">
                      Theme will select {{ selectedThemePhotoCount }} photos from your selection.
                    </span>
                    <span v-else-if="form.layoutType === 'theme' && !selectedThemePhotoCount">
                      Please select a theme to see photo count.
                    </span>
                    <span v-else-if="form.layoutType === 'grid' && selectedAssets.length === 0">
                      Need {{ totalPhotosNeeded }} photos for {{ form.page_count }} page{{ form.page_count > 1 ? 's' : '' }}
                    </span>
                    <span v-else-if="form.layoutType === 'grid' && selectedAssets.length > 0">
                      {{ selectedAssets.length }} photos selected for {{ form.page_count }} page{{ form.page_count > 1 ? 's' : '' }}
                    </span>
                    <span v-else-if="selectedAssets.length === 0">
                      No photos selected
                    </span>
                    <span v-else>
                      Will create approximately {{ calculatedPageCount }} pages
                    </span>
                  </p>
                </div>
              </div>
              <Button
                label="Select Photos"
                icon="pi pi-images"
                size="small"
                @click="openPhotoSelector"
                class="bg-brand-dialog-save border-0 text-white font-semibold rounded-full px-4 py-2 shadow-lg transition-all duration-200 hover:scale-105"
              />
            </div>
          </div>
          
          <!-- Selected Assets Grid -->
          <div v-if="selectedAssets.length > 0" class="bg-white rounded-lg p-3 border border-brand-primary/20">
            <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-32 overflow-y-auto">
              <div
                v-for="asset in selectedAssets.slice(0, 16)"
                :key="asset.id"
                class="aspect-square bg-brand-background rounded-lg border border-brand-primary/20 overflow-hidden"
              >
                <img 
                  v-if="asset.storage_url"
                  :src="asset.storage_url"
                  :alt="asset.user_caption || asset.ai_caption || 'Memory'"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <i class="pi pi-image text-brand-primary/40 text-xs"></i>
                </div>
              </div>
              <div v-if="selectedAssets.length > 16" class="aspect-square bg-brand-background rounded-lg border border-brand-primary/20 flex items-center justify-center text-xs text-brand-primary/50 font-medium">
                +{{ selectedAssets.length - 16 }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex flex-col sm:flex-row justify-end items-center gap-3 pt-4 border-t border-brand-primary/20">
        <Button
          type="button"
          label="Cleanup"
          icon="pi pi-refresh"
          @click="$emit('cleanup')"
          class="bg-brand-dialog-delete border-0 w-auto rounded-full px-6 py-2 shadow"
        />
        <Button
          type="button"
          label="Cancel"
          icon="pi pi-times"
          @click="$emit('close')"
          class="bg-brand-dialog-cancel border-0 w-auto rounded-full px-6 py-2"
        />
        <Button
          type="submit"
          :label="isEditing ? 'Update' : 'Compose Memory Book'"
          icon="pi pi-check"
          :loading="loading"
          :disabled="loading || selectedAssets.length === 0"
          class="bg-brand-dialog-save border-0 w-auto rounded-full px-6 py-2"
        />
      </div>
    </form>

    <!-- Photo Selection Modal -->
    <Dialog
      v-model:visible="showPhotoSelector"
      modal
      header="Select Your Photos"
      class="w-full max-w-sm sm:max-w-lg md:max-w-3xl lg:max-w-5xl h-[75vh] max-h-[75vh] flex flex-col mt-4 sm:mt-8"
      :closable="false"
    >
      <div v-if="!photoSelection_loadingAssets" class="flex-1 space-y-2 sm:space-y-4 overflow-y-auto px-1 sm:px-0 py-2 sm:py-4">
        <!-- Photo Selection Interface Component -->
        <PhotoSelectionInterface
          ref="photoSelectionInterfaceRef"
          v-model:method="photoSelection_method"
          v-model:dateRange="photoSelection_dateRange"
          v-model:selectedTags="photoSelection_selectedTags"
          v-model:locationType="photoSelection_locationType"
          v-model:selectedLocation="photoSelection_selectedLocation"
          v-model:selectedMemories="photoSelection_selectedMemories"
          v-model:selectedTagFilter="photoSelection_selectedTagFilter"
          :title="form.ai_supplemental_prompt || 'your memory book'"
          :computedAvailableTags="photoSelection_computedAvailableTags"
          :availableCountries="photoSelection_availableCountries"
          :availableStates="photoSelection_availableStates"
          :availableCities="photoSelection_availableCities"
          :filteredAssets="photoSelection_filteredAssets"
          :loadingAssets="photoSelection_loadingAssets"
          :isUploading="photoSelection_isUploading"
          @upload-photos="handleUploadPhotos"
          @no-photos-found="handleNoPhotosFound"
          @close-photo-library="handleClosePhotoLibrary"
        />
      </div>
      
      <!-- Loading State -->
      <div v-else class="flex-1 flex items-center justify-center py-4 sm:py-8">
        <div class="text-center">
          <i class="pi pi-spin pi-spinner text-2xl sm:text-3xl mb-2 sm:mb-3 text-brand-secondary"></i>
          <p class="text-xs sm:text-sm text-brand-primary/70">Loading your photos...</p>
        </div>
      </div>
      
      <template #footer>
        <div class="flex-shrink-0 border-t border-gray-200 pt-3 sm:pt-4">
          <div class="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3">
            <div class="flex gap-2 w-full sm:w-auto">
              <Button
                label="Cancel"
                icon="pi pi-times"
                @click="closePhotoSelector"
                class="bg-brand-dialog-cancel border-0 rounded-full px-3 sm:px-4 text-xs sm:text-sm font-bold shadow w-full sm:w-auto"
              />
            </div>
            <div class="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 w-full sm:w-auto">
              <span class="text-xs sm:text-sm text-brand-primary/70 text-center sm:text-left">
                <span v-if="photoSelection_method === 'last_100'">AI will select photos</span>
                <span v-else>{{ photoSelection_selectedMemories.length }} selected</span>
              </span>
              <Button
                label="Save Selection"
                icon="pi pi-check"
                :disabled="photoSelection_method !== 'last_100' && photoSelection_selectedMemories.length === 0"
                @click="savePhotoSelection"
                class="bg-brand-dialog-save rounded-full border-0 w-full sm:w-auto text-xs sm:text-sm px-3 sm:px-4 py-2"
              />
            </div>
          </div>
        </div>
      </template>
    </Dialog>
  </Dialog>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import PhotoSelectionInterface from '~/components/PhotoSelectionInterface.vue'

// Import database composable
const db = useDatabase()

const props = defineProps({
  isEditing: Boolean,
  initialData: { type: Object, default: () => ({}) },
  loading: Boolean,
  initialSelectedAssets: { type: Array, default: () => [] },
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'close', 'cleanup'])

// Form state
const form = ref({
  ai_supplemental_prompt: '',
  layoutType: 'grid',
  printSize: '8.5x11',
  quality: 'standard',
  medium: 'digital',
  output: 'PDF',
  theme_id: null,
  memoryEvent: '',
  customMemoryEvent: '',
  backgroundType: 'white',
  backgroundOpacity: 30,
  includeCaptions: true,
  autoEnhance: true,
  gridLayout: '2x2',
  page_count: 1
})

// Photo selection state
const showPhotoSelector = ref(false)
const selectedAssets = ref([])

// Use the photo selection composable
const {
  photoSelection_method,
  photoSelection_dateRange,
  photoSelection_selectedTags,
  photoSelection_selectedTagFilter,
  photoSelection_locationType,
  photoSelection_selectedLocation,
  photoSelection_selectedMemories,
  photoSelection_availableCountries,
  photoSelection_availableStates,
  photoSelection_availableCities,
  photoSelection_availableAssets,
  photoSelection_loadingAssets,
  photoSelection_isUploading,
  photoSelection_showUploadDialog,
  photoSelection_options,
  photoSelection_computedAvailableTags,
  photoSelection_filteredAssets,
  photoSelection_loadAvailableAssets,
  photoSelection_loadLocationData,
  photoSelection_toggleMemorySelection,
  photoSelection_populatePhotoSelectionPool,
  photoSelection_resetSelection,
  photoSelection_getSelectedAssets
} = usePhotoSelection()

// Theme state
const themeOptions = ref([])
const loadingThemes = ref(false)

// Options for dropdowns
const layoutOptions = ref([
  { label: 'Grid Layout', value: 'grid' },
  { label: 'Theme Layout', value: 'theme' }
])

const printSizeOptions = ref([
  { label: '4x6 inches (Portrait)', value: '4x6' },
  { label: '6x4 inches (Landscape)', value: '6x4' },
  { label: '5x3 inches (Landscape)', value: '5x3' },
  { label: '5x7 inches (Portrait)', value: '5x7' },
  { label: '7x5 inches (Landscape)', value: '7x5' },
  { label: '8x10 inches (Portrait)', value: '8x10' },
  { label: '10x8 inches (Landscape)', value: '10x8' },
  { label: '8.5x11 inches (Letter Portrait)', value: '8.5x11' },
  { label: '11x8.5 inches (Letter Landscape)', value: '11x8.5' },
  { label: '11x14 inches (Portrait)', value: '11x14' },
  { label: '14x11 inches (Landscape)', value: '14x11' },
  { label: '12x12 inches (Square)', value: '12x12' }
])

const qualityOptions = ref([
  { label: 'Standard', value: 'standard' },
  { label: 'High Quality', value: 'high' },
  { label: 'Premium', value: 'premium' }
])

const mediumOptions = ref([
  { label: 'Digital PDF', value: 'digital' },
  { label: 'Print Ready', value: 'print' },
  { label: 'Web View', value: 'web' }
])

const gridLayoutOptions = ref([
  { label: '1 memory per page (1x1)', value: '1x1' },
  { label: '2 memories per page (2x1)', value: '2x1' },
  { label: '4 memories per page (2x2)', value: '2x2' },
  { label: '6 memories per page (3x2)', value: '3x2' },
  { label: '9 memories per page (3x3)', value: '3x3' },
  { label: '12 memories per page (3x4)', value: '3x4' },
  { label: '16 memories per page (4x4)', value: '4x4' }
])

const memoryEventOptions = ref([
  { label: 'Vacation', value: 'vacation' },
  { label: 'Birthday', value: 'birthday' },
  { label: 'Anniversary', value: 'anniversary' },
  { label: 'Graduation', value: 'graduation' },
  { label: 'Family Trip', value: 'family_trip' },
  { label: 'Other (custom)', value: 'custom' }
])

// Computed properties
const showDialog = computed({
  get: () => props.visible,
  set: (value) => {
    if (!value) {
      // Clean up state when dialog is closed
      console.log('🔄 Dialog closing - cleaning up state')
      showPhotoSelector.value = false
      photoSelection_resetSelection()
      emit('close')
    }
  }
})

// Calculate maximum pages allowed based on grid layout and 100 photo limit
const maxPagesAllowed = computed(() => {
  if (form.value.layoutType !== 'grid') return 10
  
  // Parse grid layout to get memories per page
  const gridLayout = form.value.gridLayout || '2x2'
  const [rows, cols] = gridLayout.split('x').map(Number)
  const memoriesPerPage = rows * cols
  
  // Calculate maximum pages without exceeding 100 photo limit
  const maxPages = Math.floor(100 / memoriesPerPage)
  
  // Ensure at least 1 page is allowed
  return Math.max(1, maxPages)
})

// Calculate total photos needed based on grid layout and number of pages
const totalPhotosNeeded = computed(() => {
  if (form.value.layoutType !== 'grid') return 0
  
  // Parse grid layout to get memories per page
  const gridLayout = form.value.gridLayout || '2x2'
  const [rows, cols] = gridLayout.split('x').map(Number)
  const memoriesPerPage = rows * cols
  
  // Calculate total photos needed
  const pageCount = form.value.page_count || 1
  const totalPhotos = memoriesPerPage * pageCount
  
  return totalPhotos
})

// Calculate page count based on grid layout and number of selected assets (for display purposes)
const calculatedPageCount = computed(() => {
  if (selectedAssets.value.length === 0) return 0
  
  // Parse grid layout to get memories per page
  const gridLayout = form.value.gridLayout || '2x2'
  const [rows, cols] = gridLayout.split('x').map(Number)
  const memoriesPerPage = rows * cols
  
  // Calculate total pages needed
  const totalPages = Math.ceil(selectedAssets.value.length / memoriesPerPage)
  
  return totalPages
})

// Get selected theme's photo count
const selectedThemePhotoCount = computed(() => {
  if (form.value.layoutType !== 'theme' || !form.value.theme_id) return null
  
  const selectedTheme = themeOptions.value.find(theme => theme.value === form.value.theme_id)
  if (!selectedTheme) return null
  
  return selectedTheme.photoCount || null
})

// Function to fetch themes from database
const fetchThemes = async () => {
  try {
    loadingThemes.value = true
    const { data, error } = await supabase
      .from('themes')
      .select('id, name, description, is_active, layout_config')
      .eq('is_active', true)
      .eq('deleted', false)
      .order('name')
    
    if (error) {
      console.error('Error fetching themes:', error)
      return
    }
    
    // Transform themes for dropdown
    themeOptions.value = data.map(theme => {
      let photoCount = 0
      try {
        const layoutConfig = typeof theme.layout_config === 'string' 
          ? JSON.parse(theme.layout_config) 
          : theme.layout_config
        
        if (layoutConfig && layoutConfig.photos && Array.isArray(layoutConfig.photos)) {
          photoCount = layoutConfig.photos.length
        }
      } catch (error) {
        console.error('Error parsing theme layout config:', error)
      }
      
      return {
        label: photoCount > 0 ? `${theme.name} (${photoCount} photos)` : theme.name,
        value: theme.id,
        description: theme.description,
        layoutConfig: theme.layout_config,
        photoCount: photoCount
      }
    })
    
    console.log('[MEMORY-BOOK-DIALOG] Fetched themes:', themeOptions.value)
  } catch (error) {
    console.error('Error fetching themes:', error)
  } finally {
    loadingThemes.value = false
  }
}

// Database composable
const { $supabase: supabase } = useNuxtApp()

// Watchers
watch(() => props.initialData, (val) => {
  if (val && Object.keys(val).length > 0) {
    form.value = {
      ai_supplemental_prompt: '',
      layoutType: 'grid',
      printSize: '8.5x11',
      quality: 'standard',
      medium: 'digital',
      output: 'PDF',
      theme_id: null,
      memoryEvent: '',
      customMemoryEvent: '',
      backgroundType: 'white',
      backgroundOpacity: 30,
      includeCaptions: true,
      autoEnhance: true,
      gridLayout: '2x2',
      page_count: 1,
      ...val,
      output: 'PDF'
    }
  }
}, { immediate: true })

watch(() => form.value.layoutType, (newLayoutType) => {
  if (newLayoutType !== 'theme') {
    form.value.theme_id = null
  }
})

// Watch for grid layout changes and adjust page count if it exceeds the new maximum
watch(() => form.value.gridLayout, (newGridLayout) => {
  if (form.value.layoutType === 'grid') {
    // Calculate new maximum pages for the new grid layout
    const [rows, cols] = (newGridLayout || '2x2').split('x').map(Number)
    const memoriesPerPage = rows * cols
    const newMaxPages = Math.max(1, Math.floor(100 / memoriesPerPage))
    
    // If current page count exceeds new maximum, adjust it
    if (form.value.page_count > newMaxPages) {
      form.value.page_count = newMaxPages
      console.log(`📐 Grid layout changed to ${newGridLayout}, adjusted page count to ${newMaxPages} (max photos: ${newMaxPages * memoriesPerPage})`)
    }
  }
})

watch(() => props.initialSelectedAssets, (val) => {
  if (val && Array.isArray(val)) {
    selectedAssets.value = [...val]
  }
}, { immediate: true })

watch(() => props.visible, (isVisible) => {
  if (isVisible) {
    if (!props.isEditing) {
      // Reset all state for new memory book creation
      console.log('🔄 Resetting all state for new memory book')
      
      // Reset form to defaults
      form.value = {
        ai_supplemental_prompt: '',
        layoutType: 'grid',
        printSize: '8.5x11',
        quality: 'standard',
        medium: 'digital',
        output: 'PDF',
        theme_id: null,
        memoryEvent: '',
        customMemoryEvent: '',
        backgroundType: 'white',
        backgroundOpacity: 30,
        includeCaptions: true,
        autoEnhance: true,
        gridLayout: '2x2',
        page_count: 1
      }
      
      // Reset selected assets
      selectedAssets.value = []
      
      // Reset photo selection state
      photoSelection_resetSelection()
      
      // Close any open modals
      showPhotoSelector.value = false
      
      console.log('✅ All state reset for new memory book')
    } else {
      // For editing, just ensure photo selector is closed
      showPhotoSelector.value = false
      console.log('🔄 Editing mode - closed photo selector')
    }
  }
})

// Photo selection methods
const openPhotoSelector = async () => {
  console.log('🔍 Opening photo selector')
  
  // Reset photo selection state first
  photoSelection_resetSelection()
  
  showPhotoSelector.value = true
  await photoSelection_loadAvailableAssets()
  await photoSelection_loadLocationData()
  
  // Set current selection after loading assets
  if (selectedAssets.value.length > 0) {
    photoSelection_selectedMemories.value = selectedAssets.value.map(asset => asset.id)
    console.log('🔍 Restored current selection:', photoSelection_selectedMemories.value.length, 'photos')
  }
}

const closePhotoSelector = () => {
  console.log('🔍 Closing photo selector')
  showPhotoSelector.value = false
  
  // Reset photo selection state completely
  photoSelection_resetSelection()
}

const savePhotoSelection = () => {
  console.log('💾 Saving photo selection')
  
  // Determine target photo count based on layout type
  let targetCount = null
  if (form.value.layoutType === 'grid') {
    targetCount = totalPhotosNeeded.value
    console.log('💾 Grid layout: targeting', targetCount, 'photos for', form.value.page_count, 'pages')
  } else if (form.value.layoutType === 'theme') {
    targetCount = selectedThemePhotoCount.value || 3 // Default to 3 for themes
    console.log('💾 Theme layout: targeting', targetCount, 'photos')
  }
  
  // Get selected assets from the photo selection pool
  const selectedAssetIds = photoSelection_populatePhotoSelectionPool(targetCount)
  selectedAssets.value = photoSelection_availableAssets.value.filter(asset => selectedAssetIds.includes(asset.id))
  
  console.log('💾 Saved', selectedAssets.value.length, 'selected assets')
  
  // For grid layouts, ensure we have enough photos for the specified number of pages
  if (form.value.layoutType === 'grid' && selectedAssets.value.length < totalPhotosNeeded.value) {
    console.log('⚠️ Warning: Selected', selectedAssets.value.length, 'photos but need', totalPhotosNeeded.value, 'for', form.value.page_count, 'pages')
  }
  
  // Close photo selector and reset its state
  showPhotoSelector.value = false
  photoSelection_resetSelection()
}

const handleUploadPhotos = () => {
  // Handle photo upload - this would integrate with your upload system
  console.log('Upload photos requested')
}

const handleNoPhotosFound = () => {
  // Handle no photos found scenario
  console.log('No photos found for selected criteria')
}

const handleClosePhotoLibrary = () => {
  // Handle closing photo library
  console.log('Photo library closed')
}

// Fetch themes when component mounts
onMounted(() => {
  fetchThemes()
})

function handleSubmit() {
  // Generate photo selection pool from selected assets
  const photoSelectionPool = selectedAssets.value.map(asset => asset.id)
  
  emit('submit', {
    ...form.value,
    memoryEvent: form.value.memoryEvent === 'custom' ? form.value.customMemoryEvent : form.value.memoryEvent,
    backgroundType: form.value.backgroundType,
    backgroundOpacity: form.value.backgroundOpacity,
    selectedAssets: selectedAssets.value,
    photo_selection_pool: photoSelectionPool
  })
}
</script> 