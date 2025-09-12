import { ref } from 'vue'
import { useDatabase } from './useDatabase'
import { useAnalytics } from './useAnalytics'

export const useMemoryBookOperations = () => {
  const { memoryBooks: dbMemoryBooks } = useDatabase()
  const { trackEvent } = useAnalytics()

  // State
  const newlyCreatedBook = ref(null)
  const selectedBook = ref(null)
  const showDetailsModal = ref(false)
  const showPdfModal = ref(false)
  const pdfBlobUrl = ref(null)

  // Methods
  const createMemoryBook = async (newBook) => {
    console.log('🔧 [createMemoryBook] Called. newBook:', JSON.parse(JSON.stringify(newBook)))
    
    // Make ai_supplemental_prompt optional - use default if not provided
    if (!newBook.ai_supplemental_prompt || newBook.ai_supplemental_prompt.trim() === '') {
      newBook.ai_supplemental_prompt = 'Create a beautiful memory book'
    }

    try {
      const { data, error } = await dbMemoryBooks.createMemoryBook({
        ai_supplemental_prompt: newBook.ai_supplemental_prompt,
        layout_type: newBook.layoutType,
        print_size: newBook.printSize,
        quality: newBook.quality,
        medium: newBook.medium,
        output: newBook.output,
        grid_layout: newBook.gridLayout,
        memory_shape: newBook.memoryShape,
        memory_event: newBook.memoryEvent,
        format: 'book'
      })

      if (error) {
        console.error('❌ Error creating memory book:', error)
        throw error
      }

      console.log('✅ Memory book created successfully:', data)
      newlyCreatedBook.value = data
      
      // Track creation
      trackEvent('memory_book_created', {
        book_id: data.id,
        layout_type: newBook.layoutType,
        print_size: newBook.printSize,
        quality: newBook.quality,
        medium: newBook.medium,
        output: newBook.output
      })

      return data
    } catch (error) {
      console.error('❌ Failed to create memory book:', error)
      throw error
    }
  }

  const generatePDF = async (book) => {
    console.log('generatePDF called for book:', book.id)
    
    // Check if the book has assets
    if (!book.created_from_assets || book.created_from_assets.length === 0) {
      console.log('⚠️ Book has no assets, cannot generate PDF')
      return
    }

    try {
      const { data, error } = await dbMemoryBooks.generateMemoryBook(book.id, book.created_from_assets || [])
      
      if (error) {
        console.error('❌ Error generating PDF:', error)
        throw error
      }

      console.log('✅ PDF generation started:', data)
      
      // Track generation attempt
      trackEvent('memory_book_generate_attempt', {
        book_id: book.id,
        asset_count: book.created_from_assets.length
      })

      return data
    } catch (error) {
      console.error('❌ Failed to generate PDF:', error)
      throw error
    }
  }

  const downloadPDF = async (book) => {
    try {
      // Track download attempt
      trackEvent('memory_book_download_attempt', {
        book_id: book.id,
        status: book.status
      })

      const data = await dbMemoryBooks.downloadMemoryBook(book.id)
      
      if (!data) {
        console.error('❌ Error downloading PDF: No data returned')
        throw new Error('Failed to download PDF')
      }

      // Create blob URL and trigger download
      const blob = new Blob([data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${book.ai_supplemental_prompt || 'memory-book'}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      // Track successful download
      trackEvent('memory_book_download_success', {
        book_id: book.id
      })

    } catch (error) {
      console.error('❌ Failed to download PDF:', error)
      
      // Track failed download
      trackEvent('memory_book_download_failed', {
        book_id: book.id,
        error: error.message
      })
      
      throw error
    }
  }

  const approveBook = async (bookId) => {
    try {
      const { data, error } = await dbMemoryBooks.updateMemoryBook(bookId, {
        status: 'approved'
      })

      if (error) {
        console.error('❌ Error approving book:', error)
        throw error
      }

      console.log('✅ Book approved successfully:', data)
      
      // Track approval
      trackEvent('memory_book_approved', {
        book_id: bookId
      })

      return data
    } catch (error) {
      console.error('❌ Failed to approve book:', error)
      throw error
    }
  }

  const unapproveBook = async (bookId) => {
    try {
      const { data, error } = await dbMemoryBooks.updateMemoryBook(bookId, {
        status: 'ready'
      })

      if (error) {
        console.error('❌ Error unapproving book:', error)
        throw error
      }

      console.log('✅ Book unapproved successfully:', data)
      
      // Track unapproval
      trackEvent('memory_book_unapproved', {
        book_id: bookId
      })

      return data
    } catch (error) {
      console.error('❌ Failed to unapprove book:', error)
      throw error
    }
  }

  const deleteBook = async (bookId) => {
    try {
      const { data, error } = await dbMemoryBooks.deleteMemoryBook(bookId)

      if (error) {
        console.error('❌ Error deleting book:', error)
        throw error
      }

      console.log('✅ Book deleted successfully:', data)
      
      // Track deletion
      trackEvent('memory_book_deleted', {
        book_id: bookId
      })

      return data
    } catch (error) {
      console.error('❌ Failed to delete book:', error)
      throw error
    }
  }

  const editBook = async (bookId, updates) => {
    try {
      const { data, error } = await dbMemoryBooks.updateMemoryBook(bookId, updates)

      if (error) {
        console.error('❌ Error editing book:', error)
        throw error
      }

      console.log('✅ Book edited successfully:', data)
      
      // Track edit
      trackEvent('memory_book_edited', {
        book_id: bookId,
        updates: Object.keys(updates)
      })

      return data
    } catch (error) {
      console.error('❌ Failed to edit book:', error)
      throw error
    }
  }

  const viewBookDetails = async (book) => {
    try {
      // Reset state first
      selectedBook.value = null
      
      // Load book details
      const data = await dbMemoryBooks.getMemoryBook(book.id)
      
      if (!data) {
        console.error('❌ Error loading book details: No data returned')
        throw new Error('Failed to load book details')
      }

      selectedBook.value = data
      showDetailsModal.value = true
      
      // Track view details
      trackEvent('memory_book_details_viewed', {
        book_id: book.id
      })

    } catch (error) {
      console.error('❌ Failed to view book details:', error)
      throw error
    }
  }

  const viewPDF = async (pdfUrl, bookId) => {
    try {
      // Force reset before setting new URL
      showPdfModal.value = false
      pdfBlobUrl.value = null
      
      // Small delay to ensure reset
      await new Promise(resolve => setTimeout(resolve, 100))
      
      pdfBlobUrl.value = pdfUrl
      showPdfModal.value = true
      
      // Track PDF view
      trackEvent('memory_book_pdf_viewed', {
        book_id: bookId
      })

    } catch (error) {
      console.error('❌ Failed to view PDF:', error)
      throw error
    }
  }

  const sharePdf = async () => {
    if (!pdfBlobUrl.value) return

    try {
      // Track share attempt
      trackEvent('memory_book_share_attempt', {
        book_id: selectedBook.value?.id
      })

      const response = await fetch(pdfBlobUrl.value)
      const blob = await response.blob()
      const file = new File([blob], `${selectedBook.value?.ai_supplemental_prompt || 'memory-book'}.pdf`, { type: 'application/pdf' })

      if (navigator.share) {
        await navigator.share({
          title: selectedBook.value?.ai_supplemental_prompt || 'Memory Book',
          text: 'Check out this memory book!',
          files: [file]
        })
        
        // Track successful share
        trackEvent('memory_book_shared', {
          book_id: selectedBook.value?.id,
          method: 'native'
        })
      } else {
        // Fallback to copy link
        await navigator.clipboard.writeText(window.location.href)
        
        // Track fallback share
        trackEvent('memory_book_shared', {
          book_id: selectedBook.value?.id,
          method: 'link_copy'
        })
      }
    } catch (error) {
      console.error('❌ Failed to share PDF:', error)
      
      // Track failed share
      trackEvent('memory_book_share_failed', {
        book_id: selectedBook.value?.id,
        error: error.message
      })
    }
  }

  return {
    // State
    newlyCreatedBook,
    selectedBook,
    showDetailsModal,
    showPdfModal,
    pdfBlobUrl,

    // Methods
    createMemoryBook,
    generatePDF,
    downloadPDF,
    approveBook,
    unapproveBook,
    deleteBook,
    editBook,
    viewBookDetails,
    viewPDF,
    sharePdf
  }
}
