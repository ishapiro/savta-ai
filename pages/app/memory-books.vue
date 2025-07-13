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
              <!-- Unapprove Button -->
              <button
                v-if="book.status === 'approved'"
                class="w-10 h-10 flex items-center justify-center rounded-full shadow bg-white text-orange-600 hover:text-orange-700 transition-colors"
                v-tooltip.top="'Return to review - this will move the book back to ready status'"
                @click="unapproveBook(book.id)"
              >
                <i class="pi pi-undo text-lg"></i>
              </button>
              <!-- View Details Button -->
              <button
                class="w-10 h-10 flex items-center justify-center rounded-full shadow bg-white text-gray-600 hover:text-gray-800 transition-colors"
                v-tooltip.top="'View Details'"
                @click="viewBookDetails(book)"
              >
                <i class="pi pi-eye text-lg"></i>
              </button>
              <!-- Edit Settings Button -->
              <button
                class="w-10 h-10 flex items-center justify-center rounded-full shadow bg-white text-blue-600 hover:text-blue-700 transition-colors"
                v-tooltip.top="'Edit Settings & Assets'"
                @click="openEditSettings(book)"
              >
                <i class="pi pi-cog text-lg"></i>
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
    <Dialog v-model:visible="showRegenerateDialog" modal :header="null" :closable="false" class="w-full md:w-[40%] p-0">
      <div class="py-4 px-4">
        <p>Would you like to create a fresh, new version of this memory book with a brand new AI-generated background design? 
          It's like giving your memories a beautiful new frame! This will take a few moments to create something special just for 
          you. If you're happy with the current version and just want to download it right away, you can use the download button below - 
          that's much faster!</p>
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
      <div v-if="editBook" class="space-y-4">
        <div class="field">
          <label class="block text-sm font-medium text-color mb-1">Book Title</label>
          <InputText
            v-model="editBook.title"
            placeholder="Enter a title for your memory book"
            class="w-full"
          />
        </div>
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
        
        <!-- Select Memories Button -->
        <div class="field">
          <label class="block text-sm font-medium text-color mb-2">Memory Assets</label>
          <div class="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <i class="pi pi-images text-blue-600"></i>
              </div>
              <div>
                <p class="text-sm font-medium text-color">
                  {{ editBook.created_from_assets.length }} memories selected
                </p>
                <p class="text-xs text-color-secondary">
                  Click to choose which memories to include
                </p>
              </div>
            </div>
            <Button
              label="Select Memories"
              icon="pi pi-edit"
              size="small"
              @click="openSelectMemoriesDialog"
              class="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-0"
            />
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end space-x-2">
          <Button
            label="Cancel"
            severity="secondary"
            @click="showEditSettingsModal = false"
          />
          <Button
            label="Save Changes"
            :loading="savingEditBook"
            :disabled="!editBook.title"
            @click="saveEditBook"
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
        <div class="flex flex-col sm:flex-row justify-between items-center gap-3">
          <Button
            label="Cancel"
            severity="secondary"
            @click="closeSelectMemoriesDialog"
            class="w-full sm:w-auto"
          />
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
onMounted(async () => {
  await loadMemoryBooks()
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
        currentProgressMessage.value = 'Warming up the magic ...'
        
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
        currentProgressMessage.value = 'Starting up the magic ...'
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
    
    // Map book fields to editable fields
    editBook.value = {
      id: book.id,
      title: book.title,
      layoutType: book.layout_type || book.layoutType || 'grid',
      printSize: book.print_size || book.printSize || '8x10',
      quality: book.quality || 'standard',
      medium: book.medium || 'digital',
      theme: book.theme || 'classic',
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
    selectedMemories.value = editBook.value.created_from_assets || []
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
  editBook.value.created_from_assets = selectedMemories.value
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
</script> 