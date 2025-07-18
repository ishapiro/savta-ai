<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-100 p-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 gap-4">
        <div class="flex-1 flex items-center gap-2 sm:gap-3">
          <h1 class="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">Create Magic Memories</h1>
          <button
            class="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white shadow hover:bg-gray-100 transition-colors focus:outline-none flex-shrink-0"
            @click="showInfoDialog = true"
            aria-label="Information about magic memories"
          >
            <i class="pi pi-info text-sm sm:text-lg text-blue-500"></i>
          </button>
        </div>
        <div class="flex gap-6 w-full sm:w-auto">
          <div class="flex flex-col items-center">
            <button
              class="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-sm sm:text-base shadow transition-all duration-200 w-full sm:w-auto flex items-center gap-2 animate-pulse focus:outline-none magic-memory-btn"
              @click="openMagicMemoryDialog"
            >
              <Sparkles class="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 drop-shadow" />
              <span class="hidden sm:inline">Magic Memories Cards</span>
              <span class="sm:hidden">Magic Cards</span>
            </button>
            <p class="text-sm text-gray-600 mt-1 text-center">Start Here</p>
          </div>
          <div class="flex flex-col items-center">
            <button
              class="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-sm sm:text-base shadow transition-all duration-200 w-full sm:w-auto"
              @click="showCreateModal = true"
            >
              <i class="pi pi-plus mr-1 sm:mr-2"></i>
              <span class="hidden sm:inline">Magic Memory Books</span>
              <span class="sm:hidden">Memory Books</span>
            </button>
            <p class="text-sm text-gray-600 mt-1 text-center">Advanced Users</p>
          </div>
        </div>
      </div>

    <!-- Info Dialog -->
    <Dialog v-model:visible="showInfoDialog" modal header="About Savta's Magic Memories" class="w-full max-w-3xl sm:rounded-2xl">
      <div class="space-y-4">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h2 class="text-lg font-bold text-blue-700 mb-2">What are Magic Memory Cards?</h2>
          <p class="text-base text-gray-700">
            Magic Memory Cards are perfect for everyone! They create beautiful single cards for digital and physical distribution. 
            Our AI selects the best photos from your collection and generates a heartwarming story based on those photos. 
            It's like having a personal storyteller create a magical moment just for you!
          </p>
        </div>
        <div class="bg-purple-50 rounded-lg p-4 border border-purple-100">
          <h2 class="text-lg font-bold text-purple-700 mb-2">What are Magic Memory Books?</h2>
          <p class="text-base text-gray-700 mb-3">
            Magic Memory Books are for advanced users who want more control. They create multiple-page books with lots of layout options. 
            You select exactly which photos to include and have full control over the design and layout of your memory book.
          </p>
          <h3 class="text-md font-bold text-purple-600 mb-2">Why Create Magic Memories?</h3>
          <ul class="list-disc pl-5 text-base text-gray-700 space-y-1">
            <li>To keep your precious memories safe and easy to find.</li>
            <li>To share your stories with children, grandchildren, and friends.</li>
            <li>To have a lovely stack of cards to look through whenever you want to remember happy times.</li>
          </ul>
        </div>
        <div class="bg-green-50 rounded-lg p-4 border border-green-100">
          <h2 class="text-lg font-bold text-green-700 mb-2">How Do I Use It?</h2>
          <p class="text-base text-gray-700">
            Just pick your favorite memory moments, design your cards, and let the magic happen! 
            You can view your memory moment as a PDF, print it, or share it with your loved ones. 
            It's easy and fun—no computer skills needed!  No tedius droping and dragging photos into a photo album.
          </p>
        </div>
        <div class="bg-white rounded-lg p-4 border border-gray-100">
          <h2 class="text-base font-bold text-gray-800 mb-2">What do the buttons mean?</h2>
          <ul class="space-y-3">
            <li class="flex items-center gap-3">
              <span class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"><i class="pi pi-external-link text-lg text-green-600"></i></span>
                              <span class="text-gray-700"><b>View</b>: Open your Magic Memory Card to view or download it.</span>
            </li>
            <li class="flex items-center gap-3">
              <span class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"><i class="pi pi-bolt text-lg text-purple-600"></i></span>
                              <span class="text-gray-700"><b>Compose</b>: Create your Magic Memory Card for the first time.</span>
            </li>
            <li class="flex items-center gap-3">
              <span class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"><i class="pi pi-refresh text-lg text-yellow-600"></i></span>
                              <span class="text-gray-700"><b>Recompose</b>: Make a new version of your Magic Memory Card with a fresh design.</span>
            </li>
            <li class="flex items-center gap-3">
              <span class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"><i class="pi pi-check text-lg text-purple-600"></i></span>
                              <span class="text-gray-700"><b>Approve</b>: Mark your Magic Memory Card as finished and ready to share or print.</span>
            </li>
            <li class="flex items-center gap-3">
              <span class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"><i class="pi pi-undo text-lg text-orange-600"></i></span>
                              <span class="text-gray-700"><b>Unapprove</b>: Move your Magic Memory Card back to editing if you want to make changes.</span>
            </li>
            <li class="flex items-center gap-3">
              <span class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"><i class="pi pi-list text-lg text-gray-600"></i></span>
                              <span class="text-gray-700"><b>Details</b>: See more information about your Magic Memory Card.</span>
            </li>
            <li class="flex items-center gap-3">
              <span class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"><i class="pi pi-cog text-lg text-blue-600"></i></span>
              <span class="text-gray-700"><b>Settings</b>: Change the title, layout, or which memories moments are included.</span>
            </li>
          </ul>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end">
          <button class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-full px-6 py-2 text-base shadow" @click="showInfoDialog = false">
            Close
          </button>
        </div>
      </template>
    </Dialog>

    <!-- Memory Books Grid -->
    <div v-if="loadingMemoryBooks" class="flex justify-center items-center py-12 sm:py-16">
      <div class="text-center">
        <i class="pi pi-spin pi-spinner text-3xl sm:text-4xl mb-3 sm:mb-4 text-blue-600"></i>
        <p class="text-sm sm:text-base text-gray-500">Loading magic memories...</p>
      </div>
    </div>

    <div v-else-if="memoryBooks.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      <div
        v-for="book in memoryBooks"
        :key="book.id"
        :class="[
          'rounded-xl shadow-lg border flex flex-col transition-all duration-300 hover:shadow-xl hover:scale-105 p-0 overflow-hidden',
          book.layout_type === 'magic' 
            ? 'bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 border-purple-200 magic-memory-card' 
            : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 border-blue-200'
        ]"
      >
        <!-- Book Cover with Gradient -->
        <div :class="[
          'relative h-32 flex items-center justify-center',
          book.layout_type === 'magic'
            ? 'bg-gradient-to-br from-purple-200 via-pink-200 to-indigo-200'
            : 'bg-gradient-to-br from-blue-200 via-cyan-200 to-blue-300'
        ]">
          <!-- Status Badge: absolute top-right, smaller -->
          <div class="absolute top-2 right-2 z-1">
            <div :class="getStatusBadgeClass(book.status)" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-md backdrop-blur-sm min-w-[48px] min-h-[22px] justify-center">
              <i :class="getStatusIcon(book.status)" class="text-xs"></i>
              <span class="hidden sm:inline">{{ getStatusText(book.status) }}</span>
            </div>
          </div>
          <div class="flex flex-col items-center">
            <div :class="[
              'w-14 h-14 rounded-xl flex items-center justify-center shadow-lg mb-2 relative group-hover:scale-110 transition-transform duration-300',
              book.layout_type === 'magic'
                ? 'bg-gradient-to-br from-purple-400 to-pink-400'
                : 'bg-gradient-to-br from-blue-400 to-cyan-400'
            ]">
              <Wand2 v-if="book.layout_type === 'magic'" class="w-8 h-8 text-white" />
              <i v-else class="pi pi-book text-2xl text-white"></i>
            </div>
            <span class="text-xs font-semibold text-gray-700 text-center px-2 leading-tight">{{ book.title || (book.layout_type === 'magic' ? 'Magic Memory' : ('Memory Spell #' + book.id.slice(-6))) }}</span>
          </div>
        </div>
        <!-- Card Content -->
        <div class="flex-1 flex flex-col p-5 pb-3 min-h-[160px]">
          <div v-if="book.layout_type === 'magic' && book.magic_story" class="text-purple-900 text-xs magic-story animate-fade-in mb-3 relative leading-relaxed">
            <div class="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <Sparkle class="w-4 h-4 text-yellow-400 absolute left-0 top-0" />
              <span class="ml-6">{{ book.magic_story.length > 115 ? book.magic_story.slice(0, 115) + '...' : book.magic_story }}</span>
            </div>
          </div>
          <div class="space-y-2 text-sm text-gray-600 mb-3">
            <div class="flex justify-between items-center">
              <span class="font-semibold text-gray-700">Created:</span>
              <span class="font-mono text-xs">{{ formatDate(book.created_at) }}</span>
            </div>
            <div v-if="book.generated_at" class="flex justify-between items-center">
              <span class="font-semibold text-gray-700">Generated:</span>
              <span class="font-mono text-xs">{{ formatDate(book.generated_at) }}</span>
            </div>
            <div v-if="book.approved_at" class="flex justify-between items-center">
              <span class="font-semibold text-gray-700">Approved:</span>
              <span class="font-mono text-xs">{{ formatDate(book.approved_at) }}</span>
            </div>
            <div v-if="book.created_from_assets" class="flex justify-between items-center">
              <span class="font-semibold text-gray-700">Assets:</span>
              <span class="bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-1 rounded-full text-xs font-bold text-gray-700 border border-gray-200">{{ book.created_from_assets.length }}</span>
            </div>
          </div>
          <div v-if="book.review_notes" class="mb-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
            <p class="text-xs text-amber-800 font-medium leading-relaxed">{{ book.review_notes }}</p>
          </div>
        </div>
        <!-- Action Bar -->
        <div :class="[
          'px-3 py-4 flex flex-wrap items-center justify-center gap-3',
          book.layout_type === 'magic'
            ? 'bg-gradient-to-r from-purple-100/80 to-pink-100/80 border-t border-purple-200'
            : 'bg-gradient-to-r from-blue-100/80 to-cyan-100/80 border-t border-blue-200'
        ]">
          <!-- View Button -->
          <div class="flex flex-col items-center cursor-pointer group p-2 rounded-lg hover:bg-white/50 transition-all duration-200" @click="onDownloadClick(book)">
            <i class="pi pi-external-link text-lg sm:text-xl text-green-600 group-hover:scale-125 transition-transform"></i>
            <span class="text-[10px] sm:text-[11px] text-green-700 mt-1 font-medium">View</span>
          </div>
          <!-- Generate Button (only for draft, not magic) -->
          <div v-if="book.status === 'draft' && book.layout_type !== 'magic'" class="flex flex-col items-center cursor-pointer group p-2 rounded-lg hover:bg-white/50 transition-all duration-200" @click="onGenerateClick(book)">
            <Wand2 class="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 group-hover:scale-125 transition-transform" />
            <span class="text-[10px] sm:text-[11px] text-purple-700 mt-1 font-medium">Compose</span>
          </div>
          <!-- Magic Generate Button (for draft magic books) -->
          <div v-if="book.status === 'draft' && book.layout_type === 'magic'" class="flex flex-col items-center cursor-pointer group p-2 rounded-lg hover:bg-white/50 transition-all duration-200" @click="onGenerateClick(book)">
            <Wand2 class="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 group-hover:scale-125 transition-transform" />
            <span class="text-[10px] sm:text-[11px] text-yellow-700 mt-1 font-medium">Cast Spell</span>
          </div>
          <!-- Regenerate Button (for ready or background_ready, not magic) -->
          <div v-if="(book.status === 'ready' || book.status === 'background_ready') && book.layout_type !== 'magic'" class="flex flex-col items-center cursor-pointer group p-2 rounded-lg hover:bg-white/50 transition-all duration-200" @click="onRegenerateClick(book)" :class="{ 'opacity-50': book.status === 'background_ready' }">
            <i class="pi pi-refresh text-lg sm:text-xl text-yellow-600 group-hover:scale-125 transition-transform"></i>
            <span class="text-[10px] sm:text-[11px] text-yellow-700 mt-1 font-medium">{{ book.status === 'background_ready' ? 'Processing' : 'Recompose' }}</span>
          </div>
          <!-- Magic Regenerate Button (for ready magic books) -->
          <div v-if="(book.status === 'ready' || book.status === 'background_ready') && book.layout_type === 'magic'" class="flex flex-col items-center cursor-pointer group p-2 rounded-lg hover:bg-white/50 transition-all duration-200" @click="onRegenerateClick(book)" :class="{ 'opacity-50': book.status === 'background_ready' }">
            <i class="pi pi-refresh text-lg sm:text-xl text-yellow-600 group-hover:scale-125 transition-transform"></i>
            <span class="text-[10px] sm:text-[11px] text-yellow-700 mt-1 font-medium">{{ book.status === 'background_ready' ? 'Processing' : 'Recast Spell' }}</span>
          </div>
          <!-- Approve Button (not magic) -->
          <div v-if="book.status === 'ready' && book.layout_type !== 'magic'" class="flex flex-col items-center cursor-pointer group p-2 rounded-lg hover:bg-white/50 transition-all duration-200" @click="approveBook(book.id)">
            <i class="pi pi-check text-lg sm:text-xl text-purple-600 group-hover:scale-125 transition-transform"></i>
            <span class="text-[10px] sm:text-[11px] text-purple-700 mt-1 font-medium">Approve</span>
          </div>
          <!-- Magic Approve Button -->
          <div v-if="book.status === 'ready' && book.layout_type === 'magic'" class="flex flex-col items-center cursor-pointer group p-2 rounded-lg hover:bg-white/50 transition-all duration-200" @click="approveBook(book.id)">
            <i class="pi pi-check text-lg sm:text-xl text-yellow-600 group-hover:scale-125 transition-transform"></i>
            <span class="text-[10px] sm:text-[11px] text-yellow-700 mt-1 font-medium">Approve</span>
          </div>
          <!-- Unapprove Button (not magic) -->
          <div v-if="book.status === 'approved' && book.layout_type !== 'magic'" class="flex flex-col items-center cursor-pointer group p-2 rounded-lg hover:bg-white/50 transition-all duration-200" @click="unapproveBook(book.id)">
            <i class="pi pi-undo text-lg sm:text-xl text-orange-600 group-hover:scale-125 transition-transform"></i>
            <span class="text-[10px] sm:text-[11px] text-orange-700 mt-1 font-medium">Unapprove</span>
          </div>
          <!-- Magic Unapprove Button -->
          <div v-if="book.status === 'approved' && book.layout_type === 'magic'" class="flex flex-col items-center cursor-pointer group p-2 rounded-lg hover:bg-white/50 transition-all duration-200" @click="unapproveBook(book.id)">
            <i class="pi pi-undo text-lg sm:text-xl text-orange-600 group-hover:scale-125 transition-transform"></i>
            <span class="text-[10px] sm:text-[11px] text-orange-700 mt-1 font-medium">Unapprove</span>
          </div>
          <!-- View Details Button -->
          <div class="flex flex-col items-center cursor-pointer group p-2 rounded-lg hover:bg-white/50 transition-all duration-200" @click="viewBookDetails(book)">
            <i class="pi pi-list text-lg sm:text-xl text-gray-600 group-hover:scale-125 transition-transform"></i>
            <span class="text-[10px] sm:text-[11px] text-gray-700 mt-1 font-medium">Details</span>
          </div>
          <!-- Edit Settings Button (not magic) -->
          <div v-if="selectedBook && selectedBook.layout_type !== 'magic'"
            class="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm shadow-lg transition-all duration-200 w-full sm:w-auto"
            @click="openEditSettings(selectedBook)"
          >
            <i class="pi pi-cog text-xs sm:text-sm"></i>
            <span class="hidden sm:inline">Edit Settings</span>
            <span class="sm:hidden">Edit</span>
          </div>
          <!-- Magic Edit Settings Button -->
          <div v-if="selectedBook && selectedBook.layout_type === 'magic'"
            class="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-full px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm shadow-lg transition-all duration-200 w-full sm:w-auto"
            @click="openEditSettings(selectedBook)"
          >
            <i class="pi pi-cog text-xs sm:text-sm"></i>
            <span class="hidden sm:inline">Edit Spell</span>
            <span class="sm:hidden">Edit</span>
          </div>
          <!-- Delete Button -->
          <div class="flex flex-col items-center cursor-pointer group p-2 rounded-lg hover:bg-white/50 transition-all duration-200" @click="confirmDeleteBook(book)">
            <i class="pi pi-trash text-lg sm:text-xl text-red-500 group-hover:scale-125 transition-transform"></i>
            <span class="text-[10px] sm:text-[11px] text-red-700 mt-1 font-medium">Delete</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex flex-col items-center justify-center py-12 sm:py-20 px-4">
      <!-- No assets state -->
      <div v-if="!hasAssets" class="text-center">
        <div class="text-gray-600 mb-4">
          <i class="pi pi-images text-4xl sm:text-6xl"></i>
        </div>
        <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-2">No photos uploaded yet</h3>
        <p class="text-sm sm:text-base text-gray-500 mb-6 text-center max-w-md">You need some photos to create your first magic memory. Would you like to upload some now?</p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            class="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold rounded-full px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base shadow transition-all duration-200"
            @click="showUploadDialog = true"
          >
            <i class="pi pi-upload mr-1 sm:mr-2"></i> Upload Photos
          </button>
          <button
            class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-full px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base shadow transition-all duration-200"
            @click="skipUpload"
          >
            Maybe Later
          </button>
        </div>
      </div>

      <!-- Has assets but no magic memories state -->
      <div v-else class="text-center">
        <div class="text-gray-600 mb-4">
          <i class="pi pi-book text-4xl sm:text-6xl"></i>
        </div>
        <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-2">No magic memories yet</h3>
        <p class="text-sm sm:text-base text-gray-500 mb-4 text-center max-w-md">Great! You have {{ approvedAssetsCount }} approved photos ready. Are you ready to create your first magic memory?</p>
        <button
          class="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-full px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base shadow transition-all duration-200 w-full max-w-sm"
          @click="openMagicMemoryDialog"
        >
          <i class="pi pi-plus mr-1 sm:mr-2"></i> Create Your First Magic Memory
        </button>
      </div>
    </div>

    <!-- Create Memory Book Modal (replaces old Dialog) -->
    <MemoryBookDialog
      :visible="showCreateModal"
      :isEditing="false"
      :initialData="{ layoutType: 'grid' }"
      :loading="creatingBook"
      @close="showCreateModal = false"
      @submit="createMemoryBookFromDialog"
    />

    <!-- Edit Memory Book Settings Modal (replaces old Dialog) -->
    <MemoryBookDialog
      :visible="showEditSettingsModal && !!editBook"
      :isEditing="true"
      :initialData="editBook || {}"
      :initialSelectedAssets="editBook?.selectedAssetObjects || []"
      :loading="savingEditBook"
      @close="showEditSettingsModal = false"
      @submit="saveEditBookFromDialog"
      @cleanup="() => { if (editBook) { cleanupBookId = editBook.id; showCleanupConfirmationModal = true; } }"
    />

    <!-- Success Dialog -->
    <Dialog
      v-model:visible="showSuccessDialog"
      modal
      :closable="false"
      class="success-dialog"
      style="max-width: 95vw; width: 700px; text-align: center;"
    >
      <div class="flex flex-col items-center justify-center py-4 sm:py-6 px-4 sm:px-6 relative overflow-hidden">
        <!-- Background magic particles -->
        <div class="absolute inset-0 pointer-events-none">
          <div class="absolute top-4 left-4 w-2 h-2 bg-yellow-300 rounded-full animate-ping" style="animation-delay: 0s;"></div>
          <div class="absolute top-8 right-8 w-1 h-1 bg-purple-300 rounded-full animate-ping" style="animation-delay: 0.3s;"></div>
          <div class="absolute bottom-8 left-8 w-1 h-1 bg-blue-300 rounded-full animate-ping" style="animation-delay: 0.6s;"></div>
          <div class="absolute bottom-4 right-4 w-2 h-2 bg-pink-300 rounded-full animate-ping" style="animation-delay: 0.9s;"></div>
          <div class="absolute top-1/2 left-2 w-1 h-1 bg-yellow-400 rounded-full animate-ping" style="animation-delay: 1.2s;"></div>
          <div class="absolute top-1/2 right-2 w-1 h-1 bg-purple-400 rounded-full animate-ping" style="animation-delay: 1.5s;"></div>
        </div>

        <!-- Main sparkle animation -->
        <div class="relative mb-4 sm:mb-6">
          <div class="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-yellow-200 via-purple-200 to-blue-200 rounded-full flex items-center justify-center shadow-2xl animate-pulse relative">
            <i class="pi pi-sparkles text-4xl sm:text-5xl text-yellow-500 animate-bounce"></i>
            <!-- Glow effect -->
            <div class="absolute inset-0 bg-gradient-to-br from-yellow-300 to-purple-300 rounded-full opacity-30 animate-pulse"></div>
          </div>
          <!-- Enhanced floating sparkles -->
          <div class="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-300 rounded-full animate-ping shadow-lg"></div>
          <div class="absolute -bottom-2 -left-2 sm:-bottom-3 sm:-left-3 w-4 h-4 sm:w-6 sm:h-6 bg-purple-300 rounded-full animate-ping shadow-lg" style="animation-delay: 0.5s;"></div>
          <div class="absolute top-1/2 -right-4 sm:-right-6 w-3 h-3 sm:w-4 sm:h-4 bg-blue-300 rounded-full animate-ping shadow-lg" style="animation-delay: 1s;"></div>
          <div class="absolute top-1/2 -left-4 sm:-left-6 w-4 h-4 sm:w-5 sm:h-5 bg-pink-300 rounded-full animate-ping shadow-lg" style="animation-delay: 1.5s;"></div>
        </div>
        
        <!-- Enhanced success message -->
        <h2 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-3 sm:mb-4 animate-fade-in">
          ✨ Spell Cast Successfully! ✨
        </h2>
        
        <div class="bg-gradient-to-r from-yellow-50 via-purple-50 to-blue-50 rounded-2xl p-5 sm:p-6 border-2 border-purple-200 mb-4 sm:mb-6 shadow-xl relative overflow-hidden">
          <!-- Inner sparkles -->
          <div class="absolute top-2 right-2 w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
          <div class="absolute bottom-2 left-2 w-2 h-2 bg-purple-300 rounded-full animate-ping" style="animation-delay: 0.7s;"></div>
          
          <p class="text-lg sm:text-xl text-gray-800 leading-relaxed mb-3 sm:mb-4">
            You have just defined the <span class="font-bold text-purple-600">magical spell</span> we will use to generate your custom magic memory!
          </p>
          
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-4 border border-blue-200 shadow-lg">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <i class="pi pi-clock text-blue-600 text-xs sm:text-sm"></i>
              </div>
              <span class="text-sm sm:text-base font-semibold text-blue-800">⏱️ Estimated Time</span>
            </div>
            <p class="text-sm sm:text-base text-blue-700 leading-relaxed">
              Compose this book will take about <span class="font-bold text-blue-800 text-base sm:text-lg">{{ calculateComposeTime() }} seconds</span>. 
              <br><span class="text-xs sm:text-sm text-blue-600">Do you want to do it now or later?</span>
            </p>
          </div>
        </div>
        
        <!-- Enhanced action buttons -->
        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
          <button
            class="flex-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white font-bold rounded-full px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl relative overflow-hidden group"
            @click="composeNewlyCreatedMemory"
          >
            <!-- Button sparkles -->
            <div class="absolute top-2 right-2 w-2 h-2 bg-white/30 rounded-full animate-ping"></div>
            <div class="absolute bottom-2 left-2 w-1 h-1 bg-white/30 rounded-full animate-ping" style="animation-delay: 0.5s;"></div>
            
            <i class="pi pi-magic mr-2 sm:mr-3 text-lg sm:text-xl group-hover:animate-spin"></i>
            Compose the Memory Now
          </button>
          <button
            class="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-bold rounded-full px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            @click="showSuccessDialog = false"
          >
            <i class="pi pi-clock mr-2 sm:mr-3"></i>
            Later
          </button>
        </div>
      </div>
    </Dialog>

    <!-- Upload Photos Dialog -->
    <Dialog
      v-model:visible="showUploadDialog"
      modal
      :closable="!isUploading"
      :dismissableMask="!isUploading"
      header="✨ Photo Magic Workshop ✨"
      class="w-[95vw] max-w-2xl mx-auto magic-upload-dialog"
      @hide="resetUploadDialog"
    >
      <div class="space-y-6">
        <!-- Upload Instructions -->
        <div v-if="!isUploading && uploadedFiles.length === 0" class="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200 relative overflow-hidden">
          <!-- Magical sparkles -->
          <div class="absolute top-2 right-2 w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
          <div class="absolute bottom-2 left-2 w-2 h-2 bg-purple-300 rounded-full animate-ping" style="animation-delay: 0.5s;"></div>
          <div class="absolute top-1/2 right-4 w-2 h-2 bg-blue-300 rounded-full animate-ping" style="animation-delay: 1s;"></div>
          
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 rounded-full flex items-center justify-center shadow-lg relative">
              <i class="pi pi-sparkles text-purple-600 text-xl"></i>
              <!-- Glow effect -->
              <div class="absolute inset-0 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-50 animate-pulse"></div>
            </div>
            <div>
              <h3 class="text-xl font-bold text-purple-800 mb-1">✨ Ready for Some Magic? ✨</h3>
              <p class="text-sm text-purple-600">Let's turn your photos into magical memories!</p>
            </div>
          </div>
          <div class="bg-white/80 rounded-lg p-4 border border-purple-200">
            <p class="text-sm text-gray-700 leading-relaxed">
              <span class="font-semibold text-purple-700">🌟 What happens next:</span><br>
              • Your photos will be automatically approved<br>
              • Our AI crystal ball will analyze each image<br>
              • We'll detect people, add captions, and create tags<br>
              • Your photos will be ready for magic memory creation!
            </p>
          </div>
        </div>

        <!-- Upload Progress -->
        <div v-if="isUploading" class="space-y-4">
          <!-- Overall Progress -->
          <div class="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200 relative overflow-hidden">
            <!-- Magical sparkles -->
            <div class="absolute top-3 right-3 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
            <div class="absolute bottom-3 left-3 w-2 h-2 bg-purple-300 rounded-full animate-ping" style="animation-delay: 0.7s;"></div>
            
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center shadow-lg">
                <i class="pi pi-sparkles text-purple-600 text-lg animate-pulse"></i>
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-lg font-bold text-purple-800">✨ Magic in Progress ✨</span>
                  <span class="text-lg font-bold text-purple-600">{{ uploadProgress }}%</span>
                </div>
                <div class="w-full bg-white/60 rounded-full h-4 border border-purple-200">
                  <div 
                    class="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 h-4 rounded-full transition-all duration-500 shadow-lg"
                    :style="{ width: uploadProgress + '%' }"
                  ></div>
                </div>
                <p class="text-sm text-purple-700 mt-2 font-medium">{{ uploadStatus }}</p>
              </div>
            </div>
          </div>

          <!-- Current File Progress -->
          <div v-if="uploadingFiles.length > 0" class="bg-white/90 rounded-xl p-6 border-2 border-purple-200 shadow-lg">
            <h4 class="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
              <i class="pi pi-sparkles text-purple-600"></i>
              🔮 Crystal Ball Readings 🔮
            </h4>
            <div class="space-y-3">
              <div 
                v-for="file in uploadingFiles" 
                :key="file.name"
                class="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 transition-all duration-200 hover:shadow-md"
              >
                <div class="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center shadow-md">
                  <i class="pi pi-image text-purple-600 text-sm"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-purple-800 truncate">{{ file.name }}</p>
                  <p class="text-xs text-purple-600 font-medium">{{ getMagicStatusText(file.status) }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <div v-if="file.status === 'uploading'" class="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <div v-else-if="file.status === 'processing'" class="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                  <div v-else-if="file.status === 'completed'" class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                    <i class="pi pi-check text-white text-xs"></i>
                  </div>
                  <div v-else-if="file.status === 'failed'" class="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                    <i class="pi pi-times text-white text-xs"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Upload Results -->
        <div v-if="uploadedFiles.length > 0 || failedFiles.length > 0" class="space-y-4">
          <!-- Success Results -->
          <div v-if="uploadedFiles.length > 0" class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 shadow-lg relative overflow-hidden">
            <!-- Success sparkles -->
            <div class="absolute top-3 right-3 w-3 h-3 bg-green-300 rounded-full animate-ping"></div>
            <div class="absolute bottom-3 left-3 w-2 h-2 bg-emerald-300 rounded-full animate-ping" style="animation-delay: 0.5s;"></div>
            
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center shadow-lg">
                <i class="pi pi-sparkles text-green-600 text-xl animate-bounce"></i>
              </div>
              <div>
                <h4 class="text-xl font-bold text-green-800">✨ Magic Complete! ✨</h4>
                <p class="text-sm text-green-600">Your photos are now enchanted!</p>
              </div>
            </div>
            <div class="bg-white/80 rounded-lg p-4 border border-green-200">
              <div class="space-y-2">
                <div 
                  v-for="file in uploadedFiles" 
                  :key="file.name"
                  class="flex items-center gap-2 text-sm text-green-700"
                >
                  <i class="pi pi-check text-green-600"></i>
                  <span class="font-medium">{{ file.name }}</span>
                  <span class="text-xs text-green-500">✨ Enchanted</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Failed Results -->
          <div v-if="failedFiles.length > 0" class="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200 shadow-lg">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center shadow-lg">
                <i class="pi pi-exclamation-triangle text-red-600 text-xl"></i>
              </div>
              <div>
                <h4 class="text-xl font-bold text-red-800">😔 Magic Fizzled</h4>
                <p class="text-sm text-red-600">Some spells didn't work as expected</p>
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
      </div>

      <template #footer>
        <div class="flex justify-between items-center w-full">
          <div class="text-sm text-gray-500">
            {{ uploadedFiles.length }} uploaded, {{ failedFiles.length }} failed
          </div>
          <div class="flex gap-2">
            <button
              v-if="!isUploading"
              class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-full px-4 py-2 text-sm shadow transition-all duration-200"
              @click="showUploadDialog = false"
            >
              Close
            </button>
            <button
              v-if="!isUploading && uploadedFiles.length === 0"
              class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-full px-6 py-3 text-sm shadow-lg transition-all duration-200 transform hover:scale-105"
              @click="selectFiles"
            >
              <i class="pi pi-sparkles mr-2"></i>
              ✨ Start Magic ✨
            </button>
            <button
              v-if="!isUploading && (uploadedFiles.length > 0 || failedFiles.length > 0)"
              class="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-full px-6 py-3 text-sm shadow-lg transition-all duration-200 transform hover:scale-105"
              @click="finishUpload"
            >
              <i class="pi pi-sparkles mr-2"></i>
              🎉 Magic Complete! 🎉
            </button>
          </div>
        </div>
      </template>
    </Dialog>

    <!-- Book Details Modal -->
    <Dialog
      v-model:visible="showDetailsModal"
      modal
      class="w-[95vw] max-w-4xl mx-auto max-h-[95vh]"
      :auto-z-index="false"
      :z-index="1000"
    >
      <div v-if="selectedBook" class="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-100 min-h-screen">
        <!-- Header Section -->
        <div class="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-t-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div class="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                <i class="pi pi-book text-lg sm:text-2xl text-purple-600"></i>
              </div>
              <div class="min-w-0 flex-1">
                <h2 class="text-lg sm:text-2xl font-bold text-gray-900 mb-1 truncate">{{ selectedBook.title || ('Memory Book #' + selectedBook.id.slice(-6)) }}</h2>
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
                v-if="selectedBook.status === 'approved'"
                class="flex items-center justify-center gap-1 sm:gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm shadow transition-all duration-200"
                @click="unapproveBook(selectedBook.id)"
              >
                <i class="pi pi-undo text-xs sm:text-sm"></i>
                <span class="hidden sm:inline">Unapprove</span>
                <span class="sm:hidden">Unapprove</span>
              </button>
              <button
                class="flex items-center justify-center gap-1 sm:gap-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm shadow transition-all duration-200"
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
                <i class="pi pi-calendar text-blue-600 text-xs sm:text-sm"></i>
                <span class="text-xs font-medium text-gray-600">Created</span>
              </div>
              <p class="text-xs sm:text-sm font-semibold text-gray-900">{{ formatDate(selectedBook.created_at) }}</p>
            </div>
            <div v-if="selectedBook.generated_at" class="bg-white/80 rounded-xl p-2 sm:p-3 border border-gray-200">
              <div class="flex items-center gap-1 sm:gap-2 mb-1">
                <Wand2 class="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                <span class="text-xs font-medium text-gray-600">Generated</span>
              </div>
              <p class="text-xs sm:text-sm font-semibold text-gray-900">{{ formatDate(selectedBook.generated_at) }}</p>
            </div>
            <div v-if="selectedBook.approved_at" class="bg-white/80 rounded-xl p-2 sm:p-3 border border-gray-200">
              <div class="flex items-center gap-1 sm:gap-2 mb-1">
                <i class="pi pi-check-circle text-green-600 text-xs sm:text-sm"></i>
                <span class="text-xs font-medium text-gray-600">Approved</span>
              </div>
              <p class="text-xs sm:text-sm font-semibold text-gray-900">{{ formatDate(selectedBook.approved_at) }}</p>
            </div>
            <div v-if="selectedBook.created_from_assets && selectedBook.created_from_assets.length > 0" class="bg-white/80 rounded-xl p-2 sm:p-3 border border-gray-200">
              <div class="flex items-center gap-1 sm:gap-2 mb-1">
                <i class="pi pi-images text-pink-600 text-xs sm:text-sm"></i>
                <span class="text-xs font-medium text-gray-600">Assets</span>
              </div>
              <p class="text-xs sm:text-sm font-semibold text-gray-900">{{ selectedBook.created_from_assets.length }}</p>
            </div>
            <div class="bg-white/80 rounded-xl p-2 sm:p-3 border border-gray-200">
              <div class="flex items-center gap-1 sm:gap-2 mb-1">
                <i class="pi pi-th-large text-purple-600 text-xs sm:text-sm"></i>
                <span class="text-xs font-medium text-gray-600">Layout</span>
              </div>
              <p class="text-xs sm:text-sm font-semibold text-gray-900">{{ selectedBook.layout_type || 'grid' }}</p>
            </div>
            <div class="bg-white/80 rounded-xl p-2 sm:p-3 border border-gray-200">
              <div class="flex items-center gap-1 sm:gap-2 mb-1">
                <i class="pi pi-calendar-plus text-orange-600 text-xs sm:text-sm"></i>
                <span class="text-xs font-medium text-gray-600">Event</span>
              </div>
              <p class="text-xs sm:text-sm font-semibold text-gray-900">{{ selectedBook.memory_event || 'N/A' }}</p>
            </div>
          </div>
          
          <!-- Additional Info Cards Row -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-2">
            <div class="bg-white/80 rounded-xl p-2 sm:p-3 border border-gray-200">
              <div class="flex items-center gap-1 sm:gap-2 mb-1">
                <i class="pi pi-palette text-indigo-600 text-xs sm:text-sm"></i>
                <span class="text-xs font-medium text-gray-600">Theme</span>
              </div>
              <p class="text-xs sm:text-sm font-semibold text-gray-900">{{ selectedBook.theme || 'classic' }}</p>
            </div>
            <div class="bg-white/80 rounded-xl p-2 sm:p-3 border border-gray-200">
              <div class="flex items-center gap-1 sm:gap-2 mb-1">
                <i class="pi pi-circle text-teal-600 text-xs sm:text-sm"></i>
                <span class="text-xs font-medium text-gray-600">Shape</span>
              </div>
              <p class="text-xs sm:text-sm font-semibold text-gray-900">{{ selectedBook.memory_shape || 'original' }}</p>
            </div>
            <div class="bg-white/80 rounded-xl p-2 sm:p-3 border border-gray-200">
              <div class="flex items-center gap-1 sm:gap-2 mb-1">
                <i class="pi pi-table text-cyan-600 text-xs sm:text-sm"></i>
                <span class="text-xs font-medium text-gray-600">Grid</span>
              </div>
              <p class="text-xs sm:text-sm font-semibold text-gray-900">{{ selectedBook.grid_layout || '2x2' }}</p>
            </div>
            <div class="bg-white/80 rounded-xl p-2 sm:p-3 border border-gray-200">
              <div class="flex items-center gap-1 sm:gap-2 mb-1">
                <i class="pi pi-file-edit text-violet-600 text-xs sm:text-sm"></i>
                <span class="text-xs font-medium text-gray-600">Title</span>
              </div>
              <p class="text-xs sm:text-sm font-semibold text-gray-900 truncate">{{ selectedBook.title || 'Untitled' }}</p>
            </div>
          </div>

          <!-- Review Notes -->
          <div v-if="selectedBook.review_notes" class="mt-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-3 sm:p-4 border border-yellow-200">
            <div class="flex items-center gap-2 mb-2">
              <i class="pi pi-comment text-yellow-600 text-sm"></i>
              <span class="text-sm font-semibold text-yellow-800">Review Notes</span>
            </div>
            <p class="text-xs sm:text-sm text-yellow-900 italic">{{ selectedBook.review_notes }}</p>
          </div>
        </div>

        <!-- Content Section -->
        <div class="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <!-- Magic Story Section (for Magic Memories) -->
          <div v-if="selectedBook.layout_type === 'magic' && selectedBook.magic_story" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 text-xs">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i class="pi pi-sparkles text-yellow-400 text-sm sm:text-base"></i>
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base sm:text-lg font-bold text-purple-700">Magic Story</h3>
                <p class="text-xs sm:text-sm text-gray-600">The AI-generated story for your magic memory</p>
              </div>
            </div>
            <div class="overflow-y-auto max-h-48 sm:max-h-64 bg-gradient-to-br from-yellow-50 to-purple-50 rounded-xl p-3 sm:p-4 border border-purple-200 text-purple-900 text-sm magic-story" style="word-break: break-word; line-height: 1.5;">
              {{ selectedBook.magic_story }}
            </div>
          </div>

          <!-- Memory Assets Section -->
          <div v-if="selectedBook.created_from_assets && selectedBook.created_from_assets.length > 0" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
            <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i class="pi pi-images text-indigo-600 text-sm sm:text-base"></i>
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base sm:text-lg font-bold text-gray-900">Memory Assets</h3>
                <p class="text-xs sm:text-sm text-gray-600">{{ selectedBook.created_from_assets.length }} memories included</p>
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
                  class="w-full h-full object-cover"
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

          <!-- PDF Section -->
          <div v-if="selectedBook.pdf_url" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i class="pi pi-file-pdf text-emerald-600 text-sm sm:text-base"></i>
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="text-base sm:text-lg font-bold text-gray-900">Memory Book PDF</h3>
                  <p class="text-xs sm:text-sm text-gray-600">Ready to download and share</p>
                </div>
              </div>
              <button
                class="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-full px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm shadow-lg transition-all duration-200 w-full sm:w-auto"
                @click="forceDownloadPDF(selectedBook)"
              >
                <i class="pi pi-download text-xs sm:text-sm"></i>
                <span class="hidden sm:inline">Download PDF</span>
                <span class="sm:hidden">Download</span>
              </button>
            </div>
            <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 sm:p-4 border border-emerald-200 mt-4">
              <div class="flex items-start gap-2 text-xs sm:text-sm text-emerald-800">
                <i class="pi pi-info-circle text-emerald-600 text-xs sm:text-sm mt-0.5 flex-shrink-0"></i>
                <span>Click download to save your memory book as a PDF file to your device</span>
              </div>
            </div>
          </div>

          <!-- Actions Section -->
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
            <h3 class="text-base sm:text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                v-if="selectedBook.status === 'draft'"
                class="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm shadow-lg transition-all duration-200"
                @click="onGenerateClick(selectedBook)"
              >
                <Wand2 class="w-3 h-3 sm:w-4 sm:h-4" />
                <span class="hidden sm:inline">Compose Memory</span>
                <span class="sm:hidden">Compose</span>
              </button>
              <button
                v-if="selectedBook.status === 'ready' || selectedBook.status === 'background_ready'"
                class="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm shadow-lg transition-all duration-200"
                @click="onRegenerateClick(selectedBook)"
                :class="{ 'opacity-50': selectedBook.status === 'background_ready' }"
              >
                <i class="pi pi-refresh text-xs sm:text-sm"></i>
                <span class="hidden sm:inline">{{ selectedBook.status === 'background_ready' ? 'Processing...' : 'Recompose' }}</span>
                <span class="sm:hidden">{{ selectedBook.status === 'background_ready' ? 'Processing' : 'Recompose' }}</span>
              </button>
              <button
                v-if="selectedBook.status === 'ready'"
                class="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm shadow-lg transition-all duration-200"
                @click="approveBook(selectedBook.id)"
              >
                <i class="pi pi-check text-xs sm:text-sm"></i>
                <span class="hidden sm:inline">Approve Book</span>
                <span class="sm:hidden">Approve</span>
              </button>
              <button
                v-if="selectedBook && selectedBook.layout_type !== 'magic'"
                class="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm shadow-lg transition-all duration-200 w-full sm:w-auto"
                @click="openEditSettings(selectedBook)"
              >
                <i class="pi pi-cog text-xs sm:text-sm"></i>
                <span class="hidden sm:inline">Edit Settings</span>
                <span class="sm:hidden">Edit</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>

    <!-- PDF Progress Dialog -->
    <Dialog
      v-model:visible="showProgressDialog"
      modal
      :style="{ width: '95vw', maxWidth: '450px' }"
      :closable="false"
      :z-index="9999"
      :showHeader="false"
    >
      <div class="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-100 rounded-2xl p-6 sm:p-8">
        <!-- Magic Header -->
        <div class="text-center mb-6">
          <div class="relative mb-4">
            <!-- Floating sparkles -->
            <div class="absolute -top-2 -left-2 w-4 h-4 bg-yellow-300 rounded-full animate-ping"></div>
            <div class="absolute -top-1 -right-1 w-3 h-3 bg-purple-300 rounded-full animate-ping" style="animation-delay: 0.5s;"></div>
            <div class="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-300 rounded-full animate-ping" style="animation-delay: 1s;"></div>
            
            <!-- Main magic circle -->
            <div class="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-yellow-200 via-purple-200 to-blue-200 rounded-full flex items-center justify-center shadow-lg mx-auto animate-pulse">
              <i class="pi pi-sparkles text-3xl sm:text-4xl text-purple-600 animate-bounce"></i>
            </div>
          </div>
          
          <h2 class="text-lg sm:text-xl font-bold text-purple-700 mb-2 animate-fade-in">
            {{ isRegenerating ? '✨ Regenerating Your Memory Book ✨' : '✨ Creating Your Memory Book ✨' }}
          </h2>
          <p class="text-sm sm:text-base text-purple-600 font-medium">
            {{ isRegenerating ? 'Processing your memory book with fresh settings...' : 'Processing your memory book...' }}
          </p>
        </div>

        <!-- Progress Section -->
        <div class="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-purple-200 shadow-lg">
          <div class="text-center">
            <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              {{ currentProgressMessage }}
            </h3>
            
            <!-- Animated progress bar -->
            <div class="relative mb-4">
              <div class="w-full bg-gradient-to-r from-purple-100 to-blue-100 rounded-full h-3 shadow-inner">
                <div 
                  class="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out shadow-lg relative overflow-hidden"
                  :style="`width: ${currentProgress}%`"
                >
                  <!-- Shimmer effect -->
                  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                </div>
              </div>
            </div>
            
            <!-- Status indicator -->
            <div class="flex items-center justify-center gap-2 text-sm sm:text-base text-gray-700">
              <i class="pi pi-cog text-purple-500 animate-spin"></i>
              <span class="font-medium">{{ isRegenerating ? 'Regenerating...' : 'Processing...' }}</span>
            </div>
          </div>
        </div>

        <!-- Magic particles effect -->
        <div class="relative mt-4 h-8">
          <div class="absolute inset-0 flex justify-center">
            <div class="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style="animation-delay: 0s;"></div>
            <div class="w-2 h-2 bg-purple-400 rounded-full animate-bounce ml-2" style="animation-delay: 0.2s;"></div>
            <div class="w-2 h-2 bg-pink-400 rounded-full animate-bounce ml-2" style="animation-delay: 0.4s;"></div>
            <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce ml-2" style="animation-delay: 0.6s;"></div>
            <div class="w-2 h-2 bg-yellow-400 rounded-full animate-bounce ml-2" style="animation-delay: 0.8s;"></div>
          </div>
        </div>
      </div>
    </Dialog>

    <!-- Generate Confirmation Dialog -->
    <Dialog v-model:visible="showGenerateDialog" modal header="Give It Another Magical Spin" class="w-[95vw] max-w-md">
      <div class="py-4">
        <p class="text-sm sm:text-base">Compose this magic memory? This may take a little time.</p>
        <div class="flex justify-end gap-2 mt-4">
          <Button label="Cancel" severity="secondary" size="small" class="text-xs px-3 py-2" @click="cancelDialog" />
          <Button label="Compose" severity="primary" size="small" class="text-xs px-3 py-2" @click="confirmGenerate" />
        </div>
      </div>
    </Dialog>
    <!-- Regenerate Confirmation Dialog -->
    <Dialog v-model:visible="showRegenerateDialog" modal header="Recompose Memory Book" class="w-[95vw] max-w-md">
      <div class="p-4">
        <p class="text-sm sm:text-base mb-2">
          Are you sure you want to recompose this memory book?
        </p>
        <p class="text-gray-600 text-xs sm:text-sm mb-2">
          This will regenerate the PDF with the latest settings and assets.
        </p>
        <div class="flex gap-3 justify-end mt-4">
          <Button label="Cancel" class="p-button-secondary" @click="cancelDialog" />
          <Button 
            label="Yes, Recompose" 
            class="p-button-danger" 
            @click="confirmRegenerate" 
          />
        </div>
      </div>
    </Dialog>
    <!-- View Draft Dialog -->
    <Dialog v-model:visible="showDownloadDraftDialog" modal header="Magic Memory Not Composed" class="w-[95vw] max-w-md">
      <div class="py-4">
        <p class="text-sm sm:text-base">You need to compose the magic memory before viewing. 
          Would you like to compose it now? 
          This may take a little time.</p>
        <div class="flex justify-end gap-2 mt-4">
          <Button label="Cancel" severity="secondary" size="small" class="text-xs px-3 py-2" @click="cancelDialog" />
          <Button label="Compose Now" severity="primary" size="small" class="text-xs px-3 py-2" @click="confirmDownloadDraft" />
        </div>
      </div>
    </Dialog>

    <!-- PDF Preview Modal -->
    <Dialog
      v-model:visible="showPdfModal"
      modal
      header="PDF Preview"
      class="w-full max-w-6xl h-[90vh] sm:h-[85vh] mt-2 sm:mt-6"
      :contentStyle="{ height: '90vh', maxHeight: '90vh', padding: 0 }"
      :closable="false"
      :auto-z-index="false"
      :z-index="40"
    >
      <div class="flex flex-col h-full w-full" style="height: 90vh; max-height: 90vh; width: 100%; padding: 0;">
        <!-- PDF Viewer -->
        <div class="flex-1 min-h-0 w-full flex items-center justify-center overflow-auto">
          <ClientOnly>
            <PdfViewer v-if="pdfBlobUrl" :src="pdfBlobUrl" :style="pdfViewerStyle" />
            <div v-else class="text-center py-8 flex-1 flex items-center justify-center">
              <i class="h-[80%] pi pi-file-pdf text-3xl sm:text-4xl text-gray-400"></i>
              <p class="text-sm sm:text-base text-gray-600 mt-2">No PDF available for preview.</p>
            </div>
          </ClientOnly>
        </div>
        <!-- Action Buttons -->
        <div class="z-50 flex justify-center items-center gap-3 sm:gap-4 py-4 sm:py-6 px-4 bg-gray-50 border-t border-gray-200 min-h-[60px] sm:min-h-[80px]">
          <Button
            v-if="canShare"
            label="Share"
            icon="pi pi-share"
            size="small"
            class="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 hover:bg-blue-600 border-0"
            @click="sharePdf"
          />
          <Button
            label="Close"
            severity="secondary"
            size="small"
            class="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3"
            @click="showPdfModal = false"
          />
        </div>
      </div>
    </Dialog>

    <!-- Cleanup Confirmation Dialog -->
    <Dialog
      v-model:visible="showCleanupConfirmationModal"
      modal
      header="Confirm Cleanup"
      class="w-[95vw] max-w-lg cleanup-confirmation-dialog"
    >
      <div class="space-y-4">
        <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
          <div class="flex items-center space-x-3 mb-3">
            <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
              <i class="pi pi-broom text-orange-600 text-base sm:text-lg"></i>
            </div>
            <div>
              <h3 class="text-base sm:text-lg font-semibold text-gray-900">Ready for New Magic?</h3>
              <p class="text-xs sm:text-sm text-gray-600">We're about to clean up your magic memory</p>
            </div>
          </div>
          <div class="bg-white rounded-lg p-3 border border-orange-200">
            <p class="text-xs sm:text-sm text-gray-900">
              This will reset your magic memory back to draft status and clear any generated backgrounds and PDFs. 
              You'll be able to apply fresh magic to create a brand new version of your magic memory.
            </p>
          </div>
        </div>
        
        <div class="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div class="flex items-start space-x-2">
            <i class="pi pi-info-circle text-blue-600 mt-0.5"></i>
            <div>
              <p class="text-xs sm:text-sm font-medium text-gray-900">What happens next:</p>
              <ul class="text-xs text-gray-600 mt-1 space-y-1">
                <li>• Your book status will be reset to "draft"</li>
                <li>• Any existing backgrounds and PDFs will be cleared</li>
                <li>• You can then regenerate with fresh settings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex flex-col sm:flex-row justify-end items-center gap-3">
          <Button
            label="Cancel"
            icon="pi pi-times"
            severity="secondary"
            @click="showCleanupConfirmationModal = false"
            class="rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold shadow w-full sm:w-auto"
          />
          <Button
            label="Yes, Clean Up"
            icon="pi pi-broom"
            severity="danger"
            @click="confirmCleanup"
            class="bg-red-500 hover:bg-red-600 border-0 text-white font-bold rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm shadow w-full sm:w-auto"
          />
        </div>
      </template>
    </Dialog>

    <!-- Select Memories Dialog -->
    <Dialog
      v-model:visible="showSelectMemoriesModal"
      modal
      header="Select Your Memories"
      class="w-[95vw] max-w-6xl h-[90vh] select-memories-dialog"
      :closable="false"
    >
      <div v-if="!loadingAssets" class="space-y-4">
        <!-- Instructions -->
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 sm:p-4 border border-blue-200">
          <div class="flex items-center space-x-3 mb-2">
            <div class="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <i class="pi pi-heart text-blue-600 text-xs sm:text-sm"></i>
            </div>
            <h3 class="text-base sm:text-lg font-semibold text-gray-900">Choose Your Memories</h3>
          </div>
          <p class="text-xs sm:text-sm text-gray-600">
            Select the memories you'd like to include in your magic memory. You can filter by tags and select multiple memories at once.
          </p>
        </div>

        <!-- Filter Section -->
        <div class="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div class="flex-1 min-w-0">
              <label class="block text-sm font-medium text-gray-900 mb-2">Filter by Tags</label>
              <div class="flex gap-2">
                <MultiSelect
                  v-model="selectedTagFilter"
                  :options="computedAvailableTags"
                  option-label="label"
                  option-value="value"
                  placeholder="All memories"
                  class="flex-1"
                  @change="filterMemories"
                  :show-toggle-all="false"
                />
                <Button
                  v-if="selectedTagFilter && selectedTagFilter.length > 0"
                  icon="pi pi-times"
                  size="small"
                  severity="secondary"
                  @click="clearTagFilter"
                  class="px-2 sm:px-3"
                  v-tooltip.top="'Clear filter'"
                />
              </div>
            </div>
            <div class="flex items-center justify-center sm:justify-end gap-2">
              <Button
                label="Select All"
                icon="pi pi-check-square"
                size="small"
                @click="selectAllMemories"
                class="bg-green-500 hover:bg-green-600 border-0 text-xs px-2 sm:px-3 py-2"
              />
              <Button
                label="Clear All"
                icon="pi pi-times"
                size="small"
                severity="secondary"
                @click="selectedMemories = []"
                class="text-xs px-2 sm:px-3 py-2"
              />
            </div>
          </div>
          <div class="mt-2 text-xs sm:text-sm text-gray-600 text-center sm:text-left">
            Showing {{ filteredAssets.length }} of {{ availableAssets.length }} memories
            <span v-if="selectedTagFilter && selectedTagFilter.length > 0" class="block sm:inline"> • Filtered by: {{ selectedTagFilter.join(', ') }}</span>
          </div>
        </div>

        <!-- Memories Grid -->
        <div class="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div v-if="filteredAssets.length === 0" class="text-center py-8 text-gray-600">
            <i class="pi pi-images text-3xl sm:text-4xl mb-2 block"></i>
            <p class="text-base sm:text-lg font-medium">No memories found</p>
            <p class="text-xs sm:text-sm">Try changing your filter or add some memories first</p>
          </div>
          <div v-else class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4 max-h-48 sm:max-h-64 md:max-h-96 overflow-y-auto">
            <div
              v-for="asset in filteredAssets"
              :key="asset.id"
              class="relative group cursor-pointer touch-manipulation"
              @click="toggleMemorySelection(asset.id)"
            >
              <!-- Selection Overlay -->
              <div 
                class="absolute inset-0 rounded-lg border-2 transition-all duration-200 z-10"
                :class="selectedMemories.includes(asset.id) ? 'border-green-500 bg-green-500 bg-opacity-10' : 'border-transparent'"
              >
                <div 
                  class="absolute top-1 right-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center shadow-sm"
                  :class="selectedMemories.includes(asset.id) ? 'bg-green-500 text-white' : 'bg-white text-gray-400'"
                >
                  <i 
                    class="text-xs"
                    :class="selectedMemories.includes(asset.id) ? 'pi pi-check' : 'pi pi-plus'"
                  ></i>
                </div>
              </div>
              
              <!-- Memory Card -->
              <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-colors">
                <img 
                  v-if="asset.storage_url"
                  :src="asset.storage_url"
                  :alt="asset.user_caption || asset.ai_caption || 'Memory'"
                  class="w-full h-full object-contain bg-white"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <i class="pi pi-image text-gray-400 text-base sm:text-lg md:text-2xl"></i>
                </div>
              </div>
              
              <!-- Memory Info -->
              <div class="mt-1 sm:mt-2 text-center">
                <p class="text-xs font-medium text-gray-900 truncate px-1">
                  {{ asset.user_caption || asset.ai_caption || `Memory ${asset.id.slice(-4)}` }}
                </p>
                <p class="text-xs text-gray-600">
                  {{ formatDate(asset.created_at) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Selection Summary -->
        <div class="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 sm:p-4 border border-green-200">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center space-x-3">
              <div class="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                <i class="pi pi-check text-green-600 text-xs sm:text-sm"></i>
              </div>
              <div>
                <p class="text-xs sm:text-sm font-medium text-gray-900">
                  {{ selectedMemories.length }} memories selected
                </p>
                <p class="text-xs text-gray-600">
                  Ready to create your magic memory
                </p>
              </div>
            </div>
            <div class="text-center sm:text-right">
              <p class="text-xs text-gray-600">
                Estimated pages: {{ Math.ceil(selectedMemories.length / 4) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else class="flex items-center justify-center py-8 sm:py-12">
        <div class="text-center">
          <i class="pi pi-spin pi-spinner text-3xl sm:text-4xl mb-3 sm:mb-4 text-blue-600"></i>
          <p class="text-sm sm:text-base text-gray-600">Loading your memories...</p>
        </div>
      </div>

      <template #footer>
        <div class="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
          <div class="flex gap-2 w-full sm:w-auto">
            <Button
              label="Cancel"
              icon="pi pi-times"
              severity="secondary"
              @click="closeSelectMemoriesDialog"
              class="rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold shadow w-full sm:w-auto"
            />
          </div>
          <div class="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <span class="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              {{ selectedMemories.length }} selected
            </span>
            <Button
              label="Save Selection"
              icon="pi pi-check"
              :disabled="selectedMemories.length === 0"
              @click="saveSelectedMemories"
              class="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-0 w-full sm:w-auto text-xs sm:text-sm px-4 sm:px-5 py-2"
            />
          </div>
        </div>
      </template>
    </Dialog>

    <!-- Magic Memory Dialog -->
    <Dialog
      v-model:visible="showMagicMemoryDialog"
      modal
      :header="magicMemoryStep === 1 ? '✨ What should we call this memory? ✨' : '✨ Let\'s create something magical together ✨'"
      class="w-[95vw] max-w-3xl sm:rounded-2xl magic-memory-dialog"
      :closable="true"
    >
      <!-- Step 1: Title Input -->
      <div v-if="magicMemoryStep === 1" class="space-y-6">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles class="w-8 h-8 text-white" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">What should we call this special memory?</h3>
          <p class="text-gray-600">Give your magic memory a special name that captures the moment - I can't wait to see what we create together!</p>
        </div>
        
        <div class="field">
          <label class="block text-sm font-medium text-gray-900 mb-2">Memory Name</label>
          <InputText
            v-model="magicMemoryTitle"
            placeholder="e.g., 'Summer Vacation 2024', 'Grandma's Birthday', 'Family Reunion'"
            class="w-full text-lg p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            @keyup.enter="nextMagicMemoryStep"
          />
        </div>
      </div>

      <!-- Step 2: Event Selection -->
      <div v-if="magicMemoryStep === 2" class="space-y-6">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="pi pi-calendar text-2xl text-white"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Tell me what kind of event this was</h3>
          <p class="text-gray-600">You can leave this blank if you prefer, or select Other to tell me about a special event.</p>
        </div>
        <div class="field">
          <label class="block text-sm font-medium text-gray-900 mb-2">Event Type</label>
          <Dropdown
            v-model="magicMemoryEvent"
            :options="[
              { label: 'Vacation', value: 'vacation' },
              { label: 'Birthday', value: 'birthday' },
              { label: 'Anniversary', value: 'anniversary' },
              { label: 'Graduation', value: 'graduation' },
              { label: 'Family Trip', value: 'family_trip' },
              { label: 'Other (custom)', value: 'custom' }
            ]"
            option-label="label"
            option-value="value"
            placeholder="Select an event type..."
            class="w-full text-lg p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
          />
        </div>
        <div v-if="magicMemoryEvent === 'custom'" class="field mt-4">
          <label class="block text-sm font-medium text-gray-900 mb-2">Custom Event</label>
          <input
            v-model="magicCustomMemoryEvent"
            placeholder="Type your event (e.g., 'Bar Mitzvah', 'Retirement', 'First Day of School')"
            class="w-full text-lg p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
          />
        </div>
      </div>

      <!-- Step 3: Photo Count Selection -->
      <div v-if="magicMemoryStep === 3" class="space-y-6">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="pi pi-images text-2xl text-white"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">How many photos should I choose for you?</h3>
          <p class="text-gray-600">Select how many photos I should pick from your memory collection to create your magic story - trust me, this will be amazing!</p>
        </div>
        
        <div class="grid grid-cols-3 gap-4">
          <div
            v-for="count in [1, 4, 6]"
            :key="count"
            class="relative cursor-pointer"
            @click="magicPhotoCount = count"
          >
            <div
              class="border-2 rounded-lg p-4 text-center transition-all duration-200"
              :class="magicPhotoCount === count 
                ? 'border-purple-500 bg-purple-50 shadow-lg scale-105' 
                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'"
            >
              <div class="text-2xl font-bold text-gray-900 mb-1">{{ count }}</div>
              <div class="text-sm text-gray-600">
                {{ count === 1 ? 'Photo' : 'Photos' }}
              </div>
              <div v-if="magicPhotoCount === count" class="absolute top-2 right-2">
                <i class="pi pi-check text-purple-500 text-lg"></i>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div class="flex items-start gap-3">
            <i class="pi pi-info-circle text-blue-500 mt-1"></i>
            <div>
              <h4 class="font-semibold text-blue-900 mb-1">Selection Process</h4>
              <p class="text-sm text-blue-800">
                You'll select up to 12 photos in the next step, then I'll choose the best {{ magicPhotoCount }} photo{{ magicPhotoCount > 1 ? 's' : '' }} from your selection. 
                Your magic card will be split 50% for photos and 50% for text.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 4: Background Selection -->
      <div v-if="magicMemoryStep === 4" class="space-y-6">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="pi pi-palette text-2xl text-white"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">What kind of background would you like?</h3>
          <p class="text-gray-600">Choose a clean white background or let me create a magical design that matches your story's theme!</p>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            class="relative cursor-pointer"
            @click="magicBackgroundType = 'white'"
          >
            <div
              class="border-2 rounded-lg p-6 text-center transition-all duration-200 h-full"
              :class="magicBackgroundType === 'white' 
                ? 'border-purple-500 bg-purple-50 shadow-lg scale-105' 
                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'"
            >
              <div class="w-12 h-12 bg-white border-2 border-gray-300 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <i class="pi pi-file text-gray-600 text-xl"></i>
              </div>
              <div class="text-lg font-bold text-gray-900 mb-2">Clean & Simple</div>
              <div class="text-sm text-gray-600 mb-3">Pure white background for a classic, elegant look</div>
              <div class="text-xs text-gray-500">Perfect for formal events and timeless memories</div>
              <div v-if="magicBackgroundType === 'white'" class="absolute top-3 right-3">
                <i class="pi pi-check text-purple-500 text-lg"></i>
              </div>
            </div>
          </div>
          
          <div
            class="relative cursor-pointer"
            @click="magicBackgroundType = 'magical'"
          >
            <div
              class="border-2 rounded-lg p-6 text-center transition-all duration-200 h-full"
              :class="magicBackgroundType === 'magical' 
                ? 'border-purple-500 bg-purple-50 shadow-lg scale-105' 
                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'"
            >
              <div class="w-12 h-12 bg-gradient-to-br from-yellow-200 via-purple-200 to-blue-200 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <i class="pi pi-sparkles text-purple-600 text-xl"></i>
              </div>
              <div class="text-lg font-bold text-gray-900 mb-2">Magical Design</div>
              <div class="text-sm text-gray-600 mb-3">AI-generated background that matches your story's theme</div>
              <div class="text-xs text-gray-500">Adds a whimsical, personalized touch to your memory</div>
              <div v-if="magicBackgroundType === 'magical'" class="absolute top-3 right-3">
                <i class="pi pi-check text-purple-500 text-lg"></i>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div class="flex items-start gap-3">
            <i class="pi pi-info-circle text-blue-500 mt-1"></i>
            <div>
              <h4 class="font-semibold text-blue-900 mb-1">Background Details</h4>
              <p class="text-sm text-blue-800">
                {{ magicBackgroundType === 'white' 
                  ? 'A clean white background will make your photos and story the star of the show.' 
                  : 'I\'ll create a beautiful background design that complements your story and makes your memory even more special.' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 5: Photo Selection -->
      <div v-if="magicMemoryStep === 5 && !loadingAssets" class="space-y-4">
        <div class="bg-gradient-to-r from-yellow-50 via-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200 flex items-center gap-3 animate-pulse">
          <i class="pi pi-sparkles text-2xl text-yellow-400 animate-bounce"></i>
          <div>
            <h3 class="text-lg font-bold text-purple-700 mb-1">Show me up to 12 Memory Moments for "{{ magicMemoryTitle }}"</h3>
            <p class="text-sm text-gray-700">Choose up to 12 photos by tag to inspire your Magic Memory story. I'll select the best {{ magicPhotoCount }} photo{{ magicPhotoCount > 1 ? 's' : '' }} from your choices - you have such beautiful memories to work with!</p>
          </div>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <label class="block text-sm font-medium text-gray-900 mb-2">Filter by Tags</label>
          <div class="flex gap-2 mb-3">
            <MultiSelect
              v-model="magicSelectedTagFilter"
              :options="computedAvailableTags"
              option-label="label"
              option-value="value"
              placeholder="All photos"
              class="flex-1"
              :show-toggle-all="false"
            />
            <Button
              v-if="magicSelectedTagFilter && magicSelectedTagFilter.length > 0"
              icon="pi pi-times"
              size="small"
              severity="secondary"
              @click="magicSelectedTagFilter = []"
              class="px-2"
              v-tooltip.top="'Clear filter'"
            />
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
            <div
              v-for="asset in magicFilteredAssets"
              :key="asset.id"
              class="relative group cursor-pointer touch-manipulation magic-photo-card"
              :class="{
                'opacity-60 pointer-events-none': magicSelectedMemories.length >= 12 && !magicSelectedMemories.includes(asset.id),
                'ring-4 ring-yellow-400 ring-offset-2 scale-105 z-10 bg-yellow-100 shadow-xl': magicSelectedMemories.includes(asset.id)
              }"
              @click="toggleMagicMemorySelection(asset.id)"
            >
              <div v-if="magicSelectedMemories.includes(asset.id)" class="absolute inset-0 bg-yellow-200/40 rounded-lg z-20 flex items-center justify-center pointer-events-none transition-all duration-200">
                <i class="pi pi-check text-4xl text-yellow-500 animate-bounce"></i>
              </div>
              <div class="aspect-square bg-gradient-to-br from-purple-100 via-yellow-50 to-blue-100 rounded-lg overflow-hidden border-2 border-purple-200 hover:border-yellow-400 transition-colors">
                <img
                  v-if="asset.storage_url"
                  :src="asset.storage_url"
                  :alt="asset.user_caption || asset.ai_caption || 'Memory'"
                  class="w-full h-full object-cover bg-white"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <i class="pi pi-image text-gray-400 text-lg"></i>
                </div>
              </div>
              <div class="mt-1 text-center">
                <p class="text-xs font-medium text-purple-900 truncate px-1">{{ asset.user_caption || asset.ai_caption || `Photo ${asset.id.slice(-4)}` }}</p>
              </div>
            </div>
          </div>
          <div class="mt-2 text-xs text-gray-600 text-center">
            <span>{{ magicSelectedMemories.length }} selected (I'll pick the best {{ magicPhotoCount }} from your choices)</span>
            <span v-if="magicSelectedTagFilter && magicSelectedTagFilter.length > 0"> • Filtered by: {{ magicSelectedTagFilter.join(', ') }}</span>
          </div>
        </div>
      </div>
      <div v-else-if="loadingAssets" class="flex items-center justify-center py-8">
        <div class="text-center">
          <i class="pi pi-spin pi-spinner text-3xl text-purple-400 mb-3"></i>
          <p class="text-sm text-gray-600">Looking through your beautiful memories...</p>
        </div>
      </div>
      <template #footer>
        <div class="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
          <Button
            :label="magicMemoryStep === 1 ? 'Cancel' : 'Back'"
            :icon="magicMemoryStep === 1 ? 'pi pi-times' : 'pi pi-arrow-left'"
            severity="secondary"
            @click="magicMemoryStep === 1 ? showMagicMemoryDialog = false : previousMagicMemoryStep()"
            class="rounded-full px-4 py-2 text-xs font-bold shadow w-full sm:w-auto"
          />
          <Button
            v-if="magicMemoryStep === 1"
            label="Next: Tell me about the event"
            icon="pi pi-arrow-right"
            :disabled="!magicMemoryTitle.trim()"
            @click="nextMagicMemoryStep"
            class="bg-gradient-to-r from-yellow-400 to-purple-500 hover:from-yellow-500 hover:to-purple-600 border-0 w-full sm:w-auto text-xs px-4 py-2 font-bold"
          />
          <Button
            v-if="magicMemoryStep === 2"
            label="Next: How many photos?"
            icon="pi pi-arrow-right"
            :disabled="!magicMemoryEvent.trim()"
            @click="nextMagicMemoryStep"
            class="bg-gradient-to-r from-yellow-400 to-purple-500 hover:from-yellow-500 hover:to-purple-600 border-0 w-full sm:w-auto text-xs px-4 py-2 font-bold"
          />
          <Button
            v-if="magicMemoryStep === 3"
            label="Next: Choose your background"
            icon="pi pi-arrow-right"
            @click="nextMagicMemoryStep"
            class="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 border-0 w-full sm:w-auto text-xs px-4 py-2 font-bold"
          />
          <Button
            v-if="magicMemoryStep === 4"
            label="Next: Show me your photos"
            icon="pi pi-arrow-right"
            @click="nextMagicMemoryStep"
            class="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 border-0 w-full sm:w-auto text-xs px-4 py-2 font-bold"
          />
          <Button
            v-if="magicMemoryStep === 5"
            label="Let's make some magic!"
            icon="pi pi-bolt"
            :disabled="magicSelectedMemories.length < 1 || magicLoading"
            :loading="magicLoading"
            @click="onMagicMemoryContinue"
            class="bg-gradient-to-r from-yellow-400 to-purple-500 hover:from-yellow-500 hover:to-purple-600 border-0 w-full sm:w-auto text-xs px-4 py-2 font-bold animate-pulse"
          />
        </div>
      </template>
    </Dialog>
    </div>
  </div>

  <Dialog v-model:visible="showDeleteDialog" modal header="Delete Memory?" class="w-full max-w-xs rounded-2xl">
    <div class="text-center py-4">
      <i class="pi pi-exclamation-triangle text-3xl text-red-500 mb-2"></i>
      <div class="text-lg font-bold text-gray-900 mb-2">Are you sure?</div>
      <div class="text-gray-700 mb-4">This will move the memory to the deleted section. You can restore it later if needed.</div>
      <div class="flex justify-center gap-3">
        <button class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-full px-5 py-2 text-base shadow" @click="showDeleteDialog = false">Cancel</button>
        <button class="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold rounded-full px-5 py-2 text-base shadow" @click="deleteBookConfirmed">Delete</button>
      </div>
    </div>
  </Dialog>
  <div v-if="showAICaptionOverlay" class="fixed top-0 left-0 w-full z-50 flex justify-center pointer-events-none">
    <div class="mt-4 px-3 py-2 sm:mt-6 sm:px-6 sm:py-3 rounded-2xl shadow-lg bg-white/70 text-purple-800 text-base sm:text-lg font-caveat flex items-center gap-2 sm:gap-3 animate-magic-fade max-w-xs sm:max-w-md md:max-w-lg w-auto break-words">
      <i class="pi pi-sparkles text-yellow-400 text-xl sm:text-2xl animate-bounce flex-shrink-0"></i>
      <span class="italic truncate">The magic whispers:</span>
      <span class="font-bold break-words">"{{ lastAICaption }}"</span>
      <i class="pi pi-sparkles text-yellow-400 text-xl sm:text-2xl animate-bounce flex-shrink-0"></i>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useToast } from 'primevue/usetoast'
import { Sparkles, Sparkle, Wand2 } from 'lucide-vue-next'
import MemoryBookDialog from '~/components/MemoryBookDialog.vue'
const toast = useToast()

const showPdfModal = ref(false)
const pdfBlobUrl = ref(null)
const isChrome = ref(false)

// PDF Navigation variables
const currentPage = ref(1)
const totalPages = ref(1)
const zoomLevel = ref(1.0)
const pdfLoaded = ref(false)
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
const user = ref(null)

// Get initial user - use getSession instead of getUser for better error handling
const getInitialUser = async () => {
  try {
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user || null
    console.log('🔐 Initial session user:', user.value?.email)
  } catch (error) {
    console.error('❌ Error getting session:', error)
    user.value = null
    
    // If session is invalid, try to refresh it
    try {
      const { data: refreshData } = await supabase.auth.refreshSession()
      user.value = refreshData.session?.user || null
      console.log('🔄 Session refreshed, user:', user.value?.email)
    } catch (refreshError) {
      console.error('❌ Error refreshing session:', refreshError)
      user.value = null
    }
  }
}

// Initialize user
await getInitialUser()

// Watch for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  user.value = session?.user || null
  console.log('🔐 Auth state changed:', event, user.value?.email)
})

// Reactive data
const memoryBooks = ref([])
const loadingMemoryBooks = ref(true)
const showCreateModal = ref(false)

const showSuccessDialog = ref(false)
const newlyCreatedBook = ref(null)
const showDetailsModal = ref(false)
const selectedBook = ref(null)
const creatingBook = ref(false)
const assetThumbnails = ref({})

// Asset checking for empty state
const hasAssets = ref(false)
const approvedAssetsCount = ref(0)
const loadingAssets = ref(false)

// PDF Progress tracking
const showProgressDialog = ref(false)
const currentProgress = ref(0)
const currentProgressMessage = ref('')
const currentBookId = ref(null)
const progressInterval = ref(null)
const isRegenerating = ref(false)

// New book form
const newBook = ref({
  title: '',
  layoutType: 'grid',
  printSize: '8x10',
  quality: 'standard',
  medium: 'digital',
  theme: 'classic',
  gridLayout: '2x2',
  memoryShape: 'original',
  includeCaptions: true,
  backgroundType: 'white',
  memoryEvent: '',
  customMemoryEvent: ''
})

// Create modal step state
const createStep = ref(1)

// Asset selection for new book
const selectedAssets = ref([])

// Create modal navigation functions
const nextStep = () => {
  if (createStep.value === 1 && newBook.value.title.trim()) {
    createStep.value = 2
  }
}

const previousStep = () => {
  if (createStep.value === 2) {
    createStep.value = 1
  }
}

const resetCreateModal = () => {
  createStep.value = 1
  newBook.value = {
    title: '',
    layoutType: 'grid',
    printSize: '8x10',
    quality: 'standard',
    medium: 'digital',
    theme: 'classic',
    gridLayout: '2x2',
    memoryShape: 'original',
    includeCaptions: true,
    backgroundType: 'white',
    memoryEvent: '',
    customMemoryEvent: ''
  }
  selectedAssets.value = []
}



const closeCreateModal = () => {
  showCreateModal.value = false
}



// Options for dropdowns
const layoutOptions = ref([
  { label: 'Grid Layout', value: 'grid' },
  { label: 'Timeline Layout', value: 'timeline' },
  { label: 'Story Layout', value: 'story' },
  { label: 'Album Layout', value: 'album' }
])

const printSizeOptions = ref([
  { label: '5x7 inches', value: '5x7' },
  { label: '6x8 inches', value: '6x8' },
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

const gridLayoutOptions = ref([
  { label: '1 memory per page (1x1)', value: '1x1' },
  { label: '2 memories per page (2x1)', value: '2x1' },
  { label: '4 memories per page (2x2)', value: '2x2' },
  { label: '6 memories per page (3x2)', value: '3x2' },
  { label: '9 memories per page (3x3)', value: '3x3' },
  { label: '12 memories per page (3x4)', value: '3x4' },
  { label: '16 memories per page (4x4)', value: '4x4' }
])

const memoryShapeOptions = ref([
  { label: 'Original (keep natural aspect ratio)', value: 'original' },
  { label: 'Magic (AI chooses best shape)', value: 'magic' }
])

const memoryEventOptions = ref([
  { label: 'Vacation', value: 'vacation' },
  { label: 'Birthday', value: 'birthday' },
  { label: 'Anniversary', value: 'anniversary' },
  { label: 'Graduation', value: 'graduation' },
  { label: 'Family Trip', value: 'family_trip' },
  { label: 'Other (custom)', value: 'custom' }
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
  if (book.status === 'background_ready') {
    console.log('⚠️ Cannot regenerate book that is still being processed')
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'warn',
        summary: 'Book Still Processing',
        detail: 'Please wait for the current generation to complete before regenerating',
        life: 3000
      })
    }
    return
  }
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
const confirmRegenerate = async () => {
  showRegenerateDialog.value = false
  if (!pendingBook.value) return

  // Use the Savta Magic Spell pipeline for magic books
  if (pendingBook.value.layout_type === 'magic') {
    try {
      const supabase = useNuxtApp().$supabase
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      await $fetch('/api/memory-books/reset-for-regeneration', {
        method: 'POST',
        body: { bookId: pendingBook.value.id },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      // Show toast notification for regeneration
      if ($toast && $toast.add) {
        $toast.add({
          severity: 'info',
          summary: 'Regenerating Memory Book',
          detail: 'Your memory book is being regenerated with fresh settings.',
          life: 3000
        })
      }
      // Now trigger the full magic pipeline
      await generatePDF(pendingBook.value)
    } catch (error) {
      console.error('❌ Error resetting magic book for regeneration:', error)
      if ($toast && $toast.add) {
        $toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to reset magic book for regeneration',
          life: 4000
        })
      }
    }
  } else {
    // Traditional pipeline
    await generatePDF(pendingBook.value)
  }
  pendingBook.value = null
}
const downloadCurrentBook = () => {
  showRegenerateDialog.value = false
  if (pendingBook.value) downloadPDF(pendingBook.value)
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
const loadMemoryBooks = async () => {
  // Wait for user to be loaded
  if (!user.value?.id) {
    console.log('⏳ Waiting for user to load...')
    loadingMemoryBooks.value = false
    return
  }
  
  loadingMemoryBooks.value = true
  try {
    console.log('🔍 Starting loadMemoryBooks...')
    console.log('🔍 User:', user.value?.id)
    console.log('🔍 Database composable:', !!db)
    
    // Use the database composable (which works correctly)
    console.log('🔍 Loading magic memories...')
    const books = await db.memoryBooks.getMemoryBooks()
    console.log('✅ Magic memories loaded:', books?.length, 'books')
    memoryBooks.value = books
  } catch (error) {
    console.error('❌ Error loading memory books:', error)
    console.error('❌ Error stack:', error.stack)
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

// Watch for user changes and load memory books
watch(() => user.value, (newUser) => {
  if (newUser?.id) {
    console.log('👤 User loaded, loading memory books...')
    loadMemoryBooks()
  }
}, { immediate: true })

// Load memory books on mount (fallback)
onMounted(async () => {
  // Improved Chrome detection (exclude Edge, Brave, Opera)
  const ua = navigator.userAgent
  isChrome.value =
    /Chrome/.test(ua) &&
    /Google Inc/.test(navigator.vendor) &&
    !/Edg|Brave|OPR/.test(ua)
  
  // Check for assets to determine empty state
  await checkAssets()
})

// Cleanup on unmount
onUnmounted(() => {
  stopProgressPolling()
})

// Create memory book
const createMemoryBook = async () => {
  console.log('🔧 [createMemoryBook] Called. newBook.value:', JSON.parse(JSON.stringify(newBook.value)))
  if (!newBook.value.title) {
    console.log('🔧 [createMemoryBook] No title provided, returning')
    return
  }
  creatingBook.value = true
  try {
    // Use selected assets if any, otherwise get all approved assets
    let assetsToUse = [];
    if (newBook.value.created_from_assets && newBook.value.created_from_assets.length > 0) {
      assetsToUse = newBook.value.created_from_assets;
      console.log('🔧 [createMemoryBook] Using selected assets from newBook:', assetsToUse);
    } else if (selectedAssets.value.length > 0) {
      assetsToUse = selectedAssets.value;
      console.log('🔧 [createMemoryBook] Using selected assets from selectedAssets:', assetsToUse);
    } else {
      console.log('🔧 [createMemoryBook] Getting all approved assets...');
      const approvedAssets = await db.assets.getAssets({ approved: true });
      assetsToUse = approvedAssets.map(asset => asset.id);
      console.log('🔧 [createMemoryBook] Found approved assets:', assetsToUse);
    }
    if (assetsToUse.length === 0) {
      console.log('🔧 [createMemoryBook] No assets available')
      if ($toast && $toast.add) {
        $toast.add({
          severity: 'warn',
          summary: 'No Assets',
          detail: 'No approved assets available for this magic memory',
          life: 3000
        })
      }
      return
    }
    // Prepare data for API
    const bookData = {
      title: newBook.value.title,
      layout_type: newBook.value.layoutType,
      print_size: newBook.value.printSize,
      quality: newBook.value.quality,
      medium: newBook.value.medium,
      theme: newBook.value.theme,
      grid_layout: newBook.value.gridLayout,
      memory_shape: newBook.value.memoryShape,
      include_captions: newBook.value.includeCaptions,
      ai_background: newBook.value.aiBackground,
      memory_event: newBook.value.memoryEvent === 'custom' ? newBook.value.customMemoryEvent : newBook.value.memoryEvent,
      // For magic memories: selected assets go to photo_selection_pool, created_from_assets will be set by AI
      // For regular memories: selected assets go to created_from_assets
      ...(newBook.value.layoutType === 'magic' ? {
        photo_selection_pool: assetsToUse,
        created_from_assets: [] // Will be populated by AI during story generation
      } : {
        created_from_assets: assetsToUse
      }),
      status: 'draft'
    }
    console.log('🔧 [createMemoryBook] Calling db.memoryBooks.createMemoryBook with:', JSON.parse(JSON.stringify(bookData)))
    const memoryBook = await db.memoryBooks.createMemoryBook(bookData)
    console.log('🔧 [createMemoryBook] API call successful, response:', memoryBook)
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'success',
        summary: 'Created',
        detail: 'Magic memory created successfully',
        life: 3000
      })
    }
    newlyCreatedBook.value = memoryBook
    showSuccessDialog.value = true
    resetCreateModal()
    await loadMemoryBooks()
  } catch (error) {
    console.error('❌ [createMemoryBook] Error creating memory book:', error)
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to create magic memory',
        life: 3000
      })
    }
  } finally {
    creatingBook.value = false
  }
}

// Poll PDF status
const pollPdfStatus = async () => {
  console.log('pollPdfStatus called with', currentBookId.value)
  if (!currentBookId.value) {
    // Defensive: clear interval if still running
    if (progressInterval.value) {
      clearInterval(progressInterval.value)
      progressInterval.value = null
      console.warn('Cleared polling interval because currentBookId.value is null')
    }
    return
  }

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
      console.log('📊 Received status update:', {
        pdf_url: status.pdf_url,
        book_status: status.book_status,
        pdf_status: status.pdf_status,
        has_pdf_url: !!status.pdf_url,
        is_ready: status.book_status === 'ready'
      })
      
      // Parse percentage from status message if available
      if (status.pdf_status && status.pdf_status.includes('%')) {
        const percentMatch = status.pdf_status.match(/(\d+)%/)
        if (percentMatch) {
          const percent = parseInt(percentMatch[1])
          currentProgress.value = Math.min(percent, 95) // Cap at 95% until completion
          currentProgressMessage.value = status.pdf_status
          return
        }
      }
      
      // Only close the dialog when the PDF generation is truly completed
      if (status.pdf_url && status.book_status === 'ready') {
        console.log('✅ PDF URL found and book status is ready, closing dialog')
        currentProgress.value = 100
        currentProgressMessage.value = isRegenerating.value 
          ? 'Your magical memory is ready!' 
          : 'Your memory book is ready!'
        setTimeout(() => {
          stopProgressPolling()
          showProgressDialog.value = false
          loadMemoryBooks() // Reload to show updated status
        }, 2000) // Reduced delay since backend is now immediate
        return
      }
      
      // Check if pdf_url is available but still wait for completion status
      if (status.pdf_url && status.pdf_url.startsWith('https://')) {
        console.log('✅ PDF URL found, waiting for book status to be ready...')
        currentProgress.value = 95
        currentProgressMessage.value = 'Finalizing magic memory status...'
        return
      }
      
      // Update progress based on status - Enhanced for magic memory regeneration
      if (status.pdf_status === 'generating_background') {
        currentProgress.value = 10
        currentProgressMessage.value = 'Generating custom background image...'
      } else if (status.pdf_status === 'background_ready') {
        currentProgress.value = 20
        currentProgressMessage.value = 'Background ready, generating PDF...'
      } else if (status.pdf_status === 'generating_pdf') {
        currentProgress.value = 50
        currentProgressMessage.value = 'Weaving your memories into pages...'
      } else if (status.pdf_status === 'finalizing') {
        currentProgress.value = 90
        currentProgressMessage.value = 'Adding the final magical touches...'
      } else if (status.pdf_status === 'completed') {
        currentProgress.value = 100
        currentProgressMessage.value = 'Your memory book is ready!'
        // Do NOT close the dialog here. Wait for the pdf_url and book_status === 'ready'.
        // Previously, the dialog was closed here, which could be too early for multi-page books.
      } else if (status.pdf_status === 'error') {
        currentProgressMessage.value = status.pdf_error || 'PDF generation failed'
        setTimeout(() => {
          stopProgressPolling()
          showProgressDialog.value = false
        }, 2000)
      } else if (status.pdf_status === 'not_started') {
        currentProgress.value = 5
        currentProgressMessage.value = 'Gathering magical ingredients...'
      } else if (status.pdf_status === 'Creating beautiful background design...') {
        currentProgress.value = 15
        currentProgressMessage.value = 'Creating beautiful background design...'
      } else if (status.pdf_status === 'Downloading background design...') {
        currentProgress.value = 25
        currentProgressMessage.value = 'Summoning the background design...'
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
      } else if (status.pdf_status === '✨ Crafting your magical story... ✨') {
        currentProgress.value = 8
        currentProgressMessage.value = 'Generating story and selecting photos...'
      } else if (status.pdf_status === 'Gathering your magical memories...') {
        currentProgress.value = 12
        currentProgressMessage.value = 'Gathering memories...'
      } else if (status.pdf_status === 'Retrieving magical background...') {
        currentProgress.value = 18
        currentProgressMessage.value = 'Retrieving background...'
      } else if (status.pdf_status === 'Retrieving background image...') {
        currentProgress.value = 18
        currentProgressMessage.value = 'Retrieving background image...'
      } else if (status.pdf_status === 'Creating magical background...') {
        currentProgress.value = 22
        currentProgressMessage.value = 'Creating background...'
      } else if (status.pdf_status === 'Weaving your memories into pages...') {
        currentProgress.value = 55
        currentProgressMessage.value = 'Creating PDF pages...'
      } else if (status.pdf_status === 'Adding the final magical touches...') {
        currentProgress.value = 85
        currentProgressMessage.value = 'Adding final touches...'
      } else if (status.pdf_status === 'Finalizing magic memory status...') {
        currentProgress.value = 95
        currentProgressMessage.value = 'Finalizing memory book status...'
      } else if (status.pdf_status === 'Processing...') {
        currentProgress.value = Math.min(currentProgress.value + 2, 90)
        currentProgressMessage.value = 'Processing your memory book...'
      } else {
        currentProgressMessage.value = status.pdf_status || 'Processing...'
      }
    } else {
      // Fallback: show generic progress if no status available
      console.log('No status available, showing generic progress')
      if (currentProgress.value < 90) {
        currentProgress.value += 5
        currentProgressMessage.value = 'Processing your memory book...'
      }
    }
  } catch (error) {
    console.error('Error polling PDF status:', error)
    // Fallback: show generic progress on error
    if (currentProgress.value < 90) {
      currentProgress.value += 5
      currentProgressMessage.value = 'Processing your memory book...'
    }
  }
}

// Start progress polling
const startProgressPolling = (bookId, regenerating = false) => {
  console.log('startProgressPolling called with bookId:', bookId, 'regenerating:', regenerating)
  currentBookId.value = bookId
  currentProgress.value = 0
  isRegenerating.value = regenerating
  currentProgressMessage.value = regenerating 
    ? 'Brewing up a spell...' 
    : 'Starting memory book creation...'
  showProgressDialog.value = true
  console.log('showProgressDialog set to:', showProgressDialog.value)
  
  // Poll every 3 seconds
  progressInterval.value = setInterval(pollPdfStatus, 3000)
  
  // Initial poll
  pollPdfStatus()
  
  // Set a timeout to stop polling after 5 minutes (300 seconds)
  const timeout = setTimeout(() => {
    console.log('PDF generation timeout, closing dialog')
    stopProgressPolling()
    showProgressDialog.value = false
    loadMemoryBooks()
  }, 300000) // 5 minutes
}

// Stop progress polling
const stopProgressPolling = () => {
  if (progressInterval.value) {
    clearInterval(progressInterval.value)
    progressInterval.value = null
  }
  // Only now set currentBookId.value to null
  currentBookId.value = null
}

// Generate PDF
const generatePDF = async (book) => {
  console.log('generatePDF called for book:', book.id)
  
  // Check if the book has assets
  // For magic memories, check photo_selection_pool (user's original selection) for regeneration
  // For regular memories, check created_from_assets (user's selected photos)
  const hasAssets = book.layout_type === 'magic' 
    ? (book.photo_selection_pool && book.photo_selection_pool.length > 0)
    : (book.created_from_assets && book.created_from_assets.length > 0)
  
  if (!hasAssets) {
    console.error('❌ Cannot generate PDF: No assets found in memory book')
    console.log('Book layout type:', book.layout_type)
    console.log('Photo selection pool:', book.photo_selection_pool)
    console.log('Created from assets:', book.created_from_assets)
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'error',
        summary: 'No Assets Found',
        detail: 'This memory book has no assets to generate a PDF from. Please add some memories first.',
        life: 4000
      })
    }
    return
  }
  
  try {
    // Start progress polling
    console.log('Starting progress polling...')
    const isRegeneratingBook = book.status === 'ready' || book.status === 'background_ready'
    startProgressPolling(book.id, isRegeneratingBook)
    console.log('Progress dialog should be visible:', showProgressDialog.value)
    
    // For regeneration, clear existing background and PDF URLs first
    if (book.status === 'ready' && (book.background_url || book.pdf_url)) {
      console.log('🔄 Regenerating memory, clearing existing URLs...')
      try {
        // Preserve the layout_type when clearing for regeneration
        const updateData = {
          background_url: null,
          pdf_url: null,
          status: 'draft'
        }
        
        // If this is a magic memory book, ensure we preserve the magic story
        if (book.layout_type === 'magic') {
          console.log('✨ Preserving magic memory layout and story for regeneration')
          // Keep the magic_story and layout_type intact
        }
        
        await db.memoryBooks.updateMemoryBook(book.id, updateData)
        console.log('✅ Cleared existing URLs for regeneration')
      } catch (clearError) {
        console.warn('⚠️ Failed to clear existing URLs:', clearError)
        // Continue anyway, the backend will handle it
      }
    }
    
    // Call the API endpoint to generate PDF with page count and page size
    console.log('Calling PDF generation API...')
    const supabase = useNuxtApp().$supabase

    const { data: sessionData } = await supabase.auth.getSession()

    // Get the latest book data to ensure we have the most recent settings
    const { data: latestBook, error: bookError } = await supabase
      .from('memory_books')
      .select('*')
      .eq('id', book.id)
      .single()

    if (bookError || !latestBook) {
      throw new Error('Failed to fetch latest book data')
    }

    const printSize = latestBook.print_size || '8x10'
    
    console.log('📄 PDF generation parameters:', { printSize })

    const response = await $fetch(`/api/memory-books/download/${book.id}?printSize=${printSize}`, {
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

// Calculate compose time for newly created book
const calculateComposeTime = () => {
  if (!newlyCreatedBook.value) return 0
  
  let totalTime = 0
  
  // Add base time for custom background only if magical background was selected
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
  
  // Close the success dialog
  showSuccessDialog.value = false
  
  // Find the book in the current memory books list
  const book = memoryBooks.value.find(b => b.id === newlyCreatedBook.value.id)
  if (!book) {
    console.error('Could not find newly created book in memory books list')
    return
  }
  
  // Trigger PDF generation
  await generatePDF(book)
  
  // Clear the reference
  newlyCreatedBook.value = null
}

// Download PDF
const downloadPDF = async (book) => {
  try {
    // Always fetch the latest book from the backend
    const latestBook = await db.memoryBooks.getMemoryBook(book.id)
    if (!latestBook) throw new Error('Could not fetch latest memory book')

    // Call the API endpoint to get the download URL
    const supabase = useNuxtApp().$supabase
    const { data: sessionData } = await supabase.auth.getSession()
    const response = await $fetch(`/api/memory-books/download/${latestBook.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionData.session?.access_token}`
      }
    })
    if (!response.success || !response.downloadUrl) {
      throw new Error('Failed to get download URL')
    }
    // Log the download URL for debugging
    console.log('📥 Download URL from backend:', response.downloadUrl)
    // Add cache-busting query string
    const cacheBuster = `cb=${Date.now()}`;
    const pdfUrlWithBuster = response.downloadUrl.includes('?')
      ? `${response.downloadUrl}&${cacheBuster}`
      : `${response.downloadUrl}?${cacheBuster}`;
    // Open PDF in modal instead of direct download
    await viewPDF(pdfUrlWithBuster, latestBook.id)
  } catch (error) {
    console.error('Error downloading PDF:', error)
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to open PDF',
        life: 3000
      })
    }
  }
}

// Force download PDF (new function for details page)
const forceDownloadPDF = async (book) => {
  try {
    // Always fetch the latest book from the backend
    const latestBook = await db.memoryBooks.getMemoryBook(book.id)
    if (!latestBook) throw new Error('Could not fetch latest memory book')

    // Call the API endpoint to get the download URL
    const supabase = useNuxtApp().$supabase
    const { data: sessionData } = await supabase.auth.getSession()
    const response = await $fetch(`/api/memory-books/download/${latestBook.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionData.session?.access_token}`
      }
    })
    if (!response.success || !response.downloadUrl) {
      throw new Error('Failed to get download URL')
    }
    
    // Create a temporary anchor element to force download
    const link = document.createElement('a')
    link.href = response.downloadUrl
    link.download = `${latestBook.title || 'Memory Book'}.pdf`
    link.target = '_blank'
    
    // Add cache-busting query string
    const cacheBuster = `cb=${Date.now()}`
    link.href = response.downloadUrl.includes('?')
      ? `${response.downloadUrl}&${cacheBuster}`
      : `${response.downloadUrl}?${cacheBuster}`
    
    // Trigger the download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'success',
        summary: 'Download Started',
        detail: 'Your magic memory PDF is being downloaded',
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
        detail: 'Magic memory approved',
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
        detail: 'Magical memory unapproved',
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

// View PDF in modal
const viewPDF = async (pdfUrl, bookId) => {
  try {
    // Force reset before setting new URL
    showPdfModal.value = false;
    pdfBlobUrl.value = null;
    // Reset navigation state
    currentPage.value = 1;
    totalPages.value = 1;
    zoomLevel.value = 1.0;
    pdfLoaded.value = false;
    
    // Wait for modal to close completely
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Set the PDF URL
    pdfBlobUrl.value = pdfUrl;
    
    // Wait a bit more before opening modal
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Open the modal
    showPdfModal.value = true;
    console.log('PDF modal opened with URL:', pdfUrl);
  } catch (error) {
    console.error('Error opening PDF modal:', error);
    // Fallback: try to open in new tab
    window.open(pdfUrl, '_blank');
  }
};

// PDF Navigation functions
const onPdfLoad = (event) => {
  console.log('PDF loaded successfully');
  pdfLoaded.value = true;
  
  // Try to get page count from the PDF iframe element
  try {
    const iframeElement = event.target;
    // For now, we'll estimate pages based on the book's asset count
    // This is a fallback since we can't reliably get page count from iframe
    if (selectedBook.value && selectedBook.value.created_from_assets) {
      const assetCount = selectedBook.value.created_from_assets.length;
      // Estimate 4 assets per page (typical for 2x2 grid)
      totalPages.value = Math.max(1, Math.ceil(assetCount / 4));
    } else {
      totalPages.value = 1;
    }
  } catch (error) {
    console.warn('Could not determine PDF page count:', error);
    totalPages.value = 1;
  }
};

const openPdfInNewTab = () => {
  if (pdfBlobUrl.value) {
    window.open(pdfBlobUrl.value, '_blank');
  }
};

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const zoomIn = () => {
  if (zoomLevel.value < 3.0) {
    zoomLevel.value += 0.25;
  }
};

const zoomOut = () => {
  if (zoomLevel.value > 0.5) {
    zoomLevel.value -= 0.25;
  }
};

const downloadCurrentPdf = () => {
  if (pdfBlobUrl.value) {
    const link = document.createElement('a');
    link.href = pdfBlobUrl.value;
    link.download = `${selectedBook.value?.title || 'Memory Book'}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Check if Web Share API is available (client-side only)
const canShare = computed(() => {
  if (process.client) {
    return navigator && navigator.share;
  }
  return false;
});

const sharePdf = async () => {
  if (pdfBlobUrl.value && process.client && navigator?.share) {
    try {
      // Fetch the PDF as a blob
      const response = await fetch(pdfBlobUrl.value);
      const blob = await response.blob();
      
      // Create a file from the blob
      const file = new File([blob], `${selectedBook.value?.title || 'Memory Book'}.pdf`, {
        type: 'application/pdf'
      });
      
      // Share the file
      await navigator.share({
        title: selectedBook.value?.title || 'Memory Book',
        text: 'Check out this memory book!',
        files: [file]
      });
    } catch (error) {
      console.error('Error sharing PDF:', error);
      // Fallback to download if sharing fails
      downloadCurrentPdf();
    }
  } else {
    // Fallback to download if Web Share API is not available
    downloadCurrentPdf();
  }
};

watch(showPdfModal, (val) => {
  if (!val && pdfBlobUrl.value) {
    URL.revokeObjectURL(pdfBlobUrl.value)
    pdfBlobUrl.value = null
    // Reset navigation state
    currentPage.value = 1;
    totalPages.value = 1;
    zoomLevel.value = 1.0;
  }
})

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

// Get status badge class for beautiful styling
const getStatusBadgeClass = (status) => {
  const badgeClassMap = {
    'draft': 'bg-amber-50 text-amber-700 border border-amber-200',
    'background_ready': 'bg-blue-50 text-blue-700 border border-blue-200',
    'ready': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    'approved': 'bg-green-50 text-green-700 border border-green-200',
    'distributed': 'bg-purple-50 text-purple-700 border border-purple-200',
    'archived': 'bg-gray-50 text-gray-700 border border-gray-200'
  }
  return badgeClassMap[status] || 'bg-gray-50 text-gray-700 border border-gray-200'
}

// Get status icon
const getStatusIcon = (status) => {
  const iconMap = {
    'draft': 'pi pi-pencil',
    'background_ready': 'pi pi-spinner pi-spin',
    'ready': 'pi pi-check-circle',
    'approved': 'pi pi-star',
    'distributed': 'pi pi-send',
    'archived': 'pi pi-archive'
  }
  return iconMap[status] || 'pi pi-circle'
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

const showEditSettingsModal = ref(false)
const editBook = ref(null)
const savingEditBook = ref(false)
const availableAssets = ref([])

const openEditSettings = async (book) => {
  loadingAssets.value = true
  try {
    // Load all approved assets for the user
    const allApprovedAssets = await db.assets.getAssets({ approved: true })
    availableAssets.value = allApprovedAssets || []
    
    // Load the actual asset objects for the book's created_from_assets
    const selectedAssetObjects = []
    if (book.created_from_assets && book.created_from_assets.length > 0) {
      for (const assetId of book.created_from_assets) {
        const asset = allApprovedAssets.find(a => a.id === assetId)
        if (asset) {
          selectedAssetObjects.push(asset)
        }
      }
    }
    
    // Map book fields to editable fields
    editBook.value = {
      id: book.id,
      title: book.title,
      layoutType: book.layout_type || book.layoutType || 'grid',
      printSize: book.print_size || book.printSize || '8x10',
      quality: book.quality || 'standard',
      medium: book.medium || 'digital',
      theme: book.theme || 'classic',
      gridLayout: book.grid_layout || '2x2',
      memoryShape: book.memory_shape || 'original',
      includeCaptions: book.include_captions ?? book.includeCaptions ?? true,

      aiBackground: book.ai_background ?? book.aiBackground ?? true,
      memoryEvent: book.memory_event || book.memoryEvent || '',
      customMemoryEvent: (book.memory_event && !['vacation','birthday','anniversary','graduation','family_trip'].includes((book.memory_event || '').toLowerCase())) ? book.memory_event : '',
      created_from_assets: book.created_from_assets || [],
      selectedAssetObjects: selectedAssetObjects
    }
    showEditSettingsModal.value = true
  } catch (error) {
    console.error('Error loading assets for edit:', error)
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load assets for editing',
        life: 3000
      })
    }
  } finally {
    loadingAssets.value = false
  }
}

const saveEditBook = async () => {
  if (!editBook.value) return
  savingEditBook.value = true
  try {
    // Filter selected assets to ensure they exist and are approved
    const selectedAssetIds = editBook.value.created_from_assets.filter(assetId => {
      const asset = availableAssets.value.find(a => a.id === assetId)
      return asset && asset.approved
    })

    // Update the book with new settings and selected assets
    await db.memoryBooks.updateMemoryBook(editBook.value.id, {
      title: editBook.value.title,
      layout_type: editBook.value.layoutType,
      print_size: editBook.value.printSize,
      quality: editBook.value.quality,
      medium: editBook.value.medium,
      theme: editBook.value.theme,
      grid_layout: editBook.value.gridLayout,
      memory_shape: editBook.value.memoryShape,
      include_captions: editBook.value.includeCaptions,

      created_from_assets: selectedAssetIds
    })
    
    showEditSettingsModal.value = false
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'success',
        summary: 'Updated',
        detail: 'Memory book settings and assets updated',
        life: 3000
      })
    }
    await loadMemoryBooks()
  } catch (error) {
    console.error('Error updating memory book:', error)
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update memory book',
        life: 3000
      })
    }
  } finally {
    savingEditBook.value = false
  }
}

const showSelectMemoriesDialog = () => {
  showSelectMemoriesModal.value = true
}

const showSelectMemoriesModal = ref(false)
const showCleanupConfirmationModal = ref(false)
const cleanupBookId = ref(null)
const selectedMemories = ref([])
const selectedTagFilter = ref([])
const availableTags = ref([])
const filteredAssets = ref([])

// Computed property for available tags
const computedAvailableTags = computed(() => {
  const allTags = new Set()
  availableAssets.value.forEach(asset => {
    if (asset.tags && Array.isArray(asset.tags)) {
      asset.tags.forEach(tag => allTags.add(tag))
    }
  })
  return Array.from(allTags).map(tag => ({ label: tag, value: tag }))
})

// Filter memories based on selected tags
const filterMemories = () => {
  if (!selectedTagFilter.value || selectedTagFilter.value.length === 0) {
    filteredAssets.value = availableAssets.value
  } else {
    filteredAssets.value = availableAssets.value.filter(asset => 
      asset.tags && Array.isArray(asset.tags) && 
      selectedTagFilter.value.some(tag => asset.tags.includes(tag))
    )
  }
}

// Watch for changes in available assets to update filtered assets
watch(availableAssets, () => {
  filterMemories()
}, { immediate: true })

// Watch for changes in tag filter
watch(selectedTagFilter, () => {
  filterMemories()
})

const openSelectMemoriesDialog = async () => {
  loadingAssets.value = true
  try {
    const allApprovedAssets = await db.assets.getAssets({ approved: true })
    availableAssets.value = allApprovedAssets || []
    
    // Check if we're in edit mode or create mode
    if (editBook.value) {
      // Edit mode - use existing selected assets
      selectedMemories.value = editBook.value.created_from_assets || []
    } else {
      // Create mode - use current selection if any, otherwise clear
      if (selectedAssets.value.length > 0) {
        selectedMemories.value = [...selectedAssets.value]
      } else {
        selectedMemories.value = []
      }
    }
    
    selectedTagFilter.value = [] // Reset filter
    showSelectMemoriesModal.value = true
  } catch (error) {
    console.error('Error loading assets for memory selection:', error)
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load assets for memory selection',
        life: 3000
      })
    }
  } finally {
    loadingAssets.value = false
  }
}

const closeSelectMemoriesDialog = () => {
  showSelectMemoriesModal.value = false
  selectedMemories.value = []
  selectedTagFilter.value = []
}

const toggleMemorySelection = (assetId) => {
  const index = selectedMemories.value.indexOf(assetId)
  if (index > -1) {
    selectedMemories.value.splice(index, 1)
  } else {
    selectedMemories.value.push(assetId)
  }
}

const selectAllMemories = () => {
  selectedMemories.value = filteredAssets.value.map(asset => asset.id)
}

const saveSelectedMemories = () => {
  if (editBook.value) {
    // Edit mode - update the edit book
    editBook.value.created_from_assets = selectedMemories.value
  } else {
    // Create mode - update the selected assets for new book
    selectedAssets.value = selectedMemories.value
  }
  
  showSelectMemoriesModal.value = false
  if ($toast && $toast.add) {
    $toast.add({
      severity: 'success',
      summary: 'Selected',
      detail: `${selectedMemories.value.length} memories selected`,
      life: 3000
    })
  }
}

const clearTagFilter = () => {
  selectedTagFilter.value = []
  filterMemories()
}

const showCleanupConfirmation = (bookId) => {
  cleanupBookId.value = bookId
  showCleanupConfirmationModal.value = true
}

const confirmCleanup = async () => {
  if (!cleanupBookId.value) return
  
  try {
    await db.memoryBooks.updateMemoryBook(cleanupBookId.value, {
      status: 'draft',
      approved_at: null,
      background_url: null,
      pdf_url: null
    })
    
    showCleanupConfirmationModal.value = false
    cleanupBookId.value = null
    
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'success',
        summary: 'Cleaned Up!',
        detail: 'We have cleaned up your magic memory so you can apply new magic!',
        life: 4000
      })
    }
    
    showEditSettingsModal.value = false
    await loadMemoryBooks()
  } catch (err) {
    console.error('Error cleaning up book:', err)
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to clean up book.',
        life: 3000
      })
    }
  }
}

const cleanupBook = async (bookId) => {
  try {
    await db.memoryBooks.updateMemoryBook(bookId, {
      status: 'draft',
      approved_at: null,
      background_url: null,
      pdf_url: null
    })
    $toast.add({
      severity: 'success',
      summary: 'Book Reset',
      detail: 'Book status reset to draft and cleared background/PDF.',
      life: 2000
    })
    showEditSettingsModal.value = false
    await loadMemoryBooks()
  } catch (err) {
    $toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to reset book.',
      life: 3000
    })
  }
}

const showInfoDialog = ref(false)

// import PdfViewer from '~/components/PdfViewer.vue'
import { defineAsyncComponent } from 'vue'
const PdfViewer = defineAsyncComponent(() => import('~/components/PdfViewer.vue'))

const showMagicMemoryDialog = ref(false)
const magicMemoryStep = ref(1) // 1 = title input, 2 = event selection, 3 = photo count, 4 = background selection, 5 = photo selection
const magicMemoryTitle = ref('')
const magicMemoryEvent = ref('')
const magicPhotoCount = ref(4) // Default to 4 photos
const magicBackgroundType = ref('white') // 'white' or 'magical'

const magicSelectedTagFilter = ref([])
const magicSelectedMemories = ref([])

const magicFilteredAssets = computed(() => {
  if (!Array.isArray(availableAssets.value)) return []
  // Only show photos, filter by tags
  return availableAssets.value.filter(asset =>
    asset.type === 'photo' &&
    (!magicSelectedTagFilter.value.length || (asset.tags && asset.tags.some(tag => magicSelectedTagFilter.value.includes(tag))) )
  )
})

function toggleMagicMemorySelection(id) {
  if (magicSelectedMemories.value.includes(id)) {
    magicSelectedMemories.value = magicSelectedMemories.value.filter(x => x !== id)
  } else if (magicSelectedMemories.value.length < 12) {
    magicSelectedMemories.value.push(id)
  }
}

const magicLoading = ref(false)



async function onMagicMemoryContinue() {
  if (magicSelectedMemories.value.length < 1) return
  magicLoading.value = true
  
  // Show initial status dialog for story generation
  showProgressDialog.value = true
  currentProgress.value = 5
  currentProgressMessage.value = '🧙 Looking through your beautiful memories...'
  isRegenerating.value = false
  
  try {
    const selectedAssets = availableAssets.value.filter(a => magicSelectedMemories.value.includes(a.id))
    const photos = selectedAssets.map(a => ({
      id: a.id,
      ai_caption: a.ai_caption || '',
      people_detected: a.people_detected || [],
      tags: a.tags || [],
      user_tags: a.user_tags || [],
      city: a.city || null,
      state: a.state || null,
      country: a.country || null,
      zip_code: a.zip_code || null
    }))
    let aiBody = { 
      photos,
      title: magicMemoryTitle.value,
      memory_event: magicMemoryEvent.value === 'custom' ? magicCustomMemoryEvent.value.trim() : magicMemoryEvent.value,
      photo_count: magicPhotoCount.value,
      background_type: magicBackgroundType.value,
      theme: 'classic' // Default theme since it's not collected in the Magic Memory dialog
    }
    if (photos.length <= magicPhotoCount.value) {
      aiBody.forceAll = true
    }
    
    // Update status for story generation
    currentProgress.value = 15
    currentProgressMessage.value = '🔮 Crafting your special story...'
    
    const aiRes = await $fetch('/api/ai/magic-memory', {
      method: 'POST',
      body: aiBody
    })
    if (!aiRes.selected_photo_ids || !Array.isArray(aiRes.selected_photo_ids) || aiRes.selected_photo_ids.length < 1 || aiRes.selected_photo_ids.length > magicPhotoCount.value) {
      throw new Error(`I need a bit more to work with. Let me try again with different photos.`)
    }
    if (!aiRes.story || typeof aiRes.story !== 'string' || aiRes.story.trim().length < 10) {
      throw new Error('I need to try again to create something special for you.')
    }
    
    // Update status for saving the magic memory
    currentProgress.value = 25
    currentProgressMessage.value = '📚 Saving your magic card...'
    
    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token
    
    const dbRes = await $fetch('/api/memory-books/create-magic-memory', {
      method: 'POST',
      body: {
        asset_ids: aiRes.selected_photo_ids,
        photo_selection_pool: magicSelectedMemories.value,
        story: aiRes.story,
        title: magicMemoryTitle.value || 'Magic Memory',
        memory_event: magicMemoryEvent.value === 'custom' ? magicCustomMemoryEvent.value.trim() : magicMemoryEvent.value,
        background_type: aiRes.background_type || magicBackgroundType.value,
        photo_count: magicPhotoCount.value
      },
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    if (!dbRes.success) throw new Error('I need to try again to save your magic card.')
    
    // Update status for PDF generation
    currentProgress.value = 30
    currentProgressMessage.value = '✨ Creating your magic card...'
    
    // Create a book object for the progress dialog with proper asset references
    const book = {
      id: dbRes.book_id,
      layout_type: 'magic',
      status: 'draft',
      photo_selection_pool: magicSelectedMemories.value,
      created_from_assets: aiRes.selected_photo_ids || []
    }
    
    // Close the magic memory dialog and clean up
    showMagicMemoryDialog.value = false
    magicSelectedMemories.value = []
    magicSelectedTagFilter.value = []
    
    // Use the unified progress dialog system for PDF generation
    await generatePDF(book)
    
    if (typeof loadMemoryBooks === 'function') await loadMemoryBooks()
    
  } catch (err) {
    // Close progress dialog on error
    showProgressDialog.value = false
    stopProgressPolling()
    toast.add({ severity: 'error', summary: 'Let me try again', detail: err.message || 'I need to try again to create something special for you.', life: 5000 })
  } finally {
    magicLoading.value = false
  }
}

const openMagicMemoryDialog = async () => {
  magicMemoryStep.value = 1
  magicMemoryTitle.value = ''
  magicMemoryEvent.value = ''
  magicPhotoCount.value = 4
  magicBackgroundType.value = 'white'
  magicSelectedMemories.value = []
  magicSelectedTagFilter.value = []
  loadingAssets.value = true
  try {
    const allApprovedAssets = await db.assets.getAssets({ approved: true })
    availableAssets.value = allApprovedAssets || []
  } catch (error) {
    availableAssets.value = []
  } finally {
    loadingAssets.value = false
    showMagicMemoryDialog.value = true
  }
}

const nextMagicMemoryStep = () => {
  if (magicMemoryStep.value === 1 && magicMemoryTitle.value.trim()) {
    magicMemoryStep.value = 2
  } else if (magicMemoryStep.value === 2) {
    magicMemoryStep.value = 3
  } else if (magicMemoryStep.value === 3) {
    magicMemoryStep.value = 4
  } else if (magicMemoryStep.value === 4) {
    magicMemoryStep.value = 5
  }
}

const previousMagicMemoryStep = () => {
  if (magicMemoryStep.value === 5) {
    magicMemoryStep.value = 4
  } else if (magicMemoryStep.value === 4) {
    magicMemoryStep.value = 3
  } else if (magicMemoryStep.value === 3) {
    magicMemoryStep.value = 2
  } else if (magicMemoryStep.value === 2) {
    magicMemoryStep.value = 1
    magicCustomMemoryEvent.value = ''
  }
}

const showDeleteDialog = ref(false)
const bookToDelete = ref(null)

function confirmDeleteBook(book) {
  bookToDelete.value = book
  showDeleteDialog.value = true
}

async function deleteBookConfirmed() {
  if (!bookToDelete.value) return
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token
    await $fetch(`/api/memory-books/${bookToDelete.value.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    toast.add({ severity: 'success', summary: 'Deleted', detail: 'Memory book deleted.', life: 3000 })
    if (typeof loadMemoryBooks === 'function') await loadMemoryBooks()
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Delete Failed', detail: err.message || 'Could not delete book', life: 4000 })
  } finally {
    showDeleteDialog.value = false
    bookToDelete.value = null
  }
}

// Add the following methods:
async function createMemoryBookFromDialog(data) {
  console.log('🔧 [createMemoryBookFromDialog] Starting with data:', data)
  
  // Check if assets are selected
  if (!data.selectedAssets || data.selectedAssets.length === 0) {
    // Show dialog explaining the requirement
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'warn',
        summary: 'Assets Required',
        detail: 'Please select at least one memory to include in your magic memory book.',
        life: 4000
      })
    }
    return // Don't proceed with creation
  }
  
  try {
    // Map dialog data to newBook structure
    newBook.value = {
      title: data.title,
      layoutType: data.layoutType,
      printSize: data.printSize,
      quality: data.quality,
      medium: data.medium,
      theme: data.theme,
      gridLayout: data.gridLayout,
      memoryShape: data.memoryShape,
      includeCaptions: data.includeCaptions,
      backgroundType: data.backgroundType,
      memoryEvent: data.memoryEvent,
      customMemoryEvent: data.customMemoryEvent,
      // Store selected asset IDs for the book
      // For magic memories: selected assets go to photo_selection_pool, created_from_assets will be set by AI
      // For regular memories: selected assets go to created_from_assets
      ...(data.layoutType === 'magic' ? {
        photo_selection_pool: Array.isArray(data.selectedAssets) ? data.selectedAssets.map(a => a.id) : [],
        created_from_assets: [] // Will be populated by AI during story generation
      } : {
        created_from_assets: Array.isArray(data.selectedAssets) ? data.selectedAssets.map(a => a.id) : []
      })
    }
    
    console.log('🔧 [createMemoryBookFromDialog] Mapped newBook.value:', newBook.value)
    
    // Call the existing createMemoryBook method
    console.log('🔧 [createMemoryBookFromDialog] Calling createMemoryBook...')
    await createMemoryBook()
    console.log('🔧 [createMemoryBookFromDialog] createMemoryBook completed successfully')
    
    // Close the create dialog after successful creation
    showCreateModal.value = false
  } catch (error) {
    console.error('❌ [createMemoryBookFromDialog] Error:', error)
    throw error
  }
}

async function saveEditBookFromDialog(data) {
  console.log('🔧 [saveEditBookFromDialog] Starting with data:', data)
  
  try {
    // Map dialog data to editBook structure
    editBook.value = {
      ...editBook.value, // Keep existing fields like id
      title: data.title,
      layoutType: data.layoutType,
      printSize: data.printSize,
      quality: data.quality,
      medium: data.medium,
      theme: data.theme,
      gridLayout: data.gridLayout,
      memoryShape: data.memoryShape,
      includeCaptions: data.includeCaptions,
      backgroundType: data.backgroundType,
      memoryEvent: data.memoryEvent,
      customMemoryEvent: data.customMemoryEvent,
      // Update asset references based on layout type
      // For magic memories: selected assets go to photo_selection_pool, created_from_assets will be set by AI
      // For regular memories: selected assets go to created_from_assets
      ...(data.layoutType === 'magic' ? {
        photo_selection_pool: Array.isArray(data.selectedAssets) ? data.selectedAssets.map(a => a.id) : [],
        created_from_assets: [] // Will be populated by AI during story generation
      } : {
        created_from_assets: Array.isArray(data.selectedAssets) ? data.selectedAssets.map(a => a.id) : []
      })
    }
    
    console.log('🔧 [saveEditBookFromDialog] Mapped editBook.value:', editBook.value)
    
    // Call the existing saveEditBook method
    console.log('🔧 [saveEditBookFromDialog] Calling saveEditBook...')
    await saveEditBook()
    console.log('🔧 [saveEditBookFromDialog] saveEditBook completed successfully')
  } catch (error) {
    console.error('❌ [saveEditBookFromDialog] Error:', error)
    throw error
  }
}

const magicCustomMemoryEvent = ref('')

// Upload dialog state
const showUploadDialog = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref('')
const uploadingFiles = ref([])
const uploadedFiles = ref([])
const failedFiles = ref([])
const isUploading = ref(false)

// Asset checking and upload functions
const checkAssets = async () => {
  loadingAssets.value = true
  try {
    const db = useDatabase()
    const assets = await db.assets.getAssets({ approved: true })
    hasAssets.value = assets && assets.length > 0
    approvedAssetsCount.value = assets ? assets.length : 0
    console.log(`📸 Found ${approvedAssetsCount.value} approved assets`)
  } catch (error) {
    console.error('❌ Error checking assets:', error)
    hasAssets.value = false
    approvedAssetsCount.value = 0
  } finally {
    loadingAssets.value = false
  }
}

// File selection function
const selectFiles = () => {
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.multiple = true
  fileInput.accept = 'image/*'
  
  fileInput.onchange = async (event) => {
    const files = Array.from(event.target.files)
    if (files.length === 0) return
    
    await startUpload(files)
  }
  
  fileInput.click()
}

// Start upload process
const startUpload = async (files) => {
  isUploading.value = true
  uploadProgress.value = 0
  uploadStatus.value = '✨ Preparing magical upload... ✨'
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
    
    try {
      // Update status to uploading
      fileData.status = 'uploading'
      uploadStatus.value = `🌟 Uploading ${file.name} to our magical realm...`
      
      // Upload asset with approved status
      const asset = await db.assets.uploadAsset({
        type: 'photo',
        title: file.name,
        user_caption: '',
        approved: true // Set as approved since it's a direct upload
      }, file)
      
      // Update status to processing
      fileData.status = 'processing'
      uploadStatus.value = `🔮 Looking into our crystal ball for ${file.name}...`
      
      // Process with AI
      const aiResult = await $fetch('/api/ai/process-asset', {
        method: 'POST',
        body: {
          assetId: asset.id,
          assetType: 'photo',
          storageUrl: asset.storage_url
        }
      })
      if (aiResult && aiResult.caption && aiResult.caption.trim()) {
        showMagicCaption(aiResult.caption)
      }
      
      // Mark as completed
      fileData.status = 'completed'
      uploadedFiles.value.push({
        name: file.name,
        asset: asset
      })
      
      completedFiles++
      uploadProgress.value = Math.round((completedFiles / totalFiles) * 100)
      uploadStatus.value = `✨ Enchanted ${completedFiles} of ${totalFiles} photos! ✨`
      
    } catch (error) {
      console.error(`❌ Failed to upload ${file.name}:`, error)
      fileData.status = 'failed'
      failedFiles.value.push({
        name: file.name,
        error: error.message || 'Magic fizzled'
      })
      
      completedFiles++
      uploadProgress.value = Math.round((completedFiles / totalFiles) * 100)
      uploadStatus.value = `✨ Processed ${completedFiles} of ${totalFiles} photos! ✨`
    }
  }
  
  isUploading.value = false
  
  if (uploadedFiles.value.length > 0) {
    uploadStatus.value = `🎉 Successfully enchanted ${uploadedFiles.value.length} photos! 🎉`
    
    // Refresh asset count
    await checkAssets()
  }
  
  if (failedFiles.value.length > 0) {
    uploadStatus.value += ` 😔 ${failedFiles.value.length} spells fizzled.`
  }
}

// Finish upload and close dialog
const finishUpload = () => {
  showUploadDialog.value = false
  // Reset state
  uploadingFiles.value = []
  uploadedFiles.value = []
  failedFiles.value = []
  uploadProgress.value = 0
  uploadStatus.value = ''
  isUploading.value = false
}

// Legacy function for backward compatibility
const uploadPhotos = async () => {
  showUploadDialog.value = true
}

// Reset upload dialog state
const resetUploadDialog = () => {
  if (!isUploading.value) {
    uploadingFiles.value = []
    uploadedFiles.value = []
    failedFiles.value = []
    uploadProgress.value = 0
    uploadStatus.value = ''
  }
}

// Convert status to magical language
const getMagicStatusText = (status) => {
  switch (status) {
    case 'pending':
      return '🌟 Waiting for magic...'
    case 'uploading':
      return '📤 Flying to magical realm...'
    case 'processing':
      return '🔮 Crystal ball reading...'
    case 'completed':
      return '✨ Enchanted! ✨'
    case 'failed':
      return '😔 Magic fizzled'
    default:
      return status
  }
}

const skipUpload = () => {
  toast.add({ 
    severity: 'info', 
    summary: 'No Problem', 
    detail: 'You can upload photos anytime from the Upload page', 
    life: 3000 
  })
}

// Add after other refs
const lastAICaption = ref('')
const showAICaptionOverlay = ref(false)
let aiCaptionTimeout = null

// Helper to show the overlay
function showMagicCaption(caption) {
  if (!caption || !caption.trim()) return
  lastAICaption.value = caption
  showAICaptionOverlay.value = true
  if (aiCaptionTimeout) clearTimeout(aiCaptionTimeout)
  aiCaptionTimeout = setTimeout(() => {
    showAICaptionOverlay.value = false
  }, 4000) // Show for 4 seconds
}

// Responsive PDF viewer height
const pdfViewerStyle = computed(() => {
  if (window.innerWidth < 640) { // Tailwind's sm breakpoint is 640px
    return {
      height: '45vh',
      width: '100%',
      maxWidth: '100%'
    };
  } else {
    return {
      height: '70vh',
      width: '100%',
      maxWidth: '100%'
    };
  }
});

</script> 

<style scoped>
.magic-memory-btn {
  box-shadow: 0 0 8px 2px #fbbf24, 0 0 16px 4px #a78bfa;
  position: relative;
  overflow: hidden;
}
.magic-memory-btn::after {
  content: "✨";
  position: absolute;
  top: 0;
  right: 0.5rem;
  font-size: 1.5rem;
  opacity: 0.7;
  animation: sparkle 2s infinite linear;
}
@keyframes sparkle {
  0% { opacity: 0.7; transform: scale(1) rotate(0deg); }
  50% { opacity: 1; transform: scale(1.2) rotate(10deg); }
  100% { opacity: 0.7; transform: scale(1) rotate(0deg); }
}
.magic-memory-dialog {
  box-shadow: 0 0 24px 8px #fbbf24, 0 0 32px 12px #a78bfa;
  border: 2px solid #a78bfa;
  background: linear-gradient(135deg, #fef9c3 0%, #f3e8ff 100%);
}
.magic-photo-card {
  transition: box-shadow 0.2s, border-color 0.2s;
}
.magic-photo-card:hover {
  box-shadow: 0 0 12px 2px #fbbf24, 0 0 16px 4px #a78bfa;
  border-color: #fbbf24;
}
.magic-memory-card {
  border: 2px solid #fbbf24;
  box-shadow: 0 0 24px 8px #fbbf24, 0 0 32px 12px #a78bfa;
  position: relative;
  overflow: hidden;
  animation: magic-card-glow 2.5s infinite alternate;
}
.magic-sparkle {
  filter: drop-shadow(0 0 8px #fbbf24) drop-shadow(0 0 16px #a78bfa);
}
.magic-story {
  font-family: 'Caveat', cursive, sans-serif;
  font-size: 0.9rem;
  line-height: 1.4;
  letter-spacing: 0.01em;
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}
@keyframes magic-card-glow {
  0% { box-shadow: 0 0 24px 8px #fbbf24, 0 0 32px 12px #a78bfa; }
  100% { box-shadow: 0 0 36px 16px #fbbf24, 0 0 48px 24px #a78bfa; }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}

.success-dialog {
  box-shadow: 0 0 32px 12px #fbbf24, 0 0 48px 24px #a78bfa;
  border: 2px solid #a78bfa;
  background: linear-gradient(135deg, #fef9c3 0%, #f3e8ff 100%);
  border-radius: 1.5rem;
  animation: magic-card-glow 2.5s infinite alternate;
}
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.magic-upload-dialog {
  box-shadow: 0 0 32px 12px #fbbf24, 0 0 48px 24px #a78bfa;
  border: 2px solid #a78bfa;
  background: linear-gradient(135deg, #fef9c3 0%, #f3e8ff 100%);
  border-radius: 1.5rem;
  animation: magic-card-glow 2.5s infinite alternate;
}

.magic-status-dialog {
  box-shadow: 0 0 32px 12px #fbbf24, 0 0 48px 24px #a78bfa;
  border: 2px solid #a78bfa;
  background: linear-gradient(135deg, #fef9c3 0%, #f3e8ff 100%);
  border-radius: 1.5rem;
  animation: magic-card-glow 2.5s infinite alternate;
}

@keyframes magic-fade {
  0% { opacity: 0; transform: translateY(-30px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-30px); }
}
.animate-magic-fade {
  animation: magic-fade 4s ease-in-out;
}
.font-caveat {
  font-family: 'Caveat', cursive, sans-serif;
}
</style>