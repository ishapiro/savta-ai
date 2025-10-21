<template>
  <div class="min-h-screen bg-brand-background p-4">
    <div class="max-w-7xl mx-auto">
      <!-- Top Bar -->
      <div class="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <div class="flex-1 flex items-center gap-2 sm:gap-3">
          <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-primary">Deleted Memories</h1>
          <button
            class="w-8 h-8 flex items-center justify-center rounded bg-white shadow hover:bg-brand-background transition-colors focus:outline-none flex-shrink-0"
            v-tooltip.top="'How to use this page'"
            @click="showHelpModal = true"
            aria-label="Information about deleted memories page"
          >
            <i class="pi pi-info text-lg text-brand-highlight"></i>
          </button>
        </div>
        <div class="flex gap-2 w-full sm:w-auto">
          <button
            class="flex items-center justify-center gap-2 bg-brand-header hover:bg-brand-secondary text-white font-bold rounded-full px-4 sm:px-6 py-3 text-sm sm:text-lg shadow transition-all duration-200 w-full sm:w-auto"
            @click="showEmptyTrashDialog = true"
            :disabled="deletedAssets.length === 0"
          >
            <i class="pi pi-trash text-lg sm:text-xl"></i>
            <span class="hidden sm:inline">Empty the Trash</span>
            <span class="sm:hidden">Empty Trash</span>
          </button>
          <button
            class="flex items-center justify-center gap-2 bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary font-bold rounded-full px-4 sm:px-6 py-3 text-sm sm:text-lg shadow transition-all duration-200 w-full sm:w-auto"
            @click="navigateTo('/app/review')"
          >
            <i class="pi pi-arrow-left text-lg sm:text-xl"></i>
            <span class="hidden sm:inline">Back to Review</span>
            <span class="sm:hidden">Back</span>
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <i class="pi pi-trash text-red-500 text-2xl mb-2"></i>
          <div class="text-sm text-color-secondary">Total Deleted</div>
          <div class="text-xl font-bold text-color">{{ stats.total }}</div>
        </div>
        <div class="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <i class="pi pi-image text-blue-500 text-2xl mb-2"></i>
          <div class="text-sm text-color-secondary">Photos</div>
          <div class="text-xl font-bold text-color">{{ stats.photos }}</div>
        </div>
        <div class="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <i class="pi pi-file-edit text-brand-header text-2xl mb-2"></i>
          <div class="text-sm text-color-secondary">Stories</div>
          <div class="text-xl font-bold text-color">{{ stats.stories }}</div>
        </div>
        <div class="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <i class="pi pi-trash text-orange-500 text-2xl mb-2"></i>
          <div class="text-sm text-color-secondary">Trash</div>
          <div class="text-xl font-bold text-color">{{ stats.trash }}</div>
        </div>
      </div>

      <!-- Filters -->
      <Card class="mb-8">
        <template #content>
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-color">Type:</label>
              <Dropdown
                v-model="typeFilter"
                :options="typeOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select Type"
                class="w-48 sm:w-32"
              />
            </div>
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-color">Sort:</label>
              <Dropdown
                v-model="sortBy"
                :options="sortOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select Sort"
                class="w-48 sm:w-32"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- Empty State -->
      <div v-if="filteredDeletedAssets.length === 0" class="text-center py-12">
        <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="pi pi-trash text-2xl text-gray-400"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">No Deleted Memories</h3>
        <p class="text-gray-600">You haven't deleted any memories yet.</p>
        <button
          class="mt-4 flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-full px-6 py-3 text-lg shadow transition-all duration-200"
          @click="navigateTo('/app/review')"
        >
          <i class="pi pi-arrow-left text-xl"></i>
          Back to Review
        </button>
      </div>

      <!-- Deleted Assets Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        <div
          v-for="asset in filteredDeletedAssets"
          :key="asset.id"
          class="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl transition-shadow border border-gray-100 h-[500px] sm:h-[600px]"
          style="display: flex; flex-direction: column;"
        >
          <!-- Photo Section - Fixed Height -->
          <div class="rounded-t-xl sm:rounded-t-2xl overflow-hidden bg-gray-100 h-[150px] sm:h-[200px]" style="flex-shrink: 0;">
            <div class="w-full h-full flex items-center justify-center">
              <img
                v-if="asset.thumbnail_url || asset.storage_url"
                :src="asset.thumbnail_url || asset.storage_url"
                :alt="asset.user_caption || 'Family photo'"
                class="max-w-full max-h-full object-contain"
                loading="lazy"
              />
              <i v-else class="pi pi-image text-xl sm:text-2xl text-gray-400"></i>
            </div>
          </div>

          <!-- Content Section - Flexible Height -->
          <div class="flex-1 p-2 sm:p-3 overflow-y-auto" style="min-height: 0;">
            <!-- Title -->
            <div class="mb-2">
              <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Title</label>
              <div class="text-xs sm:text-sm font-medium text-gray-900 bg-yellow-50 rounded p-1.5 sm:p-2 border border-yellow-200">
                {{ asset.title || getImageName(asset.storage_url) || 'Untitled' }}
              </div>
            </div>

            <!-- User Caption -->
            <div class="mb-2">
              <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Your Caption</label>
              <div v-if="asset.user_caption && asset.user_caption !== getImageName(asset.storage_url)" class="text-xs sm:text-sm text-gray-900 bg-blue-50 rounded p-1.5 sm:p-2 border border-blue-200">
                {{ asset.user_caption }}
              </div>
              <div v-else class="text-xs sm:text-sm text-gray-400 italic bg-gray-50 rounded p-1.5 sm:p-2 border border-gray-200">
                No caption added
              </div>
            </div>

            <!-- AI Caption -->
            <div v-if="asset.ai_caption" class="mb-2">
              <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">AI Caption</label>
              <div class="italic text-xs sm:text-sm text-gray-600 bg-slate-50 rounded p-1.5 sm:p-2 border border-gray-200">"{{ asset.ai_caption }}"</div>
            </div>

            <!-- Tags -->
            <div v-if="(asset.tags && asset.tags.length > 0) || (asset.user_tags && asset.user_tags.length > 0)" class="mb-2">
              <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Tags</label>
              <div class="flex flex-wrap gap-1">
                <Chip
                  v-for="tag in asset.tags || []"
                  :key="`ai-${tag}`"
                  :label="tag"
                  class="text-xs bg-gray-100 text-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1"
                />
                <Chip
                  v-for="tag in asset.user_tags || []"
                  :key="`user-${tag}`"
                  :label="tag"
                  class="text-xs bg-blue-100 text-blue-700 px-1.5 sm:px-2 py-0.5 sm:py-1"
                />
              </div>
            </div>

            <!-- People Detected -->
            <div v-if="(asset.people_detected && asset.people_detected.length > 0) || (asset.user_people && asset.user_people.length > 0)" class="mb-2">
              <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">People/Objects</label>
              <div class="flex flex-wrap gap-1">
                <Chip
                  v-for="person in asset.people_detected || []"
                  :key="`ai-${person}`"
                  :label="person"
                  class="text-xs bg-gray-100 text-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1"
                />
                <Chip
                  v-for="person in asset.user_people || []"
                  :key="`user-${person}`"
                  :label="person"
                  class="text-xs bg-brand-secondary/10 text-brand-secondary px-1.5 sm:px-2 py-0.5 sm:py-1"
                />
              </div>
            </div>

            <!-- Deleted Date -->
            <div class="mb-2">
              <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Deleted Date</label>
              <div class="text-xs sm:text-sm text-gray-600 bg-red-50 rounded p-1.5 sm:p-2 border border-red-200">
                {{ formatDate(asset.updated_at) }}
              </div>
            </div>
          </div>

          <!-- Action Bar - Fixed at Bottom -->
          <div class="rounded-b-xl sm:rounded-b-2xl bg-gradient-to-r from-red-100 via-orange-100 to-yellow-100 px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 border-t border-gray-200 h-[70px] sm:h-[80px]" style="flex-shrink: 0;">
            <div class="flex items-center gap-2 sm:gap-4 flex-1 justify-center">
              <div class="flex flex-col items-center cursor-pointer group" @click="restoreAsset(asset.id)" v-tooltip.top="'Restore'">
                <i class="pi pi-undo text-2xl sm:text-3xl text-green-500 group-hover:scale-125 transition-transform"></i>
                <span class="text-xs text-green-700 mt-0.5 sm:mt-1">Restore</span>
              </div>
              <div class="flex flex-col items-center cursor-pointer group" @click="permanentlyDeleteAsset(asset.id)" v-tooltip.top="'Permanently Delete'">
                <i class="pi pi-trash text-2xl sm:text-3xl text-red-500 group-hover:scale-125 transition-transform"></i>
                <span class="text-xs text-red-700 mt-0.5 sm:mt-1">Delete</span>
              </div>
            </div>
            <div>
              <span class="inline-block px-2 sm:px-3 py-1 rounded-full bg-red-200 text-red-800 font-semibold text-xs shadow">Deleted</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty Trash Confirmation Dialog -->
    <Dialog
      v-model:visible="showEmptyTrashDialog"
      modal
      :closable="true"
      :dismissableMask="true"
      header="Empty the Trash"
      class="w-full max-w-md mx-4"
    >
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <i class="pi pi-exclamation-triangle text-red-600 text-xl"></i>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-800">Permanently Delete All</h3>
            <p class="text-sm text-gray-600">This action cannot be undone</p>
          </div>
        </div>
        
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-sm text-red-800">
            Are you sure you want to permanently delete all <strong>{{ deletedAssets.length }}</strong> deleted memories? 
            This will remove them from both storage and the database permanently.
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex flex-col sm:flex-row gap-2 w-full">
          <button
            @click="showEmptyTrashDialog = false"
            class="flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-full px-4 py-3 text-sm shadow transition-all duration-200"
          >
            <i class="pi pi-times text-lg"></i>
            Cancel
          </button>
          <button
            @click="emptyTrash"
            :disabled="emptyingTrash"
            class="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white font-bold rounded-full px-4 py-3 text-sm shadow transition-all duration-200"
          >
            <i class="pi pi-trash text-lg" :class="{ 'animate-spin': emptyingTrash }"></i>
            {{ emptyingTrash ? 'Deleting...' : 'Empty Trash' }}
          </button>
        </div>
      </template>
    </Dialog>

    <!-- Help Modal -->
    <Dialog
      v-model:visible="showHelpModal"
      modal
      :closable="true"
      :dismissableMask="true"
      header="🗑️ Your Deleted Memories Vault 🗑️"
      class="w-full max-w-3xl"
    >
      <div class="space-y-6">
        <!-- Welcome Section -->
        <div class="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 rounded-2xl p-6 border border-red-200">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center shadow-lg">
              <i class="pi pi-trash text-red-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-800 mb-1">Welcome to Your Deleted Memories Vault! 🗑️</h3>
              <p class="text-gray-600">This is where your deleted memories are safely stored - you can restore them or permanently delete them forever!</p>
            </div>
          </div>
        </div>

        <!-- Stats Cards Section -->
        <div class="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-10 h-10 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center shadow-lg">
              <i class="pi pi-chart-bar text-red-600 text-lg"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-800 mb-1">📊 Your Deleted Collection Stats</h3>
              <p class="text-gray-600">Track your deleted memories with these statistics!</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-white rounded-xl p-4 border border-red-100">
              <div class="flex items-center gap-2 mb-2">
                <i class="pi pi-trash text-red-500"></i>
                <span class="font-semibold text-gray-800">Total Deleted</span>
              </div>
              <p class="text-sm text-gray-600">All your deleted memories</p>
            </div>
            <div class="bg-white rounded-xl p-4 border border-red-100">
              <div class="flex items-center gap-2 mb-2">
                <i class="pi pi-image text-blue-500"></i>
                <span class="font-semibold text-gray-800">Photos</span>
              </div>
              <p class="text-sm text-gray-600">Deleted photo memories</p>
            </div>
            <div class="bg-white rounded-xl p-4 border border-red-100">
              <div class="flex items-center gap-2 mb-2">
                <i class="pi pi-file-edit text-brand-header"></i>
                <span class="font-semibold text-gray-800">Stories</span>
              </div>
              <p class="text-sm text-gray-600">Deleted story memories</p>
            </div>
                         <div class="bg-white rounded-xl p-4 border border-red-100">
               <div class="flex items-center gap-2 mb-2">
                 <i class="pi pi-trash text-orange-500"></i>
                 <span class="font-semibold text-gray-800">Trash</span>
               </div>
               <p class="text-sm text-gray-600">All assets with the delete flag set</p>
             </div>
          </div>
        </div>

        <!-- Action Buttons Section -->
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center shadow-lg">
              <i class="pi pi-magic text-green-600 text-lg"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-800 mb-1">✨ Memory Recovery Actions</h3>
              <p class="text-gray-600">Choose what to do with your deleted memories!</p>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-white rounded-xl p-4 border border-green-100">
              <div class="flex items-center gap-2 mb-2">
                <i class="pi pi-undo text-green-500 text-lg"></i>
                <span class="font-semibold text-gray-800">Restore</span>
              </div>
              <p class="text-sm text-gray-600">Bring this memory back to your main review page</p>
            </div>
            <div class="bg-white rounded-xl p-4 border border-green-100">
              <div class="flex items-center gap-2 mb-2">
                <i class="pi pi-trash text-red-500 text-lg"></i>
                <span class="font-semibold text-gray-800">Permanently Delete</span>
              </div>
              <p class="text-sm text-gray-600">Remove this memory forever (cannot be undone)</p>
            </div>
          </div>
        </div>

        <!-- Empty Trash Section -->
        <div class="bg-gradient-to-r from-red-50 to-brand-navigation rounded-2xl p-6 border border-red-200">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-10 h-10 bg-gradient-to-br from-red-100 to-brand-navigation rounded-full flex items-center justify-center shadow-lg">
              <i class="pi pi-exclamation-triangle text-red-600 text-lg"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-800 mb-1">⚠️ Empty the Trash</h3>
              <p class="text-gray-600">Permanently delete all deleted memories at once</p>
            </div>
          </div>
          <div class="bg-white rounded-xl p-4 border border-red-100">
            <div class="flex items-center gap-2 mb-2">
              <i class="pi pi-trash text-red-500 text-lg"></i>
              <span class="font-semibold text-gray-800">Empty the Trash Button</span>
            </div>
            <p class="text-sm text-gray-600">This will permanently delete ALL deleted memories from both storage and the database. This action cannot be undone!</p>
          </div>
        </div>

        <!-- Tips -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <h3 class="text-lg font-bold text-gray-800 mb-2">💡 Tips</h3>
          <ul class="space-y-1 text-sm text-gray-600">
            <li>• Restored memories go back to "Pending" status</li>
            <li>• You can approve/delete them again after restoring</li>
            <li>• Deleted memories don't count toward your total</li>
            <li>• Use filters to find specific deleted memories</li>
            <li>• The deletion date shows when it was deleted</li>
            <li>• Empty the Trash is permanent and cannot be undone</li>
          </ul>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
// Set the layout for this page
definePageMeta({
  layout: 'default'
})

import { useToast } from 'primevue/usetoast'

const toast = useToast()
const db = useDatabase()

// Reactive data
const deletedAssets = ref([])
const showHelpModal = ref(false)
const showEmptyTrashDialog = ref(false)
const emptyingTrash = ref(false)

// Stats
const stats = ref({
  total: 0,
  photos: 0,
  stories: 0,
  trash: 0
})

// Filters
const typeFilter = ref('all')
const sortBy = ref('newest')

const typeOptions = ref([
  { label: 'All Types', value: 'all' },
  { label: 'Photos', value: 'photo' },
  { label: 'Stories', value: 'text' }
])

const sortOptions = ref([
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'By Type', value: 'type' }
])

// Computed properties
const filteredDeletedAssets = computed(() => {
  let filtered = [...deletedAssets.value]

  // Apply type filter
  if (typeFilter.value !== 'all') {
    filtered = filtered.filter(asset => asset.type === typeFilter.value)
  }

  // Apply sorting
  filtered.sort((a, b) => {
    if (sortBy.value === 'newest') {
      return new Date(b.updated_at) - new Date(a.updated_at)
    } else if (sortBy.value === 'oldest') {
      return new Date(a.updated_at) - new Date(b.updated_at)
    } else if (sortBy.value === 'type') {
      return a.type.localeCompare(b.type)
    }
    return 0
  })

  return filtered
})

// Calculate stats
const calculateStats = () => {
  stats.value = {
    total: deletedAssets.value.length,
    photos: deletedAssets.value.filter(a => a.type === 'photo').length,
    stories: deletedAssets.value.filter(a => a.type === 'text').length,
    trash: deletedAssets.value.length
  }
}

// Load deleted assets
onMounted(async () => {
  await loadDeletedAssets()
})

// Load deleted assets
const loadDeletedAssets = async () => {
  try {
    const assets = await db.assets.getDeletedAssets()
    deletedAssets.value = assets
    calculateStats()
  } catch (error) {
    console.error('Error loading deleted assets:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load deleted assets',
      life: 3000
    })
  }
}

// Restore asset
const restoreAsset = async (assetId) => {
  try {
    await db.assets.restoreAsset(assetId)
    
    // Update local state
    deletedAssets.value = deletedAssets.value.filter(a => a.id !== assetId)
    calculateStats()
    
    toast.add({
      severity: 'success',
      summary: 'Restored',
      detail: 'Memory restored successfully',
      life: 2000
    })
  } catch (error) {
    console.error('Error restoring asset:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to restore memory',
      life: 3000
    })
  }
}

// Permanently delete single asset
const permanentlyDeleteAsset = async (assetId) => {
  try {
    const asset = deletedAssets.value.find(a => a.id === assetId)
    if (!asset) return

    // Delete from storage if it has a storage URL
    if (asset.storage_url) {
      const fileName = asset.storage_url.split('/').pop()
      if (fileName) {
        const { error: storageError } = await useNuxtApp().$supabase.storage
          .from('assets')
          .remove([fileName])
        
        if (storageError) {
          console.error('Error deleting from storage:', storageError)
        }
      }
    }

    // Delete from database
    const { error: dbError } = await useNuxtApp().$supabase
      .from('assets')
      .delete()
      .eq('id', assetId)
      .eq('user_id', useSupabaseUser().value.id)

    if (dbError) {
      throw dbError
    }

    // Update local state
    deletedAssets.value = deletedAssets.value.filter(a => a.id !== assetId)
    calculateStats()
    
    toast.add({
      severity: 'success',
      summary: 'Deleted',
      detail: 'Memory permanently deleted',
      life: 2000
    })
  } catch (error) {
    console.error('Error permanently deleting asset:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to permanently delete memory',
      life: 3000
    })
  }
}

// Empty the trash - permanently delete all deleted assets
const emptyTrash = async () => {
  if (deletedAssets.value.length === 0) {
    showEmptyTrashDialog.value = false
    return
  }

  emptyingTrash.value = true
  
  try {
    // Delete all storage files
    const assetsWithStorage = deletedAssets.value.filter(a => a.storage_url)
    if (assetsWithStorage.length > 0) {
      const fileNames = assetsWithStorage.map(asset => {
        const fileName = asset.storage_url.split('/').pop()
        return fileName
      }).filter(Boolean)
      
      if (fileNames.length > 0) {
        const { error: storageError } = await useNuxtApp().$supabase.storage
          .from('assets')
          .remove(fileNames)
        
        if (storageError) {
          console.error('Error deleting from storage:', storageError)
        }
      }
    }

    // Delete all from database
    const { error: dbError } = await useNuxtApp().$supabase
      .from('assets')
      .delete()
      .eq('user_id', useSupabaseUser().value.id)
      .eq('deleted', true)

    if (dbError) {
      throw dbError
    }

    // Clear local state
    deletedAssets.value = []
    calculateStats()
    
    showEmptyTrashDialog.value = false
    
    toast.add({
      severity: 'success',
      summary: 'Trash Emptied',
      detail: `Permanently deleted ${deletedAssets.value.length} memories`,
      life: 3000
    })
  } catch (error) {
    console.error('Error emptying trash:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to empty trash',
      life: 3000
    })
  } finally {
    emptyingTrash.value = false
  }
}

// Helper function to get image name from URL
const getImageName = (url) => {
  if (!url) return null
  const parts = url.split('/')
  return parts[parts.length - 1] || null
}

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Unknown date'
  }
}
</script> 