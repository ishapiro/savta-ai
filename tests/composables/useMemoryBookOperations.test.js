import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useMemoryBookOperations } from '~/composables/useMemoryBookOperations'

// Mock the dependencies
vi.mock('~/composables/useDatabase', () => ({
  useDatabase: () => ({
    memoryBooks: {
      createMemoryBook: vi.fn(),
      generatePDF: vi.fn(),
      downloadPDF: vi.fn(),
      updateMemoryBook: vi.fn(),
      deleteMemoryBook: vi.fn(),
      getMemoryBookById: vi.fn()
    }
  })
}))

vi.mock('~/composables/useAnalytics', () => ({
  useAnalytics: () => ({
    trackEvent: vi.fn()
  })
}))

describe('useMemoryBookOperations', () => {
  let operations
  let mockDb
  let mockAnalytics

  beforeEach(() => {
    vi.clearAllMocks()
    operations = useMemoryBookOperations()
    
    // Get mocked functions
    const { useDatabase } = await import('~/composables/useDatabase')
    const { useAnalytics } = await import('~/composables/useAnalytics')
    mockDb = useDatabase().memoryBooks
    mockAnalytics = useAnalytics()
  })

  describe('initial state', () => {
    it('should initialize with null newly created book', () => {
      expect(operations.newlyCreatedBook.value).toBe(null)
    })
  })

  describe('createMemoryBook', () => {
    it('should create a memory book successfully', async () => {
      const newBook = {
        ai_supplemental_prompt: 'Test book',
        layoutType: 'grid',
        printSize: '5x7',
        quality: 'standard',
        medium: 'digital',
        output: 'PDF',
        gridLayout: '1x1',
        memoryShape: 'original',
        memoryEvent: 'vacation'
      }

      const createdBook = { id: 'book-1', ...newBook }
      mockDb.createMemoryBook.mockResolvedValue({ data: createdBook, error: null })

      const result = await operations.createMemoryBook(newBook)

      expect(mockDb.createMemoryBook).toHaveBeenCalledWith({
        ai_supplemental_prompt: 'Test book',
        layout_type: 'grid',
        print_size: '5x7',
        quality: 'standard',
        medium: 'digital',
        output: 'PDF',
        grid_layout: '1x1',
        memory_shape: 'original',
        memory_event: 'vacation',
        format: 'book'
      })
      expect(result).toEqual(createdBook)
      expect(operations.newlyCreatedBook.value).toEqual(createdBook)
      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('memory_book_created', {
        book_id: 'book-1',
        layout_type: 'grid',
        print_size: '5x7',
        quality: 'standard',
        medium: 'digital',
        output: 'PDF'
      })
    })

    it('should use default prompt when not provided', async () => {
      const newBook = {
        ai_supplemental_prompt: '',
        layoutType: 'grid'
      }

      const createdBook = { id: 'book-1' }
      mockDb.createMemoryBook.mockResolvedValue({ data: createdBook, error: null })

      await operations.createMemoryBook(newBook)

      expect(mockDb.createMemoryBook).toHaveBeenCalledWith(
        expect.objectContaining({
          ai_supplemental_prompt: 'Create a beautiful memory book'
        })
      )
    })

    it('should handle creation errors', async () => {
      const newBook = { ai_supplemental_prompt: 'Test book' }
      const error = new Error('Creation failed')
      mockDb.createMemoryBook.mockResolvedValue({ data: null, error })

      await expect(operations.createMemoryBook(newBook)).rejects.toThrow('Creation failed')
    })
  })

  describe('generatePDF', () => {
    it('should generate PDF successfully', async () => {
      const book = {
        id: 'book-1',
        created_from_assets: ['asset-1', 'asset-2']
      }

      const result = { success: true }
      mockDb.generatePDF.mockResolvedValue({ data: result, error: null })

      const response = await operations.generatePDF(book)

      expect(mockDb.generatePDF).toHaveBeenCalledWith('book-1')
      expect(response).toEqual(result)
      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('memory_book_generate_attempt', {
        book_id: 'book-1',
        asset_count: 2
      })
    })

    it('should not generate PDF for book without assets', async () => {
      const book = {
        id: 'book-1',
        created_from_assets: []
      }

      await operations.generatePDF(book)

      expect(mockDb.generatePDF).not.toHaveBeenCalled()
    })

    it('should handle generation errors', async () => {
      const book = {
        id: 'book-1',
        created_from_assets: ['asset-1']
      }

      const error = new Error('Generation failed')
      mockDb.generatePDF.mockResolvedValue({ data: null, error })

      await expect(operations.generatePDF(book)).rejects.toThrow('Generation failed')
    })
  })

  describe('downloadPDF', () => {
    it('should download PDF successfully', async () => {
      const book = { id: 'book-1', status: 'approved' }
      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' })
      mockDb.downloadPDF.mockResolvedValue({ data: mockBlob, error: null })

      // Mock DOM methods
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink)
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})
      vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:url')
      vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {})

      await operations.downloadPDF(book)

      expect(mockDb.downloadPDF).toHaveBeenCalledWith('book-1')
      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('memory_book_download_attempt', {
        book_id: 'book-1',
        status: 'approved'
      })
      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('memory_book_download_success', {
        book_id: 'book-1'
      })
    })

    it('should handle download errors', async () => {
      const book = { id: 'book-1' }
      const error = new Error('Download failed')
      mockDb.downloadPDF.mockResolvedValue({ data: null, error })

      await expect(operations.downloadPDF(book)).rejects.toThrow('Download failed')
      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('memory_book_download_failed', {
        book_id: 'book-1',
        error: 'Download failed'
      })
    })
  })

  describe('approveBook', () => {
    it('should approve book successfully', async () => {
      const bookId = 'book-1'
      const approvedBook = { id: bookId, status: 'approved' }
      mockDb.updateMemoryBook.mockResolvedValue({ data: approvedBook, error: null })

      const result = await operations.approveBook(bookId)

      expect(mockDb.updateMemoryBook).toHaveBeenCalledWith(bookId, { status: 'approved' })
      expect(result).toEqual(approvedBook)
      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('memory_book_approved', {
        book_id: bookId
      })
    })

    it('should handle approval errors', async () => {
      const bookId = 'book-1'
      const error = new Error('Approval failed')
      mockDb.updateMemoryBook.mockResolvedValue({ data: null, error })

      await expect(operations.approveBook(bookId)).rejects.toThrow('Approval failed')
    })
  })

  describe('unapproveBook', () => {
    it('should unapprove book successfully', async () => {
      const bookId = 'book-1'
      const unapprovedBook = { id: bookId, status: 'ready' }
      mockDb.updateMemoryBook.mockResolvedValue({ data: unapprovedBook, error: null })

      const result = await operations.unapproveBook(bookId)

      expect(mockDb.updateMemoryBook).toHaveBeenCalledWith(bookId, { status: 'ready' })
      expect(result).toEqual(unapprovedBook)
      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('memory_book_unapproved', {
        book_id: bookId
      })
    })

    it('should handle unapproval errors', async () => {
      const bookId = 'book-1'
      const error = new Error('Unapproval failed')
      mockDb.updateMemoryBook.mockResolvedValue({ data: null, error })

      await expect(operations.unapproveBook(bookId)).rejects.toThrow('Unapproval failed')
    })
  })

  describe('deleteBook', () => {
    it('should delete book successfully', async () => {
      const bookId = 'book-1'
      const deletedBook = { id: bookId }
      mockDb.deleteMemoryBook.mockResolvedValue({ data: deletedBook, error: null })

      const result = await operations.deleteBook(bookId)

      expect(mockDb.deleteMemoryBook).toHaveBeenCalledWith(bookId)
      expect(result).toEqual(deletedBook)
      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('memory_book_deleted', {
        book_id: bookId
      })
    })

    it('should handle deletion errors', async () => {
      const bookId = 'book-1'
      const error = new Error('Deletion failed')
      mockDb.deleteMemoryBook.mockResolvedValue({ data: null, error })

      await expect(operations.deleteBook(bookId)).rejects.toThrow('Deletion failed')
    })
  })

  describe('editBook', () => {
    it('should edit book successfully', async () => {
      const bookId = 'book-1'
      const updates = { ai_supplemental_prompt: 'Updated prompt' }
      const editedBook = { id: bookId, ...updates }
      mockDb.updateMemoryBook.mockResolvedValue({ data: editedBook, error: null })

      const result = await operations.editBook(bookId, updates)

      expect(mockDb.updateMemoryBook).toHaveBeenCalledWith(bookId, updates)
      expect(result).toEqual(editedBook)
      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('memory_book_edited', {
        book_id: bookId,
        updates: ['ai_supplemental_prompt']
      })
    })

    it('should handle edit errors', async () => {
      const bookId = 'book-1'
      const updates = { ai_supplemental_prompt: 'Updated prompt' }
      const error = new Error('Edit failed')
      mockDb.updateMemoryBook.mockResolvedValue({ data: null, error })

      await expect(operations.editBook(bookId, updates)).rejects.toThrow('Edit failed')
    })
  })

  describe('viewBookDetails', () => {
    it('should view book details successfully', async () => {
      const book = { id: 'book-1' }
      const bookDetails = { id: 'book-1', title: 'Test Book' }
      mockDb.getMemoryBookById.mockResolvedValue({ data: bookDetails, error: null })

      await operations.viewBookDetails(book)

      expect(mockDb.getMemoryBookById).toHaveBeenCalledWith('book-1')
      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('memory_book_details_viewed', {
        book_id: 'book-1'
      })
    })

    it('should handle view details errors', async () => {
      const book = { id: 'book-1' }
      const error = new Error('View failed')
      mockDb.getMemoryBookById.mockResolvedValue({ data: null, error })

      await expect(operations.viewBookDetails(book)).rejects.toThrow('View failed')
    })
  })

  describe('viewPDF', () => {
    it('should view PDF successfully', async () => {
      const pdfUrl = 'https://example.com/book.pdf'
      const bookId = 'book-1'

      await operations.viewPDF(pdfUrl, bookId)

      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('memory_book_pdf_viewed', {
        book_id: bookId
      })
    })
  })

  describe('sharePdf', () => {
    it('should share PDF using native share when available', async () => {
      const mockShare = vi.fn().mockResolvedValue()
      Object.defineProperty(navigator, 'share', {
        writable: true,
        configurable: true,
        value: mockShare
      })

      // Mock fetch and blob creation
      global.fetch = vi.fn().mockResolvedValue({
        blob: () => Promise.resolve(new Blob(['pdf content'], { type: 'application/pdf' }))
      })

      operations.pdfBlobUrl.value = 'blob:url'
      operations.selectedBook.value = { id: 'book-1', ai_supplemental_prompt: 'Test Book' }

      await operations.sharePdf()

      expect(mockShare).toHaveBeenCalledWith({
        title: 'Test Book',
        text: 'Check out this memory book!',
        files: [expect.any(File)]
      })
      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('memory_book_shared', {
        book_id: 'book-1',
        method: 'native'
      })
    })

    it('should fallback to link copy when native share is not available', async () => {
      Object.defineProperty(navigator, 'share', {
        writable: true,
        configurable: true,
        value: undefined
      })

      const mockWriteText = vi.fn().mockResolvedValue()
      Object.defineProperty(navigator, 'clipboard', {
        writable: true,
        configurable: true,
        value: { writeText: mockWriteText }
      })

      operations.pdfBlobUrl.value = 'blob:url'
      operations.selectedBook.value = { id: 'book-1' }

      await operations.sharePdf()

      expect(mockWriteText).toHaveBeenCalledWith(window.location.href)
      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('memory_book_shared', {
        book_id: 'book-1',
        method: 'link_copy'
      })
    })

    it('should handle share errors', async () => {
      const mockShare = vi.fn().mockRejectedValue(new Error('Share failed'))
      Object.defineProperty(navigator, 'share', {
        writable: true,
        configurable: true,
        value: mockShare
      })

      global.fetch = vi.fn().mockResolvedValue({
        blob: () => Promise.resolve(new Blob(['pdf content'], { type: 'application/pdf' }))
      })

      operations.pdfBlobUrl.value = 'blob:url'
      operations.selectedBook.value = { id: 'book-1' }

      await operations.sharePdf()

      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('memory_book_share_failed', {
        book_id: 'book-1',
        error: 'Share failed'
      })
    })
  })
})
