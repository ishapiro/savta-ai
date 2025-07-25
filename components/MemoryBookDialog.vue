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
          <!-- Title -->
          <div>
            <label for="title" class="block text-sm font-medium text-brand-primary mb-2">
              Title
            </label>
            <InputText
              id="title"
              v-model="form.title"
              class="w-full"
              placeholder="Enter memory book title"
              required
            />
          </div>
          
          <!-- Memory Event and Theme side by side -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Memory Event -->
            <div>
              <label class="block text-sm font-medium text-brand-primary mb-2">Memory Event</label>
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
            
            <!-- Theme -->
            <div>
              <label class="block text-sm font-medium text-brand-primary mb-2">Theme</label>
              <Dropdown
                v-model="form.theme"
                :options="themeOptions"
                option-label="label"
                option-value="value"
                placeholder="Select theme"
                class="w-full"
              />
            </div>
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
          <!-- Layout Type (hidden for magic memories) -->
          <div class="hidden">
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
            />
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
      <div class="bg-gradient-to-r from-brand-secondary/10 to-brand-accent/10 rounded-lg p-4 border border-brand-secondary/30">
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
          
          <!-- Memory Shape -->
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-2">Memory Shape</label>
            <Dropdown
              v-model="form.memoryShape"
              :options="memoryShapeOptions"
              option-label="label"
              option-value="value"
              placeholder="Select shape"
              class="w-full"
            />
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
        </div>
      </div>

      <!-- Asset Selection Section -->
      <div class="bg-gradient-to-r from-brand-secondary/10 to-brand-highlight/10 rounded-lg p-4 border border-brand-secondary/30">
        <h3 class="text-lg font-semibold text-brand-primary mb-4 flex items-center gap-2">
          <i class="pi pi-images text-brand-secondary"></i>
          Memory Selection
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
                    {{ selectedAssets.length }} memories selected
                  </p>
                  <p class="text-xs text-brand-primary/70">
                    {{ selectedAssets.length === 0 ? 'No memories selected' : `Will create approximately ${calculatedPageCount} pages` }}
                  </p>
                </div>
              </div>
              <Button
                label="Select Memories"
                icon="pi pi-plus"
                size="small"
                @click="openAssetSelector"
                class="bg-brand-dialog-save border-0 w-auto rounded-full px-6 py-2 shadow"
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
          :label="isEditing ? 'Update' : 'Create'"
          icon="pi pi-check"
          :loading="loading"
          :disabled="loading || selectedAssets.length === 0"
          class="bg-brand-dialog-save border-0 w-auto rounded-full px-6 py-2"
        />
      </div>
    </form>

    <!-- Asset Selection Modal -->
    <Dialog
      v-model:visible="showAssetSelector"
      modal
      header="Select Your Memories"
      class="w-[95vw] max-w-6xl h-[90vh] select-memories-dialog"
      :closable="false">
      <div v-if="!loadingAssets" class="space-y-4">
        <!-- Instructions -->
        <div class="bg-gradient-to-r from-brand-secondary/10 to-brand-highlight/10 rounded-lg p-3 sm:p-4 border border-brand-secondary/30">
          <div class="flex items-center space-x-3 mb-2">
            <div class="w-6 h-6 sm:h-8 bg-gradient-to-br from-brand-secondary/20 to-brand-highlight/20 rounded-full flex items-center justify-center">
              <i class="pi pi-heart text-brand-secondary text-xs sm:text-sm"></i>
            </div>
            <h3 class="text-base sm:text-lg font-semibold text-brand-primary">Choose Your Memories</h3>
          </div>
          <p class="text-xs sm:text-sm text-brand-primary/70">Select the memories you'd like to include in your magic memory. You can filter by tags and select multiple memories at once.</p>
        </div>
        <!-- Filter Section -->
        <div class="bg-white rounded-lg border border-brand-primary/20 sm:p-4">
          <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div class="flex-1 min-w-0">
              <label class="block text-sm font-medium text-brand-primary">Filter by Tags</label>
              <div class="flex gap-2">
                <MultiSelect
                  v-model="selectedTagFilter"
                  :options="computedAvailableTags"
                  option-label="label"
                  option-value="value"
                  placeholder="All memories"
                  class="flex-1"
                  @change="filterMemories"
                  :show-toggle-all="false"
                />
                <Button
                  v-if="selectedTagFilter && selectedTagFilter.length > 0"
                  icon="pi pi-times"
                  size="small"
                  @click="clearTagFilter"
                  class="text-xs px-2 sm:px-3 py-2"
                  v-tooltip.top="'Clear filter'"
                />
              </div>
            </div>
            <div class="flex items-center justify-center sm:justify-end gap-2">
              <Button
                label="Select All"
                icon="pi pi-check-square"
                size="small"
                @click="selectAllMemories"
                class="bg-brand-secondary hover:bg-brand-header border-0 text-xs px-2 sm:px-3 py-2"
              />
              <Button
                label="Clear All"
                icon="pi pi-times"
                size="small"
                @click="selectedMemories = []"
                class="bg-brand-cancel text-xs px-2 sm:px-3 py-2"
              />
            </div>
          </div>
          <div class="mt-2 text-xs sm:text-sm text-brand-primary/70 text-center sm:text-left">
            Showing {{ filteredAssets.length }} of {{ availableAssets.length }} memories
            <span v-if="selectedTagFilter && selectedTagFilter.length > 0" class="block sm:inline"> • Filtered by: {{ selectedTagFilter.join(', ') }}</span>
          </div>
        </div>
        <!-- Memories Grid -->
        <div class="bg-white rounded-lg border border-brand-primary/20 sm:p-4">
          <div v-if="filteredAssets.length === 0" class="text-center py-8">
            <i class="pi pi-images text-3xl sm:text-4xl mb-2 block"></i>
            <p class="text-base sm:text-lg font-medium text-brand-primary">No memories found</p>
            <p class="text-xs sm:text-sm text-brand-primary/70">Try changing your filter or add some memories first</p>
          </div>
          <div v-else class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4 max-h-48 sm:max-h-64 md:max-h-96 overflow-y-auto">
            <div
              v-for="asset in filteredAssets"
              :key="asset.id"
              class="relative group cursor-pointer touch-manipulation"
              @click="toggleMemorySelection(asset.id)">
              <!-- Selection Overlay -->
              <div 
                class="absolute inset-0 rounded-lg border-2 transition-all duration-200 z-10"
                :class="selectedMemories.includes(asset.id) ? 'border-brand-secondary bg-brand-secondary/10' : 'border-transparent'"
              >
                <div 
                  class="absolute top-1 right-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center shadow-sm"
                  :class="selectedMemories.includes(asset.id) ? 'bg-brand-secondary text-white' : 'bg-white text-brand-primary/40'"
                >
                  <i 
                    class="text-xs"
                    :class="selectedMemories.includes(asset.id) ? 'pi pi-check' : 'pi pi-plus'"
                  ></i>
                </div>
              </div>
              <!-- Memory Card -->
              <div class="aspect-square bg-brand-background rounded-lg overflow-hidden border-2 border-brand-primary/20 hover:border-brand-header transition-colors">
                <img 
                  v-if="asset.storage_url"
                  :src="asset.storage_url"
                  :alt="asset.user_caption || asset.ai_caption || 'Memory'"
                  class="w-full h-full object-contain bg-white"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <i class="pi pi-image text-brand-primary/60 text-base sm:text-lg md:text-2xl"></i>
                </div>
              </div>
              <!-- Memory Info -->
              <div class="mt-1 sm:mt-2 text-center">
                <p class="text-xs font-medium text-brand-primary">
                  {{ asset.user_caption || asset.ai_caption || `Memory ${asset.id.slice(-4)}` }}
                </p>
                <p class="text-xs text-brand-primary/70">
                  {{ formatDate(asset.created_at) }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <!-- Selection Summary -->
        <div class="bg-gradient-to-r from-brand-header/10 to-brand-highlight/10 rounded-lg p-3 sm:p-4 border border-brand-header/30">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center space-x-3">
              <div class="w-6 h-6 sm:h-8 bg-gradient-to-br from-brand-secondary/20 to-brand-highlight/20 rounded-full flex items-center justify-center">
                <i class="pi pi-check text-brand-secondary text-xs sm:text-sm"></i>
              </div>
              <div>
                <p class="text-xs sm:text-sm font-medium text-brand-primary">
                  {{ selectedMemories.length }} photos selected
                </p>
                <p class="text-xs text-brand-primary/70">
                  Ready to create your cards or booklets
                </p>
              </div>
            </div>
            <div class="text-center sm:text-right">
              <p class="text-xs text-brand-primary/70">
                Estimated pages: {{ Math.ceil(selectedMemories.length / 4) }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <!-- Loading State -->
      <div v-else class="flex items-center justify-center py-8 sm:py-12">
        <div class="text-center">
          <i class="pi pi-spin pi-spinner text-3xl sm:text-4xl mb-3 sm:mb-4 text-brand-secondary"></i>
          <p class="text-sm sm:text-base text-brand-primary/70">Loading your memories...</p>
        </div>
      </div>
      <template #footer>
        <div class="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
          <div class="flex gap-2 w-full sm:w-auto">
            <Button
              label="Cancel"
              icon="pi pi-times"
              @click="closeAssetSelector"
              class="bg-brand-dialog-cancel border-0 rounded-full px-4 sm:px-5 text-xs sm:text-sm font-bold shadow w-full sm:w-auto"
            />
          </div>
          <div class="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <span class="text-xs sm:text-sm text-brand-primary/70 text-center sm:text-left">
              {{ selectedMemories.length }} selected
            </span>
            <Button
              label="Save Selection"
              icon="pi pi-check"
              :disabled="selectedMemories.length === 0"
              @click="saveSelectedMemories"
              class="bg-brand-dialog-save rounded-full border-0 w-full sm:w-auto text-xs sm:text-sm px-4 sm:px-5 py-2"
            />
          </div>
        </div>
      </template>
    </Dialog>
  </Dialog>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'

const props = defineProps({
  isEditing: Boolean,
  initialData: { type: Object, default: () => ({}) },
  loading: Boolean,
  initialSelectedAssets: { type: Array, default: () => [] },
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'close', 'cleanup'])

const form = ref({
  title: '',
  layoutType: 'grid', // Default to grid for traditional memory books
  printSize: '8x10',
  quality: 'standard',
  medium: 'digital',
  theme: 'classic',
  memoryEvent: '',
  customMemoryEvent: '',
  backgroundType: 'white',
  backgroundOpacity: 30,
  includeCaptions: true,
  gridLayout: '2x2',
  memoryShape: 'original'
})

// Asset selection state
const showAssetSelector = ref(false)
const loadingAssets = ref(false)
const availableAssets = ref([])
const selectedAssets = ref([])
const selectedMemories = ref([])
const selectedTagFilter = ref([])

// Options for dropdowns
const layoutOptions = ref([
  { label: 'Grid Layout', value: 'grid' },
  { label: 'Timeline Layout', value: 'timeline' },
  { label: 'Story Layout', value: 'story' },
  { label: 'Album Layout', value: 'album' }
])

const printSizeOptions = ref([
  { label: '5x7 inches', value: '5x7' },
  { label: '6x8 inches', value: '6x8' },
  { label: '8x10 inches', value: '8x10' },
  { label: '11x14 inches', value: '11x14' },
  { label: '12x12 inches', value: '12x12' },
  { label: 'A4', value: 'a4' }
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

const themeOptions = ref([
  { label: 'Classic', value: 'classic' },
  { label: 'Modern', value: 'modern' },
  { label: 'Vintage', value: 'vintage' },
  { label: 'Minimalist', value: 'minimalist' }
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

const memoryShapeOptions = ref([
  { label: 'Original (keep natural aspect ratio)', value: 'original' },
  { label: 'Magic (AI chooses best shape)', value: 'magic' }
])

const memoryEventOptions = ref([
  { label: 'Vacation', value: 'vacation' },
  { label: 'Birthday', value: 'birthday' },
  { label: 'Anniversary', value: 'anniversary' },
  { label: 'Graduation', value: 'graduation' },
  { label: 'Family Trip', value: 'family_trip' },
  { label: 'Other (custom)', value: 'custom' }
])

// Database composable
const { $supabase: supabase } = useNuxtApp()
const db = useDatabase()

// Computed properties
const showDialog = computed({
  get: () => props.visible,
  set: (value) => {
    if (!value) {
      emit('close')
    }
  }
})

const filteredAssets = computed(() => {
  if (!Array.isArray(availableAssets.value)) return []
  return availableAssets.value.filter(asset =>
    asset.type === 'photo' &&
    (!selectedTagFilter.value.length || (asset.tags && asset.tags.some(tag => selectedTagFilter.value.includes(tag))))
  )
})

const computedAvailableTags = computed(() => {
  if (!Array.isArray(availableAssets.value)) return 
  const allTags = new Set()
  availableAssets.value.forEach(asset => {
    if (asset.tags && Array.isArray(asset.tags)) {
      asset.tags.forEach(tag => allTags.add(tag))
    }
  })
  return Array.from(allTags).map(tag => ({ label: tag, value: tag }))
})

// Calculate page count based on grid layout and number of selected assets
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

// Watch for initial data changes
watch(() => props.initialData, (val) => {
  if (val && Object.keys(val).length > 0) {
    // Reset form to defaults first, then apply initial data
    form.value = {
      title: '',
      layoutType: 'grid', // Default to grid for traditional memory books
      printSize: '8x10',
      quality: 'standard',
      medium: 'digital',
      theme: 'classic',
      memoryEvent: '',
      customMemoryEvent: '',
      backgroundType: 'white',
      backgroundOpacity: 30,
      includeCaptions: true,
      gridLayout: '2x2',
      memoryShape: 'original',
      ...val // Override with initial data
    }
  }
}, { immediate: true })

// Watch for initial selected assets
watch(() => props.initialSelectedAssets, (val) => {
  if (val && Array.isArray(val)) {
    selectedAssets.value = [...val]
  }
}, { immediate: true })

// Asset selection functions
const openAssetSelector = async () => {
  loadingAssets.value = true
  try {
    const allApprovedAssets = await db.assets.getAssets({ approved: true })
    availableAssets.value = allApprovedAssets || []     // Set current selection
    selectedMemories.value = selectedAssets.value.map(asset => asset.id)
    selectedTagFilter.value = []
    showAssetSelector.value = true
  } catch (error) {
    console.error('Error loading assets for memory selection:', error)
  } finally {
    loadingAssets.value = false
  }
}

const closeAssetSelector = () => {
  showAssetSelector.value = false
  selectedMemories.value = []
  selectedTagFilter.value = []
}

const toggleMemorySelection = (assetId) => {
  const index = selectedMemories.value.indexOf(assetId)
  if (index > -1) {
    selectedMemories.value.splice(index, 1)
  } else {
    selectedMemories.value.push(assetId)
  }
}

const selectAllMemories = () => {
  selectedMemories.value = filteredAssets.value.map(asset => asset.id)
}

const saveSelectedMemories = () => {
  selectedAssets.value = availableAssets.value.filter(asset => selectedMemories.value.includes(asset.id))
  showAssetSelector.value = false
}

const removeAsset = (assetId) => {
  selectedAssets.value = selectedAssets.value.filter(asset => asset.id !== assetId)
}

const clearTagFilter = () => {
  selectedTagFilter.value = []
}

const filterMemories = () => {
  // This is handled by the computed property
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

function handleSubmit() {
  emit('submit', {
    ...form.value,
    memoryEvent: form.value.memoryEvent === 'custom' ? form.value.customMemoryEvent : form.value.memoryEvent,
    backgroundType: form.value.backgroundType,
    backgroundOpacity: form.value.backgroundOpacity,
    selectedAssets: selectedAssets.value
  })
}
</script> 