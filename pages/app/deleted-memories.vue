<template>
  <div class="min-h-screen surface-ground p-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-color mb-2">Deleted Memories</h1>
            <p class="text-color-secondary">View and restore your deleted memories.</p>
          </div>
          <div class="flex items-center space-x-2">
            <button
              class="p-2 text-blue-600 hover:text-blue-700 transition-colors"
              v-tooltip.top="'How to use this page'"
              @click="showHelpModal = true"
            >
              <i class="pi pi-info-circle text-xl"></i>
            </button>
            <Button
              icon="pi pi-arrow-left"
              severity="secondary"
              v-tooltip.top="'Back to Review'"
              @click="navigateTo('/app/review')"
            >
              <span class="hidden sm:inline ml-1">Back to Review</span>
            </Button>
          </div>
        </div>
      </div>

      <!-- Stats Card -->
      <div class="mb-6">
        <Card>
          <template #content>
            <div class="flex items-center">
              <div class="w-8 h-8 bg-danger-100 rounded-lg flex items-center justify-center">
                <i class="pi pi-trash text-danger text-sm"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-color-secondary">Deleted Assets</p>
                <p class="text-lg font-semibold text-color">{{ deletedAssets.length }}</p>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Filters -->
      <Card class="mb-6">
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

      <!-- Empty State -->
      <div v-if="filteredDeletedAssets.length === 0" class="text-center py-12">
        <div class="w-16 h-16 bg-surface-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="pi pi-trash text-2xl text-color-secondary"></i>
        </div>
        <h3 class="text-lg font-semibold text-color mb-2">No Deleted Memories</h3>
        <p class="text-color-secondary">You haven't deleted any memories yet.</p>
      </div>

      <!-- Deleted Assets Grid -->
      <div v-else class="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-6">
        <Card
          v-for="asset in filteredDeletedAssets"
          :key="asset.id"
          class="hover:shadow-md transition-shadow opacity-75"
        >
          <template #content>
            <!-- Photo Asset -->
            <div v-if="asset.type === 'photo'" class="space-y-4">
              <div class="surface-100 rounded-t-lg overflow-hidden" :style="`height: 90px;`" :class="'sm:!h-[150px]'">
                <img
                  v-if="asset.storage_url"
                  :src="asset.storage_url"
                  :alt="asset.user_caption || 'Family photo'"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-color-secondary">
                  <i class="pi pi-image text-3xl"></i>
                </div>
              </div>

              <div class="space-y-3">
                <!-- User Caption -->
                <div class="field">
                  <label class="block text-sm font-medium text-color mb-1">Your Caption</label>
                  <div class="surface-100 rounded p-2 text-sm text-color-secondary">
                    {{ asset.user_caption || 'No caption' }}
                  </div>
                </div>

                <!-- AI Caption -->
                <div v-if="asset.ai_caption">
                  <label class="block text-sm font-medium text-color mb-1">AI Caption</label>
                  <div class="surface-100 rounded p-2 text-sm text-color-secondary italic">
                    "{{ asset.ai_caption }}"
                  </div>
                </div>

                <!-- Tags -->
                <div v-if="asset.tags && asset.tags.length > 0">
                  <label class="block text-sm font-medium text-color mb-1">Tags</label>
                  <div class="flex flex-wrap gap-1">
                    <Chip
                      v-for="tag in asset.tags"
                      :key="tag"
                      :label="tag"
                      class="text-xs"
                    />
                  </div>
                </div>

                <!-- Deleted Date -->
                <div class="text-xs text-color-secondary">
                  Deleted: {{ formatDate(asset.updated_at) }}
                </div>

                <!-- Restore Action -->
                <div class="pt-3 border-t border-surface-border">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <button
                      class="p-2 text-green-600 hover:text-green-700 transition-colors"
                      v-tooltip.top="'Restore Memory'"
                      @click="restoreAsset(asset.id)"
                    >
                      <i class="pi pi-undo text-lg"></i>
                    </button>
                    <Tag
                      value="Deleted"
                      severity="danger"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Text Asset -->
            <div v-else class="space-y-4">
              <div class="w-full h-32 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex items-center justify-center" style="height: 120px;">
                <i class="pi pi-file-edit text-4xl text-primary"></i>
              </div>

              <div class="space-y-3">
                <!-- User Caption -->
                <div class="field">
                  <label class="block text-sm font-medium text-color mb-1">Your Caption</label>
                  <div class="surface-100 rounded p-2 text-sm text-color-secondary">
                    {{ asset.user_caption || 'No caption' }}
                  </div>
                </div>

                <!-- AI Caption -->
                <div v-if="asset.ai_caption">
                  <label class="block text-sm font-medium text-color mb-1">AI Caption</label>
                  <div class="surface-100 rounded p-2 text-sm text-color-secondary italic">
                    "{{ asset.ai_caption }}"
                  </div>
                </div>

                <!-- Tags -->
                <div v-if="asset.tags && asset.tags.length > 0">
                  <label class="block text-sm font-medium text-color mb-1">Tags</label>
                  <div class="flex flex-wrap gap-1">
                    <Chip
                      v-for="tag in asset.tags"
                      :key="tag"
                      :label="tag"
                      class="text-xs"
                    />
                  </div>
                </div>

                <!-- Deleted Date -->
                <div class="text-xs text-color-secondary">
                  Deleted: {{ formatDate(asset.updated_at) }}
                </div>

                <!-- Restore Action -->
                <div class="pt-3 border-t border-surface-border">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <button
                      class="p-2 text-green-600 hover:text-green-700 transition-colors"
                      v-tooltip.top="'Restore Memory'"
                      @click="restoreAsset(asset.id)"
                    >
                      <i class="pi pi-undo text-lg"></i>
                    </button>
                    <Tag
                      value="Deleted"
                      severity="danger"
                    />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>

  <!-- Help Modal -->
  <Dialog
    v-model:visible="showHelpModal"
    modal
    :closable="true"
    :dismissableMask="true"
    header="How to Use the Deleted Memories Page"
    class="w-full max-w-2xl"
  >
    <div class="space-y-6">
      <!-- Overview -->
      <div>
        <h3 class="text-lg font-semibold text-color mb-3">Overview</h3>
        <p class="text-color-secondary">
          This page shows all your deleted memories. You can restore them back to the main review page 
          or leave them deleted permanently.
        </p>
      </div>

      <!-- Stats Card -->
      <div>
        <h3 class="text-lg font-semibold text-color mb-3">Stats</h3>
        <div class="surface-100 rounded p-4">
          <div class="flex items-center mb-2">
            <i class="pi pi-trash text-danger mr-2"></i>
            <span class="font-medium">Deleted Assets</span>
          </div>
          <p class="text-sm text-color-secondary">Total number of deleted memories</p>
        </div>
      </div>

      <!-- Restore Action -->
      <div>
        <h3 class="text-lg font-semibold text-color mb-3">Restore Action</h3>
        <div class="flex items-center space-x-3">
          <button class="p-2 text-green-600">
            <i class="pi pi-undo text-lg"></i>
          </button>
          <div>
            <span class="font-medium">Restore</span>
            <p class="text-sm text-color-secondary">Move this memory back to the main review page</p>
          </div>
        </div>
      </div>

      <!-- Status Tags -->
      <div>
        <h3 class="text-lg font-semibold text-color mb-3">Status Tags</h3>
        <div class="space-y-2">
          <div class="flex items-center space-x-3">
            <Tag value="Deleted" severity="danger" />
            <span class="text-sm text-color-secondary">Memory has been deleted (soft delete)</span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div>
        <h3 class="text-lg font-semibold text-color mb-3">Filters</h3>
        <div class="space-y-2">
          <div class="flex items-center space-x-3">
            <span class="font-medium">Type:</span>
            <span class="text-sm text-color-secondary">Filter by Photos or Stories</span>
          </div>
          <div class="flex items-center space-x-3">
            <span class="font-medium">Sort:</span>
            <span class="text-sm text-color-secondary">Sort by newest, oldest, or type</span>
          </div>
        </div>
      </div>

      <!-- Tips -->
      <div class="surface-100 rounded p-4">
        <h3 class="text-lg font-semibold text-color mb-2">💡 Tips</h3>
        <ul class="space-y-1 text-sm text-color-secondary">
          <li>• Restored memories go back to "Pending" status</li>
          <li>• You can approve/delete them again after restoring</li>
          <li>• Deleted memories don't count toward your total</li>
          <li>• Use filters to find specific deleted memories</li>
          <li>• The deletion date shows when it was deleted</li>
        </ul>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
// Set the layout for this page
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const { $toast } = useNuxtApp()
const db = useDatabase()

// Reactive data
const deletedAssets = ref([])
const showHelpModal = ref(false)

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

// Load deleted assets
onMounted(async () => {
  await loadDeletedAssets()
})

// Load deleted assets
const loadDeletedAssets = async () => {
  try {
    const assets = await db.assets.getDeletedAssets()
    deletedAssets.value = assets
  } catch (error) {
    console.error('Error loading deleted assets:', error)
    $toast.add({
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
    
    $toast.add({
      severity: 'success',
      summary: 'Restored',
      detail: 'Memory restored successfully',
      life: 2000
    })
  } catch (error) {
    console.error('Error restoring asset:', error)
    $toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to restore memory',
      life: 3000
    })
  }
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