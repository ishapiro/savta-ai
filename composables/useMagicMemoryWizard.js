import { ref, computed, watch } from 'vue'
import { usePhotoSelection } from '~/composables/usePhotoSelection'
import { useProgressDialog } from '~/composables/useProgressDialog'
import { useMemoryStudio } from '~/composables/useMemoryStudio'

export const useMagicMemoryWizard = () => {
  // Dialog visibility
  const showMagicMemoryDialog = ref(false)

  // Step identifiers
  const MAGIC_STEPS = {
    TITLE: 'title',
    EVENT: 'event', 
    COUNT: 'count',
    BACKGROUND: 'background',
    THEME: 'theme',
    PHOTOS: 'photos',
    PHOTO_REPLACEMENT: 'photo_replacement',
    MANUAL: 'manual'
  }

  // Step definitions with required/optional flags
  const stepDefinitions = {
    [MAGIC_STEPS.TITLE]: { name: "Title Input", required: true },
    [MAGIC_STEPS.THEME]: { name: "Theme Selection", required: false },
    [MAGIC_STEPS.BACKGROUND]: { name: "Background Selection", required: true },
    [MAGIC_STEPS.PHOTOS]: { name: "Photo Selection Method", required: true },
    [MAGIC_STEPS.PHOTO_REPLACEMENT]: { name: "Photo Replacement", required: true },
    [MAGIC_STEPS.MANUAL]: { name: "Photo Selection", required: true }
  }

  // Button configurations defining which steps to include
  const buttonConfigs = {
    full: { 
      steps: [MAGIC_STEPS.TITLE, MAGIC_STEPS.THEME, MAGIC_STEPS.BACKGROUND, MAGIC_STEPS.PHOTOS], 
      name: "Full Magic Memory" 
    },
    basic: { 
      steps: [MAGIC_STEPS.TITLE, MAGIC_STEPS.THEME, MAGIC_STEPS.BACKGROUND, MAGIC_STEPS.PHOTOS], 
      name: "Basic Magic Memory" 
    },
    quick: { 
      steps: [MAGIC_STEPS.TITLE, MAGIC_STEPS.THEME, MAGIC_STEPS.BACKGROUND, MAGIC_STEPS.PHOTOS], 
      name: "Quick Magic Memory" 
    },
    recreation: {
      steps: [MAGIC_STEPS.TITLE, MAGIC_STEPS.THEME, MAGIC_STEPS.BACKGROUND, MAGIC_STEPS.PHOTOS, MAGIC_STEPS.PHOTO_REPLACEMENT],
      name: "Recreate Memory"
    }
  }

  // Current wizard state
  const magicMemoryStep = ref(MAGIC_STEPS.TITLE)
  const currentButtonConfig = ref(null)
  const currentStepIndex = ref(0)
  
  // Form data
  const magicMemoryTitle = ref('')
  const magicMemoryEvent = ref('')
  const magicCustomMemoryEvent = ref('')
  const magicPhotoCount = ref(4)
  const magicBackgroundType = ref('white')
  const magicSolidBackgroundColor = ref('#F9F6F2')
  const magicSelectedTheme = ref(null)
  const magicThemeOptions = ref([])
  const loadingMagicThemes = ref(false)

  // Use the photo selection composable
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

  // Use the progress dialog composable
  const {
    showProgressDialog,
    currentProgress,
    currentProgressMessage,
    currentBookId,
    isRegenerating,
    startProgressPolling,
    stopProgressPolling,
    pollPdfStatus,
    generatePDF,
    viewPDF
  } = useProgressDialog()

  // Loading states
  const magicLoading = ref(false)
  
  // Track existing book for recreation
  const existingBookForRecreation = ref(null)
  
  // Track if we're in recreate mode
  const isRecreateMode = computed(() => !!existingBookForRecreation.value)
  
  // Track which photos are marked for replacement
  const photosToReplace = ref([])

  // Computed properties - use the photo selection composable's filtered assets
  const magicFilteredAssets = computed(() => {
    return photoSelection_filteredAssets.value
  })

  const isNextButtonDisabled = computed(() => {
    const currentStep = magicMemoryStep.value
    const currentTitle = magicMemoryTitle.value
    const currentMethod = photoSelection_method.value
    const currentSelectedLocation = photoSelection_selectedLocation.value
    const currentSelectedMemories = photoSelection_selectedMemories.value
    const currentSelectedCount = currentSelectedMemories?.length || 0
    const currentRequiredCount = 4 // Default photo count

    const titleEmpty = currentStep === MAGIC_STEPS.TITLE && !currentTitle
    const photosNoMethod = currentStep === MAGIC_STEPS.PHOTOS && !currentMethod
    const photosGeoNoLocation = currentStep === MAGIC_STEPS.PHOTOS && currentMethod === 'geo_code' && !currentSelectedLocation
    const manualNotEnoughPhotos = currentStep === MAGIC_STEPS.MANUAL && currentMethod === 'photo_library' && (!currentSelectedMemories || currentSelectedCount < currentRequiredCount)
    // Photo replacement step doesn't require any photos to be marked for replacement
    // If no photos are marked, it's equivalent to "keep_same"
    const photoReplacementNoSelection = false

    return titleEmpty || photosNoMethod || photosGeoNoLocation || manualNotEnoughPhotos || photoReplacementNoSelection
  })

  // Methods - use the photo selection composable's toggle function
  const toggleMagicMemorySelection = (id) => {
    photoSelection_toggleMemorySelection(id)
  }
  
  // Toggle photo replacement
  const togglePhotoReplacement = (photoId) => {
    const index = photosToReplace.value.indexOf(photoId)
    if (index > -1) {
      photosToReplace.value.splice(index, 1)
    } else {
      photosToReplace.value.push(photoId)
    }
  }

  const isFirstStep = () => {
    return currentStepIndex.value === 0
  }

  const isLastStep = () => {
    const isLast = currentStepIndex.value === currentButtonConfig.value.steps.length - 1
    return isLast
  }

  const getNextStepName = () => {
    const nextIndex = currentStepIndex.value + 1
    if (nextIndex < currentButtonConfig.value.steps.length) {
      const nextStep = currentButtonConfig.value.steps[nextIndex]
      return stepDefinitions[nextStep]?.name || 'Next Step'
    }
    return 'Complete'
  }

  const getNextButtonLabel = () => {
    // Special logic for photo selection step
    if (magicMemoryStep.value === MAGIC_STEPS.PHOTOS) {
      // If "replace_selected" is selected, show "Next: Photo Replacement"
      if (photoSelection_method.value === 'replace_selected') {
        return 'Next: Photo Replacement'
      }
      // For all other cases (including "keep_same"), show "Let's create something beautiful"
      return "Let's create something beautiful"
    }
    
    // For all other steps, use the normal next step name
    return `Next: ${getNextStepName()}`
  }

  const nextMagicMemoryStep = async () => {
    
    // Validate current step before proceeding
    if (magicMemoryStep.value === MAGIC_STEPS.TITLE && !magicMemoryTitle.value.trim()) {
      console.error('Title is required')
      return
    }

    if (magicMemoryStep.value === MAGIC_STEPS.PHOTOS && photoSelection_method.value === 'geo_code' && !photoSelection_selectedLocation.value) {
      console.error('Location is required for geo_code method')
      return
    }

    // Handle photo selection step with simple step skipping logic
    if (magicMemoryStep.value === MAGIC_STEPS.PHOTOS) {
      if (photoSelection_method.value === 'replace_selected') {
        // Go to photo replacement step (it's already in the steps array for recreation mode)
        const nextIndex = currentStepIndex.value + 1
        if (nextIndex < currentButtonConfig.value.steps.length) {
          const nextStep = currentButtonConfig.value.steps[nextIndex]
          if (nextStep === MAGIC_STEPS.PHOTO_REPLACEMENT) {
            currentStepIndex.value = nextIndex
            magicMemoryStep.value = nextStep
            console.log('🔄 [MagicMemoryWizard] Going to photo replacement step')
            console.error('🔄 [MagicMemoryWizard] TERMINAL LOG - Going to photo replacement step')
            return
          }
        }
      } else {
        // Skip photo replacement step and go directly to generation
        const lastIndex = currentButtonConfig.value.steps.length - 1
        currentStepIndex.value = lastIndex
        magicMemoryStep.value = currentButtonConfig.value.steps[lastIndex]
        console.log('🔄 [MagicMemoryWizard] Skipping photo replacement, going to generation')
        console.error('🔄 [MagicMemoryWizard] TERMINAL LOG - Skipping photo replacement, going to generation')
        return
      }
    }

    // Find next step in the button's sequence
    const nextIndex = currentStepIndex.value + 1
    if (nextIndex < currentButtonConfig.value.steps.length) {
      const nextStepNumber = currentButtonConfig.value.steps[nextIndex]
      
      console.log('🔄 [nextMagicMemoryStep] Moving to next step:', nextStepNumber, 'from current step:', magicMemoryStep.value)
      console.log('🔄 [nextMagicMemoryStep] Current photosToReplace:', photosToReplace.value)
      
      // Check if the next step is PHOTOS and there are no approved assets
      if (nextStepNumber === MAGIC_STEPS.PHOTOS && 
          Array.isArray(photoSelection_availableAssets.value) && 
          photoSelection_availableAssets.value.length === 0 &&
          !photoSelection_loadingAssets.value) {
        
        console.log('🚀 [MagicMemoryWizard] No approved assets found, redirecting to upload dialog')
        
        // Close the wizard dialog
        closeMagicMemoryDialog(true)
        
        // Navigate to the dedicated upload route with return parameter
        await navigateTo('/app/memory-books/upload?from=wizard&return=wizard')
        return
      }
      
      currentStepIndex.value = nextIndex
      magicMemoryStep.value = nextStepNumber
    }
  }

  const previousMagicMemoryStep = () => {
    const prevIndex = currentStepIndex.value - 1
    if (prevIndex >= 0) {
      currentStepIndex.value = prevIndex
      magicMemoryStep.value = currentButtonConfig.value.steps[prevIndex]
    }
  }

  const openMagicMemoryDialog = async (buttonType = 'full', existingBook = null) => {
    console.log('🔍 [openMagicMemoryDialog] Opening dialog with buttonType:', buttonType, 'existingBook:', existingBook)
    
    // Set up the button configuration
    // Use recreation config if we have an existing book, otherwise use the requested buttonType
    const configType = existingBook ? 'recreation' : (buttonType || 'full')
    const originalConfig = buttonConfigs[configType] || buttonConfigs.full
    
    // Store existing book for recreation
    existingBookForRecreation.value = existingBook
    
    // Set up the button configuration
    currentButtonConfig.value = originalConfig
    
    console.log('🔄 [openMagicMemoryDialog] Using config type:', configType)
    console.log('🔄 [openMagicMemoryDialog] Steps array:', originalConfig.steps)
    console.error('🔄 [openMagicMemoryDialog] TERMINAL LOG - Using config type:', configType)
    console.error('🔄 [openMagicMemoryDialog] TERMINAL LOG - Steps array:', originalConfig.steps)
    currentStepIndex.value = 0
    magicMemoryStep.value = currentButtonConfig.value.steps[0]
    
    // Continue with existing book preloading if needed
    if (existingBook) {
      // Set photo selection method to replace_selected by default for recreation
      photoSelection_method.value = 'replace_selected'
      console.log('🔄 [openMagicMemoryDialog] Set photo selection method to replace_selected for recreation')
      console.error('🔄 [openMagicMemoryDialog] TERMINAL LOG - Set photo selection method to replace_selected for recreation')
      
      // Preload title from AI supplemental prompt or title
      magicMemoryTitle.value = existingBook.ai_supplemental_prompt || existingBook.title || ''
      
      // Preload theme if available
      magicSelectedTheme.value = existingBook.theme_id || null
      
      // Preload background settings
      if (existingBook.background_type) {
        magicBackgroundType.value = existingBook.background_type
      }
      if (existingBook.background_color) {
        magicSolidBackgroundColor.value = existingBook.background_color
      }
      
      // Preload photo selection data
      if (existingBook.photo_selection_method) {
        photoSelection_method.value = existingBook.photo_selection_method
      }
      if (existingBook.photo_selection_date_range) {
        try {
          const dateRange = typeof existingBook.photo_selection_date_range === 'string' 
            ? JSON.parse(existingBook.photo_selection_date_range) 
            : existingBook.photo_selection_date_range
          photoSelection_dateRange.value = dateRange || { start: null, end: null }
        } catch (error) {
          console.error('Error parsing date range:', error)
          photoSelection_dateRange.value = { start: null, end: null }
        }
      }
      if (existingBook.photo_selection_tags) {
        try {
          const tags = typeof existingBook.photo_selection_tags === 'string' 
            ? JSON.parse(existingBook.photo_selection_tags) 
            : existingBook.photo_selection_tags
          photoSelection_selectedTags.value = tags || []
        } catch (error) {
          console.error('Error parsing tags:', error)
          photoSelection_selectedTags.value = []
        }
      }
      if (existingBook.photo_selection_location) {
        try {
          const location = typeof existingBook.photo_selection_location === 'string' 
            ? JSON.parse(existingBook.photo_selection_location) 
            : existingBook.photo_selection_location
          photoSelection_selectedLocation.value = location || ''
        } catch (error) {
          console.error('Error parsing location:', error)
          photoSelection_selectedLocation.value = ''
        }
      }
      console.log('🔍 [openMagicMemoryDialog] Existing book data:', {
        id: existingBook.id,
        created_from_assets: existingBook.created_from_assets,
        assets_length: existingBook.created_from_assets?.length || 0,
        photo_selection_pool: existingBook.photo_selection_pool
      })
      console.error('🔍 [openMagicMemoryDialog] TERMINAL LOG - Existing book data:', {
        id: existingBook.id,
        created_from_assets: existingBook.created_from_assets,
        assets_length: existingBook.created_from_assets?.length || 0
      })
      
      if (existingBook.created_from_assets && existingBook.created_from_assets.length > 0) {
        photoSelection_selectedMemories.value = existingBook.created_from_assets
        
        // Load thumbnails for the existing photos
        const { loadAssetThumbnails } = useMemoryStudio()
        console.log('🔍 [openMagicMemoryDialog] Loading thumbnails for assets:', existingBook.created_from_assets)
        console.error('🔍 [openMagicMemoryDialog] TERMINAL LOG - Loading thumbnails for assets:', existingBook.created_from_assets)
        await loadAssetThumbnails(existingBook)
        console.log('✅ [openMagicMemoryDialog] Thumbnails loaded successfully')
        console.error('✅ [openMagicMemoryDialog] TERMINAL LOG - Thumbnails loaded successfully')
      } else {
        console.log('⚠️ [openMagicMemoryDialog] No created_from_assets found in existing book')
        console.error('⚠️ [openMagicMemoryDialog] TERMINAL LOG - No created_from_assets found in existing book')
      }
      
      console.log('✅ [openMagicMemoryDialog] Preloaded data:', {
        title: magicMemoryTitle.value,
        theme: magicSelectedTheme.value,
        backgroundType: magicBackgroundType.value,
        backgroundColor: magicSolidBackgroundColor.value,
        photoMethod: photoSelection_method.value,
        dateRange: photoSelection_dateRange.value,
        tags: photoSelection_selectedTags.value,
        location: photoSelection_selectedLocation.value,
        selectedMemories: photoSelection_selectedMemories.value.length
      })
    } else {
      // Reset form values for new creation
      magicMemoryTitle.value = ''
      magicMemoryEvent.value = ''
      magicCustomMemoryEvent.value = ''
      magicPhotoCount.value = 4
      magicBackgroundType.value = 'white'
      magicSolidBackgroundColor.value = '#F9F6F2'
      magicSelectedTheme.value = null
      
      // Reset photo selection using composable
      photoSelection_resetSelection()
    }
    
    // Set default photo selection method based on button configuration (only if not preloaded)
    if (!existingBook) {
      photoSelection_method.value = currentButtonConfig.value.steps.includes(MAGIC_STEPS.PHOTOS) ? '' : 'last_100'
    }
    
    try {
      // Load assets and location data using photo selection composable
      await photoSelection_loadAvailableAssets()
      await photoSelection_loadLocationData()
      
      // Load themes
      await fetchMagicThemes()
    } catch (error) {
      console.error('Error loading assets:', error)
      // Still try to load themes even if assets fail
      await fetchMagicThemes()
    } finally {
      showMagicMemoryDialog.value = true
    }
  }

  const fetchMagicThemes = async () => {
    loadingMagicThemes.value = true
    try {
      const supabase = useNuxtApp().$supabase
      const { data, error } = await supabase
        .from('themes')
        .select('id, name, description, preview_image_url, is_active, background_color, background_opacity, header_font, body_font, signature_font, header_font_color, body_font_color, signature_font_color, layout_config, rounded, size, card_default, card_wizard, created_at, updated_at')
        .eq('is_active', true)
        .eq('deleted', false)
        .eq('card_wizard', true) // Only show themes that are enabled for wizard
        .order('name')
      
      if (error) {
        console.error('Error fetching themes:', error)
        magicThemeOptions.value = []
        return
      }
      
      // Transform themes for dropdown and find default theme
      let defaultThemeId = null
      magicThemeOptions.value = data?.map(theme => {
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
          photoCount: photoCount,
          card_default: theme.card_default
        }
      }) || []
      
      // Set the default theme if no theme is currently selected
      if (!magicSelectedTheme.value && defaultThemeId) {
        magicSelectedTheme.value = defaultThemeId
        console.log('[MAGIC-MEMORY-WIZARD] Auto-selected default theme:', defaultThemeId)
      } else {
        console.log('[MAGIC-MEMORY-WIZARD] No default theme selected. Current theme:', magicSelectedTheme.value, 'Default theme ID:', defaultThemeId)
      }
      
      console.log('[MAGIC-MEMORY-WIZARD] Fetched themes:', magicThemeOptions.value)
      console.log('[MAGIC-MEMORY-WIZARD] Current selected theme:', magicSelectedTheme.value)
    } catch (error) {
      console.error('Error loading themes:', error)
      magicThemeOptions.value = []
    } finally {
      loadingMagicThemes.value = false
    }
  }


  const closeMagicMemoryDialog = (resetPhotosToReplace = true, resetExistingBook = true) => {
    showMagicMemoryDialog.value = false
    // Reset state
    currentButtonConfig.value = null
    currentStepIndex.value = 0
    magicMemoryStep.value = MAGIC_STEPS.TITLE
    if (resetExistingBook) {
      existingBookForRecreation.value = null
    }
    if (resetPhotosToReplace) {
      photosToReplace.value = []
    }
  }

  const generateMagicMemory = async () => {
    magicLoading.value = true
    
    // Start progress dialog IMMEDIATELY when generate button is clicked
    console.log('🔍 [generateMagicMemory] Starting progress dialog immediately...')
    showProgressDialog.value = true
    currentProgressMessage.value = '🎯 Starting magic memory generation...'
    currentProgress.value = 0
    
    // Close the wizard dialog immediately so progress dialog is visible
    // Don't reset photosToReplace or existingBookForRecreation as we need them for the generation logic
    closeMagicMemoryDialog(false, false)
    
    try {
      console.log('🔍 [generateMagicMemory] Starting magic memory generation...')
      console.log('🔍 [generateMagicMemory] photosToReplace.value:', photosToReplace.value)
      console.log('🔍 [generateMagicMemory] photoSelection_method.value:', photoSelection_method.value)
      console.error('🔍 [generateMagicMemory] TERMINAL LOG - photosToReplace.value:', photosToReplace.value)
      console.error('🔍 [generateMagicMemory] TERMINAL LOG - photoSelection_method.value:', photoSelection_method.value)
      
      // Get the photo selection pool using the composable method or handle photo replacement
      let photoSelectionPool
      console.error('🔍 [generateMagicMemory] TERMINAL LOG - Checking photo replacement logic')
      console.error('🔍 [generateMagicMemory] TERMINAL LOG - photoSelection_method.value:', photoSelection_method.value)
      console.error('🔍 [generateMagicMemory] TERMINAL LOG - existingBookForRecreation.value:', !!existingBookForRecreation.value)
      console.error('🔍 [generateMagicMemory] TERMINAL LOG - photosToReplace.value.length:', photosToReplace.value.length)
      
      if (photoSelection_method.value === 'replace_selected' && existingBookForRecreation.value) {
        // SIMPLIFIED: For photo replacement, just use the normal photo selection pool
        // The backend will handle the replacement logic and return the final photo set
        photoSelectionPool = photoSelection_populatePhotoSelectionPool()
        console.log('🔄 [generateMagicMemory] Photo replacement mode: using normal photo selection pool')
        console.error('🔄 [generateMagicMemory] TERMINAL LOG - Photo replacement mode: using normal photo selection pool')
      } else if (photoSelection_method.value === 'keep_same' && existingBookForRecreation.value) {
        // For "keep_same", use the existing photos from the original book
        // This preserves the original photos without going through photo replacement
        photoSelectionPool = existingBookForRecreation.value.created_from_assets || []
        console.log('🔄 [generateMagicMemory] Keep same mode: using existing photos from original book')
        console.log('🔄 [generateMagicMemory] Keep same mode: photoSelectionPool:', photoSelectionPool)
        console.error('🔄 [generateMagicMemory] TERMINAL LOG - Keep same mode: using existing photos from original book')
        console.error('🔄 [generateMagicMemory] TERMINAL LOG - Keep same mode: photoSelectionPool:', photoSelectionPool)
      } else {
        // Use the normal photo selection logic
        photoSelectionPool = photoSelection_populatePhotoSelectionPool()
        console.log('🔍 [generateMagicMemory] Photo selection pool:', photoSelectionPool)
        console.error('🔍 [generateMagicMemory] TERMINAL LOG - Using normal photo selection logic')
      }
      
      if (!photoSelectionPool || photoSelectionPool.length === 0) {
        console.error('❌ [generateMagicMemory] No photos available for selection')
        console.error('❌ [generateMagicMemory] photoSelectionPool:', photoSelectionPool)
        console.error('❌ [generateMagicMemory] photoSelection_method:', photoSelection_method.value)
        console.error('❌ [generateMagicMemory] existingBookForRecreation:', !!existingBookForRecreation.value)
        throw new Error('No photos available for selection. Please upload some photos first.')
      }
      
      // Get effective photo count from theme or default - match original logic exactly
      let effectivePhotoCount = magicPhotoCount.value
      console.log('🔍 [generateMagicMemory] Initial photo count:', effectivePhotoCount)
      console.log('🔍 [generateMagicMemory] Selected theme:', magicSelectedTheme.value)
      
      if (magicSelectedTheme.value) {
        // Try to get photo count from loaded theme options first (like original)
        const selectedTheme = magicThemeOptions.value.find(theme => theme.value === magicSelectedTheme.value)
        if (selectedTheme && selectedTheme.photoCount > 0) {
          effectivePhotoCount = selectedTheme.photoCount
          console.log('🔍 [generateMagicMemory] Using photo count from loaded theme options:', effectivePhotoCount)
        } else {
          // Fallback: fetch theme directly from database to get accurate photo count
          try {
            const supabase = useNuxtApp().$supabase
            const { data: theme, error: themeError } = await supabase
              .from('themes')
              .select('layout_config')
              .eq('id', magicSelectedTheme.value)
              .single()
            
            console.log('🔍 [generateMagicMemory] Theme data:', theme)
            console.log('🔍 [generateMagicMemory] Theme error:', themeError)
            
            if (!themeError && theme?.layout_config) {
              const layoutConfig = typeof theme.layout_config === 'string' 
                ? JSON.parse(theme.layout_config) 
                : theme.layout_config
              
              console.log('🔍 [generateMagicMemory] Layout config:', layoutConfig)
              
              if (layoutConfig && layoutConfig.photos && Array.isArray(layoutConfig.photos)) {
                effectivePhotoCount = layoutConfig.photos.length
                console.log('🔍 [generateMagicMemory] Fetched photo count from database:', effectivePhotoCount)
              }
            }
          } catch (error) {
            console.error('🔍 [generateMagicMemory] Error fetching theme photo count:', error)
          }
        }
      } else {
        console.log('🔍 [generateMagicMemory] No theme selected, using default photo count')
      }
      
      console.log('🔍 [generateMagicMemory] Final effective photo count:', effectivePhotoCount)
      
      // Get user and session
      const { useSupabaseUser } = await import('~/composables/useSupabase')
      const user = useSupabaseUser()
      if (!user.value) {
        throw new Error('User not authenticated')
      }
      
      const supabase = useNuxtApp().$supabase
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      
      let bookId
      
      if (existingBookForRecreation.value) {
        // Update existing book for recreation
        console.log('🔄 [generateMagicMemory] Updating existing book for recreation:', existingBookForRecreation.value.id)
        
        const requestBody = {
          book_id: existingBookForRecreation.value.id,
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
          photo_selection_method: photoSelection_method.value,
          photo_selection_date_range: JSON.stringify(photoSelection_dateRange.value),
          photo_selection_tags: JSON.stringify(photoSelection_selectedTags.value),
          photo_selection_location: photoSelection_selectedLocation.value,
          photos_to_replace: photoSelection_method.value === 'keep_same' ? [] : photosToReplace.value
        }
        
        console.log('🔍 [generateMagicMemory] API request body photos_to_replace:', requestBody.photos_to_replace)
        console.error('🔍 [generateMagicMemory] TERMINAL LOG - API request body photos_to_replace:', requestBody.photos_to_replace)
        
        const updateRes = await $fetch('/api/memory-books/update-magic-memory', {
          method: 'POST',
          body: requestBody,
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
        
        if (!updateRes.success) {
          throw new Error('I need to try again to update your magic card.')
        }
        
        bookId = existingBookForRecreation.value.id
        console.log('🔍 [generateMagicMemory] Memory book updated for recreation with ID:', bookId)
      } else {
        // Create new memory book
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
            photo_selection_method: photoSelection_method.value
          },
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
        
        if (!dbRes.success) {
          throw new Error('I need to try again to save your magic card.')
        }
        
        bookId = dbRes.book_id
        console.log('🔍 [generateMagicMemory] Memory book created with ID:', bookId)
      }
      
      // Update progress and start polling
      currentProgressMessage.value = '🎯 Selecting best photos...'
      currentProgress.value = 25
      const isRegenerating = existingBookForRecreation.value && photosToReplace.value.length > 0
      startProgressPolling(bookId, isRegenerating)
      
      // Call the magic memory AI endpoint
      const aiRes = await $fetch('/api/ai/magic-memory', {
        method: 'POST',
        body: {
          memoryBookId: bookId,
          userId: user.value.id,
          photoCount: effectivePhotoCount
        }
      })
      
      if (!aiRes.selected_photo_ids || !Array.isArray(aiRes.selected_photo_ids) || aiRes.selected_photo_ids.length < 1 || aiRes.selected_photo_ids.length > effectivePhotoCount) {
        throw new Error(`I need a bit more to work with. Let me try again with different photos.`)
      }
      
      console.log('🔍 [generateMagicMemory] AI photo selection completed:', aiRes.selected_photo_ids.length, 'photos selected')
      console.error('🔍 [generateMagicMemory] TERMINAL LOG - AI photo selection completed:', aiRes.selected_photo_ids.length, 'photos selected')
      console.error('🔍 [generateMagicMemory] TERMINAL LOG - Photo replacement mode:', photoSelection_method.value === 'replace_selected')
      console.error('🔍 [generateMagicMemory] TERMINAL LOG - Existing book for recreation:', !!existingBookForRecreation.value)
      
      // Create book object for PDF generation - match original exactly
      const book = {
        id: bookId,
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
        print_size: '8.5x11',
        include_captions: true,
        memory_shape: 'original',
        grid_layout: '2x2',
        ai_background: true,
        background_opacity: 30
      }
      
      // Show success message
      console.log('✅ [generateMagicMemory] Magic memory generation completed successfully')
      
      // Start PDF generation
      console.log('🔍 [generateMagicMemory] Starting PDF generation...')
      console.error('🔍 [generateMagicMemory] TERMINAL LOG - Starting PDF generation for book:', book.id)
      console.error('🔍 [generateMagicMemory] TERMINAL LOG - Book has assets:', book.created_from_assets?.length || 0)
      await generatePDF(book)
      console.error('🔍 [generateMagicMemory] TERMINAL LOG - PDF generation completed')
      
    } catch (error) {
      console.error('❌ [generateMagicMemory] Error generating magic memory:', error)
      throw error
    } finally {
      magicLoading.value = false
    }
  }


  return {
    // State
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
    
    // Recreation state
    existingBookForRecreation,
    isRecreateMode,
    photosToReplace,
    
    // Photo selection state (from composable)
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
    
    // Progress dialog state (from composable)
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
    
    // Photo selection methods (from composable)
    photoSelection_loadAvailableAssets,
    photoSelection_loadLocationData,
    photoSelection_toggleMemorySelection,
    photoSelection_populatePhotoSelectionPool,
    photoSelection_resetSelection,
    photoSelection_getSelectedAssets,
    
    // Progress dialog methods (from composable)
    startProgressPolling,
    stopProgressPolling,
    pollPdfStatus,
    generatePDF,
    viewPDF
  }
}
