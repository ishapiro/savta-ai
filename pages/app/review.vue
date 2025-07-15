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
              <!-- Title -->
              <div class="mb-1">
                <label class="block text-xs font-semibold text-color mb-1">Title</label>
                <div class="text-xs font-medium text-color bg-yellow-50 rounded p-1 border border-yellow-200">
                  {{ asset.title || getImageName(asset.storage_url) || 'Untitled' }}
                </div>
              </div>
              <!-- User Caption -->
              <div class="mb-1">
                <label class="block text-xs font-semibold text-color mb-1">Your Caption</label>
                <div v-if="asset.user_caption && asset.user_caption !== getImageName(asset.storage_url)" class="text-xs text-color bg-blue-50 rounded p-1 border border-blue-200">
                  {{ asset.user_caption }}
                </div>
                <div v-else class="text-xs text-gray-400 italic bg-gray-50 rounded p-1 border border-gray-200">
                  No caption added
                </div>
              </div>
              <!-- AI Caption -->
              <div v-if="asset.ai_caption" class="mb-1">
                <label class="block text-xs font-semibold text-color mb-1">AI Caption</label>
                <div class="italic text-xs text-color-secondary bg-slate-50 rounded p-1">"{{ asset.ai_caption }}"</div>
              </div>
              <!-- Tags -->
              <div v-if="(asset.tags && asset.tags.length > 0) || (asset.user_tags && asset.user_tags.length > 0)" class="mb-1">
                <label class="block text-xs font-semibold text-color mb-1">Tags</label>
                <div class="flex flex-wrap gap-1">
                  <Chip
                    v-for="tag in asset.tags || []"
                    :key="`ai-${tag}`"
                    :label="tag"
                    class="text-xs bg-gray-100 text-gray-700 px-2 py-0.5"
                  />
                  <Chip
                    v-for="tag in asset.user_tags || []"
                    :key="`user-${tag}`"
                    :label="tag"
                    class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5"
                  />
                </div>
              </div>
              <!-- People Detected -->
              <div v-if="(asset.people_detected && asset.people_detected.length > 0) || (asset.user_people && asset.user_people.length > 0)" class="mb-1">
                <label class="block text-xs font-semibold text-color mb-1">People/Objects</label>
                <div class="flex flex-wrap gap-1">
                  <Chip
                    v-for="person in asset.people_detected || []"
                    :key="`ai-${person}`"
                    :label="person"
                    class="text-xs bg-gray-100 text-gray-700 px-2 py-0.5"
                  />
                  <Chip
                    v-for="person in asset.user_people || []"
                    :key="`user-${person}`"
                    :label="person"
                    class="text-xs bg-pink-100 text-pink-700 px-2 py-0.5"
                  />
                </div>
              </div>
            </div>
            <!-- Action Bar -->
            <div class="rounded-b-2xl bg-gradient-to-r from-blue-100 via-pink-100 to-purple-100 px-4 py-3 flex items-center justify-between gap-4 border-t border-gray-200">
              <div class="flex items-center gap-4 flex-1 justify-center">
                <div v-if="!asset.approved" class="flex flex-col items-center cursor-pointer group" @click="approveAsset(asset.id)" v-tooltip.top="'Approve'">
                  <i class="pi pi-check text-3xl text-green-500 group-hover:scale-125 transition-transform"></i>
                  <span class="text-xs text-green-700 mt-1">Approve</span>
                </div>
                <div class="flex flex-col items-center cursor-pointer group" @click="openEditDialog(asset)" v-tooltip.top="'Edit'">
                  <i class="pi pi-pencil text-3xl text-blue-500 group-hover:scale-125 transition-transform"></i>
                  <span class="text-xs text-blue-700 mt-1">Edit</span>
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

      <!-- Edit Asset Dialog -->
      <Dialog
        v-model:visible="showEditDialog"
        modal
        :closable="true"
        :dismissableMask="true"
        header="Edit Asset"
        class="w-full max-w-4xl mx-4"
      >
        <div v-if="editingAsset" class="space-y-6">
          <!-- Asset Preview -->
          <div class="flex flex-col lg:flex-row gap-6">
            <div class="w-full lg:w-1/3">
              <div class="bg-gray-100 rounded-lg p-4">
                <img
                  v-if="editingAsset.storage_url"
                  :src="editingAsset.storage_url"
                  :alt="editingAsset.user_caption || 'Family photo'"
                  class="w-full h-48 lg:h-64 object-contain rounded"
                />
                <i v-else class="pi pi-image text-4xl text-gray-400 flex items-center justify-center h-48 lg:h-64"></i>
              </div>
            </div>
            
            <div class="w-full lg:w-2/3 space-y-4">
              <!-- Title -->
              <div>
                <label class="block text-sm font-semibold text-color mb-2">Title</label>
                <InputText
                  v-model="editingAsset.title"
                  placeholder="Add a title for this memory"
                  class="w-full"
                />
              </div>

              <!-- User Caption -->
              <div>
                <label class="block text-sm font-semibold text-color mb-2">Your Caption</label>
                <Textarea
                  v-model="editingAsset.user_caption"
                  placeholder="Add your caption"
                  class="w-full"
                  rows="3"
                />
              </div>

              <!-- Custom Tags -->
              <div>
                <label class="block text-sm font-semibold text-color mb-2">Custom Tags</label>
                <div class="flex flex-wrap gap-2 mb-2">
                  <Chip
                    v-for="tag in editingAsset.user_tags || []"
                    :key="tag"
                    :label="tag"
                    class="bg-blue-100 text-blue-700"
                    removable
                    @remove="removeUserTag(tag)"
                  />
                </div>
                <AutoComplete
                  v-model="newTag"
                  :suggestions="tagSuggestions"
                  @complete="searchTags"
                  placeholder="Add a tag"
                  class="w-full"
                  @keydown.enter="addUserTag"
                />
              </div>

              <!-- Custom People/Objects -->
              <div>
                <label class="block text-sm font-semibold text-color mb-2">People/Objects</label>
                <div class="flex flex-wrap gap-2 mb-2">
                  <Chip
                    v-for="person in editingAsset.user_people || []"
                    :key="person"
                    :label="person"
                    class="bg-pink-100 text-pink-700"
                    removable
                    @remove="removeUserPerson(person)"
                  />
                </div>
                <AutoComplete
                  v-model="newPerson"
                  :suggestions="peopleSuggestions"
                  @complete="searchPeople"
                  placeholder="Add a person or object"
                  class="w-full"
                  @keydown.enter="addUserPerson"
                />
              </div>

              <!-- AI Caption (read-only) -->
              <div v-if="editingAsset.ai_caption">
                <label class="block text-sm font-semibold text-color mb-2">AI Caption</label>
                <div class="italic text-sm text-color-secondary bg-slate-50 rounded p-3">
                  "{{ editingAsset.ai_caption }}"
                </div>
              </div>

              <!-- AI Tags (read-only) -->
              <div v-if="editingAsset.tags && editingAsset.tags.length > 0">
                <label class="block text-sm font-semibold text-color mb-2">AI Tags</label>
                <div class="flex flex-wrap gap-2">
                  <Chip
                    v-for="tag in editingAsset.tags"
                    :key="tag"
                    :label="tag"
                    class="bg-gray-100 text-gray-700"
                  />
                </div>
              </div>

              <!-- AI People (read-only) -->
              <div v-if="editingAsset.people_detected && editingAsset.people_detected.length > 0">
                <label class="block text-sm font-semibold text-color mb-2">AI People/Objects</label>
                <div class="flex flex-wrap gap-2">
                  <Chip
                    v-for="person in editingAsset.people_detected"
                    :key="person"
                    :label="person"
                    class="bg-gray-100 text-gray-700"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t">
            <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                @click="unapproveAsset"
                :disabled="!editingAsset.approved"
                class="flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-full px-6 py-3 text-lg shadow transition-all duration-200 w-full sm:w-auto"
              >
                <i class="pi pi-times text-xl"></i>
                Unapprove
              </button>
              <button
                @click="rerunAI"
                :disabled="aiProcessing"
                class="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-bold rounded-full px-6 py-3 text-lg shadow transition-all duration-200 w-full sm:w-auto"
              >
                <i class="pi pi-refresh text-xl" :class="{ 'animate-spin': aiProcessing }"></i>
                Rerun AI
              </button>
            </div>
            <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                @click="showEditDialog = false"
                class="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-full px-6 py-3 text-lg shadow transition-all duration-200 w-full sm:w-auto"
              >
                <i class="pi pi-times text-xl"></i>
                Cancel
              </button>
              <button
                @click="saveAssetChanges"
                class="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full px-6 py-3 text-lg shadow transition-all duration-200 w-full sm:w-auto"
              >
                <i class="pi pi-check text-xl"></i>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </Dialog>

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

// Edit dialog data
const showEditDialog = ref(false)
const editingAsset = ref(null)
const newTag = ref('')
const newPerson = ref('')
const tagSuggestions = ref([])
const peopleSuggestions = ref([])
const aiProcessing = ref(false)

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

// Edit dialog functions
const openEditDialog = async (asset) => {
  editingAsset.value = { ...asset }
  showEditDialog.value = true
  newTag.value = ''
  newPerson.value = ''
  
  // Preload suggestions for better UX
  try {
    const allTags = await db.assets.getAllTags()
    const allPeople = await db.assets.getAllPeople()
    tagSuggestions.value = allTags
    peopleSuggestions.value = allPeople
  } catch (error) {
    console.error('Error preloading suggestions:', error)
  }
}

const addUserTag = () => {
  if (newTag.value.trim() && !editingAsset.value.user_tags?.includes(newTag.value.trim())) {
    if (!editingAsset.value.user_tags) {
      editingAsset.value.user_tags = []
    }
    editingAsset.value.user_tags.push(newTag.value.trim())
    newTag.value = ''
  }
}

const removeUserTag = (tag) => {
  editingAsset.value.user_tags = editingAsset.value.user_tags.filter(t => t !== tag)
}

const addUserPerson = () => {
  if (newPerson.value.trim() && !editingAsset.value.user_people?.includes(newPerson.value.trim())) {
    if (!editingAsset.value.user_people) {
      editingAsset.value.user_people = []
    }
    editingAsset.value.user_people.push(newPerson.value.trim())
    newPerson.value = ''
  }
}

const removeUserPerson = (person) => {
  editingAsset.value.user_people = editingAsset.value.user_people.filter(p => p !== person)
}

const searchTags = async (event) => {
  try {
    const allTags = await db.assets.getAllTags()
    if (event.query.trim() === '') {
      // Show all tags when input is empty
      tagSuggestions.value = allTags
    } else {
      // Filter tags based on query
      tagSuggestions.value = allTags.filter(tag => 
        tag.toLowerCase().includes(event.query.toLowerCase())
      )
    }
  } catch (error) {
    console.error('Error searching tags:', error)
    tagSuggestions.value = []
  }
}

const searchPeople = async (event) => {
  try {
    const allPeople = await db.assets.getAllPeople()
    if (event.query.trim() === '') {
      // Show all people when input is empty
      peopleSuggestions.value = allPeople
    } else {
      // Filter people based on query
      peopleSuggestions.value = allPeople.filter(person => 
        person.toLowerCase().includes(event.query.toLowerCase())
      )
    }
  } catch (error) {
    console.error('Error searching people:', error)
    peopleSuggestions.value = []
  }
}

const saveAssetChanges = async () => {
  try {
    const updates = {
      title: editingAsset.value.title,
      user_caption: editingAsset.value.user_caption,
      user_tags: editingAsset.value.user_tags || [],
      user_people: editingAsset.value.user_people || []
    }
    
    await db.assets.updateAsset(editingAsset.value.id, updates)
    
    // Update local state
    const asset = assets.value.find(a => a.id === editingAsset.value.id)
    if (asset) {
      Object.assign(asset, updates)
    }
    
    showEditDialog.value = false
    editingAsset.value = null
    
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'success',
        summary: 'Saved',
        detail: 'Asset updated successfully',
        life: 2000
      })
    }
  } catch (error) {
    console.error('Error saving asset changes:', error)
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to save changes',
        life: 3000
      })
    }
  }
}

const unapproveAsset = async () => {
  try {
    await db.assets.approveAsset(editingAsset.value.id, false)
    
    // Update local state
    const asset = assets.value.find(a => a.id === editingAsset.value.id)
    if (asset) {
      asset.approved = false
    }
    editingAsset.value.approved = false
    
    calculateStats()
    
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'success',
        summary: 'Unapproved',
        detail: 'Asset unapproved',
        life: 2000
      })
    }
  } catch (error) {
    console.error('Error unapproving asset:', error)
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to unapprove asset',
        life: 3000
      })
    }
  }
}

const rerunAI = async () => {
  try {
    aiProcessing.value = true
    
    await db.assets.rerunAI(editingAsset.value.id)
    
    // Reload the asset to get updated AI results
    const updatedAsset = await db.assets.getAssets({ limit: 1 })
    const asset = updatedAsset.find(a => a.id === editingAsset.value.id)
    
    if (asset) {
      // Update local state
      const localAsset = assets.value.find(a => a.id === editingAsset.value.id)
      if (localAsset) {
        Object.assign(localAsset, asset)
      }
      
      // Update editing asset
      Object.assign(editingAsset.value, asset)
    }
    
    calculateStats()
    
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'success',
        summary: 'AI Updated',
        detail: 'AI analysis completed',
        life: 2000
      })
    }
  } catch (error) {
    console.error('Error rerunning AI:', error)
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to rerun AI analysis',
        life: 3000
      })
    }
  } finally {
    aiProcessing.value = false
  }
}

// Helper function to extract image name from storage URL
const getImageName = (storageUrl) => {
  if (!storageUrl) return null
  
  try {
    // Extract filename from URL
    const url = new URL(storageUrl)
    const pathParts = url.pathname.split('/')
    const filename = pathParts[pathParts.length - 1]
    
    // Remove timestamp prefix if present (format: timestamp-filename)
    const timestampRegex = /^\d+-/
    return filename.replace(timestampRegex, '')
  } catch (error) {
    console.error('Error parsing storage URL:', error)
    return null
  }
}

// Watch for changes to recalculate stats
watch(assets, calculateStats, { deep: true })
</script> 