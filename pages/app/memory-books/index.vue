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
       <!-- not currently used -->
      <!-- <MemoryStudioHero 
        :active-view="activeView"
        @create-card="openMagicMemoryDialog('quick')"
        @create-book="showCreateModal = true"
      /> -->

      <!-- Dynamic Listing Section -->
      <div class="mb-12" data-savta="memory-listing-section">
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
        <div v-else-if="currentItems.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-savta="memory-cards-tile">
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
            @view-details="handleViewBookDetails"
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
        :initialSelectedAssets="selectedPhotosForMemoryBook"
        :loading="creatingBook"
        @close="closeCreateModal"
        @submit="createMemoryBookFromDialog"
      />

      <!-- Book Details Modal -->
      <Dialog
        v-model:visible="showDetailsModal"
        modal
        class="w-[95vw] max-w-4xl mx-auto mb-15 -mt-16"
      >
        <div v-if="selectedBook" class="bg-gradient-to-br from-brand-navigation/10 via-brand-accent/5 to-brand-highlight/10 min-h-screen">
          <!-- Header Section -->
          <div class="bg-gradient-to-br from-white via-brand-navigation/5 to-brand-accent/10 rounded-t-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div class="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-brand-secondary to-brand-highlight rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                  <i class="pi pi-gift text-white text-lg sm:text-2xl"></i>
                </div>
                <div class="min-w-0 flex-1">
                  <h2 class="text-lg sm:text-2xl font-bold text-gray-900 mb-1 truncate">{{ selectedBook.ai_supplemental_prompt || ('Memory Book #' + selectedBook.id.slice(-6)) }}</h2>
                  <div class="flex items-center gap-2">
                    <div :class="getStatusBadgeClass(selectedBook.status)" class="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-md backdrop-blur-sm">
                      <i :class="getStatusIcon(selectedBook.status)" class="text-xs sm:text-sm"></i>
                      <span class="hidden sm:inline">{{ getStatusText(selectedBook.status) }}</span>
                      <span class="sm:hidden">{{ getStatusText(selectedBook.status).substring(0, 8) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2 flex-wrap">
                <button
                  data-testid="details-unapprove-button"
                  v-if="selectedBook.status === 'approved'"
                  class="flex items-center justify-center gap-1 sm:gap-2 bg-brand-dialog-edit text-white font-bold rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm shadow transition-all duration-200"
                  @click="unapproveBook(selectedBook.id)"
                >
                  <i class="pi pi-undo text-xs sm:text-sm"></i>
                  <span class="hidden sm:inline">Unapprove</span>
                  <span class="sm:hidden">Unapprove</span>
                </button>
                <button
                  data-testid="details-close-button"
                  class="border-0 flex items-center justify-center gap-1 sm:gap-2 bg-brand-dialog-cancel text-white font-bold rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm shadow transition-all duration-200"
                  @click="showDetailsModal = false"
                >
                  <i class="pi pi-times text-xs sm:text-sm"></i>
                  <span class="hidden sm:inline">Close</span>
                  <span class="sm:hidden">Close</span>
                </button>
              </div>
            </div>

            <!-- Info Cards -->
            <div class="grid grid-cols-2 lg:grid-cols-6 gap-2 sm:gap-3 mt-4">
              <div class="bg-white/80 rounded-xl p-2 sm:p-3 border border-gray-200">
                <div class="flex items-center gap-1 sm:gap-2 mb-1">
                  <i class="pi pi-calendar text-brand-primary text-xs sm:text-sm"></i>
                  <span class="text-xs font-medium text-gray-600">Created</span>
                </div>
                <p class="text-xs sm:text-sm font-semibold text-gray-900">{{ formatDate(selectedBook.created_at) }}</p>
              </div>
              <div v-if="selectedBook.generated_at" class="bg-white/80 rounded-xl p-2 sm:p-3 border border-gray-200">
                <div class="flex items-center gap-1 sm:gap-2 mb-1">
                  <i class="pi pi-magic-wand text-brand-primary text-xs sm:text-sm"></i>
                  <span class="text-xs font-medium text-gray-600">Generated</span>
                </div>
                <p class="text-xs sm:text-sm font-semibold text-gray-900">{{ formatDate(selectedBook.generated_at) }}</p>
              </div>
              <div v-if="selectedBook.approved_at" class="bg-white/80 rounded-xl p-2 sm:p-3 border border-gray-200">
                <div class="flex items-center gap-1 sm:gap-2 mb-1">
                  <i class="pi pi-check-circle text-brand-accent text-xs sm:text-sm"></i>
                  <span class="text-xs font-medium text-gray-600">Approved</span>
                </div>
                <p class="text-xs sm:text-sm font-semibold text-gray-900">{{ formatDate(selectedBook.approved_at) }}</p>
              </div>
              <div v-if="selectedBook.created_from_assets && selectedBook.created_from_assets.length > 0" class="bg-white/80 rounded-xl p-2 sm:p-3 border border-gray-200">
                <div class="flex items-center gap-1 sm:gap-2 mb-1">
                  <i class="pi pi-images text-brand-accent text-xs sm:text-sm"></i>
                  <span class="text-xs font-medium text-gray-600">Assets</span>
                </div>
                <p class="text-xs sm:text-sm font-semibold text-gray-900">
                  {{ selectedBook.created_from_assets.length }}
                  <span v-if="selectedBook.photo_selection_pool && selectedBook.photo_selection_pool.length > 0" class="text-gray-500">
                    ({{ selectedBook.photo_selection_pool.length }} in pool)
                  </span>
                </p>
              </div>
              <div class="bg-white/80 rounded-xl p-2 sm:p-3 border border-gray-200">
                <div class="flex items-center gap-1 sm:gap-2 mb-1">
                  <i class="pi pi-th-large text-brand-primary text-xs sm:text-sm"></i>
                  <span class="text-xs font-medium text-gray-600">Layout</span>
                </div>
                <p class="text-xs sm:text-sm font-semibold text-gray-900">{{ selectedBook.layout_type || 'grid' }}</p>
              </div>
              <div class="bg-white/80 rounded-xl p-2 sm:p-3 border border-gray-200">
                <div class="flex items-center gap-1 sm:gap-2 mb-1">
                  <i class="pi pi-file text-brand-secondary text-xs sm:text-sm"></i>
                  <span class="text-xs font-medium text-gray-600">Format</span>
                </div>
                <p class="text-xs sm:text-sm font-semibold text-gray-900">{{ selectedBook.format || 'book' }}</p>
              </div>
              <div class="bg-white/80 rounded-xl p-2 sm:p-3 border border-gray-200">
                <div class="flex items-center gap-1 sm:gap-2 mb-1">
                  <i class="pi pi-calendar-plus text-brand-highlight text-xs sm:text-sm"></i>
                  <span class="text-xs font-medium text-gray-600">Event</span>
                </div>
                <p class="text-xs sm:text-sm font-semibold text-gray-900">{{ selectedBook.memory_event || 'N/A' }}</p>
              </div>
            </div>
            
            <!-- Additional Info Cards Row -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-2">
              <div class="bg-white/80 rounded-xl p-2 sm:p-3 border border-gray-200">
                <div class="flex items-center gap-1 sm:gap-2 mb-1">
                  <i class="pi pi-palette text-brand-primary text-xs sm:text-sm"></i>
                  <span class="text-xs font-medium text-gray-600">Theme</span>
                </div>
                <p class="text-xs sm:text-sm font-semibold text-gray-900">{{ selectedBook.theme?.name || 'Default' }}</p>
              </div>
              <div class="bg-white/80 rounded-xl p-2 sm:p-3 border border-gray-200">
                <div class="flex items-center gap-1 sm:gap-2 mb-1">
                  <i class="pi pi-circle text-brand-accent text-xs sm:text-sm"></i>
                  <span class="text-xs font-medium text-gray-600">Shape</span>
                </div>
                <p class="text-xs sm:text-sm font-semibold text-gray-900">{{ selectedBook.memory_shape || 'original' }}</p>
              </div>
              <div class="bg-white/80 rounded-xl p-2 sm:p-3 border border-gray-200">
                <div class="flex items-center gap-1 sm:gap-2 mb-1">
                  <i class="pi pi-table text-brand-highlight text-xs sm:text-sm"></i>
                  <span class="text-xs font-medium text-gray-600">Grid</span>
                </div>
                <p class="text-xs sm:text-sm font-semibold text-gray-900">{{ selectedBook.grid_layout || '2x2' }}</p>
              </div>
              <div class="bg-white/80 rounded-xl p-2 sm:p-3 border border-gray-200">
                <div class="flex items-center gap-1 sm:gap-2 mb-1">
                  <i class="pi pi-file-edit text-brand-primary text-xs sm:text-sm"></i>
                  <span class="text-xs font-medium text-gray-600">Title</span>
                </div>
                <p class="text-xs sm:text-sm font-semibold text-gray-900 truncate">{{ selectedBook.ai_supplemental_prompt || 'Untitled' }}</p>
              </div>
            </div>

            <!-- Review Notes -->
            <div v-if="selectedBook.review_notes" class="mt-4 bg-gradient-to-br from-brand-highlight/10 to-brand-accent/10 rounded-xl p-3 sm:p-4 border border-brand-highlight/20">
              <div class="flex items-center gap-2 mb-2">
                <i class="pi pi-comment text-brand-highlight text-sm"></i>
                <span class="text-sm font-semibold text-brand-highlight">Review Notes</span>
              </div>
              <p class="text-xs sm:text-sm text-brand-highlight italic">{{ selectedBook.review_notes }}</p>
            </div>
          </div>

          <!-- Content Section -->
          <div class="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <!-- Story Section (for Story-based Memories) -->
            <div v-if="selectedBook.magic_story" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 text-xs">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-brand-highlight/20 to-brand-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <i class="pi pi-sparkles text-brand-highlight text-sm sm:text-base"></i>
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="text-base sm:text-lg font-bold text-brand-primary">Special Story</h3>
                  <p class="text-xs sm:text-sm text-gray-600">The AI-generated story for your special memory</p>
                </div>
              </div>
              <div class="overflow-y-auto max-h-48 sm:max-h-64 bg-gradient-to-br from-brand-highlight/10 to-brand-primary/10 rounded-xl p-3 sm:p-4 border border-brand-primary/20 text-brand-primary text-sm magic-story" style="word-break: break-word; line-height: 1.5;">
                {{ selectedBook.magic_story }}
              </div>
            </div>

            <!-- AI Photo Selection Reasoning Section -->
            <div v-if="selectedBook.ai_photo_selection_reasoning" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 text-xs">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-brand-accent/20 to-brand-highlight/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <i class="pi pi-lightbulb text-brand-accent text-sm sm:text-base"></i>
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="text-base sm:text-lg font-bold text-brand-primary">Photo Selection Reasoning</h3>
                  <p class="text-xs sm:text-sm text-gray-600">Why these photos were chosen for your memory</p>
                </div>
              </div>
              <div class="overflow-y-auto max-h-48 sm:max-h-64 bg-gradient-to-br from-brand-accent/10 to-brand-highlight/10 rounded-xl p-3 sm:p-4 border border-brand-accent/20 text-brand-primary text-sm" style="word-break: break-word; line-height: 1.5;">
                {{ selectedBook.ai_photo_selection_reasoning }}
              </div>
            </div>

            <!-- Memory Assets Section -->
            <div v-if="selectedBook.created_from_assets && selectedBook.created_from_assets.length > 0" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
              <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-brand-accent/20 to-brand-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <i class="pi pi-images text-brand-accent text-sm sm:text-base"></i>
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="text-base sm:text-lg font-bold text-gray-900">Memory Assets</h3>
                  <p class="text-xs sm:text-sm text-gray-600">
                    {{ selectedBook.created_from_assets.length }} memories included
                    <span v-if="selectedBook.photo_selection_pool && selectedBook.photo_selection_pool.length > 0" class="text-gray-500">
                      (from {{ selectedBook.photo_selection_pool.length }} in pool)
                    </span>
                  </p>
                </div>
              </div>
              <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1 sm:gap-2">
                <div
                  v-for="assetId in selectedBook.created_from_assets.slice(0, 24)"
                  :key="assetId"
                  class="aspect-square bg-gray-100 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <img 
                    v-if="getAssetThumbnail(assetId)"
                    :src="getAssetThumbnail(assetId)"
                    :alt="`Asset ${assetId.slice(-4)}`"
                    class="w-full h-full object-contain"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center bg-gray-100">
                    <i class="pi pi-image text-gray-400 text-xs sm:text-sm"></i>
                  </div>
                </div>
                <div v-if="selectedBook.created_from_assets.length > 24" class="aspect-square bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-xs sm:text-sm text-gray-500 font-medium">
                  +{{ selectedBook.created_from_assets.length - 24 }}
                </div>
              </div>
            </div>

            <!-- Memory Book Section -->
            <div v-if="selectedBook.pdf_url" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-brand-primary/20 to-brand-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <i :class="[getFileTypeIcon(selectedBook), getFileTypeColor(selectedBook), 'text-sm sm:text-base']"></i>
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="text-base sm:text-lg font-bold text-gray-900">Your Memory</h3>
                    <p class="text-xs sm:text-sm text-gray-600">Ready to download and share</p>
                  </div>
                </div>
                <button
                  data-testid="download-memory-button"
                  class="border-0 flex items-center justify-center gap-2 bg-brand-dialog-save text-white font-bold rounded-full px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm shadow-lg transition-all duration-200 w-full sm:w-auto"
                  @click="forceDownloadPDF(selectedBook)"
                >
                  <i class="pi pi-download text-xs sm:text-sm"></i>
                  <span class="hidden sm:inline">Download {{ getFileTypeDisplay(selectedBook) }}</span>
                  <span class="sm:hidden">Download {{ getFileTypeDisplay(selectedBook) }}</span>
                </button>
              </div>
              <div class="border-0 bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 rounded-xl p-3 sm:p-4 border border-brand-primary/20 mt-4">
                <div class="flex items-start gap-2 text-xs sm:text-sm text-brand-primary">
                  <i class="pi pi-info-circle text-brand-primary text-xs sm:text-sm mt-0.5 flex-shrink-0" title="Ask Savta"></i>
                  <span>Click download to save your memory book as a {{ getFileTypeDisplay(selectedBook) }} file to your device</span>
                </div>
              </div>
            </div>

            <!-- Actions Section -->
            <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
              <h3 class="text-base sm:text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div class="flex flex-wrap justify-center gap-3">
                <button
                  data-testid="details-create-memory-button"
                  v-if="selectedBook.status === 'draft'"
                  class="border-0 flex items-center justify-center gap-2 bg-brand-dialog-save text-white font-bold rounded-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm shadow-lg transition-all duration-200"
                  @click="onGenerateClick(selectedBook)"
                >
                  <i class="pi pi-magic-wand text-xs sm:text-sm"></i>
                  <span class="hidden sm:inline">Create Memory</span>
                  <span class="sm:hidden">Create</span>
                </button>
                <button
                  data-testid="details-recreate-button"
                  v-if="selectedBook.status === 'ready' || selectedBook.status === 'background_ready'"
                  class="border-0 flex items-center justify-center gap-2 bg-brand-dialog-edit text-white font-bold rounded-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm shadow-lg transition-all duration-200"
                  @click="onRegenerateClick(selectedBook)"
                  :class="{ 'opacity-50': selectedBook.status === 'background_ready' }"
                >
                  <i class="pi pi-refresh text-xs sm:text-sm"></i>
                  <span class="hidden sm:inline">{{ selectedBook.status === 'background_ready' ? 'Processing ...' : 'Recreate' }}</span>
                  <span class="sm:hidden">{{ selectedBook.status === 'background_ready' ? 'Processing' : 'Recreate' }}</span>
                </button>
                <button
                  data-testid="details-approve-button"
                  v-if="selectedBook.status === 'ready'"
                  class="border-0 flex items-center justify-center gap-2 bg-brand-dialog-save text-white font-bold rounded-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm shadow-lg transition-all duration-200"
                  @click="approveBook(selectedBook.id)"
                  v-tooltip.top="'Approve this Book and I\'ll Send it Out For You'"
                >
                  <i class="pi pi-check text-xs sm:text-sm"></i>
                  <span class="hidden sm:inline">Approve</span>
                  <span class="sm:hidden">Approve</span>
                </button>
                <button
                  data-testid="details-select-assets-button"
                  v-if="selectedBook"
                  class="border-0 flex items-center justify-center gap-2 bg-brand-dialog-edit text-white font-bold rounded-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm shadow-lg transition-all duration-200"
                  @click="openSelectMemoriesDialog"
                >
                  <i class="pi pi-images text-xs sm:text-sm"></i>
                  <span class="hidden sm:inline">Select Assets</span>
                  <span class="sm:hidden">Assets</span>
                </button>
                <button
                  data-testid="details-edit-settings-button"
                  v-if="selectedBook"
                  class="border-0 flex items-center justify-center gap-2 bg-brand-dialog-edit text-white font-bold rounded-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm shadow-lg transition-all duration-200"
                  @click="openEditSettings(selectedBook)"
                >
                  <i class="pi pi-cog text-xs sm:text-sm"></i>
                  <span class="hidden sm:inline">Edit Settings</span>
                  <span class="sm:hidden">Edit</span>
                </button>
                <button
                  data-testid="details-trash-button"
                  v-if="selectedBook"
                  class="border-0 flex items-center justify-center gap-2 bg-brand-dialog-delete text-white font-bold rounded-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm shadow-lg transition-all duration-200"
                  @click="confirmDeleteBook(selectedBook)"
                >
                  <i class="pi pi-trash text-xs sm:text-sm"></i>
                  <span class="hidden sm:inline">Trash</span>
                  <span class="sm:hidden">Trash</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Dialog>

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

      <!-- Generate Confirmation Dialog -->
      <Dialog
        v-model:visible="showGenerateDialog"
        modal
        header="Try Another Recipe"
        class="w-[95vw] max-w-md"
      >
        <div class="py-4 pt-3">
          <p class="text-sm sm:text-base">Compose this special memory? This may take a little time.</p>
          <div class="flex justify-end gap-2 mt-4">
            <button
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              @click="cancelDialog"
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 text-sm font-medium text-white bg-brand-highlight hover:bg-brand-highlight/80 rounded-lg transition-colors"
              @click="confirmGenerate"
            >
              Compose
            </button>
          </div>
        </div>
      </Dialog>

      <!-- Regenerate Confirmation Dialog -->
      <Dialog
        v-model:visible="showRegenerateDialog"
        modal
        header="Recreate Memory"
        class="w-full max-w-xl"
      >
        <div class="p-4">
          <p class="text-brand-header text-sm sm:text-xl font-bold mb-2">
            Create a fresh version of your memory?
          </p>
          <p class="text-gray-600 text-sm mb-4">
            This will generate a new version with the same photos but potentially different layout and story.
          </p>
          <div class="flex justify-end gap-2">
            <button
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              @click="cancelDialog"
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 text-sm font-medium text-white bg-brand-highlight hover:bg-brand-highlight/80 rounded-lg transition-colors"
              @click="confirmRegenerate"
            >
              Recreate
            </button>
          </div>
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
              Trash
            </button>
          </div>
        </div>
      </Dialog>

      <!-- Magic Memory Wizard -->
      <MagicMemoryWizard ref="magicMemoryWizardRef" />

      <!-- Savta Bubble Component (disabled here; shown on Getting Started page) -->
      <SavtaBubble
        v-model:open="showSavtaBubble"
        placement="center"
        :offset="0"
        heading="Hi, I'm Savta and I'm here to help you get started!"
        text="Click on Create Memory Card and I will walk yout through creating your first memory.
        \nI'll start by asking you a couple of questions about how you want your memory card to look.
        \nThen I'll help you upload just your favorite photos to your Photo Box—not your whole camera roll. The more you share, the better I can help you.📸
        \nI'll use a little AI magic to pick photos that belong together, arrange them beautifully on each card, and write warm captions. 💛"
        variant="instruction"
        :dismissible="true"
        :show-avatar="true"
      />

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

    <!-- Upload Photos Dialog -->
    <Dialog
      v-model:visible="showUploadDialog"
      modal
      :closable="!isUploading"
      :dismissableMask="!isUploading"
      class="w-full h-full sm:w-[95vw] sm:max-w-2xl sm:h-auto sm:mx-auto magic-upload-dialog"
      :style="{ 
        width: '100vw', 
        height: '100vh', 
        maxWidth: '100vw',
        maxHeight: '100vh',
        margin: '0',
        borderRadius: '0',
        overflow: 'hidden'
              }"
      @hide="resetUploadDialog"
    >
      <template #header>
        <div class="text-center">I Need Some Photos to Work My Magic</div>
      </template>
      <div class="space-y-6 max-w-xs w-full mx-auto sm:max-w-2xl sm:mx-auto">
        <!-- Upload Instructions -->
        <div v-if="!isUploading && uploadedFiles.length === 0" class="bg-gradient-to-r from-brand-navigation via-brand-accent-light to-blue-50 rounded-xl p-6 border-2 border-brand-highlight relative overflow-hidden">
          
          <div class="flex items-start gap-3">
            <div class="shrink-0">
              <SavtaIcon class="w-12 h-12" />
            </div>
            <div class="min-w-0">
              <h3 class="text-lg font-bold text-brand-header mb-1 font-architects-daughter">Let me help you share your photos.</h3>
            </div>
          </div>
          <div class="bg-white/80 rounded-lg p-4">
            <div class="text-sm text-gray-700 leading-relaxed">
              <ul class="list-disc pl-4 text-xs md:text-sm">
                <li>Just share your photos with me - I'll take good care of them</li>
                <li>The more photos you share, the better I can help you</li>
                <li>Your photos stay safe and private, just for you</li>
                <li>I'll remember the people and places in your photos</li>
                <li>I'll pick the best photos and write sweet stories about them</li>
              </ul>
              
              <!-- Special recommendation for new users -->
              <div v-if="showSpecialUploadMessaging" class="mt-4 p-3 bg-brand-highlight/10 rounded-lg border border-brand-highlight/20">
                <div class="flex items-center gap-2 mb-2">
                  <i class="pi pi-lightbulb text-brand-highlight text-lg"></i>
                  <span class="font-semibold text-brand-highlight font-architects-daughter">💡 A little tip from Savta</span>
                </div>
                <p class="text-sm text-brand-primary">
                  Try sharing 6 or more photos to start with. That way I can make you the most beautiful memory cards!
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Upload Progress -->
        <div v-if="isUploading" class="bg-gradient-to-r from-brand-navigation via-brand-accent-light to-blue-50 rounded-xl p-6 border-2 border-brand-highlight shadow-lg">
          <div class="flex items-start gap-3 mb-4">
            <div class="shrink-0">
              <SavtaIcon class="w-12 h-12" />
            </div>
            <div class="min-w-0">
              <h3 class="font-bold mb-0.5 font-architects-daughter text-brand-header text-lg">I'm reviewing your photos.</h3>
              <p class="text-sm text-gray-700 leading-relaxed">
                I'm looking through each photo, remembering the people and places, and writing sweet captions. 
                This helps me create the most beautiful memory cards and books for you.
              </p>
              <p class="text-sm text-gray-700 leading-relaxed">This may take a few minutes, but I'll let you know when I'm done.</p>
            </div>
          </div>
          
          <!-- Progress Bar -->
          <div class="w-full bg-white/60 rounded-full h-4 border border-brand-highlight mb-3">
            <div 
              class="bg-brand-card h-4 rounded-full transition-all duration-500 shadow-lg"
              :style="{ width: uploadProgress + '%' }"
            ></div>
          </div>
          <p class="text-sm text-gray-600 text-center">{{ uploadStatus }}</p>
        </div>

        <!-- Upload Results -->
        <div v-if="uploadedFiles.length > 0 || failedFiles.length > 0" class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 shadow-lg">
          <div class="flex items-start gap-3 mb-4">
            <div class="shrink-0">
              <SavtaIcon class="w-12 h-12" />
            </div>
            <div class="min-w-0">
              <h3 class="font-bold mb-0.5 font-architects-daughter text-green-800 text-lg">I've reviewed these photos.</h3>
              <p class="text-sm text-green-700 leading-relaxed">
                I've reviewed and organized these photos. They're ready for creating beautiful memory cards and books!
              </p>
            </div>
          </div>
          
          <div v-if="uploadedFiles.length > 0" class="bg-white/80 rounded-lg p-4 border border-green-200">
            <p class="text-sm text-green-700 mb-2">Successfully prepared {{ uploadedFiles.length }} photo{{ uploadedFiles.length !== 1 ? 's' : '' }}</p>
          </div>
        </div>

          <!-- Failed Results -->
          <div v-if="failedFiles.length > 0" class="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200 shadow-lg">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center shadow-lg">
                <i class="pi pi-exclamation-triangle text-red-600 text-xl"></i>
              </div>
              <div>
                <h4 class="text-xl font-bold text-red-800">😔 Preparation Failed</h4>
                <p class="text-sm text-red-600">Some preparations didn't work as expected</p>
              </div>
            </div>
            <div class="bg-white/80 rounded-lg p-4 border border-red-200">
              <div class="space-y-2">
                <div 
                  v-for="file in failedFiles" 
                  :key="file.name"
                  class="flex items-center gap-2 text-sm text-red-700"
                >
                  <i class="pi pi-times text-red-600"></i>
                  <span class="font-medium">{{ file.name }}</span>
                  <span class="text-xs text-red-500">({{ file.error }})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      <template #footer>
        <div class="flex flex-col sm:flex-row justify-between items-center w-full gap-2 sm:gap-4 px-2">
          <div class="text-xs text-gray-500 w-full sm:w-auto text-center sm:text-left">
            {{ uploadedFiles.length }} uploaded, {{ failedFiles.length }} failed
          </div>
          <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              data-testid="upload-dialog-close-button"
              v-if="!isUploading"
              class="bg-brand-dialog-cancel text-white font-bold rounded-full px-3 py-2 text-xs shadow transition-all duration-200 w-full sm:w-auto"
              @click="showUploadDialog = false"
            >
              Close
            </button>
            <button
              data-testid="start-upload-button"
              v-if="!isUploading && uploadedFiles.length === 0"
              class="bg-brand-dialog-edit text-white font-bold rounded-full px-3 py-2 text-xs shadow-lg transition-all duration-200 w-full sm:w-auto"
              @click="selectFiles"
            >
              <i class="pi pi-sparkles mr-2"></i>
              🌸 Choose Photos 🌸
            </button>
            <button
              data-testid="finish-upload-button"
              v-if="!isUploading && uploadedFiles.length > 0"
              class="bg-brand-secondary text-white font-bold rounded-full px-3 py-2 text-xs shadow-lg transition-all duration-200 w-full sm:w-auto"
              @click="finishUpload"
            >
              <i class="pi pi-check mr-2"></i>
              <span v-if="shouldOpenWizardAfterUpload">Continue to Magic Memory</span>
              <span v-else>Continue</span>
            </button>
          </div>
        </div>
      </template>
    </Dialog>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMemoryStudio } from '~/composables/useMemoryStudio'
import { useDatabase } from '~/composables/useDatabase'
import { useSupabaseUser } from '~/composables/useSupabase'
import { defineAsyncComponent } from 'vue'
import SavtaIcon from '~/components/SavtaIcon.vue'

// Import PdfViewer component
const PdfViewer = defineAsyncComponent(() => import('~/components/PdfViewer.vue'))
import { useMemoryStudioUI } from '~/composables/useMemoryStudioUI'
import { useMemoryBookOperations } from '~/composables/useMemoryBookOperations'
import { useProgressDialog } from '~/composables/useProgressDialog'

// Components
import ViewToggle from '~/components/ViewToggle.vue'
import MemoryStudioHero from '~/components/MemoryStudioHero.vue'
import MemoryStudioPagination from '~/components/MemoryStudioPagination.vue'
import MemoryStudioEmptyState from '~/components/MemoryStudioEmptyState.vue'
import MemoryCard from '~/components/MemoryCard.vue'
import MemoryBook from '~/components/MemoryBook.vue'
import MemoryBookDialog from '~/components/MemoryBookDialog.vue'
import MagicMemoryWizard from '~/components/MagicMemoryWizard.vue'
import SavtaBubble from '~/components/SavtaBubble.vue'
import CaptionRenderer from '~/components/CaptionRenderer.vue'

// Composables
const router = useRouter()
const user = useSupabaseUser()
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
  loadMemoryBooks,
  formatDate,
  getStatusText,
  getStatusClass,
  getStatusBadgeClass,
  getStatusIcon,
  getFileTypeDisplay,
  getFileTypeIcon,
  getFileTypeColor,
  getAssetThumbnail,
  getFirstAssetThumbnail,
  getStatusSeverity,
  loadAssetThumbnails
} = useMemoryStudio()

const {
  activeView,
  showCreateModal,
  selectedPhotosForMemoryBook,
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

// Import Supabase for database operations
const supabase = useNuxtApp().$supabase

// Magic Memory Wizard
const magicMemoryWizardRef = ref(null)

// Upload dialog state
const showUploadDialog = ref(false)
const shouldOpenWizardAfterUpload = ref(false)
const showSpecialUploadMessaging = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref('')
const uploadingFiles = ref([])
const uploadedFiles = ref([])
const failedFiles = ref([])
const isUploading = ref(false)

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

// Import progress dialog functions
const {
  startProgressPolling,
  stopProgressPolling,
  generatePDF
} = useProgressDialog()

// PDF-related variables
const isChrome = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)

// Dialog state for quick actions
const showGenerateDialog = ref(false)
const showRegenerateDialog = ref(false)
const pendingBook = ref(null)

// New user guidance and auto-generation state
const newlyCreatedBook = ref(null)
const showSavtaBubble = ref(false)
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
  navigateTo('/app/memory-books/trash')
}

const openMagicMemoryDialog = (type) => {
  // Check if user is authenticated
  if (!user.value) {
    console.log('🔐 User not authenticated, redirecting to login')
    navigateTo('/app/login')
    return
  }
  
  if (magicMemoryWizardRef.value) {
    magicMemoryWizardRef.value.openMagicMemoryDialog(type)
  }
}


const onGenerateClick = (book) => {
  pendingBook.value = book
  showGenerateDialog.value = true
}

const onDownloadClick = async (book) => {
  try {
    if (book.status === 'draft') {
      // For draft books, we need to generate them first
      console.log('Draft book clicked - would need to generate first:', book)
      // TODO: Implement draft generation dialog
    } else {
      // For ready books, download/view the PDF
      await downloadPDF(book)
    }
  } catch (error) {
    console.error('Error handling download click:', error)
  }
}

const downloadPDF = async (book) => {
  try {
    // Use the viewPDF function from useMemoryBookOperations
    if (book.pdf_url) {
      await viewPDF(book.pdf_url, book.id)
    } else {
      console.error('No PDF URL available for book:', book.id)
    }
  } catch (error) {
    console.error('Error downloading PDF:', error)
  }
}

// Force download PDF (for details modal)
const forceDownloadPDF = async (book) => {
  try {
    if (book.pdf_url) {
      await viewPDF(book.pdf_url, book.id)
    } else {
      console.error('No PDF URL available for book:', book.id)
    }
  } catch (error) {
    console.error('Error force downloading PDF:', error)
  }
}

// Regenerate book
const onRegenerateClick = (book) => {
  if (book.status === 'background_ready') {
    console.log('⚠️ Cannot regenerate book that is still being processed')
    return
  }
  pendingBook.value = book
  showRegenerateDialog.value = true
}

// Open select memories dialog
const openSelectMemoriesDialog = async () => {
  // For now, just show a message - this would open the asset selection dialog
  console.log('Open select memories dialog - would open asset selection modal')
  // TODO: Implement the full asset selection dialog
}

// Open edit settings
const openEditSettings = async (book) => {
  // For now, just show a message - this would open the edit settings dialog
  console.log('Open edit settings for book:', book)
  // TODO: Implement the full edit settings dialog
}

// Confirm generate action
const confirmGenerate = () => {
  showGenerateDialog.value = false
  if (pendingBook.value) {
    // Use the magic memory wizard to generate the book
    magicMemoryWizardRef.value.openMagicMemoryDialog('quick', pendingBook.value)
  }
  pendingBook.value = null
}

// Confirm regenerate action
const confirmRegenerate = () => {
  showRegenerateDialog.value = false
  if (pendingBook.value) {
    // Close the details modal so progress window is visible
    showDetailsModal.value = false
    // Use the magic memory wizard to regenerate the book
    magicMemoryWizardRef.value.openMagicMemoryDialog('quick', pendingBook.value)
  }
  pendingBook.value = null
}

// Cancel dialogs
const cancelDialog = () => {
  showGenerateDialog.value = false
  showRegenerateDialog.value = false
  pendingBook.value = null
}

// Confirm delete book
const confirmDeleteBook = (book) => {
  bookToDelete.value = book.id
  showDeleteDialog.value = true
}

// Wrapper for viewBookDetails that also loads asset thumbnails
const handleViewBookDetails = async (book) => {
  try {
    // Call the original viewBookDetails function
    await viewBookDetails(book)
    
    // Load asset thumbnails for this book
    if (book.created_from_assets && book.created_from_assets.length > 0) {
      console.log('🖼️ Loading asset thumbnails for book:', book.id, 'assets:', book.created_from_assets)
      await loadAssetThumbnails(book)
    }
  } catch (error) {
    console.error('❌ Error viewing book details:', error)
  }
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
  // Use the same logic as view details
  handleViewBookDetails(book)
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
            const result = await deleteBookOperation(bookToDelete.value)
            showDeleteDialog.value = false
            bookToDelete.value = null
            // Close the detailed dialog since the book no longer exists
            showDetailsModal.value = false
            // Reload memory books to update list
            await loadMemoryBooks()
          } catch (error) {
            console.error('❌ Failed to delete book:', error)
            showDeleteDialog.value = false
            bookToDelete.value = null
          }
        }

// Create memory book from dialog (matches original implementation)
const createMemoryBookFromDialog = async (data) => {
  console.log('🔧 [createMemoryBookFromDialog] Starting with data:', data)
  
  // Check if assets are selected (matches original validation)
  if (!data.selectedAssets || data.selectedAssets.length === 0) {
    // Show dialog explaining the requirement
    console.warn('No assets selected for memory book creation')
    // TODO: Add toast notification for missing assets
    return // Don't proceed with creation
  }
  
  try {
    creatingBook.value = true
    
    // Map dialog data to the structure expected by createBook (matches original)
    const mappedData = {
      ai_supplemental_prompt: data.ai_supplemental_prompt,
      layoutType: data.layoutType,
      printSize: data.printSize,
      quality: data.quality,
      medium: data.medium,
      theme_id: data.theme_id,
      gridLayout: data.gridLayout,
      memoryShape: data.memoryShape,
      includeCaptions: data.includeCaptions,
      aiBackground: data.backgroundType === 'magical',
      backgroundOpacity: data.backgroundOpacity || 30,
      memoryEvent: data.memoryEvent,
      customMemoryEvent: data.customMemoryEvent,
      // Store selected asset IDs for the photo selection pool
      selectedAssetIds: Array.isArray(data.selectedAssets) ? data.selectedAssets.map(a => a.id) : []
    }
    
    console.log('🔧 [createMemoryBookFromDialog] Mapped data:', mappedData)
    
    // Call the createBook function from useMemoryBookOperations
    const createdBook = await createBook(mappedData)
    console.log('🔧 [createMemoryBookFromDialog] createBook completed successfully:', createdBook)
    
    // Set the newly created book for auto-generation
    newlyCreatedBook.value = createdBook
    
    // Close the create dialog after successful creation
    showCreateModal.value = false
    showSuccessDialog.value = true
    resetCreateModal()
    
    // Clear selected photos for memory book
    selectedPhotosForMemoryBook.value = []
    
    // Reload memory books to show new book
    await loadMemoryBooks()
    
    // Auto-generate and display the PDF immediately (like original)
    if (newlyCreatedBook.value) {
      console.log('🔧 [createMemoryBookFromDialog] Starting auto-generation and display...')
      await composeNewlyCreatedMemory()
    }
    
  } catch (error) {
    console.error('❌ [createMemoryBookFromDialog] Error:', error)
    throw error
  } finally {
    creatingBook.value = false
  }
}

// Keep the original function name for backward compatibility
const createMemoryBook = createMemoryBookFromDialog

// Calculate compose time for newly created book
const calculateComposeTime = () => {
  if (!newlyCreatedBook.value) return 0
  
  let totalTime = 0
  
  // Add base time for custom background only if special background was selected
  if (newlyCreatedBook.value.background_type === 'magical') {
    totalTime += 20 // 20 seconds for custom background generation
  }
  
  // Add 10 seconds per photo
  const photoCount = newlyCreatedBook.value.photo_selection_pool?.length || 
                    newlyCreatedBook.value.created_from_assets?.length || 0
  totalTime += photoCount * 10
  
  return totalTime
}

// Compose newly created memory
const composeNewlyCreatedMemory = async () => {
  if (!newlyCreatedBook.value) {
    console.error('No newly created book found')
    return
  }
  
  console.log('🔧 [composeNewlyCreatedMemory] Starting composition for book:', newlyCreatedBook.value.id)
  
  // Find the book in the current memory books list
  const book = memoryBooks.value.find(b => b.id === newlyCreatedBook.value.id)
  if (!book) {
    console.error('Could not find newly created book in memory books list')
    return
  }
  
  try {
    // Step 1: Photo Selection (if needed)
    if (!book.created_from_assets || book.created_from_assets.length === 0) {
      console.log('🔧 [composeNewlyCreatedMemory] Setting up photo selection...')
      currentProgressMessage.value = '🎯 Setting up your selected photos...'
      
      // Use the selected assets from the dialog
      if (newlyCreatedBook.value.selectedAssetIds && newlyCreatedBook.value.selectedAssetIds.length > 0) {
        // Update the book with selected assets
        const { error } = await supabase
          .from('memory_books')
          .update({ created_from_assets: newlyCreatedBook.value.selectedAssetIds })
          .eq('id', book.id)
        
        if (error) throw error
        
        console.log('🔧 [composeNewlyCreatedMemory] Photo selection completed - using manually selected photos')
      } else {
        throw new Error('No photos available for memory book')
      }
    }
    
    // Step 2: PDF Generation (includes story generation)
    console.log('🔧 [composeNewlyCreatedMemory] Starting PDF generation...')
    currentProgressMessage.value = '📝 Generating story and creating your memory...'
    
    // Start progress polling
    startProgressPolling(book.id)
    
    // Generate PDF
    await generatePDF(book)
    
    console.log('🔧 [composeNewlyCreatedMemory] PDF generation completed successfully')
    
  } catch (error) {
    console.error('❌ [composeNewlyCreatedMemory] Error:', error)
    stopProgressPolling()
    showProgressDialog.value = false
    throw error
  } finally {
    // Clear the reference
    newlyCreatedBook.value = null
  }
}

// Helper function to format date range for display
const formatDateRange = (dateRange) => {
  if (!dateRange.start && !dateRange.end) return 'any date'
  if (dateRange.start && dateRange.end) {
    return `${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}`
  }
  if (dateRange.start) {
    return `from ${new Date(dateRange.start).toLocaleDateString()}`
  }
  if (dateRange.end) {
    return `until ${new Date(dateRange.end).toLocaleDateString()}`
  }
  return 'any date'
}


// Watch for conditions to show Savta bubble
watch([memoryCards, memoryBooksOnly, activeView], ([cards, books, view]) => {
  // Show bubble when user has no memory books at all (cards or books)
  const totalMemoryBooks = cards.length + books.length
  showSavtaBubble.value = totalMemoryBooks === 0
  console.log('🔍 [SavtaBubble] totalMemoryBooks:', totalMemoryBooks, 'showSavtaBubble:', showSavtaBubble.value)
}, { immediate: true })

// Watch for create modal to check authentication
watch(showCreateModal, (newValue) => {
  if (newValue && !user.value) {
    console.log('🔐 User not authenticated, redirecting to login instead of opening create modal')
    showCreateModal.value = false // Close the modal
    navigateTo('/app/login')
  }
})

// File selection function
const selectFiles = () => {
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.multiple = true
  fileInput.accept = 'image/jpeg,image/jpg,image/png,image/gif'
  
  fileInput.onchange = async (event) => {
    const files = Array.from(event.target.files)
    if (files.length === 0) return

    // Validate files
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        console.error('Only JPG, PNG, or GIF images are allowed.')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        console.error(`The file "${file.name}" is too large. Please select images smaller than 10MB.`)
        return
      }
    }
    await startUpload(files)
  }
  
  fileInput.click()
}

// Start upload process
const startUpload = async (files) => {
  isUploading.value = true
  uploadProgress.value = 0
  uploadStatus.value = '✨ Preparing special upload... ✨'
  uploadedFiles.value = []
  failedFiles.value = []
  
  // Initialize file tracking
  uploadingFiles.value = files.map(file => ({
    name: file.name,
    file: file,
    status: 'pending'
  }))
  
  const db = useDatabase()
  const totalFiles = files.length
  let completedFiles = 0
  
  for (let i = 0; i < files.length; i++) {
    const fileData = uploadingFiles.value[i]
    const file = fileData.file
    
    // Update progress
    uploadProgress.value = Math.round(((i + 1) / totalFiles) * 100)
    uploadStatus.value = `📸 Processing "${file.name}"...`
    
    try {
      // Update status to uploading
      fileData.status = 'uploading'
      
      // Upload asset with approved status
      const asset = await db.assets.uploadAsset({
        type: 'photo',
        title: file.name,
        user_caption: '',
        approved: true
      }, file)
      
      // Update status to processing
      fileData.status = 'processing'
      
      // Process with AI
      const aiResult = await $fetch('/api/ai/process-asset', {
        method: 'POST',
        body: {
          assetId: asset.id,
          assetType: 'photo',
          storageUrl: asset.storage_url
        }
      })
      
      // Mark as completed
      fileData.status = 'completed'
      uploadedFiles.value.push({
        name: file.name,
        id: asset.id
      })
      completedFiles++
      
    } catch (error) {
      console.error(`❌ Failed to upload ${file.name}:`, error)
      fileData.status = 'failed'
      failedFiles.value.push({
        name: file.name,
        error: error.message || 'Upload failed'
      })
      completedFiles++
    }
  }
  
  // Update final status
  uploadStatus.value = completedFiles > 0 ? '✨ Upload complete! ✨' : '❌ Upload failed'
  isUploading.value = false
  
  if (completedFiles > 0) {
    console.log(`✨ Successfully uploaded ${uploadedFiles.value.length} photos!`)
  }
}

// Finish upload and close dialog
const finishUpload = async () => {
  showUploadDialog.value = false
  // Reset state
  uploadingFiles.value = []
  uploadedFiles.value = []
  failedFiles.value = []
  uploadProgress.value = 0
  uploadStatus.value = ''
  showSpecialUploadMessaging.value = false
  
  // Check if we should open wizard after upload
  if (shouldOpenWizardAfterUpload.value) {
    shouldOpenWizardAfterUpload.value = false
    // Small delay to ensure assets are updated
    setTimeout(() => {
      magicMemoryWizardRef.value?.openMagicMemoryDialog('quick')
    }, 1000)
  }
}

// Reset upload dialog state
const resetUploadDialog = () => {
  if (!isUploading.value) {
    uploadingFiles.value = []
    uploadedFiles.value = []
    failedFiles.value = []
    uploadProgress.value = 0
    uploadStatus.value = ''
    showSpecialUploadMessaging.value = false
  }
}

// Watch for view changes to reset pagination
watch(activeView, () => {
  currentCardsPage.value = 1
  currentBooksPage.value = 1
})

// Access route at top-level so we can react to query param changes even when the page doesn't remount
const route = useRoute()

// Handle return from photo selection routes
watch(() => route.query, (newQuery) => {
  // Handle return from wizard photo selection
  if (newQuery.wizardStep === 'photos' && newQuery.selectedPhotos) {
    console.log('🔍 [Memory Books] Returning from photo selection to wizard')
    // Reopen wizard at photos step with selected photos
    const selectedPhotoIds = newQuery.selectedPhotos.split(',')
    // TODO: Pass selected photos to wizard
    openMagicMemoryDialog('quick')
    // Clear query params
    router.replace({ query: {} })
  }
  
  // Handle return from memory book photo selection
  if (newQuery.createBook === 'true' && newQuery.selectedPhotos) {
    console.log('🔍 [Memory Books] Returning from photo selection to create memory book')
    const selectedPhotoIds = newQuery.selectedPhotos.split(',')
    
    // Store selected photos for the memory book dialog
    selectedPhotosForMemoryBook.value = selectedPhotoIds
    
    // Open the memory book dialog
    showCreateModal.value = true
    
    // Clear query params
    router.replace({ query: {} })
  }
}, { deep: true })

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

    // Listen for page visibility changes to refresh when returning from other pages
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔍 [Memory Books] Page became visible, refreshing memory books list')
        loadMemoryBooks()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Also listen for focus events (when user returns to tab)
    window.addEventListener('focus', () => {
      console.log('🔍 [Memory Books] Window focused, refreshing memory books list')
      loadMemoryBooks()
    })

    // Note: Upload dialog handling moved to dedicated /upload route
  }
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('view-pdf', () => {})
    document.removeEventListener('visibilitychange', () => {})
    window.removeEventListener('focus', () => {})
  }
})
</script>

<style scoped>
/* Magic upload dialog styling */
.magic-upload-dialog {
  box-shadow: 0 0 32px 12px #fbbf24, 0 0 48px 24px #a78bfa;
  border: 2px solid #a78bfa;
  background: linear-gradient(135deg, #fef9c3 0%, #f3e8ff 100%);
}
</style>
