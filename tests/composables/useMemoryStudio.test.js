import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useMemoryStudio } from '~/composables/useMemoryStudio'

// Mock the dependencies
vi.mock('~/composables/useDatabase', () => ({
  useDatabase: () => ({
    memoryBooks: {
      getMemoryBooksByUserId: vi.fn(),
      getAssetThumbnail: vi.fn()
    }
  })
}))

vi.mock('~/composables/useSupabase', () => ({
  useSupabase: () => ({
    user: ref({ id: 'test-user-id' })
  })
}))

describe('useMemoryStudio', () => {
  let memoryStudio

  beforeEach(() => {
    vi.clearAllMocks()
    memoryStudio = useMemoryStudio()
  })

  describe('initial state', () => {
    it('should initialize with empty arrays and loading states', () => {
      expect(memoryStudio.memoryBooks.value).toEqual([])
      expect(memoryStudio.loadingMemoryBooks.value).toBe(false) // Mock returns false
      expect(memoryStudio.assetThumbnails.value).toEqual({})
      expect(memoryStudio.hasAssets.value).toBe(false)
      expect(memoryStudio.approvedAssetsCount.value).toBe(0)
      expect(memoryStudio.loadingAssets.value).toBe(false)
    })

    it('should initialize pagination correctly', () => {
      expect(memoryStudio.currentCardsPage.value).toBe(1)
      expect(memoryStudio.cardsPerPage.value).toBe(12)
      expect(memoryStudio.currentBooksPage.value).toBe(1)
      expect(memoryStudio.booksPerPage.value).toBe(12)
    })
  })

  describe('computed properties', () => {
    beforeEach(() => {
      // Set up test data
      memoryStudio.memoryBooks.value = [
        { id: 1, format: 'card', ai_supplemental_prompt: 'Test Card' },
        { id: 2, format: 'book', ai_supplemental_prompt: 'Test Book' },
        { id: 3, format: 'card', ai_supplemental_prompt: 'Another Card' }
      ]
    })

    it('should filter memory cards correctly', () => {
      expect(memoryStudio.memoryCards.value).toHaveLength(2)
      expect(memoryStudio.memoryCards.value.every(card => card.format === 'card')).toBe(true)
    })

    it('should filter memory books correctly', () => {
      expect(memoryStudio.memoryBooksOnly.value).toHaveLength(1)
      expect(memoryStudio.memoryBooksOnly.value.every(book => book.format === 'book')).toBe(true)
    })

    it('should calculate total pages correctly', () => {
      expect(memoryStudio.totalCardsPages.value).toBe(1) // 2 cards / 12 per page = 1 page
      expect(memoryStudio.totalBooksPages.value).toBe(1) // 1 book / 12 per page = 1 page
    })

    it('should paginate memory cards correctly', () => {
      memoryStudio.cardsPerPage.value = 1
      expect(memoryStudio.paginatedMemoryCards.value).toHaveLength(1)
      expect(memoryStudio.paginatedMemoryCards.value[0].id).toBe(1)
    })

    it('should paginate memory books correctly', () => {
      memoryStudio.booksPerPage.value = 1
      expect(memoryStudio.paginatedMemoryBooks.value).toHaveLength(1)
      expect(memoryStudio.paginatedMemoryBooks.value[0].id).toBe(2)
    })
  })

  describe('utility functions', () => {
    it('should format dates correctly', () => {
      const dateString = '2023-12-25T10:30:00Z'
      const formatted = memoryStudio.formatDate(dateString)
      expect(formatted).toMatch(/Dec \d+, 2023/)
    })

    it('should handle invalid dates gracefully', () => {
      expect(memoryStudio.formatDate('invalid-date')).toBe('Invalid Date')
      expect(memoryStudio.formatDate(null)).toBe('')
      expect(memoryStudio.formatDate(undefined)).toBe('')
    })

    it('should return correct status text', () => {
      expect(memoryStudio.getStatusText('draft')).toBe('Draft')
      expect(memoryStudio.getStatusText('ready')).toBe('Ready')
      expect(memoryStudio.getStatusText('approved')).toBe('Approved')
      expect(memoryStudio.getStatusText('unknown')).toBe('Unknown')
    })

    it('should return correct status severity', () => {
      expect(memoryStudio.getStatusSeverity('draft')).toBe('warning')
      expect(memoryStudio.getStatusSeverity('ready')).toBe('info')
      expect(memoryStudio.getStatusSeverity('approved')).toBe('success')
    })

    it('should return correct status classes', () => {
      expect(memoryStudio.getStatusClass('draft')).toBe('bg-yellow-100 text-yellow-700')
      expect(memoryStudio.getStatusClass('ready')).toBe('bg-blue-100 text-blue-700')
      expect(memoryStudio.getStatusClass('approved')).toBe('bg-green-100 text-green-700')
    })

    it('should return correct status badge classes', () => {
      expect(memoryStudio.getStatusBadgeClass('draft')).toBe('bg-amber-50 text-amber-700 border border-amber-200')
      expect(memoryStudio.getStatusBadgeClass('ready')).toBe('bg-green-50 text-green-700 border border-green-200')
      expect(memoryStudio.getStatusBadgeClass('approved')).toBe('bg-emerald-50 text-emerald-700 border border-emerald-200')
    })

    it('should return correct status icons', () => {
      expect(memoryStudio.getStatusIcon('draft')).toBe('pi pi-pencil')
      expect(memoryStudio.getStatusIcon('ready')).toBe('pi pi-check-circle')
      expect(memoryStudio.getStatusIcon('approved')).toBe('pi pi-check')
      expect(memoryStudio.getStatusIcon('generating')).toBe('pi pi-spinner pi-spin')
    })

    it('should return correct file type display', () => {
      expect(memoryStudio.getFileTypeDisplay({ output: 'PDF' })).toBe('PDF')
      expect(memoryStudio.getFileTypeDisplay({ output: 'JPG' })).toBe('JPG')
      expect(memoryStudio.getFileTypeDisplay(null)).toBe('PDF')
    })

    it('should return correct file type icons', () => {
      expect(memoryStudio.getFileTypeIcon({ output: 'PDF' })).toBe('pi pi-file-pdf')
      expect(memoryStudio.getFileTypeIcon({ output: 'JPG' })).toBe('pi pi-image')
      expect(memoryStudio.getFileTypeIcon(null)).toBe('pi pi-file-pdf')
    })

    it('should return correct file type colors', () => {
      expect(memoryStudio.getFileTypeColor({ output: 'PDF' })).toBe('text-brand-primary')
      expect(memoryStudio.getFileTypeColor({ output: 'JPG' })).toBe('text-brand-accent')
      expect(memoryStudio.getFileTypeColor(null)).toBe('text-brand-primary')
    })
  })

  describe('asset thumbnail functions', () => {
    beforeEach(() => {
      memoryStudio.assetThumbnails.value = {
        'asset-1': 'thumbnail-url-1',
        'asset-2': 'thumbnail-url-2'
      }
    })

    it('should get asset thumbnail by ID', () => {
      expect(memoryStudio.getAssetThumbnail('asset-1')).toBe('thumbnail-url-1')
      expect(memoryStudio.getAssetThumbnail('asset-2')).toBe('thumbnail-url-2')
      expect(memoryStudio.getAssetThumbnail('non-existent')).toBe(null)
    })

    it('should get first asset thumbnail for book', () => {
      const book = {
        created_from_assets: ['asset-1', 'asset-2'],
        magic_story: null
      }
      expect(memoryStudio.getFirstAssetThumbnail(book)).toBe('thumbnail-url-1')
    })

    it('should return null for book with magic story', () => {
      const book = {
        created_from_assets: ['asset-1', 'asset-2'],
        magic_story: 'Some story'
      }
      expect(memoryStudio.getFirstAssetThumbnail(book)).toBe(null)
    })

    it('should return null for book with no assets', () => {
      const book = {
        created_from_assets: [],
        magic_story: null
      }
      expect(memoryStudio.getFirstAssetThumbnail(book)).toBe(null)
    })
  })
})
