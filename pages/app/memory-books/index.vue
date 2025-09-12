<template>
  <div class="min-h-screen bg-brand-background p-4 no-zoom">
    <div class="max-w-7xl mx-auto">
      <!-- Clean Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div class="flex items-center gap-3">
          <h1 class="text-2xl lg:text-3xl font-bold text-brand-primary">Memory Studio</h1>
          <button
            data-testid="info-button"
            data-savta="memory-books-info"
            class="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50 transition-colors focus:outline-none"
            @click="showMemoryBooksInfoBubble = true"
            aria-label="Information about memory cards and booklets"
            title="Ask Savta"
          >
            <i class="pi pi-info text-base text-brand-highlight"></i>
          </button>
        </div>
        
        <!-- View Toggle -->
        <ViewToggle 
          v-model:active-view="activeView" 
          @update:active-view="onViewChange"
        />
        
        <button
          data-testid="trash-button"
          class="w-8 h-8 flex items-center justify-center rounded-full bg-brand-accent shadow-sm hover:bg-brand-accent/80 transition-colors focus:outline-none self-end sm:self-auto"
          @click="navigateToTrash"
          aria-label="View trash"
          v-tooltip.top="'View Trash'"
        >
          <i class="pi pi-trash text-base text-white"></i>
        </button>
      </div>

      <!-- Dynamic Hero Section -->
      <MemoryStudioHero 
        :active-view="activeView"
        @create-card="openMagicMemoryDialog('quick')"
        @create-book="showCreateModal = true"
      />

      <!-- Dynamic Listing Section -->
      <div class="mb-12">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-semibold text-brand-primary">
            {{ activeView === 'cards' ? 'Your Memory Cards' : 'Your Memory Books' }}
          </h2>
          <div class="text-sm text-brand-text-muted">
            {{ currentItems.length }} {{ activeView === 'cards' ? 'card' : 'book' }}{{ currentItems.length !== 1 ? 's' : '' }}
          </div>
        </div>
        
        <!-- Loading State -->
        <div v-if="loadingMemoryBooks" class="flex justify-center items-center py-12">
          <div class="text-center">
            <i class="pi pi-spin pi-spinner text-3xl mb-4 text-brand-highlight"></i>
            <p class="text-base text-brand-text-muted">
              Loading {{ activeView === 'cards' ? 'memory cards' : 'memory books' }}...
            </p>
          </div>
        </div>

        <!-- Items Grid -->
        <div v-else-if="currentItems.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <!-- Memory Cards -->
          <MemoryCard
            v-if="activeView === 'cards'"
            v-for="card in paginatedCurrentItems"
            :key="card.id"
            :card="card"
            @generate="onGenerateClick"
            @approve="approveBook"
            @unapprove="unapproveBook"
            @download="onDownloadClick"
            @view-details="viewBookDetails"
          />
          
          <!-- Memory Books -->
          <MemoryBook
            v-else
            v-for="book in paginatedCurrentItems"
            :key="book.id"
            :book="book"
            @generate="onGenerateClick"
            @approve="approveBook"
            @unapprove="unapproveBook"
            @view="viewBook"
            @edit="editBook"
            @delete="deleteBook"
          />
        </div>

        <!-- Pagination -->
        <MemoryStudioPagination
          v-if="currentItems.length > currentPagination.perPage"
          :current-page="currentPagination.page"
          :total-pages="currentTotalPages"
          :total-items="currentItems.length"
          :items-per-page="currentPagination.perPage"
          :active-view="activeView"
          @previous-page="onPreviousPage"
          @next-page="onNextPage"
          @go-to-page="onGoToPage"
        />

        <!-- Empty State -->
        <MemoryStudioEmptyState
          v-else-if="!loadingMemoryBooks && currentItems.length === 0"
          :active-view="activeView"
          @create-card="openMagicMemoryDialog('quick')"
          @create-book="showCreateModal = true"
        />
      </div>

      <!-- Info Bubble for Memory Books & Cards -->
      <Dialog
        v-model:visible="showMemoryBooksInfoBubble"
        modal
        :closable="true"
        :dismissable-mask="true"
        class="w-full max-w-md mx-auto"
        :style="{ width: '90vw' }"
      >
        <template #header>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-brand-highlight rounded-full flex items-center justify-center">
              <i class="pi pi-info text-white text-sm"></i>
            </div>
            <h3 class="text-lg font-semibold text-brand-primary">Memory Cards vs Memory Books</h3>
          </div>
        </template>
        
        <div class="space-y-4">
          <div class="p-4 bg-brand-secondary/10 rounded-lg border border-brand-secondary/20">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 bg-brand-secondary rounded-full flex items-center justify-center">
                <i class="pi pi-magic-wand text-white text-xs"></i>
              </div>
              <h4 class="font-semibold text-brand-secondary">Memory Cards</h4>
            </div>
            <p class="text-sm text-brand-text-muted">
              Quick and simple single-page cards perfect for printing and mailing to family and friends. 
              Great for special occasions, holidays, or just to share a moment.
            </p>
          </div>
          
          <div class="p-4 bg-brand-highlight/10 rounded-lg border border-brand-highlight/20">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 bg-brand-highlight rounded-full flex items-center justify-center">
                <i class="pi pi-book text-white text-xs"></i>
              </div>
              <h4 class="font-semibold text-brand-highlight">Memory Books</h4>
            </div>
            <p class="text-sm text-brand-text-muted">
              Multi-page digital books with custom layouts, themes, and professional designs. 
              Perfect for creating comprehensive photo collections and digital keepsakes.
            </p>
          </div>
        </div>
      </Dialog>

      <!-- Create Memory Book Modal -->
      <MemoryBookDialog
        :visible="showCreateModal"
        :isEditing="false"
        :initialData="{ layoutType: 'grid' }"
        :loading="creatingBook"
        @close="closeCreateModal"
        @submit="createMemoryBook"
      />

      <!-- Success Dialog -->
      <Dialog
        v-model:visible="showSuccessDialog"
        modal
        :closable="true"
        :dismissable-mask="true"
        class="w-full max-w-md mx-auto"
        :style="{ width: '90vw' }"
      >
        <template #header>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <i class="pi pi-check text-white text-sm"></i>
            </div>
            <h3 class="text-lg font-semibold text-brand-primary">Success!</h3>
          </div>
        </template>
        
        <div class="text-center py-4">
          <p class="text-brand-text-muted mb-4">
            Your memory book has been created successfully!
          </p>
          <button
            class="bg-brand-highlight hover:bg-brand-highlight/80 text-white font-medium rounded-lg px-6 py-2 transition-colors"
            @click="showSuccessDialog = false"
          >
            Continue
          </button>
        </div>
      </Dialog>

      <!-- Progress Dialog -->
      <Dialog
        v-model:visible="showProgressDialog"
        modal
        :closable="false"
        :dismissable-mask="false"
        class="w-full max-w-md mx-auto"
        :style="{ width: '90vw' }"
      >
        <template #header>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-brand-highlight rounded-full flex items-center justify-center">
              <i class="pi pi-spin pi-spinner text-white text-sm"></i>
            </div>
            <h3 class="text-lg font-semibold text-brand-primary">Generating Your Memory Book</h3>
          </div>
        </template>
        
        <div class="text-center py-4">
          <ProgressBar 
            :value="currentProgress" 
            class="mb-4"
            :showValue="false"
          />
          <p class="text-brand-text-muted">
            {{ currentProgressMessage }}
          </p>
        </div>
      </Dialog>

      <!-- Approval Dialog -->
      <Dialog
        v-model:visible="showApprovalDialog"
        modal
        :closable="true"
        :dismissable-mask="true"
        class="w-full max-w-md mx-auto"
        :style="{ width: '90vw' }"
      >
        <template #header>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-brand-flash rounded-full flex items-center justify-center">
              <i class="pi pi-check text-white text-sm"></i>
            </div>
            <h3 class="text-lg font-semibold text-brand-primary">Approve Memory Book</h3>
          </div>
        </template>
        
        <div class="text-center py-4">
          <p class="text-brand-text-muted mb-4">
            Are you sure you want to approve this memory book? This will make it available for download.
          </p>
          <div class="flex gap-3 justify-center">
            <button
              class="bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg px-6 py-2 transition-colors"
              @click="showApprovalDialog = false"
            >
              Cancel
            </button>
            <button
              class="bg-brand-flash hover:bg-brand-flash/80 text-white font-medium rounded-lg px-6 py-2 transition-colors"
              @click="confirmApproval"
            >
              Approve
            </button>
          </div>
        </div>
      </Dialog>

      <!-- Delete Confirmation Dialog -->
      <Dialog
        v-model:visible="showDeleteDialog"
        modal
        :closable="true"
        :dismissable-mask="true"
        class="w-full max-w-md mx-auto"
        :style="{ width: '90vw' }"
      >
        <template #header>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <i class="pi pi-trash text-white text-sm"></i>
            </div>
            <h3 class="text-lg font-semibold text-brand-primary">Delete Memory Book</h3>
          </div>
        </template>
        
        <div class="text-center py-4">
          <p class="text-brand-text-muted mb-4">
            Are you sure you want to delete this memory book? This action cannot be undone.
          </p>
          <div class="flex gap-3 justify-center">
            <button
              class="bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg px-6 py-2 transition-colors"
              @click="showDeleteDialog = false"
            >
              Cancel
            </button>
            <button
              class="bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg px-6 py-2 transition-colors"
              @click="confirmDelete"
            >
              Delete
            </button>
          </div>
        </div>
      </Dialog>

      <!-- Magic Memory Wizard -->
      <MagicMemoryWizard ref="magicMemoryWizardRef" />

      <!-- PDF Modal -->
      <Dialog
        v-model:visible="showPdfModal"
        modal
        :closable="true"
        :dismissable-mask="true"
        :style="{ width: '95vw', maxWidth: '1200px', height: '95vh' }"
        :class="['w-full', 'h-full', 'm-0', 'rounded-none', 'sm:rounded-2xl']"
        @hide="onPdfModalHide"
      >
        <template #header>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-brand-secondary rounded-full flex items-center justify-center">
                <i class="pi pi-file-pdf text-white text-sm"></i>
              </div>
              <h3 class="text-lg font-semibold text-brand-primary">
                {{ selectedBook?.ai_supplemental_prompt || 'Memory Book' }}
              </h3>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="downloadCurrentPdf"
                class="w-8 h-8 flex items-center justify-center rounded-full bg-brand-accent hover:bg-brand-accent/80 transition-colors"
                v-tooltip.top="'Download PDF'"
              >
                <i class="pi pi-download text-white text-sm"></i>
              </button>
              <button
                @click="sharePdf"
                class="w-8 h-8 flex items-center justify-center rounded-full bg-brand-highlight hover:bg-brand-highlight/80 transition-colors"
                v-tooltip.top="'Share PDF'"
              >
                <i class="pi pi-share-alt text-white text-sm"></i>
              </button>
            </div>
          </div>
        </template>

        <div class="flex flex-col h-full w-full" style="height: 90vh; max-height: 90vh; width: 100%; padding: 0;">
          <!-- PDF Viewer - Mobile (without overflow) -->
          <div class="flex-1 min-h-0 w-full flex items-center justify-center sm:hidden px-0 pb-4 relative">
            <ClientOnly>
              <PdfViewer v-if="pdfBlobUrl" :src="pdfBlobUrl" :style="pdfViewerStyle" />
              <div v-else class="text-center py-8 flex-1 flex items-center justify-center">
                <i class="h-[80%] pi pi-file-pdf text-3xl sm:text-4xl text-gray-400"></i>
                <p class="text-sm sm:text-base text-gray-600 mt-2">No PDF available for preview.</p>
              </div>
            </ClientOnly>
          </div>
          
          <!-- PDF Viewer - Desktop (without overflow) -->
          <div class="hidden sm:flex flex-1 min-h-0 w-full items-center justify-center pt-2 pb-4">
            <ClientOnly>
              <PdfViewer v-if="pdfBlobUrl" :src="pdfBlobUrl" :style="pdfViewerStyle" />
              <div v-else class="text-center py-8 flex-1 flex items-center justify-center">
                <i class="h-[80%] pi pi-file-pdf text-3xl sm:text-4xl text-gray-400"></i>
                <p class="text-sm sm:text-base text-gray-600 mt-2">No PDF available for preview.</p>
              </div>
            </ClientOnly>
          </div>
        </div>
      </Dialog>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMemoryStudio } from '~/composables/useMemoryStudio'
import { defineAsyncComponent } from 'vue'

// Import PdfViewer component
const PdfViewer = defineAsyncComponent(() => import('~/components/PdfViewer.vue'))
import { useMemoryStudioUI } from '~/composables/useMemoryStudioUI'
import { useMemoryBookOperations } from '~/composables/useMemoryBookOperations'

// Components
import ViewToggle from '~/components/ViewToggle.vue'
import MemoryStudioHero from '~/components/MemoryStudioHero.vue'
import MemoryStudioPagination from '~/components/MemoryStudioPagination.vue'
import MemoryStudioEmptyState from '~/components/MemoryStudioEmptyState.vue'
import MemoryCard from '~/components/MemoryCard.vue'
import MemoryBook from '~/components/MemoryBook.vue'
import MemoryBookDialog from '~/components/MemoryBookDialog.vue'
import MagicMemoryWizard from '~/components/MagicMemoryWizard.vue'

// Composables
const router = useRouter()
const {
  memoryCards,
  memoryBooksOnly,
  totalCardsPages,
  totalBooksPages,
  paginatedMemoryCards,
  paginatedMemoryBooks,
  currentCardsPage,
  currentBooksPage,
  cardsPerPage,
  booksPerPage,
  loadingMemoryBooks,
  loadMemoryBooks
} = useMemoryStudio()

const {
  activeView,
  showCreateModal,
  showSuccessDialog,
  showProgressDialog,
  showApprovalDialog,
  showDeleteDialog,
  showMemoryBooksInfoBubble,
  creatingBook,
  currentProgress,
  currentProgressMessage,
  pendingApprovalBookId,
  bookToDelete,
  closeCreateModal,
  resetCreateModal
} = useMemoryStudioUI()

// Magic Memory Wizard
const magicMemoryWizardRef = ref(null)

const {
  createMemoryBook: createBook,
  approveBook: approveBookOperation,
  unapproveBook: unapproveBookOperation,
  deleteBook: deleteBookOperation,
  viewBookDetails,
  viewPDF,
  selectedBook,
  showDetailsModal,
  showPdfModal,
  pdfBlobUrl,
  sharePdf
} = useMemoryBookOperations()

// PDF-related variables
const isChrome = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const zoomLevel = ref(1.0)
const pdfLoaded = ref(false)

// PDF viewer style
const pdfViewerStyle = computed(() => ({
  width: '100%',
  height: '100%',
  maxHeight: '90vh'
}))

// Computed properties
const currentItems = computed(() => {
  return activeView.value === 'cards' ? memoryCards.value : memoryBooksOnly.value
})

const currentPagination = computed(() => {
  return activeView.value === 'cards' 
    ? { page: currentCardsPage.value, perPage: cardsPerPage.value }
    : { page: currentBooksPage.value, perPage: booksPerPage.value }
})

const currentTotalPages = computed(() => {
  return activeView.value === 'cards' ? totalCardsPages.value : totalBooksPages.value
})

const paginatedCurrentItems = computed(() => {
  return activeView.value === 'cards' ? paginatedMemoryCards.value : paginatedMemoryBooks.value
})

// Methods
const onViewChange = (newView) => {
  activeView.value = newView
  // Reset pagination when switching views
  currentCardsPage.value = 1
  currentBooksPage.value = 1
}

const onPreviousPage = () => {
  if (activeView.value === 'cards') {
    currentCardsPage.value = Math.max(1, currentCardsPage.value - 1)
  } else {
    currentBooksPage.value = Math.max(1, currentBooksPage.value - 1)
  }
}

const onNextPage = () => {
  if (activeView.value === 'cards') {
    currentCardsPage.value = Math.min(totalCardsPages.value, currentCardsPage.value + 1)
  } else {
    currentBooksPage.value = Math.min(totalBooksPages.value, currentBooksPage.value + 1)
  }
}

const onGoToPage = (page) => {
  if (activeView.value === 'cards') {
    currentCardsPage.value = page
  } else {
    currentBooksPage.value = page
  }
}

// PDF-related functions
const downloadCurrentPdf = () => {
  if (pdfBlobUrl.value) {
    const link = document.createElement('a')
    link.href = pdfBlobUrl.value
    link.download = `${selectedBook.value?.ai_supplemental_prompt || 'Memory Book'}.pdf`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

const onPdfModalHide = () => {
  if (pdfBlobUrl.value) {
    URL.revokeObjectURL(pdfBlobUrl.value)
    pdfBlobUrl.value = null
    // Reset navigation state
    currentPage.value = 1
    totalPages.value = 1
    zoomLevel.value = 1.0
  }
}

const navigateToTrash = () => {
  router.push('/app/trash')
}

const openMagicMemoryDialog = (type) => {
  if (magicMemoryWizardRef.value) {
    magicMemoryWizardRef.value.openMagicMemoryDialog(type)
  }
}


const onGenerateClick = (book) => {
  // TODO: Implement generate logic
  console.log('Generate clicked for book:', book)
}

const onDownloadClick = (book) => {
  // TODO: Implement download logic
  console.log('Download clicked for book:', book)
}

const approveBook = (bookId) => {
  pendingApprovalBookId.value = bookId
  showApprovalDialog.value = true
}

const confirmApproval = async () => {
  try {
    await approveBookOperation(pendingApprovalBookId.value)
    showApprovalDialog.value = false
    pendingApprovalBookId.value = null
    // Reload memory books to update status
    await loadMemoryBooks()
  } catch (error) {
    console.error('Failed to approve book:', error)
  }
}

const unapproveBook = async (bookId) => {
  try {
    await unapproveBookOperation(bookId)
    // Reload memory books to update status
    await loadMemoryBooks()
  } catch (error) {
    console.error('Failed to unapprove book:', error)
  }
}

const viewBook = (book) => {
  // TODO: Implement view book logic
  console.log('View book clicked:', book)
}

const editBook = (book) => {
  // TODO: Implement edit book logic
  console.log('Edit book clicked:', book)
}

const deleteBook = (bookId) => {
  bookToDelete.value = bookId
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    await deleteBookOperation(bookToDelete.value)
    showDeleteDialog.value = false
    bookToDelete.value = null
    // Reload memory books to update list
    await loadMemoryBooks()
  } catch (error) {
    console.error('Failed to delete book:', error)
  }
}

const createMemoryBook = async (bookData) => {
  try {
    creatingBook.value = true
    await createBook(bookData)
    showCreateModal.value = false
    showSuccessDialog.value = true
    resetCreateModal()
    // Reload memory books to show new book
    await loadMemoryBooks()
  } catch (error) {
    console.error('Failed to create memory book:', error)
  } finally {
    creatingBook.value = false
  }
}

// Watch for view changes to reset pagination
watch(activeView, () => {
  currentCardsPage.value = 1
  currentBooksPage.value = 1
})

// Listen for PDF viewing events from progress dialog
onMounted(() => {
  if (process.client) {
    window.addEventListener('view-pdf', async (event) => {
      const { pdfUrl, bookId } = event.detail
      console.log('🔍 [Memory Books] Received view-pdf event:', { pdfUrl, bookId })
      
      try {
        // Use the memory book operations viewPDF function
        await viewPDF(pdfUrl, bookId)
      } catch (error) {
        console.error('❌ [Memory Books] Error viewing PDF:', error)
      }
    })
  }
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('view-pdf', () => {})
  }
})
</script>
