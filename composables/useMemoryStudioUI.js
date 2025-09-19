import { ref, computed } from 'vue'

export const useMemoryStudioUI = () => {
  // View toggle state
  const activeView = ref('cards')

  // Modal states
  const showCreateModal = ref(false)
  const showDetailsModal = ref(false)
  const showProgressDialog = ref(false)
  const showApprovalDialog = ref(false)
  const showDeleteDialog = ref(false)
  const showGenerateDialog = ref(false)
  const showRegenerateDialog = ref(false)
  const showDownloadDraftDialog = ref(false)
  const showUpdateDescriptionDialog = ref(false)
  const showEditSettingsModal = ref(false)
  const showSelectMemoriesModal = ref(false)
  const showCleanupConfirmationModal = ref(false)
  const showMemoryBooksInfoBubble = ref(false)
  const showMagicMemoryDialog = ref(false)
  const showUploadDialog = ref(false)
  const showFileErrorDialog = ref(false)
  const showUploadProgressDialog = ref(false)
  const showAICaptionOverlay = ref(false)

  // PDF viewer states
  const showPdfModal = ref(false)
  const pdfBlobUrl = ref(null)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const zoomLevel = ref(1.0)
  const pdfLoaded = ref(false)

  // Selected items
  const selectedBook = ref(null)
  const bookToDelete = ref(null)
  const pendingBook = ref(null)
  const pendingApprovalBookId = ref(null)
  const cleanupBookId = ref(null)
  const editBook = ref(null)

  // Progress tracking
  const currentProgress = ref(0)
  const currentProgressMessage = ref('')
  const currentBookId = ref(null)
  const progressInterval = ref(null)
  const isRegenerating = ref(false)

  // Magic memory states
  const magicMemoryStep = ref('title')
  const currentButtonConfig = ref(null)
  const currentStepIndex = ref(0)
  const magicMemoryTitle = ref('')
  const magicMemoryEvent = ref('')
  const magicPhotoCount = ref(4)
  const magicBackgroundType = ref('white')
  const magicSolidBackgroundColor = ref('#F9F6F2')
  const magicSelectedTheme = ref(null)
  const magicThemeOptions = ref([])
  const loadingMagicThemes = ref(false)
  const magicPhotoSelectionMethod = ref('')
  const magicDateRange = ref({ start: null, end: null })
  const magicSelectedTags = ref([])
  const magicLocationType = ref('country')
  const magicSelectedLocation = ref('')
  const availableCountries = ref([])
  const availableStates = ref([])
  const availableCities = ref([])
  const magicSelectedTagFilter = ref([])
  const magicSelectedMemories = ref([])
  const magicLoading = ref(false)
  const magicCustomMemoryEvent = ref('')

  // Upload states
  const shouldOpenWizardAfterUpload = ref(false)
  const showSpecialUploadMessaging = ref(false)
  const uploadProgress = ref(0)
  const uploadStatus = ref('')
  const uploadingFiles = ref([])
  const uploadedFiles = ref([])
  const failedFiles = ref([])
  const isUploading = ref(false)
  const magicUploadProgress = ref({ current: 0, total: 0, filename: '' })

  // Form states
  const newBook = ref({
    title: '',
    ai_supplemental_prompt: '',
    layoutType: 'grid',
    printSize: '5x7',
    quality: 'standard',
    medium: 'digital',
    output: 'PDF',
    gridLayout: '1x1',
    memoryShape: 'original',
    memoryEvent: 'vacation'
  })

  // Selected photos for memory book (from photo selection route)
  const selectedPhotosForMemoryBook = ref([])

  const createStep = ref(1)
  const selectedAssets = ref([])
  const newDescription = ref('')
  const useNewPhotos = ref(false)
  const selectedMemories = ref([])
  const selectedTagFilter = ref([])
  const availableTags = ref([])
  const filteredAssets = ref([])
  const availableAssets = ref([])

  // Error states
  const showErrorDialog = ref(false)
  const errorDialogMessage = ref('')
  const fileErrorDialogMessage = ref('')
  const lastMagicMemoryConfig = ref(null)
  const lastAICaption = ref('')

  // Loading states
  const creatingBook = ref(false)
  const savingEditBook = ref(false)

  // Computed properties
  const isMobile = computed(() => {
    if (process.client) {
      return window.innerWidth < 768
    }
    return false
  })

  const canShare = computed(() => {
    if (process.client) {
      return navigator && navigator.share
    }
    return false
  })

  // Methods
  const resetCreateModal = () => {
    createStep.value = 1
    newBook.value = {
      title: '',
      ai_supplemental_prompt: '',
      layoutType: 'grid',
      printSize: '5x7',
      quality: 'standard',
      medium: 'digital',
      output: 'PDF',
      gridLayout: '1x1',
      memoryShape: 'original',
      memoryEvent: 'vacation'
    }
  }

  const closeCreateModal = () => {
    showCreateModal.value = false
    resetCreateModal()
  }

  const nextStep = () => {
    if (createStep.value === 1) {
      createStep.value = 2
    }
  }

  const previousStep = () => {
    if (createStep.value === 2) {
      createStep.value = 1
    }
  }

  const cancelDialog = () => {
    showGenerateDialog.value = false
    showRegenerateDialog.value = false
    showDownloadDraftDialog.value = false
    showUpdateDescriptionDialog.value = false
    pendingBook.value = null
  }

  const stopProgressPolling = () => {
    if (progressInterval.value) {
      clearInterval(progressInterval.value)
      progressInterval.value = null
    }
  }

  const updateIsMobile = () => {
    if (process.client) {
      isMobile.value = window.innerWidth < 768
    }
  }

  return {
    // View state
    activeView,

    // Modal states
    showCreateModal,
    showDetailsModal,
    showProgressDialog,
    showApprovalDialog,
    showDeleteDialog,
    showGenerateDialog,
    showRegenerateDialog,
    showDownloadDraftDialog,
    showUpdateDescriptionDialog,
    showEditSettingsModal,
    showSelectMemoriesModal,
    showCleanupConfirmationModal,
    showMemoryBooksInfoBubble,
    showMagicMemoryDialog,
    showUploadDialog,
    showFileErrorDialog,
    showUploadProgressDialog,
    showAICaptionOverlay,

    // PDF viewer states
    showPdfModal,
    pdfBlobUrl,
    currentPage,
    totalPages,
    zoomLevel,
    pdfLoaded,

    // Selected items
    selectedBook,
    bookToDelete,
    pendingBook,
    pendingApprovalBookId,
    cleanupBookId,
    editBook,

    // Progress tracking
    currentProgress,
    currentProgressMessage,
    currentBookId,
    progressInterval,
    isRegenerating,

    // Magic memory states
    magicMemoryStep,
    currentButtonConfig,
    currentStepIndex,
    magicMemoryTitle,
    magicMemoryEvent,
    magicPhotoCount,
    magicBackgroundType,
    magicSolidBackgroundColor,
    magicSelectedTheme,
    magicThemeOptions,
    loadingMagicThemes,
    magicPhotoSelectionMethod,
    magicDateRange,
    magicSelectedTags,
    magicLocationType,
    magicSelectedLocation,
    availableCountries,
    availableStates,
    availableCities,
    magicSelectedTagFilter,
    magicSelectedMemories,
    magicLoading,
    magicCustomMemoryEvent,

    // Upload states
    shouldOpenWizardAfterUpload,
    showSpecialUploadMessaging,
    uploadProgress,
    uploadStatus,
    uploadingFiles,
    uploadedFiles,
    failedFiles,
    isUploading,
    magicUploadProgress,

    // Form states
    newBook,
    createStep,
    selectedAssets,
    selectedPhotosForMemoryBook,
    newDescription,
    useNewPhotos,
    selectedMemories,
    selectedTagFilter,
    availableTags,
    filteredAssets,
    availableAssets,

    // Error states
    showErrorDialog,
    errorDialogMessage,
    fileErrorDialogMessage,
    lastMagicMemoryConfig,
    lastAICaption,

    // Loading states
    creatingBook,
    savingEditBook,

    // Computed
    isMobile,
    canShare,

    // Methods
    resetCreateModal,
    closeCreateModal,
    nextStep,
    previousStep,
    cancelDialog,
    stopProgressPolling,
    updateIsMobile
  }
}
