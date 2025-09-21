<template>
  <div class="min-h-screen bg-brand-background p-4 no-zoom mobile-no-pan">
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
        :initialPhotoSelectionMethod="photoSelectionMethodForMemoryBook"
        :loading="creatingBook"
        @close="closeCreateModal"
        @submit="createMemoryBookFromDialog"
      />

      <!-- Book Details Modal -->
      <Dialog
        v-model:visible="showDetailsModal"
        modal
        :closable="false"
        :dismissable-mask="true"
        :class="['w-full', 'h-full', 'max-w-none', 'max-h-screen', 'sm:max-h-[95%]', 'sm:w-[95vw]', 'sm:max-w-4xl', 'sm:h-auto', 'm-0', 'rounded-none', 'sm:rounded-2xl', 'mobile-app-dialog']"
      >
        <div v-if="selectedBook" class="sm:mb-5 bg-gradient-to-br from-brand-navigation/10 via-brand-accent/5 to-brand-highlight/10 min-h-screen sm:min-h-[90%] flex flex-col sm:h-auto sm:overflow-hidden">
          <!-- Header + Content Area -->
          <div class="flex-1 sm:max-h-[calc(85vh-80px)] sm:overflow-y-auto">
            <!-- Header Section - Compact on mobile -->
            <div class="bg-gradient-to-br from-white via-brand-navigation/5 to-brand-accent/10 rounded-t-2xl shadow-lg border border-gray-100 p-3 sm:p-6">
              <!-- Mobile: Compact header -->
            <div class="sm:hidden">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 bg-gradient-to-br from-brand-secondary to-brand-highlight rounded-full flex items-center justify-center">
                    <i class="pi pi-gift text-white text-sm"></i>
                  </div>
                  <div class="min-w-0 flex-1">
                    <h2 class="text-base font-bold text-gray-900 truncate">{{ selectedBook.ai_supplemental_prompt || ('Memory Book #' + selectedBook.id.slice(-6)) }}</h2>
                    <div :class="getStatusBadgeClass(selectedBook.status)" class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold">
                      <i :class="getStatusIcon(selectedBook.status)" class="text-xs"></i>
                      <span>{{ getStatusText(selectedBook.status).substring(0, 8) }}</span>
                    </div>
                  </div>
                </div>
                <button
                  data-testid="details-close-button"
                  class="border-0 flex items-center justify-center gap-1 bg-brand-dialog-cancel text-white font-bold rounded-full px-3 py-2 text-xs shadow transition-all duration-200"
                  @click="showDetailsModal = false"
                >
                  <i class="pi pi-times text-xs"></i>
                  <span>Close</span>
                </button>
              </div>
              <!-- Mobile: Essential info only -->
              <div class="grid grid-cols-3 gap-2 text-xs">
                <div class="bg-white/80 rounded-lg p-2 border border-gray-200 text-center">
                  <div class="text-gray-600 mb-1">Assets</div>
                  <div class="font-semibold text-gray-900">{{ selectedBook.created_from_assets?.length || 0 }}</div>
                </div>
                <div class="bg-white/80 rounded-lg p-2 border border-gray-200 text-center">
                  <div class="text-gray-600 mb-1">Format</div>
                  <div class="font-semibold text-gray-900">{{ selectedBook.format || 'book' }}</div>
                </div>
                <div class="bg-white/80 rounded-lg p-2 border border-gray-200 text-center">
                  <div class="text-gray-600 mb-1">Created</div>
                  <div class="font-semibold text-gray-900">{{ formatDate(selectedBook.created_at).split(' ')[0] }}</div>
                </div>
              </div>
            </div>

            <!-- Desktop: Full header -->
            <div class="hidden sm:block">
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

              <!-- Desktop: Full info cards -->
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
              
              <!-- Desktop: Additional info cards -->
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

              <!-- Desktop: Review notes -->
              <div v-if="selectedBook.review_notes" class="mt-4 bg-gradient-to-br from-brand-highlight/10 to-brand-accent/10 rounded-xl p-3 sm:p-4 border border-brand-highlight/20">
                <div class="flex items-center gap-2 mb-2">
                  <i class="pi pi-comment text-brand-highlight text-sm"></i>
                  <span class="text-sm font-semibold text-brand-highlight">Review Notes</span>
                </div>
                <p class="text-xs sm:text-sm text-brand-highlight italic">{{ selectedBook.review_notes }}</p>
              </div>
            </div>
            </div>
            
            <!-- Content Section -->
            <div class="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-4 mb-5 sm:mb-0">
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
              <div class="bg-gradient-to-br from-brand-highlight/10 to-brand-primary/10 rounded-xl p-3 sm:p-4 border border-brand-primary/20 text-brand-primary text-sm magic-story" style="word-break: break-word; line-height: 1.5;">
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
              <div class="bg-gradient-to-br from-brand-accent/10 to-brand-highlight/10 rounded-xl p-3 sm:p-4 border border-brand-accent/20 text-brand-primary text-sm" style="word-break: break-word; line-height: 1.5;">
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
            <div v-if="selectedBook.pdf_url" class="mb-10 sm:mb-5 bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
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
                  <span>Click download to save your memory as a {{ getFileTypeDisplay(selectedBook) }} file to your device</span>
                </div>
              </div>
            </div>
            </div>
          </div>

          <!-- Actions Section - Fixed at bottom on both mobile and desktop -->
          <div class="bg-white rounded-b-2xl shadow-lg border border-gray-100 py-0.5 px-1 sm:p-3 fixed bottom-0 left-0 right-0 sm:fixed sm:bottom-0 sm:left-0 sm:right-0 sm:rounded-b-2xl sm:shadow-2xl sm:border-t-2 sm:border-gray-200">
            <!-- Mobile: Compact icon buttons in one row -->
            <div class="sm:hidden mr-20 mt-3 -mb-4">
              <div class="flex justify-start gap-0.5 px-1">
                <button
                  data-testid="details-create-memory-button"
                  v-if="selectedBook.status === 'draft'"
                  class="flex flex-col items-center justify-center bg-brand-dialog-save text-white font-bold rounded-lg px-1 py-0.5 text-xs shadow-lg transition-all duration-200 flex-1"
                  @click="onGenerateClick(selectedBook)"
                >
                  <i class="pi pi-magic-wand text-xs mb-0.5"></i>
                  <span class="text-xs">Create</span>
                </button>
                <button
                  data-testid="details-recreate-button"
                  v-if="selectedBook.status === 'ready' || selectedBook.status === 'background_ready'"
                  class="flex flex-col items-center justify-center bg-brand-dialog-edit text-white font-bold rounded-lg px-1 py-0.5 text-xs shadow-lg transition-all duration-200 flex-1"
                  @click="onRegenerateClick(selectedBook)"
                  :class="{ 'opacity-50': selectedBook.status === 'background_ready' }"
                >
                  <i class="pi pi-refresh text-xs mb-0.5"></i>
                  <span class="text-xs">{{ selectedBook.status === 'background_ready' ? 'Processing' : 'Edit' }}</span>
                </button>
                <button
                  data-testid="details-approve-button"
                  v-if="selectedBook.status === 'ready'"
                  class="flex flex-col items-center justify-center bg-brand-dialog-save text-white font-bold rounded-lg px-1 py-0.5 text-xs shadow-lg transition-all duration-200 flex-1"
                  @click="approveBook(selectedBook.id)"
                >
                  <i class="pi pi-check text-xs mb-0.5"></i>
                  <span class="text-xs">Approve</span>
                </button>
                <button
                  data-testid="details-edit-settings-button"
                  v-if="selectedBook && selectedBook.format !== 'card'"
                  class="flex flex-col items-center justify-center bg-brand-dialog-edit text-white font-bold rounded-lg px-1 py-0.5 text-xs shadow-lg transition-all duration-200 flex-1"
                  @click="openEditSettings(selectedBook)"
                >
                  <i class="pi pi-cog text-xs mb-0.5"></i>
                  <span class="text-xs">Settings</span>
                </button>
                <button
                  data-testid="details-trash-button"
                  v-if="selectedBook"
                  class="flex flex-col items-center justify-center bg-brand-dialog-delete text-white font-bold rounded-lg px-1 py-0.5 text-xs shadow-lg transition-all duration-200 flex-1"
                  @click="confirmDeleteBook(selectedBook)"
                >
                  <i class="pi pi-trash text-xs mb-0.5"></i>
                  <span class="text-xs">Trash</span>
                </button>
              </div>
            </div>

            <!-- Desktop: Full buttons -->
            <div class="hidden sm:block">
              <div class="flex flex-row flex-wrap justify-center gap-2 sm:gap-2">
                <button
                  data-testid="details-create-memory-button"
                  v-if="selectedBook.status === 'draft'"
                  class="border-0 flex items-center justify-center gap-2 bg-brand-dialog-save text-white font-bold rounded-full px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm shadow-lg transition-all duration-200 w-auto sm:min-w-[120px]"
                  @click="onGenerateClick(selectedBook)"
                >
                  <i class="pi pi-magic-wand text-xs sm:text-sm"></i>
                  <span>Create Memory</span>
                </button>
                <button
                  data-testid="details-recreate-button"
                  v-if="selectedBook.status === 'ready' || selectedBook.status === 'background_ready'"
                  class="border-0 flex items-center justify-center gap-2 bg-brand-dialog-edit text-white font-bold rounded-full px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm shadow-lg transition-all duration-200 w-auto sm:min-w-[120px]"
                  @click="onRegenerateClick(selectedBook)"
                  :class="{ 'opacity-50': selectedBook.status === 'background_ready' }"
                >
                  <i class="pi pi-refresh text-xs sm:text-sm"></i>
                  <span>{{ selectedBook.status === 'background_ready' ? 'Processing ...' : 'Edit/Revise' }}</span>
                </button>
                <button
                  data-testid="details-approve-button"
                  v-if="selectedBook.status === 'ready'"
                  class="border-0 flex items-center justify-center gap-2 bg-brand-dialog-save text-white font-bold rounded-full px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm shadow-lg transition-all duration-200 w-auto sm:min-w-[120px]"
                  @click="approveBook(selectedBook.id)"
                  v-tooltip.top="'Approve this Book and I\'ll Send it Out For You'"
                >
                  <i class="pi pi-check text-xs sm:text-sm"></i>
                  <span>Approve</span>
                </button>
                <button
                  data-testid="details-edit-settings-button"
                  v-if="selectedBook && selectedBook.format !== 'card'"
                  class="border-0 flex items-center justify-center gap-2 bg-brand-dialog-edit text-white font-bold rounded-full px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm shadow-lg transition-all duration-200 w-auto sm:min-w-[120px]"
                  @click="openEditSettings(selectedBook)"
                >
                  <i class="pi pi-cog text-xs sm:text-sm"></i>
                  <span>Edit Settings</span>
                </button>
                <button
                  data-testid="details-trash-button"
                  v-if="selectedBook"
                  class="border-0 flex items-center justify-center gap-2 bg-brand-dialog-delete text-white font-bold rounded-full px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm shadow-lg transition-all duration-200 w-auto sm:min-w-[120px]"
                  @click="confirmDeleteBook(selectedBook)"
                >
                  <i class="pi pi-trash text-xs sm:text-sm"></i>
                  <span>Trash</span>
                </button>
              </div>
            </div>
          </div>
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
            This will allow you to modify any of the settings you previously chose. 
            You can keep all the same photos or selectively replace some photos with new ones.
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

      <!-- Progress Dialog - Using shared component like magic wizard -->
      <ProgressDialog
        :show-progress-dialog="showProgressDialog"
        :current-progress="currentProgress"
        :current-progress-message="currentProgressMessage"
        :is-regenerating="isRegenerating"
      />

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

      <!-- Savta Bubble Component (now uses HTML + actions) -->
      <SavtaBubble
        v-model:open="showSavtaBubble"
        placement="center"
        :offset="0"
        heading="Hi, I'm Savta and I'm here to help you get started!"
        variant="instruction"
        :dismissible="true"
        :show-avatar="true"
      >
        <div class="space-y-3 text-gray-700">
          <p class="text-base">
            Let’s create your first memory card.
          </p>

          <p class="text-base text-brand-highlight font-semibold">
            This isn’t another photo printing service. Savta’s little bit of AI magic selects and layouts your 
            photos into gorgeous multi‑photo cards—zero fuss. No more dragging photos into layouts.
          </p>

          <ol class="list-decimal pl-5 space-y-1">
            <li>Answer a couple of quick questions about the look.</li>
            <li>Upload just your favorite photos to your Photo Box.</li>
            <li>I’ll pick photos that belong together, arrange them beautifully, and write warm captions.</li>
          </ol>

          <p class="text-sm text-gray-600">
            Tip: Share more favorites for better results. 📸
          </p>
        </div>

        <template #actions>
          <button
            class="mt-3 inline-flex items-center justify-center gap-2 bg-brand-dialog-edit hover:bg-brand-primary/90 text-white font-medium rounded-lg px-5 py-2 transition-colors"
            @click="openMagicMemoryDialog('quick'); showSavtaBubble = false"
            type="button"
          >
            ✨ Start Creating
          </button>
        </template>
      </SavtaBubble>

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
import ProgressDialog from '~/components/ProgressDialog.vue'
import MemoryBook from '~/components/MemoryBook.vue'
import MemoryBookDialog from '~/components/MemoryBookDialog.vue'
import MagicMemoryWizard from '~/components/MagicMemoryWizard.vue'
import SavtaBubble from '~/components/SavtaBubble.vue'
import CaptionRenderer from '~/components/CaptionRenderer.vue'

// Composables
const router = useRouter()
const user = useSupabaseUser()
const {
  memoryBooks,
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
  showApprovalDialog,
  showDeleteDialog,
  showMemoryBooksInfoBubble,
  creatingBook,
  pendingApprovalBookId,
  bookToDelete,
  closeCreateModal,
  resetCreateModal
} = useMemoryStudioUI()

// Photo selection method for memory book
const photoSelectionMethodForMemoryBook = ref('last_100')

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
  showProgressDialog,
  currentProgress,
  currentProgressMessage,
  isRegenerating,
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
  
  // Reload memory books to show any new items that may have been created
  console.log('🔍 [Memory Books] PDF modal closed, reloading memory books')
  loadMemoryBooks()
}

const navigateToTrash = () => {
  navigateTo('/app/memory-books/trash')
}

// Helper function to emit memory book update events
const emitMemoryBookUpdate = (bookId = null, action = 'updated') => {
  if (process.client) {
    window.dispatchEvent(new CustomEvent('memory-book-updated', {
      detail: { bookId, action }
    }))
  }
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
    console.log('🔍 [Memory Books] Opening book details for:', book.id)
    
    // Call the original viewBookDetails function first
    await viewBookDetails(book)
    
    // Load asset thumbnails for this book in the background
    if (book.created_from_assets && book.created_from_assets.length > 0) {
      console.log('🖼️ Loading asset thumbnails for book:', book.id, 'assets:', book.created_from_assets)
      // Don't await this - let it load in the background to avoid blocking the modal
      loadAssetThumbnails(book).catch(error => {
        console.error('❌ Error loading asset thumbnails:', error)
      })
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
    const bookId = pendingApprovalBookId.value
    pendingApprovalBookId.value = null
    // Emit event to update memory books
    emitMemoryBookUpdate(bookId, 'approved')
  } catch (error) {
    console.error('Failed to approve book:', error)
  }
}

const unapproveBook = async (bookId) => {
  try {
    await unapproveBookOperation(bookId)
    // Emit event to update memory books
    emitMemoryBookUpdate(bookId, 'unapproved')
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
            const bookId = bookToDelete.value
            const result = await deleteBookOperation(bookId)
            showDeleteDialog.value = false
            bookToDelete.value = null
            // Close the detailed dialog since the book no longer exists
            showDetailsModal.value = false
            // Emit event to update memory books
            emitMemoryBookUpdate(bookId, 'deleted')
          } catch (error) {
            console.error('❌ Failed to delete book:', error)
            showDeleteDialog.value = false
            bookToDelete.value = null
          }
        }

// Create memory book from dialog (matches original implementation)
const createMemoryBookFromDialog = async (data) => {
  console.log('🔧 [createMemoryBookFromDialog] Starting with data:', data)
  
  // Check if we have either manually selected assets or a photo selection pool
  const hasManualAssets = data.selectedAssets && data.selectedAssets.length > 0
  const hasPhotoSelectionPool = data.photo_selection_pool && data.photo_selection_pool.length > 0
  
  if (!hasManualAssets && !hasPhotoSelectionPool) {
    // Show dialog explaining the requirement
    console.warn('No assets selected and no photo selection pool for memory book creation')
    // TODO: Add toast notification for missing assets
    return // Don't proceed with creation
  }
  
  console.log('🔧 [createMemoryBookFromDialog] Validation passed - hasManualAssets:', hasManualAssets, 'hasPhotoSelectionPool:', hasPhotoSelectionPool)
  
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
      pageCount: data.page_count || 1,
      memoryShape: data.memoryShape,
      includeCaptions: data.includeCaptions,
      aiBackground: data.backgroundType === 'magical',
      backgroundOpacity: data.backgroundOpacity || 30,
      memoryEvent: data.memoryEvent,
      customMemoryEvent: data.customMemoryEvent,
      // Use photo selection pool (up to 100 photos for AI selection)
      selectedAssetIds: data.photo_selection_pool || (Array.isArray(data.selectedAssets) ? data.selectedAssets.map(a => a.id) : []),
      photo_selection_pool: data.photo_selection_pool || []
    }
    
    console.log('🔧 [createMemoryBookFromDialog] Mapped data:', mappedData)
    console.log('🔧 [createMemoryBookFromDialog] Photo selection pool in mapped data:', mappedData.photo_selection_pool)
    console.log('🔧 [createMemoryBookFromDialog] Photo selection pool length:', mappedData.photo_selection_pool?.length)
    
    // Call the createBook function from useMemoryBookOperations
    const createdBook = await createBook(mappedData)
    console.log('🔧 [createMemoryBookFromDialog] createBook completed successfully:', createdBook)
    
    // Set the newly created book for auto-generation with all necessary fields
    newlyCreatedBook.value = {
      ...createdBook,
      layout_type: mappedData.layoutType,
      theme_id: mappedData.themeId,
      background_type: mappedData.backgroundType,
      ai_supplemental_prompt: mappedData.ai_supplemental_prompt,
      output: mappedData.output,
      print_size: mappedData.printSize,
      background_color: mappedData.backgroundColor,
      background_opacity: mappedData.backgroundOpacity,
      memory_event: mappedData.memoryEvent,
      custom_memory_event: mappedData.customMemoryEvent,
      include_captions: mappedData.includeCaptions,
      include_tags: mappedData.includeTags,
      ai_background: mappedData.aiBackground,
      memory_shape: mappedData.memoryShape,
      grid_layout: mappedData.gridLayout,
      page_count: mappedData.pageCount,
      auto_enhance: mappedData.autoEnhance,
      photo_selection_method: mappedData.photoSelectionMethod || 'last_100'
    }
    
    // Close the create dialog after successful creation
    showCreateModal.value = false
    resetCreateModal()
    
    // Clear selected photos for memory book
    selectedPhotosForMemoryBook.value = []
    
    // Reload memory books to show new book
    await loadMemoryBooks()
    
    // Start progress dialog and generation immediately (like wizard)
    if (newlyCreatedBook.value) {
      console.log('🔧 [createMemoryBookFromDialog] Starting progress dialog and generation...')
      // Show dialog immediately for user feedback (like wizard)
      showProgressDialog.value = true
      currentProgressMessage.value = '🎯 Starting memory book generation...'
      currentProgress.value = 0
      
      // Start the generation process immediately (like wizard)
      await generateMemoryBookPDF(newlyCreatedBook.value.id)
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

// Generate memory book PDF (like wizard's generateMagicMemory)
const generateMemoryBookPDF = async (bookId) => {
  try {
    console.log('🔍 [generateMemoryBookPDF] Starting memory book generation for:', bookId)
    
    // Update progress (like wizard)
    currentProgressMessage.value = '🎯 Selecting best photos...'
    currentProgress.value = 25
    
    // Start progress polling (like wizard)
    startProgressPolling(bookId, false)
    
    // Add a small delay to ensure database is updated
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Calculate photo count from grid layout
    const calculatedPhotoCount = newlyCreatedBook.value.grid_layout ? 
      (() => {
        // Calculate photo count from grid layout like the dialog does
        const gridLayout = newlyCreatedBook.value.grid_layout || '2x2'
        const [rows, cols] = gridLayout.split('x').map(Number)
        const memoriesPerPage = rows * cols
        const pageCount = newlyCreatedBook.value.page_count || 1
        const totalPhotos = memoriesPerPage * pageCount
        console.log('🔍 Photo count calculation:', {
          gridLayout,
          rows,
          cols,
          memoriesPerPage,
          pageCount,
          totalPhotos
        })
        return totalPhotos
      })() : 4 // Fallback to 4 if no grid layout

    console.log('🔍 Sending photoCount to AI:', calculatedPhotoCount)
    
    // Call the AI endpoint to select photos and generate content
    const aiRes = await $fetch('/api/ai/magic-memory', {
      method: 'POST',
      body: {
        memoryBookId: bookId,
        userId: user.value.id,
        photoCount: calculatedPhotoCount
      }
    })
    
    if (!aiRes.selected_photo_ids || !Array.isArray(aiRes.selected_photo_ids) || aiRes.selected_photo_ids.length < 1) {
      throw new Error(`I need a bit more to work with. Let me try again with different photos.`)
    }
    
    console.log('🔍 [generateMemoryBookPDF] AI photo selection completed:', aiRes.selected_photo_ids.length, 'photos selected')
    
    // Update progress
    currentProgressMessage.value = '🎨 Generating your memory book...'
    currentProgress.value = 50
    
    // Generate PDF - construct book object like the wizard does
    const book = {
      id: bookId,
      layout_type: newlyCreatedBook.value.layout_type || 'theme',
      ui: 'dialog',
      format: 'card',
      status: 'draft',
      photo_selection_pool: aiRes.photo_selection_pool || [],
      created_from_assets: aiRes.selected_photo_ids || [],
      theme_id: newlyCreatedBook.value.theme_id,
      background_type: newlyCreatedBook.value.background_type || 'white',
      ai_supplemental_prompt: newlyCreatedBook.value.ai_supplemental_prompt,
      output: newlyCreatedBook.value.output || 'JPG',
      print_size: newlyCreatedBook.value.print_size || '8.5x11',
      background_color: newlyCreatedBook.value.background_color,
      background_opacity: newlyCreatedBook.value.background_opacity || 30,
      memory_event: newlyCreatedBook.value.memory_event,
      custom_memory_event: newlyCreatedBook.value.custom_memory_event,
      include_captions: newlyCreatedBook.value.include_captions,
      include_tags: newlyCreatedBook.value.include_tags,
      ai_background: newlyCreatedBook.value.ai_background,
      memory_shape: newlyCreatedBook.value.memory_shape,
      grid_layout: newlyCreatedBook.value.grid_layout,
      auto_enhance: newlyCreatedBook.value.auto_enhance,
      photo_selection_method: newlyCreatedBook.value.photo_selection_method || 'last_100'
    }
    
    console.log('🔍 [generateMemoryBookPDF] Constructed book object:', book)
    await generatePDF(book)
    
    console.log('✅ [generateMemoryBookPDF] Memory book generation completed successfully')
    
  } catch (error) {
    console.error('❌ [generateMemoryBookPDF] Error:', error)
    currentProgressMessage.value = '❌ Generation failed. Please try again.'
    currentProgress.value = 0
    throw error
  }
}

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

// Debug initial route state
console.log('🔍 [Memory Books] Initial route state:', route.path, route.query)

// Check for return parameters on initial load
if (route.query.return === 'memory-book') {
  console.log('🔍 [Memory Books] Found return=memory-book on initial load')
  console.log('🔍 [Memory Books] Selected photos:', route.query.selectedPhotos)
  console.log('🔍 [Memory Books] Method:', route.query.method)
  
  // Handle return from memory book photo selection (new format)
  console.log('🔍 [Memory Books] Processing return from photo selection to create memory book (new format)')
  const selectedPhotoIds = route.query.selectedPhotos ? route.query.selectedPhotos.split(',') : []
  const method = route.query.method || 'last_100'
  
  console.log('🔍 [Memory Books] Selected photo IDs:', selectedPhotoIds)
  console.log('🔍 [Memory Books] Method:', method)
  
  // Store selected photos for the memory book dialog
  selectedPhotosForMemoryBook.value = selectedPhotoIds
  console.log('🔍 [Memory Books] Set selectedPhotosForMemoryBook:', selectedPhotosForMemoryBook.value)
  
  // Store the photo selection method for the dialog
  photoSelectionMethodForMemoryBook.value = method
  console.log('🔍 [Memory Books] Photo selection method:', method)
  
  // Open the memory book dialog
  showCreateModal.value = true
  console.log('🔍 [Memory Books] Opening memory book dialog')
  
  // Clear query params
  router.replace({ query: {} })
  console.log('🔍 [Memory Books] Cleared query params')
}

// Debug route changes
watch(() => route, (newRoute) => {
  console.log('🔍 [Memory Books] Route changed:', newRoute.path, newRoute.query)
}, { deep: true })

// Handle return from photo selection routes
watch(() => route.query, (newQuery) => {
  console.log('🔍 [Memory Books] Route query changed:', newQuery)
  console.log('🔍 [Memory Books] Current route:', route.path)
  console.log('🔍 [Memory Books] Full route object:', route)
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
  
  // Handle return from memory book photo selection (new format)
  if (newQuery.return === 'memory-book') {
    console.log('🔍 [Memory Books] Returning from photo selection to create memory book (new format)')
    console.log('🔍 [Memory Books] Full query params:', newQuery)
    const selectedPhotoIds = newQuery.selectedPhotos ? newQuery.selectedPhotos.split(',') : []
    const method = newQuery.method || 'last_100'
    
    console.log('🔍 [Memory Books] Selected photo IDs:', selectedPhotoIds)
    console.log('🔍 [Memory Books] Method:', method)
    
    // Store selected photos for the memory book dialog (can be empty for AI-driven methods)
    selectedPhotosForMemoryBook.value = selectedPhotoIds
    console.log('🔍 [Memory Books] Set selectedPhotosForMemoryBook:', selectedPhotosForMemoryBook.value)
    
    // Store the photo selection method for the dialog
    photoSelectionMethodForMemoryBook.value = method
    console.log('🔍 [Memory Books] Set photoSelectionMethodForMemoryBook:', photoSelectionMethodForMemoryBook.value)
    
    // Open the memory book dialog
    console.log('🔍 [Memory Books] Opening memory book dialog')
    showCreateModal.value = true
    console.log('🔍 [Memory Books] showCreateModal set to:', showCreateModal.value)
    
    // Clear query params
    router.replace({ query: {} })
    console.log('🔍 [Memory Books] Cleared query params')
  }
}, { deep: true })

// Function to scale Tawk widget on mobile using JavaScript
const scaleTawkWidgetMobile = () => {
  if (process.client && window.innerWidth <= 640) {
    // Use multiple approaches to catch the Tawk widget
    const scaleTawkWidget = () => {
      // Target the iframe
      const tawkIframe = document.querySelector('iframe[title="chat widget"]') || 
                        document.querySelector('iframe[id*="tawk"]') ||
                        document.querySelector('iframe[src*="tawk"]')
      
      if (tawkIframe) {
        // Override inline styles with JavaScript
        tawkIframe.style.setProperty('transform', 'scale(0.5)', 'important')
        tawkIframe.style.setProperty('transform-origin', 'bottom right', 'important')
        tawkIframe.style.setProperty('width', '64px', 'important')
        tawkIframe.style.setProperty('height', '60px', 'important')
        tawkIframe.style.setProperty('min-width', '64px', 'important')
        tawkIframe.style.setProperty('min-height', '60px', 'important')
        tawkIframe.style.setProperty('max-width', '64px', 'important')
        tawkIframe.style.setProperty('max-height', '60px', 'important')
        tawkIframe.style.setProperty('bottom', '10px', 'important')
        tawkIframe.style.setProperty('right', '10px', 'important')
        tawkIframe.style.setProperty('position', 'fixed', 'important')
        console.log('✅ Tawk widget scaled to 50% and repositioned')
      }
      
      // Also target the button inside the iframe
      const tawkButton = document.querySelector('button[aria-label="Chat widget"]') ||
                        document.querySelector('.tawk-button') ||
                        document.querySelector('.tawk-button-circle')
      
      if (tawkButton) {
        tawkButton.style.setProperty('transform', 'scale(0.5)', 'important')
        tawkButton.style.setProperty('transform-origin', 'bottom right', 'important')
        console.log('✅ Tawk button scaled to 50%')
      }
    }
    
    // Try immediately
    scaleTawkWidget()
    
    // Use MutationObserver to watch for Tawk widget loading
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              if (node.tagName === 'IFRAME' && 
                  (node.title === 'chat widget' || 
                   node.id?.includes('tawk') || 
                   node.src?.includes('tawk'))) {
                console.log('🔍 Tawk iframe detected, scaling...')
                setTimeout(scaleTawkWidget, 100)
              }
            }
          })
        }
      })
    })
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
    
    // Also try periodically in case it loads later
    const interval = setInterval(() => {
      const tawkIframe = document.querySelector('iframe[title="chat widget"]')
      if (tawkIframe) {
        scaleTawkWidget()
        clearInterval(interval)
      }
    }, 1000)
    
    // Stop trying after 10 seconds
    setTimeout(() => {
      clearInterval(interval)
      observer.disconnect()
    }, 10000)
  }
}

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

    // Listen for memory book updates (when new books are created)
    window.addEventListener('memory-book-updated', async (event) => {
      console.log('🔍 [Memory Books] Received memory-book-updated event, reloading books')
      await loadMemoryBooks()
    })

    // Listen for page visibility changes to refresh when returning from other pages
    // Note: This is kept as a fallback for cases where event-driven updates might be missed
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔍 [Memory Books] Page became visible, refreshing memory books list')
        loadMemoryBooks()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Note: Upload dialog handling moved to dedicated /upload route
    
    // Scale Tawk widget on mobile using JavaScript
    scaleTawkWidgetMobile()
  }
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('view-pdf', () => {})
    window.removeEventListener('memory-book-updated', () => {})
    document.removeEventListener('visibilitychange', () => {})
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

/* Mobile-specific styles to disable side-by-side panning */
@media (max-width: 640px) {
  .mobile-no-pan {
    touch-action: pan-y !important;
    -webkit-overflow-scrolling: touch !important;
    overscroll-behavior: contain !important;
  }
  
  .mobile-no-pan * {
    touch-action: pan-y !important;
  }
  
  /* Ensure modals and dialogs are not affected by panning */
  .mobile-no-pan .p-dialog,
  .mobile-no-pan .p-dialog-mask,
  .mobile-no-pan .p-dialog-content {
    touch-action: auto !important;
    overscroll-behavior: auto !important;
  }
  
  /* Prevent horizontal scrolling on the main container */
  .mobile-no-pan {
    overflow-x: hidden !important;
  }
  
  /* Allow vertical scrolling in specific areas only */
  .mobile-no-pan .overflow-y-auto {
    touch-action: pan-y !important;
    -webkit-overflow-scrolling: touch !important;
  }
}

/* Mobile app-like styling for details dialog */
@media (max-width: 640px) {
  .mobile-app-dialog {
    /* Remove any default dialog styling that might interfere */
    box-shadow: none !important;
    border: none !important;
    background: transparent !important;
  }
  
  .mobile-app-dialog .p-dialog-content {
    /* Ensure content takes full space */
    padding: 0 !important;
    margin: 0 !important;
    height: 100vh !important;
    max-height: 100vh !important;
    overflow: hidden !important;
  }
  
  .mobile-app-dialog .p-dialog-mask {
    /* Remove backdrop blur for native app feel */
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    background: transparent !important;
  }
  
  /* Add subtle status bar area */
  .mobile-app-dialog::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: env(safe-area-inset-top, 0px);
    background: #FEFCF8;
    z-index: 1000;
  }
  
  /* Ensure action buttons are visible above Tawk widget */
  .fixed.bottom-0 {
    z-index: 1001 !important;
    padding-bottom: 50px !important;
  }
}

</style>
