import { ref, computed, watch } from 'vue'
import { useDatabase } from './useDatabase'
import { useSupabaseUser } from './useSupabase'

// Global state - shared across all instances of useMemoryStudio
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

// Flag to ensure watchers are only set up once
let watchersInitialized = false

export const useMemoryStudio = () => {
  const { memoryBooks: dbMemoryBooks, assets: dbAssets } = useDatabase()
  const user = useSupabaseUser()

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
      
      // Fetch memory books only (no thumbnails yet for performance)
      const books = await dbMemoryBooks.getMemoryBooks()
      memoryBooks.value = books || []
      
    } catch (error) {
      console.error('❌ Failed to load memory books:', error)
      memoryBooks.value = []
    } finally {
      loadingMemoryBooks.value = false
    }
  }

  // Load thumbnails for specific books (optimized for visible items only)
  const loadAssetThumbnails = async (book) => {
    if (!book || !book.created_from_assets || book.created_from_assets.length === 0) {
      return
    }

    try {
      // Get assets for this book using the dedicated function
      const bookAssets = await dbAssets.getAssetsByBook(book.created_from_assets, 12)
      
      // Store thumbnails in reactive data
      // Prefer thumbnail_url (optimized) with fallback to storage_url (full resolution)
      if (bookAssets && Array.isArray(bookAssets)) {
        bookAssets.forEach(asset => {
          if (asset) {
            // Use thumbnail if available, otherwise fall back to full resolution
            assetThumbnails.value[asset.id] = asset.thumbnail_url || asset.storage_url
          }
        })
      }
    } catch (error) {
      console.error('❌ Failed to load asset thumbnails:', error)
    }
  }

  // Batch load thumbnails for multiple books (single query optimization)
  const loadVisibleThumbnails = async (books) => {
    if (!books || books.length === 0) {
      return
    }

    try {
      // Collect all asset IDs from all visible books
      const allAssetIds = []
      const bookAssetMap = new Map()
      
      books.forEach(book => {
        if (book.created_from_assets && book.created_from_assets.length > 0) {
          // Limit to first 12 assets per book
          const bookAssets = book.created_from_assets.slice(0, 12)
          bookAssetMap.set(book.id, bookAssets)
          allAssetIds.push(...bookAssets)
        }
      })

      // Remove duplicates
      const uniqueAssetIds = [...new Set(allAssetIds)]

      // Skip if no assets to load or all already cached
      if (uniqueAssetIds.length === 0) {
        return
      }

      // Check which assets are already cached
      const uncachedAssetIds = uniqueAssetIds.filter(id => !assetThumbnails.value[id])
      
      if (uncachedAssetIds.length === 0) {
        // All thumbnails already cached
        return
      }

      // Single batched query for all needed assets
      const batchedAssets = await dbAssets.getAssetsByBook(uncachedAssetIds, uniqueAssetIds.length)
      
      // Store thumbnails in cache
      // Prefer thumbnail_url (optimized) with fallback to storage_url (full resolution)
      if (batchedAssets && Array.isArray(batchedAssets)) {
        batchedAssets.forEach(asset => {
          if (asset) {
            // Use thumbnail if available, otherwise fall back to full resolution
            assetThumbnails.value[asset.id] = asset.thumbnail_url || asset.storage_url
          }
        })
      }
    } catch (error) {
      console.error('❌ Failed to load visible thumbnails:', error)
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

  // Optimistic delete: Remove book from local state without database reload
  const removeMemoryBook = (bookId) => {
    console.log('🗑️ Optimistic delete: Removing book from UI:', bookId)
    
    // Find the book being deleted
    const deletedBook = memoryBooks.value.find(book => book.id === bookId)
    
    // Remove from local array immediately
    memoryBooks.value = memoryBooks.value.filter(book => book.id !== bookId)
    
    // Optionally clean up thumbnails for this specific book to free memory
    if (deletedBook?.created_from_assets) {
      deletedBook.created_from_assets.forEach(assetId => {
        // Only delete thumbnail if no other books are using it
        const stillInUse = memoryBooks.value.some(book => 
          book.created_from_assets?.includes(assetId)
        )
        if (!stillInUse) {
          delete assetThumbnails.value[assetId]
        }
      })
    }
    
    // Adjust pagination if we deleted the last item on the current page
    const currentView = memoryCards.value.some(c => c.id === bookId) ? 'cards' : 'books'
    
    if (currentView === 'cards') {
      const totalPages = Math.ceil(memoryCards.value.length / cardsPerPage.value)
      if (currentCardsPage.value > totalPages && totalPages > 0) {
        currentCardsPage.value = totalPages
      }
    } else {
      const totalPages = Math.ceil(memoryBooksOnly.value.length / booksPerPage.value)
      if (currentBooksPage.value > totalPages && totalPages > 0) {
        currentBooksPage.value = totalPages
      }
    }
    
    console.log('✅ Book removed from UI, current count:', memoryBooks.value.length)
  }

  // Add book to local state (for create operations)
  const addMemoryBook = (book) => {
    console.log('➕ Adding new book to UI:', book.id)
    
    // Add to beginning of array (most recent first)
    memoryBooks.value = [book, ...memoryBooks.value]
    
    console.log('✅ Book added to UI, current count:', memoryBooks.value.length)
  }

  // Update book in local state (for update operations)
  const updateMemoryBook = (bookId, updates) => {
    console.log('🔄 Updating book in UI:', bookId)
    
    const index = memoryBooks.value.findIndex(book => book.id === bookId)
    if (index !== -1) {
      memoryBooks.value[index] = { ...memoryBooks.value[index], ...updates }
      console.log('✅ Book updated in UI')
    }
  }

  const getAssetThumbnail = (assetId) => {
    if (!assetId) {
      return null
    }
    
    return assetThumbnails.value[assetId] || null
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

  // Set up watchers only once (since state is global)
  if (!watchersInitialized) {
    watchersInitialized = true
    
    // Watch for user changes to load memory books
    watch(user, (newUser) => {
      if (newUser?.id) {
        console.log('📚 [useMemoryStudio] User changed, loading memory books')
        loadMemoryBooks()
      }
    }, { immediate: true })

    // Note: Thumbnail loading removed from automatic watchers for performance
    // Thumbnails are now loaded on-demand when user clicks "details" button
    // This significantly improves initial page load time
  }

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
    loadVisibleThumbnails,
    reloadAssetThumbnails,
    removeMemoryBook,
    addMemoryBook,
    updateMemoryBook,
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
