import { ref } from 'vue'

export const useMagicMemory = () => {
  const showMagicMemoryDialog = ref(false)
  const currentButtonConfig = ref({})
  const currentStepIndex = ref(0)
  const magicMemoryStep = ref(1)
  const magicMemoryTitle = ref('')
  const magicMemoryEvent = ref('')
  const magicCustomMemoryEvent = ref('')
  const magicPhotoCount = ref(4)
  const magicBackgroundType = ref('white')
  const magicPhotoSelectionMethod = ref('')
  const magicDateRange = ref({ start: null, end: null })
  const magicSelectedTags = ref([])
  const magicSelectedMemories = ref([])
  const magicSelectedTagFilter = ref([])
  const loadingAssets = ref(false)
  const availableAssets = ref([])

  // Button configurations
  const buttonConfigs = {
    quick: {
      name: 'Quick Memory Card',
      description: 'Fast and easy - just pick a title and let AI do the rest!',
      steps: [1, 2, 3, 4, 5, 6, 7] // Title, Event, Photo Count, Background, Photo Selection, Photo Review, Generate
    },
    full: {
      name: 'Full Memory Card',
      description: 'Complete control over every aspect of your memory card',
      steps: [1, 2, 3, 4, 5, 6, 7] // All steps
    }
  }

  // Step definitions
  const stepDefinitions = {
    1: { name: 'Title', description: 'Give your memory a beautiful title' },
    2: { name: 'Event', description: 'Choose or create a special event' },
    3: { name: 'Photo Count', description: 'How many photos would you like?' },
    4: { name: 'Background', description: 'Pick a beautiful background style' },
    5: { name: 'Photo Selection', description: 'How should we select your photos?' },
    6: { name: 'Photo Review', description: 'Review and adjust your selected photos' },
    7: { name: 'Generate', description: 'Create your magical memory!' }
  }

  const openMagicMemoryDialog = async (buttonType = 'full') => {
    // Set up the button configuration
    currentButtonConfig.value = buttonConfigs[buttonType] || buttonConfigs.full
    currentStepIndex.value = 0
    magicMemoryStep.value = currentButtonConfig.value.steps[0]
    
    // Reset form values
    magicMemoryTitle.value = ''
    magicMemoryEvent.value = ''
    magicCustomMemoryEvent.value = ''
    magicPhotoCount.value = 4
    magicBackgroundType.value = 'white'
    // Set default photo selection method based on button configuration
    magicPhotoSelectionMethod.value = currentButtonConfig.value.steps.includes(5) ? '' : 'last_100'
    magicDateRange.value = { start: null, end: null }
    magicSelectedTags.value = []
    magicSelectedMemories.value = []
    magicSelectedTagFilter.value = []
    
    loadingAssets.value = true
    try {
      const { useDatabase } = await import('~/composables/useDatabase.js')
      const db = useDatabase()
      const allApprovedAssets = await db.assets.getAssets({ approved: true })
      availableAssets.value = allApprovedAssets || []
    } catch (error) {
      availableAssets.value = []
    } finally {
      loadingAssets.value = false
      showMagicMemoryDialog.value = true
    }
  }

  return {
    showMagicMemoryDialog,
    currentButtonConfig,
    currentStepIndex,
    magicMemoryStep,
    magicMemoryTitle,
    magicMemoryEvent,
    magicCustomMemoryEvent,
    magicPhotoCount,
    magicBackgroundType,
    magicPhotoSelectionMethod,
    magicDateRange,
    magicSelectedTags,
    magicSelectedMemories,
    magicSelectedTagFilter,
    loadingAssets,
    availableAssets,
    buttonConfigs,
    stepDefinitions,
    openMagicMemoryDialog
  }
} 