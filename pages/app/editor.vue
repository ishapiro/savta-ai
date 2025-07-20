<template>
  <div class="min-h-screen surface-ground p-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-color mb-2">Editor Dashboard</h1>
        <p class="text-color-secondary">Manage themes and review user submissions.</p>
      </div>

      <!-- Editor Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <template #content>
            <div class="flex items-center">
              <div class="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                <i class="pi pi-image text-warning text-sm"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-color-secondary">Pending Assets</p>
                <p class="text-lg font-semibold text-color">{{ stats.pendingAssets }}</p>
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
                <p class="text-sm font-medium text-color-secondary">Reviewed Assets</p>
                <p class="text-lg font-semibold text-color">{{ stats.reviewedAssets }}</p>
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
                <p class="text-sm font-medium text-color-secondary">Savta's Special Memories</p>
                <p class="text-lg font-semibold text-color">{{ stats.memoryBooks }}</p>
              </div>
            </div>
          </template>
        </Card>

        <Card>
          <template #content>
            <div class="flex items-center">
              <div class="w-8 h-8 bg-info-100 rounded-lg flex items-center justify-center">
                <i class="pi pi-palette text-info text-sm"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-color-secondary">Active Themes</p>
                <p class="text-lg font-semibold text-color">{{ stats.activeThemes }}</p>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Editor Tabs -->
      <Card>
        <template #content>
          <TabView v-model:activeIndex="activeTabIndex" class="w-full">
            <TabPanel header="📸 Asset Review">
              <div class="space-y-6">
                <div class="flex items-center justify-between">
                  <h2 class="text-xl font-semibold text-color">Asset Review</h2>
                  <div class="flex items-center space-x-4">
                    <InputText
                      v-model="assetSearch"
                      placeholder="Search assets..."
                      class="w-64"
                    />
                    <Dropdown
                      v-model="assetStatusFilter"
                      :options="statusOptions"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="All Status"
                      class="w-32"
                    />
                  </div>
                </div>

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
                          <!-- User Info -->
                          <div class="flex items-center space-x-2">
                            <div class="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                              <span class="text-primary text-xs font-medium">
                                {{ asset.profiles?.first_name?.charAt(0) || asset.profiles?.email?.charAt(0).toUpperCase() }}
                              </span>
                            </div>
                            <div class="text-sm">
                              <p class="font-medium text-color">
                                {{ asset.profiles?.first_name }} {{ asset.profiles?.last_name }}
                              </p>
                              <p class="text-color-secondary">{{ asset.profiles?.email }}</p>
                            </div>
                          </div>

                          <!-- Caption -->
                          <div>
                            <label class="block text-sm font-medium text-color mb-1">User Caption</label>
                            <p class="text-sm text-color">{{ asset.user_caption || 'No caption' }}</p>
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

                          <!-- Actions -->
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
                            <Tag
                              :value="asset.approved ? 'Approved' : 'Pending'"
                              :severity="asset.approved ? 'success' : 'warning'"
                            />
                          </div>
                        </div>
                      </div>

                      <!-- Text Asset -->
                      <div v-else class="space-y-4">
                        <div class="w-full h-32 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex items-center justify-center">
                          <i class="pi pi-file-edit text-4xl text-primary"></i>
                        </div>

                        <div class="space-y-3">
                          <!-- User Info -->
                          <div class="flex items-center space-x-2">
                            <div class="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                              <span class="text-primary text-xs font-medium">
                                {{ asset.profiles?.first_name?.charAt(0) || asset.profiles?.email?.charAt(0).toUpperCase() }}
                              </span>
                            </div>
                            <div class="text-sm">
                              <p class="font-medium text-color">
                                {{ asset.profiles?.first_name }} {{ asset.profiles?.last_name }}
                              </p>
                              <p class="text-color-secondary">{{ asset.profiles?.email }}</p>
                            </div>
                          </div>

                          <!-- Caption -->
                          <div>
                            <label class="block text-sm font-medium text-color mb-1">User Caption</label>
                            <p class="text-sm text-color">{{ asset.user_caption || 'No caption' }}</p>
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

                          <!-- Actions -->
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
                            <Tag
                              :value="asset.approved ? 'Approved' : 'Pending'"
                              :severity="asset.approved ? 'success' : 'warning'"
                            />
                          </div>
                        </div>
                      </div>
                    </template>
                  </Card>
                </div>
              </div>
            </TabPanel>

            <TabPanel header="📚 Book Review">
              <div class="space-y-6">
                <div class="flex items-center justify-between">
                  <h2 class="text-xl font-semibold text-color">Memory Book Review</h2>
                  <div class="flex items-center space-x-4">
                    <InputText
                      v-model="bookSearch"
                      placeholder="Search books..."
                      class="w-64"
                    />
                    <Dropdown
                      v-model="bookStatusFilter"
                      :options="bookStatusOptions"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="All Status"
                      class="w-32"
                    />
                  </div>
                </div>

                <!-- Books Table -->
                <DataTable
                  :value="filteredBooks"
                  :paginator="true"
                  :rows="10"
                  :rowsPerPageOptions="[5, 10, 20, 50]"
                  paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                  currentPageReportTemplate="Showing {first} to {last} of {totalRecords} books"
                  responsiveLayout="scroll"
                  class="p-datatable-sm"
                >
                  <Column field="title" header="Title" sortable>
                    <template #body="{ data }">
                      <span class="text-sm font-medium text-color">{{ data.title }}</span>
                    </template>
                  </Column>

                  <Column field="status" header="Status" sortable>
                    <template #body="{ data }">
                      <Tag
                        :value="getBookStatusText(data.status)"
                        :severity="getBookStatusSeverity(data.status)"
                      />
                    </template>
                  </Column>

                  <Column field="created_at" header="Created" sortable>
                    <template #body="{ data }">
                      <span class="text-sm text-color-secondary">{{ formatDate(data.created_at) }}</span>
                    </template>
                  </Column>

                  <Column field="created_from_assets" header="Assets" sortable>
                    <template #body="{ data }">
                      <span class="text-sm text-color-secondary">{{ data.created_from_assets?.length || 0 }}</span>
                    </template>
                  </Column>

                  <Column header="Actions">
                    <template #body="{ data }">
                      <div class="flex items-center space-x-2">
                        <Button
                          v-if="data.status === 'ready'"
                          icon="pi pi-download"
                          severity="success"
                          size="small"
                          @click="downloadBook(data)"
                        />
                        <Button
                          v-if="data.status === 'draft'"
                          icon="pi pi-play"
                          severity="info"
                          size="small"
                          @click="generateBook(data)"
                        />
                        <Button
                          icon="pi pi-eye"
                          severity="secondary"
                          size="small"
                          @click="viewBookDetails(data)"
                        />
                      </div>
                    </template>
                  </Column>
                </DataTable>
              </div>
            </TabPanel>

            <TabPanel header="🎨 Theme Management">
              <div class="space-y-6">
                <div class="flex items-center justify-between">
                  <h2 class="text-xl font-semibold text-color">Theme Management</h2>
                  <Button
                    label="Create Theme"
                    @click="showCreateThemeModal = true"
                  />
                </div>

                <!-- Themes Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card
                    v-for="theme in themes"
                    :key="theme.id"
                    class="hover:shadow-md transition-shadow"
                  >
                    <template #content>
                      <div class="space-y-4">
                        <!-- Theme Preview -->
                        <div class="w-full h-32 rounded-lg overflow-hidden" :style="{ backgroundColor: theme.primary_color }">
                          <div class="w-full h-full flex items-center justify-center">
                            <div class="text-center">
                              <i class="pi pi-book text-2xl text-white mb-2"></i>
                              <p class="text-white text-sm font-medium">{{ theme.name }}</p>
                            </div>
                          </div>
                        </div>

                        <div class="space-y-3">
                          <div>
                            <h3 class="text-lg font-semibold text-color">{{ theme.name }}</h3>
                            <p class="text-sm text-color-secondary">{{ theme.description }}</p>
                          </div>

                          <div class="space-y-2">
                            <div class="flex justify-between text-xs">
                              <span class="text-color-secondary">Primary:</span>
                              <div class="w-4 h-4 rounded" :style="{ backgroundColor: theme.primary_color }"></div>
                            </div>
                            <div class="flex justify-between text-xs">
                              <span class="text-color-secondary">Secondary:</span>
                              <div class="w-4 h-4 rounded" :style="{ backgroundColor: theme.secondary_color }"></div>
                            </div>
                            <div class="flex justify-between text-xs">
                              <span class="text-color-secondary">Accent:</span>
                              <div class="w-4 h-4 rounded" :style="{ backgroundColor: theme.accent_color }"></div>
                            </div>
                          </div>

                          <!-- Actions -->
                          <div class="flex items-center justify-between pt-3 border-t border-surface-border">
                            <div class="flex items-center space-x-2">
                              <Button
                                v-if="!theme.active"
                                label="Activate"
                                severity="success"
                                size="small"
                                @click="activateTheme(theme.id)"
                              />
                              <Button
                                v-else
                                label="Deactivate"
                                severity="secondary"
                                size="small"
                                @click="deactivateTheme(theme.id)"
                              />
                            </div>
                            <Tag
                              :value="theme.active ? 'Active' : 'Inactive'"
                              :severity="theme.active ? 'success' : 'secondary'"
                            />
                          </div>
                        </div>
                      </div>
                    </template>
                  </Card>
                </div>
              </div>
            </TabPanel>
          </TabView>
        </template>
      </Card>
    </div>

    <!-- Create Theme Modal -->
    <Dialog
      v-model:visible="showCreateThemeModal"
      modal
      header="Create New Theme"
      :style="{ width: '500px' }"
    >
      <div class="space-y-4">
        <div class="field">
          <label class="block text-sm font-medium text-color mb-1">Theme Name</label>
          <InputText
            v-model="newTheme.name"
            placeholder="Enter theme name"
            class="w-full"
          />
        </div>

        <div class="field">
          <label class="block text-sm font-medium text-color mb-1">Description</label>
          <Textarea
            v-model="newTheme.description"
            placeholder="Enter theme description"
            rows="3"
            class="w-full"
          />
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div class="field">
            <label class="block text-sm font-medium text-color mb-1">Primary Color</label>
            <ColorPicker
              v-model="newTheme.primary_color"
              class="w-full"
            />
          </div>

          <div class="field">
            <label class="block text-sm font-medium text-color mb-1">Secondary Color</label>
            <ColorPicker
              v-model="newTheme.secondary_color"
              class="w-full"
            />
          </div>

          <div class="field">
            <label class="block text-sm font-medium text-color mb-1">Accent Color</label>
            <ColorPicker
              v-model="newTheme.accent_color"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <Button
            label="Cancel"
            severity="secondary"
            @click="showCreateThemeModal = false"
          />
          <Button
            label="Create Theme"
            :loading="creatingTheme"
            :disabled="!newTheme.name"
            @click="createTheme"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
// Set the layout for this page
definePageMeta({
  layout: 'default',
  middleware: ['auth', 'editor']
})

const { $toast } = useNuxtApp()
const db = useDatabase()

// Reactive data
const activeTabIndex = ref(0)
const assets = ref([])
const books = ref([])
const themes = ref([])
const stats = ref({
  pendingAssets: 0,
  reviewedAssets: 0,
  memoryBooks: 0,
  activeThemes: 0
})

// Filters
const assetSearch = ref('')
const assetStatusFilter = ref('all')
const bookSearch = ref('')
const bookStatusFilter = ref('all')

// Theme management
const showCreateThemeModal = ref(false)
const creatingTheme = ref(false)
const newTheme = ref({
  name: '',
  description: '',
  primary_color: '#6366f1',
  secondary_color: '#8b5cf6',
  accent_color: '#ec4899'
})

// Options
const statusOptions = ref([
  { label: 'All Status', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' }
])

const bookStatusOptions = ref([
  { label: 'All Status', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Ready', value: 'ready' },
  { label: 'Approved', value: 'approved' }
])

// Computed properties
const filteredAssets = computed(() => {
  let filtered = [...assets.value]

  // Apply search filter
  if (assetSearch.value) {
    const search = assetSearch.value.toLowerCase()
    filtered = filtered.filter(asset => 
      asset.user_caption?.toLowerCase().includes(search) ||
      asset.ai_caption?.toLowerCase().includes(search) ||
      asset.profiles?.first_name?.toLowerCase().includes(search) ||
      asset.profiles?.last_name?.toLowerCase().includes(search)
    )
  }

  // Apply status filter
  if (assetStatusFilter.value !== 'all') {
    filtered = filtered.filter(asset => {
      if (assetStatusFilter.value === 'pending') return !asset.approved
      if (assetStatusFilter.value === 'approved') return asset.approved
      if (assetStatusFilter.value === 'rejected') return asset.rejected
      return true
    })
  }

  return filtered
})

const filteredBooks = computed(() => {
  let filtered = [...books.value]

  // Apply search filter
  if (bookSearch.value) {
    const search = bookSearch.value.toLowerCase()
    filtered = filtered.filter(book => 
      book.title?.toLowerCase().includes(search)
    )
  }

  // Apply status filter
  if (bookStatusFilter.value !== 'all') {
    filtered = filtered.filter(book => book.status === bookStatusFilter.value)
  }

  return filtered
})

// Load data
onMounted(async () => {
  await loadAssets()
  await loadBooks()
  await loadThemes()
  await loadStats()
})

// Load assets
const loadAssets = async () => {
  try {
    const allAssets = await db.editor.getAssets()
    assets.value = allAssets
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

// Load books
const loadBooks = async () => {
  try {
    const allBooks = await db.editor.getBooks()
    books.value = allBooks
  } catch (error) {
    console.error('Error loading books:', error)
    $toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load books',
      life: 3000
    })
  }
}

// Load themes
const loadThemes = async () => {
  try {
    const allThemes = await db.editor.getThemes()
    themes.value = allThemes
  } catch (error) {
    console.error('Error loading themes:', error)
    $toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load themes',
      life: 3000
    })
  }
}

// Load stats
const loadStats = async () => {
  try {
    const editorStats = await db.editor.getStats()
    stats.value = editorStats
  } catch (error) {
    console.error('Error loading stats:', error)
    $toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load statistics',
      life: 3000
    })
  }
}

// Asset actions
const approveAsset = async (assetId) => {
  try {
    await db.editor.approveAsset(assetId)
    
    $toast.add({
      severity: 'success',
      summary: 'Approved',
      detail: 'Asset approved successfully',
      life: 2000
    })

    // Reload assets and stats
    await loadAssets()
    await loadStats()
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

const rejectAsset = async (assetId) => {
  try {
    await db.editor.rejectAsset(assetId)
    
    $toast.add({
      severity: 'success',
      summary: 'Rejected',
      detail: 'Asset rejected',
      life: 2000
    })

    // Reload assets and stats
    await loadAssets()
    await loadStats()
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

// Book actions
const downloadBook = async (book) => {
  try {
    const pdfUrl = await db.editor.downloadBook(book.id)
    
    // Create download link
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = `memory-book-${book.id.slice(-6)}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    $toast.add({
      severity: 'success',
      summary: 'Downloaded',
      detail: 'Book downloaded successfully',
      life: 3000
    })
  } catch (error) {
    console.error('Error downloading book:', error)
    $toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to download book',
      life: 3000
    })
  }
}

const generateBook = async (book) => {
  try {
    await db.editor.generateBook(book.id)
    
    $toast.add({
      severity: 'success',
      summary: 'Generated',
      detail: 'Book generated successfully',
      life: 3000
    })

    // Reload books
    await loadBooks()
  } catch (error) {
    console.error('Error generating book:', error)
    $toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to generate book',
      life: 3000
    })
  }
}

const viewBookDetails = (book) => {
  // Navigate to book details page
  navigateTo(`/app/memory-books/${book.id}`)
}

// Theme actions
const createTheme = async () => {
  if (!newTheme.value.name) return

  creatingTheme.value = true

  try {
    await db.editor.createTheme(newTheme.value)
    
    $toast.add({
      severity: 'success',
      summary: 'Created',
      detail: 'Theme created successfully',
      life: 3000
    })

    // Reset form and close modal
    newTheme.value = {
      name: '',
      description: '',
      primary_color: '#6366f1',
      secondary_color: '#8b5cf6',
      accent_color: '#ec4899'
    }
    showCreateThemeModal.value = false

    // Reload themes
    await loadThemes()

  } catch (error) {
    console.error('Error creating theme:', error)
    $toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create theme',
      life: 3000
    })
  } finally {
    creatingTheme.value = false
  }
}

const activateTheme = async (themeId) => {
  try {
    await db.editor.activateTheme(themeId)
    
    $toast.add({
      severity: 'success',
      summary: 'Activated',
      detail: 'Theme activated successfully',
      life: 2000
    })

    // Reload themes
    await loadThemes()
  } catch (error) {
    console.error('Error activating theme:', error)
    $toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to activate theme',
      life: 3000
    })
  }
}

const deactivateTheme = async (themeId) => {
  try {
    await db.editor.deactivateTheme(themeId)
    
    $toast.add({
      severity: 'success',
      summary: 'Deactivated',
      detail: 'Theme deactivated successfully',
      life: 2000
    })

    // Reload themes
    await loadThemes()
  } catch (error) {
    console.error('Error deactivating theme:', error)
    $toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to deactivate theme',
      life: 3000
    })
  }
}

// Helper functions
const getBookStatusText = (status) => {
  const statusMap = {
    'draft': 'Draft',
    'ready': 'Ready',
    'approved': 'Approved',
    'archived': 'Archived'
  }
  return statusMap[status] || status
}

const getBookStatusSeverity = (status) => {
  const severityMap = {
    'draft': 'warning',
    'ready': 'info',
    'approved': 'success',
    'archived': 'secondary'
  }
  return severityMap[status] || 'info'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Unknown date'
  }
}
</script> 