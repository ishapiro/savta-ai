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
          <div class="flex gap-2">
            <Button
              icon="pi pi-refresh"
              label="Refresh"
              severity="secondary"
              size="small"
              @click="loadMemoryBooks"
            />

          </div>
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
                <h3 class="text-base font-bold text-color">{{ book.title || ('Memory Book #' + book.id.slice(-6)) }}</h3>
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
            <div class="rounded-b-2xl bg-gradient-to-r from-blue-100 via-pink-100 to-purple-100 border-t border-gray-200 flex items-center justify-center gap-3 py-2">
              <!-- Download Button -->
              <button
                class="w-10 h-10 flex items-center justify-center rounded-full shadow bg-white text-green-600 hover:text-green-700 transition-colors"
                v-tooltip.top="'Download PDF'"
                @click="onDownloadClick(book)"
              >
                <i class="pi pi-download text-lg"></i>
              </button>
              <!-- Generate Button (only for draft) -->
              <button
                v-if="book.status === 'draft'"
                class="w-10 h-10 flex items-center justify-center rounded-full shadow bg-white text-green-600 hover:text-green-700 transition-colors"
                v-tooltip.top="'Generate memory book'"
                @click="onGenerateClick(book)"
              >
                <i class="pi pi-bolt text-lg text-purple-600"></i>
              </button>
              <!-- Regenerate Button (only for ready) -->
              <button
                v-if="book.status === 'ready'"
                class="w-10 h-10 flex items-center justify-center rounded-full shadow bg-white text-yellow-600 hover:text-yellow-700 transition-colors"
                v-tooltip.top="'Create a new magic AI background'"
                @click="onRegenerateClick(book)"
              >
                <i class="pi pi-refresh text-lg"></i>
              </button>
              <!-- Approve Button -->
              <button
                v-if="book.status === 'ready'"
                class="w-10 h-10 flex items-center justify-center rounded-full shadow bg-white text-purple-600 hover:text-purple-700 transition-colors"
                v-tooltip.top="'Approve this memory book for printing and sharing'"
                @click="approveBook(book.id)"
              >
                <i class="pi pi-check text-lg"></i>
              </button>
              <!-- View Details Button -->
              <button
                class="w-10 h-10 flex items-center justify-center rounded-full shadow bg-white text-gray-600 hover:text-gray-800 transition-colors"
                v-tooltip.top="'View Details'"
                @click="viewBookDetails(book)"
              >
                <i class="pi pi-eye text-lg"></i>
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
      :style="{ width: '100%', maxWidth: '500px', maxHeight: '95vh', padding: '0' }"
      class="!rounded-[16px] !shadow-xl !border-0 !overflow-hidden w-full sm:max-w-[500px]"
      :auto-z-index="false"
      :z-index="1000"
    >
      <div v-if="selectedBook" class="p-2 sm:p-3 bg-white space-y-2">
        <!-- Super Compact Top: Icon, Book #, Status -->
        <div class="flex flex-col items-center mb-1">
          <div class="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-1 hidden sm:flex">
            <i class="pi pi-book text-lg text-purple-600"></i>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-bold text-base text-gray-800">{{ selectedBook.title || ('#' + selectedBook.id.slice(-6)) }}</span>
            <Tag
              :value="getStatusText(selectedBook.status)"
              :severity="getStatusSeverity(selectedBook.status)"
              class="text-xs px-2 py-0.5"
            />
          </div>
        </div>

        <!-- Ultra Compact Info Tags -->
        <div class="flex flex-wrap gap-1 justify-center">
          <div class="flex items-center gap-1 bg-blue-50 rounded-full px-2 py-0.5 border border-blue-200 text-xs">
            <i class="pi pi-calendar text-blue-600 text-xs"></i>
            <span>{{ formatDate(selectedBook.created_at) }}</span>
          </div>
          <div v-if="selectedBook.generated_at" class="flex items-center gap-1 bg-green-50 rounded-full px-2 py-0.5 border border-green-200 text-xs">
            <i class="pi pi-bolt text-purple-600 text-xs"></i>
            <span>{{ formatDate(selectedBook.generated_at) }}</span>
          </div>
          <div v-if="selectedBook.approved_at" class="flex items-center gap-1 bg-purple-50 rounded-full px-2 py-0.5 border border-purple-200 text-xs">
            <i class="pi pi-check-circle text-purple-600 text-xs"></i>
            <span>{{ formatDate(selectedBook.approved_at) }}</span>
          </div>
          <div v-if="selectedBook.created_from_assets && selectedBook.created_from_assets.length > 0" class="flex items-center gap-1 bg-pink-50 rounded-full px-2 py-0.5 border border-pink-200 text-xs">
            <i class="pi pi-images text-pink-600 text-xs"></i>
            <span>{{ selectedBook.created_from_assets.length }} assets</span>
          </div>
        </div>

        <!-- Compact Review Notes -->
        <div v-if="selectedBook.review_notes" class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded p-2 border border-yellow-200 text-xs text-gray-600 italic">
          "{{ selectedBook.review_notes }}"
        </div>

        <!-- Ultra Compact Asset Thumbnails -->
        <div v-if="selectedBook.created_from_assets && selectedBook.created_from_assets.length > 0" class="bg-gradient-to-br from-indigo-50 to-purple-50 rounded p-2 border border-indigo-200">
          <div class="flex items-center mb-1 text-xs text-gray-700 font-semibold">
            <i class="pi pi-images text-indigo-600 mr-1 text-xs"></i>
            Memory Assets
          </div>
          <div class="grid grid-cols-8 sm:grid-cols-6 gap-0.5">
            <div
              v-for="assetId in selectedBook.created_from_assets.slice(0, 16)"
              :key="assetId"
              class="aspect-square bg-white rounded border border-indigo-100 overflow-hidden w-7 h-7 sm:w-9 sm:h-9"
            >
              <img 
                v-if="getAssetThumbnail(assetId)"
                :src="getAssetThumbnail(assetId)"
                :alt="`Asset ${assetId.slice(-4)}`"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-gray-100">
                <i class="pi pi-image text-indigo-400 text-xs"></i>
              </div>
            </div>
            <div v-if="selectedBook.created_from_assets.length > 16" class="aspect-square bg-white rounded border border-indigo-100 flex items-center justify-center text-xs text-gray-500 w-7 h-7 sm:w-9 sm:h-9">
              +{{ selectedBook.created_from_assets.length - 16 }}
            </div>
          </div>
        </div>

        <!-- Compact PDF Section -->
        <div v-if="selectedBook.pdf_url" class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded p-2 border border-emerald-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center text-xs font-semibold text-gray-800">
              <i class="pi pi-file-pdf text-emerald-600 mr-1 text-xs"></i>
              PDF
            </div>
            <button
              class="flex items-center justify-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full px-2 py-1 text-xs shadow"
              @click="viewPDF(selectedBook.pdf_url)"
            >
              <i class="pi pi-external-link text-xs"></i>
              View
            </button>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between items-center p-2 bg-white border-t border-gray-200">
          <div>
            <button
              v-if="selectedBook && selectedBook.status === 'approved'"
              class="flex items-center justify-center gap-1 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full px-3 py-1 text-xs shadow"
              @click="unapproveBook(selectedBook.id)"
            >
              <i class="pi pi-times text-xs"></i>
              Unapprove
            </button>
          </div>
          <div>
            <button
              class="flex items-center justify-center gap-1 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-full px-3 py-1 text-xs shadow"
              @click="showDetailsModal = false"
            >
              <i class="pi pi-times text-xs"></i>
              Close
            </button>
          </div>
        </div>
      </template>
    </Dialog>

    <!-- PDF Progress Dialog -->
    <Dialog
      v-model:visible="showProgressDialog"
      modal
      header="Generating PDF"
      :style="{ width: '400px' }"
      :closable="false"
      :z-index="9999"
    >

      <div class="text-center py-4">
        <div class="mb-4">
          <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
        </div>
        <h3 class="text-lg font-medium text-color mb-2">Processing...</h3>
        <p class="text-color-secondary mb-4">{{ currentProgressMessage }}</p>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="bg-primary h-2 rounded-full transition-all duration-300"
            :style="{ width: currentProgress + '%' }"
          ></div>
        </div>
        <p class="text-sm text-color-secondary mt-2">{{ currentProgress }}% complete</p>
      </div>
    </Dialog>

    <!-- Generate Confirmation Dialog -->
    <Dialog v-model:visible="showGenerateDialog" modal header="Give It Another Magical Spin" :style="{ width: '400px' }">
      <div class="py-4">
        <p>Generate this memory book? This may take a little time.</p>
        <div class="flex justify-end gap-2 mt-4">
          <Button label="Cancel" severity="secondary" @click="cancelDialog" />
          <Button label="Generate" severity="primary" @click="confirmGenerate" />
        </div>
      </div>
    </Dialog>
    <!-- Regenerate Confirmation Dialog -->
    <Dialog v-model:visible="showRegenerateDialog" modal header="" :style="{ width: '440px' }">
      <div class="py-4">
        <p>Regenerate this memory book with a new AI-generated background? If you just want to download the current version, use the download button (faster).</p>
        <div class="flex justify-center gap-4 mt-6">
          <button
            class="flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-full px-7 py-2 text-sm shadow transition-all duration-200 min-w-[150px]"
            @click="cancelDialog"
          >
            <i class="pi pi-times text-base"></i>
            Cancel
          </button>
          <button
            class="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full px-7 py-2 text-sm shadow transition-all duration-200 min-w-[180px]"
            @click="confirmRegenerate"
          >
            <i class="pi pi-refresh text-base"></i>
            Reapply AI Magic
          </button>
        </div>
      </div>
    </Dialog>
    <!-- Download Draft Dialog -->
    <Dialog v-model:visible="showDownloadDraftDialog" modal header="Memory Book Not Generated" :style="{ width: '400px' }">
      <div class="py-4">
        <p>You need to generate the memory book before downloading. Would you like to generate it now? This may take a little time.</p>
        <div class="flex justify-end gap-2 mt-4">
          <Button label="Cancel" severity="secondary" @click="cancelDialog" />
          <Button label="Generate Now" severity="primary" @click="confirmDownloadDraft" />
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

const { $toast } = useNuxtApp()
const db = useDatabase()
const route = useRoute()
// const supabase = useSupabaseClient()
// const user = useSupabaseUser()
const supabase = useNuxtApp().$supabase
let user = null
const { data } = await supabase.auth.getUser()
user = data.user

// Reactive data
const memoryBooks = ref([])
const loadingMemoryBooks = ref(true)
const showCreateModal = ref(false)
const showDetailsModal = ref(false)
const selectedBook = ref(null)
const creatingBook = ref(false)
const assetThumbnails = ref({})

// PDF Progress tracking
const showProgressDialog = ref(false)
const currentProgress = ref(0)
const currentProgressMessage = ref('')
const currentBookId = ref(null)
const progressInterval = ref(null)

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

// Dialog state
const showGenerateDialog = ref(false)
const showRegenerateDialog = ref(false)
const showDownloadDraftDialog = ref(false)
const pendingBook = ref(null)

// Action handlers
const onGenerateClick = (book) => {
  pendingBook.value = book
  showGenerateDialog.value = true
}
const onRegenerateClick = (book) => {
  pendingBook.value = book
  showRegenerateDialog.value = true
}
const onDownloadClick = (book) => {
  if (book.status === 'draft') {
    pendingBook.value = book
    showDownloadDraftDialog.value = true
  } else {
    downloadPDF(book)
  }
}

// Confirm actions
const confirmGenerate = () => {
  showGenerateDialog.value = false
  if (pendingBook.value) generatePDF(pendingBook.value)
  pendingBook.value = null
}
const confirmRegenerate = () => {
  showRegenerateDialog.value = false
  if (pendingBook.value) generatePDF(pendingBook.value)
  pendingBook.value = null
}
const confirmDownloadDraft = () => {
  showDownloadDraftDialog.value = false
  if (pendingBook.value) generatePDF(pendingBook.value)
  pendingBook.value = null
}
const cancelDialog = () => {
  showGenerateDialog.value = false
  showRegenerateDialog.value = false
  showDownloadDraftDialog.value = false
  pendingBook.value = null
}

// Load memory books
onMounted(async () => {
  await loadMemoryBooks()
})

// Cleanup on unmount
onUnmounted(() => {
  stopProgressPolling()
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

// Poll PDF status
const pollPdfStatus = async () => {
  if (!currentBookId.value) return

  try {
    const supabase = useNuxtApp().$supabase
    const { data: sessionData } = await supabase.auth.getSession()

    const response = await $fetch(`/api/memory-books/status/${currentBookId.value}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionData.session?.access_token}`
      }
    })

    console.log('PDF status response:', response)

    if (response) {
      const status = response
      
      // Check if pdf_url is available (PDF is ready for download)
      if (status.pdf_url && status.pdf_url.startsWith('https://')) {
        console.log('✅ PDF URL found, closing dialog:', status.pdf_url)
        currentProgress.value = 100
        currentProgressMessage.value = 'PDF ready for download!'
        
        // Stop polling and close dialog after a short delay
        setTimeout(() => {
          stopProgressPolling()
          showProgressDialog.value = false
          loadMemoryBooks() // Reload to show updated status
        }, 1000)
        return
      }
      
      // Update progress based on status
      if (status.pdf_status === 'generating_background') {
        currentProgress.value = 10
        currentProgressMessage.value = 'Generating custom background image...'
      } else if (status.pdf_status === 'background_ready') {
        currentProgress.value = 20
        currentProgressMessage.value = 'Background ready, generating PDF...'
      } else if (status.pdf_status === 'generating_pdf') {
        currentProgress.value = 50
        currentProgressMessage.value = 'Creating PDF pages...'
      } else if (status.pdf_status === 'finalizing') {
        currentProgress.value = 90
        currentProgressMessage.value = 'Finalizing PDF...'
      } else if (status.pdf_status === 'completed') {
        currentProgress.value = 100
        currentProgressMessage.value = 'PDF generation complete!'
        
        // Stop polling and close dialog after a short delay
        setTimeout(() => {
          stopProgressPolling()
          showProgressDialog.value = false
          loadMemoryBooks() // Reload to show updated status
        }, 1000)
      } else if (status.pdf_status === 'error') {
        currentProgressMessage.value = status.pdf_error || 'PDF generation failed'
        setTimeout(() => {
          stopProgressPolling()
          showProgressDialog.value = false
        }, 2000)
      } else if (status.pdf_status === 'not_started') {
        currentProgress.value = 5
        currentProgressMessage.value = 'Starting PDF generation...'
      } else if (status.pdf_status === 'Creating beautiful background design...') {
        currentProgress.value = 15
        currentProgressMessage.value = 'Creating beautiful background design...'
      } else if (status.pdf_status === 'Downloading background design...') {
        currentProgress.value = 25
        currentProgressMessage.value = 'Downloading background design...'
      } else if (status.pdf_status === 'Saving background to storage...') {
        currentProgress.value = 30
        currentProgressMessage.value = 'Saving background to storage...'
      } else if (status.pdf_status === 'Background ready for PDF generation') {
        currentProgress.value = 35
        currentProgressMessage.value = 'Background ready for PDF generation'
      } else if (status.pdf_status === 'Setting up PDF document...') {
        currentProgress.value = 40
        currentProgressMessage.value = 'Setting up PDF document...'
      } else if (status.pdf_status === 'Background ready, creating pages...') {
        currentProgress.value = 45
        currentProgressMessage.value = 'Background ready, creating pages...'
      } else {
        currentProgressMessage.value = status.pdf_status || 'Processing...'
      }
    } else {
      // Fallback: show generic progress if no status available
      console.log('No status available, showing generic progress')
      if (currentProgress.value < 90) {
        currentProgress.value += 5
        currentProgressMessage.value = 'Processing PDF...'
      }
    }
  } catch (error) {
    console.error('Error polling PDF status:', error)
    // Fallback: show generic progress on error
    if (currentProgress.value < 90) {
      currentProgress.value += 5
      currentProgressMessage.value = 'Processing PDF...'
    }
  }
}

// Start progress polling
const startProgressPolling = (bookId) => {
  console.log('startProgressPolling called with bookId:', bookId)
  currentBookId.value = bookId
  currentProgress.value = 0
  currentProgressMessage.value = 'Starting PDF generation...'
  showProgressDialog.value = true
  console.log('showProgressDialog set to:', showProgressDialog.value)
  
  // Poll every 3 seconds
  progressInterval.value = setInterval(pollPdfStatus, 3000)
  
  // Initial poll
  pollPdfStatus()
  
  // Timeout after 60 seconds to close dialog
  setTimeout(() => {
    if (showProgressDialog.value) {
      console.log('PDF generation timeout, closing dialog')
      stopProgressPolling()
      showProgressDialog.value = false
      loadMemoryBooks() // Reload to check if PDF was actually generated
    }
  }, 60000)
}

// Stop progress polling
const stopProgressPolling = () => {
  if (progressInterval.value) {
    clearInterval(progressInterval.value)
    progressInterval.value = null
  }
  currentBookId.value = null
}

// Generate PDF
const generatePDF = async (book) => {
  console.log('generatePDF called for book:', book.id)
  try {
    // Start progress polling
    console.log('Starting progress polling...')
    startProgressPolling(book.id)
    console.log('Progress dialog should be visible:', showProgressDialog.value)
    
    // For regeneration, clear existing background and PDF URLs first
    if (book.status === 'ready' && (book.background_url || book.pdf_url)) {
      console.log('🔄 Regenerating memory book, clearing existing URLs...')
      try {
        await db.memoryBooks.updateMemoryBook(book.id, {
          background_url: null,
          pdf_url: null,
          status: 'draft'
        })
        console.log('✅ Cleared existing URLs for regeneration')
      } catch (clearError) {
        console.warn('⚠️ Failed to clear existing URLs:', clearError)
        // Continue anyway, the backend will handle it
      }
    }
    
    // Call the API endpoint to generate PDF
    console.log('Calling PDF generation API...')
    const supabase = useNuxtApp().$supabase

    const { data: sessionData } = await supabase.auth.getSession()

    const response = await $fetch(`/api/memory-books/download/${book.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionData.session?.access_token}`
      }
    })
    
    console.log('PDF generation response:', response)
    
    if (!response.success) {
      throw new Error('Failed to generate PDF')
    }

    // The polling will handle the progress updates and dialog closing
    // No need to show success toast here as the dialog will show completion

  } catch (error) {
    console.error('Error generating PDF:', error)
    stopProgressPolling()
    showProgressDialog.value = false
    
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
    const supabase = useNuxtApp().$supabase

    const { data: sessionData } = await supabase.auth.getSession()

    const response = await $fetch(`/api/memory-books/download/${book.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionData.session?.access_token}`
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

// Unapprove book
const unapproveBook = async (bookId) => {
  try {
    await db.memoryBooks.updateMemoryBook(bookId, {
      status: 'ready',
      approved_at: null
    })

    if ($toast && $toast.add) {
      $toast.add({
        severity: 'success',
        summary: 'Unapproved',
        detail: 'Memory book unapproved',
        life: 3000
      })
    }

    // Reload memory books and close modal
    await loadMemoryBooks()
    showDetailsModal.value = false

  } catch (error) {
    console.error('Error unapproving book:', error)
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to unapprove memory book',
        life: 3000
      })
    }
  }
}

// View book details
const viewBookDetails = async (book) => {
  try {
    // Reset state first
    selectedBook.value = null
    showDetailsModal.value = false
    
    // Small delay to ensure clean state
    await new Promise(resolve => setTimeout(resolve, 10))
    
  selectedBook.value = book
  showDetailsModal.value = true
  
  // Load asset thumbnails for this book
  await loadAssetThumbnails(book)
  } catch (error) {
    console.error('Error viewing book details:', error)
    // Fallback: just show the modal without thumbnails
    selectedBook.value = book
    showDetailsModal.value = true
  }
}

// View PDF in new window
const viewPDF = (pdfUrl) => {
  if (pdfUrl) {
    window.open(pdfUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes')
  }
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

// Get asset thumbnail
const getAssetThumbnail = (assetId) => {
  return assetThumbnails.value[assetId] || null
}

// Load asset thumbnails for a book
const loadAssetThumbnails = async (book) => {
  if (!book || !book.created_from_assets || book.created_from_assets.length === 0) return
  
  try {
    // Get assets for this book using the dedicated function
    const bookAssets = await db.assets.getAssetsByBook(book.created_from_assets, 12)
    
    // Store thumbnails in reactive data
    if (bookAssets && Array.isArray(bookAssets)) {
    bookAssets.forEach(asset => {
        if (asset && asset.storage_url) {
        assetThumbnails.value[asset.id] = asset.storage_url
      }
    })
    }
  } catch (error) {
    console.error('Error loading asset thumbnails:', error)
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Unknown date'
  }
}
</script> 