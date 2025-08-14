<template>
  <div class="min-h-screen bg-brand-background p-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 gap-4">
        <div class="flex items-center gap-2 sm:gap-3">
          <button
            class="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow hover:bg-gray-100 transition-colors focus:outline-none"
            @click="navigateBack"
            aria-label="Go back to memory books"
          >
            <i class="pi pi-arrow-left text-brand-primary"></i>
          </button>
          <h1 class="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-brand-primary">Trash</h1>
          <i class="pi pi-trash text-red-500 text-xl"></i>
        </div>
        
                  <!-- Empty Trash Button -->
          <button
            v-if="deletedBooks.length > 0"
            class="flex items-center gap-2 bg-brand-dialog-delete hover:bg-red-600 text-white font-bold rounded-full px-4 py-2 text-sm shadow-lg transition-all duration-200 border-0"
            @click="confirmEmptyTrash"
          >
            <i class="pi pi-trash text-sm"></i>
            <span>Empty Trash</span>
          </button>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && deletedBooks.length === 0" class="text-center py-12">
        <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i class="pi pi-trash text-gray-400 text-3xl"></i>
        </div>
        <h2 class="text-xl font-semibold text-gray-600 mb-2">Trash is Empty</h2>
        <p class="text-gray-500 mb-6">No deleted memory books found.</p>
        <button
          class="flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-full px-6 py-2 text-sm shadow-lg transition-all duration-200 border-0"
          @click="navigateBack"
        >
          <i class="pi pi-arrow-left text-sm"></i>
          <span>Back to Memory Books</span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="text-center py-12">
        <div class="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600">Loading deleted memory books...</p>
      </div>

      <!-- Trash Table -->
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <DataTable
          :value="deletedBooks"
          :paginator="true"
          :rows="10"
          :rowsPerPageOptions="[5, 10, 25, 50]"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} deleted memory books"
          responsiveLayout="scroll"
          class="p-datatable-sm"
          :rowKey="row => row.id"
        >
          <!-- Title Column -->
          <Column field="ai_supplemental_prompt" header="Title" sortable>
            <template #body="{ data }">
              <div class="max-w-xs truncate" :title="data.ai_supplemental_prompt || 'Untitled Memory Book'">
                <span class="text-sm text-brand-primary font-medium">
                  {{ data.ai_supplemental_prompt || 'Untitled Memory Book' }}
                </span>
              </div>
            </template>
          </Column>

          <!-- Type Column -->
          <Column field="layout_type" header="Type" sortable>
            <template #body="{ data }">
              <Tag
                :value="getTypeDisplayName(data.layout_type)"
                :severity="getTypeSeverity(data.layout_type)"
              />
            </template>
          </Column>

          <!-- Created Date Column -->
          <Column field="created_at" header="Created" sortable>
            <template #body="{ data }">
              <span class="text-sm text-brand-primary/70">
                {{ formatDate(data.created_at) }}
              </span>
            </template>
          </Column>

          <!-- Deleted Date Column -->
          <Column field="deleted_at" header="Deleted" sortable>
            <template #body="{ data }">
              <span class="text-sm text-brand-primary/70">
                {{ formatDate(data.deleted_at) }}
              </span>
            </template>
          </Column>

          <!-- Actions Column -->
          <Column header="Actions" :exportable="false" style="min-width: 8rem">
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <button
                  class="w-8 h-8 flex items-center justify-center rounded-full bg-brand-highlight hover:bg-brand-highlight/80 text-white shadow transition-all duration-200 border-0"
                  @click="restoreBook(data)"
                  v-tooltip.top="'Restore'"
                  aria-label="Restore memory book"
                >
                  <i class="pi pi-undo text-sm"></i>
                </button>
                <button
                  class="w-8 h-8 flex items-center justify-center rounded-full bg-brand-dialog-delete hover:bg-red-600 text-white shadow transition-all duration-200 border-0"
                  @click="confirmPermanentDelete(data)"
                  v-tooltip.top="'Permanently Delete'"
                  aria-label="Permanently delete memory book"
                >
                  <i class="pi pi-trash text-sm"></i>
                </button>
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Confirm Permanent Delete Dialog -->
    <Dialog
      v-model:visible="showPermanentDeleteDialog"
      modal
      header="Permanently Delete Memory Book?"
      class="w-full max-w-md rounded-2xl"
    >
      <div class="text-center py-4">
        <i class="pi pi-exclamation-triangle text-3xl text-red-500 mb-2"></i>
        <div class="text-lg font-bold text-gray-900 mb-2">This action cannot be undone!</div>
        <div class="text-gray-700 mb-4">
          Are you sure you want to permanently delete "{{ bookToDelete?.ai_supplemental_prompt || 'Untitled Memory Book' }}"?
          This will permanently remove the memory book and all associated data.
        </div>
        <div class="flex justify-center gap-3">
          <button
            class="bg-brand-dialog-cancel hover:bg-gray-600 text-white font-bold rounded-full px-5 py-2 text-base shadow border-0"
            @click="showPermanentDeleteDialog = false"
          >
            Cancel
          </button>
          <button
            class="bg-brand-dialog-delete hover:bg-red-600 text-white font-bold rounded-full px-5 py-2 text-base shadow border-0"
            @click="permanentDeleteConfirmed"
          >
            Permanently Delete
          </button>
        </div>
      </div>
    </Dialog>

    <!-- Confirm Empty Trash Dialog -->
    <Dialog
      v-model:visible="showEmptyTrashDialog"
      modal
      header="Empty Trash?"
      class="w-full max-w-md rounded-2xl"
    >
      <div class="text-center py-4">
        <i class="pi pi-exclamation-triangle text-3xl text-red-500 mb-2"></i>
        <div class="text-lg font-bold text-gray-900 mb-2">This action cannot be undone!</div>
        <div class="text-gray-700 mb-4">
          Are you sure you want to permanently delete all {{ deletedBooks.length }} memory book(s) in the trash?
          This will permanently remove all deleted memory books and their associated data.
        </div>
        <div class="flex justify-center gap-3">
          <button
            class="bg-brand-dialog-cancel hover:bg-gray-600 text-white font-bold rounded-full px-5 py-2 text-base shadow border-0"
            @click="showEmptyTrashDialog = false"
          >
            Cancel
          </button>
          <button
            class="bg-brand-dialog-delete hover:bg-red-600 text-white font-bold rounded-full px-5 py-2 text-base shadow border-0"
            @click="emptyTrashConfirmed"
          >
            Empty Trash
          </button>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'

// Set the layout for this page
definePageMeta({
  layout: 'default'
})

const toast = useToast()
const db = useDatabase()
const route = useRoute()

// Reactive data
const deletedBooks = ref([])
const loading = ref(true)
const showPermanentDeleteDialog = ref(false)
const showEmptyTrashDialog = ref(false)
const bookToDelete = ref(null)

// Load deleted memory books
const loadDeletedBooks = async () => {
  loading.value = true
  try {
    const books = await db.memoryBooks.getMemoryBooks({ deleted: true })
    deletedBooks.value = books || []
    console.log(`📚 Loaded ${deletedBooks.value.length} deleted memory books`)
  } catch (error) {
    console.error('❌ Error loading deleted memory books:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load deleted memory books',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

// Navigate back to memory books page
const navigateBack = () => {
  navigateTo('/app/memory-books')
}

// Get type display name
const getTypeDisplayName = (layoutType) => {
  const typeMap = {
    'grid': 'Memory Book',
    'theme': 'Themed Book',
    'story': 'Story Book',
    'card': 'Memory Card'
  }
  return typeMap[layoutType] || layoutType || 'Memory Book'
}

// Get type severity for Tag component
const getTypeSeverity = (layoutType) => {
  const severityMap = {
    'grid': 'primary',
    'theme': 'secondary',
    'story': 'success',
    'card': 'warning'
  }
  return severityMap[layoutType] || 'info'
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Invalid Date'
  }
}

// Restore memory book
const restoreBook = async (book) => {
  try {
    await db.memoryBooks.updateMemoryBook(book.id, {
      deleted: false,
      deleted_at: null
    })
    
    // Remove from local list
    deletedBooks.value = deletedBooks.value.filter(b => b.id !== book.id)
    
    toast.add({
      severity: 'success',
      summary: 'Restored',
      detail: `"${book.ai_supplemental_prompt || 'Untitled Memory Book'}" has been restored`,
      life: 3000
    })
  } catch (error) {
    console.error('❌ Error restoring memory book:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to restore memory book',
      life: 3000
    })
  }
}

// Confirm permanent delete
const confirmPermanentDelete = (book) => {
  bookToDelete.value = book
  showPermanentDeleteDialog.value = true
}

// Permanent delete confirmed
const permanentDeleteConfirmed = async () => {
  if (!bookToDelete.value) return
  
  try {
    await db.memoryBooks.deleteMemoryBook(bookToDelete.value.id)
    
    // Remove from local list
    deletedBooks.value = deletedBooks.value.filter(b => b.id !== bookToDelete.value.id)
    
    toast.add({
      severity: 'success',
      summary: 'Deleted',
      detail: `"${bookToDelete.value.ai_supplemental_prompt || 'Untitled Memory Book'}" has been permanently deleted`,
      life: 3000
    })
  } catch (error) {
    console.error('❌ Error permanently deleting memory book:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to permanently delete memory book',
      life: 3000
    })
  } finally {
    showPermanentDeleteDialog.value = false
    bookToDelete.value = null
  }
}

// Confirm empty trash
const confirmEmptyTrash = () => {
  showEmptyTrashDialog.value = true
}

// Empty trash confirmed
const emptyTrashConfirmed = async () => {
  try {
    // Delete all memory books in trash
    const deletePromises = deletedBooks.value.map(book => 
      db.memoryBooks.deleteMemoryBook(book.id)
    )
    await Promise.all(deletePromises)
    
    // Clear local list
    deletedBooks.value = []
    
    toast.add({
      severity: 'success',
      summary: 'Trash Emptied',
      detail: 'All memory books have been permanently deleted',
      life: 3000
    })
  } catch (error) {
    console.error('❌ Error emptying trash:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to empty trash',
      life: 3000
    })
  } finally {
    showEmptyTrashDialog.value = false
  }
}

// Load data on mount
onMounted(() => {
  loadDeletedBooks()
})
</script>
