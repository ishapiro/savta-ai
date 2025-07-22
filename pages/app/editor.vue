<template>
  <div class="min-h-screen surface-ground p-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-color mb-2">Editor Dashboard</h1>
        <p class="text-color-secondary">Manage themes and review user submissions.</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 text-blue-600">
              <i class="pi pi-image text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Pending Assets</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.pendingAssets }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 text-green-600">
              <i class="pi pi-check-circle text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Reviewed Assets</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.reviewedAssets }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-purple-100 text-purple-600">
              <i class="pi pi-book text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Memory Books</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.memoryBooks }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-orange-100 text-orange-600">
              <i class="pi pi-palette text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Active Themes</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.activeThemes }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <TabView v-model:activeIndex="activeTabIndex">
        <!-- Asset Review Tab -->
        <TabPanel header="Asset Review">
          <!-- Asset Review Instructions and Filter -->
          <div class="mb-4">
            <div class="mb-2 text-sm text-gray-700 font-medium">
              To review assets, you must select a user by their email address below.
            </div>
            <div class="flex items-center gap-4">
              <AutoComplete
                id="user-search"
                v-model="selectedUser"
                :suggestions="userSuggestions"
                @complete="searchUsers"
                optionLabel="email"
                :optionDisabled="option => !option.user_id"
                placeholder="Type to search users..."
                class="w-80"
                inputClass="w-full h-11 px-4 py-2 text-base rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                :dropdown="true"
                :forceSelection="true"
                field="email"
                :itemTemplate="user => `${user.email?.split('@')[0] || ''} (${user.first_name || ''} ${user.last_name || ''})`"
              />
              <div class="flex items-center gap-2">
                <input type="checkbox" v-model="showOnlyUnapprovedUsers" id="showOnlyUnapprovedUsers" />
                <label for="showOnlyUnapprovedUsers" class="text-sm text-gray-700">Show only users with unapproved assets</label>
              </div>
            </div>
          </div>

          <!-- User Summary Header -->
          <div v-if="selectedUser && selectedUser.user_id" class="mb-4 p-4 bg-surface-100 rounded-lg flex flex-col sm:flex-row sm:items-center gap-2">
            <div class="font-semibold text-color">User: <span class="text-primary">{{ selectedUser.email }}</span></div>
            <div class="text-sm text-gray-700">Total Assets: <span class="font-bold">{{ userAssetStats.total }}</span></div>
            <div class="text-sm text-gray-700">Approved Assets: <span class="font-bold">{{ userAssetStats.approved }}</span></div>
          </div>

          <!-- Assets Data Table (only if user selected) -->
          <div v-if="selectedUser && selectedUser.user_id">
            <DataTable
              :value="filteredAssets"
              :paginator="true"
              :rows="10"
              :rowsPerPageOptions="[5, 10, 20, 50]"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} assets"
              responsiveLayout="scroll"
              class="p-datatable-sm"
            >
              <Column header="Photo" style="width: 48px; min-width: 48px; max-width: 48px;">
                <template #body="{ data }">
                  <div class="w-12 h-12 flex items-center justify-center overflow-hidden rounded bg-surface-100 border border-gray-200">
                    <img
                      v-if="data.storage_url"
                      :src="data.storage_url"
                      alt="Asset thumbnail"
                      class="object-cover w-full h-full"
                      style="max-width: 40px; max-height: 40px; min-width: 40px; min-height: 40px;"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center text-color-secondary">
                      <i class="pi pi-image text-lg"></i>
                    </div>
                  </div>
                </template>
              </Column>
              <Column field="user_caption" header="Caption" sortable>
                <template #body="{ data }">
                  <div class="text-sm text-color">{{ data.user_caption || 'No caption' }}</div>
                  <div v-if="data.ai_caption" class="text-xs text-color-secondary italic mt-1">{{ data.ai_caption }}</div>
                </template>
              </Column>
              <Column field="tags" header="Tags">
                <template #body="{ data }">
                  <div class="flex flex-wrap gap-1">
                    <Chip
                      v-for="tag in data.tags"
                      :key="tag"
                      :label="tag"
                      class="text-[10px]"
                    />
                  </div>
                </template>
              </Column>
              <Column field="status" header="Status" sortable>
                <template #body="{ data }">
                  <Tag
                    :value="data.approved ? 'Approved' : (data.rejected ? 'Rejected' : 'Pending')"
                    :severity="data.approved ? 'success' : (data.rejected ? 'danger' : 'warning')"
                  />
                </template>
              </Column>
              <Column header="Actions">
                <template #body="{ data }">
                  <div class="flex items-center space-x-2">
                    <Button
                      v-if="!data.approved"
                      label="Approve"
                      severity="success"
                      size="small"
                      class="text-xs px-2 py-1"
                      @click="approveAsset(data.id)"
                    />
                    <Button
                      v-else
                      label="Reject"
                      severity="danger"
                      size="small"
                      class="text-xs px-2 py-1"
                      @click="rejectAsset(data.id)"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
        </TabPanel>

        <!-- Memory Books Tab -->
        <TabPanel header="Memory Books">
          <div class="space-y-4">
            <!-- Memory Books Instructions and Filter -->
            <div class="mb-4">
              <div class="mb-2 text-sm text-gray-700 font-medium">
                To review memory books, you must select a user by their email address below.
              </div>
              <div class="flex items-center gap-4">
                <AutoComplete
                  v-model="selectedUser"
                  :suggestions="userSuggestions"
                  @complete="searchUsers"
                  optionLabel="email"
                  :optionDisabled="option => !option.user_id"
                  placeholder="Type to search users..."
                  class="w-80"
                  inputClass="w-full h-11 px-4 py-2 text-base rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                  :dropdown="true"
                  :forceSelection="true"
                  field="email"
                  :itemTemplate="user => `${user.email?.split('@')[0] || ''} (${user.first_name || ''} ${user.last_name || ''})`"
                />
                <div class="flex items-center gap-2">
                  <input type="checkbox" v-model="showOnlyUnapprovedUsers" id="showOnlyUnapprovedUsers" />
                  <label for="showOnlyUnapprovedUsers" class="text-sm text-gray-700">Show only users with unapproved memory books</label>
                </div>
              </div>
            </div>

            <!-- User Summary Header -->
            <div v-if="selectedUser && selectedUser.user_id" class="mb-4 p-4 bg-surface-100 rounded-lg flex flex-col sm:flex-row sm:items-center gap-2">
              <div class="font-semibold text-color">User: <span class="text-primary">{{ selectedUser.email }}</span></div>
              <div class="text-sm text-gray-700">Total Memory Books: <span class="font-bold">{{ userBookStats.total }}</span></div>
              <div class="text-sm text-gray-700">Approved Memory Books: <span class="font-bold">{{ userBookStats.approved }}</span></div>
            </div>

            <!-- Books Table (only if user selected) -->
            <div v-if="selectedUser && selectedUser.user_id">
              <!-- Filters -->
              <div class="flex flex-wrap gap-4 mb-4">
                <InputText
                  v-model="bookSearch"
                  placeholder="Search books..."
                  class="w-64"
                  inputClass="w-full h-11 px-4 py-2 text-base rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <Dropdown
                  v-model="bookStatusFilter"
                  :options="bookStatusOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Filter by status"
                  class="w-48"
                  inputClass="w-full h-11 px-4 py-2 text-base rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                />
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
                    <div class="font-medium text-color">{{ data.title || 'Untitled' }}</div>
                    <div class="text-sm text-color-secondary">by {{ data.profile?.email || 'Unknown' }}</div>
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
                    {{ formatDate(data.created_at) }}
                  </template>
                </Column>
                <Column header="Actions">
                  <template #body="{ data }">
                    <div class="flex items-center space-x-2">
                      <Button
                        v-if="data.status === 'draft'"
                        label="Generate"
                        severity="info"
                        size="small"
                        class="text-xs px-2 py-1"
                        @click="generateBook(data)"
                      />
                      <Button
                        v-if="data.pdf_url"
                        label="Download"
                        severity="success"
                        size="small"
                        class="text-xs px-2 py-1"
                        @click="downloadBook(data)"
                      />
                      <Button
                        label="View"
                        severity="secondary"
                        size="small"
                        class="text-xs px-2 py-1"
                        @click="viewBookDetails(data)"
                      />
                    </div>
                  </template>
                </Column>
              </DataTable>
            </div>
          </div>
        </TabPanel>

        <!-- Themes Tab -->
        <TabPanel header="Themes">
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-semibold text-color">Manage Themes</h3>
              <Button
                label="Create New Theme"
                icon="pi pi-plus"
                @click="showCreateThemeModal = true"
              />
            </div>

            <!-- Themes Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="theme in themes"
                :key="theme.id"
                class="bg-white p-4 rounded-lg shadow border"
              >
                <div class="flex items-center justify-between mb-3">
                  <h4 class="font-semibold text-color">{{ theme.name }}</h4>
                  <Tag
                    :value="theme.is_active ? 'Active' : 'Inactive'"
                    :severity="theme.is_active ? 'success' : 'secondary'"
                  />
                </div>
                <p class="text-sm text-color-secondary mb-3">{{ theme.description || 'No description' }}</p>
                <div class="flex items-center space-x-2">
                  <Button
                    v-if="!theme.is_active"
                    label="Activate"
                    severity="success"
                    size="small"
                    class="text-xs px-2 py-1"
                    @click="activateTheme(theme.id)"
                  />
                  <Button
                    v-else
                    label="Deactivate"
                    severity="warning"
                    size="small"
                    class="text-xs px-2 py-1"
                    @click="deactivateTheme(theme.id)"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
      </TabView>
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

        <div class="field">
          <label class="block text-sm font-medium text-color mb-1">Preview Image URL</label>
          <InputText
            v-model="newTheme.preview_image_url"
            placeholder="Paste preview image URL"
            class="w-full"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="field">
            <label class="block text-sm font-medium text-color mb-1">Background Color</label>
            <InputText
              v-model="newTheme.background_color"
              placeholder="#fffbe9"
              class="w-full"
            />
          </div>
          <div class="field">
            <label class="block text-sm font-medium text-color mb-1">Background Opacity</label>
            <InputText
              v-model.number="newTheme.background_opacity"
              type="number"
              min="0" max="100"
              placeholder="100"
              class="w-full"
            />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div class="field">
            <label class="block text-sm font-medium text-color mb-1">Header Font</label>
            <InputText
              v-model="newTheme.header_font"
              placeholder="e.g. Dancing Script"
              class="w-full"
            />
          </div>
          <div class="field">
            <label class="block text-sm font-medium text-color mb-1">Body Font</label>
            <InputText
              v-model="newTheme.body_font"
              placeholder="e.g. Georgia"
              class="w-full"
            />
          </div>
          <div class="field">
            <label class="block text-sm font-medium text-color mb-1">Signature Font</label>
            <InputText
              v-model="newTheme.signature_font"
              placeholder="e.g. Dancing Script"
              class="w-full"
            />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div class="field">
            <label class="block text-sm font-medium text-color mb-1">Header Font Color</label>
            <InputText
              v-model="newTheme.header_font_color"
              placeholder="#222"
              class="w-full"
            />
          </div>
          <div class="field">
            <label class="block text-sm font-medium text-color mb-1">Body Font Color</label>
            <InputText
              v-model="newTheme.body_font_color"
              placeholder="#222"
              class="w-full"
            />
          </div>
          <div class="field">
            <label class="block text-sm font-medium text-color mb-1">Signature Font Color</label>
            <InputText
              v-model="newTheme.signature_font_color"
              placeholder="#222"
              class="w-full"
            />
          </div>
        </div>

        <div class="field">
          <label class="block text-sm font-medium text-color mb-1">Layout Config (JSON)</label>
          <Textarea
            v-model="newTheme.layout_config"
            placeholder='{"type":"horizontal","areas":[{"type":"image","x":0.05,"y":0.05,"width":0.4,"height":0.4}]}'
            rows="4"
            class="w-full font-mono text-xs"
          />
        </div>

        <div class="flex items-center space-x-2">
          <input type="checkbox" v-model="newTheme.is_active" id="is_active" />
          <label for="is_active" class="text-sm text-color">Active</label>
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

import { useToast } from 'primevue/usetoast'

const db = useDatabase()
const toast = useToast()

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
  preview_image_url: '',
  is_active: true,
  background_color: '#fffbe9',
  background_opacity: 100,
  header_font: '',
  body_font: '',
  signature_font: '',
  header_font_color: '',
  body_font_color: '',
  signature_font_color: '',
  layout_config: ''
})

// Add userSearch to script
const userSearch = ref('')

// Add to script
import { ref, onMounted } from 'vue'
const router = useRouter()
const selectedUser = ref(null)
const userSuggestions = ref([])

const showOnlyUnapprovedUsers = ref(true)

const userAssetStats = computed(() => {
  if (!selectedUser.value || !selectedUser.value.user_id) return { total: 0, approved: 0 }
  const userAssets = assets.value.filter(a => a.user_id === selectedUser.value.user_id)
  return {
    total: userAssets.length,
    approved: userAssets.filter(a => a.approved).length
  }
})

const userBookStats = computed(() => {
  if (!selectedUser.value || !selectedUser.value.user_id) return { total: 0, approved: 0 }
  const userBooks = books.value.filter(b => b.user_id === selectedUser.value.user_id)
  return {
    total: userBooks.length,
    approved: userBooks.filter(b => b.status === 'approved').length
  }
})

// Update searchUsers to respect showOnlyUnapprovedUsers
async function searchUsers(event) {
  const q = event.query?.trim()
  if (!q) {
    userSuggestions.value = []
    return
  }
  try {
    let url = `/api/users/search?q=${encodeURIComponent(q)}`
    if (showOnlyUnapprovedUsers.value) {
      url += '&unapprovedOnly=true'
    }
    const res = await fetch(url)
    userSuggestions.value = await res.json()
  } catch (e) {
    userSuggestions.value = []
  }
}

// Load assets for selected user
const loadUserAssets = async (userId) => {
  try {
    const res = await fetch(`/api/users/${userId}/assets`)
    if (!res.ok) {
      throw new Error('Failed to fetch user assets')
    }
    const userAssets = await res.json()
    assets.value = userAssets
  } catch (error) {
    console.error('Error loading user assets:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load user assets',
      life: 3000
    })
    assets.value = []
  }
}

// Load memory books for selected user
const loadUserBooks = async (userId) => {
  try {
    const res = await fetch(`/api/users/${userId}/memory-books`)
    if (!res.ok) {
      throw new Error('Failed to fetch user memory books')
    }
    const userBooks = await res.json()
    books.value = userBooks
  } catch (error) {
    console.error('Error loading user memory books:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load user memory books',
      life: 3000
    })
    books.value = []
  }
}

// Watch for user selection
watch(selectedUser, async (newUser) => {
  if (newUser && newUser.user_id) {
    console.log('[User Selected] Loading data for user:', newUser.email, 'ID:', newUser.user_id)
    // Load data based on active tab
    if (activeTabIndex.value === 0) {
      // Asset Review tab
      await loadUserAssets(newUser.user_id)
    } else if (activeTabIndex.value === 1) {
      // Memory Books tab
      await loadUserBooks(newUser.user_id)
    }
  } else {
    assets.value = []
    books.value = []
  }
})

// Watch for tab changes to load appropriate data
watch(activeTabIndex, async (newIndex) => {
  console.log('[Tab Change] activeTabIndex:', newIndex)
  if (selectedUser.value && selectedUser.value.user_id) {
    if (newIndex === 0) {
      // Asset Review tab
      console.log('[Tab Change] Asset Review tab activated, loading user assets')
      await loadUserAssets(selectedUser.value.user_id)
    } else if (newIndex === 1) {
      // Memory Books tab
      console.log('[Tab Change] Memory Books tab activated, loading user books')
      await loadUserBooks(selectedUser.value.user_id)
    }
  }
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
  if (!selectedUser.value || !selectedUser.value.user_id) return []
  let filtered = [...assets.value]

  // Apply search filter
  if (assetSearch.value) {
    const search = assetSearch.value.toLowerCase()
    filtered = filtered.filter(asset => 
      asset.user_caption?.toLowerCase().includes(search) ||
      asset.ai_caption?.toLowerCase().includes(search)
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
  if (!selectedUser.value || !selectedUser.value.user_id) return []
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

  const toast = useToast()
  toast.add({
    severity: 'success',
    summary: 'Hello',
    detail: 'You are in editor mode',
    life: 3000
  })

  // Check for tab query parameter and set active tab
  const route = useRoute()
  if (route.query.tab) {
    const tabIndex = parseInt(route.query.tab)
    if (tabIndex >= 0 && tabIndex <= 2) {
      activeTabIndex.value = tabIndex
    }
  }
  
  // Check for userId query parameter and restore selected user
  if (route.query.userId) {
    const userId = route.query.userId
    try {
      // Fetch user info by ID to restore the selected user
      const res = await fetch(`/api/users/${userId}/info`)
      if (res.ok) {
        const userInfo = await res.json()
        selectedUser.value = userInfo
        console.log('Restored selected user:', userInfo.email)
      }
    } catch (error) {
      console.error('Error restoring user:', error)
    }
  }
  
  await loadThemes()
  await loadStats()
})

// Load themes
const loadThemes = async () => {
  try {
    const allThemes = await db.editor.getThemes()
    themes.value = allThemes
  } catch (error) {
    console.error('Error loading themes:', error)
    toast.add({
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
    toast.add({
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
    
    toast.add({
      severity: 'success',
      summary: 'Approved',
      detail: 'Asset approved successfully',
      life: 2000
    })

    // Reload assets for current user and stats
    if (selectedUser.value?.user_id) {
      await loadUserAssets(selectedUser.value.user_id)
    }
    await loadStats()
  } catch (error) {
    console.error('Error approving asset:', error)
    toast.add({
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
    
    toast.add({
      severity: 'success',
      summary: 'Rejected',
      detail: 'Asset rejected',
      life: 2000
    })

    // Reload assets for current user and stats
    if (selectedUser.value?.user_id) {
      await loadUserAssets(selectedUser.value.user_id)
    }
    await loadStats()
  } catch (error) {
    console.error('Error rejecting asset:', error)
    toast.add({
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

    toast.add({
      severity: 'success',
      summary: 'Downloaded',
      detail: 'Book downloaded successfully',
      life: 3000
    })
  } catch (error) {
    console.error('Error downloading book:', error)
    toast.add({
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
    
    toast.add({
      severity: 'success',
      summary: 'Generated',
      detail: 'Book generated successfully',
      life: 3000
    })

    // Reload books for current user
    if (selectedUser.value?.user_id) {
      await loadUserBooks(selectedUser.value.user_id)
    }
  } catch (error) {
    console.error('Error generating book:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to generate book',
      life: 3000
    })
  }
}

const viewBookDetails = (book) => {
  const queryParams = { userId: selectedUser.value?.user_id }
  router.push({ path: `/app/memory-books/${book.id}`, query: queryParams })
}

// Theme actions
const createTheme = async () => {
  if (!newTheme.value.name) return

  creatingTheme.value = true

  try {
    const themeToSave = { ...newTheme.value }
    if (themeToSave.layout_config && typeof themeToSave.layout_config === 'string') {
      try {
        themeToSave.layout_config = JSON.parse(themeToSave.layout_config)
      } catch (e) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Layout config must be valid JSON',
          life: 3000
        })
        creatingTheme.value = false
        return
      }
    }
    await db.editor.createTheme(themeToSave)
    toast.add({
      severity: 'success',
      summary: 'Created',
      detail: 'Theme created successfully',
      life: 3000
    })
    // Reset form and close modal
    newTheme.value = {
      name: '',
      description: '',
      preview_image_url: '',
      is_active: true,
      background_color: '#fffbe9',
      background_opacity: 100,
      header_font: '',
      body_font: '',
      signature_font: '',
      header_font_color: '',
      body_font_color: '',
      signature_font_color: '',
      layout_config: ''
    }
    showCreateThemeModal.value = false
    // Reload themes
    await loadThemes()
  } catch (error) {
    console.error('Error creating theme:', error)
    toast.add({
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
    
    toast.add({
      severity: 'success',
      summary: 'Activated',
      detail: 'Theme activated successfully',
      life: 2000
    })

    // Reload themes
    await loadThemes()
  } catch (error) {
    console.error('Error activating theme:', error)
    toast.add({
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
    
    toast.add({
      severity: 'success',
      summary: 'Deactivated',
      detail: 'Theme deactivated successfully',
      life: 2000
    })

    // Reload themes
    await loadThemes()
  } catch (error) {
    console.error('Error deactivating theme:', error)
    toast.add({
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