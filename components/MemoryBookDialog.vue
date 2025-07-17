<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl p-6 flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-white">
            {{ isEditing ? 'Edit Magic Memory Settings' : 'Create Memory Book' }}
          </h2>
          <p class="text-blue-100 text-sm">
            {{ isEditing ? 'Update your memory book settings' : 'Create a beautiful memory book with AI enhancements' }}
          </p>
        </div>
        <button @click="$emit('close')" class="text-white hover:text-blue-100 transition-colors" aria-label="Close dialog">
          ×
        </button>
      </div>
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input v-model="form.title" type="text" class="w-full px-4 py-2 border rounded" required />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Layout Type</label>
          <select v-model="form.layoutType" class="w-full px-4 py-2 border rounded">
            <option value="grid">Grid Layout</option>
            <option value="timeline">Timeline Layout</option>
            <option value="story">Story Layout</option>
            <option value="album">Album Layout</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Print Size</label>
          <select v-model="form.printSize" class="w-full px-4 py-2 border rounded">
            <option value="5x7">5x7</option>
            <option value="6x8">6x8</option>
            <option value="8x10">8x10</option>
            <option value="11x14">11x14</option>
            <option value="12x12">12x12</option>
            <option value="a4">A4</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Quality</label>
          <select v-model="form.quality" class="w-full px-4 py-2 border rounded">
            <option value="standard">Standard</option>
            <option value="high">High Quality</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Medium</label>
          <select v-model="form.medium" class="w-full px-4 py-2 border rounded">
            <option value="digital">Digital PDF</option>
            <option value="print">Print Ready</option>
            <option value="web">Web View</option>
          </select>
        </div>
        
        <!-- Asset Selection Section -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Select Memories</label>
          <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-600">
                {{ selectedAssets.length }} memories selected
              </span>
              <button 
                type="button"
                @click="openAssetSelector"
                class="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full transition-colors">
                {{ selectedAssets.length > 0 ? 'Change Selection' : 'Select Memories' }}
              </button>
            </div>
            <!-- Selected Assets Preview -->
            <div v-if="selectedAssets.length > 0" class="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
              <div 
                v-for="asset in selectedAssets"
                :key="asset.id"
                class="relative aspect-square bg-gray-100 rounded overflow-hidden border border-gray-200">
                <img 
                  v-if="asset.storage_url"
                  :src="asset.storage_url"
                  :alt="asset.user_caption || asset.ai_caption || 'Memory'"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <i class="pi pi-image text-gray-400"></i>
                </div>
                <button 
                  type="button"
                  @click.stop="removeAsset(asset.id)"
                  class="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                  ×
                </button>
              </div>
            </div>
            <div v-else class="text-center py-4">
              <i class="pi pi-images text-2xl mb-2 block"></i>
              <p class="text-sm">No memories selected</p>
            </div>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Grid Layout</label>
          <select v-model="form.gridLayout" class="w-full px-4 py-2 border rounded">
            <option value="1x1">1 memory per page (1x1)</option>
            <option value="2x1">2 memories per page (2x1)</option>
            <option value="2x2">4 memories per page (2x2)</option>
            <option value="3x2">6 memories per page (3x2)</option>
            <option value="3x3">9 memories per page (3x3)</option>
            <option value="3x4">12 memories per page (3x4)</option>
            <option value="4x4">16 memories per page (4x4)</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Memory Shape</label>
          <select v-model="form.memoryShape" class="w-full px-4 py-2 border rounded">
            <option value="original">Original (keep natural aspect ratio)</option>
            <option value="magic">Magic (AI chooses best shape)</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Theme</label>
          <select v-model="form.theme" class="w-full px-4 py-2 border rounded">
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
            <option value="vintage">Vintage</option>
            <option value="minimalist">Minimalist</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Memory Event</label>
          <select v-model="form.memoryEvent" class="w-full px-4 py-2 border rounded">
            <option value="">Select event</option>
            <option value="vacation">Vacation</option>
            <option value="birthday">Birthday</option>
            <option value="anniversary">Anniversary</option>
            <option value="graduation">Graduation</option>
            <option value="family_trip">Family Trip</option>
            <option value="custom">Other (custom)</option>
          </select>
          <input v-if="form.memoryEvent === 'custom'" v-model="form.customMemoryEvent" type="text" class="w-full mt-2 px-4 py-2 border rounded" placeholder="Enter custom event" />
        </div>
        <div class="flex items-center space-x-4">
          <label class="flex items-center space-x-2">
            <input type="checkbox" v-model="form.aiBackground" />
            <span>AI Background</span>
          </label>
          <label class="flex items-center space-x-2">
            <input type="checkbox" v-model="form.includeCaptions" />
            <span>AI Captions</span>
          </label>
          <label class="flex items-center space-x-2">
            <input type="checkbox" v-model="form.includeTags" />
            <span>Photo Tags</span>
          </label>
        </div>
        <div class="flex justify-end space-x-2 pt-4">
          <button type="button" @click="$emit('close')" class="px-4 py-2 rounded bg-gray-100 text-gray-700">Cancel</button>
          <button type="submit" :disabled="loading || selectedAssets.length === 0" class="px-4 py-2 rounded bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold disabled:opacity-50">
            {{ isEditing ? 'Update' : 'Create' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Asset Selection Modal -->
    <Dialog
      v-model:visible="showAssetSelector"
      modal
      header="Select Your Memories"
      class="w-[95vw] max-w-6xl h-[90vh] select-memories-dialog"
      :closable="false">
      <div v-if="!loadingAssets" class="space-y-4">
        <!-- Instructions -->
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 sm:p-4 border border-blue-200">
          <div class="flex items-center space-x-3 mb-2">
            <div class="w-6 h-6 sm:h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <i class="pi pi-heart text-blue-600 text-xs sm:text-sm"></i>
            </div>
            <h3 class="text-base sm:text-lg font-semibold text-gray-900">Choose Your Memories</h3>
          </div>
          <p class="text-xs sm:text-sm text-gray-600">Select the memories you'd like to include in your magic memory. You can filter by tags and select multiple memories at once.</p>
        </div>
        <!-- Filter Section -->
        <div class="bg-white rounded-lg border border-gray-200 sm:p-4">
          <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div class="flex-1 min-w-0">
              <label class="block text-sm font-medium text-gray-900">Filter by Tags</label>
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
                  severity="secondary"
                  @click="clearTagFilter"
                  class="px-2 sm:px-3"
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
                class="bg-green-500 hover:bg-green-600 border-0 text-xs px-2 sm:px-3 py-2"
              />
              <Button
                label="Clear All"
                icon="pi pi-times"
                size="small"
                severity="secondary"
                @click="selectedMemories = []"
                class="text-xs px-2 sm:px-3 py-2"
              />
            </div>
          </div>
          <div class="mt-2 text-xs sm:text-sm text-gray-600 text-center sm:text-left">
            Showing {{ filteredAssets.length }} of {{ availableAssets.length }} memories
            <span v-if="selectedTagFilter && selectedTagFilter.length > 0" class="block sm:inline"> • Filtered by: {{ selectedTagFilter.join(', ') }}</span>
          </div>
        </div>
        <!-- Memories Grid -->
        <div class="bg-white rounded-lg border border-gray-200 sm:p-4">
          <div v-if="filteredAssets.length === 0" class="text-center py-8">
            <i class="pi pi-images text-3xl sm:text-4xl mb-2 block"></i>
            <p class="text-base sm:text-lg font-medium">No memories found</p>
            <p class="text-xs sm:text-sm">Try changing your filter or add some memories first</p>
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
                :class="selectedMemories.includes(asset.id) ? 'border-green-500 bg-green-500 bg-opacity-10' : 'border-transparent'"
              >
                <div 
                  class="absolute top-1 right-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center shadow-sm"
                  :class="selectedMemories.includes(asset.id) ? 'bg-green-500 text-white' : 'bg-white text-gray-400'"
                >
                  <i 
                    class="text-xs"
                    :class="selectedMemories.includes(asset.id) ? 'pi pi-check' : 'pi pi-plus'"
                  ></i>
                </div>
              </div>
              <!-- Memory Card -->
              <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-colors">
                <img 
                  v-if="asset.storage_url"
                  :src="asset.storage_url"
                  :alt="asset.user_caption || asset.ai_caption || 'Memory'"
                  class="w-full h-full object-contain bg-white"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <i class="pi pi-image text-gray-400 text-base sm:text-lg md:text-2xl"></i>
                </div>
              </div>
              <!-- Memory Info -->
              <div class="mt-1 sm:mt-2 text-center">
                <p class="text-xs font-medium text-gray-900">
                  {{ asset.user_caption || asset.ai_caption || `Memory ${asset.id.slice(-4)}` }}
                </p>
                <p class="text-xs text-gray-600">
                  {{ formatDate(asset.created_at) }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <!-- Selection Summary -->
        <div class="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 sm:p-4 border border-green-200">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center space-x-3">
              <div class="w-6 h-6 sm:h-8 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                <i class="pi pi-check text-green-600 text-xs sm:text-sm"></i>
              </div>
              <div>
                <p class="text-xs sm:text-sm font-medium text-gray-900">
                  {{ selectedMemories.length }} memories selected
                </p>
                <p class="text-xs text-gray-600">
                  Ready to create your magic memory
                </p>
              </div>
            </div>
            <div class="text-center sm:text-right">
              <p class="text-xs text-gray-600">
                Estimated pages: {{ Math.ceil(selectedMemories.length / 4) }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <!-- Loading State -->
      <div v-else class="flex items-center justify-center py-8 sm:py-12">
        <div class="text-center">
          <i class="pi pi-spin pi-spinner text-3xl sm:text-4xl mb-3 sm:mb-4 text-blue-600"></i>
          <p class="text-sm sm:text-base text-gray-600">Loading your memories...</p>
        </div>
      </div>
      <template #footer>
        <div class="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
          <div class="flex gap-2 w-full sm:w-auto">
            <Button
              label="Cancel"
              icon="pi pi-times"
              severity="secondary"
              @click="closeAssetSelector"
              class="rounded-full px-4 sm:px-5 text-xs sm:text-sm font-bold shadow w-full sm:w-auto"
            />
          </div>
          <div class="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <span class="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              {{ selectedMemories.length }} selected
            </span>
            <Button
              label="Save Selection"
              icon="pi pi-check"
              :disabled="selectedMemories.length === 0"
              @click="saveSelectedMemories"
              class="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-0 w-full sm:w-auto text-xs sm:text-sm px-4 sm:px-5 py-2"
            />
          </div>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'

const props = defineProps({
  isEditing: Boolean,
  initialData: { type: Object, default: () => ({}) },
  loading: Boolean,
  initialSelectedAssets: { type: Array, default: () => [] }
})

const emit = defineEmits(['submit', 'close'])

const form = ref({
  title: '',
  layoutType: 'grid',
  printSize: '8x10',
  quality: 'standard',
  medium: 'digital',
  theme: 'classic',
  memoryEvent: '',
  customMemoryEvent: '',
  aiBackground: true,
  includeCaptions: true,
  includeTags: true,
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

// Database composable
const { $supabase: supabase } = useNuxtApp()
const db = useDatabase()

// Computed properties
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

// Watch for initial data changes
watch(() => props.initialData, (val) => {
  if (val && Object.keys(val).length > 0) {
    form.value = {
      ...form.value,
      ...val
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
    selectedAssets: selectedAssets.value
  })
}
</script> 