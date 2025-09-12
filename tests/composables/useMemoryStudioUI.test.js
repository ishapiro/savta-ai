import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useMemoryStudioUI } from '~/composables/useMemoryStudioUI'

describe('useMemoryStudioUI', () => {
  let ui

  beforeEach(() => {
    ui = useMemoryStudioUI()
  })

  describe('initial state', () => {
    it('should initialize with correct default values', () => {
      expect(ui.activeView.value).toBe('cards')
      expect(ui.showCreateModal.value).toBe(false)
      expect(ui.showSuccessDialog.value).toBe(false)
      expect(ui.showDetailsModal.value).toBe(false)
      expect(ui.showProgressDialog.value).toBe(false)
      expect(ui.showApprovalDialog.value).toBe(false)
      expect(ui.showDeleteDialog.value).toBe(false)
      expect(ui.showGenerateDialog.value).toBe(false)
      expect(ui.showRegenerateDialog.value).toBe(false)
      expect(ui.showDownloadDraftDialog.value).toBe(false)
      expect(ui.showUpdateDescriptionDialog.value).toBe(false)
      expect(ui.showEditSettingsModal.value).toBe(false)
      expect(ui.showSelectMemoriesModal.value).toBe(false)
      expect(ui.showCleanupConfirmationModal.value).toBe(false)
      expect(ui.showMemoryBooksInfoBubble.value).toBe(false)
      expect(ui.showMagicMemoryDialog.value).toBe(false)
      expect(ui.showUploadDialog.value).toBe(false)
      expect(ui.showFileErrorDialog.value).toBe(false)
      expect(ui.showUploadProgressDialog.value).toBe(false)
      expect(ui.showAICaptionOverlay.value).toBe(false)
    })

    it('should initialize PDF viewer states correctly', () => {
      expect(ui.showPdfModal.value).toBe(false)
      expect(ui.pdfBlobUrl.value).toBe(null)
      expect(ui.currentPage.value).toBe(1)
      expect(ui.totalPages.value).toBe(1)
      expect(ui.zoomLevel.value).toBe(1.0)
      expect(ui.pdfLoaded.value).toBe(false)
    })

    it('should initialize selected items correctly', () => {
      expect(ui.selectedBook.value).toBe(null)
      expect(ui.bookToDelete.value).toBe(null)
      expect(ui.pendingBook.value).toBe(null)
      expect(ui.pendingApprovalBookId.value).toBe(null)
      expect(ui.cleanupBookId.value).toBe(null)
      expect(ui.editBook.value).toBe(null)
    })

    it('should initialize progress tracking correctly', () => {
      expect(ui.currentProgress.value).toBe(0)
      expect(ui.currentProgressMessage.value).toBe('')
      expect(ui.currentBookId.value).toBe(null)
      expect(ui.progressInterval.value).toBe(null)
      expect(ui.isRegenerating.value).toBe(false)
    })

    it('should initialize magic memory states correctly', () => {
      expect(ui.magicMemoryStep.value).toBe('title')
      expect(ui.currentButtonConfig.value).toBe(null)
      expect(ui.currentStepIndex.value).toBe(0)
      expect(ui.magicMemoryTitle.value).toBe('')
      expect(ui.magicMemoryEvent.value).toBe('')
      expect(ui.magicPhotoCount.value).toBe(4)
      expect(ui.magicBackgroundType.value).toBe('white')
      expect(ui.magicSolidBackgroundColor.value).toBe('#F9F6F2')
      expect(ui.magicSelectedTheme.value).toBe(null)
      expect(ui.magicThemeOptions.value).toEqual([])
      expect(ui.loadingMagicThemes.value).toBe(false)
      expect(ui.magicPhotoSelectionMethod.value).toBe('')
      expect(ui.magicDateRange.value).toEqual({ start: null, end: null })
      expect(ui.magicSelectedTags.value).toEqual([])
      expect(ui.magicLocationType.value).toBe('country')
      expect(ui.magicSelectedLocation.value).toBe('')
      expect(ui.availableCountries.value).toEqual([])
      expect(ui.availableStates.value).toEqual([])
      expect(ui.availableCities.value).toEqual([])
      expect(ui.magicSelectedTagFilter.value).toEqual([])
      expect(ui.magicSelectedMemories.value).toEqual([])
      expect(ui.magicLoading.value).toBe(false)
      expect(ui.magicCustomMemoryEvent.value).toBe('')
    })

    it('should initialize upload states correctly', () => {
      expect(ui.shouldOpenWizardAfterUpload.value).toBe(false)
      expect(ui.showSpecialUploadMessaging.value).toBe(false)
      expect(ui.uploadProgress.value).toBe(0)
      expect(ui.uploadStatus.value).toBe('')
      expect(ui.uploadingFiles.value).toEqual([])
      expect(ui.uploadedFiles.value).toEqual([])
      expect(ui.failedFiles.value).toEqual([])
      expect(ui.isUploading.value).toBe(false)
      expect(ui.magicUploadProgress.value).toEqual({ current: 0, total: 0, filename: '' })
    })

    it('should initialize form states correctly', () => {
      expect(ui.newBook.value).toEqual({
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
      expect(ui.createStep.value).toBe(1)
      expect(ui.selectedAssets.value).toEqual([])
      expect(ui.newDescription.value).toBe('')
      expect(ui.useNewPhotos.value).toBe(false)
      expect(ui.selectedMemories.value).toEqual([])
      expect(ui.selectedTagFilter.value).toEqual([])
      expect(ui.availableTags.value).toEqual([])
      expect(ui.filteredAssets.value).toEqual([])
      expect(ui.availableAssets.value).toEqual([])
    })

    it('should initialize error states correctly', () => {
      expect(ui.showErrorDialog.value).toBe(false)
      expect(ui.errorDialogMessage.value).toBe('')
      expect(ui.fileErrorDialogMessage.value).toBe('')
      expect(ui.lastMagicMemoryConfig.value).toBe(null)
      expect(ui.lastAICaption.value).toBe('')
    })

    it('should initialize loading states correctly', () => {
      expect(ui.creatingBook.value).toBe(false)
      expect(ui.savingEditBook.value).toBe(false)
    })
  })

  describe('computed properties', () => {
    it('should detect mobile correctly', () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500
      })
      expect(ui.isMobile.value).toBe(true)

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      })
      expect(ui.isMobile.value).toBe(false)
    })

    it('should detect share capability correctly', () => {
      // Mock navigator.share
      Object.defineProperty(navigator, 'share', {
        writable: true,
        configurable: true,
        value: vi.fn()
      })
      expect(ui.canShare.value).toBe(true)

      Object.defineProperty(navigator, 'share', {
        writable: true,
        configurable: true,
        value: undefined
      })
      expect(ui.canShare.value).toBe(false)
    })
  })

  describe('methods', () => {
    it('should reset create modal correctly', () => {
      ui.createStep.value = 2
      ui.newBook.value.title = 'Test Title'
      ui.newBook.value.ai_supplemental_prompt = 'Test Prompt'

      ui.resetCreateModal()

      expect(ui.createStep.value).toBe(1)
      expect(ui.newBook.value).toEqual({
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
    })

    it('should close create modal correctly', () => {
      ui.showCreateModal.value = true
      ui.createStep.value = 2
      ui.newBook.value.title = 'Test Title'

      ui.closeCreateModal()

      expect(ui.showCreateModal.value).toBe(false)
      expect(ui.createStep.value).toBe(1)
      expect(ui.newBook.value.title).toBe('')
    })

    it('should navigate steps correctly', () => {
      expect(ui.createStep.value).toBe(1)
      
      ui.nextStep()
      expect(ui.createStep.value).toBe(2)
      
      ui.previousStep()
      expect(ui.createStep.value).toBe(1)
    })

    it('should cancel dialogs correctly', () => {
      ui.showGenerateDialog.value = true
      ui.showRegenerateDialog.value = true
      ui.showDownloadDraftDialog.value = true
      ui.showUpdateDescriptionDialog.value = true
      ui.pendingBook.value = { id: 'test' }

      ui.cancelDialog()

      expect(ui.showGenerateDialog.value).toBe(false)
      expect(ui.showRegenerateDialog.value).toBe(false)
      expect(ui.showDownloadDraftDialog.value).toBe(false)
      expect(ui.showUpdateDescriptionDialog.value).toBe(false)
      expect(ui.pendingBook.value).toBe(null)
    })

    it('should stop progress polling correctly', () => {
      const mockInterval = vi.fn()
      ui.progressInterval.value = mockInterval

      ui.stopProgressPolling()

      expect(ui.progressInterval.value).toBe(null)
    })

    it('should update mobile state correctly', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500
      })

      ui.updateIsMobile()

      expect(ui.isMobile.value).toBe(true)
    })
  })
})
