<template>
  <Dialog
    v-model:visible="showMagicMemoryDialog"
    modal
    :closable="false"
    :dismissable-mask="false"
    :class="['w-full', 'h-full', 'max-w-none', 'max-h-screen', 'sm:w-[700px]', 'sm:max-w-[700px]', 'sm:h-auto', 'm-0', 'rounded-none', 'sm:rounded-2xl', 'mobile-app-dialog']"
  >
    <!-- Step 1: Title Input -->
    <div v-if="magicMemoryStep === MAGIC_STEPS.TITLE && currentButtonConfig?.steps.includes(MAGIC_STEPS.TITLE)"
      class="h-full min-h-screen m-0 rounded-none flex flex-col items-center pt-2 px-4 py-4 pb-20 sm:pb-4 bg-white overflow-x-hidden sm:w-auto sm:h-auto sm:min-h-0 sm:rounded-2xl sm:px-6 sm:py-6">
      <!-- Edit Mode Button -->
      <div v-if="isRecreateMode" class="flex justify-center mb-4">
        <Button
          :label="'Edit Mode'"
          icon="pi pi-pencil"
          class="bg-brand-dialog-save text-white border-0 px-3 sm:px-4 py-2 sm:py-3 rounded-full font-bold text-xs sm:text-sm shadow transition-all duration-200 flex items-center justify-center"
        />
      </div>
      
      
      <div class="text-center mb-6 sm:mb-8 max-w-md w-full mx-auto sm:max-w-full">
        <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-brand-secondary to-brand-highlight rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
          <i class="pi pi-gift text-white text-2xl sm:text-3xl"></i>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-3 leading-tight">✨ Tell us about the memory you'd like to create ✨</h3>
        <section class="memory-instructions text-left max-w-lg mx-auto" aria-labelledby="memory-title">
          <p class="text-sm text-gray-600 mb-3 leading-relaxed">I'll use your description to find the best photos and create a beautiful story.</p>
          <ul class="text-left space-y-2 text-xs sm:text-sm text-gray-600 leading-relaxed list-disc pl-5">
            <li>Share details like <em class="text-gray-700 font-medium">who was there, where it happened, or when it was</em></li>
            <li>Or describe a theme like <em class="text-gray-700 font-medium">"Our family trip to Paris"</em> or <em class="text-gray-700 font-medium">"Birthday celebrations"</em></li>
            <li>Feel free to include a specific date or location if you'd like.</li>
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
        />
        <small class="text-gray-500 text-sm mt-1 block leading-relaxed">I'll use this to find your best photos and create a beautiful story.</small>
      </div>
    </div>

    <!-- Step 2: Theme Selection -->
    <div v-if="magicMemoryStep === MAGIC_STEPS.THEME && currentButtonConfig?.steps.includes(MAGIC_STEPS.THEME)"
      class="h-full min-h-screen m-0 rounded-none flex flex-col items-center pt-2 px-4 py-4 pb-20 sm:pb-4 bg-white overflow-x-hidden sm:w-auto sm:h-auto sm:min-h-0 sm:rounded-2xl sm:px-6 sm:py-6">
      <!-- Edit Mode Button -->
      <div v-if="isRecreateMode" class="flex justify-center mb-4">
        <Button
          :label="'Edit Mode'"
          icon="pi pi-pencil"
          class="bg-brand-dialog-save text-white border-0 px-3 sm:px-4 py-2 sm:py-3 rounded-full font-bold text-xs sm:text-sm shadow transition-all duration-200 flex items-center justify-center"
        />
      </div>
      
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
      class="h-full min-h-screen m-0 rounded-none flex flex-col items-center pt-2 px-4 py-4 pb-20 sm:pb-4 bg-white overflow-x-hidden sm:w-auto sm:h-auto sm:min-h-0 sm:rounded-2xl sm:px-6 sm:py-6">
      <!-- Edit Mode Button -->
      <div v-if="isRecreateMode" class="flex justify-center mb-4">
        <Button
          :label="'Edit Mode'"
          icon="pi pi-pencil"
          class="bg-brand-dialog-save text-white border-0 px-3 sm:px-4 py-2 sm:py-3 rounded-full font-bold text-xs sm:text-sm shadow transition-all duration-200 flex items-center justify-center"
        />
      </div>
      
      <div class="text-center mb-2 sm:mb-3 max-w-xs w-full mx-auto sm:max-w-full">
        <div class="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-brand-secondary to-brand-highlight rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
          <i class="pi pi-palette text-xl sm:text-2xl text-white"></i>
        </div>
        <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-1">Customize the Background</h3>
        <p class="text-sm sm:text-base text-gray-600 mb-2">
          Choose a beautiful background color for your memory card.
        </p>
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
              :style="{ backgroundColor: magicSolidBackgroundColor }"
            />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Preview</label>
            <div class="w-full h-12 rounded-lg border-2 border-gray-200 flex items-center justify-center"
                 :style="{ backgroundColor: magicSolidBackgroundColor }">
              <span class="text-sm font-medium" :class="getContrastTextClass(magicSolidBackgroundColor)">
                Memory Card
              </span>
            </div>
          </div>
        </div>
        <div class="mt-3 text-xs text-gray-600 text-center">
          <p>This color will be the background for your entire memory card</p>
        </div>
      </div>
    </div>

    <!-- Step 3: Photo Selection Method -->
    <div v-if="magicMemoryStep === MAGIC_STEPS.PHOTOS && currentButtonConfig?.steps.includes(MAGIC_STEPS.PHOTOS)"
      class="h-full min-h-screen m-0 rounded-none flex flex-col items-center pt-2 px-4 py-4 pb-20 sm:pb-4 bg-white overflow-x-hidden sm:w-auto sm:h-auto sm:min-h-0 sm:rounded-2xl sm:px-6 sm:py-6">
      <!-- Edit Mode Button -->
      <div v-if="isRecreateMode" class="flex justify-center mb-4">
        <Button
          :label="'Edit Mode'"
          icon="pi pi-pencil"
          class="bg-brand-dialog-save text-white border-0 px-3 sm:px-4 py-2 sm:py-3 rounded-full font-bold text-xs sm:text-sm shadow transition-all duration-200 flex items-center justify-center"
        />
      </div>
      
      <div class="text-center mb-2 sm:mb-3 max-w-xs w-full mx-auto sm:max-w-full">
        <div class="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-brand-flash to-brand-highlight rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
          <i class="pi pi-images text-xl sm:text-2xl text-white"></i>
        </div>
        <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-1">
          {{ isRecreateMode ? 'How should I pick your new photos?' : 'How should I pick your photos?' }}
        </h3>
        <p class="text-xs sm:text-base text-gray-600 mb-2">
          {{ isRecreateMode 
            ? 'You can keep the same photos or choose new ones. When you upload photos, they go into your Photo Box. Then I\'ll choose the best ones and write lovely captions for your card or booklet.' 
            : 'When you upload photos, they go into your Photo Box. Then I\'ll choose the best ones and write lovely captions for your card or booklet. Choose how you\'d like me to pick photos from your Photo Box.' 
          }}
        </p>
        <p class="text-xs text-brand-flash font-medium">📸 You have {{ photoSelection_availableAssets.length }} photo{{ photoSelection_availableAssets.length !== 1 ? 's' : '' }} in your Photo Box</p>
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
        :isUploading="photoSelection_isUploading"
        :maxPhotoCount="4"
        :isRecreateMode="isRecreateMode"
        @upload-photos="handleUploadPhotos"
        @photo-library-selected="nextMagicMemoryStep"
        @no-photos-found="handleNoPhotosFound"
        @close-photo-library="handleClosePhotoLibrary"
      />
    </div>

    <!-- Step 4: Photo Replacement Selection (for replace_selected method) -->
    <div v-if="magicMemoryStep === MAGIC_STEPS.PHOTO_REPLACEMENT && photoSelection_method === 'replace_selected'"
      class="h-full min-h-screen m-0 rounded-none flex flex-col items-center pt-2 px-4 py-4 pb-20 sm:pb-4 bg-white overflow-x-hidden sm:w-auto sm:h-auto sm:min-h-0 sm:rounded-2xl sm:px-6 sm:py-6">
      <!-- Edit Mode Button -->
      <div v-if="isRecreateMode" class="flex justify-center mb-4">
        <Button
          :label="'Edit Mode'"
          icon="pi pi-pencil"
          class="bg-brand-dialog-save text-white border-0 px-3 sm:px-4 py-2 sm:py-3 rounded-full font-bold text-xs sm:text-sm shadow transition-all duration-200 flex items-center justify-center"
        />
      </div>
      
      <!-- Shared Photo Replacement Selector -->
      <PhotoReplacementSelector
        :existing-assets="existingBookForRecreation?.created_from_assets || []"
        :asset-thumbnails="assetThumbnails"
        item-type="memory card"
        v-model="photosToReplace"
      />
    </div>

    <!-- Step 5: Photo Library Selection (MANUAL step for photo_library method) -->
    <div v-if="magicMemoryStep === MAGIC_STEPS.MANUAL && photoSelection_method === 'photo_library'"
      class="h-full min-h-screen m-0 rounded-none flex flex-col items-center pt-2 px-4 py-4 pb-20 sm:pb-4 bg-white overflow-x-hidden sm:w-auto sm:h-auto sm:min-h-0 sm:rounded-2xl sm:px-6 sm:py-6">
      <!-- Edit Mode Button -->
      <div v-if="isRecreateMode" class="flex justify-center mb-4">
        <Button
          :label="'Edit Mode'"
          icon="pi pi-pencil"
          class="bg-brand-dialog-save text-white border-0 px-3 sm:px-4 py-2 sm:py-3 rounded-full font-bold text-xs sm:text-sm shadow transition-all duration-200 flex items-center justify-center"
        />
      </div>
      
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
        :isUploading="photoSelection_isUploading"
        :maxPhotoCount="4"
        @upload-photos="handleUploadPhotos"
        @photo-library-selected="nextMagicMemoryStep"
        @no-photos-found="handleNoPhotosFound"
        @close-photo-library="handleClosePhotoLibrary"
      />
    </div>

    <!-- Navigation Footer -->
    <template #footer>
      <div class="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-b-2xl fixed bottom-0 left-0 right-0 sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:rounded-b-2xl">
        <!-- Mobile: Stack buttons vertically with smaller spacing -->
        <div class="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:gap-3">
          <!-- Cancel Button -->
          <Button
            label="Cancel"
            icon="pi pi-times"
            @click="() => closeMagicMemoryDialog(true, true)"
            class="bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-full px-3 py-2 text-xs shadow-lg transition-all duration-200 w-full sm:w-auto"
          />
          
          <!-- Back Button (not on first step) -->
          <Button
            v-if="!isFirstStep()"
            label="Back"
            icon="pi pi-arrow-left"
            @click="previousMagicMemoryStep()"
            class="bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-full px-3 py-2 text-xs shadow-lg transition-all duration-200 w-full sm:w-auto"
          />
        </div>
        
        <!-- Next/Generate Button - Full width on mobile, auto on desktop -->
        <Button
          v-if="!isLastStep()"
          :label="getNextButtonLabel()"
          icon="pi pi-arrow-right"
          :disabled="isNextButtonDisabled"
          @click="nextMagicMemoryStep"
          class="bg-brand-secondary hover:bg-brand-secondary/80 text-white font-bold rounded-full px-4 py-2 text-xs shadow-lg transition-all duration-200 w-full sm:w-auto border-0"
        />
        
        <Button
          v-if="isLastStep()"
          label="Let's create something beautiful together"
          icon="pi pi-bolt"
          :disabled="isNextButtonDisabled || magicLoading"
          :loading="magicLoading"
          @click="handleGenerateMagicMemory"
          class="bg-brand-secondary hover:bg-brand-secondary/80 text-white font-bold rounded-full px-4 py-2 text-xs shadow-lg transition-all duration-200 w-full sm:w-auto border-0"
        />
      </div>
    </template>
  </Dialog>

  <!-- Progress Dialog -->
  <ProgressDialog
    :show-progress-dialog="showProgressDialog"
    :current-progress="currentProgress"
    :current-progress-message="currentProgressMessage"
    :is-regenerating="isRegenerating"
  />

  <!-- Insufficient Photos Dialog -->
  <Dialog 
    v-model:visible="showInsufficientPhotosDialog" 
    modal 
    header="Not Enough Photos Available" 
    :style="{ width: '400px' }"
    :closable="false"
  >
    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-3">
        <i class="pi pi-exclamation-triangle text-orange-500 text-xl"></i>
        <p class="text-gray-700">
          I don't have enough new photos to replace the ones you selected. What would you like to do?
        </p>
      </div>
      
      <div class="flex flex-col gap-2">
        <Button 
          label="Keep the Same Photos" 
          icon="pi pi-check" 
          @click="handleKeepSamePhotos"
          class="bg-brand-dialog-edit text-white border-0 px-3 sm:px-4 py-2 sm:py-3 rounded-full font-bold text-xs sm:text-sm shadow transition-all duration-200 flex items-center justify-center w-full"
        />
        <Button 
          label="Upload More Photos" 
          icon="pi pi-upload" 
          @click="handleUploadMorePhotos"
          class="bg-brand-dialog-save text-white border-0 px-3 sm:px-4 py-2 sm:py-3 rounded-full font-bold text-xs sm:text-sm shadow-lg transition-all duration-200 flex items-center justify-center w-full"
        />
      </div>
    </div>
  </Dialog>

</template>

<script setup>
import { useMagicMemoryWizard } from '~/composables/useMagicMemoryWizard'
import { useMemoryStudio } from '~/composables/useMemoryStudio'
import PhotoSelectionInterface from '~/components/PhotoSelectionInterface.vue'
import ProgressDialog from '~/components/ProgressDialog.vue'
import { useToast } from 'primevue/usetoast'

// Use the wizard composable
const {
  showMagicMemoryDialog,
  magicMemoryStep,
  currentButtonConfig,
  currentStepIndex,
  magicMemoryTitle,
  magicMemoryEvent,
  magicCustomMemoryEvent,
  magicPhotoCount,
  magicBackgroundType,
  magicSolidBackgroundColor,
  magicSelectedTheme,
  magicThemeOptions,
  loadingMagicThemes,
  magicLoading,
  magicFilteredAssets,
  
  // Photo selection state
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
  
  // Recreation state
  existingBookForRecreation,
  isRecreateMode,
  photosToReplace,
  
  // Progress dialog state
  showProgressDialog,
  currentProgress,
  currentProgressMessage,
  currentBookId,
  isRegenerating,
  
  // Constants
  MAGIC_STEPS,
  stepDefinitions,
  buttonConfigs,
  
  // Computed
  isNextButtonDisabled,
  
  // Methods
  toggleMagicMemorySelection,
  togglePhotoReplacement,
  isFirstStep,
  isLastStep,
  getNextStepName,
  getNextButtonLabel,
  nextMagicMemoryStep,
  previousMagicMemoryStep,
  openMagicMemoryDialog,
  closeMagicMemoryDialog,
  generateMagicMemory,
  fetchMagicThemes,
  
  // Photo selection methods
  photoSelection_loadAvailableAssets,
  photoSelection_loadLocationData,
  photoSelection_toggleMemorySelection,
  photoSelection_populatePhotoSelectionPool,
  photoSelection_resetSelection,
  photoSelection_getSelectedAssets
} = useMagicMemoryWizard()

// Memory studio functionality
const { getAssetThumbnail, assetThumbnails } = useMemoryStudio()

// Toast functionality
const toast = useToast()


// Wrapper function for generateMagicMemory with toast notifications
const handleGenerateMagicMemory = async () => {
  try {
    await generateMagicMemory()
    
    // Show success toast
    toast.add({
      severity: 'success',
      summary: 'Success!',
      detail: 'Your magic memory card has been created successfully!',
      life: 3000
    })
  } catch (error) {
    console.error('Error in handleGenerateMagicMemory:', error)
    
    // Check if it's the insufficient photos error
    if (error.message && error.message.includes('Not enough photos available for replacement')) {
      // Show insufficient photos dialog
      showInsufficientPhotosDialog.value = true
    } else {
      // Show generic error toast for other errors
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to create magic memory card. Please try again.',
        life: 5000
      })
    }
  }
}

// Dialog state for insufficient photos
const showInsufficientPhotosDialog = ref(false)

// Handle insufficient photos dialog actions
const handleKeepSamePhotos = async () => {
  showInsufficientPhotosDialog.value = false
  closeMagicMemoryDialog(false, false)
  
  // Switch to keep_same mode and restart the wizard
  photoSelection_method.value = 'keep_same'
  setTimeout(() => {
    openMagicMemoryDialog('recreation', existingBookForRecreation.value)
  }, 500)
}

const handleUploadMorePhotos = () => {
  showInsufficientPhotosDialog.value = false
  closeMagicMemoryDialog(false, false)
  navigateTo('/app/upload?from=wizard&return=wizard')
}

// Restart the wizard with "keep_same" option
const restartWizardWithKeepSame = async () => {
  try {
    // Get the existing book data
    const existingBook = existingBookForRecreation.value
    if (!existingBook) {
      console.error('No existing book found for recreation')
      return
    }
    
    // Reset the wizard state
    photosToReplace.value = []
    
    // Open the wizard again with the same book
    await openMagicMemoryDialog('quick', existingBook)
    
    // Automatically set to "keep_same" mode
    photoSelection_method.value = 'keep_same'
    
    // Show a helpful message
    toast.add({
      severity: 'info',
      summary: 'Switched to Keep Same Photos',
      detail: 'I\'ll keep your original photos and create a new memory card with the same photos.',
      life: 4000
    })
  } catch (error) {
    console.error('Error restarting wizard:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to restart the wizard. Please try again.',
      life: 5000
    })
  }
}

// Helper function for text contrast
const getContrastTextClass = (backgroundColor) => {
  if (!backgroundColor) return 'text-gray-900'
  
  // Convert hex to RGB
  const hex = backgroundColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  return luminance > 0.5 ? 'text-gray-900' : 'text-white'
}

// Event handlers for PhotoSelectionInterface
const handleUploadPhotos = () => {
  // Close the wizard dialog and navigate to dedicated upload route
  closeMagicMemoryDialog(true, true)
  navigateTo('/app/memory-books/upload?from=wizard&return=wizard')
}

const handleNoPhotosFound = (data) => {
  // Mirror original behavior from index-original-before-refactor.vue
  console.log('🔍 [handleNoPhotosFound] No photos found for method:', data?.method)

  let title = 'No Photos Found'
  let message = data?.message

  // Provide friendly defaults if message not provided
  if (!message) {
    switch (data?.method) {
      case 'smart_selection':
        message = "I couldn't find matching photos. Try a different date, tags, or location."
        break
      case 'date_range':
        message = 'No photos in that date range. Try widening the range.'
        break
      case 'tags':
        message = 'No photos with those tags. Try different or fewer tags.'
        break
      case 'location':
        message = 'No photos for that location. Try a nearby place or city.'
        break
      case 'photo_library':
        message = 'Your Photo Box is empty. Upload photos to continue.'
        break
      default:
        message = 'No matching photos found. Try adjusting your selections.'
    }
  }

  console.log('🔍 [handleNoPhotosFound] Showing toast with:', { title, message })

  toast.add({
    severity: 'warn',
    summary: title,
    detail: message,
    life: 4000
  })
}

const handleClosePhotoLibrary = () => {
  // Mirror original behavior from index-original-before-refactor.vue
  console.log('🔍 [handleClosePhotoLibrary] Photo library closed, returning to PHOTOS step')

  // Reset the step back to PHOTOS
  magicMemoryStep.value = MAGIC_STEPS.PHOTOS

  // Clear any selected memories
  photoSelection_selectedMemories.value = []

  console.log('🔍 [handleClosePhotoLibrary] Step reset to:', magicMemoryStep.value)
}

// Expose methods for parent component
defineExpose({
  openMagicMemoryDialog,
  closeMagicMemoryDialog
})
</script>

<style scoped>
/* Mobile app-like styling */
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
}

/* Edit Mode Indicator Styling */
</style>
