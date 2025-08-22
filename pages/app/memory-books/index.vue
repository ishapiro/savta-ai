<template>
  <div class="min-h-screen bg-brand-background p-4">
    <!-- Backdrop overlay when magic memory dialog is open -->
    <div 
      v-if="showMagicMemoryDialog" 
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-all duration-300"
    ></div>
    
    <div 
      :class="[
        'max-w-7xl mx-auto transition-all duration-300',
        showMagicMemoryDialog ? 'opacity-50 blur-sm pointer-events-none' : ''
      ]"
    >
      <!-- Header -->
      <div class="flex flex-col items-center justify-between mb-6 sm:mb-8 gap-4">
        <div class="flex-1 flex items-center gap-2 sm:gap-3">
          <h1 class="text-xl sm:text-xl lg:text-2xl xl:text-3xl font-bold text-brand-primary">Create Memory Cards & Books</h1>
          <button
            data-testid="info-button"
            class="w-8 h-8 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white shadow hover:bg-gray-100 transition-colors focus:outline-none flex-shrink-0 min-h-[44px] sm:min-h-0"
            @click="showInfoDialog = true"
            aria-label="Information about memory cards and booklets"
          >
            <i class="pi pi-info text-base sm:text-lg text-brand-highlight"></i>
          </button>
          <button
            data-testid="trash-button"
            class="w-8 h-8 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-brand-accent shadow hover:bg-brand-accent/80 transition-colors focus:outline-none flex-shrink-0 min-h-[44px] sm:min-h-0"
            @click="navigateToTrash"
            aria-label="View trash"
            v-tooltip.top="'View Trash'"
          >
            <i class="pi pi-trash text-base sm:text-lg text-white"></i>
          </button>
        </div>
        <div class="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
          <!-- Memory Cards Card -->
          <div class="bg-gradient-to-br from-brand-highlight/20 to-brand-highlight/10 rounded-xl shadow-lg border border-brand-highlight/30 p-6 sm:p-6">
            <h3 class="text-lg sm:text-xl font-bold text-brand-highlight mb-4 text-center">Memory Cards</h3>
            <div class="flex flex-col sm:flex-row gap-4">
              <div class="flex flex-col items-center">
                <button
                  data-testid="create-memory-card-button"
                  class="border-0 bg-brand-highlight hover:bg-brand-highlight/80 text-white font-bold rounded-full px-4 sm:px-4 lg:px-6 py-3 sm:py-3 text-sm sm:text-base shadow transition-all duration-200 w-full sm:w-auto flex items-center gap-2 focus:outline-none magic-memory-btn min-h-[48px] sm:min-h-0"
                  @click="openMagicMemoryDialog('quick')"
                >
                  <Sparkles class="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 drop-shadow" />
                  <span class="hidden sm:inline">Create a Memory Card</span>
                  <span class="sm:hidden">Create Card</span>
                </button>
                  <p class="mt-3 sm:mt-2 text-sm text-brand-highlight text-center">Simple step-by-step wizard</p>
                  <p class="mt-3 sm:mt-2 text-sm text-brand-highlight text-center">Perfect for beginners</p>
              </div>
            </div>
          </div>
          
          <!-- Memory Books Card -->
          <div class="bg-gradient-to-br from-brand-warm/30 to-brand-warm/20 rounded-xl shadow-lg border border-brand-warm/40 p-6 sm:p-6">
            <h3 class="text-lg sm:text-xl font-bold text-brand-secondary mb-4 text-center">Memory Books</h3>
            <div class="flex flex-col items-center">
              <button
                data-testid="create-memory-book-button"
                class="border-0 bg-brand-secondary hover:bg-brand-secondary/80 text-white font-bold rounded-full px-4 sm:px-4 lg:px-6 py-3 sm:py-3 text-sm sm:text-base shadow transition-all duration-200 w-full sm:w-auto min-h-[48px] sm:min-h-0"
                @click="showCreateModal = true"
              >
                <i class="pi pi-plus mr-1 sm:mr-2"></i>
                <span class="hidden sm:inline">Create a Memory Book</span>
                <span class="sm:hidden">Create Book</span>
              </button>
              <p class="mt-3 sm:mt-2 text-sm text-brand-secondary text-center">Advanced form with many options</p>
              <p class="mt-3 sm:mt-2 text-sm text-brand-secondary text-center">For experienced users</p>
            </div>
          </div>
        </div>
      </div>

    <!-- Info Dialog -->
    <Dialog v-model:visible="showInfoDialog" modal header="About Memory Cards & Books" class="w-full max-w-3xl sm:rounded-2xl">
      <div class="space-y-4">
        <div class="bg-brand-highlight/10 rounded-lg p-4 border border-brand-highlight/20">
          <h2 class="text-lg font-bold text-brand-highlight mb-2">What are Memory Cards?</h2>
          <p class="text-base text-brand-primary">
            Memory Cards are single-page designs with beautiful themes. Our AI picks your best photos and writes heartwarming captions. 
            Perfect for mailing to family members or sharing digitally. Each card tells a story in one beautiful page.
          </p>
        </div>
        <div class="bg-brand-secondary/10 rounded-lg p-4 border border-brand-secondary/20">
          <h2 class="text-lg font-bold text-brand-secondary mb-2">What are Memory Books?</h2>
          <p class="text-base text-brand-primary mb-3">
            Memory Books are multi-page collections that can use themes or grid layouts. You choose which photos to include and our AI creates 
            beautiful designs. Perfect for printing and mailing to family members or sharing digitally.
          </p>
          <h3 class="text-md font-bold text-brand-secondary mb-2">Why Create Memory Cards?</h3>
          <ul class="list-disc pl-5 text-base text-brand-primary space-y-1">
            <li>To keep your precious memories safe and easy to find.</li>
            <li>To share your stories with children, grandchildren, and friends.</li>
            <li>To have a lovely stack of cards to look through whenever you want to remember happy times.</li>
          </ul>
        </div>
        <div class="bg-brand-accent/10 rounded-lg p-4 border border-brand-accent/20">
          <h2 class="text-lg font-bold text-brand-accent mb-2">How Do I Use It?</h2>
          <p class="text-base text-brand-primary">
            Just pick your favorite memory moments, design your cards, and let the magic happen! 
            You can view your memory card as a PDF, print it, or share it with your loved ones. 
            It's easy and fun—no computer skills needed! No tedious dropping and dragging photos into a photo album.
          </p>
        </div>
        <div class="bg-white rounded-lg p-4 border border-gray-100">
          <h2 class="text-base font-bold text-brand-primary mb-2">What do the buttons mean?</h2>
          <ul class="space-y-3">
            <li class="flex items-center gap-3">
              <span class="w-8 h-8 flex items-center justify-center rounded-full bg-brand-highlight/20"><i class="pi pi-external-link text-lg text-brand-highlight"></i></span>
                              <span class="text-brand-primary"><b>View</b>: Open your Special Memory Card to view or download it.</span>
            </li>
            <li class="flex items-center gap-3">
              <span class="w-8 h-8 flex items-center justify-center rounded-full bg-brand-secondary/20"><i class="pi pi-bolt text-lg text-brand-secondary"></i></span>
              <span class="text-brand-primary"><b>Compose</b>: Create your Special Memory Card for the first time.</span>
            </li>
            <li class="flex items-center gap-3">
              <span class="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-100"><i class="pi pi-refresh text-lg text-yellow-600"></i></span>
              <span class="text-brand-primary"><b>Recreate</b>: Make a new version of your Special Memory Card with a fresh design.</span>
            </li>
            <li class="flex items-center gap-3">
              <span class="w-8 h-8 flex items-center justify-center rounded-full bg-brand-secondary/20"><i class="pi pi-check text-lg text-brand-secondary"></i></span>
                              <span class="text-brand-primary"><b>Approve</b>: Mark your Special Memory Card as finished and ready to share or print.</span>
            </li>
            <li class="flex items-center gap-3">
              <span class="w-8 h-8 flex items-center justify-center rounded-full bg-orange-100"><i class="pi pi-undo text-lg text-orange-600"></i></span>
                              <span class="text-brand-primary"><b>Unapprove</b>: Move your Special Memory Card back to editing if you want to make changes.</span>
            </li>
            <li class="flex items-center gap-3">
              <span class="w-8 h-8 flex items-center justify-center rounded-full bg-brand-primary/20"><i class="pi pi-list text-lg text-brand-primary"></i></span>
              <span class="text-brand-primary"><b>Details</b>: See more information about your Special Memory Card.</span>
            </li>
            <li class="flex items-center gap-3">
              <span class="w-8 h-8 flex items-center justify-center rounded-full bg-brand-highlight/20"><i class="pi pi-cog text-lg text-brand-highlight"></i></span>
              <span class="text-brand-primary"><b>Settings</b>: Change the title, layout, or which memories moments are included.</span>
            </li>
          </ul>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end">
          <button data-testid="info-dialog-close-button" class="bg-brand-dialog-cancel text-white font-bold rounded-full px-6 py-2 text-base shadow border-0" @click="showInfoDialog = false">
            Close
          </button>
        </div>
      </template>
    </Dialog>

    <!-- Approval Dialog -->
    <Dialog 
      v-model:visible="showApprovalDialog" 
      modal 
      :closable="false"
      class="w-full max-w-md sm:max-w-lg mx-auto"
      :style="{ width: '90vw' }"
    >
      <div class="text-center p-6">
        <div class="w-16 h-16 bg-gradient-to-br from-brand-flash to-brand-highlight rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <i class="pi pi-heart text-2xl text-white"></i>
        </div>
        
        <h3 class="text-xl font-bold text-gray-900 mb-4">Your Memory Card is Ready!</h3>
        
        <div class="space-y-4 text-left">
          <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <div class="flex">
              <div class="flex-shrink-0">
                <i class="pi pi-info-circle text-blue-400 text-lg"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm text-blue-700">
                  <strong>Testing Phase:</strong> During this initial testing period, physical cards will not be mailed.
                </p>
              </div>
            </div>
          </div>
          
          <div class="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
            <div class="flex">
              <div class="flex-shrink-0">
                <i class="pi pi-check-circle text-green-400 text-lg"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm text-green-700">
                  <strong>Coming Soon:</strong> Once we go live, you'll be able to select recipients and your memory cards will be beautifully printed and mailed to them.
                </p>
              </div>
            </div>
          </div>
          
          <div class="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
            <div class="flex">
              <div class="flex-shrink-0">
                <i class="pi pi-star text-purple-400 text-lg"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm text-purple-700">
                  <strong>Timeless Keepsakes:</strong> Unlike photos that get lost in your phone, these memory cards will become cherished family heirlooms that can be held, shared, and treasured for generations to come.
                </p>
              </div>
            </div>
          </div>
          
          <div class="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
            <div class="flex">
              <div class="flex-shrink-0">
                <i class="pi pi-gift text-orange-400 text-lg"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm text-orange-700">
                  <strong>Social Media Meets Sentimental Gifts:</strong> Think of it as your favorite social sharing app meets traditional greeting cards — but instead of scrolling past memories, they arrive in the mail as tangible treasures.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="flex justify-center">
          <button 
            data-testid="approve-memory-card-button"
            class="bg-brand-flash text-white font-bold rounded-full px-8 py-3 text-base shadow-lg hover:bg-brand-highlight transition-all duration-200" 
            @click="confirmApproval"
          >
            <i class="pi pi-check mr-2"></i>
            Approve My Memory Card
          </button>
        </div>
      </template>
    </Dialog>

    <!-- Memory Books Grid -->
    <div v-if="loadingMemoryBooks" class="flex justify-center items-center py-12 sm:py-16">
      <div class="text-center">
        <i class="pi pi-spin pi-spinner text-3xl sm:text-4xl mb-3 sm:mb-4 text-brand-highlight"></i>
        <p class="text-sm sm:text-base text-brand-primary/70">Loading memories...</p>
      </div>
    </div>

    <div v-else-if="memoryBooks.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      <div
        v-for="book in memoryBooks"
        :key="book.id"
        :class="[
          'rounded-xl flex flex-col overflow-hidden',
          'bg-brand-card',
          'border-brand-highlight/30'
        ]"
      >
        <!-- Card Header -->
        <div
          :class="[
            'relative flex items-center justify-center h-20',
            book.format === 'card' ? 'bg-brand-highlight' : 'bg-brand-secondary'
          ]"
        >
          <!-- Status Badge: absolute top-right, smaller -->
          <div class="absolute top-2 right-2 z-1">
            <div :class="getStatusBadgeClass(book.status)" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-md backdrop-blur-sm min-w-[48px] min-h-[22px] justify-center">
              <i :class="getStatusIcon(book.status)" class="text-xs"></i>
              <span class="hidden sm:inline">{{ getStatusText(book.status) }}</span>
            </div>
          </div>
          <div class="flex flex-col items-center relative z-1">
            <div class="mb-2 relative group-hover:scale-110 transition-transform duration-300">
                              <Wand2 v-if="book.format === 'card'" class="w-8 h-8 text-white" />
              <i v-else class="pi pi-book w-8 h-8 text-white flex items-center justify-center text-2xl"></i>
            </div>
                            <span class="text-xs font-semibold text-white text-center px-2 leading-tight">{{ 
                              book.ai_supplemental_prompt 
                                ? (book.ai_supplemental_prompt.length > 20 ? book.ai_supplemental_prompt.slice(0, 20) + '...' : book.ai_supplemental_prompt)
                                : (book.format === 'card' ? 'Select Photos That Tell a Story' : ('Memory Recipe #' + book.id.slice(-6)))
                            }}</span>
          </div>
        </div>
        <!-- Divider -->
        <div class="h-0.5 w-full bg-brand-primary/10"></div>
        <!-- Card Body (center) -->
        <div 
          :class="[
            'flex-1 flex flex-col p-5 pb-3 min-h-[160px] rounded-b-xl sm:rounded-b-2xl',
            book.format === 'card' 
              ? 'bg-gradient-to-br from-brand-highlight/10 to-brand-highlight/5'
              : 'bg-gradient-to-br from-brand-warm/20 to-brand-warm/10'
          ]"
        >
                      <div v-if="book.magic_story" class="text-brand-secondary text-xs magic-story animate-fade-in mb-3 relative leading-relaxed">
            <div class="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <Sparkle class="w-4 h-4 text-yellow-400 absolute left-0 top-0" />
              <span class="ml-6">{{ book.magic_story.length > 115 ? book.magic_story.slice(0, 115) + '...' : book.magic_story }}</span>
            </div>
          </div>
          <!-- Regular Memory Thumbnail -->
                      <div v-if="!book.magic_story && getFirstAssetThumbnail(book)" class="mb-3">
            <div class="relative w-full h-24 rounded-lg overflow-hidden border border-gray-200">
              <img 
                :src="getFirstAssetThumbnail(book)" 
                :alt="book.ai_supplemental_prompt || 'Memory Book'"
                class="w-full h-full object-cover"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
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
              <span class="bg-gradient-to-r from-blue-100 to-brand-navigation px-3 py-1 rounded-full text-xs font-bold text-gray-700 border border-gray-200">{{ book.created_from_assets.length }}</span>
            </div>
          </div>
          <div v-if="book.review_notes" class="mb-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
            <p class="text-xs text-amber-800 font-medium leading-relaxed">{{ book.review_notes }}</p>
          </div>
        </div>
        <!-- Divider -->
        <div class="h-0.5 w-full bg-brand-primary/10"></div>
        <!-- Card Footer -->
        <div
          :class="[
            'rounded-b-xl sm:rounded-b-2xl px-4 py-3 flex items-center justify-between gap-2 border-t shadow-sm h-20',
            book.format === 'card' 
              ? 'bg-brand-highlight/20 border-brand-highlight/20'
              : 'bg-brand-secondary/20 border-brand-secondary/20'
          ]"
        >
          <div class="flex flex-row flex-1 justify-between items-center gap-2">
            <!-- View Button -->
            <div data-testid="view-button" class="flex flex-col items-center cursor-pointer group p-2 rounded-lg hover:bg-white/50 transition-all duration-200 min-w-[48px]" @click="onDownloadClick(book)">
              <i class="pi pi-external-link text-lg sm:text-xl text-green-600 group-hover:scale-125 transition-transform"></i>
              <span class="border-0 text-[10px] sm:text-[11px] text-green-700 mt-1 font-medium">View</span>
            </div>
            <!-- Generate Button (for draft books without story) -->
            <div data-testid="compose-button" v-if="book.status === 'draft' && !book.magic_story" class="flex flex-col items-center cursor-pointer group p-2 rounded-lg hover:bg-white/50 transition-all duration-200 min-w-[48px]" @click="onGenerateClick(book)">
              <Wand2 class="w-5 h-5 sm:w-6 sm:h-6 text-brand-header group-hover:scale-125 transition-transform" />
              <span class="border-0 text-[10px] sm:text-[11px] text-brand-header mt-1 font-medium">Compose</span>
            </div>
            <!-- Generate Button (for draft books with story) -->
            <div data-testid="create-story-button" v-if="book.status === 'draft' && book.magic_story" class="flex flex-col items-center cursor-pointer group p-2 rounded-lg hover:bg-white/50 transition-all duration-200 min-w-[48px]" @click="onGenerateClick(book)">
              <Wand2 class="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 group-hover:scale-125 transition-transform" />
              <span class="border-0 text-[10px] sm:text-[11px] text-yellow-700 mt-1 font-medium">Create Story</span>
            </div>
            <!-- Regenerate Button (for ready or background_ready books without story) -->
            <div data-testid="recreate-button" v-if="(book.status === 'ready' || book.status === 'background_ready') && !book.magic_story" class="flex flex-col items-center cursor-pointer group p-2 rounded-lg hover:bg-white/50 transition-all duration-200 min-w-[48px]" @click="onRegenerateClick(book)" :class="{ 'opacity-50': book.status === 'background_ready' }">
              <i class="pi pi-refresh text-lg sm:text-xl text-yellow-600 group-hover:scale-125 transition-transform"></i>
              <span class="border-0 text-[10px] sm:text-[11px] text-yellow-700 mt-1 font-medium">{{ book.status === 'background_ready' ? 'Processing' : 'Recreate' }}</span>
            </div>
            <!-- Regenerate Button (for ready or background_ready books with story) -->
            <div data-testid="recreate-story-button" v-if="(book.status === 'ready' || book.status === 'background_ready') && book.magic_story" class="flex flex-col items-center cursor-pointer group p-2 rounded-lg hover:bg-white/50 transition-all duration-200 min-w-[48px]" @click="onRegenerateClick(book)" :class="{ 'opacity-50': book.status === 'background_ready' }">
              <i class="pi pi-refresh text-lg sm:text-xl text-yellow-600 group-hover:scale-125 transition-transform"></i>
              <span class="border-0 text-[10px] sm:text-[11px] text-yellow-700 mt-1 font-medium">{{ book.status === 'background_ready' ? 'Processing' : 'Recreate' }}</span>
            </div>
            <!-- Approve Button (books without story) -->
            <div data-testid="approve-button" v-if="book.status === 'ready' && !book.magic_story" class="flex flex-col items-center cursor-pointer group p-2 rounded-lg hover:bg-white/50 transition-all duration-200 min-w-[48px]" @click="approveBook(book.id)" v-tooltip.top="'Approve this Book and I\'ll Send it Out For You'">
              <i class="pi pi-check text-lg sm:text-xl text-brand-header group-hover:scale-125 transition-transform"></i>
              <span class="border-0 text-[10px] sm:text-[11px] text-brand-header mt-1 font-medium">Approve</span>
            </div>
            <!-- Approve Button (books with story) -->
            <div data-testid="approve-story-button" v-if="book.status === 'ready' && book.magic_story" class="flex flex-col items-center cursor-pointer group p-2 rounded-lg hover:bg-white/50 transition-all duration-200 min-w-[48px]" @click="approveBook(book.id)" v-tooltip.top="'Approve this Book and I\'ll Send it Out For You'">
              <i class="pi pi-check text-lg sm:text-xl text-yellow-600 group-hover:scale-125 transition-transform"></i>
              <span class="border-0 text-[10px] sm:text-[11px] text-yellow-700 mt-1 font-medium">Approve</span>
            </div>
            <!-- Unapprove Button (books without story) -->
            <div data-testid="unapprove-button" v-if="book.status === 'approved' && !book.magic_story" class="flex flex-col items-center cursor-pointer group p-2 rounded-lg hover:bg-white/50 transition-all duration-200 min-w-[48px]" @click="unapproveBook(book.id)">
              <i class="pi pi-undo text-lg sm:text-xl text-orange-600 group-hover:scale-125 transition-transform"></i>
              <span class="border-0 text-[10px] sm:text-[11px] text-orange-700 mt-1 font-medium">Unapprove</span>
            </div>
            <!-- Unapprove Button (books with story) -->
            <div data-testid="unapprove-story-button" v-if="book.status === 'approved' && book.magic_story" class="flex flex-col items-center cursor-pointer group p-2 rounded-lg hover:bg-white/50 transition-all duration-200 min-w-[48px]" @click="unapproveBook(book.id)">
              <i class="pi pi-undo text-lg sm:text-xl text-orange-600 group-hover:scale-125 transition-transform"></i>
              <span class="border-0 text-[10px] sm:text-[11px] text-orange-700 mt-1 font-medium">Unapprove</span>
            </div>
            <!-- View Details Button -->
            <div data-testid="details-button" class="flex flex-col items-center cursor-pointer group p-2 rounded-lg hover:bg-white/50 transition-all duration-200 min-w-[48px]" @click="viewBookDetails(book)">
              <i class="pi pi-list text-lg sm:text-xl text-gray-600 group-hover:scale-125 transition-transform"></i>
              <span class="border-0 text-[10px] sm:text-[11px] text-gray-700 mt-1 font-medium">Details</span>
            </div>
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
        <p class="text-sm sm:text-base text-gray-500 mb-6 text-center max-w-md">You need some photos to create your first special memory. Would you like to upload some now?</p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            data-testid="upload-photos-button"
            class="border-0 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold rounded-full px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base shadow transition-all duration-200"
            @click="showUploadDialog = true"
          >
            <i class="pi pi-upload mr-1 sm:mr-2"></i> Upload Photos
          </button>
          <button
            data-testid="skip-upload-button"
            class="border-0 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-full px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base shadow transition-all duration-200"
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
        <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-2">No special memories yet</h3>
        <p class="text-sm sm:text-base text-gray-500 mb-4 text-center max-w-md">
          Wonderful! You have {{ approvedAssetsCount }} approved photos ready. 
          <span v-if="approvedAssetsCount < 6" class="block mt-2 text-brand-secondary font-medium">
            💡 Tip: Savta, our special AI, works better when she can select from a library of at least 6 photos. 
            Consider adding more photos for the best results!
          </span>
          Are you ready to create your first memory card?
        </p>
                  <button
            data-testid="create-first-memory-card-button"
            class="border-0 bg-gradient-to-r from-blue-500 to-brand-secondary hover:from-blue-600 hover:to-brand-secondary text-white font-bold rounded-full px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base shadow transition-all duration-200 w-full max-w-sm"
            @click="openMagicMemoryDialog('quick')"
          >
            <i class="pi pi-plus mr-1 sm:mr-2"></i> Create Your First Memory Card
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
          <div class="absolute top-8 right-8 w-1 h-1 bg-brand-highlight rounded-full animate-ping" style="animation-delay: 0.3s;"></div>
          <div class="absolute bottom-8 left-8 w-1 h-1 bg-blue-300 rounded-full animate-ping" style="animation-delay: 0.6s;"></div>
          <div class="absolute bottom-4 right-4 w-2 h-2 bg-brand-secondary rounded-full animate-ping" style="animation-delay: 0.9s;"></div>
          <div class="absolute top-1/2 left-2 w-1 h-1 bg-yellow-400 rounded-full animate-ping" style="animation-delay: 1.2s;"></div>
          <div class="absolute top-1/2 right-2 w-1 h-1 bg-brand-highlight rounded-full animate-ping" style="animation-delay: 1.5s;"></div>
        </div>

        <!-- Main sparkle animation -->
        <div class="relative mb-4 sm:mb-6">
          <div class="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-yellow-200 via-brand-highlight to-blue-200 rounded-full flex items-center justify-center shadow-2xl animate-pulse relative">
            <i class="pi pi-sparkles text-4xl sm:text-5xl text-yellow-500 animate-bounce"></i>
            <!-- Glow effect -->
            <div class="absolute inset-0 bg-gradient-to-br from-yellow-300 to-brand-highlight rounded-full opacity-30 animate-pulse"></div>
          </div>
          <!-- Enhanced floating sparkles -->
          <div class="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-300 rounded-full animate-ping shadow-lg"></div>
          <div class="absolute -bottom-2 -left-2 sm:-bottom-3 sm:-left-3 w-4 h-4 sm:w-6 sm:h-6 bg-brand-highlight rounded-full animate-ping shadow-lg" style="animation-delay: 0.5s;"></div>
          <div class="absolute top-1/2 -right-4 sm:-right-6 w-3 h-3 sm:w-4 sm:h-4 bg-blue-300 rounded-full animate-ping shadow-lg" style="animation-delay: 1s;"></div>
          <div class="absolute top-1/2 -left-4 sm:-left-6 w-4 h-4 sm:w-5 sm:h-5 bg-brand-secondary rounded-full animate-ping shadow-lg" style="animation-delay: 1.5s;"></div>
        </div>
        
        <!-- Enhanced success message -->
        <h2 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 via-brand-secondary to-blue-600 bg-clip-text text-transparent mb-3 sm:mb-4 animate-fade-in">
          ✨ Recipe Created Successfully! ✨
        </h2>
        
        <div class="bg-gradient-to-r from-yellow-50 via-brand-navigation to-blue-50 rounded-2xl p-5 sm:p-6 border-2 border-brand-highlight mb-4 sm:mb-6 shadow-xl relative overflow-hidden">
          <!-- Inner sparkles -->
          <div class="absolute top-2 right-2 w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
          <div class="absolute bottom-2 left-2 w-2 h-2 bg-brand-highlight rounded-full animate-ping" style="animation-delay: 0.7s;"></div>
          
          <p class="text-lg sm:text-xl text-gray-800 leading-relaxed mb-3 sm:mb-4">
            You have just defined the <span class="font-bold text-brand-header">special recipe</span> we will use to generate your custom magic memory!
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
            data-testid="compose-memory-now-button"
            class="flex-1 bg-gradient-to-r from-purple-500 via-brand-secondary to-blue-500 hover:from-purple-600 hover:via-brand-secondary hover:to-blue-600 text-white font-bold rounded-full px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl relative overflow-hidden group"
            @click="composeNewlyCreatedMemory"
          >
            <!-- Button sparkles -->
            <div class="absolute top-2 right-2 w-2 h-2 bg-white/30 rounded-full animate-ping"></div>
            <div class="absolute bottom-2 left-2 w-1 h-1 bg-white/30 rounded-full animate-ping" style="animation-delay: 0.5s;"></div>
            
            <i class="border-0 pi pi-magic mr-2 sm:mr-3 text-lg sm:text-xl group-hover:animate-spin"></i>
            Compose the Memory Now
          </button>
          <button
            data-testid="compose-later-button"
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
        <div class="text-center">✨ Moment (photo) Processing Workshop ✨</div>
      </template>
      <div class="space-y-6 max-w-xs w-full mx-auto sm:max-w-2xl sm:mx-auto">
        <!-- Upload Instructions -->
        <div v-if="!isUploading && uploadedFiles.length === 0" class="bg-gradient-to-r from-brand-navigation via-brand-warm to-blue-50 rounded-xl p-6 border-2 border-brand-highlight relative overflow-hidden">
          <!-- Magical sparkles -->
          <div class="absolute top-2 right-2 w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
          <div class="absolute bottom-2 left-2 w-2 h-2 bg-brand-highlight rounded-full animate-ping" style="animation-delay: 0.5s;"></div>
          <div class="absolute top-1/2 right-4 w-2 h-2 bg-blue-300 rounded-full animate-ping" style="animation-delay: 1s;"></div>
          
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 bg-brand-navigation rounded-full flex items-center justify-center shadow-lg relative">
              <i class="pi pi-sparkles text-brand-header text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-brand-header mb-1">✨ Let Savta help you with your upload your photos ✨</h3>
            </div>
          </div>
          <div class="bg-white/80 rounded-lg p-4">
            <div class="text-sm text-gray-700 leading-relaxed">
              <ul class="list-disc pl-4 text-xs md:text-sm">
                <li>Share your special photos with Savta - I'll keep them safe in my workshop</li>
                <li>The more photos you upload, the better Savta can help you</li>
                <li>Your memories will be stored securely in your own private collection</li>
                <li>I'll recognize the faces, places and write sweet notes about each one</li>
                <li>I'll use my special AI powers to select the best photos and captions for your card or book</li>
              </ul>
              
              <!-- Special recommendation for new users -->
              <div v-if="showSpecialUploadMessaging" class="mt-4 p-3 bg-brand-highlight/10 rounded-lg border border-brand-highlight/20">
                <div class="flex items-center gap-2 mb-2">
                  <i class="pi pi-lightbulb text-brand-highlight text-lg"></i>
                  <span class="font-semibold text-brand-highlight">💡 Getting Started Recommendation</span>
                </div>
                <p class="text-sm text-brand-primary">
                  To get started, we recommend loading 6 or more photos from your computer, phone, or tablet. 
                  This helps Savta create more meaningful and diverse memory cards for you!
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Upload Progress -->
        <div v-if="isUploading" class="space-y-4">
          <!-- Overall Progress -->
          <div class="bg-brand-navigation rounded-xl p-6 relative overflow-hidden">
            <!-- Magical sparkles -->
            <div class="absolute top-3 right-3 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
            <div class="absolute bottom-3 left-3 w-2 h-2 bg-brand-highlight rounded-full animate-ping" style="animation-delay: 0.7s;"></div>
            
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-brand-navigation to-brand-warm rounded-full flex items-center justify-center shadow-lg">
                <i class="pi pi-sparkles text-brand-header text-lg animate-pulse"></i>
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-lg font-bold text-center">✨ Upload and AI Processing in Progress ✨</span>
                  <span class="text-lg font-bold">{{ uploadProgress }}%</span>
                </div>
                <div class="w-full bg-white/60 rounded-full h-4 border border-brand-highlight">
                  <div 
                    class="bg-brand-card h-4 rounded-full transition-all duration-500 shadow-lg"
                    :style="{ width: uploadProgress + '%' }"
                  ></div>
                </div>
                <p class="text-sm mt-2 font-medium">{{ uploadStatus }}</p>
              </div>
            </div>
          </div>

          <!-- Current File Progress -->
          <div v-if="uploadingFiles.length > 0" class="bg-white/90 rounded-xl p-6 border-2 border-purple-200 shadow-lg">
            <h4 class="text-lg font-bold mb-4 flex items-center text-center gap-2">
              <i class="pi pi-sparkles text-brand-header"></i>
              🌸 Savta is working on your photos 🌸
            </h4>
            <div class="space-y-3">
              <div 
                v-for="file in uploadingFiles" 
                :key="file.name"
                class="flex items-center gap-4 p-4 bg-brand-navigation rounded-xl border border-brand-highlight transition-all duration-200 hover:shadow-md"
              >
                <div class="w-10 h-10 bg-brand-navigation rounded-full flex items-center justify-center shadow-md">
                  <i class="pi pi-image text-brand-header text-sm"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold truncate">{{ file.name }}</p>
                  <p class="text-xs font-medium">{{ getMagicStatusText(file.status) }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <div v-if="file.status === 'uploading'" class="w-5 h-5 border-2 border-brand-highlight border-t-transparent rounded-full animate-spin"></div>
                  <div v-else-if="file.status === 'processing'" class="w-5 h-5 border-2 border-brand-secondary border-t-transparent rounded-full animate-spin"></div>
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
                <h4 class="text-xl font-bold text-green-800">✨ Upload and AI Processing Complete! ✨</h4>
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
                  <span class="text-xs text-green-500">✨ Prepared</span>
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
              ✨ Start Uploading Photos ✨
            </button>
            <button
              data-testid="finish-upload-button"
              v-if="!isUploading && (uploadedFiles.length > 0 || failedFiles.length > 0)"
              class="bg-brand-dialog-save text-white font-bold rounded-full px-3 py-2 text-xs shadow-lg transition-all duration-200 w-full sm:w-auto"
              @click="finishUpload"
            >
              <i class="pi pi-sparkles mr-2"></i>
              🎉 Preparation Complete! 🎉
            </button>
          </div>
        </div>
      </template>
    </Dialog>

    <!-- Book Details Modal -->
    <Dialog
      v-model:visible="showDetailsModal"
      modal
      class="w-[95vw] max-w-4xl mx-auto mb-15 mt-20"
      :auto-z-index="false"
      :z-index="1000"
    >
      <div v-if="selectedBook" class="bg-gradient-to-br from-brand-navigation/10 via-brand-accent/5 to-brand-highlight/10 min-h-screen">
        <!-- Header Section -->
        <div class="bg-gradient-to-br from-white via-brand-navigation/5 to-brand-accent/10 rounded-t-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div class="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-brand-secondary to-brand-highlight rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <Gift class="w-6 h-6 sm:w-8 sm:h-8 text-white" />
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
                <Wand2 class="w-3 h-3 sm:w-4 sm:h-4 text-brand-primary" />
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
              <p class="text-xs text-gray-500">{{ approvedAssetsCount }} total</p>
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
                  <h3 class="text-base sm:text-lg font-bold text-gray-900">Memory Book {{ getFileTypeDisplay(selectedBook) }}</h3>
                  <p class="text-xs sm:text-sm text-gray-600">Ready to download and share</p>
                </div>
              </div>
              <button
                data-testid="download-memory-button"
                class="border-0 flex items-center justify-center gap-2 bg-brand-dialog-save text-white font-bold rounded-full px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm shadow-lg transition-all duration-200 w-full sm:w-auto"
                @click="forceDownloadPDF(selectedBook)"
              >
                <i class="pi pi-download text-xs sm:text-sm"></i>
                <span class="hidden sm:inline">Download Your Memory</span>
                <span class="sm:hidden">Download</span>
              </button>
            </div>
            <div class="border-0 bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 rounded-xl p-3 sm:p-4 border border-brand-primary/20 mt-4">
              <div class="flex items-start gap-2 text-xs sm:text-sm text-brand-primary">
                <i class="pi pi-info-circle text-brand-primary text-xs sm:text-sm mt-0.5 flex-shrink-0"></i>
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
                <Wand2 class="w-3 h-3 sm:w-4 sm:h-4" />
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

    <!-- PDF Progress Dialog -->
    <div 
      v-if="showProgressDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-all duration-1000 ease-out"
      :class="showProgressDialog ? 'backdrop-blur-xl' : 'backdrop-blur-none'"
      style="z-index: 9999;"
    >
      <!-- Main dialog container -->
      <div 
        class="bg-white rounded-2xl shadow-2xl border-4 border-brand-highlight overflow-hidden"
        :style="{ 
          width: isMobile ? '95vw' : '450px', 
          maxWidth: '95vw',
          maxHeight: '90vh'
        }"
      >
        <!-- Main content container -->
        <div class="p-6 sm:p-8">
          <!-- Magic Header -->
          <div class="text-center mb-6">
            <div class="relative mb-4">
              <!-- Floating sparkles -->
              <div class="absolute -top-2 -left-2 w-4 h-4 bg-brand-flash rounded-full animate-ping"></div>
              <div class="absolute -top-1 -right-1 w-3 h-3 bg-brand-highlight rounded-full animate-ping" style="animation-delay: 0.5s;"></div>
              <div class="absolute -bottom-1 -left-1 w-2 h-2 bg-brand-accent rounded-full animate-ping" style="animation-delay: 1s;"></div>
              
              <!-- Main magic circle -->
              <div class="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-brand-accent via-brand-highlight to-brand-secondary rounded-full flex items-center justify-center shadow-lg mx-auto animate-pulse">
                <i class="pi pi-sparkles text-3xl sm:text-4xl text-brand-header animate-bounce"></i>
              </div>
            </div>
            
            <h2 class="text-lg sm:text-xl font-bold text-brand-header mb-2 animate-fade-in">
              {{ isRegenerating ? '🌸 Recreating Your Memory Book 🌸' : '🌸 Creating Your Memory Book 🌸' }}
            </h2>
            <p class="text-sm sm:text-base text-brand-primary font-medium">
              {{ isRegenerating ? 'Baking fresh memories with love...' : 'Baking your memory book with love...' }}
            </p>
          </div>

          <!-- Progress Section -->
          <div class="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 border-2 border-brand-highlight shadow-lg">
            <div class="text-center">
              <h3 class="text-sm sm:text-base font-semibold text-brand-header mb-3 leading-tight">
                {{ currentProgressMessage }}
              </h3>
              
              <!-- Animated progress bar -->
              <div class="relative mb-4">
                <div class="w-full bg-gradient-to-r from-brand-accent/30 to-brand-highlight/30 rounded-full h-3 shadow-inner">
                  <div 
                    class="bg-gradient-to-r from-brand-accent via-brand-highlight to-brand-secondary h-3 rounded-full transition-all duration-500 ease-out shadow-lg relative overflow-hidden"
                    :style="`width: ${currentProgress}%`"
                  >
                    <!-- Shimmer effect -->
                    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  </div>
                </div>
              </div>
              
              <!-- Status indicator -->
              <div class="flex items-center justify-center gap-2 text-sm sm:text-base text-brand-primary">
                <i class="pi pi-cog text-brand-highlight animate-spin"></i>
                <span class="font-medium">{{ isRegenerating ? 'Baking...' : 'Baking...' }}</span>
              </div>
            </div>
          </div>

          <!-- Magic particles effect -->
          <div class="relative mt-4 h-8">
            <div class="absolute inset-0 flex justify-center">
              <div class="w-2 h-2 bg-brand-flash rounded-full animate-bounce" style="animation-delay: 0s;"></div>
              <div class="w-2 h-2 bg-brand-highlight rounded-full animate-bounce ml-2" style="animation-delay: 0.2s;"></div>
              <div class="w-2 h-2 bg-brand-accent rounded-full animate-bounce ml-2" style="animation-delay: 0.4s;"></div>
              <div class="w-2 h-2 bg-brand-secondary rounded-full animate-bounce ml-2" style="animation-delay: 0.6s;"></div>
              <div class="w-2 h-2 bg-brand-flash rounded-full animate-bounce ml-2" style="animation-delay: 0.8s;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Generate Confirmation Dialog -->
    <Dialog v-model:visible="showGenerateDialog" modal header="Try Another Recipe" class="w-[95vw] max-w-md">
      <div class="py-4 pt-3">
        <p class="text-sm sm:text-base">Compose this special memory? This may take a little time.</p>
        <div class="flex justify-end gap-2 mt-4">
          <Button data-testid="generate-cancel-button" label="Cancel" size="small" class="bg-brand-dialog-cancel text-white font-bold rounded-full text-xs px-3 py-2" @click="cancelDialog" />
          <Button data-testid="generate-confirm-button" label="Compose" size="small" class="bg-brand-dialog-save text-white font-bold rounded-full text-xs px-3 py-2" @click="confirmGenerate" />
        </div>
      </div>
    </Dialog>
    <!-- Regenerate Confirmation Dialog -->
    <Dialog v-model:visible="showRegenerateDialog" modal header="Recreate Memory Book" class="w-full max-w-xl">
      <div class="p-4">
        <p class="text-brand-header text-sm sm:text-xl font-bold mb-2">
          Create a fresh version of your memory?
        </p>
        <p class="text-brand-primary text-sm sm:text-base mb-2">
          I'll pick different photos and write a new story for you. Each recreation will be unique - like making a new batch of cookies from the same recipe! 
          Keep recreating until it's just perfect for your family.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-end mt-4">
          <Button data-testid="regenerate-cancel-button" label="Cancel" class="bg-brand-dialog-cancel text-white font-bold rounded-full px-4 py-3 sm:px-3 sm:py-2 text-sm sm:text-xs shadow transition-all duration-200 w-full sm:w-auto min-h-[48px] sm:min-h-0" @click="cancelDialog" />
          <Button 
            data-testid="regenerate-confirm-button"
            label="Yes, Recreate" 
            class="bg-brand-dialog-edit text-white font-bold rounded-full px-4 py-3 sm:px-3 sm:py-2 text-sm sm:text-xs shadow transition-all duration-200 w-full sm:w-auto min-h-[48px] sm:min-h-0" 
            @click="confirmRegenerate" 
          />
        </div>
      </div>
    </Dialog>
    <!-- View Draft Dialog -->
    <Dialog v-model:visible="showDownloadDraftDialog" modal header="Special Memory Not Composed" class="w-[95vw] max-w-md">
      <div class="py-4">
        <p class="text-sm sm:text-base">You need to compose the special memory before viewing. 
          Would you like to compose it now? 
          This may take a little time.</p>
        <div class="flex flex-col sm:flex-row justify-end gap-3 sm:gap-2 mt-4">
          <Button data-testid="download-draft-cancel-button" label="Cancel" size="small" class="bg-brand-dialog-cancel text-white font-bold rounded-full text-sm sm:text-xs px-4 py-3 sm:px-3 sm:py-2 min-h-[48px] sm:min-h-0" @click="cancelDialog" />
          <Button data-testid="download-draft-compose-button" label="Compose Now" size="small" class="bg-brand-dialog-save text-white font-bold rounded-full text-sm sm:text-xs px-4 py-3 sm:px-3 sm:py-2 min-h-[48px] sm:min-h-0" @click="confirmDownloadDraft" />
        </div>
      </div>
    </Dialog>

    <!-- Step 1 - wizard -- Update Description Dialog -->
    <Dialog v-model:visible="showUpdateDescriptionDialog" modal header="Update Memory Prompt" class="w-full max-w-xl">
      <div class="p-4">
        <div class="mb-4">
          <p class="text-sm mb-3">
            Tell me about the memory you want to recreate. 
            This helps Savta AI choose the best photos and create a beautiful new story for you.
            You can include specific details about the memory, such as the date, location, people, and any other details you want to include.
            You can also just describe a theme such as "My favorite memories from my trip to Paris" or "Our family vacation memories".
          </p>
          <div class="bg-gray-50 rounded-lg p-3 mb-4">
            <p class="text-xs text-gray-600 mb-1">Your current prompt:</p>
            <p class="text-sm text-gray-800 font-medium">{{ pendingBook?.ai_supplemental_prompt || 'No description' }}</p>
          </div>
        </div>
        
        <div class="mb-4">
          <label for="newDescription" class="block text-sm font-medium text-gray-700 mb-2">
            New Description
          </label>
          <Textarea
            data-testid="new-description-textarea"
            id="newDescription"
            v-model="newDescription"
            rows="3"
            placeholder="For example: 'Photos from our New York trip' or 'Our family vacation memories'"
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-highlight focus:border-brand-highlight"
          />
        </div>
        
        <div class="flex flex-col sm:flex-row gap-3 justify-end mt-4">
          <Button 
            data-testid="update-description-cancel-button"
            label="Cancel" 
            class="bg-brand-dialog-cancel text-white font-bold rounded-full px-4 py-3 sm:px-3 sm:py-2 text-sm sm:text-xs shadow transition-all duration-200 w-full sm:w-auto min-h-[48px] sm:min-h-0" 
            @click="cancelDialog" 
          />
          <Button 
            data-testid="update-description-no-change-button"
            label="No change -- just Recreate" 
            class="bg-brand-dialog-save text-white font-bold rounded-full px-4 py-3 sm:px-3 sm:py-2 text-sm sm:text-xs shadow transition-all duration-200 w-full sm:w-auto min-h-[48px] sm:min-h-0" 
            @click="confirmUpdateDescription" 
          />
          <Button 
            data-testid="update-description-update-button"
            label="Update & Recreate" 
            class="bg-brand-dialog-edit text-white font-bold rounded-full px-4 py-3 sm:px-3 sm:py-2 text-sm sm:text-xs shadow transition-all duration-200 w-full sm:w-auto min-h-[48px] sm:min-h-0" 
            @click="confirmUpdateDescription" 
          />
        </div>
      </div>
    </Dialog>

    <!-- PDF Preview Modal -->
    <Dialog
      v-model:visible="showPdfModal"
      modal
      header="Special Memory Preview"
      class="w-full max-w-6xl h-[90vh] sm:h-[85vh] mt-2 sm:mt-6"
      :contentStyle="{ height: '90vh', maxHeight: '90vh', padding: 0 }"
      :closable="false"
      :auto-z-index="false"
      :z-index="40"
    >
      <div class="flex flex-col h-full w-full" style="height: 90vh; max-height: 90vh; width: 100%; padding: 0;">
        <!-- PDF Viewer - Mobile (with overflow) -->
        <div class="flex-1 min-h-0 w-full flex items-center justify-center overflow-auto sm:hidden px-0 pb-4">
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
        <!-- Action Buttons -->
        <div class="z-50 flex justify-center items-center gap-3 sm:gap-4 py-4 sm:py-6 px-4 bg-gray-50 border-t border-gray-200 min-h-[60px] sm:min-h-[80px]">
                  <Button
          data-testid="pdf-modal-close-button"
          label="Close"
          size="small"
          class="bg-brand-dialog-cancel text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3"
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
              <p class="text-xs sm:text-sm text-gray-600">We're about to clean up your special memory</p>
            </div>
          </div>
          <div class="bg-white rounded-lg p-3 border border-orange-200">
            <p class="text-xs sm:text-sm text-gray-900">
              This will reset your special memory back to draft status and clear any generated backgrounds and PDFs. 
              You'll be able to apply fresh magic to create a brand new version of your special memory.
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
            data-testid="cleanup-cancel-button"
            label="Cancel"
            icon="pi pi-times"
            @click="showCleanupConfirmationModal = false"
            class="bg-brand-dialog-cancel text-white font-bold rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold shadow w-full sm:w-auto"
          />
          <Button
            data-testid="cleanup-confirm-button"
            label="Yes, Clean Up"
            icon="pi pi-broom"
            @click="confirmCleanup"
            class="bg-brand-dialog-edit text-white font-bold rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm shadow w-full sm:w-auto"
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
        <div class="bg-gradient-to-r from-blue-50 to-brand-navigation rounded-lg p-3 sm:p-4 border border-brand-highlight">
          <div class="flex items-center space-x-3 mb-2">
            <div class="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-100 to-brand-navigation rounded-full flex items-center justify-center">
              <i class="pi pi-heart text-blue-600 text-xs sm:text-sm"></i>
            </div>
            <h3 class="text-base sm:text-lg font-semibold text-gray-900">Choose Your Memories</h3>
          </div>
          <p class="text-xs sm:text-sm text-gray-600">
            Select the memories you'd like to include in your special memory. You can filter by tags and select multiple memories at once.
          </p>
        </div>

        <!-- Filter Section -->
        <div class="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div class="flex-1 min-w-0">
              <label class="block text-sm font-medium text-gray-900 mb-2">Filter by Tags</label>
              <div class="flex gap-2">
                <MultiSelect
                  data-testid="tag-filter-multiselect"
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
                data-testid="clear-tag-filter-button"
                v-if="selectedTagFilter && selectedTagFilter.length > 0"
                icon="pi pi-times"
                size="small"
                @click="clearTagFilter"
                class="px-2 sm:px-3"
                v-tooltip.top="'Clear filter'"
              />
              </div>
            </div>
            <div class="flex items-center justify-center sm:justify-end gap-2">
              <Button
                data-testid="select-all-memories-button"
                label="Select All"
                icon="pi pi-check-square"
                size="small"
                @click="selectAllMemories"
                class="bg-green-500 border-0 text-xs px-2 sm:px-3 py-2"
              />
              <Button
                data-testid="clear-all-memories-button"
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
              :data-testid="`memory-item-${asset.id}`"
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
                  Ready to create your special memory
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
              data-testid="select-memories-cancel-button"
              label="Cancel"
              icon="pi pi-times"
              @click="closeSelectMemoriesDialog"
              class="bg-brand-dialog-cancel text-white font-bold rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold shadow w-full sm:w-auto"
            />
          </div>
          <div class="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <span class="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              {{ selectedMemories.length }} selected
            </span>
            <Button
              data-testid="save-memories-selection-button"
              label="Save Selection"
              icon="pi pi-check"
              :disabled="selectedMemories.length === 0"
              @click="saveSelectedMemories"
              class="bg-brand-dialog-save text-white font-bold rounded-full w-full sm:w-auto text-xs sm:text-sm px-4 sm:px-5 py-2"
            />
          </div>
        </div>
      </template>
    </Dialog>

    <!-- Magic Memory Dialog -->
    <Dialog
      v-model:visible="showMagicMemoryDialog"
      modal
      :closable="false"
      :dismissableMask="false"
      :style="{ maxWidth: '700px', maxHeight: '100vh' }"
      :class="['z-50', 'w-full', 'sm:w-[700px]', 'sm:max-w-[700px]', 'h-full', 'sm:h-auto', 'm-0', 'rounded-none', 'sm:rounded-2xl']"
    >
      <!-- Step 1: AI Prompt Input -->
      <div v-if="magicMemoryStep === MAGIC_STEPS.TITLE && currentButtonConfig?.steps.includes(MAGIC_STEPS.TITLE)"
        class="h-screen min-h-screen m-0 rounded-none flex flex-col justify-start items-center pt-1 px-4 py-4 bg-white overflow-x-hidden sm:w-auto sm:h-auto sm:min-h-0 sm:rounded-2xl sm:px-6 sm:py-6">
        <div class="text-center mb-6 sm:mb-8 max-w-md w-full mx-auto sm:max-w-full">
          <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-brand-secondary to-brand-highlight rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
            <Gift class="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3 leading-tight">✨ Tell us about the memory you’d like to create ✨</h3>
          <section class="memory-instructions text-left max-w-lg mx-auto" aria-labelledby="memory-title">
            <p class="text-sm text-gray-600 mb-3 leading-relaxed">I'll use your description to find the best photos and create a beautiful story.</p>
            <ul class="text-left space-y-2 text-xs sm:text-sm text-gray-600 leading-relaxed list-disc pl-5">
              <li>Share details like <em class="text-gray-700 font-medium">who was there, where it happened, or when it was</em></li>
              <li>Or describe a theme like <em class="text-gray-700 font-medium">"Our family trip to Paris"</em> or <em class="text-gray-700 font-medium">"Birthday celebrations"</em></li>
              <li>Feel free to include a specific date or location if you’d like.</li>
            </ul>
          </section>
        </div>
        <div class="field w-full max-w-md mx-auto sm:max-w-[520px] sm:mx-auto mt-1">
          <label class="block text-lg font-bold text-gray-900 mb-2 text-left">Describe your memory</label>
          <InputText
            data-testid="memory-title-input"
            v-model="magicMemoryTitle"
            :placeholder="'e.g. Special Trip with Karen and Sam, Summer 2023'"
            class="w-full text-base px-4 py-4 sm:py-3 rounded-xl focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition-all duration-200 border-2 border-gray-200 hover:border-gray-300"
            maxlength="80"
            show-clear
            aria-label="Memory Subject"
            required
            :model-value="magicMemoryTitle"
          />
          <small class="text-gray-500 text-sm mt-1 block leading-relaxed">I'll use this to find your best photos and create a beautiful story.</small>
        </div>
      </div>

      <!-- Step 2: Theme Selection -->
      <div v-if="magicMemoryStep === MAGIC_STEPS.THEME && currentButtonConfig?.steps.includes(MAGIC_STEPS.THEME)"
        class="h-screen min-h-screen m-0 rounded-none flex flex-col justify-start items-center pt-1 px-4 py-4 bg-white overflow-x-hidden sm:w-auto sm:h-auto sm:min-h-0 sm:rounded-2xl sm:px-6 sm:py-6">
        <div class="text-center mb-2 sm:mb-6 max-w-xs w-full mx-auto sm:max-w-full">
          <div class="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-brand-secondary to-brand-highlight rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
            <i class="pi pi-palette text-lg sm:text-2xl text-white"></i>
          </div>
          <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-1">Pick a special theme for your memory</h3>
          <p class="text-sm sm:text-base text-gray-600">Pick a beautiful theme to make your memory card extra special. Or you can skip this and I'll use my favorite default theme.</p>
        </div>
        
        <div class="field w-full max-w-sm mx-auto sm:max-w-[520px] sm:mx-auto">
          <label class="block text-xs sm:text-sm font-medium text-gray-900 mb-1 sm:mb-2 text-left">Theme (Optional)</label>
          <Dropdown
            data-testid="theme-dropdown"
            v-model="magicSelectedTheme"
            :options="magicThemeOptions"
            option-label="label"
            option-value="value"
            placeholder="Select a theme (or skip for default)"
            class="w-full p-1.5 sm:p-2 lg:p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            :pt="{
              root: { class: 'w-full' },
              input: { class: 'text-xs sm:text-sm lg:text-base' },
              item: { class: 'text-xs sm:text-sm lg:text-base' }
            }"
            :loading="loadingMagicThemes"
            :disabled="loadingMagicThemes"
          />
          <small class="text-gray-600 text-xs mt-1 block">
            Themes create beautiful layouts with special fonts, colors, and designs
          </small>
        </div>
        
      </div>

      <!-- Step 3: Background Selection -->
      <div v-if="magicMemoryStep === MAGIC_STEPS.BACKGROUND && currentButtonConfig?.steps.includes(MAGIC_STEPS.BACKGROUND)"
        class="h-screen min-h-screen m-0 rounded-none flex flex-col justify-start items-center pt-1 px-4 py-4 bg-white overflow-x-hidden sm:w-auto sm:h-auto sm:min-h-0 sm:rounded-2xl sm:px-6 sm:py-6">
        <div class="text-center mb-2 sm:mb-3 max-w-xs w-full mx-auto sm:max-w-full">
          <div class="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-brand-secondary to-brand-highlight rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
            <i class="pi pi-palette text-xl sm:text-2xl text-white"></i>
          </div>
          <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-1">Customize the Background</h3>
          <p class="text-sm sm:text-base text-gray-600 mb-2">
            The theme you selected has a designer selected color but you can override it here if you prefer.</p>
        </div>
        
        <!-- Color Picker -->
        <div class="bg-gradient-to-r from-brand-flash/10 to-brand-highlight/10 rounded-xl p-4 sm:p-6 border border-brand-flash/20 w-full max-w-md mx-auto">
          <h4 class="font-semibold text-brand-flash mb-3 text-center">Choose Your Color</h4>
          <div class="flex flex-col sm:flex-row items-center gap-4">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
              <input 
                data-testid="background-color-picker"
                type="color" 
                v-model="magicSolidBackgroundColor"
                class="w-full h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                :style="{ backgroundColor: magicSolidBackgroundColor || selectedThemeBackgroundColor }"
              />
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">Preview</label>
              <div class="w-full h-12 rounded-lg border-2 border-gray-200 flex items-center justify-center"
                   :style="{ backgroundColor: magicSolidBackgroundColor || selectedThemeBackgroundColor }">
                <span class="text-sm font-medium" :class="getContrastTextClass(magicSolidBackgroundColor || selectedThemeBackgroundColor)">
                  Card or Booklet
                </span>
              </div>
            </div>
          </div>
          <div class="mt-3 text-xs text-gray-600 text-center">
            <p>This color will be the background for your entire memory card</p>
          </div>
        </div>

      </div>

      <!-- Step 4: Photo Selection Method -->
      <div v-if="magicMemoryStep === MAGIC_STEPS.PHOTOS && currentButtonConfig?.steps.includes(MAGIC_STEPS.PHOTOS)"
        class="h-screen min-h-screen m-0 rounded-none flex flex-col justify-start items-center pt-1 px-4 py-4 bg-white overflow-x-hidden sm:w-auto sm:h-auto sm:min-h-0 sm:rounded-2xl sm:px-6 sm:py-6">
        <div class="text-center mb-2 sm:mb-3 max-w-xs w-full mx-auto sm:max-w-full">
          <div class="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-brand-flash to-brand-highlight rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
            <i class="pi pi-images text-xl sm:text-2xl text-white"></i>
          </div>
          <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-1">How should I pick your photos?</h3>
          <p class="text-xs sm:text-base text-gray-600 mb-2">When you upload photos, they go into your library. Then I'll choose the best ones and write lovely captions for your card or booklet. Choose how you'd like me to pick photos from your library.</p>
          <p class="text-xs text-brand-flash font-medium">📸 You have {{ photoSelection_availableAssets.length }} photo{{ photoSelection_availableAssets.length !== 1 ? 's' : '' }} in your library</p>
        </div>
        
                            <!-- Photo Selection Interface Component -->
                    <PhotoSelectionInterface
                      ref="photoSelectionInterfaceRef"
                      v-model:method="photoSelection_method"
                      v-model:dateRange="photoSelection_dateRange"
                      v-model:selectedTags="photoSelection_selectedTags"
                      v-model:locationType="photoSelection_locationType"
                      v-model:selectedLocation="photoSelection_selectedLocation"
                      v-model:selectedMemories="photoSelection_selectedMemories"
                      v-model:selectedTagFilter="photoSelection_selectedTagFilter"
                      :title="magicMemoryTitle"
                      :computedAvailableTags="photoSelection_computedAvailableTags"
                      :availableCountries="photoSelection_availableCountries"
                      :availableStates="photoSelection_availableStates"
                      :availableCities="photoSelection_availableCities"
                      :filteredAssets="photoSelection_filteredAssets"
                      :loadingAssets="photoSelection_loadingAssets"
                      :isUploading="isUploading"
                      @upload-photos="selectFilesForMagicMemory"
                      @photo-library-selected="nextMagicMemoryStep"
                      @no-photos-found="handleNoPhotosFound"
                      @close-photo-library="handleClosePhotoLibrary"
                    />
        </div>

      <!-- Step 5: Photo Library Selection (MANUAL step for photo_library method) -->
      <div v-if="magicMemoryStep === MAGIC_STEPS.MANUAL && photoSelection_method === 'photo_library'"
        class="h-screen min-h-screen m-0 rounded-none flex flex-col justify-start items-center pt-1 px-4 py-4 bg-white overflow-x-hidden sm:w-auto sm:h-auto sm:min-h-0 sm:rounded-2xl sm:px-6 sm:py-6">
        <div class="text-center mb-2 sm:mb-3 max-w-xs w-full mx-auto sm:max-w-full">
          <div class="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-brand-flash to-brand-highlight rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
            <i class="pi pi-folder-open text-xl sm:text-2xl text-white"></i>
            </div>
          <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-1">Choose your photos</h3>
          <p class="text-xs sm:text-base text-gray-600 mb-2">Think of this as creating a "photo collection" for your memory card. Pick all the photos that remind you of this special moment - you can choose as many as you'd like! I'll then look through your collection and pick the perfect number of photos that work best with your chosen theme. It's like having me help you arrange the best photos for your memory card.</p>
          <p class="text-xs text-brand-flash font-medium">📸 You have {{ photoSelection_availableAssets.length }} photo{{ photoSelection_availableAssets.length !== 1 ? 's' : '' }} in your library</p>
            </div>

                            <!-- Photo Selection Interface Component (Photo Library Mode) -->
                    <PhotoSelectionInterface
                      ref="photoSelectionInterfaceRef"
                      v-model:method="photoSelection_method"
                      v-model:dateRange="photoSelection_dateRange"
                      v-model:selectedTags="photoSelection_selectedTags"
                      v-model:locationType="photoSelection_locationType"
                      v-model:selectedLocation="photoSelection_selectedLocation"
                      v-model:selectedMemories="photoSelection_selectedMemories"
                      v-model:selectedTagFilter="photoSelection_selectedTagFilter"
                      :title="magicMemoryTitle"
                      :computedAvailableTags="photoSelection_computedAvailableTags"
                      :availableCountries="photoSelection_availableCountries"
                      :availableStates="photoSelection_availableStates"
                      :availableCities="photoSelection_availableCities"
                      :filteredAssets="photoSelection_filteredAssets"
                      :loadingAssets="photoSelection_loadingAssets"
                      :isUploading="isUploading"
                      @upload-photos="selectFilesForMagicMemory"
                      @photo-library-selected="nextMagicMemoryStep"
                      @no-photos-found="handleNoPhotosFound"
                      @close-photo-library="handleClosePhotoLibrary"
              />
            </div>




      <template #footer>
        <div class="flex flex-col sm:flex-row justify-between items-center gap-2 mt-1">
          <!-- Cancel Button (always visible) -->
          <Button
            label="Cancel"
            icon="pi pi-times"
            @click="showMagicMemoryDialog = false"
            class="bg-brand-dialog-cancel text-white font-bold rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm shadow-lg transition-all duration-200 w-full sm:w-auto"
          />
          
          <!-- Back Button (not on first step) -->
          <Button
            v-if="!isFirstStep()"
            label="Back"
            icon="pi pi-arrow-left"
            @click="previousMagicMemoryStep()"
            class="bg-brand-dialog-cancel text-white font-bold rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm shadow-lg transition-all duration-200 w-full sm:w-auto"
          />
          
          <!-- Next Button (not on last step) -->
          <Button
            v-if="!isLastStep()"
            :label="`Next: ${getNextStepName()}`"
            icon="pi pi-arrow-right"
            :disabled="(magicMemoryStep === MAGIC_STEPS.TITLE && !magicMemoryTitle.trim()) || (magicMemoryStep === MAGIC_STEPS.PHOTOS && !photoSelection_method.value) || (magicMemoryStep === MAGIC_STEPS.PHOTOS && photoSelection_method.value === 'geo_code' && !photoSelection_selectedLocation.value)"
            @click="nextMagicMemoryStep"
            class="bg-brand-secondary hover:to-blue-700 text-white font-bold rounded-full px-4 py-2 text-xs sm:text-sm shadow-lg transition-all duration-200 w-full sm:w-auto border-0"
          />
          
          <!-- Continue Button (only on last step) -->
          <Button
            v-if="isLastStep()"
            label="Let's create something beautiful together"
            icon="pi pi-bolt"
            :disabled="(magicMemoryStep === MAGIC_STEPS.MANUAL && photoSelection_method.value === 'photo_library' && photoSelection_selectedMemories.value.length < 1) || magicLoading"
            :loading="magicLoading"
            @click="onMagicMemoryContinue"
            class="bg-brand-dialog-save text-white font-bold rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm shadow-lg transition-all duration-200 w-full sm:w-auto animate-pulse"
          />
        </div>
      </template>
    </Dialog>
    </div>
  </div>

      <Dialog v-model:visible="showDeleteDialog" modal header="Move to Trash?" class="w-full max-w-xs rounded-2xl">
    <div class="text-center py-4">
      <i class="pi pi-exclamation-triangle text-3xl text-red-500 mb-2"></i>
      <div class="text-lg font-bold text-gray-900 mb-2">Are you sure?</div>
      <div class="text-gray-700 mb-4">This will move the memory to the deleted section. You can restore it later if needed.</div>
      <div class="flex justify-center gap-3">
        <button class="bg-brand-dialog-cancel text-white font-bold rounded-full px-5 py-2 text-base shadow border-0" @click="showDeleteDialog = false">Cancel</button>
        <button class="bg-gradient-to-r from-red-500 to-brand-secondary hover:from-red-600 hover:to-brand-secondary text-white font-bold rounded-full px-5 py-2 text-base shadow border-0" @click="deleteBookConfirmed">Move to Trash</button>
      </div>
    </div>
  </Dialog>
  <div v-if="showAICaptionOverlay" class="fixed top-0 left-0 w-full z-50 flex justify-center pointer-events-none">
    <div class="mt-4 px-3 py-2 sm:mt-6 sm:px-6 sm:py-3 rounded-2xl shadow-lg bg-white/70 text-brand-header text-base sm:text-lg font-caveat flex items-center gap-2 sm:gap-3 animate-magic-fade max-w-xs sm:max-w-md md:max-w-lg w-auto break-words">
      <i class="pi pi-sparkles text-yellow-400 text-xl sm:text-2xl animate-bounce flex-shrink-0"></i>
      <span class="italic truncate">The magic whispers:</span>
      <span class="font-bold break-words">"{{ lastAICaption }}"</span>
      <i class="pi pi-sparkles text-yellow-400 text-xl sm:text-2xl animate-bounce flex-shrink-0"></i>
    </div>
  </div>

  <!-- Error Dialog -->
  <Dialog v-model:visible="showErrorDialog" modal :closable="true" :dismissableMask="true" class="w-full max-w-md rounded-2xl">
    <div class="text-center py-6">
      <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="pi pi-exclamation-triangle text-2xl text-red-500"></i>
      </div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">Oops, I got a little confused!</h3>
      <p class="text-gray-600 mb-6">
        {{ errorDialogMessage || "Something went wrong while creating your memory card. Let's try again!" }}
      </p>
      <p class="text-gray-600 mb-6" v-if="errorDialogMessage && (errorDialogMessage.includes('timeout') || errorDialogMessage.includes('not accessible') || errorDialogMessage.includes('too large'))">
        <strong>Tips to fix this:</strong><br>
        • Try with smaller image files (under 10MB each)<br>
        • Check your internet connection<br>
        • Try with different photos<br>
        • Make sure your photos are in JPG, PNG, or GIF format
      </p>
      <p class="text-gray-600 mb-6" v-else>
        Please try a different description for your memory. For example, if your description mentioned a location and we couldn't find matching photos, try being more specific or using different keywords.
        You can change the location or upload a photo with this location.
      </p>
      
      <!-- Debug information (only show in development) -->
              <div v-if="$nuxt.dev && errorDialogMessage" class="mt-4 p-3 bg-gray-100 rounded-lg text-left">
        <p class="text-xs text-gray-600 mb-2"><strong>Debug Info:</strong></p>
        <p class="text-xs text-gray-600 font-mono break-all">{{ errorDialogMessage }}</p>
      </div>
      <div class="flex justify-center gap-3"> 
        <Button
          label="Try Again"
          icon="pi pi-refresh"
          @click="retryMagicMemory"
          class="bg-brand-dialog-edit text-white font-bold rounded-full px-6 py-2 shadow-lg transition-all duration-200 border-0"
        />
        <Button
          label="Close"
          @click="showErrorDialog = false"
          class="bg-brand-dialog-cancel text-white font-bold rounded-full px-6 py-2 shadow-lg transition-all duration-200 border-0"
        />
      </div>
    </div>
  </Dialog>

  <!-- File Error Dialog -->
  <Dialog
    v-model:visible="showFileErrorDialog"
    modal
    :closable="true"
    :dismissableMask="true"
    :class="[isMobile ? 'w-full h-full m-0 rounded-none' : 'w-full max-w-md rounded-2xl']"
    :style="isMobile ? { minHeight: '100vh', minWidth: '100vw', padding: 0 } : {}"
  >
    <div class="text-center py-6 flex flex-col items-center justify-center h-full">
      <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="pi pi-exclamation-triangle text-2xl text-red-500"></i>
      </div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">File Selection Error</h3>
      <p class="text-gray-600 mb-6">{{ fileErrorDialogMessage }}</p>
      <div class="flex justify-center gap-3">
        <Button
          label="Close"
          @click="showFileErrorDialog = false"
          class="bg-brand-dialog-cancel text-white font-bold rounded-full px-6 py-2 shadow-lg transition-all duration-200 border-0"
        />
      </div>
    </div>
  </Dialog>

  <!-- Upload Progress Dialog -->
  <Dialog
    v-model:visible="showUploadProgressDialog"
    modal
    :closable="false"
    :dismissableMask="false"
    class="w-full max-w-sm rounded-2xl magic-upload-dialog"
  >
    <div class="text-center py-8 px-6">
      <div class="w-20 h-20 bg-gradient-to-br from-brand-flash to-brand-highlight rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
        <i class="pi pi-upload text-3xl text-white"></i>
      </div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">🌸 Savta is working her magic! 🌸</h3>
      <p class="text-gray-600 mb-4">Uploading and captioning your precious memories...</p>
      
      <div class="bg-white rounded-lg p-4 mb-4 border-2 border-brand-flash/20">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-700">Progress</span>
          <span class="text-sm font-bold text-brand-flash">{{ magicUploadProgress.current }} of {{ magicUploadProgress.total }}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div 
            class="bg-gradient-to-r from-brand-flash to-brand-highlight h-3 rounded-full transition-all duration-500 ease-out"
            :style="{ width: magicUploadProgress.total > 0 ? `${(magicUploadProgress.current / magicUploadProgress.total) * 100}%` : '0%' }"
          ></div>
        </div>
        <p class="text-xs text-gray-500 truncate">{{ magicUploadProgress.filename }}</p>
      </div>
      
      <div class="flex items-center justify-center gap-2 text-brand-flash">
        <i class="pi pi-spin pi-spinner text-lg"></i>
        <span class="text-sm font-medium">Processing with love...</span>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useToast } from 'primevue/usetoast'
import { Sparkles, Sparkle, Wand2, Gift } from 'lucide-vue-next'
import MemoryBookDialog from '~/components/MemoryBookDialog.vue'
import CaptionRenderer from '~/components/CaptionRenderer.vue'
import PhotoSelectionInterface from '~/components/PhotoSelectionInterface.vue'
import { useAnalytics } from '~/composables/useAnalytics'
import { usePhotoSelection } from '~/composables/usePhotoSelection'
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


const db = useDatabase()
const route = useRoute()
// const supabase = useSupabaseClient()
// const user = useSupabaseUser()
const supabase = useNuxtApp().$supabase
const user = ref(null)

// Analytics tracking
const { trackEvent } = useAnalytics()

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
  printSize: '8.5x11',
  quality: 'standard',
  medium: 'digital',
  output: 'PDF', // Default to PDF
  theme_id: null,
  gridLayout: '2x2',
  memoryShape: 'original',
  includeCaptions: true,
  aiBackground: true,
  backgroundOpacity: 30,
  memoryEvent: '',
  customMemoryEvent: ''
})

// Create modal step state
const createStep = ref(1)

// Asset selection for new book
const selectedAssets = ref([])

// Create modal navigation functions
const nextStep = () => {
  if (createStep.value === 1) {
    // Make ai_supplemental_prompt optional - allow empty or whitespace-only values
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
    ai_supplemental_prompt: '',
    layoutType: 'grid',
    printSize: '8.5x11',
    quality: 'standard',
    medium: 'digital',
    output: 'PDF', // Default to PDF
    theme_id: null,
    gridLayout: '2x2',
    memoryShape: 'original',
    includeCaptions: true,
    aiBackground: true,
    backgroundOpacity: 30,
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

const outputOptions = ref([
  { label: 'PDF Document', value: 'PDF' },
  { label: 'JPG Image', value: 'JPG' }
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
const showUpdateDescriptionDialog = ref(false)
const newDescription = ref('')

// Error dialog state
const showErrorDialog = ref(false)
const errorDialogMessage = ref('')
const lastMagicMemoryConfig = ref(null)
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
    if (toast) {
      toast.add({
        severity: 'warn',
        summary: 'Book Still Processing',
        detail: 'Please wait for the current generation to complete before recreating',
        life: 6000
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

  // Check if this is a theme-based book that needs reprompting
  if (pendingBook.value.layout_type === 'theme') {
    // Show dialog to update description
            newDescription.value = pendingBook.value.ai_supplemental_prompt || ''
    showUpdateDescriptionDialog.value = true
    return // Exit early, will continue after dialog confirmation
  }

  // Continue with regeneration (for non-theme books or after description update)
  await continueRegeneration()
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
  showUpdateDescriptionDialog.value = false
  pendingBook.value = null
}

const confirmUpdateDescription = async () => {
  if (!newDescription.value.trim()) {
    if (toast) {
      toast.add({
        severity: 'warn',
        summary: 'Description Required',
        detail: 'Please provide a description for your memory.',
        life: 4000
      })
    }
    return
  }
  
  // Update the book title with the new description
  try {
    const supabase = useNuxtApp().$supabase
    const { error: updateError } = await supabase
      .from('memory_books')
              .update({ ai_supplemental_prompt: newDescription.value.trim() })
      .eq('id', pendingBook.value.id)
    
    if (updateError) {
      console.error('❌ Error updating book title:', updateError)
      if (toast) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update memory description',
          life: 4000
        })
      }
      return
    }
    
    // Update the pending book with the new title
            pendingBook.value.ai_supplemental_prompt = newDescription.value.trim()
    
    if (toast) {
      toast.add({
        severity: 'success',
        summary: 'Updated',
        detail: 'Memory description updated successfully',
        life: 3000
      })
    }
    
    // Close dialog and continue with regeneration
    showUpdateDescriptionDialog.value = false
    
    // Continue with the regeneration process
    await continueRegeneration()
  } catch (error) {
    console.error('❌ Error updating book title:', error)
    if (toast) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update memory description',
        life: 4000
      })
    }
  }
}

const continueRegeneration = async () => {
  // Use the Savta Recipe way for magic books
  if (pendingBook.value.ui === 'wizard') {
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
      if (toast) {
        toast.add({
          severity: 'info',
          summary: 'Regenerating Memory Book',
          detail: 'Your memory book is being regenerated with fresh settings.',
          life: 6000
        })
      }
      // Now trigger the full magic pipeline
      await generatePDF(pendingBook.value)
    } catch (error) {
      console.error('❌ Error resetting magic book for regeneration:', error)
      if (toast) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to reset magic book for regeneration',
          life: 8000
        })
      }
    }
  } else {
    // Traditional pipeline
    await generatePDF(pendingBook.value)
  }
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
    
    // Load thumbnails for regular memory books
    if (books && books.length > 0) {
      console.log('📚 All books:', books.map(b => ({ id: b.id, layout_type: b.layout_type, created_from_assets: b.created_from_assets })))
              const regularBooks = books.filter(book => !book.magic_story && book.created_from_assets && book.created_from_assets.length > 0)
      console.log('🖼️ Loading thumbnails for', regularBooks.length, 'regular memory books')
      
      for (const book of regularBooks) {
        await loadAssetThumbnails(book)
      }
    }
  } catch (error) {
    console.error('❌ Error loading memory books:', error)
    console.error('❌ Error stack:', error.stack)
    if (toast) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load memory books',
        life: 6000
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
  
  // Check for assets and memory books to determine what to show
  await checkAssets()
  
  // Get memory books count
  let memoryBooksCount = 0
  try {
    const books = await db.memoryBooks.getMemoryBooks()
    memoryBooksCount = books?.length || 0
    console.log(`📚 Found ${memoryBooksCount} memory books`)
  } catch (error) {
    console.error('❌ Error checking memory books:', error)
  }
  
  // Check for query parameters to auto-open dialogs
  console.log('[MEMORY-BOOKS] onMounted - route query params:', route.query)
  
  if (route.query.openDialog === 'quick') {
    console.log('[MEMORY-BOOKS] onMounted - checking photo count before opening wizard')
    // Check if user has enough photos before opening wizard
    try {
      const approvedAssets = await db.assets.getAssets({ approved: true })
      const photoCount = approvedAssets?.length || 0
      
      if (photoCount < 6) {
        console.log('[MEMORY-BOOKS] onMounted - user has', photoCount, 'photos, showing upload dialog first')
        // Show upload dialog with recommendation for 6+ photos
        setTimeout(() => {
          showUploadDialog.value = true
          // Set flag to open wizard after upload
          shouldOpenWizardAfterUpload.value = true
        }, 1000) // Increased delay to ensure DOM is ready
      } else {
        console.log('[MEMORY-BOOKS] onMounted - user has', photoCount, 'photos, opening wizard directly')
        // User has enough photos, open wizard directly
        setTimeout(() => {
          openMagicMemoryDialog('quick')
        }, 1000) // Increased delay to ensure DOM is ready
      }
    } catch (error) {
      console.error('[MEMORY-BOOKS] Error checking photo count:', error)
      // Fallback: open wizard directly if we can't check photo count
      setTimeout(() => {
        openMagicMemoryDialog('quick')
      }, 1000)
    }
  } else if (route.query.openUploadDialog === 'true') {
    console.log('[MEMORY-BOOKS] onMounted - opening upload dialog')
    // Small delay to ensure everything is loaded
    setTimeout(() => {
      showUploadDialog.value = true
    }, 500)
  } else {
    console.log('[MEMORY-BOOKS] onMounted - no dialog parameters found, checking state')
    
    // Auto-open appropriate dialog based on user state
    if (memoryBooksCount === 0) {
      // No memory books - check if user has assets
      if (approvedAssetsCount.value === 0) {
        console.log('[MEMORY-BOOKS] onMounted - no assets, no memory books, showing upload dialog')
        // No assets and no memory books - show upload dialog with special messaging
        setTimeout(() => {
          showUploadDialog.value = true
          // Set flags for special messaging and wizard after upload
          shouldOpenWizardAfterUpload.value = true
          showSpecialUploadMessaging.value = true
        }, 1000)
      } else {
        console.log('[MEMORY-BOOKS] onMounted - has assets, no memory books, opening wizard directly')
        // Has assets but no memory books - open wizard directly
        setTimeout(() => {
          openMagicMemoryDialog('quick')
        }, 1000)
      }
    } else {
      console.log('[MEMORY-BOOKS] onMounted - has memory books, showing normal page')
      // Has memory books - show normal page
    }
  }
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)
})

// Cleanup on unmount
onUnmounted(() => {
  stopProgressPolling()
  window.removeEventListener('resize', updateIsMobile)
})

// Create memory book
const createMemoryBook = async () => {
  console.log('🔧 [createMemoryBook] Called. newBook.value:', JSON.parse(JSON.stringify(newBook.value)))
  // Make ai_supplemental_prompt optional - use default if not provided
  if (!newBook.value.ai_supplemental_prompt || newBook.value.ai_supplemental_prompt.trim() === '') {
    newBook.value.ai_supplemental_prompt = 'Memory Book'
    console.log('🔧 [createMemoryBook] Using default prompt for memory book')
  }
  creatingBook.value = true
  try {
    // Use selected assets from dialog if any, otherwise get all approved assets
    let assetsToUse = [];
    if (newBook.value.selectedAssetIds && newBook.value.selectedAssetIds.length > 0) {
      assetsToUse = newBook.value.selectedAssetIds;
      console.log('🔧 [createMemoryBook] Using selected assets from dialog:', assetsToUse);
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
      if (toast) {
        toast.add({
          severity: 'warn',
          summary: 'No Assets',
          detail: 'No approved photos available for this memory card',
          life: 3000
        })
      }
      return
    }
    // Prepare data for API - follow same pattern as memory cards
    const bookData = {
              ai_supplemental_prompt: newBook.value.ai_supplemental_prompt,
      layout_type: newBook.value.layoutType,
      ui: newBook.value.ui || 'form',
      format: 'book', // Dialog creates books
      print_size: newBook.value.printSize,
      quality: newBook.value.quality,
      medium: newBook.value.medium,
      output: newBook.value.output || 'PDF', // Default to PDF
      theme_id: newBook.value.theme_id,
      grid_layout: newBook.value.gridLayout,
      memory_shape: 'original',
      include_captions: newBook.value.includeCaptions,
      ai_background: newBook.value.aiBackground,
      background_type: newBook.value.aiBackground ? 'magical' : 'white', // Set background_type based on ai_background
      background_opacity: newBook.value.backgroundOpacity || 30, // Set background opacity with default
      memory_event: newBook.value.memoryEvent === 'custom' ? newBook.value.customMemoryEvent : newBook.value.memoryEvent,
      // Set up photo selection pool - same pattern as memory cards
      photo_selection_pool: assetsToUse,
      created_from_assets: [], // Start empty, will be populated by photo selection
      photo_selection_method: 'photo_library', // Indicate this was manual selection
      status: 'draft'
    }
    console.log('🔧 [createMemoryBook] Calling db.memoryBooks.createMemoryBook with:', JSON.parse(JSON.stringify(bookData)))
    const memoryBook = await db.memoryBooks.createMemoryBook(bookData)
    console.log('🔧 [createMemoryBook] API call successful, response:', memoryBook)
    if (toast) {
      toast.add({
        severity: 'success',
        summary: 'Created',
        detail: 'Memory book created successfully',
        life: 3000
      })
    }
    newlyCreatedBook.value = memoryBook
    // Don't show success dialog for memory books - they auto-generate immediately
    resetCreateModal()
    await loadMemoryBooks()
  } catch (error) {
    console.error('❌ [createMemoryBook] Error creating memory book:', error)
    if (toast) {
      toast.add({
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

  // Add a small delay to ensure backend updates are committed
  await new Promise(resolve => setTimeout(resolve, 100))

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
        console.log('✅ PDF URL found and book status is ready, closing dialog and displaying PDF')
        currentProgress.value = 100
        currentProgressMessage.value = isRegenerating.value 
          ? 'Your special memory is ready!' 
          : 'Your memory book is ready!'
        setTimeout(async () => {
          stopProgressPolling()
          showProgressDialog.value = false
          await loadMemoryBooks() // Reload to show updated status
          
          // Display the PDF in the viewer
          try {
            const cacheBuster = `cb=${Date.now()}`;
            const pdfUrlWithBuster = status.pdf_url.includes('?')
              ? `${status.pdf_url}&${cacheBuster}`
              : `${status.pdf_url}?${cacheBuster}`;
            await viewPDF(pdfUrlWithBuster, currentBookId.value)
          } catch (error) {
            console.error('Error displaying PDF:', error)
          }
        }, 2000) // Reduced wait time since we're displaying the PDF
        return
      }
      
      // Check if pdf_url is available but still wait for completion status
      if (status.pdf_url && status.pdf_url.startsWith('https://')) {
        console.log('✅ PDF URL found, waiting for book status to be ready...')
        console.log('🔍 Debug - Current status:', {
          pdf_url: status.pdf_url,
          book_status: status.book_status,
          pdf_status: status.pdf_status
        })
        currentProgress.value = 95
        currentProgressMessage.value = 'Finalizing magic memory status...'
        return
      }
      
      // Add fallback: if we have a PDF URL but status is not ready, close after a reasonable timeout
      if (status.pdf_url && status.pdf_url.startsWith('https://') && status.book_status !== 'ready') {
        console.log('⚠️ PDF URL found but book status is not ready, closing dialog anyway')
        console.log('🔍 Debug - Status details:', {
          pdf_url: status.pdf_url,
          book_status: status.book_status,
          pdf_status: status.pdf_status
        })
        currentProgress.value = 100
        currentProgressMessage.value = isRegenerating.value 
          ? 'Your special memory is ready!' 
          : 'Your memory book is ready!'
        setTimeout(async () => {
          stopProgressPolling()
          showProgressDialog.value = false
          await loadMemoryBooks() // Reload to show updated status
          
          // Display the PDF in the viewer
          try {
            const cacheBuster = `cb=${Date.now()}`;
            const pdfUrlWithBuster = status.pdf_url.includes('?')
              ? `${status.pdf_url}&${cacheBuster}`
              : `${status.pdf_url}?${cacheBuster}`;
            await viewPDF(pdfUrlWithBuster, currentBookId.value)
          } catch (error) {
            console.error('Error displaying PDF:', error)
          }
        }, 2000) // Shorter timeout for this fallback case
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
        currentProgressMessage.value = 'Adding the final special touches...'
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
        }, 4000) // Wait 4 seconds to give system time to save the generated PDF
      } else if (status.pdf_status === 'not_started') {
        currentProgress.value = 5
        currentProgressMessage.value = 'Gathering special ingredients...'
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
                    } else if (status.pdf_status === '🤔 Processing with AI...') {
        currentProgress.value = 8
        currentProgressMessage.value = '🤔 Processing with AI...'
      } else if (status.pdf_status && status.pdf_status.startsWith('🎯 PHOTO SELECTION')) {
        currentProgress.value = 15
        currentProgressMessage.value = status.pdf_status
      } else if (status.pdf_status && status.pdf_status.startsWith('📝 STORY GENERATION')) {
        currentProgress.value = 25
        currentProgressMessage.value = status.pdf_status
      } else if (status.pdf_status && status.pdf_status.startsWith('🎨 BACKGROUND GENERATION')) {
        currentProgress.value = 35
        currentProgressMessage.value = status.pdf_status
      } else if (status.pdf_status && status.pdf_status.startsWith('📸 ASSET FETCHING')) {
        currentProgress.value = 45
        currentProgressMessage.value = status.pdf_status
      } else if (status.pdf_status && status.pdf_status.startsWith('🎨 BACKGROUND PROCESSING')) {
        currentProgress.value = 55
        currentProgressMessage.value = status.pdf_status
      } else if (status.pdf_status && status.pdf_status.startsWith('📄 PDF CREATION')) {
        currentProgress.value = 65
        currentProgressMessage.value = status.pdf_status
      } else if (status.pdf_status && status.pdf_status.startsWith('🎯 Selecting best photos')) {
        currentProgress.value = 15
        currentProgressMessage.value = status.pdf_status
      } else if (status.pdf_status && status.pdf_status.startsWith('📖 Generating story')) {
        currentProgress.value = 25
        currentProgressMessage.value = status.pdf_status
      } else if (status.pdf_status && status.pdf_status.startsWith('🎯 Processing photos for layout')) {
        currentProgress.value = 30
        currentProgressMessage.value = status.pdf_status
      } else if (status.pdf_status === 'Gathering your special memories...') {
        currentProgress.value = 12
        currentProgressMessage.value = 'Gathering your special memories...'
              } else if (status.pdf_status === 'Retrieving special background...') {
        currentProgress.value = 18
        currentProgressMessage.value = 'Retrieving background...'
      } else if (status.pdf_status === 'Retrieving background image...') {
        currentProgress.value = 18
        currentProgressMessage.value = 'Retrieving background image...'
              } else if (status.pdf_status === 'Creating special background...') {
        currentProgress.value = 22
        currentProgressMessage.value = 'Creating background...'
      } else if (status.pdf_status === 'Weaving your memories into pages...') {
        currentProgress.value = 55
        currentProgressMessage.value = 'Weaving your memories into pages...'
      } else if (status.pdf_status && status.pdf_status.startsWith('👥 Cropping photo')) {
        // Extract photo number and total from status message
        const match = status.pdf_status.match(/👥 Cropping photo (\d+) of (\d+)\.\.\./)
        if (match) {
          const currentPhoto = parseInt(match[1])
          const totalPhotos = parseInt(match[2])
          // Calculate progress: 60% base + up to 20% for photo processing
          const photoProgress = (currentPhoto / totalPhotos) * 20
          currentProgress.value = 60 + photoProgress
          currentProgressMessage.value = status.pdf_status
        } else {
          currentProgress.value = 70
          currentProgressMessage.value = status.pdf_status
        }
      } else if (status.pdf_status === '📄 Creating PDF...') {
        currentProgress.value = 80
        currentProgressMessage.value = '📄 Creating PDF...'
      } else if (status.pdf_status === 'Adding the final special touches...') {
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
            ? 'Preparing your recipe...' 
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

// Trigger an immediate poll of PDF status
const triggerPdfStatusPoll = () => {
  if (currentBookId.value && showProgressDialog.value) {
    console.log('Triggering immediate PDF status poll')
    pollPdfStatus()
  }
}

// Generate PDF
const generatePDF = async (book) => {
  console.log('generatePDF called for book:', book.id)
  
  // Check if the book has assets
  // Always check created_from_assets for regeneration (both theme-based and regular memories)
  const hasAssets = book.created_from_assets && book.created_from_assets.length > 0
  
  if (!hasAssets) {
    console.error('❌ Cannot generate PDF: No assets found in memory book')
    console.log('Book layout type:', book.layout_type)
    console.log('Photo selection pool:', book.photo_selection_pool)
    console.log('Created from assets:', book.created_from_assets)
    if (toast) {
      toast.add({
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
    
    // Set initial status immediately to avoid showing old status
    currentProgressMessage.value = '🚀 Getting started...'
    
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
        
        // If this is a book with a story, ensure we preserve the story
        if (book.magic_story) {
          console.log('✨ Preserving story-based memory layout and story for regeneration')
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

    const printSize = latestBook.print_size || '8.5x11'
    
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
    
    if (toast) {
      toast.add({
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
  
  // No success dialog to close for memory books
  
  // Find the book in the current memory books list
  const book = memoryBooks.value.find(b => b.id === newlyCreatedBook.value.id)
  if (!book) {
    console.error('Could not find newly created book in memory books list')
    return
  }
  
  // Follow the same flow as memory cards: photo selection -> PDF generation
  try {
    // Set the book ID first, then start progress polling
    currentBookId.value = book.id
    isRegenerating.value = false
    startProgressPolling(book.id, false)
    
    // Step 1: Photo Selection (if needed)
    if (!book.created_from_assets || book.created_from_assets.length === 0) {
      console.log('🔧 [composeNewlyCreatedMemory] Setting up photo selection...')
      currentProgressMessage.value = '🎯 Setting up your selected photos...'
      
      // For memory books, we use manual photo selection (photo_library)
      // The photos are already in photo_selection_pool, we just need to populate created_from_assets
      if (book.photo_selection_pool && book.photo_selection_pool.length > 0) {
        // Update the book to set created_from_assets from photo_selection_pool
        const supabase = useNuxtApp().$supabase
        await supabase
          .from('memory_books')
          .update({ 
            created_from_assets: book.photo_selection_pool,
            ai_photo_selection_reasoning: `You manually selected ${book.photo_selection_pool.length} photos for this memory book.`
          })
          .eq('id', book.id)
        
        console.log('🔧 [composeNewlyCreatedMemory] Photo selection completed - using manually selected photos')
      } else {
        throw new Error('No photos available for memory book')
      }
    }
    
    // Step 2: PDF Generation (includes story generation)
    console.log('🔧 [composeNewlyCreatedMemory] Starting PDF generation...')
    currentProgressMessage.value = '📝 Generating story and creating your memory...'
    
    // Fetch the latest book data to ensure we have the updated created_from_assets
    const supabase = useNuxtApp().$supabase
    const { data: latestBook, error: bookError } = await supabase
      .from('memory_books')
      .select('*')
      .eq('id', book.id)
      .single()
    
    if (bookError || !latestBook) {
      throw new Error('Failed to fetch updated book data')
    }
    
    await generatePDF(latestBook)
    
  } catch (error) {
    console.error('❌ [composeNewlyCreatedMemory] Error:', error)
    stopProgressPolling()
    showProgressDialog.value = false
    
    if (toast) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to create memory book',
        life: 3000
      })
    }
  } finally {
    // Clear the reference
    newlyCreatedBook.value = null
  }
}

// Download PDF
const downloadPDF = async (book) => {
  try {
    // Track download attempt
    trackEvent('memory_book_download_attempt', {
      book_id: book.id,
      book_title: book.ai_supplemental_prompt || 'Unknown',
      component: 'MemoryBooksIndex'
    })

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
    
    // Track successful download
    trackEvent('memory_book_download_success', {
      book_id: book.id,
      book_title: book.ai_supplemental_prompt || 'Unknown',
      component: 'MemoryBooksIndex',
      download_url: response.downloadUrl
    })
  } catch (error) {
    console.error('Error downloading PDF:', error)
    // Track failed download
    trackEvent('memory_book_download_failed', {
      book_id: book.id,
      book_title: book.ai_supplemental_prompt || 'Unknown',
      component: 'MemoryBooksIndex',
      error: error.message
    })
    if (toast) {
      toast.add({
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
    // Track force download attempt
    trackEvent('memory_book_force_download_attempt', {
      book_id: book.id,
      book_title: book.ai_supplemental_prompt || 'Unknown',
      component: 'MemoryBooksIndex'
    })

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
            link.download = `${latestBook.ai_supplemental_prompt || 'Memory Book'}.pdf`
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
    
    // Track successful force download
    trackEvent('memory_book_force_download_success', {
      book_id: book.id,
      book_title: book.ai_supplemental_prompt || 'Unknown',
      component: 'MemoryBooksIndex',
      download_url: response.downloadUrl
    })
    
    if (toast) {
      toast.add({
        severity: 'success',
        summary: 'Download Started',
        detail: 'Your memory card PDF is being downloaded',
        life: 3000
      })
    }
  } catch (error) {
    console.error('Error downloading PDF:', error)
    // Track failed force download
    trackEvent('memory_book_force_download_failed', {
      book_id: book.id,
      book_title: book.ai_supplemental_prompt || 'Unknown',
      component: 'MemoryBooksIndex',
      error: error.message
    })
    if (toast) {
      toast.add({
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
  // Show approval dialog first
  pendingApprovalBookId.value = bookId
  showApprovalDialog.value = true
}

// Confirm approval after dialog
const confirmApproval = async () => {
  const bookId = pendingApprovalBookId.value
  showApprovalDialog.value = false
  pendingApprovalBookId.value = null
  
  try {
    await db.memoryBooks.updateMemoryBook(bookId, {
      status: 'approved',
      approved_at: new Date().toISOString()
    })

    if (toast) {
      toast.add({
        severity: 'success',
        summary: 'Approved',
        detail: 'Memory card approved',
        life: 3000
      })
    }

    // Reload memory books
    await loadMemoryBooks()

  } catch (error) {
    console.error('Error approving book:', error)
    if (toast) {
      toast.add({
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

    if (toast) {
      toast.add({
        severity: 'success',
        summary: 'Unapproved',
        detail: 'Special memory unapproved',
        life: 3000
      })
    }

    // Reload memory books and close modal
    await loadMemoryBooks()
    showDetailsModal.value = false

  } catch (error) {
    console.error('Error unapproving book:', error)
    if (toast) {
      toast.add({
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
            link.download = `${selectedBook.value?.ai_supplemental_prompt || 'Memory Book'}.pdf`;
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
  // Track share attempt
  trackEvent('memory_book_share_attempt', {
    book_id: selectedBook.value?.id,
    book_title: selectedBook.value?.ai_supplemental_prompt || 'Unknown',
    component: 'MemoryBooksIndex'
  })

  if (pdfBlobUrl.value && process.client && navigator?.share) {
    try {
      // Fetch the PDF as a blob
      const response = await fetch(pdfBlobUrl.value);
      const blob = await response.blob();
      
      // Create a file from the blob
              const file = new File([blob], `${selectedBook.value?.ai_supplemental_prompt || 'Memory Book'}.pdf`, {
        type: 'application/pdf'
      });
      
      // Share the file
      await navigator.share({
                  title: selectedBook.value?.ai_supplemental_prompt || 'Memory Book',
        text: 'Check out this memory book!',
        files: [file]
      });
      
      // Track successful share
      trackEvent('memory_book_share_success', {
        book_id: selectedBook.value?.id,
        book_title: selectedBook.value?.ai_supplemental_prompt || 'Unknown',
        component: 'MemoryBooksIndex',
        share_method: 'web_share_api'
      });
    } catch (error) {
      console.error('Error sharing PDF:', error);
      // Track failed share
      trackEvent('memory_book_share_failed', {
        book_id: selectedBook.value?.id,
        book_title: selectedBook.value?.ai_supplemental_prompt || 'Unknown',
        component: 'MemoryBooksIndex',
        error: error.name || 'unknown'
      });
      // Fallback to download if sharing fails
      downloadCurrentPdf();
    }
  } else {
    // Track fallback to download
    trackEvent('memory_book_share_fallback', {
      book_id: selectedBook.value?.id,
      book_title: selectedBook.value?.ai_supplemental_prompt || 'Unknown',
      component: 'MemoryBooksIndex',
      fallback_method: 'download'
    });
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
    'distributed': 'bg-brand-navigation text-brand-secondary border border-brand-highlight',
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

// Get first asset thumbnail for regular memory book
const getFirstAssetThumbnail = (book) => {
          if (!book.magic_story && book.created_from_assets && book.created_from_assets.length > 0) {
    const firstAssetId = book.created_from_assets[0]
    const thumbnail = getAssetThumbnail(firstAssetId)
    console.log('🖼️ Getting thumbnail for book:', book.id, 'first asset:', firstAssetId, 'thumbnail:', thumbnail)
    return thumbnail
  }
          console.log('🖼️ No thumbnail for book:', book.id, 'magic_story:', book.magic_story, 'created_from_assets:', book.created_from_assets)
  return null
}

// Load asset thumbnails for a book
const loadAssetThumbnails = async (book) => {
  if (!book || !book.created_from_assets || book.created_from_assets.length === 0) {
    console.log('🖼️ No assets to load for book:', book?.id, 'created_from_assets:', book?.created_from_assets)
    return
  }
  
  try {
    console.log('🖼️ Loading thumbnails for book:', book.id, 'assets:', book.created_from_assets)
    // Get assets for this book using the dedicated function
    const bookAssets = await db.assets.getAssetsByBook(book.created_from_assets, 12)
    console.log('🖼️ Retrieved assets:', bookAssets)
    
    // Store thumbnails in reactive data
    if (bookAssets && Array.isArray(bookAssets)) {
      bookAssets.forEach(asset => {
        if (asset && asset.storage_url) {
          console.log('🖼️ Storing thumbnail for asset:', asset.id, 'URL:', asset.storage_url)
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

// File type helper functions
const getFileTypeDisplay = (book) => {
  if (!book) return 'PDF'
  return book.output === 'JPG' ? 'JPG' : 'PDF'
}

const getFileTypeIcon = (book) => {
  if (!book) return 'pi pi-file-pdf'
  return book.output === 'JPG' ? 'pi pi-image' : 'pi pi-file-pdf'
}

const getFileTypeColor = (book) => {
  if (!book) return 'text-brand-primary'
  return book.output === 'JPG' ? 'text-brand-accent' : 'text-brand-primary'
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
              ai_supplemental_prompt: book.ai_supplemental_prompt,
              layoutType: book.layout_type || book.layoutType || 'grid',
        ui: book.ui || 'form',
      printSize: book.print_size || book.printSize || '8.5x11',
      quality: book.quality || 'standard',
      medium: book.medium || 'digital',
              theme_id: book.theme_id || null,
      gridLayout: book.grid_layout || '2x2',
      memoryShape: book.memory_shape || 'original',
      includeCaptions: book.include_captions ?? book.includeCaptions ?? true,

      aiBackground: book.ai_background ?? book.aiBackground ?? true,
      backgroundOpacity: book.background_opacity ?? 30,
      memoryEvent: book.memory_event || book.memoryEvent || '',
      customMemoryEvent: (book.memory_event && !['vacation','birthday','anniversary','graduation','family_trip'].includes((book.memory_event || '').toLowerCase())) ? book.memory_event : '',
      created_from_assets: book.created_from_assets || [],
      selectedAssetObjects: selectedAssetObjects
    }
    showEditSettingsModal.value = true
  } catch (error) {
    console.error('Error loading assets for edit:', error)
    if (toast) {
      toast.add({
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
      ai_supplemental_prompt: editBook.value.ai_supplemental_prompt,
              layout_type: editBook.value.layoutType,
        ui: editBook.value.ui || 'form',
      print_size: editBook.value.printSize,
      quality: editBook.value.quality,
      medium: editBook.value.medium,
              theme_id: editBook.value.theme_id,
      grid_layout: editBook.value.gridLayout,
      memory_shape: editBook.value.memoryShape || 'original',
      include_captions: editBook.value.includeCaptions,
      ai_background: editBook.value.aiBackground,
      background_opacity: editBook.value.backgroundOpacity,
      background_type: editBook.value.aiBackground ? 'magical' : 'white',

      created_from_assets: selectedAssetIds
    })
    
    showEditSettingsModal.value = false
    if (toast) {
      toast.add({
        severity: 'success',
        summary: 'Updated',
        detail: 'Memory book settings and assets updated',
        life: 3000
      })
    }
    await loadMemoryBooks()
  } catch (error) {
    console.error('Error updating memory book:', error)
    if (toast) {
      toast.add({
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

// Computed properties for available location options
const computedAvailableCountries = computed(() => {
  const allCountries = new Set()
  availableAssets.value.forEach(asset => {
    if (asset.country && asset.country.trim()) {
      allCountries.add(asset.country.trim())
    }
  })
  return Array.from(allCountries).sort().map(country => ({ label: country, value: country }))
})

const computedAvailableStates = computed(() => {
  const allStates = new Set()
  availableAssets.value.forEach(asset => {
    if (asset.state && asset.state.trim()) {
      allStates.add(asset.state.trim())
    }
  })
  return Array.from(allStates).sort().map(state => ({ label: state, value: state }))
})

const computedAvailableCities = computed(() => {
  const allCities = new Set()
  availableAssets.value.forEach(asset => {
    if (asset.city && asset.city.trim()) {
      allCities.add(asset.city.trim())
    }
  })
  return Array.from(allCities).sort().map(city => ({ label: city, value: city }))
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
    if (toast) {
      toast.add({
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
  if (toast) {
    toast.add({
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
    
    if (toast) {
      toast.add({
        severity: 'success',
        summary: 'Cleaned Up!',
        detail: 'We have cleaned up your memory card so you can create a new one!',
        life: 4000
      })
    }
    
    showEditSettingsModal.value = false
    await loadMemoryBooks()
  } catch (err) {
    console.error('Error cleaning up book:', err)
    if (toast) {
      toast.add({
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
    toast.add({
      severity: 'success',
      summary: 'Book Reset',
      detail: 'Book status reset to draft and cleared background/PDF.',
      life: 2000
    })
    showEditSettingsModal.value = false
    await loadMemoryBooks()
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to reset book.',
      life: 3000
    })
  }
}

const showInfoDialog = ref(false)
const showApprovalDialog = ref(false)
const pendingApprovalBookId = ref(null)

// import PdfViewer from '~/components/PdfViewer.vue'
import { defineAsyncComponent } from 'vue'
const PdfViewer = defineAsyncComponent(() => import('~/components/PdfViewer.vue'))

const showMagicMemoryDialog = ref(false)

// Step identifiers for better code readability
const MAGIC_STEPS = {
  TITLE: 'title',
  EVENT: 'event', 
  COUNT: 'count',
  BACKGROUND: 'background',
  THEME: 'theme',
  PHOTOS: 'photos',
  MANUAL: 'manual'
}

// Photo pool size constant for easy configuration
const PHOTO_POOL_SIZE = 100

// Step definitions with required/optional flags
const stepDefinitions = {
  [MAGIC_STEPS.TITLE]: { name: "Title Input", required: true },
  [MAGIC_STEPS.THEME]: { name: "Theme Selection", required: false },
  [MAGIC_STEPS.BACKGROUND]: { name: "Background Selection", required: true },
  [MAGIC_STEPS.PHOTOS]: { name: "Photo Selection Method", required: true },
  [MAGIC_STEPS.MANUAL]: { name: "Photo Selection", required: true }
}

// Button configurations defining which steps to include
const buttonConfigs = {
  full: { steps: [MAGIC_STEPS.TITLE, MAGIC_STEPS.THEME, MAGIC_STEPS.BACKGROUND, MAGIC_STEPS.PHOTOS], name: "Full Magic Memory" },
  basic: { steps: [MAGIC_STEPS.TITLE, MAGIC_STEPS.THEME, MAGIC_STEPS.BACKGROUND, MAGIC_STEPS.PHOTOS], name: "Basic Magic Memory" },
  quick: { steps: [MAGIC_STEPS.TITLE, MAGIC_STEPS.THEME, MAGIC_STEPS.BACKGROUND, MAGIC_STEPS.PHOTOS], name: "Quick Magic Memory" }
}

// Current magic memory dialog state
const magicMemoryStep = ref(MAGIC_STEPS.TITLE) // Current step within the button's sequence
const currentButtonConfig = ref(null) // Current button configuration being used
const currentStepIndex = ref(0) // Index within the button's steps array
const magicMemoryTitle = ref('')
const magicMemoryEvent = ref('')
const magicPhotoCount = ref(4) // Default to 4 photos
const magicBackgroundType = ref('white') // 'white', 'magical', or 'solid'
const magicSolidBackgroundColor = ref('#F9F6F2') // Default warm cream color
const magicSelectedTheme = ref(null) // Selected theme ID
const magicThemeOptions = ref([]) // Available themes
const loadingMagicThemes = ref(false) // Loading state for themes

// Photo selection method variables
const magicPhotoSelectionMethod = ref('')
const magicDateRange = ref({ start: null, end: null })
const magicSelectedTags = ref([])

// Location selection variables
const magicLocationType = ref('country')
const magicSelectedLocation = ref('')
const availableCountries = ref([])
const availableStates = ref([])
const availableCities = ref([])

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

// Refs for components
const photoSelectionInterfaceRef = ref(null)

// Use the photo selection composable directly
const {
  photoSelection_method,
  photoSelection_dateRange,
  photoSelection_selectedTags,
  photoSelection_selectedTagFilter,
  photoSelection_locationType,
  photoSelection_selectedLocation,
  photoSelection_availableCountries,
  photoSelection_availableStates,
  photoSelection_availableCities,
  photoSelection_selectedMemories,
  photoSelection_availableAssets,
  photoSelection_loadingAssets,
  photoSelection_isUploading,
  photoSelection_showUploadDialog,
  photoSelection_options,
  photoSelection_computedAvailableTags,
  photoSelection_filteredAssets,
  photoSelection_loadAvailableAssets,
  photoSelection_loadLocationData,
  photoSelection_toggleMemorySelection,
  photoSelection_populatePhotoSelectionPool,
  photoSelection_resetSelection,
  photoSelection_getSelectedAssets
} = usePhotoSelection()

// Function to fetch themes for wizard dialog
const fetchMagicThemes = async () => {
  try {
    loadingMagicThemes.value = true
    const { data, error } = await supabase
      .from('themes')
      .select('id, name, description, preview_image_url, is_active, background_color, background_opacity, header_font, body_font, signature_font, header_font_color, body_font_color, signature_font_color, layout_config, rounded, size, card_default, card_wizard, created_at, updated_at')
      .eq('is_active', true)
      .eq('deleted', false)
      .eq('card_wizard', true) // Only show themes that are enabled for wizard
      .order('name')
    
    if (error) {
      console.error('Error fetching themes for wizard:', error)
      return
    }
    
    // Transform themes for dropdown and find default theme
    let defaultThemeId = null
    magicThemeOptions.value = data.map(theme => {
      let photoCount = 0
      try {
        const layoutConfig = typeof theme.layout_config === 'string' 
          ? JSON.parse(theme.layout_config) 
          : theme.layout_config
        
        if (layoutConfig && layoutConfig.photos && Array.isArray(layoutConfig.photos)) {
          photoCount = layoutConfig.photos.length
        }
      } catch (error) {
        console.error('Error parsing theme layout config:', error)
      }
      
      // Track the default theme
      if (theme.card_default) {
        defaultThemeId = theme.id
      }
      
      return {
        label: photoCount > 0 ? `${theme.name} (${photoCount} photos)` : theme.name,
        value: theme.id,
        description: theme.description,
        preview_image_url: theme.preview_image_url,
        is_active: theme.is_active,
        background_color: theme.background_color,
        background_opacity: theme.background_opacity,
        header_font: theme.header_font,
        body_font: theme.body_font,
        signature_font: theme.signature_font,
        header_font_color: theme.header_font_color,
        body_font_color: theme.body_font_color,
        signature_font_color: theme.signature_font_color,
        layoutConfig: theme.layout_config,
        rounded: theme.rounded,
        size: theme.size,
        photoCount: photoCount,
        card_default: theme.card_default,
        card_wizard: theme.card_wizard,
        created_at: theme.created_at,
        updated_at: theme.updated_at
      }
    })
    
    // Set the default theme if no theme is currently selected
    if (!magicSelectedTheme.value && defaultThemeId) {
      magicSelectedTheme.value = defaultThemeId
      console.log('[MAGIC-MEMORY] Auto-selected default theme:', defaultThemeId)
    }
    
    console.log('[MAGIC-MEMORY] Fetched themes for wizard:', magicThemeOptions.value)
  } catch (error) {
    console.error('Error fetching themes for wizard:', error)
  } finally {
    loadingMagicThemes.value = false
  }
}

// Helper function to determine text color based on background color
const getContrastTextClass = (backgroundColor) => {
  if (!backgroundColor) return 'text-gray-900'
  
  // Convert hex to RGB
  const hex = backgroundColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  // Return appropriate text class based on luminance
  return luminance > 0.5 ? 'text-gray-900' : 'text-white'
}

// Computed property to get the default theme name
const defaultThemeName = computed(() => {
  const defaultTheme = magicThemeOptions.value.find(theme => theme.card_default)
  return defaultTheme ? defaultTheme.label.split(' (')[0] : null // Extract just the name without photo count
})

// Computed property to get the selected theme's background color
const selectedThemeBackgroundColor = computed(() => {
  if (!magicSelectedTheme.value) {
    console.log('🔍 [selectedThemeBackgroundColor] No theme selected, using default:', '#F9F6F2')
    return '#F9F6F2' // Default fallback color
  }
  
  const selectedTheme = magicThemeOptions.value.find(theme => theme.value === magicSelectedTheme.value)
  if (!selectedTheme) {
    console.log('🔍 [selectedThemeBackgroundColor] Theme not found, using default:', '#F9F6F2')
    return '#F9F6F2'
  }
  
      console.log('🔍 [selectedThemeBackgroundColor] Selected theme:', selectedTheme.label)
    console.log('🔍 [selectedThemeBackgroundColor] Theme layoutConfig:', selectedTheme.layoutConfig)
    console.log('🔍 [selectedThemeBackgroundColor] Full theme object:', selectedTheme)
  
  // Get background color directly from the theme
  console.log('🔍 [selectedThemeBackgroundColor] Theme background_color field:', selectedTheme.background_color)
  
  let backgroundColor = selectedTheme.background_color || '#F9F6F2'
  
  // Ensure the color has a # prefix
  if (backgroundColor && !backgroundColor.startsWith('#')) {
    backgroundColor = '#' + backgroundColor
    console.log('🔍 [selectedThemeBackgroundColor] Added # prefix:', backgroundColor)
  }
  
  console.log('🔍 [selectedThemeBackgroundColor] Final background color:', backgroundColor)
  return backgroundColor
})

// Watch for magic memory step changes to handle Step 5 redirect
watch(magicMemoryStep, (newStep) => {
  if (newStep === MAGIC_STEPS.PHOTOS && photoSelection_availableAssets.value.length === 0) {
    // User has no photos, redirect to upload dialog
    showMagicMemoryDialog.value = false
    showUploadDialog.value = true
  }
  
  // Set background type to solid and initialize color when entering background step
  if (newStep === MAGIC_STEPS.BACKGROUND) {
    console.log('🔍 [magicMemoryStep watcher] Entering BACKGROUND step')
    console.log('🔍 [magicMemoryStep watcher] Current magicSolidBackgroundColor:', magicSolidBackgroundColor.value)
    console.log('🔍 [magicMemoryStep watcher] selectedThemeBackgroundColor.value:', selectedThemeBackgroundColor.value)
    
    magicBackgroundType.value = 'solid'
    // Set the color picker to the theme's background color if no color is set yet
    if (!magicSolidBackgroundColor.value || magicSolidBackgroundColor.value === '#F9F6F2') {
      console.log('🔍 [magicMemoryStep watcher] Setting color picker to theme color:', selectedThemeBackgroundColor.value)
      magicSolidBackgroundColor.value = selectedThemeBackgroundColor.value
    } else {
      console.log('🔍 [magicMemoryStep watcher] Keeping existing color picker value:', magicSolidBackgroundColor.value)
    }
  }
})

// Watch for theme changes to update the background color
watch(magicSelectedTheme, (newThemeId) => {
  console.log('🔍 [magicSelectedTheme watcher] Theme changed to:', newThemeId)
  console.log('🔍 [magicSelectedTheme watcher] Current step:', magicMemoryStep.value)
  console.log('🔍 [magicSelectedTheme watcher] selectedThemeBackgroundColor.value:', selectedThemeBackgroundColor.value)
  
  if (magicMemoryStep.value === MAGIC_STEPS.BACKGROUND) {
    console.log('🔍 [magicSelectedTheme watcher] On BACKGROUND step, updating color picker to:', selectedThemeBackgroundColor.value)
    // Update the color picker to the new theme's background color
    magicSolidBackgroundColor.value = selectedThemeBackgroundColor.value
  } else {
    console.log('🔍 [magicSelectedTheme watcher] Not on BACKGROUND step, skipping color update')
  }
})



async function onMagicMemoryContinue() {
  // If we're on the manual step and no photos are selected, don't proceed
  if (magicMemoryStep.value === MAGIC_STEPS.MANUAL && photoSelection_method.value === 'photo_library' && photoSelection_selectedMemories.value.length < 1) {
    return
  }
  
  // Validate photo availability for the selected method before proceeding
  console.log('🔍 [onMagicMemoryContinue] Validating photo selection...')
  if (photoSelectionInterfaceRef.value && typeof photoSelectionInterfaceRef.value.validatePhotoSelection === 'function') {
    console.log('🔍 [onMagicMemoryContinue] Calling validatePhotoSelection...')
    const isValid = photoSelectionInterfaceRef.value.validatePhotoSelection()
    console.log('🔍 [onMagicMemoryContinue] Validation result:', isValid)
    if (!isValid) {
      console.log('🔍 [onMagicMemoryContinue] Validation failed, stopping...')
      return // Don't proceed if validation fails (error message already shown)
    }
  } else {
    console.log('🔍 [onMagicMemoryContinue] No validation function available')
  }
  
  // Close the magic wizard dialog immediately
  showMagicMemoryDialog.value = false
  
  magicLoading.value = true
  
  // Show initial status dialog for story generation
  showProgressDialog.value = true
  isRegenerating.value = false
  
  try {
    // Get photo selection pool based on user's choice
    console.log('🔍 [onMagicMemoryContinue] About to call photoSelection_populatePhotoSelectionPool')
    console.log('🔍 [onMagicMemoryContinue] photoSelection_availableAssets count:', photoSelection_availableAssets.value?.length || 0)
    const photoSelectionPool = photoSelection_populatePhotoSelectionPool()
    console.log('🔍 [onMagicMemoryContinue] Photo selection pool count:', photoSelectionPool.length)
    console.log('🔍 [onMagicMemoryContinue] Photo selection pool IDs:', photoSelectionPool)
    
    let selectedAssets
    
    if (magicMemoryStep.value === MAGIC_STEPS.MANUAL && photoSelection_method.value === 'photo_library') {
      // For photo library selection, use the selected memories
      selectedAssets = photoSelection_availableAssets.value.filter(a => photoSelection_selectedMemories.value.includes(a.id))
      console.log('🔍 [onMagicMemoryContinue] Photo library selection - selected assets count:', selectedAssets.length)
    } else {
      // For automatic selection, ensure we have all the assets from the photo selection pool
      // If availableAssets doesn't contain all the assets we need, reload them
      const missingAssetIds = photoSelectionPool.filter(id => !photoSelection_availableAssets.value.some(a => a.id === id))
      if (missingAssetIds.length > 0) {
        console.log('🔍 [onMagicMemoryContinue] Missing assets in photoSelection_availableAssets, reloading...')
        const allApprovedAssets = await db.assets.getAssets({ approved: true })
        photoSelection_availableAssets.value = allApprovedAssets || []
      }
      
      selectedAssets = photoSelection_availableAssets.value.filter(a => photoSelectionPool.includes(a.id))
      console.log('🔍 [onMagicMemoryContinue] Automatic selection - selected assets count:', selectedAssets.length)
      console.log('🔍 [onMagicMemoryContinue] Automatic selection - selected asset IDs:', selectedAssets.map(a => a.id))
    }
    const photos = selectedAssets.map(a => ({
      id: a.id,
      storage_url: a.storage_url || a.asset_url || a.url,
      ai_caption: a.ai_caption || '',
      people_detected: a.people_detected || [],
      tags: a.tags || [],
      user_tags: a.user_tags || [],
      city: a.city || null,
      state: a.state || null,
      country: a.country || null,
      zip_code: a.zip_code || null,
      width: a.width || null,
      height: a.height || null,
      orientation: a.orientation || 'unknown',
      asset_date: a.asset_date || null,
      fingerprint: a.fingerprint || null,
      created_at: a.created_at || null,
      location: a.location || null
    }))
    console.log('🔍 Magic Memory Title Debug:', {
      magicMemoryTitle: magicMemoryTitle.value,
      trimmed: magicMemoryTitle.value.trim(),
      isEmpty: !magicMemoryTitle.value.trim()
    })
    
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    // Get the correct photo count - use theme photo count if theme is selected, otherwise use user selection
    let effectivePhotoCount = magicPhotoCount.value // Default to user selection
    
    if (magicSelectedTheme.value) {
      // Try to get photo count from loaded theme options first
      const selectedTheme = magicThemeOptions.value.find(theme => theme.value === magicSelectedTheme.value)
      if (selectedTheme && selectedTheme.photoCount > 0) {
        effectivePhotoCount = selectedTheme.photoCount
        console.log(`[MAGIC-MEMORY] Using photo count from loaded theme options: ${effectivePhotoCount}`)
      } else {
        // Fallback: fetch theme directly from database to get accurate photo count
        try {
          const { data: theme, error } = await supabase
            .from('themes')
            .select('layout_config')
            .eq('id', magicSelectedTheme.value)
            .single()
          
          if (!error && theme && theme.layout_config) {
            const layoutConfig = typeof theme.layout_config === 'string' 
              ? JSON.parse(theme.layout_config) 
              : theme.layout_config
            
            if (layoutConfig && layoutConfig.photos && Array.isArray(layoutConfig.photos)) {
              effectivePhotoCount = layoutConfig.photos.length
              console.log(`[MAGIC-MEMORY] Fetched photo count from database: ${effectivePhotoCount}`)
            }
          }
        } catch (error) {
          console.error('[MAGIC-MEMORY] Error fetching theme photo count:', error)
        }
      }
    }
    
    console.log(`[MAGIC-MEMORY] Final effective photo count: ${effectivePhotoCount}`)
    
    // First, create a template memory book in the database
    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token
    
    const dbRes = await $fetch('/api/memory-books/create-magic-memory', {
      method: 'POST',
      body: {
        asset_ids: [], // Template - will be populated after AI selection
        photo_selection_pool: photoSelectionPool,
        story: '', // Template - will be populated after AI generation
        title: magicMemoryTitle.value || 'Select Photos That Tell a Story',
        memory_event: magicMemoryEvent.value === 'custom' ? magicCustomMemoryEvent.value.trim() : magicMemoryEvent.value,
        background_type: magicBackgroundType.value,
        background_color: magicBackgroundType.value === 'solid' ? magicSolidBackgroundColor.value : null,
        photo_count: effectivePhotoCount,
        theme_id: magicSelectedTheme.value,
        print_size: '8.5x11', // Default print size for magic memories
        output: 'JPG', // Wizard creates single-page memories, so always use JPG
        photo_selection_method: magicPhotoSelectionMethod.value
      },
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    if (!dbRes.success) throw new Error('I need to try again to save your magic card.')
    
    // Start progress polling for the newly created book (before calling AI endpoint)
    currentBookId.value = dbRes.book_id
    startProgressPolling()
    
    // Update status and trigger poll for photo selection step
    currentProgressMessage.value = '🎯 Selecting best photos...'
    setTimeout(pollPdfStatus, 100)
    
    // Now call the magic memory endpoint with the book ID
    const aiRes = await $fetch('/api/ai/magic-memory', {
      method: 'POST',
      body: {
        memoryBookId: dbRes.book_id,
        userId: user.id,
        photoCount: effectivePhotoCount
      }
    })
    
    if (!aiRes.selected_photo_ids || !Array.isArray(aiRes.selected_photo_ids) || aiRes.selected_photo_ids.length < 1 || aiRes.selected_photo_ids.length > effectivePhotoCount) {
      throw new Error(`I need a bit more to work with. Let me try again with different photos.`)
    }
    
    // Note: Story generation now happens in the PDF generation step, not here
    console.log('✅ Photo selection completed, proceeding to PDF generation')
    
    // Update status for PDF generation step (which will handle story generation internally)
    currentProgressMessage.value = '🎨 Creating your memory...'
    setTimeout(pollPdfStatus, 100)
    
    // Create a book object for the progress dialog with proper asset references
    const book = {
      id: dbRes.book_id,
      layout_type: magicSelectedTheme.value ? 'theme' : 'grid',
      ui: 'wizard',
      format: 'card',
      status: 'draft',
      photo_selection_pool: photoSelectionPool,
      created_from_assets: aiRes.selected_photo_ids || [],
      theme_id: magicSelectedTheme.value,
      background_type: magicBackgroundType.value,
      ai_supplemental_prompt: magicMemoryTitle.value,
      output: 'JPG',
      print_size: '8.5x11'
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
    
    // Store the configuration for retry
    const photoSelectionPool = photoSelection_populatePhotoSelectionPool()
    lastMagicMemoryConfig.value = {
      photoSelectionPool: photoSelectionPool,
                    selectedAssets: magicMemoryStep.value === MAGIC_STEPS.MANUAL && photoSelection_method.value === 'photo_library' 
          ? photoSelection_availableAssets.value.filter(a => photoSelection_selectedMemories.value.includes(a.id))
          : photoSelection_availableAssets.value.filter(a => photoSelectionPool.includes(a.id)),
      title: magicMemoryTitle.value,
      memoryEvent: magicMemoryEvent.value === 'custom' ? magicCustomMemoryEvent.value.trim() : magicMemoryEvent.value,
      photoCount: magicPhotoCount.value,
      backgroundType: magicBackgroundType.value,
      selectedTheme: magicSelectedTheme.value,
      buttonType: currentButtonConfig.value,
      photoSelectionMethod: magicPhotoSelectionMethod.value
    }
    
    // Show user-friendly error dialog
    let errorMessage = err.message || 'Something went wrong while creating your magic memory. Let\'s try again!'
    
    // Provide more specific error messages for common issues
    if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
      errorMessage = 'Some of your photos are taking too long to process. This usually happens when images are very large or there\'s a network issue. Please try with smaller images or check your internet connection.'
    } else if (errorMessage.includes('not accessible') || errorMessage.includes('too large')) {
      errorMessage = 'Some of your photos couldn\'t be accessed or are too large. Please try with different photos or smaller image files.'
    } else if (errorMessage.includes('No valid image URLs')) {
      errorMessage = 'None of your photos could be processed. Please check that your images are accessible and try again.'
    }
    
    errorDialogMessage.value = errorMessage
    showErrorDialog.value = true
    
    // Also show toast for immediate feedback
    toast.add({ severity: 'error', summary: 'Let me try again', detail: errorMessage, life: 10000 })
  } finally {
    magicLoading.value = false
  }
}

// Retry function for magic memory creation
const retryMagicMemory = async () => {
  if (!lastMagicMemoryConfig.value) {
    showErrorDialog.value = false
    return
  }
  
  showErrorDialog.value = false
  magicLoading.value = true
  
  // Show progress dialog
  showProgressDialog.value = true
  isRegenerating.value = false
  
  try {
    const config = lastMagicMemoryConfig.value
    
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    // Get the correct photo count - use theme photo count if theme is selected, otherwise use config photo count
    const selectedTheme = magicThemeOptions.value.find(theme => theme.value === config.selectedTheme)
    const effectivePhotoCount = selectedTheme ? selectedTheme.photoCount : config.photoCount
    
    // First, create a template memory book in the database
    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token
    
    const dbRes = await $fetch('/api/memory-books/create-magic-memory', {
      method: 'POST',
      body: {
        asset_ids: [], // Template - will be populated after AI selection
        photo_selection_pool: config.photoSelectionPool,
        story: '', // Template - will be populated after AI generation
        title: config.title || 'Select Photos That Tell a Story',
        memory_event: config.memoryEvent,
        background_type: config.backgroundType,
        background_color: config.backgroundType === 'solid' ? config.backgroundColor : null,
        photo_count: effectivePhotoCount,
        theme_id: config.selectedTheme,
        print_size: '8.5x11', // Default print size for magic memories
        output: 'JPG', // Wizard creates single-page memories, so always use JPG
        photo_selection_method: config.photoSelectionMethod
      },
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    if (!dbRes.success) throw new Error('I need to try again to save your magic card.')
    
    // Start progress polling for the newly created book
    currentBookId.value = dbRes.book_id
    startProgressPolling()
    
    // Update status and trigger poll for photo selection step
    currentProgressMessage.value = '🎯 Selecting best photos...'
    setTimeout(pollPdfStatus, 100)
    
    // Now call the magic memory endpoint with the book ID
    const aiRes = await $fetch('/api/ai/magic-memory', {
      method: 'POST',
      body: {
        memoryBookId: dbRes.book_id,
        userId: user.id,
        photoCount: effectivePhotoCount
      }
    })
    
    if (!aiRes.selected_photo_ids || !Array.isArray(aiRes.selected_photo_ids) || aiRes.selected_photo_ids.length < 1 || aiRes.selected_photo_ids.length > effectivePhotoCount) {
      throw new Error(`I need a bit more to work with. Let me try again with different photos.`)
    }
    
    // Note: Story generation now happens in the PDF generation step, not here
    console.log('✅ Photo selection completed, proceeding to PDF generation')
    
    // Update status for PDF generation step (which will handle story generation internally)
    currentProgressMessage.value = '🎨 Creating your memory...'
    setTimeout(pollPdfStatus, 100)
    
    // Create a book object for the progress dialog with proper asset references
    const book = {
      id: dbRes.book_id,
      layout_type: config.selectedTheme ? 'theme' : 'grid',
      ui: 'wizard',
      format: 'card',
      status: 'draft',
      photo_selection_pool: config.photoSelectionPool,
      created_from_assets: aiRes.selected_photo_ids || [],
      theme_id: config.selectedTheme,
      background_type: config.backgroundType,
      ai_supplemental_prompt: config.title,
      output: 'JPG',
      print_size: '8.5x11'
    }
    
    // Use the unified progress dialog system for PDF generation
    await generatePDF(book)
    
    if (typeof loadMemoryBooks === 'function') await loadMemoryBooks()
    
    // Clear the stored configuration
    lastMagicMemoryConfig.value = null
    
  } catch (err) {
    // Close progress dialog on error
    showProgressDialog.value = false
    stopProgressPolling()
    
    // Log detailed error information for debugging
    console.error('❌ Magic memory creation error:', {
      message: err.message,
      stack: err.stack,
      response: err.response,
      status: err.status,
      statusText: err.statusText
    })
    
    // Show user-friendly error dialog again
    let errorMessage = err.message || 'Something went wrong while creating your magic memory. Let\'s try again!'
    
    // Provide more specific error messages for common issues
    if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
      errorMessage = 'Some of your photos are taking too long to process. This usually happens when images are very large or there\'s a network issue. Please try with smaller images or check your internet connection.'
    } else if (errorMessage.includes('not accessible') || errorMessage.includes('too large')) {
      errorMessage = 'Some of your photos couldn\'t be accessed or are too large. Please try with different photos or smaller image files.'
    } else if (errorMessage.includes('No valid image URLs')) {
      errorMessage = 'None of your photos could be processed. Please check that your images are accessible and try again.'
    }
    
    // Include additional debug information in development
    if ($nuxt.dev) {
      errorMessage += `\n\nDebug: ${err.message}\nStatus: ${err.status || 'N/A'}\nResponse: ${JSON.stringify(err.response || {}, null, 2)}`
    }
    
    errorDialogMessage.value = errorMessage
    showErrorDialog.value = true
    
    // Also show toast for immediate feedback
    toast.add({ severity: 'error', summary: 'Let me try again', detail: errorMessage, life: 10000 })
  } finally {
    magicLoading.value = false
  }
}

// Handle when no photos are found for a selection method
const handleNoPhotosFound = (data) => {
  console.log('🔍 [handleNoPhotosFound] No photos found for method:', data.method)
  
  let message = data.message
  let title = 'No Photos Found'
  
  // Customize message based on method
  switch (data.method) {
    case 'date_range':
      title = 'No Photos in Date Range'
      message = `No photos found for the selected date range (${formatDateRange(data.dateRange)}). Please try a different date range or choose another selection method.`
      break
    case 'geo_code':
      title = 'No Photos at Location'
      message = `No photos found for the selected location. Please try a different location or choose another selection method.`
      break
    case 'tags':
      title = 'No Photos with Tags'
      message = `No photos found with the selected tags. Please try different tags or choose another selection method.`
      break
    default:
      title = 'No Photos Found'
      message = data.message
  }
  
  console.log('🔍 [handleNoPhotosFound] Showing toast with:', { title, message })
  
  // Show toast notification using the correct toast instance
  toast.add({
    severity: 'info',
    summary: title,
    detail: message,
    life: 5000
  })
}

// Handle when photo library is closed (return to photo selection step)
const handleClosePhotoLibrary = () => {
  console.log('🔍 [handleClosePhotoLibrary] Photo library closed, returning to PHOTOS step')
  
  // Reset the step back to PHOTOS
  magicMemoryStep.value = MAGIC_STEPS.PHOTOS
  
  // Clear any selected memories
  photoSelection_selectedMemories.value = []
  
  console.log('🔍 [handleClosePhotoLibrary] Step reset to:', magicMemoryStep.value)
}

// Helper function to format date range for display
const formatDateRange = (dateRange) => {
  if (!dateRange.start && !dateRange.end) return 'any date'
  if (dateRange.start && dateRange.end) {
    return `${new Date(dateRange.start).toLocaleDateString()} to ${new Date(dateRange.end).toLocaleDateString()}`
  }
  if (dateRange.start) {
    return `from ${new Date(dateRange.start).toLocaleDateString()}`
  }
  if (dateRange.end) {
    return `until ${new Date(dateRange.end).toLocaleDateString()}`
  }
  return 'any date'
}

// Navigate to trash page
const navigateToTrash = () => {
  navigateTo('/app/memory-books/trash')
}

const openMagicMemoryDialog = async (buttonType = 'full') => {
  console.log('🔍 [openMagicMemoryDialog] Opening dialog with buttonType:', buttonType)
  
  // Set up the button configuration - create a fresh copy to avoid mutations
  const originalConfig = buttonConfigs[buttonType] || buttonConfigs.full
  currentButtonConfig.value = {
    ...originalConfig,
    steps: [...originalConfig.steps] // Create a fresh copy of the steps array
  }
  currentStepIndex.value = 0
  magicMemoryStep.value = currentButtonConfig.value.steps[0]
  
  console.log('🔍 [openMagicMemoryDialog] Initial config:', currentButtonConfig.value)
  console.log('🔍 [openMagicMemoryDialog] Initial step:', magicMemoryStep.value)
  
  // Reset form values
  magicMemoryTitle.value = ''
  magicMemoryEvent.value = ''
  magicCustomMemoryEvent.value = ''
  magicPhotoCount.value = 4
  magicBackgroundType.value = 'white'
  
  // Reset photo selection state using composable's reset function
  photoSelection_resetSelection()
  
  // Set default photo selection method based on button configuration
  photoSelection_method.value = currentButtonConfig.value.steps.includes(5) ? '' : 'last_100'
  
  // Reset theme selection
  magicSelectedTheme.value = null
  
  photoSelection_loadingAssets.value = true
  try {
    // Use composable functions to load assets and location data
    await photoSelection_loadAvailableAssets()
    await photoSelection_loadLocationData()
    // Fetch themes for wizard
    await fetchMagicThemes()
  } catch (error) {
    console.error('Error loading assets:', error)
    photoSelection_availableAssets.value = []
  } finally {
    photoSelection_loadingAssets.value = false
    showMagicMemoryDialog.value = true
  }
}

// Reload assets for magic memory step 6
const reloadAssetsForMagicMemory = async () => {
  if (magicMemoryStep.value === MAGIC_STEPS.MANUAL) {
    loadingAssets.value = true
    try {
      const allApprovedAssets = await db.assets.getAssets({ approved: true })
      availableAssets.value = allApprovedAssets || []
    } catch (error) {
      console.error('❌ Error reloading assets:', error)
      availableAssets.value = []
    } finally {
      loadingAssets.value = false
    }
  }
}

const nextMagicMemoryStep = () => {
  // Validate current step before proceeding
  if (magicMemoryStep.value === MAGIC_STEPS.TITLE && !magicMemoryTitle.value.trim()) {
    // Show error message to user
    if (toast) {
      toast.add({
        severity: 'error',
        summary: 'Title Required',
        detail: 'Please enter a description for your memory to help me select the best photos.',
        life: 3000
      })
    }
    return // Don't proceed if title is empty
  }
  
  if (magicMemoryStep.value === MAGIC_STEPS.PHOTOS && !photoSelection_method.value) {
    return // Don't proceed if photo selection method is not chosen
  }
  
  // Validate location selection if geo_code is selected
  if (magicMemoryStep.value === MAGIC_STEPS.PHOTOS && photoSelection_method.value === 'geo_code' && !photoSelection_selectedLocation.value) {
    return // Don't proceed if location is not selected
  }
  
  // Validate photo availability for the selected method
  if (magicMemoryStep.value === MAGIC_STEPS.PHOTOS) {
    console.log('🔍 [nextMagicMemoryStep] Validating photo selection...')
    console.log('🔍 [nextMagicMemoryStep] photoSelectionInterfaceRef.value:', photoSelectionInterfaceRef.value)
    
    // Validate using the PhotoSelectionInterface component
    if (photoSelectionInterfaceRef.value && typeof photoSelectionInterfaceRef.value.validatePhotoSelection === 'function') {
      console.log('🔍 [nextMagicMemoryStep] Calling validatePhotoSelection...')
      const isValid = photoSelectionInterfaceRef.value.validatePhotoSelection()
      console.log('🔍 [nextMagicMemoryStep] Validation result:', isValid)
      if (!isValid) {
        console.log('🔍 [nextMagicMemoryStep] Validation failed, stopping...')
        return // Don't proceed if validation fails (error message already shown)
      }
    } else {
      console.log('🔍 [nextMagicMemoryStep] No validation function available')
    }
  }
  
  // Special handling for photo_library selection - add MANUAL step programmatically
  if (magicMemoryStep.value === MAGIC_STEPS.PHOTOS && photoSelection_method.value === 'photo_library') {
    console.log('🔍 [nextMagicMemoryStep] Photo library selected, checking MANUAL step')
    console.log('🔍 [nextMagicMemoryStep] Current steps before:', currentButtonConfig.value.steps)
    
    // Only add MANUAL step if it doesn't already exist
    if (!currentButtonConfig.value.steps.includes(MAGIC_STEPS.MANUAL)) {
      console.log('🔍 [nextMagicMemoryStep] Adding MANUAL step')
    currentButtonConfig.value.steps.push(MAGIC_STEPS.MANUAL)
    } else {
      console.log('🔍 [nextMagicMemoryStep] MANUAL step already exists')
    }
    
    console.log('🔍 [nextMagicMemoryStep] Current steps after:', currentButtonConfig.value.steps)
    // Move to the MANUAL step
    currentStepIndex.value = currentButtonConfig.value.steps.indexOf(MAGIC_STEPS.MANUAL)
    magicMemoryStep.value = MAGIC_STEPS.MANUAL
    console.log('🔍 [nextMagicMemoryStep] Advanced to MANUAL step:', magicMemoryStep.value)
    return
  }
  
  // Find next step in the button's sequence
  const nextIndex = currentStepIndex.value + 1
  if (nextIndex < currentButtonConfig.value.steps.length) {
    const nextStepNumber = currentButtonConfig.value.steps[nextIndex]
    
    // Check if we're going to Step 5 and user has no photos
    if (nextStepNumber === MAGIC_STEPS.PHOTOS && photoSelection_availableAssets.value.length === 0) {
      // Redirect to upload dialog instead
      showMagicMemoryDialog.value = false
      showUploadDialog.value = true
      return
    }
    
    currentStepIndex.value = nextIndex
    magicMemoryStep.value = nextStepNumber
  }
}

const previousMagicMemoryStep = () => {
  // Find previous step in the button's sequence
  const prevIndex = currentStepIndex.value - 1
  if (prevIndex >= 0) {
    currentStepIndex.value = prevIndex
    magicMemoryStep.value = currentButtonConfig.value.steps[prevIndex]
    

  }
}

// Helper functions for navigation
const getNextStepName = () => {
  // Special case: if we're on PHOTOS step and photo_library is selected, the next step is MANUAL
  if (magicMemoryStep.value === MAGIC_STEPS.PHOTOS && photoSelection_method.value === 'photo_library') {
    return "Photo Selection"
  }
  
  const nextIndex = currentStepIndex.value + 1
  if (nextIndex < currentButtonConfig.value.steps.length) {
    const nextStepNumber = currentButtonConfig.value.steps[nextIndex]
    const stepDef = stepDefinitions[nextStepNumber]
    if (stepDef) {
      return stepDef.name
    } else {
      console.warn('🔍 [getNextStepName] No step definition found for:', nextStepNumber)
      return "Next Step"
    }
  }
  return null
}

const isLastStep = () => {
  // Special case: if we're on PHOTOS step and photo_library is selected, we're not on the last step
  if (magicMemoryStep.value === MAGIC_STEPS.PHOTOS && photoSelection_method.value === 'photo_library') {
    return false
  }
  return currentStepIndex.value === currentButtonConfig.value.steps.length - 1
}

const isFirstStep = () => {
  return currentStepIndex.value === 0
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
    toast.add({ severity: 'success', summary: 'Deleted', detail: 'Memory book deleted.', life: 6000 })
    if (typeof loadMemoryBooks === 'function') await loadMemoryBooks()
    showDetailsModal.value = false
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Delete Failed', detail: err.message || 'Could not delete book', life: 8000 })
  } finally {
    showDeleteDialog.value = false
    bookToDelete.value = null
    // Close the detail dialog after successful deletion
    if (showDetailsModal) showDetailsModal.value = false
  }
}

// Add the following methods:
async function createMemoryBookFromDialog(data) {
  console.log('🔧 [createMemoryBookFromDialog] Starting with data:', data)
  
  // Check if assets are selected
  if (!data.selectedAssets || data.selectedAssets.length === 0) {
    // Show dialog explaining the requirement
    if (toast) {
      toast.add({
        severity: 'warn',
        summary: 'Assets Required',
        detail: 'Please select at least one photo to include in your memory book.',
        life: 4000
      })
    }
    return // Don't proceed with creation
  }
  
  try {
    // Map dialog data to newBook structure
    newBook.value = {
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
      // The new flow will use this to populate created_from_assets via photo selection
      selectedAssetIds: Array.isArray(data.selectedAssets) ? data.selectedAssets.map(a => a.id) : []
    }
    
    console.log('🔧 [createMemoryBookFromDialog] Mapped newBook.value:', newBook.value)
    
    // Call the existing createMemoryBook method
    console.log('🔧 [createMemoryBookFromDialog] Calling createMemoryBook...')
    await createMemoryBook()
    console.log('🔧 [createMemoryBookFromDialog] createMemoryBook completed successfully')
    
    // Close the create dialog after successful creation
    showCreateModal.value = false
    
    // Auto-generate and display the PDF immediately
    if (newlyCreatedBook.value) {
      console.log('🔧 [createMemoryBookFromDialog] Starting auto-generation and display...')
      await composeNewlyCreatedMemory()
    }
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
      // Update asset references
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

const magicCustomMemoryEvent = ref('')

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
  fileInput.accept = 'image/jpeg,image/jpg,image/png,image/gif'
  
  fileInput.onchange = async (event) => {
    const files = Array.from(event.target.files)
    if (files.length === 0) return

    // Validate files
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        fileErrorDialogMessage.value = 'Only JPG, PNG, or GIF images are allowed. Please select valid image files.'
        showFileErrorDialog.value = true
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        fileErrorDialogMessage.value = `The file "${file.name}" is too large. Please select images smaller than 10MB.`
        showFileErrorDialog.value = true
        return
      }
    }
    await startUpload(files)
  }
  
  fileInput.click()
}

// File selection function for magic memory step 5
const selectFilesForMagicMemory = () => {
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.multiple = true
  fileInput.accept = 'image/jpeg,image/jpg,image/png, image/gif'
  
  fileInput.onchange = async (event) => {
    const files = Array.from(event.target.files)
    if (files.length === 0) return

    // Validate files
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        fileErrorDialogMessage.value = 'Only JPG, PNG, or GIF images are allowed. Please select valid image files.'
        showFileErrorDialog.value = true
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        fileErrorDialogMessage.value = `The file "${file.name}" is too large. Please select images smaller than 10MB.`
        showFileErrorDialog.value = true
        return
      }
    }
    await startUploadForMagicMemory(files)
  }
  
  fileInput.click()
}

// Start upload process for magic memory step 5
const startUploadForMagicMemory = async (files) => {
  isUploading.value = true
  
  // Show progress dialog
  showUploadProgressDialog.value = true
  magicUploadProgress.value = { current: 0, total: files.length, filename: '' }
  
  // Initialize file tracking
  const tempUploadingFiles = files.map(file => ({
    name: file.name,
    file: file,
    status: 'pending'
  }))
  
  const db = useDatabase()
  const totalFiles = files.length
  let completedFiles = 0
  
  for (let i = 0; i < files.length; i++) {
    const fileData = tempUploadingFiles[i]
    const file = fileData.file
    
    // Update progress
    magicUploadProgress.value = { 
      current: i + 1, 
      total: totalFiles, 
      filename: file.name 
    }
    
    try {
      // Update status to uploading
      fileData.status = 'uploading'
      
      // Upload asset with approved status
      const asset = await db.assets.uploadAsset({
        type: 'photo',
        title: file.name,
        user_caption: '',
        approved: true // Set as approved since it's a direct upload
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
      if (aiResult && aiResult.caption && aiResult.caption.trim()) {
        showMagicCaption(aiResult.caption)
      }
      
      // Mark as completed
      fileData.status = 'completed'
      completedFiles++
      
    } catch (error) {
      console.error(`❌ Failed to upload ${file.name}:`, error)
      fileData.status = 'failed'
      completedFiles++
    }
  }
  
  // Hide progress dialog
  showUploadProgressDialog.value = false
  isUploading.value = false
  
  if (completedFiles > 0) {
    // Show success message
    toast.add({ 
      severity: 'success', 
      summary: '✨ Magic Complete! ✨', 
      detail: `Successfully uploaded ${completedFiles} new photos! They're now available for selection.`, 
      life: 4000 
    })
    
    // Refresh the assets list to show new photos
    await reloadAssetsForMagicMemory()
  }
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
    
    try {
      // Update status to uploading
      fileData.status = 'uploading'
              uploadStatus.value = `🌟 Uploading ${file.name} to our special collection...`
      
      // Upload asset with approved status
      const asset = await db.assets.uploadAsset({
        type: 'photo',
        title: file.name,
        user_caption: '',
        approved: true // Set as approved since it's a direct upload
      }, file)
      
      // Update status to processing
      fileData.status = 'processing'
      uploadStatus.value = `🌸 Putting our AI assistant to work on  ${file.name}...`
      
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
              uploadStatus.value = `✨ Prepared ${completedFiles} of ${totalFiles} photos! ✨`
      
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
            uploadStatus.value = `🎉 Successfully prepared ${uploadedFiles.value.length} photos! 🎉`
    
    // Refresh asset count
    await checkAssets()
  }
  
  if (failedFiles.value.length > 0) {
            uploadStatus.value += ` 😔 ${failedFiles.value.length} preparations didn't work.`
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
  isUploading.value = false
  
  // Check if we should open wizard after upload
  if (shouldOpenWizardAfterUpload.value) {
    console.log('[MEMORY-BOOKS] Should open wizard after upload, checking photo count')
    shouldOpenWizardAfterUpload.value = false // Reset flag
    
    // Small delay to ensure assets are updated
    setTimeout(async () => {
      await checkAssets()
      const approvedAssets = await db.assets.getAssets({ approved: true })
      const photoCount = approvedAssets?.length || 0
      
      if (photoCount >= 6) {
        console.log('[MEMORY-BOOKS] User now has', photoCount, 'photos, opening wizard')
        openMagicMemoryDialog('quick')
      } else {
        console.log('[MEMORY-BOOKS] User has', photoCount, 'photos, showing recommendation to add more')
        // Show toast encouraging more photos
        if (toast) {
          toast.add({
            severity: 'info',
            summary: 'Great Start!',
            detail: `You have ${photoCount} photos. For best results, consider adding more photos before creating your memory card.`,
            life: 5000
          })
        }
      }
    }, 1000)
  }
  
  // Check if user came from home page flow and now has approved photos
  if (route.query.openUploadDialog === 'true') {
    // Small delay to ensure assets are updated
    setTimeout(async () => {
      await checkAssets()
      if (hasAssets.value && approvedAssetsCount.value > 0) {
        // User now has approved photos, open magic memory dialog
        console.log('[MEMORY-BOOKS] User now has approved photos, opening magic memory dialog')
        openMagicMemoryDialog('quick')
      }
    }, 1000)
  }
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
    showSpecialUploadMessaging.value = false
  }
}

// Convert status to magical language
const getMagicStatusText = (status) => {
  switch (status) {
    case 'pending':
      return '🌟 Waiting for file...'
    case 'uploading':
              return '📤 Uploading to collection...'
    case 'processing':
      return '🤔 Processing with AI...'
    case 'completed':
              return '✨ Uploaded, captioned, tags added! ✨'
    case 'failed':
              return '😔 Preparation failed'
    default:
      return status
  }
}

const skipUpload = () => {
  // Close upload dialog
  showUploadDialog.value = false
  
  // Check if we should open wizard after skipping upload
  if (shouldOpenWizardAfterUpload.value) {
    console.log('[MEMORY-BOOKS] User skipped upload, but should open wizard')
    shouldOpenWizardAfterUpload.value = false // Reset flag
    
    // Small delay to ensure assets are updated
    setTimeout(async () => {
      await checkAssets()
      const approvedAssets = await db.assets.getAssets({ approved: true })
      const photoCount = approvedAssets?.length || 0
      
      if (photoCount > 0) {
        console.log('[MEMORY-BOOKS] User has', photoCount, 'photos, opening wizard')
        openMagicMemoryDialog('quick')
      } else {
        console.log('[MEMORY-BOOKS] User has no photos, showing recommendation')
        // Show toast encouraging photos
        if (toast) {
          toast.add({
            severity: 'info',
            summary: 'No Photos Yet',
            detail: 'You can upload photos anytime from the Upload page. For best results, try to add at least 6 photos.',
            life: 5000
          })
        }
      }
    }, 1000)
  } else {
    toast.add({ 
      severity: 'info', 
      summary: 'No Problem', 
      detail: 'You can upload photos anytime from the Upload page', 
      life: 3000 
    })
    
    // If user came from home page flow, redirect them back to home
    if (route.query.openUploadDialog === 'true') {
      setTimeout(() => {
        navigateTo('/app/home')
      }, 1500)
    }
  }
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
      height: '68vh',
      width: '100vw',
      maxWidth: '100vw',
      margin: '0',
      padding: '0'
    };
  } else {
    return {
      height: '70vh',
      width: '100%',
      maxWidth: '100%'
    };
  }
});

// Helper to open upload dialog and return to Magic Memory step 5
function openUploadAndReturnToMagicStep5() {
  showMagicMemoryDialog.value = false;
  showUploadDialog.value = true;
  // When upload dialog closes, return to Magic Memory step 5
  const unwatch = watch(
    () => showUploadDialog.value,
    (val) => {
      if (!val) {
        showMagicMemoryDialog.value = true;
        magicMemoryStep.value = MAGIC_STEPS.PHOTOS;
        unwatch();
      }
    }
  );
}

// Responsive dialog: track mobile state
const isMobile = ref(false)
function updateIsMobile() {
  isMobile.value = typeof window !== 'undefined' && window.innerWidth < 640
}
onMounted(() => {
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)
})
onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile)
})

const showFileErrorDialog = ref(false)
const fileErrorDialogMessage = ref('')
const showUploadProgressDialog = ref(false)
const magicUploadProgress = ref({ current: 0, total: 0, filename: '' })

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

/* Mobile full-screen dialog and step adjustments for Magic Memory Dialog */
@media (max-width: 640px) {
  /* Make Magic Memory Dialog full screen on mobile */
  ::v-deep(.p-dialog-mask) {
    display: flex !important;
    align-items: stretch !important;
    justify-content: stretch !important;
    min-height: 100vh !important;
    min-width: 100vw !important;
    padding: 0 !important;
  }
  ::v-deep(.p-dialog) {
    margin: 0 !important;
    width: 100vw !important;
    max-width: 100vw !important;
    min-width: 100vw !important;
    min-height: 100vh !important;
    height: 100vh !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    display: flex !important;
    flex-direction: column;
    align-items: stretch;
    justify-content: stretch;
    padding: 0 !important;
  }
  ::v-deep(.p-dialog-content) {
    display: flex !important;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 0;
    height: 100%;
    padding: 0 !important;
  }
  .magic-memory-step {
    width: 100vw !important;
    min-height: 100vh !important;
    max-height: 100vh !important;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0.5rem 0.5rem 0.5rem 0.5rem !important;
    margin: 0 !important;
  }
  .magic-memory-step .text-center {
    text-align: center !important;
    width: 100%;
    word-break: break-word;
    white-space: normal;
  }
  .magic-memory-step h3 {
    font-size: 1.05rem !important;
    margin-bottom: 0.5rem !important;
    text-align: center !important;
    width: 100%;
    word-break: break-word;
    white-space: normal;
  }
  /* Remove extra margin/padding from dialog header/footer if present */
  ::v-deep(.p-dialog-header),
  ::v-deep(.p-dialog-footer) {
    padding-left: 0 !important;
    padding-right: 0 !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
}
</style>