import { ref } from 'vue'

export const useProgressDialog = () => {
  // Progress dialog state
  const showProgressDialog = ref(false)
  const currentProgress = ref(0)
  const currentProgressMessage = ref('')
  const currentBookId = ref(null)
  const progressInterval = ref(null)
  const isRegenerating = ref(false)

  // Poll PDF status
  const pollPdfStatus = async () => {
    console.log('🔍 [pollPdfStatus] called with', currentBookId.value)
    if (!currentBookId.value) {
      // Defensive: clear interval if still running
      if (progressInterval.value) {
        clearInterval(progressInterval.value)
        progressInterval.value = null
        console.warn('Cleared polling interval because currentBookId.value is null')
      }
      return
    }

    // Add a small delay to ensure backend updates are committed
    await new Promise(resolve => setTimeout(resolve, 100))

    try {
      const supabase = useNuxtApp().$supabase
      const { data: sessionData } = await supabase.auth.getSession()

      const response = await $fetch(`/api/memory-books/status/${currentBookId.value}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionData.session?.access_token}`
        }
      })

      console.log('🔍 [pollPdfStatus] PDF status response:', response)

      if (!response) {
        console.warn('No response from status API')
        return
      }

      const status = response
      console.log('🔍 [pollPdfStatus] Status:', status)

      // Parse percentage from status message if available
      if (status.pdf_status && status.pdf_status.includes('%')) {
        const percentMatch = status.pdf_status.match(/(\d+)%/)
        if (percentMatch) {
          const percent = parseInt(percentMatch[1])
          currentProgress.value = Math.min(percent, 95) // Cap at 95% until completion
          currentProgressMessage.value = status.pdf_status
          return
        }
      }
      
      // Only close the dialog when the PDF generation is truly completed
      if (status.pdf_url && status.book_status === 'ready') {
        console.log('✅ PDF URL found and book status is ready, closing dialog and displaying PDF')
        currentProgress.value = 100
        currentProgressMessage.value = isRegenerating.value 
          ? 'Your special memory is ready!' 
          : 'Your memory book is ready!'
        setTimeout(async () => {
          stopProgressPolling()
          showProgressDialog.value = false
          
          // Reload memory books to show updated status
          try {
            const { useMemoryStudio } = await import('~/composables/useMemoryStudio')
            const { loadMemoryBooks } = useMemoryStudio()
            await loadMemoryBooks()
          } catch (error) {
            console.error('Error reloading memory books:', error)
          }
          
          // Display the PDF in the viewer
          try {
            const cacheBuster = `cb=${Date.now()}`;
            const pdfUrlWithBuster = status.pdf_url.includes('?')
              ? `${status.pdf_url}&${cacheBuster}`
              : `${status.pdf_url}?${cacheBuster}`;
            await viewPDF(pdfUrlWithBuster, currentBookId.value)
          } catch (error) {
            console.error('Error displaying PDF:', error)
          }
        }, 2000)
        return
      }
      
      // If we have a PDF URL but status is not ready, close after a reasonable timeout
      // BUT: For regeneration, we should wait for the new PDF to be generated
      if (status.pdf_url && status.pdf_url.startsWith('https://') && status.book_status !== 'ready') {
        // For regeneration, check if this is an old PDF URL by looking at the timestamp
        // If the PDF URL is from a previous generation, don't close the dialog yet
        if (isRegenerating.value) {
          console.log('🔄 Regeneration in progress - waiting for new PDF to be generated')
          console.log('🔍 Debug - Status details:', {
            pdf_url: status.pdf_url,
            book_status: status.book_status,
            pdf_status: status.pdf_status,
            isRegenerating: isRegenerating.value
          })
          // Don't close the dialog yet, continue polling
          return
        }
        
        console.log('⚠️ PDF URL found but book status is not ready, closing dialog anyway')
        console.log('🔍 Debug - Status details:', {
          pdf_url: status.pdf_url,
          book_status: status.book_status,
          pdf_status: status.pdf_status
        })
        currentProgress.value = 100
        currentProgressMessage.value = isRegenerating.value 
          ? 'Your memory is ready!' 
          : 'Your memory is ready!'
        setTimeout(async () => {
          stopProgressPolling()
          showProgressDialog.value = false
          
          // Reload memory books to show updated status
          try {
            const { useMemoryStudio } = await import('~/composables/useMemoryStudio')
            const { loadMemoryBooks } = useMemoryStudio()
            await loadMemoryBooks()
          } catch (error) {
            console.error('Error reloading memory books:', error)
          }
          
          // Display the PDF in the viewer
          try {
            const cacheBuster = `cb=${Date.now()}`;
            const pdfUrlWithBuster = status.pdf_url.includes('?')
              ? `${status.pdf_url}&${cacheBuster}`
              : `${status.pdf_url}?${cacheBuster}`;
            await viewPDF(pdfUrlWithBuster, currentBookId.value)
          } catch (error) {
            console.error('Error displaying PDF:', error)
          }
        }, 2000)
        return
      }
      
      // Update progress based on status - Enhanced for magic memory regeneration
      if (status.pdf_status === 'generating_background') {
        currentProgress.value = 10
        currentProgressMessage.value = 'Generating custom background image...'
      } else if (status.pdf_status === 'background_ready') {
        currentProgress.value = 20
        currentProgressMessage.value = 'Background ready, generating PDF...'
      } else if (status.pdf_status === 'generating_pdf') {
        currentProgress.value = 50
        currentProgressMessage.value = 'Weaving your memories into pages...'
      } else if (status.pdf_status === 'finalizing') {
        currentProgress.value = 90
        currentProgressMessage.value = 'Adding the final special touches...'
      } else if (status.pdf_status === 'completed') {
        currentProgress.value = 100
        currentProgressMessage.value = 'Your memory is ready!'
      } else if (status.pdf_status === 'error') {
        currentProgressMessage.value = status.pdf_error || 'PDF generation failed'
        setTimeout(() => {
          stopProgressPolling()
          showProgressDialog.value = false
        }, 4000)
      } else if (status.pdf_status === 'not_started') {
        currentProgress.value = 5
        currentProgressMessage.value = 'Gathering special ingredients...'
      } else if (status.pdf_status === 'Creating beautiful background design...') {
        currentProgress.value = 15
        currentProgressMessage.value = 'Creating beautiful background design...'
      } else if (status.pdf_status === 'Downloading background design...') {
        currentProgress.value = 25
        currentProgressMessage.value = 'Summoning the background design...'
      } else if (status.pdf_status === 'Saving background to storage...') {
        currentProgress.value = 30
        currentProgressMessage.value = 'Saving background to storage...'
      } else if (status.pdf_status === 'Background ready for outputgeneration') {
        currentProgress.value = 35
        currentProgressMessage.value = 'Background ready for output generation'
      } else if (status.pdf_status === 'Setting up PDF document...') {
        currentProgress.value = 40
        currentProgressMessage.value = 'Setting up PDF document...'
      } else if (status.pdf_status === 'Background ready, creating pages...') {
        currentProgress.value = 45
        currentProgressMessage.value = 'Background ready, creating pages...'
      } else if (status.pdf_status === '🤔 Processing with AI...') {
        currentProgress.value = 8
        currentProgressMessage.value = '🤔 Processing with AI...'
      } else if (status.pdf_status && status.pdf_status.startsWith('🎯 PHOTO SELECTION')) {
        currentProgress.value = 15
        currentProgressMessage.value = status.pdf_status
      } else if (status.pdf_status && status.pdf_status.startsWith('📝 STORY GENERATION')) {
        currentProgress.value = 25
        currentProgressMessage.value = status.pdf_status
      } else if (status.pdf_status && status.pdf_status.startsWith('🎨 BACKGROUND GENERATION')) {
        currentProgress.value = 35
        currentProgressMessage.value = status.pdf_status
      } else if (status.pdf_status && status.pdf_status.startsWith('📄 PDF GENERATION')) {
        currentProgress.value = 60
        currentProgressMessage.value = status.pdf_status
      } else if (status.pdf_status && status.pdf_status.startsWith('✨ FINALIZING')) {
        currentProgress.value = 85
        currentProgressMessage.value = status.pdf_status
      } else {
        // Fallback: increment progress if we don't recognize the status
        if (currentProgress.value < 90) {
          currentProgress.value += 5
          currentProgressMessage.value = 'Processing your memory ...'
        }
      }
    } catch (error) {
      console.error('Error polling PDF status:', error)
      // Fallback: show generic progress on error
      if (currentProgress.value < 90) {
        currentProgress.value += 5
        currentProgressMessage.value = 'Processing your memory ...'
      }
    }
  }

  // Start progress polling
  const startProgressPolling = (bookId, regenerating = false) => {
    console.log('🔍 [startProgressPolling] called with bookId:', bookId, 'regenerating:', regenerating)
    currentBookId.value = bookId
    currentProgress.value = 0
    isRegenerating.value = regenerating
    currentProgressMessage.value = regenerating 
      ? 'Preparing your recipe...' 
      : 'Starting memory creation...'
    showProgressDialog.value = true
    console.log('🔍 [startProgressPolling] showProgressDialog set to:', showProgressDialog.value)
    
    // Poll every 3 seconds
    progressInterval.value = setInterval(pollPdfStatus, 3000)
    
    // Initial poll
    pollPdfStatus()
    
    // Set a timeout to stop polling after 5 minutes (300 seconds)
    const timeout = setTimeout(() => {
      console.log('PDF generation timeout, closing dialog')
      stopProgressPolling()
      showProgressDialog.value = false
    }, 300000) // 5 minutes
  }

  // Stop progress polling
  const stopProgressPolling = () => {
    if (progressInterval.value) {
      clearInterval(progressInterval.value)
      progressInterval.value = null
    }
    // Only now set currentBookId.value to null
    currentBookId.value = null
  }

  // Generate PDF function
  const generatePDF = async (book) => {
    console.log('🔍 [generatePDF] called for book:', book.id)
    
    // Check if the book has assets
    const hasAssets = book.created_from_assets && book.created_from_assets.length > 0
    
    if (!hasAssets) {
      console.error('❌ Cannot generate PDF: No assets found in memory book')
      console.log('Book layout type:', book.layout_type)
      console.log('Photo selection pool:', book.photo_selection_pool)
      console.log('Created from assets:', book.created_from_assets)
      return
    }
    
    try {
      // Progress polling is already started by the caller
      console.log('🔍 [generatePDF] Progress dialog should be visible:', showProgressDialog.value)
      
      // Set initial status immediately to avoid showing old status
      currentProgressMessage.value = '🚀 Getting started...'
      
      // For regeneration, clear existing background and PDF URLs first
      if (book.status === 'ready' && (book.background_url || book.pdf_url)) {
        console.log('🔄 Regenerating memory, clearing existing URLs...')
        try {
          const { useDatabase } = await import('~/composables/useDatabase.js')
          const db = useDatabase()
          
          const updateData = {
            background_url: null,
            pdf_url: null,
            status: 'draft'
          }
          
          await db.memoryBooks.updateMemoryBook(book.id, updateData)
          console.log('✅ Cleared existing URLs for regeneration')
        } catch (clearError) {
          console.warn('⚠️ Failed to clear existing URLs:', clearError)
          // Continue anyway, the backend will handle it
        }
      }
      
      // Call the API endpoint to generate PDF with page count and page size
      console.log('🔍 [generatePDF] Calling PDF generation API...')
      const supabase = useNuxtApp().$supabase
      const { data: sessionData } = await supabase.auth.getSession()

      // Get the latest book data to ensure we have the most recent settings
      const { data: latestBook, error: bookError } = await supabase
        .from('memory_books')
        .select('*')
        .eq('id', book.id)
        .single()

      if (bookError || !latestBook) {
        throw new Error('Failed to fetch latest book data')
      }

      const printSize = latestBook.print_size || '8.5x11'
      console.log('📄 PDF generation parameters:', { printSize })

      const response = await $fetch(`/api/memory-books/download/${book.id}?printSize=${printSize}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionData.session?.access_token}`
        }
      })
      
      console.log('🔍 [generatePDF] PDF generation response:', response)
      
      if (!response.success) {
        throw new Error('Failed to generate PDF')
      }

      // The polling will handle the progress updates and dialog closing

    } catch (error) {
      console.error('❌ [generatePDF] Error generating PDF:', error)
      stopProgressPolling()
      showProgressDialog.value = false
      throw error
    }
  }

  // View PDF function - emits event for main page to handle
  const viewPDF = async (pdfUrl, bookId) => {
    console.log('🔍 [viewPDF] Opening PDF:', pdfUrl, 'for book:', bookId)
    console.log('🔍 [viewPDF] currentBookId.value:', currentBookId.value)
    console.log('🔍 [viewPDF] bookId parameter:', bookId)
    try {
      // Use the currentBookId if bookId is null/undefined
      const effectiveBookId = bookId || currentBookId.value
      console.log('🔍 [viewPDF] effectiveBookId:', effectiveBookId)
      
      // Emit event to main page to handle PDF viewing
      if (process.client) {
        window.dispatchEvent(new CustomEvent('view-pdf', {
          detail: { pdfUrl, bookId: effectiveBookId }
        }))
      }
    } catch (error) {
      console.error('❌ [viewPDF] Error opening PDF:', error)
      // Fallback: try to open in new tab
      window.open(pdfUrl, '_blank')
    }
  }

  return {
    // State
    showProgressDialog,
    currentProgress,
    currentProgressMessage,
    currentBookId,
    isRegenerating,
    
    // Methods
    startProgressPolling,
    stopProgressPolling,
    pollPdfStatus,
    generatePDF,
    viewPDF
  }
}
