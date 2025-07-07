<template>
  <div class="min-h-screen surface-ground p-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-color mb-2">Review & Approve</h1>
        <p class="text-color-secondary">Review your uploaded memories and approve them for your memory book.</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <template #content>
            <div class="flex items-center">
              <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <i class="pi pi-image text-primary text-sm"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-color-secondary">Total Assets</p>
                <p class="text-lg font-semibold text-color">{{ stats.total }}</p>
              </div>
            </div>
          </template>
        </Card>

        <Card>
          <template #content>
            <div class="flex items-center">
              <div class="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                <i class="pi pi-clock text-warning text-sm"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-color-secondary">Pending Review</p>
                <p class="text-lg font-semibold text-color">{{ stats.pending }}</p>
              </div>
            </div>
          </template>
        </Card>

        <Card>
          <template #content>
            <div class="flex items-center">
              <div class="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                <i class="pi pi-check text-success text-sm"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-color-secondary">Approved</p>
                <p class="text-lg font-semibold text-color">{{ stats.approved }}</p>
              </div>
            </div>
          </template>
        </Card>

        <Card>
          <template #content>
            <div class="flex items-center">
              <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <i class="pi pi-book text-primary text-sm"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-color-secondary">Ready for Book</p>
                <p class="text-lg font-semibold text-color">{{ stats.readyForBook }}</p>
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

            <Button
              label="Generate Memory Book"
              :disabled="stats.approved === 0"
              @click="generateMemoryBook"
            />
          </div>
        </template>
      </Card>

      <!-- Assets Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          v-for="asset in filteredAssets"
          :key="asset.id"
          class="hover:shadow-md transition-shadow"
        >
          <template #content>
            <!-- Photo Asset -->
            <div v-if="asset.type === 'photo'" class="space-y-4">
              <div class="aspect-w-16 aspect-h-12 surface-100 rounded-t-lg overflow-hidden">
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
                  <InputText
                    v-model="asset.user_caption"
                    placeholder="Add your caption"
                    class="w-full text-sm"
                    @blur="updateAssetCaption(asset.id, asset.user_caption)"
                  />
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

                <!-- People Detected -->
                <div v-if="asset.people_detected && asset.people_detected.length > 0">
                  <label class="block text-sm font-medium text-color mb-1">People/Objects</label>
                  <div class="flex flex-wrap gap-1">
                    <Chip
                      v-for="person in asset.people_detected"
                      :key="person"
                      :label="person"
                      class="text-xs"
                      severity="info"
                    />
                  </div>
                </div>

                <!-- Approval Actions -->
                <div class="flex items-center justify-between pt-3 border-t border-surface-border">
                  <div class="flex items-center space-x-2">
                    <Button
                      v-if="!asset.approved"
                      label="Approve"
                      severity="success"
                      size="small"
                      @click="approveAsset(asset.id)"
                    />
                    <Button
                      v-else
                      label="Reject"
                      severity="danger"
                      size="small"
                      @click="rejectAsset(asset.id)"
                    />
                  </div>
                  <div class="flex items-center space-x-2">
                    <Tag
                      :value="asset.approved ? 'Approved' : 'Pending'"
                      :severity="asset.approved ? 'success' : 'warning'"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Text Asset -->
            <div v-else class="space-y-4">
              <div class="w-full h-32 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex items-center justify-center">
                <i class="pi pi-file-edit text-4xl text-primary"></i>
              </div>

              <div class="space-y-3">
                <!-- User Caption -->
                <div class="field">
                  <label class="block text-sm font-medium text-color mb-1">Your Caption</label>
                  <InputText
                    v-model="asset.user_caption"
                    placeholder="Add your caption"
                    class="w-full text-sm"
                    @blur="updateAssetCaption(asset.id, asset.user_caption)"
                  />
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

                <!-- Approval Actions -->
                <div class="flex items-center justify-between pt-3 border-t border-surface-border">
                  <div class="flex items-center space-x-2">
                    <Button
                      v-if="!asset.approved"
                      label="Approve"
                      severity="success"
                      size="small"
                      @click="approveAsset(asset.id)"
                    />
                    <Button
                      v-else
                      label="Reject"
                      severity="danger"
                      size="small"
                      @click="rejectAsset(asset.id)"
                    />
                  </div>
                  <div class="flex items-center space-x-2">
                    <Tag
                      :value="asset.approved ? 'Approved' : 'Pending'"
                      :severity="asset.approved ? 'success' : 'warning'"
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
const assets = ref([])
const stats = ref({
  total: 0,
  pending: 0,
  approved: 0,
  readyForBook: 0
})

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
    $toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load assets',
      life: 3000
    })
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
    $toast.add({
      severity: 'success',
      summary: 'Updated',
      detail: 'Caption updated successfully',
      life: 2000
    })
  } catch (error) {
    console.error('Error updating caption:', error)
    $toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update caption',
      life: 3000
    })
  }
}

// Approve asset
const approveAsset = async (assetId) => {
  try {
    await db.assets.updateAsset(assetId, { approved: true, rejected: false })
    
    // Update local state
    const asset = assets.value.find(a => a.id === assetId)
    if (asset) {
      asset.approved = true
      asset.rejected = false
    }
    
    calculateStats()
    
    $toast.add({
      severity: 'success',
      summary: 'Approved',
      detail: 'Asset approved successfully',
      life: 2000
    })
  } catch (error) {
    console.error('Error approving asset:', error)
    $toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to approve asset',
      life: 3000
    })
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
    
    $toast.add({
      severity: 'success',
      summary: 'Rejected',
      detail: 'Asset rejected',
      life: 2000
    })
  } catch (error) {
    console.error('Error rejecting asset:', error)
    $toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to reject asset',
      life: 3000
    })
  }
}

// Generate memory book
const generateMemoryBook = async () => {
  try {
    const approvedAssets = assets.value.filter(a => a.approved)
    
    if (approvedAssets.length === 0) {
      $toast.add({
        severity: 'warn',
        summary: 'No Assets',
        detail: 'No approved assets to include in memory book',
        life: 3000
      })
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
    $toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to generate memory book',
      life: 3000
    })
  }
}

// Watch for changes to recalculate stats
watch(assets, calculateStats, { deep: true })
</script> 