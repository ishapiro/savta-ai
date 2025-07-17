<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-100 p-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 gap-4">
        <div class="flex-1 flex items-center gap-2 sm:gap-3">
          <h1 class="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">Cast Magic Memory Spells</h1>
          <button
            class="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white shadow hover:bg-gray-100 transition-colors focus:outline-none flex-shrink-0"
            @click="showInfoDialog = true"
            aria-label="Information about magic memories"
          >
            <i class="pi pi-info text-sm sm:text-lg text-blue-500"></i>
          </button>
        </div>
        <div class="flex gap-2 w-full sm:w-auto">
          <button
            class="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-sm sm:text-base shadow transition-all duration-200 w-full sm:w-auto flex items-center gap-2 animate-pulse focus:outline-none magic-memory-btn"
            @click="openMagicMemoryDialog"
          >
            <Sparkles class="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 drop-shadow" />
            <span class="hidden sm:inline">Savta's Magic Spells</span>
            <span class="sm:hidden">Magic</span>
          </button>
          <button
            class="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-sm sm:text-base shadow transition-all duration-200 w-full sm:w-auto"
            @click="showCreateModal = true"
          >
            <i class="pi pi-plus mr-1 sm:mr-2"></i>
            <span class="hidden sm:inline">Define a Magic Spell</span>
            <span class="sm:hidden">Magic Spell</span>
          </button>
        </div>
      </div>

    <!-- Info Dialog -->
    <Dialog v-model:visible="showInfoDialog" modal header="About Savta's Magic Memories" class="w-full max-w-3xl sm:rounded-2xl">
      <div class="space-y-4">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h2 class="text-lg font-bold text-blue-700 mb-2">What is a Savta Magic Memory?</h2>
          <p class="text-base text-gray-700">
            A magic memory is a special collection of your favorite photos, thoughts, text messages, and more, all gathered together into
            beautiful cards you can look at, print, or share with your family. It's like a photo album, but even more magical!
          </p>
        </div>
        <div class="bg-purple-50 rounded-lg p-4 border border-purple-100">
          <h2 class="text-lg font-bold text-purple-700 mb-2">Why Create a Magic Memory?</h2>
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
              <span class="text-gray-700"><b>View</b>: Open your Magic Memory to view or download it.</span>
            </li>
            <li class="flex items-center gap-3">
              <span class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"><i class="pi pi-bolt text-lg text-purple-600"></i></span>
              <span class="text-gray-700"><b>Generate</b>: Create your Magic Memory for the first time.</span>
            </li>
            <li class="flex items-center gap-3">
              <span class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"><i class="pi pi-refresh text-lg text-yellow-600"></i></span>
              <span class="text-gray-700"><b>Regenerate</b>: Make a new version of your Magic Memory with a fresh design.</span>
            </li>
            <li class="flex items-center gap-3">
              <span class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"><i class="pi pi-check text-lg text-purple-600"></i></span>
              <span class="text-gray-700"><b>Approve</b>: Mark your Magic Memory as finished and ready to share or print.</span>
            </li>
            <li class="flex items-center gap-3">
              <span class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"><i class="pi pi-undo text-lg text-orange-600"></i></span>
              <span class="text-gray-700"><b>Unapprove</b>: Move your Magic Memory back to editing if you want to make changes.</span>
            </li>
            <li class="flex items-center gap-3">
              <span class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"><i class="pi pi-list text-lg text-gray-600"></i></span>
              <span class="text-gray-700"><b>Details</b>: See more information about your Magic Memory.</span>
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
          <div class="absolute top-3 right-3">
            <div :class="getStatusBadgeClass(book.status)" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md backdrop-blur-sm">
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
          <div v-if="book.layout_type === 'magic' && book.magic_story" class="text-purple-900 text-sm magic-story animate-fade-in mb-3 relative leading-relaxed">
            <Sparkle class="w-4 h-4 text-yellow-400 absolute left-0 top-0" />
            <span class="ml-6">{{ book.magic_story.length > 115 ? book.magic_story.slice(0, 115) + '...' : book.magic_story }}</span>
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
            <span class="text-[10px] sm:text-[11px] text-purple-700 mt-1 font-medium">Generate</span>
          </div>
          <!-- Regenerate Button (for ready or background_ready, not magic) -->
          <div v-if="(book.status === 'ready' || book.status === 'background_ready') && book.layout_type !== 'magic'" class="flex flex-col items-center cursor-pointer group p-2 rounded-lg hover:bg-white/50 transition-all duration-200" @click="onRegenerateClick(book)" :class="{ 'opacity-50': book.status === 'background_ready' }">
            <i class="pi pi-refresh text-lg sm:text-xl text-yellow-600 group-hover:scale-125 transition-transform"></i>
            <span class="text-[10px] sm:text-[11px] text-yellow-700 mt-1 font-medium">{{ book.status === 'background_ready' ? 'Processing' : 'Regenerate' }}</span>
          </div>
          <!-- Approve Button (not magic) -->
          <div v-if="book.status === 'ready' && book.layout_type !== 'magic'" class="flex flex-col items-center cursor-pointer group p-2 rounded-lg hover:bg-white/50 transition-all duration-200" @click="approveBook(book.id)">
            <i class="pi pi-check text-lg sm:text-xl text-purple-600 group-hover:scale-125 transition-transform"></i>
            <span class="text-[10px] sm:text-[11px] text-purple-700 mt-1 font-medium">Approve</span>
          </div>
          <!-- Unapprove Button (not magic) -->
          <div v-if="book.status === 'approved' && book.layout_type !== 'magic'" class="flex flex-col items-center cursor-pointer group p-2 rounded-lg hover:bg-white/50 transition-all duration-200" @click="unapproveBook(book.id)">
            <i class="pi pi-undo text-lg sm:text-xl text-orange-600 group-hover:scale-125 transition-transform"></i>
            <span class="text-[10px] sm:text-[11px] text-orange-700 mt-1 font-medium">Unapprove</span>
          </div>
          <!-- View Details Button -->
          <div class="flex flex-col items-center cursor-pointer group p-2 rounded-lg hover:bg-white/50 transition-all duration-200" @click="viewBookDetails(book)">
            <i class="pi pi-list text-lg sm:text-xl text-gray-600 group-hover:scale-125 transition-transform"></i>
            <span class="text-[10px] sm:text-[11px] text-gray-700 mt-1 font-medium">Details</span>
          </div>
          <!-- Edit Settings Button (not magic) -->
          <div v-if="book.layout_type !== 'magic'" class="flex flex-col items-center cursor-pointer group p-2 rounded-lg hover:bg-white/50 transition-all duration-200" @click="openEditSettings(book)">
            <i class="pi pi-cog text-lg sm:text-xl text-blue-600 group-hover:scale-125 transition-transform"></i>
            <span class="text-[10px] sm:text-[11px] text-blue-700 mt-1 font-medium">Settings</span>
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
      <div class="text-gray-600 mb-4">
        <i class="pi pi-book text-4xl sm:text-6xl"></i>
      </div>
      <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-2 text-center">No magic memories yet</h3>
      <p class="text-sm sm:text-base text-gray-500 mb-4 text-center max-w-md">Create your first magic memory from your approved assets.</p>
      <button
        class="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-full px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base shadow transition-all duration-200 w-full max-w-xs"
        @click="openCreateModal"
      >
        <i class="pi pi-plus mr-1 sm:mr-2"></i> Create Magic Memory
      </button>
    </div>

    <!-- Create Memory Book Modal (replaces old Dialog) -->
    <MemoryBookDialog
      :visible="showCreateModal"
      :isEditing="false"
      :initialData="{}"
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
      style="max-width: 500px; text-align: center;"
    >
      <div class="flex flex-col items-center justify-center py-8 px-6">
        <!-- Sparkle animation -->
        <div class="relative mb-6">
          <div class="w-20 h-20 bg-gradient-to-br from-yellow-200 via-purple-200 to-blue-200 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <i class="pi pi-sparkles text-4xl text-yellow-500 animate-bounce"></i>
          </div>
          <!-- Floating sparkles -->
          <div class="absolute -top-2 -right-2 w-6 h-6 bg-yellow-300 rounded-full animate-ping"></div>
          <div class="absolute -bottom-2 -left-2 w-4 h-4 bg-purple-300 rounded-full animate-ping" style="animation-delay: 0.5s;"></div>
          <div class="absolute top-1/2 -right-4 w-3 h-3 bg-blue-300 rounded-full animate-ping" style="animation-delay: 1s;"></div>
        </div>
        
        <!-- Success message -->
        <h2 class="text-2xl font-bold text-purple-700 mb-4 animate-fade-in">
          ✨ Well Done! ✨
        </h2>
        
        <div class="bg-gradient-to-r from-yellow-50 via-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200 mb-6">
          <p class="text-lg text-gray-800 leading-relaxed mb-4">
            You have just defined the <span class="font-bold text-purple-600">magical spell</span> we will use to generate your custom magic memory!
          </p>
          
          <div class="flex items-center justify-center gap-3 bg-white rounded-lg p-3 border border-purple-200">
            <Wand2 class="w-6 h-6 text-yellow-500 animate-pulse" />
            <p class="text-base text-gray-700 font-medium">
              Click on the <span class="text-yellow-600 font-bold">magic wand</span> on the Magic Memory card below
              to make it happen!
            </p>
          </div>
        </div>
        
        <!-- Action button -->
        <button
          class="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-full px-8 py-3 text-lg shadow-lg transition-all duration-200 transform hover:scale-105 animate-bounce"
          @click="showSuccessDialog = false"
        >
          <i class="pi pi-check mr-2"></i>
          Let's Make Some Magic! ✨
        </button>
      </div>
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
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-4">
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
          <div v-if="selectedBook.layout_type === 'magic' && selectedBook.magic_story" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
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
                <span class="hidden sm:inline">Generate Book</span>
                <span class="sm:hidden">Generate</span>
              </button>
              <button
                v-if="selectedBook.status === 'ready' || selectedBook.status === 'background_ready'"
                class="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm shadow-lg transition-all duration-200"
                @click="onRegenerateClick(selectedBook)"
                :class="{ 'opacity-50': selectedBook.status === 'background_ready' }"
              >
                <i class="pi pi-refresh text-xs sm:text-sm"></i>
                <span class="hidden sm:inline">{{ selectedBook.status === 'background_ready' ? 'Processing...' : 'Regenerate' }}</span>
                <span class="sm:hidden">{{ selectedBook.status === 'background_ready' ? 'Processing' : 'Regenerate' }}</span>
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
                class="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm shadow-lg transition-all duration-200"
                @click="openEditSettings(selectedBook)"
              >
                <i class="pi pi-cog text-xs sm:text-sm"></i>
                <span class="hidden sm:inline">Edit Settings</span>
                <span class="sm:hidden">Settings</span>
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
            ✨ Casting a Spell to Create Your Magic Memory ✨
          </h2>
          <p class="text-sm sm:text-base text-purple-600 font-medium">
            The AI is weaving your memories into something magical...
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
            
            <!-- Magic status -->
            <div class="flex items-center justify-center gap-2 text-sm sm:text-base text-gray-700">
              <i class="pi pi-magic text-purple-500 animate-pulse"></i>
              <span class="font-medium">Magic in Progress...</span>
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
        <p class="text-sm sm:text-base">Generate this magic memory? This may take a little time.</p>
        <div class="flex justify-end gap-2 mt-4">
          <Button label="Cancel" severity="secondary" size="small" class="text-xs px-3 py-2" @click="cancelDialog" />
          <Button label="Generate" severity="primary" size="small" class="text-xs px-3 py-2" @click="confirmGenerate" />
        </div>
      </div>
    </Dialog>
    <!-- Regenerate Confirmation Dialog -->
    <Dialog
      v-model:visible="showRegenerateDialog"
      modal
      header="Want to Cast a Different Spell?"
      class="w-full md:w-[60%] lg:w-[50%] sm:rounded-2xl"
      :closable="false"
    >
      <div class="py-6 px-4 sm:px-8 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-100 rounded-2xl">
        <div class="flex flex-col items-center mb-4">
          <div class="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center shadow mb-2">
            <Sparkles class="w-8 h-8 text-yellow-400 animate-pulse" />
          </div>
          <h2 class="text-lg sm:text-xl font-bold text-purple-700 mb-2">Ready for a Magical Makeover?</h2>
          <p class="text-sm sm:text-base text-gray-700 leading-relaxed text-center">
            Would you like to create a fresh, new version of this magic memory with a brand new AI-generated background design?
            <span class="font-semibold text-purple-600">It's like giving your memories a beautiful new frame!</span>
            <br />
            This will take a few moments to create something special just for you.<br />
            If you're happy with the current version and just want to view it right away, you can use the view button below – that's much faster!
          </p>
        </div>
        <div class="flex flex-col sm:flex-row justify-center gap-2 w-full mt-6">
          <button
            class="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full px-6 py-3 text-lg shadow transition-all duration-200 w-full sm:w-auto"
            @click="downloadCurrentBook"
          >
            <i class="pi pi-external-link text-xl"></i>
            View Current
          </button>
          <button
            class="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-full px-6 py-3 text-lg shadow transition-all duration-200 w-full sm:w-auto"
            @click="cancelDialog"
          >
            <i class="pi pi-times text-xl"></i>
            Cancel
          </button>
          <button
            class="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full px-6 py-3 text-lg shadow transition-all duration-200 w-full sm:w-auto"
            @click="confirmRegenerate"
          >
            <Sparkles class="w-5 h-5" />
            Cast New Spell
          </button>
        </div>
      </div>
    </Dialog>
    <!-- View Draft Dialog -->
    <Dialog v-model:visible="showDownloadDraftDialog" modal header="Magic Memory Not Generated" class="w-[95vw] max-w-md">
      <div class="py-4">
        <p class="text-sm sm:text-base">You need to generate the magic memory before viewing. Would you like to generate it now? This may take a little time.</p>
        <div class="flex justify-end gap-2 mt-4">
          <Button label="Cancel" severity="secondary" size="small" class="text-xs px-3 py-2" @click="cancelDialog" />
          <Button label="Generate Now" severity="primary" size="small" class="text-xs px-3 py-2" @click="confirmDownloadDraft" />
        </div>
      </div>
    </Dialog>

    <!-- PDF Preview Modal -->
    <Dialog
      v-model:visible="showPdfModal"
      modal
      header="PDF Preview"
      :style="{ width: '95vw', maxWidth: '900px', height: '85vh', maxHeight: '85vh', padding: 0, marginTop: '10px' }"
      :contentStyle="{ height: '85vh', padding: 0 }"
      :closable="false"
      :auto-z-index="false"
      :z-index="1000"
    >
      <div class="pdf-preview-container flex flex-col w-full h-full" style="height: 85vh; width: 100%; padding: 0;">
        <!-- PDF Viewer -->
        <div class="flex-1 w-full flex items-center justify-center" style="min-height: 0;">
          <div class="w-[95%] h-[95%]">
            <PdfViewer v-if="pdfBlobUrl" :src="pdfBlobUrl" class="w-full h-full" />
            <div v-else class="text-center py-8 flex-1 flex items-center justify-center">
              <i class="pi pi-file-pdf text-3xl sm:text-4xl text-gray-400"></i>
              <p class="text-sm sm:text-base text-gray-600 mt-2">No PDF available for preview.</p>
            </div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex justify-center items-center gap-4 py-6 px-4 bg-gray-50 border-t border-gray-200">
          <Button
            v-if="canShare"
            label="Share"
            icon="pi pi-share"
            size="small"
            class="text-sm px-6 py-3 bg-blue-500 hover:bg-blue-600 border-0"
            @click="sharePdf"
          />
          <Button
            label="Close"
            severity="secondary"
            size="small"
            class="text-sm px-6 py-3"
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
      :header="magicMemoryStep === 1 ? '✨ Name Your Magic Memory ✨' : '✨ Create a Magic Memory ✨'"
      class="w-[95vw] max-w-3xl sm:rounded-2xl magic-memory-dialog"
      :closable="true"
    >
      <!-- Step 1: Title Input -->
      <div v-if="magicMemoryStep === 1" class="space-y-6">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles class="w-8 h-8 text-white" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">What would you like to call this memory?</h3>
          <p class="text-gray-600">Give your magic memory a special name that captures the moment</p>
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

      <!-- Step 2: Photo Selection -->
      <div v-if="magicMemoryStep === 2 && !loadingAssets" class="space-y-4">
        <div class="bg-gradient-to-r from-yellow-50 via-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200 flex items-center gap-3 animate-pulse">
          <i class="pi pi-sparkles text-2xl text-yellow-400 animate-bounce"></i>
          <div>
            <h3 class="text-lg font-bold text-purple-700 mb-1">Select up to 12 Memory Moments for "{{ magicMemoryTitle }}"</h3>
            <p class="text-sm text-gray-700">Choose up to 12 photos by tag to inspire your Magic Memory story. The AI will weave them into something special!</p>
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
            <span>{{ magicSelectedMemories.length }} selected (AI will pick the best 4 for your story)</span>
            <span v-if="magicSelectedTagFilter && magicSelectedTagFilter.length > 0"> • Filtered by: {{ magicSelectedTagFilter.join(', ') }}</span>
          </div>
        </div>
      </div>
      <div v-else-if="loadingAssets" class="flex items-center justify-center py-8">
        <div class="text-center">
          <i class="pi pi-spin pi-spinner text-3xl text-purple-400 mb-3"></i>
          <p class="text-sm text-gray-600">Loading your magical photos...</p>
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
            label="Next: Select Photos"
            icon="pi pi-arrow-right"
            :disabled="!magicMemoryTitle.trim()"
            @click="nextMagicMemoryStep"
            class="bg-gradient-to-r from-yellow-400 to-purple-500 hover:from-yellow-500 hover:to-purple-600 border-0 w-full sm:w-auto text-xs px-4 py-2 font-bold"
          />
          <Button
            v-if="magicMemoryStep === 2"
            label="Cast Spell!"
            icon="pi pi-bolt"
            :disabled="magicSelectedMemories.length < 2 || magicLoading"
            :loading="magicLoading"
            @click="onMagicMemoryContinue"
            class="bg-gradient-to-r from-yellow-400 to-purple-500 hover:from-yellow-500 hover:to-purple-600 border-0 w-full sm:w-auto text-xs px-4 py-2 font-bold animate-pulse"
          />
        </div>
      </template>
    </Dialog>
    </div>
  </div>
  <Dialog v-model:visible="magicStatusDialog" modal :closable="false" :showHeader="false" class="magic-status-dialog" style="max-width: 350px; text-align: center;">
    <div class="flex flex-col items-center justify-center py-6">
      <i class="pi pi-sparkles text-4xl text-yellow-400 animate-bounce mb-2"></i>
      <div class="text-lg font-bold text-purple-700 mb-2">Magic in Progress...</div>
      <div class="text-md text-gray-800 mb-2">{{ magicStatusMessage }}</div>
      <div class="w-full h-2 bg-gradient-to-r from-yellow-200 via-purple-200 to-blue-200 rounded-full animate-pulse"></div>
    </div>
  </Dialog>
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
  printSize: '8x10',
  quality: 'standard',
  medium: 'digital',
  theme: 'classic',
  gridLayout: '2x2',
  memoryShape: 'original',
  includeCaptions: true,
  includeTags: true,
  aiBackground: true,
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
    includeTags: true,
    aiBackground: true,
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
const confirmRegenerate = () => {
  showRegenerateDialog.value = false
  if (pendingBook.value) generatePDF(pendingBook.value)
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
      include_tags: newBook.value.includeTags,
      ai_background: newBook.value.aiBackground,
      memory_event: newBook.value.memoryEvent === 'custom' ? newBook.value.customMemoryEvent : newBook.value.memoryEvent,
      created_from_assets: assetsToUse,
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
        currentProgressMessage.value = 'Your Savta Magic Memory is ready!'
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
      
      // Update progress based on status
      if (status.pdf_status === 'generating_background') {
        currentProgress.value = 10
        currentProgressMessage.value = 'Generating custom background image...'
      } else if (status.pdf_status === 'background_ready') {
        currentProgress.value = 20
        currentProgressMessage.value = 'Background ready, casting the final spell...'
      } else if (status.pdf_status === 'generating_pdf') {
        currentProgress.value = 50
        currentProgressMessage.value = 'Weaving your memories into pages...'
      } else if (status.pdf_status === 'finalizing') {
        currentProgress.value = 90
        currentProgressMessage.value = 'Adding the final magical touches...'
      } else if (status.pdf_status === 'completed') {
        currentProgress.value = 100
        currentProgressMessage.value = 'Your magical memory is ready!'
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
        currentProgressMessage.value = 'Crafting a beautiful magical background...'
      } else if (status.pdf_status === 'Downloading background design...') {
        currentProgress.value = 25
        currentProgressMessage.value = 'Summoning the background design...'
      } else if (status.pdf_status === 'Saving background to storage...') {
        currentProgress.value = 30
        currentProgressMessage.value = 'Storing the magical background...'
      } else if (status.pdf_status === 'Background ready for PDF generation') {
        currentProgress.value = 35
        currentProgressMessage.value = 'Background ready for the memory spell'
      } else if (status.pdf_status === 'Setting up PDF document...') {
        currentProgress.value = 40
        currentProgressMessage.value = 'Preparing the magical document...'
      } else if (status.pdf_status === 'Background ready, creating pages...') {
        currentProgress.value = 45
        currentProgressMessage.value = 'Background ready, crafting memory pages...'
      } else {
        currentProgressMessage.value = status.pdf_status || 'Processing...'
      }
    } else {
      // Fallback: show generic progress if no status available
      console.log('No status available, showing generic progress')
      if (currentProgress.value < 90) {
        currentProgress.value += 5
        currentProgressMessage.value = 'Casting the memory spell...'
      }
    }
  } catch (error) {
    console.error('Error polling PDF status:', error)
    // Fallback: show generic progress on error
    if (currentProgress.value < 90) {
      currentProgress.value += 5
      currentProgressMessage.value = 'Casting the memory spell...'
    }
  }
}

// Start progress polling
const startProgressPolling = (bookId) => {
  console.log('startProgressPolling called with bookId:', bookId)
  currentBookId.value = bookId
  currentProgress.value = 0
  currentProgressMessage.value = 'Starting the magical memory creation...'
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
  if (!book.created_from_assets || book.created_from_assets.length === 0) {
    console.error('❌ Cannot generate PDF: No assets found in memory book')
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
    startProgressPolling(book.id)
    console.log('Progress dialog should be visible:', showProgressDialog.value)
    
    // For regeneration, clear existing background and PDF URLs first
    if (book.status === 'ready' && (book.background_url || book.pdf_url)) {
      console.log('🔄 Regenerating memory, clearing existing URLs...')
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
const loadingAssets = ref(false)

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
      includeTags: book.include_tags ?? book.includeTags ?? true,
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
      include_tags: editBook.value.includeTags,
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

import PdfViewer from '~/components/PdfViewer.vue'

const showMagicMemoryDialog = ref(false)
const magicMemoryStep = ref(1) // 1 = title input, 2 = photo selection
const magicMemoryTitle = ref('')

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

const magicStatusDialog = ref(false)
const magicStatusMessage = ref('')

async function onMagicMemoryContinue() {
  if (magicSelectedMemories.value.length < 2) return
  magicLoading.value = true
  magicStatusDialog.value = true
  magicStatusMessage.value = '🧙 Gathering your memories...'
  try {
    const selectedAssets = availableAssets.value.filter(a => magicSelectedMemories.value.includes(a.id))
    const photos = selectedAssets.map(a => ({
      id: a.id,
      ai_caption: a.ai_caption || '',
      people_detected: a.people_detected || [],
      tags: a.tags || [],
      user_tags: a.user_tags || []
    }))
    let aiBody = { photos }
    if (photos.length <= 4) {
      aiBody.forceAll = true
    }
    magicStatusMessage.value = '🔮 Summoning the story...'
    const aiRes = await $fetch('/api/ai/magic-memory', {
      method: 'POST',
      body: aiBody
    })
    if (!aiRes.selected_photo_ids || !Array.isArray(aiRes.selected_photo_ids) || aiRes.selected_photo_ids.length < 2 || aiRes.selected_photo_ids.length > 4) {
      throw new Error('AI did not return 2-4 photo IDs. Please try again or select different photos.')
    }
    if (!aiRes.story || typeof aiRes.story !== 'string' || aiRes.story.trim().length < 10) {
      throw new Error('AI did not return a valid story. Please try again.')
    }
    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token
    magicStatusMessage.value = '📚 Saving your Magic Memory...'
    const dbRes = await $fetch('/api/memory-books/create-magic-memory', {
      method: 'POST',
              body: {
          asset_ids: aiRes.selected_photo_ids,
          story: aiRes.story,
          title: magicMemoryTitle.value || 'Magic Memory',
        },
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    if (!dbRes.success) throw new Error('DB save failed')
    magicStatusMessage.value = '✨ Casting the PDF spell...'
    // Trigger PDF generation
    const pdfRes = await $fetch(`/api/memory-books/generate-pdf/${dbRes.book_id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: {
        printSize: '6x4'
      }
    })
    if (!pdfRes.success) throw new Error('PDF generation failed')
    magicStatusMessage.value = '🎉 Your Magic Memory is ready!'
    setTimeout(() => { magicStatusDialog.value = false }, 2000)
    showMagicMemoryDialog.value = false
    magicSelectedMemories.value = []
    magicSelectedTagFilter.value = []
    if (typeof loadMemoryBooks === 'function') await loadMemoryBooks()
    toast.add({ severity: 'success', summary: '✨ Magic Memory Created!', detail: 'Your magical story and PDF are ready!', life: 4000 })
  } catch (err) {
    magicStatusDialog.value = false
    toast.add({ severity: 'error', summary: 'Magic Failed', detail: err.message || 'Something went wrong', life: 5000 })
  } finally {
    magicLoading.value = false
  }
}

const openMagicMemoryDialog = async () => {
  magicMemoryStep.value = 1
  magicMemoryTitle.value = ''
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
  }
}

const previousMagicMemoryStep = () => {
  if (magicMemoryStep.value === 2) {
    magicMemoryStep.value = 1
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
      includeTags: data.includeTags,
      aiBackground: data.aiBackground,
      memoryEvent: data.memoryEvent,
      customMemoryEvent: data.customMemoryEvent,
      // Store selected asset IDs for the book
      created_from_assets: Array.isArray(data.selectedAssets) ? data.selectedAssets.map(a => a.id) : []
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
      includeTags: data.includeTags,
      aiBackground: data.aiBackground,
      memoryEvent: data.memoryEvent,
      customMemoryEvent: data.customMemoryEvent,
      // Update created_from_assets with the selected asset IDs from the dialog
      created_from_assets: Array.isArray(data.selectedAssets) ? data.selectedAssets.map(a => a.id) : []
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
.magic-status-dialog {
  box-shadow: 0 0 32px 12px #fbbf24, 0 0 48px 24px #a78bfa;
  border: 2px solid #a78bfa;
  background: linear-gradient(135deg, #fef9c3 0%, #f3e8ff 100%);
  border-radius: 1.5rem;
  animation: magic-card-glow 2.5s infinite alternate;
}
</style>