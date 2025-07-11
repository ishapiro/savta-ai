<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
    <div class="max-w-7xl mx-auto">
      <!-- Top Bar -->
      <div class="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <div class="flex-1 flex gap-2">
          <button
            class="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full px-8 py-3 text-lg shadow transition-all duration-200 w-full sm:w-auto"
            @click="generateMemoryBook"
            :disabled="stats.approved === 0"
          >
            <i class="pi pi-book text-2xl animate-bounce"></i>
            Generate Book
          </button>
          <button
            class="p-3 text-blue-600 hover:text-blue-700 bg-white rounded-full shadow border border-blue-100 transition-colors"
            v-tooltip.top="'How to use this page'"
            @click="showHelpModal = true"
          >
            <i class="pi pi-info-circle text-2xl"></i>
          </button>
        </div>
        <div class="flex gap-2">
          <button
            class="flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-full px-8 py-3 text-lg shadow transition-all duration-200 w-full sm:w-auto"
            @click="navigateTo('/app/deleted-memories')"
          >
            <i class="pi pi-trash text-2xl animate-bounce"></i>
            View Deleted
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <i class="pi pi-image text-primary text-2xl mb-2"></i>
          <div class="text-sm text-color-secondary">Total</div>
          <div class="text-xl font-bold text-color">{{ stats.total }}</div>
        </div>
        <div class="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <i class="pi pi-clock text-warning text-2xl mb-2"></i>
          <div class="text-sm text-color-secondary">Pending</div>
          <div class="text-xl font-bold text-color">{{ stats.pending }}</div>
        </div>
        <div class="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <i class="pi pi-check text-success text-2xl mb-2"></i>
          <div class="text-sm text-color-secondary">Approved</div>
          <div class="text-xl font-bold text-color">{{ stats.approved }}</div>
        </div>
        <div class="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <i class="pi pi-book text-primary text-2xl mb-2"></i>
          <div class="text-sm text-color-secondary">Ready for Book</div>
          <div class="text-xl font-bold text-color">{{ stats.readyForBook }}</div>
        </div>
      </div>

      <!-- Filters -->
      <Card class="mb-8">
        <template #content>
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-color">Filter:</label>
              <Dropdown
                v-model="activeFilter"
                :options="filterOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select Filter"
                class="w-32"
              />
            </div>
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-color">Type:</label>
              <Dropdown
                v-model="typeFilter"
                :options="typeOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select Type"
                class="w-32"
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
                class="w-32"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- Memory Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <Card
          v-for="asset in filteredAssets"
          :key="asset.id"
          class="bg-white rounded-2xl shadow-xl p-0 flex flex-col justify-between hover:shadow-2xl transition-shadow border border-gray-100 text-xs"
        >
          <template #content>
            <!-- Photo -->
            <div class="rounded-t-2xl overflow-hidden bg-gray-100">
              <div class="w-full h-40 flex items-center justify-center">
                <img
                  v-if="asset.storage_url"
                  :src="asset.storage_url"
                  :alt="asset.user_caption || 'Family photo'"
                  class="max-w-full max-h-full object-contain"
                />
                <i v-else class="pi pi-image text-2xl text-gray-400"></i>
              </div>
            </div>
            <div class="flex-1 flex flex-col p-2">
              <!-- User Caption -->
              <div class="mb-1">
                <label class="block text-xs font-semibold text-color mb-1">Your Caption</label>
                <InputText
                  v-model="asset.user_caption"
                  placeholder="Add your caption"
                  class="w-full text-xs rounded"
                  @blur="updateAssetCaption(asset.id, asset.user_caption)"
                />
              </div>
              <!-- AI Caption -->
              <div v-if="asset.ai_caption" class="mb-1">
                <label class="block text-xs font-semibold text-color mb-1">AI Caption</label>
                <div class="italic text-xs text-color-secondary bg-slate-50 rounded p-1">"{{ asset.ai_caption }}"</div>
              </div>
              <!-- Tags -->
              <div v-if="asset.tags && asset.tags.length > 0" class="mb-1">
                <label class="block text-xs font-semibold text-color mb-1">Tags</label>
                <div class="flex flex-wrap gap-1">
                  <Chip
                    v-for="tag in asset.tags"
                    :key="tag"
                    :label="tag"
                    class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5"
                  />
                </div>
              </div>
              <!-- People Detected -->
              <div v-if="asset.people_detected && asset.people_detected.length > 0" class="mb-1">
                <label class="block text-xs font-semibold text-color mb-1">People/Objects</label>
                <div class="flex flex-wrap gap-1">
                  <Chip
                    v-for="person in asset.people_detected"
                    :key="person"
                    :label="person"
                    class="text-xs bg-pink-100 text-pink-700 px-2 py-0.5"
                  />
                </div>
              </div>
            </div>
            <!-- Action Bar -->
            <div class="rounded-b-2xl bg-gradient-to-r from-blue-100 via-pink-100 to-purple-100 px-4 py-3 flex items-center justify-between gap-4 border-t border-gray-200">
              <div class="flex items-center gap-6 flex-1 justify-center">
                <div class="flex flex-col items-center cursor-pointer group" @click="approveAsset(asset.id)" v-tooltip.top="'Approve'">
                  <i class="pi pi-check text-3xl text-green-500 group-hover:scale-125 transition-transform"></i>
                  <span class="text-xs text-green-700 mt-1">Approve</span>
                </div>
                <div class="flex flex-col items-center cursor-pointer group" @click="deleteAsset(asset.id)" v-tooltip.top="'Delete'">
                  <i class="pi pi-trash text-3xl text-red-500 group-hover:scale-125 transition-transform"></i>
                  <span class="text-xs text-red-700 mt-1">Delete</span>
                </div>
              </div>
              <div>
                <span v-if="!asset.approved && !asset.rejected" class="inline-block px-3 py-1 rounded-full bg-orange-200 text-orange-800 font-semibold text-xs shadow">Pending</span>
                <span v-else-if="asset.approved" class="inline-block px-3 py-1 rounded-full bg-green-200 text-green-800 font-semibold text-xs shadow">Approved</span>
                <span v-else-if="asset.rejected" class="inline-block px-3 py-1 rounded-full bg-red-200 text-red-800 font-semibold text-xs shadow">Rejected</span>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Help Modal (unchanged) -->
      <Dialog
        v-model:visible="showHelpModal"
        modal
        :closable="true"
        :dismissableMask="true"
        header="How to Use the Review Page"
        class="w-full max-w-2xl"
      >
        <div class="space-y-6">
          <!-- Overview -->
          <div>
            <h3 class="text-lg font-semibold text-color mb-3">Overview</h3>
            <p class="text-color-secondary">
              This page helps you review and manage your uploaded memories. You can approve memories for your memory book, 
              reject them, or delete them entirely.
            </p>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-color mb-3">What does "Pending" mean?</h3>
            <p class="text-color-secondary">
              <b>Pending</b> means your memory is waiting for your review and approval before it can be included in a memory book. You can approve, edit, or delete pending memories using the actions on this page.
            </p>
          </div>

          <!-- Stats Cards -->
          <div>
            <h3 class="text-lg font-semibold text-color mb-3">Stats Cards</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="surface-100 rounded p-3">
                <div class="flex items-center mb-2">
                  <i class="pi pi-image text-primary mr-2"></i>
                  <span class="font-medium">Total Assets</span>
                </div>
                <p class="text-sm text-color-secondary">All your uploaded memories</p>
              </div>
              <div class="surface-100 rounded p-3">
                <div class="flex items-center mb-2">
                  <i class="pi pi-clock text-warning mr-2"></i>
                  <span class="font-medium">Pending Review</span>
                </div>
                <p class="text-sm text-color-secondary">Memories awaiting your decision</p>
              </div>
              <div class="surface-100 rounded p-3">
                <div class="flex items-center mb-2">
                  <i class="pi pi-check text-success mr-2"></i>
                  <span class="font-medium">Approved</span>
                </div>
                <p class="text-sm text-color-secondary">Memories ready for memory books</p>
              </div>
              <div class="surface-100 rounded p-3">
                <div class="flex items-center mb-2">
                  <i class="pi pi-book text-primary mr-2"></i>
                  <span class="font-medium">Ready for Book</span>
                </div>
                <p class="text-sm text-color-secondary">Can be included in memory books</p>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div>
            <h3 class="text-lg font-semibold text-color mb-3">Memory Action Buttons</h3>
            <div class="space-y-3">
              <div class="flex items-center space-x-3">
                <button class="p-2 text-green-600">
                  <i class="pi pi-check text-lg"></i>
                </button>
                <div>
                  <span class="font-medium">Approve</span>
                  <p class="text-sm text-color-secondary">Include this memory in your memory book</p>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <button class="p-2 text-red-600">
                  <i class="pi pi-times text-lg"></i>
                </button>
                <div>
                  <span class="font-medium">Reject</span>
                  <p class="text-sm text-color-secondary">Exclude from memory book but keep for review</p>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <button class="p-2 text-red-600">
                  <i class="pi pi-trash text-lg"></i>
                </button>
                <div>
                  <span class="font-medium">Delete</span>
                  <p class="text-sm text-color-secondary">Move to deleted memories (can be restored later)</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Status Tags -->
          <div>
            <h3 class="text-lg font-semibold text-color mb-3">Status Tags</h3>
            <div class="space-y-2">
              <div class="flex items-center space-x-3">
                <Tag value="Pending" severity="warning" />
                <span class="text-sm text-color-secondary">New memory awaiting review</span>
              </div>
              <div class="flex items-center space-x-3">
                <Tag value="Approved" severity="success" />
                <span class="text-sm text-color-secondary">Memory approved for memory books</span>
              </div>
              <div class="flex items-center space-x-3">
                <Tag value="Rejected" severity="danger" />
                <span class="text-sm text-color-secondary">Memory rejected (excluded from books)</span>
              </div>
            </div>
          </div>

          <!-- Page Actions -->
          <div>
            <h3 class="text-lg font-semibold text-color mb-3">Page Actions</h3>
            <div class="space-y-3">
              <div class="flex items-center space-x-3">
                <Button icon="pi pi-book" class="px-4 py-2">
                  <span class="ml-2">Generate Book</span>
                </Button>
                <span class="text-sm text-color-secondary">Create a memory book from approved memories</span>
              </div>
              <div class="flex items-center space-x-3">
                <Button icon="pi pi-trash" severity="secondary" size="small" class="px-4 py-2">
                  <span class="ml-2">View Deleted</span>
                </Button>
                <span class="text-sm text-color-secondary">View and restore deleted memories</span>
              </div>
            </div>
          </div>

          <!-- Tips -->
          <div class="surface-100 rounded p-4">
            <h3 class="text-lg font-semibold text-color mb-2">💡 Tips</h3>
            <ul class="space-y-1 text-sm text-color-secondary">
              <li>• Hover over icons to see tooltips</li>
              <li>• Use filters to find specific memories</li>
              <li>• Edit captions by clicking on them</li>
              <li>• Deleted memories can be restored later</li>
              <li>• Only approved memories appear in memory books</li>
            </ul>
          </div>
        </div>
      </Dialog>
    </div>
  </div>
</template>

<script setup>
// Set the layout for this page
definePageMeta({
  layout: 'default'
})

const { $toast } = useNuxtApp()
const db = useDatabase()

// Reactive data
const assets = ref([])
const stats = ref({
  total: 0,
  pending: 0,
  approved: 0,
  readyForBook: 0
})
const showHelpModal = ref(false)

// Filters
const activeFilter = ref('all')
const typeFilter = ref('all')
const sortBy = ref('newest')

// Filter options
const filterOptions = ref([
  { label: 'All Assets', value: 'all' },
  { label: 'Pending Review', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' }
])

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
const filteredAssets = computed(() => {
  let filtered = [...assets.value]

  // Apply status filter
  if (activeFilter.value !== 'all') {
    filtered = filtered.filter(asset => {
      if (activeFilter.value === 'pending') return !asset.approved
      if (activeFilter.value === 'approved') return asset.approved
      if (activeFilter.value === 'rejected') return asset.rejected
      return true
    })
  }

  // Apply type filter
  if (typeFilter.value !== 'all') {
    filtered = filtered.filter(asset => asset.type === typeFilter.value)
  }

  // Apply sorting
  filtered.sort((a, b) => {
    if (sortBy.value === 'newest') {
      return new Date(b.created_at) - new Date(a.created_at)
    } else if (sortBy.value === 'oldest') {
      return new Date(a.created_at) - new Date(b.created_at)
    } else if (sortBy.value === 'type') {
      return a.type.localeCompare(b.type)
    }
    return 0
  })

  return filtered
})

// Load assets and stats
onMounted(async () => {
  await loadAssets()
  calculateStats()
})

// Load assets
const loadAssets = async () => {
  try {
    const userAssets = await db.assets.getAssets()
    assets.value = userAssets
  } catch (error) {
    console.error('Error loading assets:', error)
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load assets',
        life: 3000
      })
    }
  }
}

// Calculate stats
const calculateStats = () => {
  stats.value = {
    total: assets.value.length,
    pending: assets.value.filter(a => !a.approved && !a.rejected).length,
    approved: assets.value.filter(a => a.approved).length,
    readyForBook: assets.value.filter(a => a.approved).length
  }
}

// Update asset caption
const updateAssetCaption = async (assetId, caption) => {
  try {
    await db.assets.updateAsset(assetId, { user_caption: caption })
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'success',
        summary: 'Updated',
        detail: 'Caption updated successfully',
        life: 2000
      })
    }
  } catch (error) {
    console.error('Error updating caption:', error)
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update caption',
        life: 3000
      })
    }
  }
}

// Approve asset
const approveAsset = async (assetId) => {
  try {
    await db.assets.approveAsset(assetId, true)
    // Update local state
    const asset = assets.value.find(a => a.id === assetId)
    if (asset) {
      asset.approved = true
      asset.rejected = false
    }
    calculateStats()
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'success',
        summary: 'Approved',
        detail: 'Asset approved successfully',
        life: 2000
      })
    }
  } catch (error) {
    console.error('Error approving asset:', error)
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to approve asset',
        life: 3000
      })
    }
  }
}

// Reject asset
const rejectAsset = async (assetId) => {
  try {
    await db.assets.updateAsset(assetId, { approved: false, rejected: true })
    
    // Update local state
    const asset = assets.value.find(a => a.id === assetId)
    if (asset) {
      asset.approved = false
      asset.rejected = true
    }
    
    calculateStats()
    
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'success',
        summary: 'Rejected',
        detail: 'Asset rejected',
        life: 2000
      })
    }
  } catch (error) {
    console.error('Error rejecting asset:', error)
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to reject asset',
        life: 3000
      })
    }
  }
}

// Delete asset
const deleteAsset = async (assetId) => {
  try {
    await db.assets.deleteAsset(assetId)
    
    // Update local state
    assets.value = assets.value.filter(a => a.id !== assetId)
    
    calculateStats()
    
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'success',
        summary: 'Deleted',
        detail: 'Asset deleted successfully',
        life: 2000
      })
    }
  } catch (error) {
    console.error('Error deleting asset:', error)
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete asset',
        life: 3000
      })
    }
  }
}

// Generate memory book
const generateMemoryBook = async () => {
  try {
    const approvedAssets = assets.value.filter(a => a.approved)
    
    if (approvedAssets.length === 0) {
      if ($toast && $toast.add) {
        $toast.add({
          severity: 'warn',
          summary: 'No Assets',
          detail: 'No approved assets to include in memory book',
          life: 3000
        })
      }
      return
    }

    // Navigate to memory books page with pre-selected assets
    await navigateTo('/app/memory-books', {
      query: {
        assets: approvedAssets.map(a => a.id).join(',')
      }
    })
    
  } catch (error) {
    console.error('Error generating memory book:', error)
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to generate memory book',
        life: 3000
      })
    }
  }
}

// Watch for changes to recalculate stats
watch(assets, calculateStats, { deep: true })
</script> 