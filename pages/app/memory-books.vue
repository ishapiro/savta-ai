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
      
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <Card
          v-for="book in memoryBooks"
          :key="book.id"
          class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group"
        >
          <template #content>
            <!-- Book Cover with Gradient -->
            <div class="relative h-40 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10"></div>
              <div class="relative h-full flex items-center justify-center">
                <div class="text-center">
                  <div class="w-16 h-16 mx-auto mb-3 bg-white/80 rounded-full flex items-center justify-center shadow-lg">
                    <i class="pi pi-book text-2xl text-primary"></i>
                  </div>
                  <p class="text-sm font-semibold text-gray-700">Memory Book</p>
                </div>
              </div>
              <!-- Status Badge Overlay -->
              <div class="absolute top-3 right-3">
                <div 
                  :class="getStatusBadgeClass(book.status)"
                  class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md backdrop-blur-sm"
                >
                  <i :class="getStatusIcon(book.status)" class="text-xs"></i>
                  <span>{{ getStatusText(book.status) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Card Content -->
            <div class="p-6">
              <div class="mb-4">
                <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {{ book.title || ('Memory Book #' + book.id.slice(-6)) }}
                </h3>
                <div class="space-y-2 text-sm text-gray-600">
                  <div class="flex justify-between items-center">
                    <span class="font-medium">Created:</span>
                    <span>{{ formatDate(book.created_at) }}</span>
                  </div>
                  <div v-if="book.generated_at" class="flex justify-between items-center">
                    <span class="font-medium">Generated:</span>
                    <span>{{ formatDate(book.generated_at) }}</span>
                  </div>
                  <div v-if="book.approved_at" class="flex justify-between items-center">
                    <span class="font-medium">Approved:</span>
                    <span>{{ formatDate(book.approved_at) }}</span>
                  </div>
                  <div v-if="book.created_from_assets" class="flex justify-between items-center">
                    <span class="font-medium">Assets:</span>
                    <span class="bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">
                      {{ book.created_from_assets.length }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- Review Notes -->
              <div v-if="book.review_notes" class="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p class="text-xs text-amber-800">{{ book.review_notes }}</p>
              </div>
            </div>
            
            <!-- Action Bar -->
            <div class="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 p-4">
              <div class="flex items-center justify-center gap-2">
                <!-- Download Button -->
                <button
                  class="w-10 h-10 flex items-center justify-center rounded-full shadow-md bg-white text-green-600 hover:text-green-700 hover:shadow-lg transition-all duration-200 group-hover:scale-105"
                  v-tooltip.top="'Download PDF'"
                  @click="onDownloadClick(book)"
                >
                  <i class="pi pi-download text-lg"></i>
                </button>
                <!-- Generate Button (only for draft) -->
                <button
                  v-if="book.status === 'draft'"
                  class="w-10 h-10 flex items-center justify-center rounded-full shadow-md bg-white text-purple-600 hover:text-purple-700 hover:shadow-lg transition-all duration-200 group-hover:scale-105"
                  v-tooltip.top="'Generate memory book'"
                  @click="onGenerateClick(book)"
                >
                  <i class="pi pi-bolt text-lg"></i>
                </button>
                <!-- Regenerate Button (for ready or background_ready) -->
                <button
                  v-if="book.status === 'ready' || book.status === 'background_ready'"
                  class="w-10 h-10 flex items-center justify-center rounded-full shadow-md bg-white text-yellow-600 hover:text-yellow-700 hover:shadow-lg transition-all duration-200 group-hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                  v-tooltip.top="book.status === 'background_ready' ? 'Book is still being processed...' : 'Create a new magic AI background'"
                  @click="onRegenerateClick(book)"
                  :disabled="book.status === 'background_ready'"
                >
                  <i class="pi pi-refresh text-lg"></i>
                </button>
                <!-- Approve Button -->
                <button
                  v-if="book.status === 'ready'"
                  class="w-10 h-10 flex items-center justify-center rounded-full shadow-md bg-white text-purple-600 hover:text-purple-700 hover:shadow-lg transition-all duration-200 group-hover:scale-105"
                  v-tooltip.top="'Approve this memory book for printing and sharing'"
                  @click="approveBook(book.id)"
                >
                  <i class="pi pi-check text-lg"></i>
                </button>
                <!-- Unapprove Button -->
                <button
                  v-if="book.status === 'approved'"
                  class="w-10 h-10 flex items-center justify-center rounded-full shadow-md bg-white text-orange-600 hover:text-orange-700 hover:shadow-lg transition-all duration-200 group-hover:scale-105"
                  v-tooltip.top="'Return to review - this will move the book back to ready status'"
                  @click="unapproveBook(book.id)"
                >
                  <i class="pi pi-undo text-lg"></i>
                </button>
                <!-- View Details Button -->
                <button
                  class="w-10 h-10 flex items-center justify-center rounded-full shadow-md bg-white text-gray-600 hover:text-gray-800 hover:shadow-lg transition-all duration-200 group-hover:scale-105"
                  v-tooltip.top="'View Details'"
                  @click="viewBookDetails(book)"
                >
                  <i class="pi pi-eye text-lg"></i>
                </button>
                <!-- Edit Settings Button -->
                <button
                  class="w-10 h-10 flex items-center justify-center rounded-full shadow-md bg-white text-blue-600 hover:text-blue-700 hover:shadow-lg transition-all duration-200 group-hover:scale-105"
                  v-tooltip.top="'Edit Settings & Assets'"
                  @click="openEditSettings(book)"
                >
                  <i class="pi pi-cog text-lg"></i>
                </button>
              </div>
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
      <div class="space-y-3">
        <div class="field">
          <label class="block text-sm font-medium text-color mb-1">Book Title</label>
          <InputText
            v-model="newBook.title"
            placeholder="Enter a title for your memory book"
            class="w-full"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
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
        </div>

        <div class="grid grid-cols-2 gap-3">
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
          <label class="block text-sm font-medium text-color mb-1">Grid Layout</label>
          <Dropdown
            v-model="newBook.gridLayout"
            :options="gridLayoutOptions"
            option-label="label"
            option-value="value"
            placeholder="Select grid layout"
            class="w-full"
          />
        </div>

        <div class="field">
          <label class="block text-sm font-medium text-color mb-1">Memory Shape</label>
          <Dropdown
            v-model="newBook.memoryShape"
            :options="memoryShapeOptions"
            option-label="label"
            option-value="value"
            placeholder="Select memory shape"
            class="w-full"
          />
        </div>

        <div class="field">
          <label class="block text-sm font-medium text-color mb-1">Select Memories</label>
          <div class="flex items-center justify-between">
            <div class="text-sm text-color-secondary">
              {{ selectedAssets.length }} memories selected
            </div>
            <Button
              label="Select Memories"
              icon="pi pi-images"
              size="small"
              @click="openSelectMemoriesDialog"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
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
      </div>

      <template #footer>
        <div class="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
          <div class="flex gap-2 w-full sm:w-auto">
            <Button
              label="Cancel"
              icon="pi pi-times"
              severity="secondary"
              @click="showCreateModal = false"
              class="rounded-full px-5 py-2 text-sm font-bold shadow w-full sm:w-auto"
            />
          </div>
          <Button
            label="Create Book"
            icon="pi pi-check"
            :loading="creatingBook"
            :disabled="!newBook.title"
            @click="createMemoryBook"
            class="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-0 text-white font-bold rounded-full px-5 py-2 text-sm shadow w-full sm:w-auto"
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
          {{ selectedBook.review_notes }}
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
              @click="viewPDF(selectedBook.pdf_url, selectedBook.id)"
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
      header="Casting a Spell to Create Your Memory Book"
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
    <Dialog v-model:visible="showRegenerateDialog" modal :header="null" :closable="false" class="w-full md:w-[60%] lg:w-[50%] p-0">
      <div class="py-4 px-6">
        <p class="text-base leading-relaxed">Would you like to create a fresh, new version of this memory book with a brand new AI-generated background design? It's like giving your memories a beautiful new frame! This will take a few moments to create something special just for you. If you're happy with the current version and just want to download it right away, you can use the download button below - that's much faster!</p>
        <div class="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <button
            class="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full px-7 py-2 text-sm shadow transition-all duration-200 min-w-[150px]"
            @click="downloadCurrentBook"
          >
            <i class="pi pi-download text-base"></i>
            Download Current
          </button>
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

    <!-- PDF Preview Modal -->
    <Dialog
      v-model:visible="showPdfModal"
      modal
      header="PDF Preview"
      :style="{ width: '98vw', maxWidth: '1200px', height: '90vh', maxHeight: '90vh', padding: 0 }"
      :contentStyle="{ height: '90vh', padding: 0 }"
      :closable="false"
    >
      <div class="pdf-preview-container" style="height: 90vh; width: 100%; padding: 0; display: flex; flex-direction: column;">
        <embed
          v-if="pdfBlobUrl"
          :src="pdfBlobUrl"
          type="application/pdf"
          style="width: 100%; height: 100%; border: none; flex: 1 1 auto;"
        />
        <div v-else class="text-center py-8 flex-1 flex items-center justify-center">
          <i class="pi pi-file-pdf text-4xl text-gray-400"></i>
          <p class="text-color-secondary mt-2">No PDF available for preview.</p>
        </div>
        <div class="w-full text-center text-xs text-gray-600 mt-2 p-2 border-t border-gray-200 bg-gray-50">
          If you do not see the PDF preview and you are using Chrome it may be because you have the browser set to always download PDFs. 
          You can enter this URL in Chrome's address bar <span class="font-mono bg-gray-200 px-1 rounded">chrome://settings/content/pdfDocuments</span> 
          to change this setting. You can also download the PDF by clicking the download button in the top right corner of the PDF preview.
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end">
          <Button
            label="Close"
            severity="secondary"
            @click="showPdfModal = false"
          />
        </div>
      </template>
    </Dialog>

    <!-- Edit Memory Book Settings Modal -->
    <Dialog
      v-model:visible="showEditSettingsModal"
      modal
      header="Edit Memory Book Settings"
      :style="{ width: '500px' }"
      :closable="false"
    >
      <div v-if="editBook" class="space-y-3">
        <div class="field">
          <label class="block text-sm font-medium text-color mb-1">Book Title</label>
          <InputText
            v-model="editBook.title"
            placeholder="Enter a title for your memory book"
            class="w-full"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="field">
            <label class="block text-sm font-medium text-color mb-1">Layout Type</label>
            <Dropdown
              v-model="editBook.layoutType"
              :options="layoutOptions"
              option-label="label"
              option-value="value"
              placeholder="Select layout type"
              class="w-full"
            />
          </div>

          <div class="field">
            <label class="block text-sm font-medium text-color mb-1">Print Size</label>
            <Dropdown
              v-model="editBook.printSize"
              :options="printSizeOptions"
              option-label="label"
              option-value="value"
              placeholder="Select print size"
              class="w-full"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="field">
            <label class="block text-sm font-medium text-color mb-1">Quality</label>
            <Dropdown
              v-model="editBook.quality"
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
              v-model="editBook.medium"
              :options="mediumOptions"
              option-label="label"
              option-value="value"
              placeholder="Select medium"
              class="w-full"
            />
          </div>
        </div>

        <div class="field">
          <label class="block text-sm font-medium text-color mb-1">Theme</label>
          <Dropdown
            v-model="editBook.theme"
            :options="themeOptions"
            option-label="label"
            option-value="value"
            placeholder="Select theme"
            class="w-full"
          />
        </div>

        <div class="field">
          <label class="block text-sm font-medium text-color mb-1">Grid Layout</label>
          <Dropdown
            v-model="editBook.gridLayout"
            :options="gridLayoutOptions"
            option-label="label"
            option-value="value"
            placeholder="Select grid layout"
            class="w-full"
          />
        </div>

        <div class="field">
          <label class="block text-sm font-medium text-color mb-1">Memory Shape</label>
          <Dropdown
            v-model="editBook.memoryShape"
            :options="memoryShapeOptions"
            option-label="label"
            option-value="value"
            placeholder="Select memory shape"
            class="w-full"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="field">
            <label class="block text-sm font-medium text-color mb-1">Include Captions</label>
            <div class="flex items-center space-x-2">
              <Checkbox
                v-model="editBook.includeCaptions"
                :binary="true"
              />
              <span class="text-sm text-color-secondary">Include AI-generated captions</span>
            </div>
          </div>

          <div class="field">
            <label class="block text-sm font-medium text-color mb-1">Include Tags</label>
            <div class="flex items-center space-x-2">
              <Checkbox
                v-model="editBook.includeTags"
                :binary="true"
              />
              <span class="text-sm text-color-secondary">Include asset tags</span>
            </div>
          </div>
        </div>
        
        <!-- Select Memories Button -->
        <div class="field">
          <label class="block text-sm font-medium text-color mb-1">Select Memories</label>
          <div class="flex items-center justify-between">
            <div class="text-sm text-color-secondary">
              {{ editBook.created_from_assets.length }} memories selected
            </div>
            <Button
              label="Select Memories"
              icon="pi pi-images"
              size="small"
              @click="openSelectMemoriesDialog"
            />
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
          <div class="flex gap-2 w-full sm:w-auto">
            <Button
              v-if="editBook && editBook.status !== 'draft'"
              label="Cleanup/Unstick"
              icon="pi pi-broom"
              severity="danger"
              @click="showCleanupConfirmation(editBook.id)"
              class="bg-red-500 hover:bg-red-600 border-0 text-white font-bold rounded-full px-5 py-2 text-sm shadow w-full sm:w-auto"
            />
            <Button
              label="Cancel"
              icon="pi pi-times"
              severity="secondary"
              @click="showEditSettingsModal = false"
              class="rounded-full px-5 py-2 text-sm font-bold shadow w-full sm:w-auto"
            />
          </div>
          <Button
            label="Save"
            icon="pi pi-check"
            :loading="savingEditBook"
            :disabled="!editBook.title"
            @click="saveEditBook"
            class="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-0 text-white font-bold rounded-full px-5 py-2 text-sm shadow w-full sm:w-auto"
          />
        </div>
      </template>
    </Dialog>

    <!-- Cleanup Confirmation Dialog -->
    <Dialog
      v-model:visible="showCleanupConfirmationModal"
      modal
      header="Confirm Cleanup"
      :style="{ width: '90vw', maxWidth: '500px' }"
      class="cleanup-confirmation-dialog"
    >
      <div class="space-y-4">
        <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
          <div class="flex items-center space-x-3 mb-3">
            <div class="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
              <i class="pi pi-broom text-orange-600 text-lg"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-color">Ready for New Magic?</h3>
              <p class="text-sm text-color-secondary">We're about to clean up your memory book</p>
            </div>
          </div>
          <div class="bg-white rounded-lg p-3 border border-orange-200">
            <p class="text-sm text-color">
              This will reset your memory book back to draft status and clear any generated backgrounds and PDFs. 
              You'll be able to apply fresh magic to create a brand new version of your memory book.
            </p>
          </div>
        </div>
        
        <div class="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div class="flex items-start space-x-2">
            <i class="pi pi-info-circle text-blue-600 mt-0.5"></i>
            <div>
              <p class="text-sm font-medium text-color">What happens next:</p>
              <ul class="text-xs text-color-secondary mt-1 space-y-1">
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
            class="rounded-full px-5 py-2 text-sm font-bold shadow w-full sm:w-auto"
          />
          <Button
            label="Yes, Clean Up"
            icon="pi pi-broom"
            severity="danger"
            @click="confirmCleanup"
            class="bg-red-500 hover:bg-red-600 border-0 text-white font-bold rounded-full px-5 py-2 text-sm shadow w-full sm:w-auto"
          />
        </div>
      </template>
    </Dialog>

    <!-- Select Memories Dialog -->
    <Dialog
      v-model:visible="showSelectMemoriesModal"
      modal
      header="Select Your Memories"
      :style="{ width: '95vw', maxWidth: '1200px', height: '90vh' }"
      :closable="false"
      class="select-memories-dialog"
    >
      <div v-if="!loadingAssets" class="space-y-4">
        <!-- Instructions -->
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
          <div class="flex items-center space-x-3 mb-2">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <i class="pi pi-heart text-blue-600 text-sm"></i>
            </div>
            <h3 class="text-lg font-semibold text-color">Choose Your Memories</h3>
          </div>
          <p class="text-sm text-color-secondary">
            Select the memories you'd like to include in your memory book. You can filter by tags and select multiple memories at once.
          </p>
        </div>

        <!-- Filter Section -->
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <div class="flex flex-col sm:flex-row sm:items-center gap-4">
            <div class="flex-1 min-w-0">
              <label class="block text-sm font-medium text-color mb-2">Filter by Tags</label>
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
                  class="px-3"
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
                class="bg-green-500 hover:bg-green-600 border-0 text-xs sm:text-sm"
              />
              <Button
                label="Clear All"
                icon="pi pi-times"
                size="small"
                severity="secondary"
                @click="selectedMemories = []"
                class="text-xs sm:text-sm"
              />
            </div>
          </div>
          <div class="mt-2 text-sm text-color-secondary text-center sm:text-left">
            Showing {{ filteredAssets.length }} of {{ availableAssets.length }} memories
            <span v-if="selectedTagFilter && selectedTagFilter.length > 0" class="block sm:inline"> • Filtered by: {{ selectedTagFilter.join(', ') }}</span>
          </div>
        </div>

        <!-- Memories Grid -->
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <div v-if="filteredAssets.length === 0" class="text-center py-8 text-color-secondary">
            <i class="pi pi-images text-4xl mb-2 block"></i>
            <p class="text-lg font-medium">No memories found</p>
            <p class="text-sm">Try changing your filter or add some memories first</p>
          </div>
          <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 max-h-64 sm:max-h-96 overflow-y-auto">
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
                  class="absolute top-1 right-1 sm:top-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shadow-sm"
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
                  <i class="pi pi-image text-gray-400 text-lg sm:text-2xl"></i>
                </div>
              </div>
              
              <!-- Memory Info -->
              <div class="mt-1 sm:mt-2 text-center">
                <p class="text-xs font-medium text-color truncate px-1">
                  {{ asset.user_caption || asset.ai_caption || `Memory ${asset.id.slice(-4)}` }}
                </p>
                <p class="text-xs text-color-secondary">
                  {{ formatDate(asset.created_at) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Selection Summary -->
        <div class="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                <i class="pi pi-check text-green-600 text-sm"></i>
              </div>
              <div>
                <p class="text-sm font-medium text-color">
                  {{ selectedMemories.length }} memories selected
                </p>
                <p class="text-xs text-color-secondary">
                  Ready to create your memory book
                </p>
              </div>
            </div>
            <div class="text-center sm:text-right">
              <p class="text-xs text-color-secondary">
                Estimated pages: {{ Math.ceil(selectedMemories.length / 4) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else class="flex items-center justify-center py-12">
        <div class="text-center">
          <i class="pi pi-spin pi-spinner text-4xl mb-4 text-primary"></i>
          <p class="text-color-secondary">Loading your memories...</p>
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
              class="rounded-full px-5 py-2 text-sm font-bold shadow w-full sm:w-auto"
            />
          </div>
          <div class="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <span class="text-sm text-color-secondary text-center sm:text-left">
              {{ selectedMemories.length }} selected
            </span>
            <Button
              label="Save Selection"
              icon="pi pi-check"
              :disabled="selectedMemories.length === 0"
              @click="saveSelectedMemories"
              class="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-0 w-full sm:w-auto"
            />
          </div>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue'
const showPdfModal = ref(false)
const pdfBlobUrl = ref(null)
const isChrome = ref(false)
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

// Get initial user
const { data } = await supabase.auth.getUser()
user.value = data.user

// Watch for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  user.value = session?.user || null
  console.log('🔐 Auth state changed:', event, user.value?.id)
})

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
  printSize: '8x10',
  quality: 'standard',
  medium: 'digital',
  theme: 'classic',
  gridLayout: '2x2',
  memoryShape: 'natural',
  includeCaptions: true,
  includeTags: true
})

// Asset selection for new book
const selectedAssets = ref([])

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
    console.log('🔍 Loading memory books...')
    const books = await db.memoryBooks.getMemoryBooks()
    console.log('✅ Memory books loaded:', books?.length, 'books')
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
  if (!newBook.value.title) return

  creatingBook.value = true

  try {
    // Use selected assets if any, otherwise get all approved assets
    let assetsToUse = []
    
    if (selectedAssets.value.length > 0) {
      // Use selected assets
      assetsToUse = selectedAssets.value
    } else {
      // Get all approved assets
      const approvedAssets = await db.assets.getAssets({ approved: true })
      assetsToUse = approvedAssets.map(asset => asset.id)
    }
    
    if (assetsToUse.length === 0) {
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
      print_size: newBook.value.printSize,
      quality: newBook.value.quality,
      medium: newBook.value.medium,
      theme: newBook.value.theme,
      grid_layout: newBook.value.gridLayout,
      memory_shape: newBook.value.memoryShape,
      include_captions: newBook.value.includeCaptions,
      include_tags: newBook.value.includeTags,
      created_from_assets: assetsToUse,
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
      printSize: '8x10',
      quality: 'standard',
      medium: 'digital',
      theme: 'classic',
      gridLayout: '2x2',
      memoryShape: 'original',
      includeCaptions: true,
      includeTags: true
    }
    selectedAssets.value = [] // Reset selected assets
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
        currentProgressMessage.value = 'Your magical memory book is ready!'
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
        currentProgressMessage.value = 'Finalizing memory book status...'
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
        currentProgressMessage.value = 'Your magical memory book is ready!'
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
  currentProgressMessage.value = 'Starting the magical memory book creation...'
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

// View PDF in modal
const viewPDF = async (pdfUrl, bookId) => {
  // Force reset before setting new URL
  showPdfModal.value = false;
  pdfBlobUrl.value = null;
  await nextTick();
  pdfBlobUrl.value = pdfUrl;
  showPdfModal.value = true;
  console.log('PDF modal opened with URL:', pdfUrl);
};

watch(showPdfModal, (val) => {
  if (!val && pdfBlobUrl.value) {
    URL.revokeObjectURL(pdfBlobUrl.value)
    pdfBlobUrl.value = null
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
      year: 'numeric'
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
      created_from_assets: book.created_from_assets || []
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
      // Create mode - start with no selection
      selectedMemories.value = []
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
        detail: 'We have cleaned up your memory book so you can apply new magic!',
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


</script> 