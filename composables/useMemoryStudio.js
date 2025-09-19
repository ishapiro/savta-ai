import { ref, computed, watch } from 'vue'
import { useDatabase } from './useDatabase'
import { useSupabaseUser } from './useSupabase'

export const useMemoryStudio = () => {
  const { memoryBooks: dbMemoryBooks, assets: dbAssets } = useDatabase()
  const user = useSupabaseUser()

  // State
  const memoryBooks = ref([])
  const loadingMemoryBooks = ref(true)
  const assetThumbnails = ref({})
  const hasAssets = ref(false)
  const approvedAssetsCount = ref(0)
  const loadingAssets = ref(false)

  // Pagination for memory cards
  const currentCardsPage = ref(1)
  const cardsPerPage = ref(12)

  // Pagination for memory books
  const currentBooksPage = ref(1)
  const booksPerPage = ref(12)

  // Computed properties
  const memoryCards = computed(() => {
    return memoryBooks.value.filter(book => book.format === 'card')
  })

  const memoryBooksOnly = computed(() => {
    return memoryBooks.value.filter(book => book.format === 'book')
  })

  const totalCardsPages = computed(() => {
    return Math.ceil(memoryCards.value.length / cardsPerPage.value)
  })

  const totalBooksPages = computed(() => {
    return Math.ceil(memoryBooksOnly.value.length / booksPerPage.value)
  })

  const paginatedMemoryCards = computed(() => {
    const start = (currentCardsPage.value - 1) * cardsPerPage.value
    const end = start + cardsPerPage.value
    return memoryCards.value.slice(start, end)
  })

  const paginatedMemoryBooks = computed(() => {
    const start = (currentBooksPage.value - 1) * booksPerPage.value
    const end = start + booksPerPage.value
    return memoryBooksOnly.value.slice(start, end)
  })

  // Methods
  const loadMemoryBooks = async () => {
    if (!user.value?.id) {
      return
    }

    try {
      loadingMemoryBooks.value = true
      
      // Clear existing thumbnails cache to ensure fresh URLs are loaded
      assetThumbnails.value = {}
      
      const books = await dbMemoryBooks.getMemoryBooks()
      memoryBooks.value = books || []
      
      // Load thumbnails for all books
      for (const book of memoryBooks.value) {
        await loadAssetThumbnails(book)
      }
      
    } catch (error) {
      console.error('❌ Failed to load memory books:', error)
      memoryBooks.value = []
    } finally {
      loadingMemoryBooks.value = false
    }
  }

  const loadAssetThumbnails = async (book) => {
    if (!book || !book.created_from_assets || book.created_from_assets.length === 0) {
      console.log('🖼️ No assets to load for book:', book?.id, 'created_from_assets:', book?.created_from_assets)
      return
    }

    try {
      // Get assets for this book using the dedicated function
      const bookAssets = await dbAssets.getAssetsByBook(book.created_from_assets, 12)
      
      // Store thumbnails in reactive data
      if (bookAssets && Array.isArray(bookAssets)) {
        bookAssets.forEach(asset => {
          if (asset && asset.storage_url) {
            assetThumbnails.value[asset.id] = asset.storage_url
          }
        })
      }
    } catch (error) {
      console.error('❌ Failed to load asset thumbnails:', error)
    }
  }

  const reloadAssetThumbnails = async (book) => {
    if (!book || !book.created_from_assets || book.created_from_assets.length === 0) {
      return
    }

    try {
      console.log('🔄 Reloading thumbnails for book:', book.id, 'assets:', book.created_from_assets)
      
      // Clear existing thumbnails for this book's assets
      book.created_from_assets.forEach(assetId => {
        delete assetThumbnails.value[assetId]
      })
      
      // Reload thumbnails for this book
      await loadAssetThumbnails(book)
    } catch (error) {
      console.error('❌ Failed to reload asset thumbnails:', error)
    }
  }

  const getAssetThumbnail = (assetId) => {
    const thumbnail = assetThumbnails.value[assetId] || null
    if (!thumbnail) {
      console.log('🔍 [getAssetThumbnail] No thumbnail found for asset:', assetId)
      console.log('🔍 [getAssetThumbnail] Available thumbnails:', Object.keys(assetThumbnails.value))
    }
    return thumbnail
  }

  const getFirstAssetThumbnail = (book) => {
    if (!book.magic_story && book.created_from_assets && book.created_from_assets.length > 0) {
      const firstAssetId = book.created_from_assets[0]
      const thumbnail = getAssetThumbnail(firstAssetId)
      return thumbnail
    }
    return null
  }

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
      console.error('Error formatting date:', error)
      return ''
    }
  }

  const getStatusText = (status) => {
    const statusMap = {
      'draft': 'Draft',
      'ready': 'Ready',
      'approved': 'Approved',
      'generating': 'Generating',
      'background_ready': 'Processing'
    }
    return statusMap[status] || 'Unknown'
  }

  const getStatusSeverity = (status) => {
    const severityMap = {
      'draft': 'warning',
      'ready': 'info',
      'approved': 'success',
      'generating': 'info',
      'background_ready': 'info'
    }
    return severityMap[status] || 'info'
  }

  const getStatusClass = (status) => {
    const classMap = {
      'draft': 'bg-yellow-100 text-yellow-700',
      'ready': 'bg-blue-100 text-blue-700',
      'approved': 'bg-green-100 text-green-700',
      'generating': 'bg-blue-100 text-blue-700',
      'background_ready': 'bg-blue-100 text-blue-700'
    }
    return classMap[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusBadgeClass = (status) => {
    const badgeClassMap = {
      'draft': 'bg-amber-50 text-amber-700 border border-amber-200',
      'background_ready': 'bg-blue-50 text-blue-700 border border-blue-200',
      'ready': 'bg-green-50 text-green-700 border border-green-200',
      'approved': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      'generating': 'bg-blue-50 text-blue-700 border border-blue-200'
    }
    return badgeClassMap[status] || 'bg-gray-50 text-gray-700 border border-gray-200'
  }

  const getStatusIcon = (status) => {
    const iconMap = {
      'draft': 'pi pi-pencil',
      'background_ready': 'pi pi-spinner pi-spin',
      'ready': 'pi pi-check-circle',
      'approved': 'pi pi-check',
      'generating': 'pi pi-spinner pi-spin'
    }
    return iconMap[status] || 'pi pi-question'
  }

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

  // Watch for user changes to load memory books
  watch(user, (newUser) => {
    if (newUser?.id) {
      loadMemoryBooks()
    }
  }, { immediate: true })

  return {
    // State
    memoryBooks,
    loadingMemoryBooks,
    assetThumbnails,
    hasAssets,
    approvedAssetsCount,
    loadingAssets,
    currentCardsPage,
    cardsPerPage,
    currentBooksPage,
    booksPerPage,

    // Computed
    memoryCards,
    memoryBooksOnly,
    totalCardsPages,
    totalBooksPages,
    paginatedMemoryCards,
    paginatedMemoryBooks,

    // Methods
    loadMemoryBooks,
    loadAssetThumbnails,
    reloadAssetThumbnails,
    getAssetThumbnail,
    getFirstAssetThumbnail,
    formatDate,
    getStatusText,
    getStatusSeverity,
    getStatusClass,
    getStatusBadgeClass,
    getStatusIcon,
    getFileTypeDisplay,
    getFileTypeIcon,
    getFileTypeColor
  }
}
