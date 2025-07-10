<template>
  <div class="min-h-screen surface-ground p-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-color mb-2">Memory Books</h1>
            <p class="text-color-secondary">View and manage your generated memory books.</p>
          </div>
          <Button
            icon="pi pi-refresh"
            label="Refresh"
            severity="secondary"
            size="small"
            @click="loadMemoryBooks"
          />
        </div>
      </div>

      <!-- Create New Book -->
      <Card class="mb-6">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold text-color mb-2">Create New Memory Book</h2>
              <p class="text-color-secondary">Generate a new memory book from your approved assets.</p>
            </div>
            <Button
              label="Create New Book"
              @click="showCreateModal = true"
            />
          </div>
        </template>
      </Card>

      <!-- Memory Books Grid -->
      <div v-if="loadingMemoryBooks" class="flex justify-center items-center py-12">
        <div class="text-center">
          <i class="pi pi-spin pi-spinner text-4xl mb-4 text-primary"></i>
          <p class="text-color-secondary">Loading memory books...</p>
        </div>
      </div>
      
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <Card
          v-for="book in memoryBooks"
          :key="book.id"
          class="bg-white rounded-2xl shadow-xl p-0 flex flex-col justify-between hover:shadow-2xl transition-shadow border border-gray-100 text-xs"
        >
          <template #content>
            <!-- Book Cover -->
            <div class="rounded-t-2xl overflow-hidden flex items-center justify-center h-32 bg-gradient-to-br from-primary-50 to-primary-100">
              <div class="text-center">
                <i class="pi pi-book text-4xl mb-2 block text-primary"></i>
                <p class="text-sm font-medium text-color">Memory Book</p>
              </div>
            </div>
            <div class="flex-1 flex flex-col p-3">
              <div class="mb-1 flex items-center justify-between">
                <h3 class="text-base font-bold text-color">Memory Book #{{ book.id.slice(-6) }}</h3>
                <Tag :value="getStatusText(book.status)" :severity="getStatusSeverity(book.status)" />
              </div>
              <div class="space-y-1 text-xs text-color-secondary mb-2">
                <div class="flex justify-between"><span>Created:</span><span>{{ formatDate(book.created_at) }}</span></div>
                <div v-if="book.generated_at" class="flex justify-between"><span>Generated:</span><span>{{ formatDate(book.generated_at) }}</span></div>
                <div v-if="book.approved_at" class="flex justify-between"><span>Approved:</span><span>{{ formatDate(book.approved_at) }}</span></div>
                <div v-if="book.created_from_assets" class="flex justify-between"><span>Assets:</span><span>{{ book.created_from_assets.length }}</span></div>
              </div>
              <div v-if="book.review_notes" class="surface-100 rounded p-2 text-xs text-color-secondary mb-2">{{ book.review_notes }}</div>
            </div>
            <!-- Action Bar -->
            <div class="rounded-b-2xl bg-gradient-to-r from-blue-100 via-pink-100 to-purple-100 px-4 py-3 flex items-center justify-center gap-6 border-t border-gray-200">
              <button
                v-if="book.status === 'ready'"
                class="p-2 text-green-600 hover:text-green-700 bg-white rounded-full shadow transition-colors"
                v-tooltip.top="'Download PDF'"
                @click="downloadPDF(book)"
              >
                <i class="pi pi-download text-2xl"></i>
              </button>
              <button
                v-if="book.status === 'draft'"
                class="p-2 text-blue-600 hover:text-blue-700 bg-white rounded-full shadow transition-colors"
                v-tooltip.top="'Generate PDF'"
                @click="generatePDF(book)"
              >
                <i class="pi pi-play text-2xl"></i>
              </button>
              <button
                v-if="book.status === 'ready'"
                class="p-2 text-purple-600 hover:text-purple-700 bg-white rounded-full shadow transition-colors"
                v-tooltip.top="'Approve Book'"
                @click="approveBook(book.id)"
              >
                <i class="pi pi-check text-2xl"></i>
              </button>
              <button
                class="p-2 text-gray-600 hover:text-gray-800 bg-white rounded-full shadow transition-colors"
                v-tooltip.top="'View Details'"
                @click="viewBookDetails(book)"
              >
                <i class="pi pi-eye text-2xl"></i>
              </button>
            </div>
          </template>
        </Card>
      </div>

      <!-- Empty State -->
      <div v-if="!loadingMemoryBooks && memoryBooks.length === 0" class="text-center py-12">
        <div class="text-color-secondary mb-4">
          <i class="pi pi-book text-6xl"></i>
        </div>
        <h3 class="text-lg font-medium text-color mb-2">No memory books yet</h3>
        <p class="text-color-secondary mb-4">Create your first memory book from your approved assets.</p>
        <Button
          label="Create Memory Book"
          @click="showCreateModal = true"
        />
      </div>
    </div>

    <!-- Create Memory Book Modal -->
    <Dialog
      v-model:visible="showCreateModal"
      modal
      header="Create New Memory Book"
      :style="{ width: '500px' }"
      :closable="false"
    >
      <div class="space-y-4">
        <div class="field">
          <label class="block text-sm font-medium text-color mb-1">Book Title</label>
          <InputText
            v-model="newBook.title"
            placeholder="Enter a title for your memory book"
            class="w-full"
          />
        </div>

        <div class="field">
          <label class="block text-sm font-medium text-color mb-1">Layout Type</label>
          <Dropdown
            v-model="newBook.layoutType"
            :options="layoutOptions"
            option-label="label"
            option-value="value"
            placeholder="Select layout type"
            class="w-full"
          />
        </div>

        <div class="field">
          <label class="block text-sm font-medium text-color mb-1">Page Count</label>
          <InputNumber
            v-model="newBook.pageCount"
            :min="10"
            :max="100"
            class="w-full"
          />
        </div>

        <div class="field">
          <label class="block text-sm font-medium text-color mb-1">Print Size</label>
          <Dropdown
            v-model="newBook.printSize"
            :options="printSizeOptions"
            option-label="label"
            option-value="value"
            placeholder="Select print size"
            class="w-full"
          />
        </div>

        <div class="field">
          <label class="block text-sm font-medium text-color mb-1">Quality</label>
          <Dropdown
            v-model="newBook.quality"
            :options="qualityOptions"
            option-label="label"
            option-value="value"
            placeholder="Select quality"
            class="w-full"
          />
        </div>

        <div class="field">
          <label class="block text-sm font-medium text-color mb-1">Medium</label>
          <Dropdown
            v-model="newBook.medium"
            :options="mediumOptions"
            option-label="label"
            option-value="value"
            placeholder="Select medium"
            class="w-full"
          />
        </div>

        <div class="field">
          <label class="block text-sm font-medium text-color mb-1">Theme</label>
          <Dropdown
            v-model="newBook.theme"
            :options="themeOptions"
            option-label="label"
            option-value="value"
            placeholder="Select theme"
            class="w-full"
          />
        </div>

        <div class="field">
          <label class="block text-sm font-medium text-color mb-1">Include Captions</label>
          <div class="flex items-center space-x-2">
            <Checkbox
              v-model="newBook.includeCaptions"
              :binary="true"
            />
            <span class="text-sm text-color-secondary">Include AI-generated captions</span>
          </div>
        </div>

        <div class="field">
          <label class="block text-sm font-medium text-color mb-1">Include Tags</label>
          <div class="flex items-center space-x-2">
            <Checkbox
              v-model="newBook.includeTags"
              :binary="true"
            />
            <span class="text-sm text-color-secondary">Include asset tags</span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <Button
            label="Cancel"
            severity="secondary"
            @click="showCreateModal = false"
          />
          <Button
            label="Create Book"
            :loading="creatingBook"
            :disabled="!newBook.title"
            @click="createMemoryBook"
          />
        </div>
      </template>
    </Dialog>

    <!-- Book Details Modal -->
    <Dialog
      v-model:visible="showDetailsModal"
      modal
      header="Memory Book Details"
      :style="{ width: '600px' }"
    >
      <div v-if="selectedBook" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-color mb-1">Book ID</label>
            <p class="text-sm text-color-secondary">{{ selectedBook.id }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-color mb-1">Status</label>
            <Tag
              :value="getStatusText(selectedBook.status)"
              :severity="getStatusSeverity(selectedBook.status)"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-color mb-1">Created</label>
            <p class="text-sm text-color-secondary">{{ formatDate(selectedBook.created_at) }}</p>
          </div>
          <div v-if="selectedBook.generated_at">
            <label class="block text-sm font-medium text-color mb-1">Generated</label>
            <p class="text-sm text-color-secondary">{{ formatDate(selectedBook.generated_at) }}</p>
          </div>
        </div>

        <div v-if="selectedBook.review_notes">
          <label class="block text-sm font-medium text-color mb-1">Review Notes</label>
          <div class="surface-100 rounded p-3">
            <p class="text-sm text-color-secondary">{{ selectedBook.review_notes }}</p>
          </div>
        </div>

        <div v-if="selectedBook.created_from_assets && selectedBook.created_from_assets.length > 0">
          <label class="block text-sm font-medium text-color mb-1">Included Assets</label>
          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="assetId in selectedBook.created_from_assets"
              :key="assetId"
              class="surface-100 rounded p-2 text-xs text-color-secondary"
            >
              Asset #{{ assetId.slice(-6) }}
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <Button
            label="Close"
            severity="secondary"
            @click="showDetailsModal = false"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
// Set the layout for this page
definePageMeta({
  layout: 'default'
})

const { $toast } = useNuxtApp()
const db = useDatabase()
const route = useRoute()

// Reactive data
const memoryBooks = ref([])
const loadingMemoryBooks = ref(true)
const showCreateModal = ref(false)
const showDetailsModal = ref(false)
const selectedBook = ref(null)
const creatingBook = ref(false)

// New book form
const newBook = ref({
  title: '',
  layoutType: 'grid',
  pageCount: 20,
  printSize: '8x10',
  quality: 'standard',
  medium: 'digital',
  theme: 'classic',
  includeCaptions: true,
  includeTags: true
})

// Options for dropdowns
const layoutOptions = ref([
  { label: 'Grid Layout', value: 'grid' },
  { label: 'Timeline Layout', value: 'timeline' },
  { label: 'Story Layout', value: 'story' },
  { label: 'Album Layout', value: 'album' }
])

const printSizeOptions = ref([
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

// Load memory books
onMounted(async () => {
  await loadMemoryBooks()
})

// Load memory books
const loadMemoryBooks = async () => {
  loadingMemoryBooks.value = true
  try {
    const books = await db.memoryBooks.getMemoryBooks()
    memoryBooks.value = books
  } catch (error) {
    console.error('Error loading memory books:', error)
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load memory books',
        life: 3000
      })
    }
  } finally {
    loadingMemoryBooks.value = false
  }
}

// Create memory book
const createMemoryBook = async () => {
  if (!newBook.value.title) return

  creatingBook.value = true

  try {
    // Get approved assets
    const approvedAssets = await db.assets.getAssets({ approved: true })
    
    if (approvedAssets.length === 0) {
      if ($toast && $toast.add) {
        $toast.add({
          severity: 'warn',
          summary: 'No Assets',
          detail: 'No approved assets available for memory book',
          life: 3000
        })
      }
      return
    }

    // Create memory book
    const memoryBook = await db.memoryBooks.createMemoryBook({
      title: newBook.value.title,
      layout_type: newBook.value.layoutType,
      page_count: newBook.value.pageCount,
      print_size: newBook.value.printSize,
      quality: newBook.value.quality,
      medium: newBook.value.medium,
      theme: newBook.value.theme,
      include_captions: newBook.value.includeCaptions,
      include_tags: newBook.value.includeTags,
      created_from_assets: approvedAssets.map(asset => asset.id),
      status: 'draft'
    })

    if ($toast && $toast.add) {
      $toast.add({
        severity: 'success',
        summary: 'Created',
        detail: 'Memory book created successfully',
        life: 3000
      })
    }

    // Reset form and close modal
    newBook.value = {
      title: '',
      layoutType: 'grid',
      pageCount: 20,
      printSize: '8x10',
      quality: 'standard',
      medium: 'digital',
      theme: 'classic',
      includeCaptions: true,
      includeTags: true
    }
    showCreateModal.value = false

    // Reload memory books
    await loadMemoryBooks()

  } catch (error) {
    console.error('Error creating memory book:', error)
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to create memory book',
        life: 3000
      })
    }
  } finally {
    creatingBook.value = false
  }
}

// Generate PDF
const generatePDF = async (book) => {
  try {
    await db.memoryBooks.generateMemoryBook(book.id, book.created_from_assets || [])
    
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'success',
        summary: 'Generated',
        detail: 'PDF generated successfully',
        life: 3000
      })
    }

    // Reload memory books
    await loadMemoryBooks()

  } catch (error) {
    console.error('Error generating PDF:', error)
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to generate PDF',
        life: 3000
      })
    }
  }
}

// Download PDF
const downloadPDF = async (book) => {
  try {
    // Call the API endpoint to get the download URL
    const response = await $fetch(`/api/memory-books/download/${book.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${(await useSupabaseClient().auth.getSession()).data.session?.access_token}`
      }
    })
    
    if (!response.success || !response.downloadUrl) {
      throw new Error('Failed to get download URL')
    }
    
    // Create download link
    const link = document.createElement('a')
    link.href = response.downloadUrl
    link.download = `memory-book-${book.id.slice(-6)}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    if ($toast && $toast.add) {
      $toast.add({
        severity: 'success',
        summary: 'Downloaded',
        detail: 'PDF download started',
        life: 3000
      })
    }

  } catch (error) {
    console.error('Error downloading PDF:', error)
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to download PDF',
        life: 3000
      })
    }
  }
}

// Approve book
const approveBook = async (bookId) => {
  try {
    await db.memoryBooks.updateMemoryBook(bookId, {
      status: 'approved',
      approved_at: new Date().toISOString()
    })

    if ($toast && $toast.add) {
      $toast.add({
        severity: 'success',
        summary: 'Approved',
        detail: 'Memory book approved',
        life: 3000
      })
    }

    // Reload memory books
    await loadMemoryBooks()

  } catch (error) {
    console.error('Error approving book:', error)
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to approve memory book',
        life: 3000
      })
    }
  }
}

// View book details
const viewBookDetails = (book) => {
  selectedBook.value = book
  showDetailsModal.value = true
}

// Get status text
const getStatusText = (status) => {
  const statusMap = {
    'draft': 'Draft',
    'ready': 'Ready',
    'approved': 'Approved',
    'archived': 'Archived'
  }
  return statusMap[status] || status
}

// Get status severity
const getStatusSeverity = (status) => {
  const severityMap = {
    'draft': 'warning',
    'ready': 'info',
    'approved': 'success',
    'archived': 'secondary'
  }
  return severityMap[status] || 'info'
}

// Get status class (legacy)
const getStatusClass = (status) => {
  const classMap = {
    'draft': 'bg-yellow-100 text-yellow-700',
    'ready': 'bg-blue-100 text-blue-700',
    'approved': 'bg-green-100 text-green-700',
    'archived': 'bg-gray-100 text-gray-700'
  }
  return classMap[status] || 'bg-gray-100 text-gray-700'
}

// Format date helper
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