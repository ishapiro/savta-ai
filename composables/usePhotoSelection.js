import { ref, computed } from 'vue'

// Photo pool size constant for easy configuration
const PHOTO_POOL_SIZE = 100

export const usePhotoSelection = () => {
  // Photo selection method
  const photoSelection_method = ref('last_100')
  
  // Date range selection
  const photoSelection_dateRange = ref({ start: null, end: null })
  
  // Tag selection
  const photoSelection_selectedTags = ref([])
  const photoSelection_selectedTagFilter = ref([])
  
  // Location selection
  const photoSelection_locationType = ref('country')
  const photoSelection_selectedLocation = ref('')
  const photoSelection_availableCountries = ref([])
  const photoSelection_availableStates = ref([])
  const photoSelection_availableCities = ref([])
  
  // Manual selection
  const photoSelection_selectedMemories = ref([])
  
  // Available assets
  const photoSelection_availableAssets = ref([])
  const photoSelection_loadingAssets = ref(false)
  
  // Upload state
  const photoSelection_isUploading = ref(false)
  const photoSelection_showUploadDialog = ref(false)
  
  // Photo selection options
  const photoSelection_options = [
    {
      id: 'last_100',
      title: "I'll choose for you",
      description: "I'll search your photos for matches and pick the best photos from your recent uploads (up to 100 photos).",
      icon: 'pi pi-images',
      color: 'from-brand-flash to-brand-highlight'
    },
    {
      id: 'photo_library',
      title: "Photo library",
      description: "Choose exactly which photos you want from your library.",
      icon: 'pi pi-folder-open',
      color: 'from-brand-secondary to-brand-flash'
    },
    {
      id: 'geo_code',
      title: "By location",
      description: "Choose a location. I'll pick the best photos from this place.",
      icon: 'pi pi-map-marker',
      color: 'from-brand-highlight to-brand-flash'
    },
    {
      id: 'date_range',
      title: "By date range",
      description: "Choose a date range. I'll pick the best photos from this date range.",
      icon: 'pi pi-calendar',
      color: 'from-brand-secondary to-brand-highlight'
    },
    {
      id: 'tags',
      title: "By tags",
      description: "Choose a tag or person. I'll pick the best photos with these tags.",
      icon: 'pi pi-tags',
      color: 'from-brand-header to-brand-flash'
    }
  ]
  
  // Computed available tags
  const photoSelection_computedAvailableTags = computed(() => {
    if (!photoSelection_availableAssets.value || photoSelection_availableAssets.value.length === 0) {
      return []
    }
    
    const allTags = new Set()
    photoSelection_availableAssets.value.forEach(asset => {
      if (asset.tags && Array.isArray(asset.tags)) {
        asset.tags.forEach(tag => allTags.add(tag))
      }
    })
    
    return Array.from(allTags).map(tag => ({
      label: tag,
      value: tag
    })).sort((a, b) => a.label.localeCompare(b.label))
  })
  
  // Filtered assets for photo library selection
  const photoSelection_filteredAssets = computed(() => {
    if (!Array.isArray(photoSelection_availableAssets.value)) return []
    
    return photoSelection_availableAssets.value.filter(asset =>
      asset.type === 'photo' &&
      (!photoSelection_selectedTagFilter.value.length || 
       (asset.tags && asset.tags.some(tag => photoSelection_selectedTagFilter.value.includes(tag))))
    )
  })
  
  // Load available assets
  const photoSelection_loadAvailableAssets = async () => {
    photoSelection_loadingAssets.value = true
    try {
      const { useDatabase } = await import('~/composables/useDatabase.js')
      const db = useDatabase()
      const allApprovedAssets = await db.assets.getAssets({ approved: true })
      photoSelection_availableAssets.value = allApprovedAssets || []
    } catch (error) {
      console.error('Error loading assets:', error)
      photoSelection_availableAssets.value = []
    } finally {
      photoSelection_loadingAssets.value = false
    }
  }
  
  // Load location data
  const photoSelection_loadLocationData = async () => {
    if (!photoSelection_availableAssets.value.length) return
    
    const countries = new Set()
    const states = new Set()
    const cities = new Set()
    
    photoSelection_availableAssets.value.forEach(asset => {
      // Check both location_data structure and direct fields
      if (asset.location_data) {
        if (asset.location_data.country) countries.add(asset.location_data.country)
        if (asset.location_data.state) states.add(asset.location_data.state)
        if (asset.location_data.city) cities.add(asset.location_data.city)
      } else {
        // Fallback to direct fields
        if (asset.country) countries.add(asset.country)
        if (asset.state) states.add(asset.state)
        if (asset.city) cities.add(asset.city)
      }
    })
    
    photoSelection_availableCountries.value = Array.from(countries).map(country => ({
      label: country,
      value: country
    })).sort((a, b) => a.label.localeCompare(b.label))
    
    photoSelection_availableStates.value = Array.from(states).map(state => ({
      label: state,
      value: state
    })).sort((a, b) => a.label.localeCompare(b.label))
    
    photoSelection_availableCities.value = Array.from(cities).map(city => ({
      label: city,
      value: city
    })).sort((a, b) => a.label.localeCompare(b.label))
  }
  
  // Toggle memory selection
  const photoSelection_toggleMemorySelection = (assetId) => {
    const index = photoSelection_selectedMemories.value.indexOf(assetId)
    if (index > -1) {
      photoSelection_selectedMemories.value.splice(index, 1)
    } else {
      if (photoSelection_selectedMemories.value.length < 12) {
        photoSelection_selectedMemories.value.push(assetId)
      }
    }
  }
  
  // Populate photo selection pool
  const photoSelection_populatePhotoSelectionPool = (targetCount = null) => {
    console.log('🔍 [photoSelection_populatePhotoSelectionPool] Method:', photoSelection_method.value)
    console.log('🔍 [photoSelection_populatePhotoSelectionPool] Available assets count:', photoSelection_availableAssets.value.length)
    
    switch (photoSelection_method.value) {
      case 'last_100':
        // Use target count if provided, otherwise use PHOTO_POOL_SIZE
        const limit = targetCount ? Math.min(targetCount, PHOTO_POOL_SIZE) : PHOTO_POOL_SIZE
        console.log(`🔍 [photoSelection_populatePhotoSelectionPool] Using limit: ${limit} (target: ${targetCount}, max: ${PHOTO_POOL_SIZE})`)
        return photoSelection_availableAssets.value.slice(0, limit).map(asset => asset.id)
      
      case 'photo_library':
        return photoSelection_selectedMemories.value
      
      case 'geo_code':
        const geoFilteredAssets = photoSelection_availableAssets.value
          .filter(asset => {
            if (!photoSelection_selectedLocation.value) return false
            
            // Check both location_data structure and direct fields
            let assetCountry, assetState, assetCity
            
            if (asset.location_data) {
              assetCountry = asset.location_data.country
              assetState = asset.location_data.state
              assetCity = asset.location_data.city
            } else {
              assetCountry = asset.country
              assetState = asset.state
              assetCity = asset.city
            }
            
            switch (photoSelection_locationType.value) {
              case 'country':
                return assetCountry === photoSelection_selectedLocation.value
              case 'state':
                return assetState === photoSelection_selectedLocation.value
              case 'city':
                return assetCity === photoSelection_selectedLocation.value
              default:
                return false
            }
          })
          .map(asset => asset.id)
        
        // Limit to 100 most recent photos based on upload date (created_at)
        if (geoFilteredAssets.length > PHOTO_POOL_SIZE) {
          console.log(`🔍 [photoSelection_populatePhotoSelectionPool] Location selection returned ${geoFilteredAssets.length} photos, limiting to ${PHOTO_POOL_SIZE} most recent`)
          return geoFilteredAssets.slice(0, PHOTO_POOL_SIZE)
        }
        return geoFilteredAssets
      
      case 'date_range':
        console.log('🔍 [photoSelection_populatePhotoSelectionPool] Date range case - dateRange:', photoSelection_dateRange.value)
        console.log('🔍 [photoSelection_populatePhotoSelectionPool] Sample asset dates:', photoSelection_availableAssets.value.slice(0, 3).map(a => ({ 
          id: a.id, 
          asset_date: a.asset_date,
          created_at: a.created_at,
          updated_at: a.updated_at,
          upload_date: a.upload_date,
          photo_date: a.photo_date,
          date_taken: a.date_taken
        })))
        const dateFilteredAssets = photoSelection_availableAssets.value
          .filter(asset => {
            // If no date range is selected, return all assets
            if (!photoSelection_dateRange.value.start && !photoSelection_dateRange.value.end) return true
            
            // If asset has no asset_date, use created_at as fallback
            let assetDate
            if (asset.asset_date) {
              assetDate = new Date(asset.asset_date)
            } else if (asset.created_at) {
              assetDate = new Date(asset.created_at)
              console.log('🔍 [photoSelection_populatePhotoSelectionPool] Using created_at as fallback for asset:', asset.id)
            } else {
              console.log('🔍 [photoSelection_populatePhotoSelectionPool] Asset has no date fields:', asset.id)
              return false
            }
            const start = photoSelection_dateRange.value.start ? new Date(photoSelection_dateRange.value.start) : null
            const end = photoSelection_dateRange.value.end ? new Date(photoSelection_dateRange.value.end) : null
            
            console.log('🔍 [photoSelection_populatePhotoSelectionPool] Comparing dates for asset:', asset.id, {
              assetDate: assetDate,
              start: start,
              end: end,
              asset_date: asset.asset_date,
              created_at: asset.created_at,
              usingFallback: !asset.asset_date && asset.created_at
            })
            
            // If only start date is selected
            if (start && !end) {
              const result = assetDate >= start
              console.log('🔍 [photoSelection_populatePhotoSelectionPool] Start only comparison:', asset.id, 'assetDate >= start:', result)
              return result
            }
            
            // If only end date is selected
            if (!start && end) {
              const result = assetDate <= end
              console.log('🔍 [photoSelection_populatePhotoSelectionPool] End only comparison:', asset.id, 'assetDate <= end:', result)
              return result
            }
            
            // If both dates are selected
            if (start && end) {
              const result = assetDate >= start && assetDate <= end
              console.log('🔍 [photoSelection_populatePhotoSelectionPool] Both dates comparison:', asset.id, 'assetDate >= start && assetDate <= end:', result)
              return result
            }
            
            console.log('🔍 [photoSelection_populatePhotoSelectionPool] No date range selected, including asset:', asset.id)
            return true
          })
          .map(asset => asset.id)
        
        console.log('🔍 [photoSelection_populatePhotoSelectionPool] Date range filtered count:', dateFilteredAssets.length)
        
        // Limit to 100 most recent photos based on upload date (created_at)
        if (dateFilteredAssets.length > PHOTO_POOL_SIZE) {
          console.log(`🔍 [photoSelection_populatePhotoSelectionPool] Date range selection returned ${dateFilteredAssets.length} photos, limiting to ${PHOTO_POOL_SIZE} most recent`)
          return dateFilteredAssets.slice(0, PHOTO_POOL_SIZE)
        }
        return dateFilteredAssets
      
      case 'tags':
        const tagFilteredAssets = photoSelection_availableAssets.value
          .filter(asset => {
            if (!photoSelection_selectedTags.value.length) return false
            if (!asset.tags) return false
            
            return photoSelection_selectedTags.value.some(tag => asset.tags.includes(tag))
          })
          .map(asset => asset.id)
        
        // Limit to 100 most recent photos based on upload date (created_at)
        if (tagFilteredAssets.length > PHOTO_POOL_SIZE) {
          console.log(`🔍 [photoSelection_populatePhotoSelectionPool] Tag selection returned ${tagFilteredAssets.length} photos, limiting to ${PHOTO_POOL_SIZE} most recent`)
          return tagFilteredAssets.slice(0, PHOTO_POOL_SIZE)
        }
        return tagFilteredAssets
      
      default:
        console.log('🔍 [photoSelection_populatePhotoSelectionPool] Default case - returning empty array')
        return []
    }
  }
  
  // Reset selection
  const photoSelection_resetSelection = () => {
    photoSelection_method.value = 'last_100'
    photoSelection_dateRange.value = { start: null, end: null }
    photoSelection_selectedTags.value = []
    photoSelection_selectedTagFilter.value = []
    photoSelection_locationType.value = 'country'
    photoSelection_selectedLocation.value = ''
    photoSelection_selectedMemories.value = []
  }
  
  // Get selected assets
  const photoSelection_getSelectedAssets = () => {
    const selectedIds = photoSelection_populatePhotoSelectionPool()
    return photoSelection_availableAssets.value.filter(asset => selectedIds.includes(asset.id))
  }
  
  return {
    // State
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
    
    // Computed
    photoSelection_computedAvailableTags,
    photoSelection_filteredAssets,
    
    // Methods
    photoSelection_loadAvailableAssets,
    photoSelection_loadLocationData,
    photoSelection_toggleMemorySelection,
    photoSelection_populatePhotoSelectionPool,
    photoSelection_resetSelection,
    photoSelection_getSelectedAssets
  }
}
