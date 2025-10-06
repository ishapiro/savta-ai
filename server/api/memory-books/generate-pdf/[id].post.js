// PDF generation endpoint
// Generates PDF using pre-generated background

import { PDFDocument, rgb, degrees } from 'pdf-lib'
import sharp from 'sharp'
import smartcropGm from 'smartcrop-gm'

import { generateFingerprintsForAssets } from '../../../utils/generate-fingerprint.js'
import { renderTextToImage, getPdfFallbackConfig, createCaptionImage } from '../../../utils/text-renderer.js'
import { enhanceImage } from '../../../utils/image-enhancer.js'
import PdfLogger from '../../../utils/pdf-logger.js'

// Verbose logging gate for PDF generation
const PDF_VERBOSE = process.env.PDF_VERBOSE === 'true'
const vlog = (...args) => { if (PDF_VERBOSE) console.log(...args) }
const vwarn = (...args) => { if (PDF_VERBOSE) console.warn(...args) }

// Centralized function to save and upload PDF/JPG files
async function saveAndUploadFile(pdfDoc, book, user, supabase, config, printSize = '7x5', logger) {
  // Ensure printSize is always a valid string
  if (typeof printSize !== 'string' || !printSize) {
    printSize = (book && book.print_size) || '7x5';
  }
  
  logger.step('Saving PDF to buffer')
  const pdfBytes = await pdfDoc.save()
  logger.success(`PDF saved (${pdfBytes.length} bytes)`)
  
  // Check if we should convert to JPG based on output field
  const shouldConvertToJpg = book.output && book.output === 'JPG'
  
  let finalBytes = pdfBytes
  let contentType = 'application/pdf'
  let fileExtension = 'pdf'
  let fileName = `${user.id}/memory_book/pdfs/${book.id}_${Date.now()}.pdf`
  
  if (shouldConvertToJpg) {
    logger.step('JPG conversion enabled, checking PDF page count')
    try {
      // Load the PDF to check page count
      const pdfDocForCheck = await PDFDocument.load(pdfBytes)
      const pageCount = pdfDocForCheck.getPageCount()
      
      if (pageCount === 1) {
        logger.step('Converting single-page PDF to JPG')
        
        try {
          const conversionResponse = await fetch(`${config.public.siteUrl}/api/pdf-to-jpg`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              pdfBuffer: Array.from(pdfBytes),
              page: 1,
              quality: 100,
              dpi: 300,
              printSize: printSize
            })
          })
          
          if (!conversionResponse.ok) {
            const errorText = await conversionResponse.text()
            throw new Error(`PDF to JPG conversion failed: ${conversionResponse.status} - ${errorText}`)
          }
          
          const jpgBuffer = Buffer.from(await conversionResponse.arrayBuffer())
          finalBytes = jpgBuffer
          contentType = 'image/jpeg'
          fileExtension = 'jpg'
          fileName = `${user.id}/memory_book/pdfs/${book.id}_${Date.now()}.jpg`
          
          const compressionRatio = ((1 - jpgBuffer.length / pdfBytes.length) * 100).toFixed(1)
          logger.success(`PDF converted to JPG (${jpgBuffer.length} bytes, ${compressionRatio}% compression)`)
          
        } catch (conversionError) {
          logger.error('JPG conversion failed, keeping as PDF', conversionError.message)
          await updatePdfStatus(supabase, book.id, user.id, 'JPG conversion failed - keeping as PDF')
        }
      } else {
        logger.warning(`PDF has ${pageCount} pages, keeping as PDF (JPG conversion only for single-page documents)`)
        await updatePdfStatus(supabase, book.id, user.id, `PDF has ${pageCount} pages - keeping as PDF (JPG conversion only available for single-page documents)`)
      }
    } catch (conversionError) {
      logger.error('JPG conversion failed, keeping as PDF', conversionError.message)
      await updatePdfStatus(supabase, book.id, user.id, 'JPG conversion failed - keeping as PDF')
    }
  } else {
    logger.step('JPG conversion disabled, keeping as PDF')
  }
  
  const timestamp = Date.now()
  
  // Delete old PDF files if they exist
  logger.step('Cleaning up old PDF files')
  try {
    const { data: files, error: listError } = await supabase.storage
      .from('assets')
      .list(`${user.id}/memory_book/pdfs/`)
    
    if (!listError && files) {
      const filesToDelete = files
        .filter(file => file.name.startsWith(`${book.id}`))
        .map(file => `${user.id}/memory_book/pdfs/${file.name}`)
      
      if (filesToDelete.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from('assets')
          .remove(filesToDelete)
        
        if (deleteError) {
          logger.warning('Failed to delete old PDF files', deleteError.message)
        } else {
          logger.step('Old PDF files cleaned up')
        }
      }
    }
  } catch (error) {
    logger.warning('Error cleaning up old PDF files', error.message)
  }
  
  await updatePdfStatus(supabase, book.id, user.id, `Uploading ${fileExtension.toUpperCase()} to cloud storage...`)
  logger.step(`Uploading ${fileExtension.toUpperCase()} to storage`)
  
  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage.from('assets').upload(fileName, finalBytes, {
    contentType: contentType,
    upsert: true
  })
  
  if (uploadError) {
    logger.error(`Failed to upload ${fileExtension.toUpperCase()} to storage`, uploadError.message)
    throw new Error(`Failed to upload ${fileExtension.toUpperCase()} to storage: ` + uploadError.message)
  }
  logger.success(`${fileExtension.toUpperCase()} uploaded to storage`)
  
  // Get public URL
  await updatePdfStatus(supabase, book.id, user.id, 'Generating download link...')
  logger.step('Generating public URL')
  const { data: publicUrlData } = supabase.storage.from('assets').getPublicUrl(fileName)
  const publicUrl = publicUrlData?.publicUrl
  if (!publicUrl) {
    logger.error(`Failed to get public URL for ${fileExtension.toUpperCase()}`)
    throw new Error(`Failed to get public URL for ${fileExtension.toUpperCase()}`)
  }
  logger.success('Public URL generated')
  
  // Update the book with the public URL
  await updatePdfStatus(supabase, book.id, user.id, 'Saving file link to database...')
  logger.step('Updating book with file URL')
  
  const { data: updateData, error: updateError } = await supabase
    .from('memory_books')
    .update({ 
      pdf_url: publicUrl
    })
    .eq('id', book.id)
    .select()
  
  if (updateError) {
    logger.error('Error updating book with file URL', updateError.message)
    // Don't throw here, as the file was successfully uploaded
  } else {
    logger.success('Book updated with file URL')
  }
  
  return publicUrl
}

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const { createClient } = await import('@supabase/supabase-js')
    
    // Get the book ID from the URL
    const bookId = getRouterParam(event, 'id')
    
    if (!bookId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Book ID is required'
      })
    }
    
    // Initialize logger
    const logger = new PdfLogger(bookId, 'unknown') // Will update userId once we get it
    
    logger.step('🚀 STARTING PDF GENERATION PROCESS')
    
    // Use the service role key for server-side operations
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey || config.public.supabaseKey
    )
    
    // Get user from auth token
    logger.step('Authenticating user')
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      logger.error('Authentication failed', authError?.message)
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }
    
    // Update logger with actual user ID
    logger.userId = user.id
    logger.success(`User authenticated: ${user.id}`)
    
    // Update status to show AI processing has started
    await updatePdfStatus(supabase, bookId, user.id, '🤔 Processing with AI...')
    
    // Verify the memory book exists and belongs to the user
    logger.step('Fetching memory book')
    let { data: book, error: bookError } = await supabase
      .from('memory_books')
      .select('*')
      .eq('id', bookId)
      .eq('user_id', user.id)
      .single()
    
    if (bookError || !book) {
      logger.error('Memory book not found', bookError?.message)
      throw createError({
        statusCode: 404,
        statusMessage: 'Memory book not found'
      })
    }
    
    logger.success(`Memory book found (ID: ${book.id}, Status: ${book.status})`)
    
    // Log book summary
    logger.step('Book details', {
      layout_type: book.layout_type,
      background_type: book.background_type,
      assets_count: book.created_from_assets?.length || 0,
      theme_id: book.theme_id || 'none',
      output: book.output || 'PDF'
    })
    
    // ========================================
    // STEP 1: SELECT PHOTOS FROM THE LARGER PHOTO POOL
    // ========================================
    logger.step('🎯 STEP 1: PHOTO SELECTION - Starting photo selection process')
    
    // Calculate photo count for the layout
    let photoCount = 3 // Default fallback
    if (book.layout_type === 'theme' && book.theme_id) {
      // Fetch theme to get layout config
      const { data: theme, error: themeError } = await supabase
        .from('themes')
        .select('*')
        .eq('id', book.theme_id)
        .single()
      
      if (!themeError && theme) {
        const layoutConfig = typeof theme.layout_config === 'string' 
          ? JSON.parse(theme.layout_config) 
          : theme.layout_config
        
        if (layoutConfig && layoutConfig.photos) {
          photoCount = layoutConfig.photos.length
        }
      }
    } else if (book.layout_type === 'grid' && book.grid_layout) {
      // Calculate photo count from grid layout
      const [rows, cols] = book.grid_layout.split('x').map(Number)
      const memoriesPerPage = rows * cols
      const pageCount = book.page_count || 1
      photoCount = memoriesPerPage * pageCount
      
      logger.step('🔍 Calculated photo count from grid layout:', {
        gridLayout: book.grid_layout,
        rows,
        cols,
        memoriesPerPage,
        pageCount,
        photoCount
      })
    }
    
    // Check if we need to select photos (missing selected assets or wrong number for theme)
    const hasSelectedAssets = book.created_from_assets && book.created_from_assets.length > 0
    const hasCorrectPhotoCount = hasSelectedAssets && book.created_from_assets.length === photoCount
    const needsPhotoSelection = !hasSelectedAssets || !hasCorrectPhotoCount
    
    logger.step('Photo selection check', {
      hasCreatedFromAssets: !!book.created_from_assets,
      createdFromAssetsLength: book.created_from_assets?.length || 0,
      requiredPhotoCount: photoCount,
      hasCorrectPhotoCount,
      needsPhotoSelection,
      bookId: book.id,
      bookStatus: book.status
    })
    
    if (!hasCorrectPhotoCount && hasSelectedAssets) {
      logger.step('🎯 STEP 1: PHOTO SELECTION - Regenerating photos (wrong count)', {
        currentCount: book.created_from_assets.length,
        requiredCount: photoCount,
        reason: 'Theme requires different number of photos'
      })
    }
    
    if (needsPhotoSelection) {
      logger.step('🎯 STEP 1: PHOTO SELECTION - Executing photo selection (needed)')
      logger.step('📸 Photo selection details', {
        photoCount,
        photoSelectionPoolSize: book.photo_selection_pool?.length || 0,
        aiSupplementalPrompt: book.ai_supplemental_prompt
      })
      
      // Fetch all assets from photo selection pool
      const { data: allAssets, error: allAssetsError } = await supabase
        .from('assets')
        .select('*')
        .in('id', book.photo_selection_pool || [])
        .eq('approved', true)
        .eq('deleted', false)
      
      if (allAssetsError) {
        logger.error('Error fetching photo selection pool assets', allAssetsError.message)
        throw new Error(`Failed to fetch photo selection pool assets: ${allAssetsError.message}`)
      }
      
      if (!allAssets || allAssets.length === 0) {
        logger.error('No assets found in photo selection pool')
        throw new Error('No assets found in photo selection pool')
      }
      
      logger.success(`Found ${allAssets.length} assets in photo selection pool`)
      
      // Call magic memory endpoint for photo selection
      logger.step('🎯 STEP 1: PHOTO SELECTION - Calling magic memory API')
      logger.step('📡 API call details', {
        endpoint: '/api/ai/magic-memory',
        requestBody: {
          memoryBookId: book.id,
          userId: user.id,
          photoCount: photoCount
        }
      })
      
      await updatePdfStatus(supabase, book.id, user.id, `🎯 Step 1: Selecting ${photoCount} photos from ${allAssets.length} available...`)
      
      const requestBody = {
        memoryBookId: book.id,
        userId: user.id,
        photoCount: photoCount
      }
      
      const magicRes = await fetch(`${config.public.siteUrl}/api/ai/magic-memory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })
      
      if (!magicRes.ok) {
        logger.error('Photo selection failed', `Status: ${magicRes.status}`)
        throw new Error(`Photo selection failed: ${magicRes.status}`)
      }
      
      const magicData = await magicRes.json()
      
      logger.step('🎯 STEP 1: PHOTO SELECTION - Magic memory API response received')
      logger.step('📡 API response details', {
        status: magicRes.status,
        success: magicData.success,
        hasSelectedPhotoIds: !!magicData.selected_photo_ids,
        selectedPhotoIdsLength: magicData.selected_photo_ids?.length || 0,
        hasReasoning: !!magicData.reasoning,
        reasoningLength: magicData.reasoning?.length || 0,
        error: magicData.error || null
      })
      
      if (!magicData.success) {
        logger.error('Photo selection failed', magicData.error)
        throw new Error('Photo selection failed: ' + magicData.error)
      }
      
      // Update the book with the selected photo IDs
      logger.step('🎯 STEP 1: PHOTO SELECTION - Updating book with selected photos')
      logger.step('💾 Database update details', {
        selectedPhotoIds: magicData.selected_photo_ids || [],
        reasoningLength: magicData.reasoning?.length || 0
      })
      
      const { error: updateError } = await supabase.from('memory_books').update({
        created_from_assets: magicData.selected_photo_ids || [],
        ai_photo_selection_reasoning: magicData.reasoning || null
      }).eq('id', book.id)
      
      if (updateError) {
        logger.error('Failed to update book with selected photos', updateError.message)
        throw new Error(`Failed to update book: ${updateError.message}`)
      }
      
      // Re-fetch the book to get updated values
      logger.step('🎯 STEP 1: PHOTO SELECTION - Re-fetching updated book')
      
      const { data: updatedBook, error: bookError } = await supabase
        .from('memory_books')
        .select('*')
        .eq('id', book.id)
        .single()
      
      if (!bookError && updatedBook) {
        book = updatedBook // Reassign the 'book' variable
        logger.success('🎯 STEP 1: PHOTO SELECTION - ✅ COMPLETED - Book updated with selected photos')
        logger.step('📊 Updated book details', {
          createdFromAssetsLength: book.created_from_assets?.length || 0,
          hasReasoning: !!book.ai_photo_selection_reasoning
        })
      } else {
        logger.error('❌ STEP 1: PHOTO SELECTION - Failed to re-fetch updated book', bookError?.message)
        throw new Error(`Failed to re-fetch book: ${bookError?.message}`)
      }
    } else {
      logger.step('🎯 STEP 1: PHOTO SELECTION - Skipped (not needed)')
      logger.step('📊 Existing photo selection details', {
        createdFromAssetsLength: book.created_from_assets?.length || 0,
        hasReasoning: !!book.ai_photo_selection_reasoning
      })
    }

    // ========================================
    // STEP 2: GENERATE STORY (if needed)
    // ========================================
    const needsStoryGeneration = !book.magic_story || book.magic_story.trim() === ''
    
    logger.step('📝 STEP 2: STORY GENERATION - Starting story generation check')
    logger.step('📊 Story generation check details', {
      hasMagicStory: !!book.magic_story,
      magicStoryLength: book.magic_story?.length || 0,
      needsStoryGeneration,
      bookId: book.id,
      bookStatus: book.status,
      aiSupplementalPrompt: book.ai_supplemental_prompt
    })
    
    if (needsStoryGeneration) {
      logger.step('📝 STEP 2: STORY GENERATION - Executing story generation (needed)')
      
      // Fetch the selected assets for story generation
      const { data: selectedAssets, error: selectedAssetsError } = await supabase
        .from('assets')
        .select('*')
        .in('id', book.created_from_assets || [])
        .eq('approved', true)
        .eq('deleted', false)
      
      if (selectedAssetsError) {
        logger.error('Error fetching selected assets for story generation', selectedAssetsError.message)
        throw new Error(`Failed to fetch selected assets: ${selectedAssetsError.message}`)
      }
      
      if (!selectedAssets || selectedAssets.length === 0) {
        logger.error('No selected assets found for story generation')
        throw new Error('No selected assets found for story generation')
      }
      
      logger.success(`Found ${selectedAssets.length} selected assets for story generation`)
      
      // Call story generation endpoint
      logger.step('📝 STEP 2: STORY GENERATION - Calling story generation API')
      logger.step('📡 Story API call details', {
        endpoint: '/api/ai/generate-story',
        selectedAssetsCount: selectedAssets.length,
        aiSupplementalPrompt: book.ai_supplemental_prompt,
        hasPhotoSelectionReasoning: !!book.ai_photo_selection_reasoning
      })
      
      await updatePdfStatus(supabase, book.id, user.id, `📝 Generating story from ${selectedAssets.length} selected photos...`)
      
      const storyRequestBody = {
        selectedAssets: selectedAssets,
        aiSupplementalPrompt: book.ai_supplemental_prompt,
        photoSelectionReasoning: book.ai_photo_selection_reasoning
      }
      
      const storyRes = await fetch(`${config.public.siteUrl}/api/ai/generate-story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(storyRequestBody)
      })
      
      if (!storyRes.ok) {
        logger.error('Story generation failed', `Status: ${storyRes.status}`)
        throw new Error(`Story generation failed: ${storyRes.status}`)
      }
      
      const storyData = await storyRes.json()
      
      logger.step('📝 STEP 2: STORY GENERATION - Story generation API response received')
      logger.step('📡 Story API response details', {
        status: storyRes.status,
        success: storyData.success,
        hasStory: !!storyData.story,
        storyLength: storyData.story?.length || 0,
        error: storyData.error || null
      })
      
      if (!storyData.success) {
        logger.error('Story generation failed', storyData.error)
        throw new Error('Story generation failed: ' + storyData.error)
      }
      
      // Update the book with the generated story
      logger.step('📝 STEP 2: STORY GENERATION - Updating book with generated story')
      logger.step('💾 Story update details', {
        storyLength: storyData.story?.length || 0
      })
      
      const { error: storyUpdateError } = await supabase.from('memory_books').update({
        magic_story: storyData.story
      }).eq('id', book.id)
      
      if (storyUpdateError) {
        logger.error('❌ STEP 2: STORY GENERATION - Failed to update book with generated story', storyUpdateError.message)
        throw new Error(`Failed to update book: ${storyUpdateError.message}`)
      }
      
      // Re-fetch the book to get updated values
      logger.step('📝 STEP 2: STORY GENERATION - Re-fetching updated book')
      
      const { data: updatedBook, error: bookError } = await supabase
        .from('memory_books')
        .select('*')
        .eq('id', book.id)
        .single()
      
      if (!bookError && updatedBook) {
        book = updatedBook // Reassign the 'book' variable
        logger.success('📝 STEP 2: STORY GENERATION - ✅ COMPLETED - Book updated with generated story')
        console.log('STORY: Generated story:', book.magic_story)
        logger.step('📊 Updated book details', {
          magicStoryLength: book.magic_story?.length || 0
        })
      } else {
        logger.error('❌ STEP 2: STORY GENERATION - Failed to re-fetch updated book', bookError?.message)
        throw new Error(`Failed to re-fetch book: ${bookError?.message}`)
      }
    } else {
      logger.step('📝 STEP 2: STORY GENERATION - Skipped (not needed)')
      logger.step('📊 Existing story details', {
        magicStoryLength: book.magic_story?.length || 0
      })
    }

    // ========================================
    // STEP 3: BACKGROUND GENERATION (if needed)
    // ========================================
    logger.step('🎨 STEP 3: BACKGROUND GENERATION - Starting background generation check')
    logger.step('📊 Background check details', {
      bookStatus: book.status,
      backgroundType: book.background_type,
      hasBackgroundUrl: !!book.background_url
    })
    
    // Check if the book has background ready
    if (book.status !== 'background_ready' && book.status !== 'ready' && book.status !== 'draft') {
      logger.error('❌ STEP 3: BACKGROUND GENERATION - Book not ready for PDF generation', `Status: ${book.status}`)
      throw createError({
        statusCode: 400,
        statusMessage: 'Memory book background is not ready'
      })
    }

    // If pdf_url exists, return it directly (fast download)
    if (book.pdf_url && book.pdf_url.startsWith('https://')) {
      logger.success('🎨 STEP 3: BACKGROUND GENERATION - PDF URL available for download')
      return {
        success: true,
        downloadUrl: book.pdf_url
      }
    }

    logger.step('🎨 STEP 3: BACKGROUND GENERATION - PDF URL not found, generating new PDF')
    
    // Update status
    await updatePdfStatus(supabase, book.id, user.id, 'Retrieving your memories...')
    
    // ========================================
    // STEP 4: FETCH ASSETS FOR PROCESSING
    // ========================================
    logger.step('📸 ASSET FETCHING - Fetching approved assets for processing')
    logger.step('📊 Asset fetching details', {
      createdFromAssets: book.created_from_assets,
      createdFromAssetsLength: book.created_from_assets?.length || 0
    })
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('*')
      .in('id', book.created_from_assets || [])
      .eq('approved', true)
      .eq('deleted', false)

    if (assetsError) {
      logger.error('❌ STEP 4: ASSET FETCHING - Error fetching assets', assetsError.message)
      throw new Error(`Failed to fetch assets: ${assetsError.message}`)
    }

    if (!assets || assets.length === 0) {
      logger.error('❌ STEP 4: ASSET FETCHING - No approved assets found for this book')
      throw new Error('No approved assets found for this book')
    }

    logger.success(`📸 STEP 4: ASSET FETCHING - ✅ COMPLETED - Found ${assets.length} approved assets`)

    // Generate fingerprints for assets to help AI avoid duplicates
    const assetsWithFingerprints = generateFingerprintsForAssets(assets)
    logger.step(`Generated fingerprints for ${assetsWithFingerprints.length} assets`)

    // ========================================
    // STEP 5: BACKGROUND IMAGE PROCESSING
    // ========================================
    logger.step('🎨 BACKGROUND PROCESSING - Loading background image')

    let backgroundBuffer
    
    logger.step('🎨 BACKGROUND PROCESSING - Background type details', {
      backgroundType: book.background_type,
      hasBackgroundUrl: !!book.background_url
    })
    
    if (book.background_type === 'solid') {
      // Handle solid color background
      logger.step('🎨 BACKGROUND PROCESSING - Using solid color background')
      await updatePdfStatus(supabase, book.id, user.id, 'Applying solid color background...')
      backgroundBuffer = null
    } else if (book.background_type === 'magical') {
      // Generate background for magical background type
      logger.step('🎨 BACKGROUND PROCESSING - Generating magical background')
      await updatePdfStatus(supabase, book.id, user.id, 'Retrieving background image...')
      await updatePdfStatus(supabase, book.id, user.id, 'Creating magical background...')
      
      try {
        logger.step('🎨 BACKGROUND PROCESSING - Calling background generation API')
        logger.step('📡 Background API call details', {
          endpoint: `/api/memory-books/generate-background/${book.id}`,
          method: 'POST'
        })
        
        const bgGenRes = await fetch(`${config.public.siteUrl}/api/memory-books/generate-background/${book.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!bgGenRes.ok) {
          logger.error('❌ BACKGROUND PROCESSING - Background generation failed', `Status: ${bgGenRes.status}`)
          throw new Error(`Background generation failed: ${bgGenRes.status}`)
        }
        
        const bgGenData = await bgGenRes.json()
        logger.step('🎨 BACKGROUND PROCESSING - Background generation API response received')
        logger.step('📡 Background API response details', {
          status: bgGenRes.status,
          hasBackgroundUrl: !!bgGenData.backgroundUrl,
          backgroundUrl: bgGenData.backgroundUrl || null
        })
        logger.success('🎨 BACKGROUND PROCESSING - Background generated successfully')
        
        // Download the newly generated background
        logger.step('🎨 BACKGROUND PROCESSING - Downloading generated background')
        logger.step('📡 Background download details', {
          backgroundUrl: bgGenData.backgroundUrl
        })
        
        const bgRes = await fetch(bgGenData.backgroundUrl)
        if (!bgRes.ok) {
          logger.error('❌ BACKGROUND PROCESSING - Failed to fetch generated background', `Status: ${bgRes.status}`)
          throw new Error(`Failed to fetch generated background: ${bgRes.status}`)
        }
        backgroundBuffer = Buffer.from(await bgRes.arrayBuffer())
        logger.success(`🎨 BACKGROUND PROCESSING - Generated background downloaded (${backgroundBuffer.length} bytes)`)
        
        // Update the book with the new background URL
        logger.step('🎨 BACKGROUND PROCESSING - Updating book with new background URL')
        
        const { error: updateError } = await supabase
          .from('memory_books')
          .update({ background_url: bgGenData.backgroundUrl })
          .eq('id', book.id)
        
        if (updateError) {
          logger.warning('⚠️ STEP 5: BACKGROUND PROCESSING - Failed to update book with background URL', updateError.message)
        } else {
          logger.step('🎨 BACKGROUND PROCESSING - Book updated with new background URL')
        }
      } catch (bgError) {
        logger.error('❌ STEP 5: BACKGROUND PROCESSING - Background generation error', bgError.message)
        logger.warning('⚠️ STEP 5: BACKGROUND PROCESSING - Proceeding with white background due to generation failure')
        backgroundBuffer = null
      }
    } else if (book.background_url && book.background_type !== 'solid') {
      // Download existing background from storage
      logger.step('🎨 BACKGROUND PROCESSING - Downloading existing background')
      logger.step('📡 Existing background details', {
        backgroundUrl: book.background_url,
        backgroundType: book.background_type
      })
      
      await updatePdfStatus(supabase, book.id, user.id, 'Retrieving background image...')
      const bgRes = await fetch(book.background_url)
      if (!bgRes.ok) {
        logger.error('❌ STEP 5: BACKGROUND PROCESSING - Failed to fetch background', `Status: ${bgRes.status}`)
        throw new Error(`Failed to fetch background: ${bgRes.status}`)
      }
      backgroundBuffer = Buffer.from(await bgRes.arrayBuffer())
      logger.success(`🎨 STEP 5: BACKGROUND PROCESSING - Background downloaded (${backgroundBuffer.length} bytes)`)
    } else {
      logger.step('🎨 BACKGROUND PROCESSING - Using white background (no background image)')
      backgroundBuffer = null
    }
    
    logger.success('🎨 STEP 5: BACKGROUND PROCESSING - ✅ COMPLETED')
    
    // ========================================
    // STEP 6: PDF CREATION AND LAYOUT
    // ========================================
    logger.step('📄 PDF CREATION - Creating PDF document')
    await updatePdfStatus(supabase, book.id, user.id, '📄 Creating PDF...')
    
    const pdfDoc = await PDFDocument.create()
    let pdfBgImage = null
    if (backgroundBuffer) {
      logger.step('📄 PDF CREATION - Embedding background image')
      pdfBgImage = await pdfDoc.embedPng(backgroundBuffer)
      logger.success('📄 STEP 6: PDF CREATION - PDF document created with background image')
    } else {
      logger.success('📄 STEP 6: PDF CREATION - PDF document created with blank background')
    }
    
    // Helper function to process image orientation
    async function processImageOrientation(imageBuffer, format) {
      try {
        console.log(`🔄 Processing image orientation for ${format} image...`)
        const processedImage = await sharp(imageBuffer)
          .rotate() // Auto-rotate based on EXIF orientation
          .withMetadata() // Preserve EXIF data including GPS coordinates
          .toFormat(format === 'png' ? 'png' : 'jpeg')
          .toBuffer()
        console.log(`✅ Image orientation processed successfully with EXIF preserved`)
        return processedImage
      } catch (error) {
        console.warn(`⚠️ Failed to process image orientation, using original:`, error.message)
        return imageBuffer // Fallback to original if processing fails
      }
    }

    // Helper function to check if caption should be used (not blank, not filename)
    function isValidCaption(caption) {
      if (!caption || caption.trim() === '') return false
      const lowerCaption = caption.toLowerCase()
      return !lowerCaption.includes('.jpg') && !lowerCaption.includes('.png') && !lowerCaption.includes('.jpeg')
    }

    // Helper function to check if a point is inside a rounded rectangle
    function isInsideRoundedRect(x, y, width, height, radius) {
      // Check if point is in the main rectangle area (excluding corners)
      if (x >= radius && x <= width - radius && y >= 0 && y <= height) return true
      if (x >= 0 && x <= width && y >= radius && y <= height - radius) return true
      
      // Check if point is in the corner circles
      const corners = [
        { cx: radius, cy: radius }, // top-left
        { cx: width - radius, cy: radius }, // top-right
        { cx: radius, cy: height - radius }, // bottom-left
        { cx: width - radius, cy: height - radius } // bottom-right
      ]
      
      for (const corner of corners) {
        const distance = Math.sqrt((x - corner.cx) ** 2 + (y - corner.cy) ** 2)
        if (distance <= radius) return true
      }
      
      return false
    }

    // Helper function to perform smart cropping
    async function smartCropImage(imageBuffer, targetWidth, targetHeight, storageUrl = null, photoIndex = null, totalPhotos = null, assetId = null, userId = null) {
      try {
        vlog('🧠 Performing OpenAI person detection crop...')
        if (photoIndex !== null && totalPhotos !== null) {
          await updatePdfStatus(supabase, book.id, user.id, `👥 Cropping photo ${photoIndex + 1} of ${totalPhotos}...`)
        }
        vlog(`📏 Target dimensions: ${targetWidth}x${targetHeight}`)
        
        // Get image metadata to determine orientation
        const metadata = await sharp(imageBuffer).metadata()
        const isPortrait = metadata.height > metadata.width
        const isLandscape = metadata.width > metadata.height
        
        // Handle EXIF orientation to prevent automatic rotation
        let processedImageBuffer = imageBuffer
        if (metadata.orientation && metadata.orientation !== 1) {
          vlog(`🔄 Correcting EXIF orientation: ${metadata.orientation}`)
          // Create a new Sharp instance that will handle the orientation
          const sharpInstance = sharp(imageBuffer)
          
          // Apply the correct rotation based on EXIF orientation
          switch (metadata.orientation) {
            case 3: // 180 degrees
              processedImageBuffer = await sharpInstance.rotate(180).withMetadata().toBuffer()
              break
            case 6: // 90 degrees clockwise
              processedImageBuffer = await sharpInstance.rotate(90).withMetadata().toBuffer()
              break
            case 8: // 90 degrees counter-clockwise
              processedImageBuffer = await sharpInstance.rotate(-90).withMetadata().toBuffer()
              break
            default:
              // For other orientations, let Sharp handle it
              processedImageBuffer = await sharpInstance.withMetadata().toBuffer()
          }
          
          // Get updated metadata after rotation
          const updatedMetadata = await sharp(processedImageBuffer).metadata()
          vlog(`📐 Updated dimensions after orientation correction: ${updatedMetadata.width}x${updatedMetadata.height}`)
        }
        
        vlog(`📐 Image orientation: ${isPortrait ? 'Portrait' : isLandscape ? 'Landscape' : 'Square'}`)
        vlog(`📏 Original dimensions: ${metadata.width}x${metadata.height}`)
        
        // Use the processed image buffer for all operations
        const workingImageBuffer = processedImageBuffer || imageBuffer
        const workingMetadata = await sharp(workingImageBuffer).metadata()
        
        let faces = []
        let cropArea = null
        
        vlog('👥 Using smartcrop-gm as primary cropping method')
        
        try {
          // Use smartcrop-gm for intelligent cropping with AWS Rekognition face detection
          vlog('🎯 Using smartcrop-gm with AWS Rekognition face detection')
          
          // Create a temporary file for GraphicsMagick to work with
          const tempInputPath = `/tmp/smartcrop-input-${Date.now()}.jpg`
          const tempOutputPath = `/tmp/smartcrop-output-${Date.now()}.jpg`
          
          // Write the processed image buffer (with orientation correction) to a temporary file
          await sharp(processedImageBuffer || imageBuffer)
            .jpeg({ quality: 100 })
            .toFile(tempInputPath)
          
          // Get the dimensions of the processed image for logging
          const processedMetadata = await sharp(processedImageBuffer || imageBuffer).metadata()
          vlog('🔍 Smartcrop-gm input:', { width: processedMetadata.width, height: processedMetadata.height, tempPath: tempInputPath })
          
          // Detect faces using AWS Rekognition if we have a storage URL
          let faceBoosts = []
          if (storageUrl) {
            try {
              vlog('🔍 AWS Rekognition: Detecting faces for smartcrop-gm boost...')
              
              const rekognitionResponse = await fetch(`${config.public.siteUrl}/api/ai/detect-faces-rekognition`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                  imageUrl: storageUrl,
                  assetId: assetId, // Pass asset ID for caching
                  userId: userId, // Pass user ID directly to avoid auth issues
                  forceRefresh: false // Use cache if available
                })
              })
              
              if (rekognitionResponse.ok) {
                const rekognitionData = await rekognitionResponse.json()
                
                if (rekognitionData.success && rekognitionData.faces && rekognitionData.faces.length > 0) {
                  console.log(`✅ AWS Rekognition: Found ${rekognitionData.faces.length} faces`)
                  
                  // Convert Rekognition bounding boxes to smartcrop-gm boost format with padding
                  faceBoosts = rekognitionData.faces.map(face => {
                    // Add padding around the face bounding box to prevent cutting off heads
                    const paddingFactor = 0.3 // 30% padding around the face
                    
                    // Calculate padded bounding box
                    const paddedLeft = Math.max(0, face.box.Left - (face.box.Width * paddingFactor))
                    const paddedTop = Math.max(0, face.box.Top - (face.box.Height * paddingFactor))
                    const paddedWidth = Math.min(1 - paddedLeft, face.box.Width + (face.box.Width * paddingFactor * 2))
                    const paddedHeight = Math.min(1 - paddedTop, face.box.Height + (face.box.Height * paddingFactor * 2))
                    
                    // Convert from [0,1] relative coordinates to pixel coordinates
                    const pixelX = Math.floor(paddedLeft * processedMetadata.width)
                    const pixelY = Math.floor(paddedTop * processedMetadata.height)
                    const pixelWidth = Math.floor(paddedWidth * processedMetadata.width)
                    const pixelHeight = Math.floor(paddedHeight * processedMetadata.height)
                    
                    // Convert back to smartcrop-gm's expected [0,1] format
                    const boostX = pixelX / processedMetadata.width
                    const boostY = pixelY / processedMetadata.height
                    const boostWidth = pixelWidth / processedMetadata.width
                    const boostHeight = pixelHeight / processedMetadata.height
                    
                    console.log(`🎯 Face boost with padding: original=(${face.box.Left.toFixed(3)}, ${face.box.Top.toFixed(3)}, ${face.box.Width.toFixed(3)}, ${face.box.Height.toFixed(3)}) padded=(${boostX.toFixed(3)}, ${boostY.toFixed(3)}, ${boostWidth.toFixed(3)}, ${boostHeight.toFixed(3)}) paddingFactor=${paddingFactor}`)
                    
                    return {
                      x: boostX,
                      y: boostY,
                      width: boostWidth,
                      height: boostHeight,
                      weight: 1.0 // Maximum weight for faces - prioritize faces over everything else
                    }
                  })
                  
                  console.log('🎯 Face boosts for smartcrop-gm:', faceBoosts)
                } else {
                  console.log('👥 AWS Rekognition: No faces detected')
                }
              } else {
                console.log('⚠️ AWS Rekognition failed, proceeding without face detection')
              }
                      } catch (rekognitionError) {
            console.log('⚠️ AWS Rekognition error, proceeding without face detection:', rekognitionError.message)
            // Continue with smartcrop-gm without face boosts
          }
          }
          
          // Use smartcrop-gm with face boosts if available
          const smartcropOptions = { 
            width: targetWidth, 
            height: targetHeight 
          }
          
          // Add face boosts if we have them
          if (faceBoosts.length > 0) {
            smartcropOptions.boost = faceBoosts
            console.log('🎯 Using smartcrop-gm with face boosts')
          } else {
            console.log('🎯 Using smartcrop-gm without face boosts')
          }
          
          const result = await smartcropGm.crop(tempInputPath, smartcropOptions)
          
          console.log('🔍 Smartcrop-gm result:', result)
          console.log('🎯 Smartcrop-gm used face boosts:', faceBoosts.length > 0 ? 'Yes' : 'No')
          
          if (result && result.topCrop) {
            // Use smartcrop-gm's intelligent cropping result
            const { x, y, width: w, height: h } = result.topCrop
            
            console.log('🔍 Smartcrop-gm intelligent crop result:', { x, y, width: w, height: h })
            
            // smartcrop-gm returns coordinates relative to the original image
            // Use them directly for intelligent cropping
            let smartcropArea = {
              x: Math.max(0, Math.floor(x)),
              y: Math.max(0, Math.floor(y)),
              width: Math.max(1, Math.floor(w)),
              height: Math.max(1, Math.floor(h))
            }
            
            console.log('🎯 Smartcrop-gm intelligent crop area:', smartcropArea)
            
            // Apply face-preserving adjustments to smartcrop-gm result
            // Enhanced face preservation when we have face detection data
            if (faceBoosts.length > 0) {
              console.log('🔄 Face detection available - applying enhanced face-preserving adjustments')
              
              // Find the highest face (lowest Y coordinate) to ensure we don't cut off any faces
              const highestFace = faceBoosts.reduce((highest, face) => 
                face.y < highest.y ? face : highest
              )
              
              // Calculate the pixel position of the highest face
              const highestFacePixelY = Math.floor(highestFace.y * processedMetadata.height)
              const faceHeight = Math.floor(highestFace.height * processedMetadata.height)
              
              // Check if all faces are in the top half of the image
              const imageMidpoint = processedMetadata.height / 2
              const allFacesInTopHalf = faceBoosts.every(face => {
                const faceCenterY = face.y + (face.height / 2)
                const faceCenterPixelY = Math.floor(faceCenterY * processedMetadata.height)
                return faceCenterPixelY < imageMidpoint
              })
              
              console.log(`🔄 Face position analysis: Image midpoint=${imageMidpoint}px, all faces in top half=${allFacesInTopHalf}`)
              
              // CRITICAL: Prioritize keeping tops of heads - be extremely conservative
              // Always prefer keeping the top of faces over the bottom
              let topBuffer = Math.max(faceHeight * 0.5, 100) // 50% of face height or 100px, whichever is larger
              
              // If all faces are in the top half, increase top padding significantly
              if (allFacesInTopHalf) {
                topBuffer = Math.max(topBuffer * 1.5, 150) // Increase buffer by 50% or minimum 150px
                console.log(`🔄 All faces in top half detected - increasing top buffer from ${Math.max(faceHeight * 0.5, 100)} to ${topBuffer}px`)
              }
              
              const maxAllowedY = Math.max(0, highestFacePixelY - topBuffer)
              
              console.log(`🔄 Face analysis: Highest face at Y=${highestFacePixelY}px, face height=${faceHeight}px, top buffer=${topBuffer}px, max allowed Y=${maxAllowedY}px`)
              
              if (smartcropArea.y > maxAllowedY) {
                const originalY = smartcropArea.y
                smartcropArea.y = Math.floor(Math.max(0, maxAllowedY))
                console.log(`🔄 Face-preserving adjustment: Y position changed from ${originalY} to ${smartcropArea.y} to preserve faces`)
              } else {
                console.log(`🔄 Face-preserving adjustment: Y position ${smartcropArea.y} is acceptable (below max allowed ${maxAllowedY})`)
              }
              
                            // Create a bounding box around ALL faces - always use full face area
              // CRITICAL: Never split faces - always preserve the complete face area
              const faceBoundingBox = {
                left: Math.min(...faceBoosts.map(face => face.x)),
                top: Math.min(...faceBoosts.map(face => face.y)),           // Always use top of highest face
                right: Math.max(...faceBoosts.map(face => face.x + face.width)),
                bottom: Math.max(...faceBoosts.map(face => face.y + face.height))  // Always use bottom of lowest face
              }
              
              console.log(`🔄 Complete face bounding: preserving all ${faceBoosts.length} faces`)
              
              // Convert to pixel coordinates
              const faceBoxPixels = {
                left: Math.floor(faceBoundingBox.left * processedMetadata.width),
                top: Math.floor(faceBoundingBox.top * processedMetadata.height),
                right: Math.floor(faceBoundingBox.right * processedMetadata.width),
                bottom: Math.floor(faceBoundingBox.bottom * processedMetadata.height)
              }
              
              console.log(`🔄 Face bounding box: ${faceBoxPixels.left},${faceBoxPixels.top} to ${faceBoxPixels.right},${faceBoxPixels.bottom}`)
              
              // Calculate the maximum possible crop for this aspect ratio
              const targetAspectRatio = targetWidth / targetHeight
              
                          // Check if aspect ratios are very different - if so, use conservative cropping
            const imageAspectRatio = processedMetadata.width / processedMetadata.height
            const aspectRatioDifference = Math.abs(imageAspectRatio - targetAspectRatio) / Math.max(imageAspectRatio, targetAspectRatio)
            
            console.log(`🔍 Aspect ratio analysis: image=${imageAspectRatio.toFixed(3)}, target=${targetAspectRatio.toFixed(3)}, difference=${(aspectRatioDifference * 100).toFixed(1)}%`)
            
            let maxCropWidth, maxCropHeight
            
            if (aspectRatioDifference > 0.3) {
              // Aspect ratios are very different (>30% difference) - use conservative cropping
              // Prioritize preserving the entire image over perfect aspect ratio matching
              console.log(`🔄 Large aspect ratio difference detected - using conservative cropping`)
              
              if (imageAspectRatio > targetAspectRatio) {
                // Image is wider than target - crop width conservatively
                maxCropHeight = processedMetadata.height
                maxCropWidth = Math.min(processedMetadata.width, maxCropHeight * targetAspectRatio * 1.2) // 20% more lenient
              } else {
                // Image is taller than target - crop height conservatively  
                maxCropWidth = processedMetadata.width
                maxCropHeight = Math.min(processedMetadata.height, maxCropWidth / targetAspectRatio * 1.2) // 20% more lenient
              }
            } else {
              // Aspect ratios are similar - use standard cropping
              console.log(`🔄 Similar aspect ratios - using standard cropping`)
              if (imageAspectRatio > targetAspectRatio) {
                // Image is wider than target - use full height
                maxCropHeight = processedMetadata.height
                maxCropWidth = maxCropHeight * targetAspectRatio
              } else {
                // Image is taller than target - use full width
                maxCropWidth = processedMetadata.width
                maxCropHeight = maxCropWidth / targetAspectRatio
              }
            }
              
              // Ensure the maximum crop includes all faces
              // Calculate the minimum crop area needed to include all faces
              const faceCenterX = (faceBoxPixels.left + faceBoxPixels.right) / 2
              const faceCenterY = (faceBoxPixels.top + faceBoxPixels.bottom) / 2
              
              // Start with a centered crop
              let cropX = Math.max(0, Math.floor((processedMetadata.width - maxCropWidth) / 2))
              let cropY = Math.max(0, Math.floor((processedMetadata.height - maxCropHeight) / 2))
              
              // Adjust crop position to ensure faces are included
              const cropRight = cropX + maxCropWidth
              const cropBottom = cropY + maxCropHeight
              
              // If faces are outside the crop, adjust position to include them
              if (faceBoxPixels.left < cropX || faceBoxPixels.right > cropRight || 
                  faceBoxPixels.top < cropY || faceBoxPixels.bottom > cropBottom) {
                
                console.log(`🔄 Adjusting crop to include all faces`)
                
                // Calculate the minimum crop area needed to include all faces
                const minCropWidth = faceBoxPixels.right - faceBoxPixels.left
                const minCropHeight = faceBoxPixels.bottom - faceBoxPixels.top
                
                // If the minimum crop is larger than our target, use the minimum crop
                if (minCropWidth > maxCropWidth || minCropHeight > maxCropHeight) {
                  console.log(`🔄 Faces require larger crop than target - using minimum crop size`)
                  maxCropWidth = Math.max(minCropWidth, targetWidth)
                  maxCropHeight = Math.max(minCropHeight, targetHeight)
                  
                  // Maintain aspect ratio
                  if (maxCropWidth / maxCropHeight > targetAspectRatio) {
                    maxCropHeight = maxCropWidth / targetAspectRatio
                  } else {
                    maxCropWidth = maxCropHeight * targetAspectRatio
                  }
                }
                
                // Position crop to ensure NO faces are cut off - PRIORITIZE TOPS OF HEADS
                // Calculate the minimum crop area that includes ALL faces with proper buffers
                const faceTopWithBuffer = Math.max(0, faceBoxPixels.top - topBuffer)
                const faceBottomWithBuffer = Math.min(processedMetadata.height, faceBoxPixels.bottom + Math.min(topBuffer, 50))
                const faceLeftWithBuffer = Math.max(0, faceBoxPixels.left - Math.min(topBuffer, 50))
                const faceRightWithBuffer = Math.min(processedMetadata.width, faceBoxPixels.right + Math.min(topBuffer, 50))
                
                // CRITICAL: Always start with the face-safe top position - NEVER compromise
                cropY = faceTopWithBuffer
                cropX = Math.max(0, Math.min(processedMetadata.width - maxCropWidth, faceLeftWithBuffer))
                
                console.log(`🔄 FACE-SAFE PRIORITY: Starting with cropY=${cropY} (faceTopWithBuffer=${faceTopWithBuffer})`)
                console.log(`🔄 FACE-SAFE PRIORITY: Face pixels top=${faceBoxPixels.top}, buffer=${topBuffer}`)
                
                // If the crop would cut off faces on the right, adjust position
                if (cropX + maxCropWidth < faceRightWithBuffer) {
                  cropX = Math.max(0, faceRightWithBuffer - maxCropWidth)
                  console.log(`🔄 Adjusted cropX to ${cropX} to include right faces`)
                }
                
                // ABSOLUTELY NO ADJUSTMENTS TO cropY - tops of heads are sacred!
                
                console.log(`🔄 Face-safe positioning: faces at ${faceBoxPixels.left},${faceBoxPixels.top} to ${faceBoxPixels.right},${faceBoxPixels.bottom}`)
                console.log(`🔄 Face-safe positioning: with buffer ${faceLeftWithBuffer},${faceTopWithBuffer} to ${faceRightWithBuffer},${faceBottomWithBuffer}`)
                console.log(`🔄 Final face-safe crop: ${cropX},${cropY} (${maxCropWidth}x${maxCropHeight})`)
              }
              
              // Final safety check: ensure no faces are cut off
              const finalCropRight = cropX + maxCropWidth
              const finalCropBottom = cropY + maxCropHeight
              
              // Verify all faces are within the final crop area
              const allFacesIncluded = faceBoosts.every(face => {
                const faceLeft = face.x * processedMetadata.width
                const faceTop = face.y * processedMetadata.height
                const faceRight = (face.x + face.width) * processedMetadata.width
                const faceBottom = (face.y + face.height) * processedMetadata.height
                
                return faceLeft >= cropX && faceRight <= finalCropRight && 
                       faceTop >= cropY && faceBottom <= finalCropBottom
              })
              
              if (!allFacesIncluded) {
                console.log('⚠️ WARNING: Some faces may still be cut off after crop adjustment')
              } else {
                console.log('✅ All faces confirmed to be within crop area')
              }
              
              // Check if we need to extend beyond image boundaries to preserve faces
              const needsExtension = {
                top: cropY < 0,
                bottom: (cropY + maxCropHeight) > processedMetadata.height,
                left: cropX < 0, 
                right: (cropX + maxCropWidth) > processedMetadata.width
              }
              
              if (needsExtension.top || needsExtension.bottom || needsExtension.left || needsExtension.right) {
                console.log(`🔄 Image extension needed:`, needsExtension)
                
                // Calculate the final image dimensions and offsets
                const finalWidth = Math.floor(maxCropWidth)
                const finalHeight = Math.floor(maxCropHeight)
                const sourceX = Math.max(0, Math.floor(cropX))
                const sourceY = Math.max(0, Math.floor(cropY))
                const sourceWidth = Math.min(processedMetadata.width - sourceX, finalWidth)
                const sourceHeight = Math.min(processedMetadata.height - sourceY, finalHeight)
                
                // Calculate where to place the source image in the final canvas
                const destX = Math.max(0, -Math.floor(cropX))
                const destY = Math.max(0, -Math.floor(cropY))
                
                console.log(`🔄 Extension details: source(${sourceX},${sourceY},${sourceWidth}x${sourceHeight}) -> dest(${destX},${destY}) in ${finalWidth}x${finalHeight} canvas`)
                
                // Store extension info for later processing
                smartcropArea = {
                  x: sourceX,
                  y: sourceY,
                  width: sourceWidth,
                  height: sourceHeight,
                  needsExtension: true,
                  finalWidth: finalWidth,
                  finalHeight: finalHeight,
                  destX: destX,
                  destY: destY
                }
              } else {
                // Normal crop without extension
                smartcropArea = {
                  x: Math.floor(cropX),
                  y: Math.floor(cropY),
                  width: Math.floor(maxCropWidth),
                  height: Math.floor(maxCropHeight),
                  needsExtension: false
                }
              }
              
              console.log(`🔄 Maximized crop area: ${smartcropArea.width}x${smartcropArea.height} at (${smartcropArea.x}, ${smartcropArea.y}) - using ${((smartcropArea.width * smartcropArea.height) / (processedMetadata.width * processedMetadata.height) * 100).toFixed(1)}% of original image`)
            } else {
              // No face detection - maximize the use of original photo while respecting aspect ratio
              console.log('🔄 No face detection - maximizing use of original photo')
              
              const targetAspectRatio = targetWidth / targetHeight
              
              // Calculate the maximum possible crop for this aspect ratio
              let maxCropWidth, maxCropHeight
              if (processedMetadata.width / processedMetadata.height > targetAspectRatio) {
                // Image is wider than target - use full height
                maxCropHeight = processedMetadata.height
                maxCropWidth = maxCropHeight * targetAspectRatio
              } else {
                // Image is taller than target - use full width
                maxCropWidth = processedMetadata.width
                maxCropHeight = maxCropWidth / targetAspectRatio
              }
              
              // Center the maximum crop
              const maxCropX = Math.max(0, Math.floor((processedMetadata.width - maxCropWidth) / 2))
              const maxCropY = Math.max(0, Math.floor((processedMetadata.height - maxCropHeight) / 2))
              
              // Use the maximum possible crop
              smartcropArea = {
                x: maxCropX,
                y: maxCropY,
                width: Math.floor(maxCropWidth),
                height: Math.floor(maxCropHeight)
              }
              
              console.log(`🔄 Maximized crop area (no faces): ${smartcropArea.width}x${smartcropArea.height} at (${smartcropArea.x}, ${smartcropArea.y}) - using ${((smartcropArea.width * smartcropArea.height) / (processedMetadata.width * processedMetadata.height) * 100).toFixed(1)}% of original image`)
            }
            
            // For small square crops (like the problematic 227x227), be extra careful
            if (targetWidth === targetHeight && targetWidth <= 250) {
              console.log('🔄 Small square crop detected - applying face-preserving adjustments')
              
              if (faceBoosts.length > 0) {
                // With face detection, be very conservative for small squares
                // Reuse the highestFace from the main face detection block
                const smallSquareHighestFace = faceBoosts.reduce((highest, face) => 
                  face.y < highest.y ? face : highest
                )
                const smallSquareHighestFacePixelY = Math.floor(smallSquareHighestFace.y * processedMetadata.height)
                
                // For small squares, ensure we start well above the highest face - be extra conservative
                const safeTopMargin = Math.max(processedMetadata.height * 0.15, 150) // At least 15% of image height or 150px
                const smallSquareMaxAllowedY = Math.max(0, smallSquareHighestFacePixelY - safeTopMargin)
                
                if (smartcropArea.y > smallSquareMaxAllowedY) {
                  const originalY = smartcropArea.y
                  smartcropArea.y = Math.floor(Math.max(0, smallSquareMaxAllowedY))
                  console.log(`🔄 Small square face-preserving adjustment: Y position changed from ${originalY} to ${smartcropArea.y}`)
                }
              } else if (isPortrait && smartcropArea.y > processedMetadata.height * 0.25) {
                smartcropArea.y = 0
                console.log('🔄 Small square crop: Moving to top of image to preserve faces')
              }
            }
            

            
            cropArea = smartcropArea
            
            // Clean up temporary files
            try {
              await sharp(tempInputPath).metadata() // Check if file exists
              await sharp(tempInputPath).toFile('/dev/null') // Delete by overwriting
            } catch (e) {
              // File might already be deleted
            }
          } else {
            throw new Error('Smartcrop-gm failed to return valid crop area')
          }
        } catch (smartcropError) {
          console.warn('⚠️ Smartcrop-gm failed, using orientation-based fallback:', smartcropError.message)
          
          // Use orientation-based cropping with maximized area
          const targetAspectRatio = targetWidth / targetHeight
          
          if (isLandscape) {
            // For landscape, use the largest possible area that fits the target aspect ratio
            // Start with the full width and calculate height
            let cropWidth = metadata.width
            let cropHeight = cropWidth / targetAspectRatio
            
            // If height exceeds image bounds, reduce width
            if (cropHeight > metadata.height) {
              cropHeight = metadata.height
              cropWidth = cropHeight * targetAspectRatio
            }
            
            // Center the crop both horizontally and vertically to use maximum area
            const centerX = Math.floor((metadata.width - cropWidth) / 2)
            const centerY = Math.floor((metadata.height - cropHeight) / 2)
            
            cropArea = {
              x: Math.max(0, centerX),
              y: Math.max(0, centerY),
              width: Math.floor(cropWidth),
              height: Math.floor(cropHeight)
            }
          } else if (isPortrait) {
            // For portrait, use the largest possible area that fits the target aspect ratio
            // Start with the full height and calculate width
            let cropHeight = metadata.height
            let cropWidth = cropHeight * targetAspectRatio
            
            // If width exceeds image bounds, reduce height
            if (cropWidth > metadata.width) {
              cropWidth = metadata.width
              cropHeight = cropWidth / targetAspectRatio
            }
            
            // Center the crop both horizontally and vertically to use maximum area
            const centerX = Math.floor((metadata.width - cropWidth) / 2)
            const centerY = Math.floor((metadata.height - cropHeight) / 2)
            
            cropArea = {
              x: Math.max(0, centerX),
              y: Math.max(0, centerY),
              width: Math.floor(cropWidth),
              height: Math.floor(cropHeight)
            }
          } else {
            // For square, use the largest possible square that fits
            const maxSize = Math.min(metadata.width, metadata.height)
            const centerX = Math.floor((metadata.width - maxSize) / 2)
            const centerY = Math.floor((metadata.height - maxSize) / 2)
            
            cropArea = {
              x: centerX,
              y: centerY,
              width: maxSize,
              height: maxSize
            }
          }
          
          // Ensure all values are positive integers (handle any remaining decimals)
          cropArea.x = Math.max(0, Math.floor(cropArea.x))
          cropArea.y = Math.max(0, Math.floor(cropArea.y))
          cropArea.width = Math.max(1, Math.floor(cropArea.width))
          cropArea.height = Math.max(1, Math.floor(cropArea.height))
          
          console.log('🎯 Orientation-based fallback crop area (maximized):', cropArea)
        }
        
        // Final safety check - ensure cropArea is defined
        if (!cropArea) {
          console.warn('⚠️ No crop area defined, using center crop fallback')
          cropArea = {
            x: 0,
            y: 0,
            width: metadata.width,
            height: metadata.height
          }
        }
        
        // Apply the crop with optional black fill extension
        let croppedImage
        
        if (cropArea.needsExtension) {
          console.log(`🔄 Applying crop with black fill extension`)
          
          // First extract the available portion of the image
          const extractedBuffer = await sharp(workingImageBuffer)
            .extract({
              left: cropArea.x,
              top: cropArea.y,
              width: cropArea.width,
              height: cropArea.height
            })
            .toBuffer()
          
          // Create a black canvas of the target size
          croppedImage = sharp({
            create: {
              width: cropArea.finalWidth,
              height: cropArea.finalHeight,
              channels: 3,
              background: { r: 0, g: 0, b: 0 }
            }
          })
          .composite([{
            input: extractedBuffer,
            left: cropArea.destX,
            top: cropArea.destY
          }])
          
          console.log(`🔄 Black fill extension applied: ${cropArea.width}x${cropArea.height} image placed at (${cropArea.destX},${cropArea.destY}) on ${cropArea.finalWidth}x${cropArea.finalHeight} black canvas`)
        } else {
          // Normal crop without extension
          croppedImage = sharp(workingImageBuffer)
            .extract({
              left: cropArea.x,
              top: cropArea.y,
              width: cropArea.width,
              height: cropArea.height
            })
        }
        
        // Apply resize and preserve metadata
        croppedImage = croppedImage
          .resize(targetWidth, targetHeight, { 
            fit: 'cover',
            kernel: 'mitchell'
          })
          .withMetadata() // Preserve original orientation
          .jpeg({ quality: 100, progressive: true, mozjpeg: true })
          .toBuffer()
        
        console.log('✅ OpenAI person detection crop completed successfully')
        return croppedImage
      } catch (error) {
        console.warn('⚠️ OpenAI face detection crop failed, using fallback:', error.message)
        // Fallback to regular resize using original imageBuffer
        return await sharp(imageBuffer)
          .resize(targetWidth, targetHeight, { 
            fit: 'cover',
            kernel: 'mitchell'
          })
          .withMetadata() // Preserve original orientation
          .jpeg({ quality: 100, progressive: true, mozjpeg: true })
          .toBuffer()
      }
    }

    // Helper function to process image shape with AI analysis
    async function processImageShape(imageBuffer, shape, targetWidth, targetHeight, imageUrl) {
      try {
        console.log(`🔄 Processing image shape: ${shape}`)
        console.log(`📏 Target dimensions: ${targetWidth}x${targetHeight}`)
        console.log(`🎯 Shape type: ${shape}`)
        console.log(`🔍 Debug: imageUrl in processImageShape:`, imageUrl)
        let processedImage
        
        // Get AI analysis for shape recommendation and intelligent cropping
        let aiAnalysis = null
        let recommendedShape = shape // Default to using the requested shape
        
        // If shape is 'magic', we'll use AI to determine the best shape
        if (shape === 'magic' && imageUrl) {
          try {
            console.log('🤖 Getting AI analysis for magic shape detection...')
            const analysisRes = await fetch(`${config.public.siteUrl}/api/ai/analyze-photo`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                imageUrl: imageUrl,
                targetShape: 'magic', // This will trigger the comprehensive shape analysis
                targetWidth: targetWidth,
                targetHeight: targetHeight
              })
            })
            
            if (analysisRes.ok) {
              const analysisData = await analysisRes.json()
              aiAnalysis = analysisData.analysis
              console.log('✅ AI analysis received:', aiAnalysis)
              
              // Use AI's recommended shape
              if (aiAnalysis && aiAnalysis.bestShape) {
                recommendedShape = aiAnalysis.bestShape
                console.log('🎯 AI recommends shape:', recommendedShape, 'for magic mode')
                
                // Update the shape to use AI's recommendation
                shape = recommendedShape
              }
              
              // Check fit quality for logging
              if (aiAnalysis && aiAnalysis.fitQuality) {
                console.log('📊 Fit quality for magic shape:', aiAnalysis.fitQuality)
              }
            } else {
              console.warn('⚠️ AI analysis failed, using original shape for magic mode')
              shape = 'original'
            }
          } catch (aiError) {
            console.warn('⚠️ AI analysis error, using original shape for magic mode:', aiError.message)
            shape = 'original'
          }
        } else if (imageUrl && (shape === 'round' || shape === 'oval')) {
          // For explicit round/oval shapes, use AI for center point detection
          try {
            console.log('🤖 Getting AI analysis for shape recommendation...')
            const analysisRes = await fetch(`${config.public.siteUrl}/api/ai/analyze-photo`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                imageUrl: imageUrl,
                targetShape: shape,
                targetWidth: targetWidth,
                targetHeight: targetHeight
              })
            })
            
            if (analysisRes.ok) {
              const analysisData = await analysisRes.json()
              aiAnalysis = analysisData.analysis
              console.log('✅ AI analysis received:', aiAnalysis)
              
              // Use AI's recommended shape if available
              if (aiAnalysis && aiAnalysis.bestShape) {
                recommendedShape = aiAnalysis.bestShape
                console.log('🎯 AI recommends shape:', recommendedShape, 'instead of requested:', shape)
                
                // Update the shape to use AI's recommendation
                shape = recommendedShape
              }
              
              // Check fit quality for logging
              if (aiAnalysis && aiAnalysis.fitQuality) {
                console.log('📊 Fit quality for recommended shape:', aiAnalysis.fitQuality)
              }
            } else {
              console.warn('⚠️ AI analysis failed, using requested shape')
            }
          } catch (aiError) {
            console.warn('⚠️ AI analysis error, using requested shape:', aiError.message)
          }
        }
        
        // Border configuration for all shapes
        const borderColor = '#2D1810' // Text color for border
        const borderWidth = 2 // Border width in pixels
        
        switch (shape) {
          case 'square':
            // Create square crop with AI-guided cropping
            if (aiAnalysis) {
              // Use AI analysis for intelligent cropping
              const { centerX, centerY, zoom } = aiAnalysis
              console.log('🎯 AI Analysis values for square:', { centerX, centerY, zoom })
              
              // Get actual image dimensions
              const imageInfo = await sharp(imageBuffer).metadata()
              const originalWidth = imageInfo.width || 1000
              const originalHeight = imageInfo.height || 1000
              console.log('📐 Original image dimensions:', { width: originalWidth, height: originalHeight })
              
              // Calculate crop area based on AI analysis with aggressive containment
              const cropWidth = originalWidth / zoom
              const cropHeight = originalHeight / zoom
              
              // Calculate center point with more aggressive bounds checking
              let cropX = (centerX * originalWidth) - (cropWidth / 2)
              let cropY = (centerY * originalHeight) - (cropHeight / 2)
              
              // Ensure crop area stays within image bounds
              cropX = Math.max(0, Math.min(originalWidth - cropWidth, cropX))
              cropY = Math.max(0, Math.min(originalHeight - cropHeight, cropY))
              
              // Additional safety check: if crop would go outside bounds, adjust zoom
              if (cropWidth > originalWidth || cropHeight > originalHeight) {
                console.log('⚠️ Crop area too large, adjusting zoom for safety')
                const safeZoom = Math.max(zoom, Math.max(originalWidth / targetWidth, originalHeight / targetHeight))
                const adjustedCropWidth = originalWidth / safeZoom
                const adjustedCropHeight = originalHeight / safeZoom
                cropX = Math.max(0, Math.min(originalWidth - adjustedCropWidth, (centerX * originalWidth) - (adjustedCropWidth / 2)))
                cropY = Math.max(0, Math.min(originalHeight - adjustedCropHeight, (centerY * originalHeight) - (adjustedCropHeight / 2)))
              }
              
              // Final safety check: ensure crop coordinates are valid
              if (cropX < 0 || cropY < 0 || cropX + cropWidth > originalWidth || cropY + cropHeight > originalHeight) {
                console.log('⚠️ Crop coordinates invalid, using fallback cropping')
                // Use fallback to default cropping
                processedImage = await sharp(imageBuffer)
                  .resize(targetWidth, targetHeight, { fit: 'cover' })
                  .jpeg({ quality: 100, progressive: true, mozjpeg: true })
                  .toBuffer()
                console.log('✅ Fallback crop applied successfully')
                return processedImage
              }
              
              console.log('✂️ Calculated crop area for square:', {
                cropX: Math.round(cropX),
                cropY: Math.round(cropY),
                cropWidth: Math.round(cropWidth),
                cropHeight: Math.round(cropHeight),
                zoom: zoom
              })
              
              console.log('🔄 Applying AI-guided square crop with Sharp...')
              try {
                processedImage = await sharp(imageBuffer)
                  .extract({
                    left: Math.round(cropX),
                    top: Math.round(cropY),
                    width: Math.round(cropWidth),
                    height: Math.round(cropHeight)
                  })
                  .resize(targetWidth, targetHeight, { fit: 'cover' })
                  .jpeg({ quality: 100, progressive: true, mozjpeg: true })
                  .toBuffer()
                console.log('✅ AI-guided square crop applied successfully')
              } catch (cropError) {
                console.warn('⚠️ AI-guided square crop failed, using fallback:', cropError.message)
                // Use fallback to default cropping
                processedImage = await sharp(imageBuffer)
                  .resize(targetWidth, targetHeight, { fit: 'cover' })
                  .jpeg({ quality: 100, progressive: true, mozjpeg: true })
                  .toBuffer()
                console.log('✅ Fallback square crop applied successfully')
              }
            } else {
              // Fallback to default square cropping
              console.log('⚠️ Using default center cropping for square (no AI analysis)')
              processedImage = await sharp(imageBuffer)
                .resize(targetWidth, targetHeight, { fit: 'cover' })
                .jpeg({ quality: 100, progressive: true, mozjpeg: true })
                .toBuffer()
            }
            break
            
          case 'round':
            // Create circular mask with AI-guided cropping
            const circleSvg = `<svg><circle cx="${targetWidth/2}" cy="${targetHeight/2}" r="${Math.min(targetWidth, targetHeight)/2}" fill="white"/></svg>`
            
            if (aiAnalysis) {
              // Use AI analysis for intelligent cropping
              const { centerX, centerY, zoom } = aiAnalysis
              console.log('🎯 AI Analysis values:', { centerX, centerY, zoom })
              
              // Get actual image dimensions
              const imageInfo = await sharp(imageBuffer).metadata()
              const originalWidth = imageInfo.width || 1000
              const originalHeight = imageInfo.height || 1000
              console.log('📐 Original image dimensions:', { width: originalWidth, height: originalHeight })
              
              // Calculate crop area based on AI analysis with aggressive containment
              const cropWidth = originalWidth / zoom
              const cropHeight = originalHeight / zoom
              
              // Calculate center point with more aggressive bounds checking
              let cropX = (centerX * originalWidth) - (cropWidth / 2)
              let cropY = (centerY * originalHeight) - (cropHeight / 2)
              
              // Ensure crop area stays within image bounds
              cropX = Math.max(0, Math.min(originalWidth - cropWidth, cropX))
              cropY = Math.max(0, Math.min(originalHeight - cropHeight, cropY))
              
              // Additional safety check: if crop would go outside bounds, adjust zoom
              if (cropWidth > originalWidth || cropHeight > originalHeight) {
                console.log('⚠️ Crop area too large, adjusting zoom for safety')
                const safeZoom = Math.max(zoom, Math.max(originalWidth / targetWidth, originalHeight / targetHeight))
                const adjustedCropWidth = originalWidth / safeZoom
                const adjustedCropHeight = originalHeight / safeZoom
                cropX = Math.max(0, Math.min(originalWidth - adjustedCropWidth, (centerX * originalWidth) - (adjustedCropWidth / 2)))
                cropY = Math.max(0, Math.min(originalHeight - adjustedCropHeight, (centerY * originalHeight) - (adjustedCropHeight / 2)))
              }
              
              // Final safety check: ensure crop coordinates are valid
              if (cropX < 0 || cropY < 0 || cropX + cropWidth > originalWidth || cropY + cropHeight > originalHeight) {
                console.log('⚠️ Crop coordinates invalid, using fallback cropping')
                // Use fallback to default cropping
                processedImage = await sharp(imageBuffer)
                  .resize(targetWidth, targetHeight, { fit: 'cover' })
                  .composite([{
                    input: Buffer.from(circleSvg),
                    blend: 'dest-in'
                  }])
                  .jpeg({ quality: 100, progressive: true, mozjpeg: true })
                  .toBuffer()
                console.log('✅ Fallback crop applied successfully')
                return processedImage
              }
              
              console.log('✂️ Calculated crop area:', {
                cropX: Math.round(cropX),
                cropY: Math.round(cropY),
                cropWidth: Math.round(cropWidth),
                cropHeight: Math.round(cropHeight),
                zoom: zoom
              })
              
              console.log('🔄 Applying AI-guided crop with Sharp...')
              try {
                processedImage = await sharp(imageBuffer)
                  .extract({
                    left: Math.round(cropX),
                    top: Math.round(cropY),
                    width: Math.round(cropWidth),
                    height: Math.round(cropHeight)
                  })
                  .resize(targetWidth, targetHeight, { fit: 'cover' })
                  .composite([{
                    input: Buffer.from(circleSvg),
                    blend: 'dest-in'
                  }])
                  .jpeg({ quality: 100, progressive: true, mozjpeg: true })
                  .toBuffer()
                console.log('✅ AI-guided crop applied successfully')
              } catch (cropError) {
                console.warn('⚠️ AI-guided crop failed, using fallback:', cropError.message)
                // Use fallback to default cropping
                processedImage = await sharp(imageBuffer)
                  .resize(targetWidth, targetHeight, { fit: 'cover' })
                  .composite([{
                    input: Buffer.from(circleSvg),
                    blend: 'dest-in'
                  }])
                  .jpeg({ quality: 100, progressive: true, mozjpeg: true })
                  .toBuffer()
                console.log('✅ Fallback crop applied successfully')
              }
            } else {
              // Fallback to default cropping
              console.log('⚠️ Using default center cropping (no AI analysis)')
              processedImage = await sharp(imageBuffer)
                .resize(targetWidth, targetHeight, { fit: 'cover' })
                .composite([{
                  input: Buffer.from(circleSvg),
                  blend: 'dest-in'
                }])
                .jpeg({ quality: 100, progressive: true, mozjpeg: true })
                .toBuffer()
            }
            break
            
          case 'oval':
            // Create elliptical mask with AI-guided cropping
            const ellipseSvg = `<svg><ellipse cx="${targetWidth/2}" cy="${targetHeight/2}" rx="${targetWidth/2}" ry="${targetHeight/2}" fill="white"/></svg>`
            
            if (aiAnalysis) {
              // Use AI analysis for intelligent cropping
              const { centerX, centerY, zoom } = aiAnalysis
              console.log('🎯 AI Analysis values:', { centerX, centerY, zoom })
              
              // Get actual image dimensions
              const imageInfo = await sharp(imageBuffer).metadata()
              const originalWidth = imageInfo.width || 1000
              const originalHeight = imageInfo.height || 1000
              console.log('📐 Original image dimensions:', { width: originalWidth, height: originalHeight })
              
              // Calculate crop area based on AI analysis with aggressive containment
              const cropWidth = originalWidth / zoom
              const cropHeight = originalHeight / zoom
              
              // Calculate center point with more aggressive bounds checking
              let cropX = (centerX * originalWidth) - (cropWidth / 2)
              let cropY = (centerY * originalHeight) - (cropHeight / 2)
              
              // Ensure crop area stays within image bounds
              cropX = Math.max(0, Math.min(originalWidth - cropWidth, cropX))
              cropY = Math.max(0, Math.min(originalHeight - cropHeight, cropY))
              
              // Additional safety check: if crop would go outside bounds, adjust zoom
              if (cropWidth > originalWidth || cropHeight > originalHeight) {
                console.log('⚠️ Crop area too large, adjusting zoom for safety')
                const safeZoom = Math.max(zoom, Math.max(originalWidth / targetWidth, originalHeight / targetHeight))
                const adjustedCropWidth = originalWidth / safeZoom
                const adjustedCropHeight = originalHeight / safeZoom
                cropX = Math.max(0, Math.min(originalWidth - adjustedCropWidth, (centerX * originalWidth) - (adjustedCropWidth / 2)))
                cropY = Math.max(0, Math.min(originalHeight - adjustedCropHeight, (centerY * originalHeight) - (adjustedCropHeight / 2)))
              }
              
              // Final safety check: ensure crop coordinates are valid
              if (cropX < 0 || cropY < 0 || cropX + cropWidth > originalWidth || cropY + cropHeight > originalHeight) {
                console.log('⚠️ Crop coordinates invalid, using fallback cropping')
                // Use fallback to default cropping
                processedImage = await sharp(imageBuffer)
                  .resize(targetWidth, targetHeight, { fit: 'cover' })
                  .composite([{
                    input: Buffer.from(ellipseSvg),
                    blend: 'dest-in'
                  }])
                  .png()
                  .toBuffer()
                console.log('✅ Fallback crop applied successfully')
                return processedImage
              }
              
              console.log('✂️ Calculated crop area:', {
                cropX: Math.round(cropX),
                cropY: Math.round(cropY),
                cropWidth: Math.round(cropWidth),
                cropHeight: Math.round(cropHeight),
                zoom: zoom
              })
              
              console.log('🔄 Applying AI-guided crop with Sharp...')
              try {
                processedImage = await sharp(imageBuffer)
                  .extract({
                    left: Math.round(cropX),
                    top: Math.round(cropY),
                    width: Math.round(cropWidth),
                    height: Math.round(cropHeight)
                  })
                  .resize(targetWidth, targetHeight, { fit: 'cover' })
                  .composite([{
                    input: Buffer.from(ellipseSvg),
                    blend: 'dest-in'
                  }])
                  .png()
                  .toBuffer()
                console.log('✅ AI-guided crop applied successfully')
              } catch (cropError) {
                console.warn('⚠️ AI-guided crop failed, using fallback:', cropError.message)
                // Use fallback to default cropping
                processedImage = await sharp(imageBuffer)
                  .resize(targetWidth, targetHeight, { fit: 'cover' })
                  .composite([{
                    input: Buffer.from(ellipseSvg),
                    blend: 'dest-in'
                  }])
                  .png()
                  .toBuffer()
                console.log('✅ Fallback crop applied successfully')
              }
            } else {
              // Fallback to default cropping
              console.log('⚠️ Using default center cropping (no AI analysis)')
              processedImage = await sharp(imageBuffer)
                .resize(targetWidth, targetHeight, { fit: 'cover' })
                .composite([{
                  input: Buffer.from(ellipseSvg),
                  blend: 'dest-in'
                }])
                .jpeg({ quality: 100, progressive: true, mozjpeg: true })
                .toBuffer()
            }
            break
            
                      case 'rounded':
              console.log('🎨 ROUNDED SHAPE DETECTED - Starting rounded corners processing')
              

              
              // Get image metadata to determine orientation
              const imageMetadata = await sharp(imageBuffer).metadata()
              const isPortrait = imageMetadata.height > imageMetadata.width
              const isLandscape = imageMetadata.width > imageMetadata.height
              
              console.log(`📐 Image orientation: ${isPortrait ? 'Portrait' : isLandscape ? 'Landscape' : 'Square'}`)
              console.log(`📏 Original dimensions: ${imageMetadata.width}x${imageMetadata.height}`)
              
              // Preserve original aspect ratio for rounded photos
              const originalAspectRatio = imageMetadata.width / imageMetadata.height
              console.log(`📐 Original aspect ratio: ${originalAspectRatio.toFixed(3)}`)
              
              // Calculate dimensions that preserve aspect ratio while fitting within target bounds
              let standardizedWidth, standardizedHeight
              
              if (originalAspectRatio > 1) {
                // Landscape: fit width to target, calculate height
                standardizedWidth = targetWidth
                standardizedHeight = targetWidth / originalAspectRatio
                console.log(`📐 Landscape: preserving aspect ratio ${originalAspectRatio.toFixed(3)} -> ${standardizedWidth}x${Math.round(standardizedHeight)}`)
              } else if (originalAspectRatio < 1) {
                // Portrait: fit height to target, calculate width
                standardizedHeight = targetHeight
                standardizedWidth = targetHeight * originalAspectRatio
                console.log(`📐 Portrait: preserving aspect ratio ${originalAspectRatio.toFixed(3)} -> ${Math.round(standardizedWidth)}x${standardizedHeight}`)
              } else {
                // Square: use smaller dimension
                const baseSize = Math.min(targetWidth, targetHeight)
                standardizedWidth = baseSize
                standardizedHeight = baseSize
                console.log(`📐 Square: using ${baseSize}x${baseSize}`)
              }
              
              // Scale up for high quality processing
              const highResWidth = Math.floor(standardizedWidth * 2)
              const highResHeight = Math.floor(standardizedHeight * 2)
              
              console.log(`📐 ASPECT RATIO DEBUG - Original: ${imageMetadata.width}x${imageMetadata.height} (${originalAspectRatio.toFixed(3)})`)
              console.log(`📐 ASPECT RATIO DEBUG - Standardized: ${standardizedWidth.toFixed(1)}x${standardizedHeight.toFixed(1)}`)
              console.log(`📐 ASPECT RATIO DEBUG - High Res: ${highResWidth}x${highResHeight}`)
              
              let resizedImage
              if (book.layout_type === 'theme') {
                console.log('🧠 Smart cropping detected - using smart cropping for rounded shape')
                console.log('🎯 Smart crop will prioritize faces in center area')
                console.log('🔍 Debug: imageUrl for smartCropImage:', imageUrl)
                // First apply smart cropping to ensure subject is properly positioned
                const smartCroppedImage = await smartCropImage(imageBuffer, highResWidth, highResHeight, imageUrl, null, null, null, user.id)
                resizedImage = smartCroppedImage
              } else {
                console.log('📚 Regular memory book - using standard resize for rounded shape')
                // For regular memory books, use standard resize with standardized dimensions
                resizedImage = await sharp(imageBuffer)
                  .resize(highResWidth, highResHeight, { 
                    fit: 'cover',
                    kernel: 'mitchell'
                  })
                  .jpeg({ quality: 100, progressive: true, mozjpeg: true })
                  .toBuffer()
              }
            
            // Create rounded corners using Sharp SVG mask approach
            const radius = Math.min(standardizedWidth, standardizedHeight) * 0.15 // 15% of smaller dimension for radius
            console.log(`📐 Calculated radius: ${radius}px (${Math.round(radius)}px rounded)`)
            
            console.log('🎨 Applying Sharp SVG mask for rounded corners...')
            
            // Get the actual dimensions of the resized image
            const resizedMetadata = await sharp(resizedImage).metadata()
            const actualWidth = resizedMetadata.width
            const actualHeight = resizedMetadata.height
            
            console.log(`📏 Resized image dimensions: ${actualWidth}x${actualHeight}`)
            
            // Create SVG mask with actual dimensions
            const roundedMaskSvg = `<svg width="${actualWidth}" height="${actualHeight}" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${radius}" ry="${radius}" fill="white"/>
            </svg>`
            
            // Apply the mask to the resized image
            let roundedImage = await sharp(resizedImage)
              .composite([{
                input: Buffer.from(roundedMaskSvg),
                blend: 'dest-in'
              }])
              .jpeg({ quality: 100, progressive: true, mozjpeg: true })
              .toBuffer()
            
            console.log(`🎨 Applied rounded corners with Sharp, radius: ${Math.round(radius)}px`)
            
            // Add border to the rounded image
            // Create a larger canvas with rounded border
            const borderedWidth = actualWidth + (borderWidth * 2)
            const borderedHeight = actualHeight + (borderWidth * 2)
            
            // Create background with rounded corners
            const borderSvg = `<svg width="${borderedWidth}" height="${borderedHeight}" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="0" width="${borderedWidth}" height="${borderedHeight}" rx="${radius + borderWidth}" ry="${radius + borderWidth}" fill="${borderColor}"/>
            </svg>`
            
            // Composite the rounded image onto the bordered background
            processedImage = await sharp(Buffer.from(borderSvg))
              .composite([{ 
                input: roundedImage, 
                blend: 'over',
                top: borderWidth,
                left: borderWidth
              }])
              .jpeg({ quality: 100, progressive: true, mozjpeg: true })
              .toBuffer()
            
                          console.log(`✅ ROUNDED CORNERS PROCESSING COMPLETED`)
              console.log(`📐 Standardized dimensions used: ${standardizedWidth}x${standardizedHeight} (${isPortrait ? 'Portrait' : isLandscape ? 'Landscape' : 'Square'})`)
            break
            
          case 'original':
          default:
            // Keep original aspect ratio
            processedImage = await sharp(imageBuffer)
              .resize(targetWidth, targetHeight, { 
                fit: 'inside',
                kernel: 'mitchell'
              })
              .jpeg({ quality: 100, progressive: true, mozjpeg: true })
              .toBuffer()
            
            // Calculate border radius (same as rounded case)
            const originalRadius = Math.min(targetWidth, targetHeight) * 0.15 // 15% of smaller dimension for radius
            console.log(`📐 Original case - Calculated radius: ${originalRadius}px (${Math.round(originalRadius)}px rounded)`)
            
            if (borderWidth > 0) {
              // Get the actual dimensions of the resized image
              const resizedMetadata = await sharp(processedImage).metadata()
              const actualWidth = resizedMetadata.width
              const actualHeight = resizedMetadata.height
              
              console.log(`📏 Original case - Resized image dimensions: ${actualWidth}x${actualHeight}`)
              
              // Apply rounded corners to the image first
              const roundedMaskSvg = `<svg width="${actualWidth}" height="${actualHeight}" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${originalRadius}" ry="${originalRadius}" fill="white"/>
              </svg>`
              
              const roundedImage = await sharp(processedImage)
                .composite([{
                  input: Buffer.from(roundedMaskSvg),
                  blend: 'dest-in'
                }])
                .jpeg({ quality: 100, progressive: true, mozjpeg: true })
                .toBuffer()
              
              // Create a larger canvas with rounded border
              const borderedWidth = actualWidth + (borderWidth * 2)
              const borderedHeight = actualHeight + (borderWidth * 2)
              
              // Create background with rounded corners for the border
              const borderSvg = `<svg width="${borderedWidth}" height="${borderedHeight}" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="${borderedWidth}" height="${borderedHeight}" rx="${originalRadius + borderWidth}" ry="${originalRadius + borderWidth}" fill="${borderColor}"/>
              </svg>`
              
              // Composite the rounded image onto the bordered background
              processedImage = await sharp(Buffer.from(borderSvg))
                .composite([{ 
                  input: roundedImage, 
                  blend: 'over',
                  top: borderWidth,
                  left: borderWidth
                }])
                .jpeg({ quality: 100, progressive: true, mozjpeg: true })
                .toBuffer()
              
              console.log(`✅ Original case - Rounded corners with border applied, radius: ${Math.round(originalRadius)}px`)
            } else {
              // No border, just apply rounded corners to the image
              const resizedMetadata = await sharp(processedImage).metadata()
              const actualWidth = resizedMetadata.width
              const actualHeight = resizedMetadata.height
              
              const roundedMaskSvg = `<svg width="${actualWidth}" height="${actualHeight}" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${originalRadius}" ry="${originalRadius}" fill="white"/>
              </svg>`
              
              processedImage = await sharp(processedImage)
                .composite([{
                  input: Buffer.from(roundedMaskSvg),
                  blend: 'dest-in'
                }])
                .jpeg({ quality: 100, progressive: true, mozjpeg: true })
                .toBuffer()
              
              console.log(`✅ Original case - Rounded corners applied (no border), radius: ${Math.round(originalRadius)}px`)
            }
            break
        }
        
        console.log(`✅ Image shape processed successfully: ${shape}`)
        return processedImage
      } catch (error) {
        console.warn(`⚠️ Failed to process image shape, using original:`, error.message)
        return imageBuffer // Fallback to original if processing fails
      }
    }
    
    await updatePdfStatus(supabase, book.id, user.id, 'Background ready, creating pages...')
    


    // Handle theme layout PDF generation
    if (book.layout_type === 'theme') {
      try {
        console.log('🎨 Starting theme-based PDF generation')
      
      // Fetch the theme again to ensure we have the latest data
      const { data: theme, error: themeError } = await supabase
        .from('themes')
        .select('*')
        .eq('id', book.theme_id)
        .eq('deleted', false)
        .single()

      if (themeError || !theme) {
        console.error('❌ Theme not found during PDF generation:', themeError)
        throw createError({
          statusCode: 404,
          statusMessage: 'Selected theme not found'
        })
      }

      // Parse layout_config
      const layoutConfig = typeof theme.layout_config === 'string' 
        ? JSON.parse(theme.layout_config) 
        : theme.layout_config

      console.log('🔍 DEBUG - Layout config:', JSON.stringify(layoutConfig, null, 2))
      console.log('🔍 DEBUG - Layout config type:', typeof layoutConfig)
      console.log('🔍 DEBUG - Layout config keys:', layoutConfig ? Object.keys(layoutConfig) : 'null')

      // If no layout_config or missing photos array, fall back to grid layout
      if (!layoutConfig || !layoutConfig.photos) {
        console.log('⚠️ Theme has no layout_config configured, falling back to grid layout')
        // Change layout type to grid and continue with grid layout processing
        book.layout_type = 'grid'
        // This will cause the code to skip theme processing and use grid layout instead
        throw new Error('SWITCH_TO_GRID_LAYOUT')
      }

      // Convert theme size to PDF dimensions
      let pageWidth, pageHeight
      switch (theme.size) {
        case '4x6': pageWidth = 288; pageHeight = 432; break
        case '6x4': pageWidth = 432; pageHeight = 288; break
        case '5x3': pageWidth = 360; pageHeight = 216; break
        case '5x7': pageWidth = 360; pageHeight = 504; break
        case '7x5': pageWidth = 504; pageHeight = 360; break
        case '8x10': pageWidth = 576; pageHeight = 720; break
        case '10x8': pageWidth = 720; pageHeight = 576; break
        case '8.5x11': pageWidth = 612; pageHeight = 792; break
        case '11x8.5': pageWidth = 792; pageHeight = 612; break
        case '11x14': pageWidth = 792; pageHeight = 1008; break
        case '14x11': pageWidth = 1008; pageHeight = 792; break
        case '12x12': pageWidth = 864; pageHeight = 864; break
        default: pageWidth = 612; pageHeight = 792;
      }
      console.log(`📐 Theme PDF dimensions: ${pageWidth}x${pageHeight} points (${theme.size})`)

      // Create PDF document
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage([pageWidth, pageHeight])
      
      // Use theme size for JPG conversion when theme is selected
      const effectivePrintSize = theme.size || printSize

      // Apply background color with opacity
      if (theme.background_color) {
        console.log('🎨 Applying theme background color:', theme.background_color)
        const hexColor = theme.background_color.replace('#', '')
        const opacity = (theme.background_opacity || 100) / 100
        if (/^[0-9A-Fa-f]{6}$/.test(hexColor)) {
          const r = parseInt(hexColor.substr(0, 2), 16) / 255
          const g = parseInt(hexColor.substr(2, 2), 16) / 255
          const b = parseInt(hexColor.substr(4, 2), 16) / 255
          const blendedR = r * opacity + (1 - opacity)
          const blendedG = g * opacity + (1 - opacity)
          const blendedB = b * opacity + (1 - opacity)
          page.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: rgb(blendedR, blendedG, blendedB) })
          console.log(`🎨 Background applied: ${theme.background_color} with ${theme.background_opacity}% opacity`)
        }
      }

      // Apply page border if specified in theme
      const pageBorder = theme.page_border || 0
      const pageBorderOffset = theme.page_border_offset || 5
      console.log(`🔍 DEBUG - Page border values: pageBorder=${pageBorder}px, pageBorderOffset=${pageBorderOffset}mm`)
      console.log(`🔍 DEBUG - Page dimensions: pageWidth=${pageWidth}pts, pageHeight=${pageHeight}pts`)
      
      if (pageBorder > 0) {
        console.log(`🖼️ Applying page border: ${pageBorder}px with ${pageBorderOffset}mm offset`)
        // Ensure border color has # prefix for parsing
        let borderColor = theme.body_font_color || '#333333'
        if (borderColor && !borderColor.startsWith('#')) {
          borderColor = '#' + borderColor
        }
        console.log(`🔍 DEBUG - Border color: ${borderColor}`)
        
        const hexColor = borderColor.replace('#', '')
        if (/^[0-9A-Fa-f]{6}$/.test(hexColor)) {
          const r = parseInt(hexColor.substr(0, 2), 16) / 255
          const g = parseInt(hexColor.substr(2, 2), 16) / 255
          const b = parseInt(hexColor.substr(4, 2), 16) / 255
          
          // Convert mm offset to points
          const mmToPoints = 72 / 25.4
          const offsetPoints = pageBorderOffset * mmToPoints
          
          // Convert pixels to points for PDF border width (1 point = 1/72 inch, 1 pixel = 1/96 inch)
          const borderWidthPoints = pageBorder * (72 / 96)
          
          console.log(`🔍 DEBUG - Calculated values: offsetPoints=${offsetPoints}, borderWidthPoints=${borderWidthPoints}`)
          console.log(`🔍 DEBUG - Border rectangle: x=${offsetPoints}, y=${offsetPoints}, width=${pageWidth - (offsetPoints * 2)}, height=${pageHeight - (offsetPoints * 2)}`)
          
          // Draw border around the content area using the offset
          // The border should be drawn around the content area, not fill the whole page
          const borderX = offsetPoints
          const borderY = offsetPoints
          const borderWidth = pageWidth - (offsetPoints * 2)
          const borderHeight = pageHeight - (offsetPoints * 2)
          
          console.log(`🔍 DEBUG - Border area: x=${borderX}, y=${borderY}, width=${borderWidth}, height=${borderHeight}`)
          
          // Draw the border rectangle around the content area - FIXED: Use borderColor and borderWidth properties
          page.drawRectangle({ 
            x: borderX, 
            y: borderY, 
            width: borderWidth, 
            height: borderHeight, 
            borderColor: rgb(r, g, b),
            borderWidth: borderWidthPoints
          })
          console.log(`🖼️ Page border applied: ${pageBorder}px border with ${pageBorderOffset}mm offset`)
        }
      }

      // Convert mm to points for layout positioning
      const mmToPoints = 72 / 25.4
      const cardWidthMm = layoutConfig.cardWidthMm || 178
      const cardHeightMm = layoutConfig.cardHeightMm || 127
      const cardWidthPoints = cardWidthMm * mmToPoints
      const cardHeightPoints = cardHeightMm * mmToPoints
      const cardX = (pageWidth - cardWidthPoints) / 2
      const cardY = (pageHeight - cardHeightPoints) / 2
      console.log(`📐 Card dimensions: ${cardWidthPoints}x${cardHeightPoints} points (${cardWidthMm}x${cardHeightMm}mm)`)
      console.log(`📐 Page dimensions: ${pageWidth}x${pageHeight} points`)
      console.log(`📐 Card positioning: cardX=${cardX}, cardY=${cardY}`)
      console.log(`📐 Card width vs page width: ${cardWidthPoints} vs ${pageWidth} (diff: ${cardWidthPoints - pageWidth})`)

      // Process photos from layout_config
      const themePhotoCount = layoutConfig.photos.length
      const userIntendedPhotoCount = book.created_from_assets?.length || themePhotoCount
      console.log(`📸 Theme layout supports ${themePhotoCount} photos, user intended ${userIntendedPhotoCount} photos`)
      
      // Check if this is a card or book format - if so, respect the format and limit photos to theme support
      const isCardFormat = book.format === 'card'
      const isBookFormat = book.format === 'book'
      if (isCardFormat || isBookFormat) {
        console.log(`${isCardFormat ? '🎴 Card' : '📚 Book'} format detected - respecting format and limiting to ${themePhotoCount} photos`)
        // For card/book format, always use theme layout and limit photos to what the theme supports
        const limitedAssets = book.created_from_assets?.slice(0, themePhotoCount) || []
        book.created_from_assets = limitedAssets
        console.log(`📸 Limited assets for ${isCardFormat ? 'card' : 'book'} format: ${limitedAssets.length} photos`)
      } else if (userIntendedPhotoCount > themePhotoCount) {
        // Only switch to grid layout for non-card formats
        console.log(`⚠️ User selected ${userIntendedPhotoCount} photos but theme only supports ${themePhotoCount}. Switching to grid layout.`)
        // Change layout type to grid for this generation
        book.layout_type = 'grid'
        // Continue with grid layout processing instead of theme layout
        throw new Error('SWITCH_TO_GRID_LAYOUT')
      }
      
      const photoCount = themePhotoCount
      console.log(`📸 Processing ${photoCount} photos from theme layout`)

      // For newly created magic memory cards, use the already selected assets
      // For regenerations, use the full photo selection pool
      let assetIds
      if (book.created_from_assets && book.created_from_assets.length > 0) {
        // Use the assets that were already selected during creation
        assetIds = book.created_from_assets
        console.log(`📸 Theme PDF - Using already selected assets: ${assetIds.length} assets`)
      } else {
        // Use the full photo selection pool for regenerations, but limit to 100 max
        assetIds = book.photo_selection_pool || []
        if (assetIds.length > 100) {
          assetIds = assetIds.slice(0, 100)
          console.log(`📸 Theme PDF - Limited photo selection pool to first 100 photos (from ${book.photo_selection_pool?.length || 0} total)`)
        }
        console.log(`📸 Theme PDF - Using photo selection pool: ${assetIds.length} assets for AI selection`)
      }
      
      const { data: assets, error: assetsError } = await supabase
        .from('assets')
        .select('*')
        .in('id', assetIds)
        .eq('approved', true)
        .eq('deleted', false)
      if (assetsError || !assets || assets.length === 0) {
        console.error('❌ No assets found for theme layout:', assetsError)
        throw createError({ statusCode: 404, statusMessage: 'No assets found for theme layout' })
      }

      let selectedAssets = assets
      let aiStory = book.magic_story || null
      
      // Check if this is a photo library selection (user manually selected photos)
      const isPhotoLibrarySelection = book.photo_selection_method === 'photo_library'
      
      // Check if we already have a real story (not a placeholder)
      let hasExistingStory = aiStory && aiStory.trim().length > 0
      
      // Check if this is a regeneration (book was previously ready and is being recreated)
      const isRegeneration = book.status === 'draft' && book.background_url === null && book.pdf_url === null && hasExistingStory
      
      if (isPhotoLibrarySelection) {
        console.log('📚 Photo library selection detected - using user-selected photos without AI selection')
        // For photo library selection, use the assets as-is (they were pre-selected by the user)
        selectedAssets = assets
        // Still generate a story using the selected photos
        console.log('🎨 Photo library layout detected, generating a story for user-selected photos')
      } else if (isRegeneration) {
        // Force story regeneration for recreate operations
        console.log('🔄 Regeneration detected - generating a new story for recreate')
        selectedAssets = assets // assets already filtered to created_from_assets
      } else if (book.created_from_assets && book.created_from_assets.length > 0 && hasExistingStory) {
        // Use existing story and assets for newly created magic memory cards (only if we have both assets and a real story)
        console.log('📖 Using existing story and selected assets for magic memory card')
        selectedAssets = assets // assets already filtered to created_from_assets
      } else {
        // Only call AI for theme layouts that don't have selected assets yet (regenerations) or have placeholder stories
        console.log('🎨 Theme layout detected, generating a new story for regeneration')
      }
      
      // If book is in template status, wait for it to be updated with real data
      if (book.status === 'template') {
        console.log('⏳ Book is in template status, waiting for frontend to update with real data...')
        await updatePdfStatus(supabase, book.id, user.id, '⏳ Waiting for AI results...')
        
        // Wait a bit and check again
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        // Re-fetch the book to get updated values
        const { data: updatedBook, error: bookError } = await supabase
          .from('memory_books')
          .select('*')
          .eq('id', book.id)
          .single()
        
        if (!bookError && updatedBook) {
          book = updatedBook
          aiStory = book.magic_story || null
          hasExistingStory = aiStory && aiStory.trim().length > 0
          
          // Re-evaluate the logic with updated book data
          if (book.created_from_assets && book.created_from_assets.length > 0 && hasExistingStory) {
            console.log('📖 Book updated with real data, using existing story and assets')
            selectedAssets = assets.filter(a => book.created_from_assets.includes(a.id))
          }
        }
      }
      
      const photos = assets.map(asset => ({
        id: asset.id,
        storage_url: asset.storage_url, // Add the storage_url field
        ai_caption: asset.ai_caption || '',
        people_detected: asset.people_detected || [],
        tags: asset.tags || [],
        user_tags: asset.user_tags || [],
        city: asset.city || null,
        state: asset.state || null,
        country: asset.country || null,
        zip_code: asset.zip_code || null,
        width: asset.width || null,
        height: asset.height || null,
        orientation: asset.orientation || 'unknown',
        asset_date: asset.asset_date || null,
        fingerprint: asset.fingerprint || null,
        created_at: asset.created_at || null,
        location: asset.location || null
      }))
      
      // Magic memory logic is now handled at the beginning of the function
      // Skip to photo processing step since we already have selected assets and story
      console.log('✅ Using existing selected assets and story for PDF generation')
      await updatePdfStatus(supabase, book.id, user.id, '🎯 Processing photos for layout...')

      // Match photos to positions based on aspect ratio to minimize cropping
      console.log('🎯 Matching photos to positions based on aspect ratio...')
      
      // Calculate aspect ratios for each position
      const positionAspectRatios = layoutConfig.photos.map((photo, index) => ({
        index,
        aspectRatio: photo.size.width / photo.size.height,
        config: photo
      }))
      
      // Get aspect ratios for selected assets (we'll need to fetch metadata)
      const assetAspectRatios = []
      for (const asset of selectedAssets) {
        try {
          const imageRes = await fetch(asset.storage_url)
          if (imageRes.ok) {
            const imageBuffer = Buffer.from(await imageRes.arrayBuffer())
            const metadata = await sharp(imageBuffer).metadata()
            
            // Respect original orientation - use the actual dimensions as they appear
            // Don't swap width/height based on EXIF orientation
            const aspectRatio = metadata.width / metadata.height
            const orientation = metadata.orientation || 1
            
            assetAspectRatios.push({
              asset,
              aspectRatio,
              width: metadata.width,
              height: metadata.height,
              orientation
            })
            console.log(`📐 Asset ${asset.id}: ${metadata.width}x${metadata.height} (aspect: ${aspectRatio.toFixed(3)}, orientation: ${orientation})`)
          }
        } catch (error) {
          console.warn(`⚠️ Failed to get metadata for asset ${asset.id}:`, error.message)
          // Use default aspect ratio if we can't get metadata
          assetAspectRatios.push({
            asset,
            aspectRatio: 1.0, // Default to square
            width: 1000,
            height: 1000,
            orientation: 1
          })
        }
      }
      
      // Sort positions by aspect ratio (landscape to portrait)
      positionAspectRatios.sort((a, b) => b.aspectRatio - a.aspectRatio)
      
      // Sort assets by aspect ratio (landscape to portrait)
      assetAspectRatios.sort((a, b) => b.aspectRatio - a.aspectRatio)
      
      console.log('📐 Position aspect ratios:', positionAspectRatios.map(p => `${p.index}: ${p.aspectRatio.toFixed(3)}`))
      console.log('📐 Asset aspect ratios:', assetAspectRatios.map(a => `${a.asset.id}: ${a.aspectRatio.toFixed(3)}`))
      
      // Match assets to positions based on aspect ratio similarity
      const matchedAssets = []
      for (let i = 0; i < Math.min(assetAspectRatios.length, positionAspectRatios.length); i++) {
        const position = positionAspectRatios[i]
        const asset = assetAspectRatios[i]
        matchedAssets[position.index] = asset.asset
        console.log(`🎯 Matched asset ${asset.asset.id} (${asset.aspectRatio.toFixed(3)}) to position ${position.index} (${position.aspectRatio.toFixed(3)})`)
      }
      
      // Process each photo according to layout_config with matched assets
      for (let i = 0; i < Math.min(matchedAssets.length, photoCount); i++) {
        const asset = matchedAssets[i]
        const photoConfig = layoutConfig.photos[i]
        if (!asset || !photoConfig || !photoConfig.position || !photoConfig.size) continue
        try {
          const imageRes = await fetch(asset.storage_url)
          if (!imageRes.ok) throw new Error(`Failed to fetch image: ${imageRes.status}`)
          let imageBuffer = Buffer.from(await imageRes.arrayBuffer())
          // Auto-enhance if enabled
          if (book.auto_enhance) {
            try {
              imageBuffer = await enhanceImage(imageBuffer)
              console.log('✨ Auto-enhanced image for asset', asset.id)
            } catch (enhanceErr) {
              console.warn('⚠️ Failed to auto-enhance image for asset', asset.id, enhanceErr)
            }
          }
          // Inner content (photo) size in points
          const photoWidth = photoConfig.size.width * mmToPoints
          const photoHeight = photoConfig.size.height * mmToPoints

          // Frame padding handling (in points and pixels)
          let paddingTopPt = 0, paddingRightPt = 0, paddingBottomPt = 0, paddingLeftPt = 0
          if (photoConfig.frame && photoConfig.frame.padding) {
            paddingTopPt = (photoConfig.frame.padding.top || 0) * mmToPoints
            paddingRightPt = (photoConfig.frame.padding.right || 0) * mmToPoints
            paddingBottomPt = (photoConfig.frame.padding.bottom || 0) * mmToPoints
            paddingLeftPt = (photoConfig.frame.padding.left || 0) * mmToPoints
          }

          // Outer (frame-included) box size in points
          const outerWidthPt = photoWidth + paddingLeftPt + paddingRightPt
          const outerHeightPt = photoHeight + paddingTopPt + paddingBottomPt

          // Calculate base position in theme editor coordinates (top-origin)
          let themeX = photoConfig.position.x * mmToPoints
          let themeY = photoConfig.position.y * mmToPoints

          // The theme editor positions photos at their unrotated top-left corner,
          // then applies CSS transform: rotate() with transform-origin: center center
          // The PDF library works the same way - it expects the unrotated top-left position
          // and rotates around the center automatically
          const rotationDegrees = photoConfig.rotation || 0
          
          vlog(`🔄 Photo ${i + 1} POSITIONING LOGIC:`, {
            originalPosition: { x: photoConfig.position.x, y: photoConfig.position.y },
            rotation: rotationDegrees,
            photoSize: { width: photoConfig.size.width, height: photoConfig.size.height },
            themeX: themeX,
            themeY: themeY,
            explanation: 'Using unrotated top-left position - PDF library will rotate around center'
          })

          // Convert theme coordinates to PDF coordinates (bottom-origin)
          // Theme editor uses top-origin (Y=0 at top), PDF uses bottom-origin (Y=0 at bottom)
          // Use OUTER box for anchoring so the top-left in the editor equals the top-left of the final drawn box
          const photoX = cardX + themeX
          const photoY = cardY + (cardHeightPoints - themeY - outerHeightPt)
          
          vlog(`📐 Photo ${i + 1} FINAL POSITIONING:`, {
            themeCoordinates: { x: themeX / mmToPoints, y: themeY / mmToPoints },
            pdfCoordinates: { x: photoX, y: photoY },
            cardPosition: { x: cardX, y: cardY },
            cardDimensions: { width: cardWidthPoints, height: cardHeightPoints },
            photoDimensions: { width: photoWidth, height: photoHeight },
            framePaddingPt: { top: paddingTopPt, right: paddingRightPt, bottom: paddingBottomPt, left: paddingLeftPt },
            outerDimensionsPt: { width: outerWidthPt, height: outerHeightPt },
            rotation: rotationDegrees,
            xCalculation: `${cardX} + ${themeX} = ${photoX}`,
            yCalculation: `${cardY} + (${cardHeightPoints} - ${themeY} - ${photoHeight}) = ${photoY}`
          })
          
          // Render inner content at 2x pixel density for quality
          const targetWidth = Math.round(photoWidth * 2)
          const targetHeight = Math.round(photoHeight * 2)
          // Convert frame padding points -> pixels for compositing
          const pointsToPixels = 96 / 72
          const padTopPx = Math.round(paddingTopPt * pointsToPixels)
          const padRightPx = Math.round(paddingRightPt * pointsToPixels)
          const padBottomPx = Math.round(paddingBottomPt * pointsToPixels)
          const padLeftPx = Math.round(paddingLeftPt * pointsToPixels)
          let finalImageBuffer
          vlog(`🔍 Debug: Asset ${i + 1} storage_url:`, asset.storage_url)
          try {
            finalImageBuffer = await smartCropImage(imageBuffer, targetWidth, targetHeight, asset.storage_url, i, matchedAssets.length, asset.id, user.id)
          } catch (smartCropError) {
            finalImageBuffer = await sharp(imageBuffer)
              .resize(targetWidth, targetHeight, { fit: 'cover' })
              .withMetadata() // Preserve original orientation
              .jpeg({ quality: 100, progressive: true, mozjpeg: true })
              .toBuffer()
          }
          // Apply photo border and/or rounded corners if specified in theme
          const photoBorder = theme.photo_border || 0
          // Use photoConfig.borderRadius as percentage when available, otherwise use 15% when theme.rounded is true
          const borderRadius = photoConfig.borderRadius ? 
            (Math.min(targetWidth, targetHeight) * (photoConfig.borderRadius / 100)) : 
            (theme.rounded ? Math.min(targetWidth, targetHeight) * 0.15 : 0)
          
          // rotationDegrees already declared above
          
          vlog(`🎨 Theme photo processing - Asset ${i + 1}: photoBorder=${photoBorder}, borderRadius=${borderRadius}, rotation=${rotationDegrees}°, theme.rounded=${theme.rounded}, photoConfig.borderRadius=${photoConfig.borderRadius}`)
          vlog(`🎨 Theme photo processing - Target dimensions: ${targetWidth}x${targetHeight}, calculated radius: ${Math.min(targetWidth, targetHeight) * 0.15}`)
          
                      if (photoBorder > 0) {
              vlog(`🎨 Theme photo processing - Applying border with width: ${photoBorder}`)
              // Ensure border color has # prefix for Sharp
              let borderColor = theme.body_font_color || '#333333'
              if (borderColor && !borderColor.startsWith('#')) {
                borderColor = '#' + borderColor
              }
              vlog(`🎨 Theme photo processing - Border color: ${borderColor}`)
              // Increase border width for better visibility of rounded corners
              const borderWidth = Math.max(photoBorder, 3) // Minimum 3 pixels for visibility
              vlog(`🎨 Theme photo processing - Using border width: ${borderWidth} (original: ${photoBorder})`)
                          try {
                if (borderRadius > 0) {
                  vlog(`🎨 Theme photo processing - Applying border radius: ${borderRadius}px`)
                  // Apply border radius to both image and border
                  const borderRadiusPixels = Math.round(borderRadius)
                  // The border background should have radius = image radius + border width
                  const borderRadiusWithBorder = borderRadiusPixels + borderWidth
                  vlog(`🎨 Theme photo processing - Border radius pixels: ${borderRadiusPixels}, border background radius: ${borderRadiusWithBorder}`)
                
                // Create background layer with theme color
                let themeBackgroundColor = '#FFFFFF' // Default to white
                if (theme.background_color) {
                  // Ensure the color has # prefix for Sharp compatibility
                  themeBackgroundColor = theme.background_color.startsWith('#') ? theme.background_color : `#${theme.background_color}`
                }
                const themeBackgroundOpacity = theme.background_opacity || 100
                vlog(`🎨 Theme photo processing - Using theme background: ${themeBackgroundColor} with opacity ${themeBackgroundOpacity}%`)
                
                // Create a larger canvas with theme background color and border
                const borderedWidth = targetWidth + (borderWidth * 2)
                const borderedHeight = targetHeight + (borderWidth * 2)
                
                // Create mask SVG with white fill
                const maskSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${targetWidth}" height="${targetHeight}">
                  <rect x="0" y="0" width="${targetWidth}" height="${targetHeight}"
                        rx="${borderRadiusPixels}" ry="${borderRadiusPixels}" fill="#ffffff"/>
                </svg>`
                
                // Create border SVG with proper positioning
                const borderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${targetWidth}" height="${targetHeight}">
                  <rect x="${borderWidth/2}" y="${borderWidth/2}"
                        width="${targetWidth - borderWidth}" height="${targetHeight - borderWidth}"
                        rx="${borderRadiusPixels}" ry="${borderRadiusPixels}"
                        fill="none" stroke="${borderColor}" stroke-width="${borderWidth}"/>
                </svg>`
                
                // 1) Ensure the image has an alpha channel (critical!)
                const withAlpha = await sharp(finalImageBuffer)
                  .ensureAlpha() // <= guarantees RGBA so the mask can cut corners
                  .composite([{ input: Buffer.from(maskSvg), blend: 'dest-in' }]) // transparent corners now
                  .png() // keep alpha while we work
                  .toBuffer()
                
                // 2) Bake the background color so later JPG/PDF won't default to black
                const flattened = await sharp(withAlpha)
                  .flatten({ background: themeBackgroundColor }) // replaces transparency with your theme color
                  .toBuffer()
                
                // 3) Draw the rounded border on top and export (JPG-safe)
                finalImageBuffer = await sharp(flattened)
                  .composite([{ input: Buffer.from(borderSvg), blend: 'over' }])
                  .jpeg({ quality: 100, progressive: true, mozjpeg: true })
                  .toBuffer()
                vlog(`🎨 Theme photo processing - Final image with rounded border created successfully`)
                              } else {
                  vlog(`🎨 Theme photo processing - No border radius, using rectangular border`)
                  // Create border by extending the image with border color (no radius)
                  const borderedImage = await sharp(finalImageBuffer)
                    .extend({
                      top: borderWidth,
                      bottom: borderWidth,
                      left: borderWidth,
                      right: borderWidth,
                      background: borderColor
                    })
                    .jpeg({ quality: 100, progressive: true, mozjpeg: true })
                    .toBuffer()
                  finalImageBuffer = borderedImage
                }
              
              // Adjust drawing dimensions to account for border
              // Convert pixels to points for PDF drawing (1 point = 1/72 inch, 1 pixel = 1/96 inch)
              const borderPoints = photoBorder * (72 / 96)
              const pdfImage = await pdfDoc.embedJpg(finalImageBuffer)
              const drawOptions = { 
                x: photoX - borderPoints, 
                y: photoY - borderPoints, 
                width: photoWidth + (borderPoints * 2), 
                height: photoHeight + (borderPoints * 2) 
              }
              if (rotationDegrees !== 0) {
                // Add rotation - PDF library handles rotation around center automatically
                drawOptions.rotate = degrees(-rotationDegrees)
              }
              page.drawImage(pdfImage, drawOptions)
            } catch (borderError) {
              vwarn('⚠️ Failed to apply photo border:', borderError)
              const pdfImage = await pdfDoc.embedJpg(finalImageBuffer)
              const drawOptions = { x: photoX, y: photoY, width: photoWidth, height: photoHeight }
              if (rotationDegrees !== 0) {
                // Add rotation - PDF library handles rotation around center automatically
                drawOptions.rotate = degrees(-rotationDegrees)
              }
              page.drawImage(pdfImage, drawOptions)
            }
          } else if (borderRadius > 0) {
            vlog(`🎨 Theme photo processing - Applying rounded corners only (no border): ${borderRadius}px`)
            // Apply rounded corners only (no border)
            const borderRadiusPixels = Math.round(borderRadius)
            try {
              const roundedSvg = `<svg width="${targetWidth}" height="${targetHeight}"><rect width="${targetWidth}" height="${targetHeight}" rx="${borderRadiusPixels}" ry="${borderRadiusPixels}" fill="white"/></svg>`
              finalImageBuffer = await sharp(finalImageBuffer)
                .composite([{ input: Buffer.from(roundedSvg), blend: 'dest-in' }])
                .jpeg({ quality: 100, progressive: true, mozjpeg: true })
                .toBuffer()
            } catch (roundError) { vwarn('⚠️ Failed to apply rounded corners:', roundError) }
            // If there is frame padding, extend the image to include the padding so placement uses the OUTER box
            if (padTopPx || padRightPx || padBottomPx || padLeftPx) {
              try {
                // Extend with white (simulates a simple frame). If theme.background_color exists, prefer it.
                let frameBackground = '#ffffff'
                if (theme && theme.background_color) {
                  frameBackground = theme.background_color.startsWith('#') ? theme.background_color : `#${theme.background_color}`
                }
                if (photoConfig.frame && photoConfig.frame.type === 'image') {
                  // Most polaroid frames are white; keep white background as a reasonable default.
                }
                finalImageBuffer = await sharp(finalImageBuffer)
                  .extend({ top: padTopPx, right: padRightPx, bottom: padBottomPx, left: padLeftPx, background: frameBackground })
                  .jpeg({ quality: 100, progressive: true, mozjpeg: true })
                  .toBuffer()
              } catch (extendErr) {
                console.warn('⚠️ Failed to extend image for frame padding:', extendErr)
              }
            }
            // Pre-rotate bitmap so the top-left anchor remains fixed after rotation
            if (rotationDegrees !== 0) {
              try {
                const rotated = await sharp(finalImageBuffer)
                  .rotate(rotationDegrees, { background: theme && theme.background_color ? (theme.background_color.startsWith('#') ? theme.background_color : `#${theme.background_color}`) : '#ffffff' })
                  .jpeg({ quality: 100, progressive: true, mozjpeg: true })
                  .toBuffer()
                finalImageBuffer = rotated
                // Draw using intended OUTER dimensions so bitmap resolution doesn't affect size
                const anchoredX = photoX
                const anchoredY = cardY + (cardHeightPoints - themeY - outerHeightPt)
                vlog(`🧭 Pre-rotated (with padding). Drawing at intended size pt: ${Math.round(outerWidthPt)}x${Math.round(outerHeightPt)}; anchored at (${anchoredX}, ${anchoredY})`)
                const pdfImage = await pdfDoc.embedJpg(finalImageBuffer)
                page.drawImage(pdfImage, { x: anchoredX, y: anchoredY, width: outerWidthPt, height: outerHeightPt })
                continue
              } catch (rotErr) {
                vwarn('⚠️ Failed to pre-rotate image; falling back to PDF rotation:', rotErr)
              }
            }
            const pdfImage = await pdfDoc.embedJpg(finalImageBuffer)
            const drawOptions = { x: photoX, y: photoY, width: outerWidthPt, height: outerHeightPt }
            if (rotationDegrees !== 0) {
              // Add rotation - PDF library handles rotation around center automatically
              drawOptions.rotate = degrees(-rotationDegrees)
            }
            page.drawImage(pdfImage, drawOptions)
          } else {
            vlog(`🎨 Theme photo processing - No border or radius applied`)
            // No border or radius
            // If there is frame padding, extend the image to include the padding so placement uses the OUTER box
            if (padTopPx || padRightPx || padBottomPx || padLeftPx) {
              try {
                let frameBackground = '#ffffff'
                if (theme && theme.background_color) {
                  frameBackground = theme.background_color.startsWith('#') ? theme.background_color : `#${theme.background_color}`
                }
                finalImageBuffer = await sharp(finalImageBuffer)
                  .extend({ top: padTopPx, right: padRightPx, bottom: padBottomPx, left: padLeftPx, background: frameBackground })
                  .jpeg({ quality: 100, progressive: true, mozjpeg: true })
                  .toBuffer()
              } catch (extendErr) {
                console.warn('⚠️ Failed to extend image for frame padding:', extendErr)
              }
            }
            if (rotationDegrees !== 0) {
              try {
                const rotated = await sharp(finalImageBuffer)
                  .rotate(rotationDegrees, { background: theme && theme.background_color ? (theme.background_color.startsWith('#') ? theme.background_color : `#${theme.background_color}`) : '#ffffff' })
                  .jpeg({ quality: 100, progressive: true, mozjpeg: true })
                  .toBuffer()
                finalImageBuffer = rotated
                const anchoredX = photoX
                const anchoredY = cardY + (cardHeightPoints - themeY - outerHeightPt)
                vlog(`🧭 Pre-rotated (with padding). Drawing at intended size pt: ${Math.round(outerWidthPt)}x${Math.round(outerHeightPt)}; anchored at (${anchoredX}, ${anchoredY})`)
                const pdfImage = await pdfDoc.embedJpg(finalImageBuffer)
                page.drawImage(pdfImage, { x: anchoredX, y: anchoredY, width: outerWidthPt, height: outerHeightPt })
                continue
              } catch (rotErr) {
                vwarn('⚠️ Failed to pre-rotate image; falling back to PDF rotation:', rotErr)
              }
            }
            const pdfImage = await pdfDoc.embedJpg(finalImageBuffer)
            const drawOptions = { x: photoX, y: photoY, width: outerWidthPt, height: outerHeightPt }
            if (rotationDegrees !== 0) {
              // Add rotation - PDF library handles rotation around center automatically
              drawOptions.rotate = degrees(-rotationDegrees)
            }
            page.drawImage(pdfImage, drawOptions)
          }
        } catch (err) {}
      }

      // Process story if layout_config includes story area
      if (layoutConfig.story) {
        let story = aiStory || 'A special family story.'
        
        // Add padding around story text to prevent cutoff
        const storyPaddingMm = 8 // 8mm padding on all sides (increased from 4mm to prevent text cutoff)
        const storyPaddingPoints = storyPaddingMm * mmToPoints
        
        const storyX = cardX + (layoutConfig.story.position.x * mmToPoints) + storyPaddingPoints
        const storyY = cardY + (cardHeightPoints - (layoutConfig.story.position.y + layoutConfig.story.size.height) * mmToPoints) + storyPaddingPoints
        const storyWidth = (layoutConfig.story.size.width * mmToPoints) - (storyPaddingPoints * 2)
        const storyHeight = (layoutConfig.story.size.height * mmToPoints) - (storyPaddingPoints * 2)
        
        try {
          const pointsToPixels = 96 / 72
          const storyWidthPixels = Math.round(storyWidth * pointsToPixels)
          const storyHeightPixels = Math.round(storyHeight * pointsToPixels)
          
          // Ensure font color has # prefix for text rendering
          let fontColor = theme.body_font_color || '#2D1810'
          if (fontColor && !fontColor.startsWith('#')) {
            fontColor = '#' + fontColor
          }
          
          // Use theme's body font if available
          const fontFamily = theme.body_font || 'EB Garamond'
          
          console.log('📝 Story text rendering details:', {
            storyLength: story.length,
            storyWidthPixels,
            storyHeightPixels,
            storyPaddingMm,
            fontFamily,
            fontColor,
            effectiveWidth: storyWidthPixels - 40, // Account for text renderer padding
            effectiveHeight: storyHeightPixels - 40, // Account for text renderer padding
            aspectRatio: ((storyWidthPixels - 40) / (storyHeightPixels - 40)).toFixed(2),
            area: (storyWidthPixels - 40) * (storyHeightPixels - 40)
          })
          
          const storyTextBuffer = await renderTextToImage(story, storyWidthPixels, storyHeightPixels, { 
            color: fontColor,
            fontFamily: fontFamily,
            padding: 20 // Increased internal padding to prevent text cutoff (increased from 8)
            // Font size will be calculated dynamically based on available space
          })
          const storyTextImage = await pdfDoc.embedPng(storyTextBuffer)
          page.drawImage(storyTextImage, { x: storyX, y: storyY, width: storyWidth, height: storyHeight })
        } catch (textError) {
          page.drawText(story.substring(0, 200) + '...', { x: storyX + 10, y: storyY + storyHeight - 20, size: 12, color: rgb(0.2, 0.2, 0.2) })
        }
      }

      // Save and upload PDF
      await updatePdfStatus(supabase, book.id, user.id, '🎨 Theme PDF created!')
      
      // Use centralized function to save and upload file
      const pdfStorageUrl = await saveAndUploadFile(pdfDoc, book, user, supabase, config, effectivePrintSize, logger)
      
      // Update book status and return with comprehensive error checking
      console.log('🔧 CRITICAL: Updating book status to ready...')
      console.log('🔧 Book ID:', book.id)
      console.log('🔧 User ID:', user.id)
      
      try {
        const { data: updateData, error: updateError } = await supabase
          .from('memory_books')
          .update({ 
            status: 'ready', 
            generated_at: new Date().toISOString() 
          })
          .eq('id', book.id)
          .select()
        
        if (updateError) {
          console.error('❌ CRITICAL ERROR: Failed to update book status to ready:', updateError)
          console.error('❌ Error details:', {
            code: updateError.code,
            message: updateError.message,
            details: updateError.details,
            hint: updateError.hint
          })
          throw updateError
        } else {
          console.log('✅ SUCCESS: Book status updated to ready:', updateData)
        }
        
        // Verify the update worked
        const { data: verifyData, error: verifyError } = await supabase
          .from('memory_books')
          .select('status, pdf_url')
          .eq('id', book.id)
          .single()
        
        if (verifyError) {
          console.error('❌ CRITICAL ERROR: Failed to verify book status update:', verifyError)
        } else {
          console.log('✅ VERIFICATION: Book status is now:', verifyData.status)
          console.log('✅ VERIFICATION: Book pdf_url is:', verifyData.pdf_url)
        }
        
      } catch (statusError) {
        console.error('❌ CRITICAL EXCEPTION during book status update:', statusError)
        console.error('❌ Exception details:', {
          message: statusError.message,
          stack: statusError.stack
        })
        // Don't throw here - we still want to return the PDF even if status update fails
      }
      
      await updatePdfStatus(supabase, book.id, user.id, '🎨 Your themed memory is ready!')
      return { success: true, downloadUrl: pdfStorageUrl }
      } catch (themeError) {
        if (themeError.message === 'SWITCH_TO_GRID_LAYOUT') {
          console.log('🔄 Switching to grid layout due to photo count mismatch')
          book.layout_type = 'grid'
          // Continue with grid layout processing
        } else {
          throw themeError
        }
      }
    }
    
    // Load theme if specified for regular PDF generation
    let theme = null
    if (book.theme_id) {
      console.log('🎨 Loading theme for regular PDF generation:', book.theme_id)
      const { data: themeData, error: themeError } = await supabase
        .from('themes')
        .select('*')
        .eq('id', book.theme_id)
        .eq('deleted', false)
        .single()
      
      if (themeError || !themeData) {
        console.warn('⚠️ Theme not found for regular PDF generation:', themeError)
      } else {
        theme = themeData
        console.log('🎨 Theme loaded for regular PDF generation:', theme.name)
      }
    }
    
    // 4. Layout assets into pages (using grid_layout from book settings)
    const gridLayout = book.grid_layout || '2x2'
    
    // Calculate assets per page from grid layout
    let assetsPerPage
    switch (gridLayout) {
      case '1x1':
        assetsPerPage = 1
        break
      case '2x1':
        assetsPerPage = 2
        break
      case '2x2':
        assetsPerPage = 4
        break
      case '3x2':
        assetsPerPage = 6
        break
      case '3x3':
        assetsPerPage = 9
        break
      case '3x4':
        assetsPerPage = 12
        break
      case '4x4':
        assetsPerPage = 16
        break
      default:
        assetsPerPage = 4
    }
    
    // Get print size from request body or use defaults from book
    const body = await readBody(event).catch(() => ({}))
    const printSize = body.printSize || book.print_size || '8.5x11'
    
    console.log('📄 PDF generation parameters:', { printSize })
    
    // Calculate page dimensions based on print size
    let regularPageWidth, regularPageHeight
    switch (printSize) {
      case '7x5':
        regularPageWidth = 504 // 7x5 inches in points (7 * 72)
        regularPageHeight = 360 // 5 inches in points (5 * 72)
        break
      case '8x10':
        regularPageWidth = 595 // A4 width in points
        regularPageHeight = 842 // A4 height in points
        break
      case '11x14':
        regularPageWidth = 792 // 11x14 inches in points (11 * 72)
        regularPageHeight = 1008 // 14 inches in points (14 * 72)
        break
      case '12x12':
        regularPageWidth = 864 // 12x12 inches in points (12 * 72)
        regularPageHeight = 864 // 12 inches in points (12 * 72)
        break
      case '8.5x11':
        regularPageWidth = 612 // 8.5 inches in points (8.5 * 72)
        regularPageHeight = 792 // 11 inches in points (11 * 72)
        break
      case 'a4':
        regularPageWidth = 595 // A4 width in points
        regularPageHeight = 842 // A4 height in points
        break
      default:
        regularPageWidth = 595 // Default to A4
        regularPageHeight = 842
    }
    
    // Use assets with fingerprints for regular PDF generation
    const regularAssetsWithFingerprints = generateFingerprintsForAssets(assets)
    console.log('🔍 Generated fingerprints for regular PDF generation:', regularAssetsWithFingerprints.length, 'assets')
    
    // Calculate exactly how many pages we need for the assets, with a hard limit of 10 pages
    const calculatedPages = Math.ceil(regularAssetsWithFingerprints.length / assetsPerPage)
    const totalPages = Math.min(calculatedPages, 10)
    const totalPhotos = regularAssetsWithFingerprints.length
    
    console.log(`📄 Generating PDF with ${totalPages} pages for ${assets.length} assets (${assetsPerPage} assets per page, max 10 pages)`)
    
    if (calculatedPages > 10) {
      console.log(`⚠️ Warning: ${assets.length} assets would require ${calculatedPages} pages, but limiting to 10 pages`)
    }
    
    let processedPhotos = 0
    
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const pageNumStr = (pageIndex + 1) + (pageIndex === 0 ? 'st' : pageIndex === 1 ? 'nd' : pageIndex === 2 ? 'rd' : 'th')
      await updatePdfStatus(supabase, book.id, user.id, `Creating ${pageNumStr} page (${pageIndex + 1}/${totalPages})`)
      console.log(`📄 Creating page ${pageIndex + 1}/${totalPages}`)
      const startIndex = pageIndex * assetsPerPage
      const pageAssets = regularAssetsWithFingerprints.slice(startIndex, startIndex + assetsPerPage)
      
      // Add page to PDF with calculated dimensions
      const page = pdfDoc.addPage([regularPageWidth, regularPageHeight])
      const { width, height } = page.getSize()
      
      console.log(`📐 Page ${pageIndex + 1} dimensions: ${width}x${height} points (${(width/72).toFixed(2)}x${(height/72).toFixed(2)} inches)`)
      
      // Draw background (image or solid color) FIRST
      console.log('🎨 DRAWING BACKGROUND - Page dimensions:', { width, height })
      console.log('🎨 Background drawing check:', {
        background_type: book.background_type,
        background_color: book.background_color,
        has_background_color: !!book.background_color
      })
      
      if (book.background_type === 'solid' && book.background_color) {
        console.log('🎨 SOLID COLOR DRAWING - Starting solid color background application')
        try {
          // Draw solid color background
          const hexColor = book.background_color.replace('#', '')
          console.log('🎨 Hex color processing:', {
            original: book.background_color,
            without_hash: hexColor,
            hex_length: hexColor.length
          })
          
          // Validate hex color format
          if (!/^[0-9A-Fa-f]{6}$/.test(hexColor)) {
            console.warn(`⚠️ Invalid hex color format: ${book.background_color}, using default gray`)
            console.log('🎨 Using fallback gray color')
            // Use default gray color
            page.drawRectangle({
              x: 0,
              y: 0,
              width: width,
              height: height,
              color: rgb(0.9, 0.9, 0.9) // Light gray
            })
            console.log('🎨 Gray fallback rectangle drawn')
          } else {
            const r = parseInt(hexColor.substr(0, 2), 16) / 255
            const g = parseInt(hexColor.substr(2, 2), 16) / 255
            const b = parseInt(hexColor.substr(4, 2), 16) / 255
            
            console.log('🎨 RGB conversion successful:', {
              hex: hexColor,
              r: r,
              g: g,
              b: b,
              r_raw: parseInt(hexColor.substr(0, 2), 16),
              g_raw: parseInt(hexColor.substr(2, 2), 16),
              b_raw: parseInt(hexColor.substr(4, 2), 16)
            })
            
            console.log('🎨 Drawing solid color rectangle...')
            page.drawRectangle({
              x: 0,
              y: 0,
              width: width,
              height: height,
              color: rgb(r, g, b)
            })
            console.log(`🎨 SOLID BACKGROUND SUCCESS - Color applied: ${book.background_color} (RGB: ${r}, ${g}, ${b})`)
          }
        } catch (colorError) {
          console.error('❌ Error applying solid background color:', colorError)
          console.warn('⚠️ Using default white background due to color error')
          // Fallback to white background
          page.drawRectangle({
            x: 0,
            y: 0,
            width: width,
            height: height,
            color: rgb(1, 1, 1) // White
          })
        }
      } else if (pdfBgImage && book.background_type !== 'white') {
        console.log('🎨 BACKGROUND IMAGE - Drawing background image instead of solid color')
        // Draw background image, scaled to fill page, with opacity from database
        const bgScale = Math.max(width / pdfBgImage.width, height / pdfBgImage.height)
        const bgW = pdfBgImage.width * bgScale
        const bgH = pdfBgImage.height * bgScale
        const bgX = (width - bgW) / 2
        const bgY = (height - bgH) / 2
        // Safety feature: if opacity is 0, use 30% instead
        const backgroundOpacity = book.background_opacity || 30
        const opacity = (backgroundOpacity === 0 ? 30 : backgroundOpacity) / 100 // Convert percentage to decimal
        console.log('🎨 Background image details:', {
          imageSize: { width: pdfBgImage.width, height: pdfBgImage.height },
          scale: bgScale,
          scaledSize: { width: bgW, height: bgH },
          position: { x: bgX, y: bgY },
          opacity: opacity
        })
        page.drawImage(pdfBgImage, {
          x: bgX,
          y: bgY,
          width: bgW,
          height: bgH,
          opacity: opacity
        })
        console.log('🎨 Background image drawn successfully')
      } else {
        console.log('🎨 NO BACKGROUND - No background image or solid color to draw')
      }
      
      // Apply page border - use theme settings if available, otherwise use defaults
      const pageBorder = theme?.page_border || 0
      const pageBorderOffset = theme?.page_border_offset || 5
      console.log(`🔍 DEBUG - Regular PDF page border values: pageBorder=${pageBorder}px, pageBorderOffset=${pageBorderOffset}mm`)
      console.log(`🔍 DEBUG - Regular PDF page dimensions: width=${width}pts, height=${height}pts`)
      
      const borderMargin = pageBorder > 0 ? (pageBorderOffset * 72 / 25.4) : 9 // Convert mm to points, or use 9 points default
      
      // For solid backgrounds and magical backgrounds, use transparent fill to show the background
      // For white backgrounds, use white fill
      const borderFillColor = (book.background_type === 'solid' || book.background_type === 'magical') ? undefined : rgb(1, 1, 1)
      
      // Use theme border color if available, otherwise use black
      const borderColor = theme?.body_font_color ? 
        (() => {
          // Ensure border color has # prefix for parsing
          let bodyFontColor = theme.body_font_color
          if (bodyFontColor && !bodyFontColor.startsWith('#')) {
            bodyFontColor = '#' + bodyFontColor
          }
          console.log(`🔍 DEBUG - Regular PDF border color: ${bodyFontColor}`)
          
          const hexColor = bodyFontColor.replace('#', '')
          if (/^[0-9A-Fa-f]{6}$/.test(hexColor)) {
            const r = parseInt(hexColor.substr(0, 2), 16) / 255
            const g = parseInt(hexColor.substr(2, 2), 16) / 255
            const b = parseInt(hexColor.substr(4, 2), 16) / 255
            return rgb(r, g, b)
          }
          return rgb(0, 0, 0)
        })() : rgb(0, 0, 0)
      
      console.log('🖼️ BORDER DRAWING - Border configuration:', {
        background_type: book.background_type,
        borderFillColor: borderFillColor ? 'white' : 'transparent',
        borderMargin: borderMargin,
        borderWidth: pageBorder || 3,
        borderColor: theme?.body_font_color || 'black',
        theme_loaded: !!theme,
        pageBorder,
        pageBorderOffset
      })
      
      if (pageBorder > 0) {
        page.drawRectangle({
          x: borderMargin,
          y: borderMargin,
          width: width - 2 * borderMargin,
          height: height - 2 * borderMargin,
          borderColor: borderColor,
          borderWidth: pageBorder,
          color: borderFillColor
        })
        console.log(`🖼️ THEME BORDER DRAWN - Border drawn: ${borderMargin} points from edge, width: ${width - 2 * borderMargin}x${height - 2 * borderMargin}, border width: ${pageBorder}px`)
      } else {
        // Use default border
        page.drawRectangle({
          x: borderMargin,
          y: borderMargin,
          width: width - 2 * borderMargin,
          height: height - 2 * borderMargin,
          borderColor: rgb(0, 0, 0),
          borderWidth: 3, // Increased from 1 to 3 points for better visibility
          color: borderFillColor // transparent for solid backgrounds, white for others
        })
        console.log(`🖼️ DEFAULT BORDER DRAWN - Border drawn: ${borderMargin} points from edge, width: ${width - 2 * borderMargin}x${height - 2 * borderMargin}, fill: ${borderFillColor ? 'white' : 'transparent'}`)
      }
      
      // Margins
      const topMargin = 0 // no heading space needed
      const bottomMargin = 50 // for page number
      const gridYOffset = 0 // no offset needed since no title
      const availableHeight = height - gridYOffset - bottomMargin
      
      // Title removed for grid layout memory books
      
      // Calculate grid layout from grid layout string
      const [gridCols, gridRows] = gridLayout.split('x').map(Number)
      
      const cellWidth = width / gridCols
      const cellHeight = availableHeight / gridRows
      
      // Calculate grid margins to center the grid
      const gridMarginX = (width - (cellWidth * gridCols)) / 2
      const gridMarginY = (availableHeight - (cellHeight * gridRows)) / 2
      
      for (let i = 0; i < pageAssets.length; i++) {
        const asset = pageAssets[i]
        processedPhotos++
        const progressPercent = Math.round((processedPhotos / totalPhotos) * 100)
        await updatePdfStatus(supabase, book.id, user.id, `Savta is selecting photos for you... (${progressPercent}%)`)
        console.log(`🖼️ Processing asset ${i + 1}/${pageAssets.length}:`, asset.id, 'Type:', asset.type)
        const col = i % gridCols
        const row = Math.floor(i / gridCols)
        
        const x = gridMarginX + col * cellWidth + cellWidth * 0.1
        // Y is measured from the top, so subtract row*cellHeight from top
        const y = height - gridYOffset - gridMarginY - (row + 1) * cellHeight + cellHeight * 0.1
        const drawWidth = cellWidth * 0.8
        const drawHeight = cellHeight * 0.8
        
        if (asset.type === 'photo' && asset.storage_url) {
          try {
            console.log(`📸 Downloading image from storage URL:`, asset.storage_url)
            // Download the image from storage_url
            const imageRes = await fetch(asset.storage_url)
            if (!imageRes.ok) {
              console.error('❌ Failed to fetch image:', imageRes.status, imageRes.statusText)
              throw new Error(`Failed to fetch image: ${imageRes.status}`)
            }
            const imageBuffer = Buffer.from(await imageRes.arrayBuffer())
            console.log(`✅ Image downloaded, size:`, imageBuffer.length, 'bytes')
            
            // Process image orientation and shape
            const isJpg = asset.storage_url.endsWith('.jpg') || asset.storage_url.endsWith('.jpeg')
            const processedImageBuffer = await processImageOrientation(imageBuffer, isJpg ? 'jpeg' : 'jpeg')
            console.log(`🔄 After orientation processing, size:`, processedImageBuffer.length, 'bytes')
            
            // Get memory shape from book settings
            const memoryShape = book.memory_shape || 'original'
            console.log(`🎯 MEMORY SHAPE FOR THIS ASSET: ${memoryShape}`)
            console.log(`📋 Asset ID: ${asset.id}, Title: ${asset.title || 'No title'}`)
            
            // Process image shape if needed
            let finalImageBuffer = processedImageBuffer
            if (memoryShape !== 'original') {
              console.log(`🔄 SHAPE PROCESSING REQUIRED - Shape: ${memoryShape}`)
              // Calculate target dimensions for shape processing
              const targetWidth = Math.round(drawWidth * 2) // Higher resolution for better quality
              const targetHeight = Math.round(drawHeight * 2)
              console.log(`🔄 Processing shape: ${memoryShape} with dimensions: ${targetWidth}x${targetHeight}`)
              finalImageBuffer = await processImageShape(processedImageBuffer, memoryShape, targetWidth, targetHeight, asset.storage_url)
              console.log(`✅ Shape processing complete. Final buffer size: ${finalImageBuffer.length} bytes`)
            } else {
              console.log(`ℹ️ Using original aspect ratio (no shape processing) - Shape is: ${memoryShape}`)
            }
            
            let pdfImage
            if (memoryShape !== 'original' || isJpg) {
              console.log(`📄 Embedding JPG image (processed shape or JPG format)`)
              pdfImage = await pdfDoc.embedJpg(finalImageBuffer)
            } else {
              console.log(`📄 Embedding JPG image (original format)`)
              pdfImage = await pdfDoc.embedJpg(finalImageBuffer)
            }
            console.log(`✅ Image embedded in PDF with correct orientation`)
            
            // Get image dimensions
            const imgDims = pdfImage.scale(1)
            // Calculate scale to fit image inside cell (no cropping, no rotation)
            const scale = Math.min(drawWidth / imgDims.width, drawHeight / imgDims.height)
            const imgDisplayWidth = imgDims.width * scale
            const imgDisplayHeight = imgDims.height * scale
            // Center image in cell
            const imgX = x + (drawWidth - imgDisplayWidth) / 2
            const imgY = y + (drawHeight - imgDisplayHeight) / 2
            
            // Apply photo border if specified in theme
            const photoBorder = theme?.photo_border || 0
            if (photoBorder > 0) {
              console.log(`🖼️ Applying photo border: ${photoBorder}px`)
              // Draw border rectangle with theme body font color
              const borderColor = theme.body_font_color ? 
                (() => {
                  // Ensure border color has # prefix for parsing
                  let bodyFontColor = theme.body_font_color
                  if (bodyFontColor && !bodyFontColor.startsWith('#')) {
                    bodyFontColor = '#' + bodyFontColor
                  }
                  const hexColor = bodyFontColor.replace('#', '')
                  if (/^[0-9A-Fa-f]{6}$/.test(hexColor)) {
                    const r = parseInt(hexColor.substr(0, 2), 16) / 255
                    const g = parseInt(hexColor.substr(2, 2), 16) / 255
                    const b = parseInt(hexColor.substr(4, 2), 16) / 255
                    return rgb(r, g, b)
                  }
                  return rgb(0.2, 0.2, 0.2) // Dark gray fallback
                })() : rgb(0.2, 0.2, 0.2)
              
              // Convert pixels to points for PDF drawing (1 point = 1/72 inch, 1 pixel = 1/96 inch)
              const borderPoints = photoBorder * (72 / 96)
              
              page.drawRectangle({
                x: imgX - borderPoints,
                y: imgY - borderPoints,
                width: imgDisplayWidth + (borderPoints * 2),
                height: imgDisplayHeight + (borderPoints * 2),
                color: borderColor
              })
              
              // Draw the image with border offset
              page.drawImage(pdfImage, {
                x: imgX,
                y: imgY,
                width: imgDisplayWidth,
                height: imgDisplayHeight
              })
            } else {
              // Draw white border (4px) - default behavior
              page.drawRectangle({
                x: imgX - 2,
                y: imgY - 2,
                width: imgDisplayWidth + 4,
                height: imgDisplayHeight + 4,
                color: rgb(1, 1, 1)
              })
              // Draw the image
              page.drawImage(pdfImage, {
                x: imgX,
                y: imgY,
                width: imgDisplayWidth,
                height: imgDisplayHeight
              })
            }
            // Draw caption if available
            // Use user_caption if it's valid (not blank, not filename), otherwise use ai_caption
            let captionText = ''
            if (isValidCaption(asset.user_caption) && asset.user_caption !== asset.title) {
              captionText = asset.user_caption
            } else if (asset.ai_caption) {
              captionText = asset.ai_caption
            }
            
            if (captionText) {
              // Create caption image using sharp and SVG
              const maxCaptionHeight = Math.min(imgDisplayHeight * 0.4, 80); // Cap at 80px or 40% of photo height
              const captionWidth = Math.round(imgDisplayWidth * 0.9); // Use 90% of photo width
              console.log('Caption parameters:', { 
                captionText: captionText.substring(0, 50) + '...', 
                imgDisplayWidth, 
                imgDisplayHeight, 
                maxCaptionHeight,
                captionWidth
              });
              const captionImage = await createCaptionImage(captionText, captionWidth, maxCaptionHeight);
              
              if (captionImage) {
                // Embed the caption image into the PDF
                const pdfCaptionImage = await pdfDoc.embedPng(captionImage.buffer);
                
                // Position caption within the actual photo area, not the cell area
                // For shaped photos, this ensures the caption appears within the visible photo area
                const captionX = imgX + (imgDisplayWidth - captionImage.width) / 2;
                const captionY = imgY + 5; // 5px margin from bottom of actual photo
                
                // Add defensive logging to catch any NaN values
                console.log('Caption positioning (main):', { captionX, captionY, imgX, imgY, imgDisplayWidth, captionImageWidth: captionImage.width, captionImageHeight: captionImage.height });
                
                // Validate coordinates before drawing
                if (isNaN(captionX) || isNaN(captionY) || isNaN(captionImage.width) || isNaN(captionImage.height)) {
                  console.error('❌ Invalid caption coordinates (main):', { captionX, captionY, width: captionImage.width, height: captionImage.height });
                  throw new Error('Invalid caption coordinates in main section');
                }
                
                page.drawImage(pdfCaptionImage, {
                  x: captionX,
                  y: captionY,
                  width: captionImage.width,
                  height: captionImage.height
                });
              }
            }
          } catch (err) {
            console.error('❌ Failed to embed image for asset', asset.id, err)
            // Fallback: draw placeholder rectangle
            page.drawRectangle({
              x,
              y,
              width: drawWidth,
              height: drawHeight,
              color: rgb(0.9, 0.9, 0.9),
              borderColor: rgb(0.7, 0.7, 0.7),
              borderWidth: 1
            })
            page.drawText(`Photo: ${asset.id.slice(-6)}`, {
              x: x + 10,
              y: y + drawHeight / 2,
              size: 12,
              color: rgb(0.3, 0.3, 0.3)
            })
            // Draw caption if available (same logic as above)
            let captionText = ''
            if (isValidCaption(asset.user_caption) && asset.user_caption !== asset.title) {
              captionText = asset.user_caption
            } else if (asset.ai_caption) {
              captionText = asset.ai_caption
            }
            
            if (captionText) {
              // Define fallback dimensions for caption positioning
              const imgDisplayWidth = drawWidth * 0.8; // Use 80% of cell width
              const imgDisplayHeight = drawHeight * 0.8; // Use 80% of cell height
              const imgX = x + (drawWidth - imgDisplayWidth) / 2;
              const imgY = y + (drawHeight - imgDisplayHeight) / 2;
              
              // Create caption image using sharp and SVG
              const maxCaptionHeight = Math.min(imgDisplayHeight * 0.4, 80); // Cap at 80px or 40% of photo height
              const captionWidth = Math.round(imgDisplayWidth * 0.9); // Use 90% of photo width
              console.log('Caption parameters (fallback):', { 
                captionText: captionText.substring(0, 50) + '...', 
                imgDisplayWidth, 
                imgDisplayHeight, 
                maxCaptionHeight,
                captionWidth
              });
              const captionImage = await createCaptionImage(captionText, captionWidth, maxCaptionHeight);
              
              if (captionImage) {
                // Embed the caption image into the PDF
                const pdfCaptionImage = await pdfDoc.embedPng(captionImage.buffer);
                
                // Position caption within the actual photo area, not the cell area
                // For shaped photos, this ensures the caption appears within the visible photo area
                const captionX = imgX + (imgDisplayWidth - captionImage.width) / 2;
                const captionY = imgY + 5; // 5px margin from bottom of actual photo
                
                // Add defensive logging to catch any NaN values
                console.log('Caption positioning (fallback):', { captionX, captionY, imgX, imgY, imgDisplayWidth, captionImageWidth: captionImage.width, captionImageHeight: captionImage.height });
                
                // Validate coordinates before drawing
                if (isNaN(captionX) || isNaN(captionY) || isNaN(captionImage.width) || isNaN(captionImage.height)) {
                  console.error('❌ Invalid caption coordinates (fallback):', { captionX, captionY, width: captionImage.width, height: captionImage.height });
                  throw new Error('Invalid caption coordinates in fallback');
                }
                
                page.drawImage(pdfCaptionImage, {
                  x: captionX,
                  y: captionY,
                  width: captionImage.width,
                  height: captionImage.height
                });
              }
            }
          }
        } else if (asset.type === 'text') {
          console.log(`📝 Processing text asset:`, asset.id)
          // For text assets, draw the text content
          page.drawText((isValidCaption(asset.user_caption) ? asset.user_caption : null) || asset.ai_caption || 'Text content', {
            x: x + 10,
            y: y + drawHeight / 2,
            size: 12,
            color: rgb(0.2, 0.2, 0.2),
            maxWidth: drawWidth - 20
          })
        }
      }
      // Draw footer text on left side
      const currentDate = new Date()
      const dateString = currentDate.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      })
      page.drawText(`Crafted with magic and love on ${dateString}`, {
        x: 20,
        y: bottomMargin / 2,
        size: 10,
        color: rgb(0.5, 0.5, 0.5)
      })
      
      // Draw page number in reserved bottom margin (only if multiple pages)
      if (totalPages > 1) {
        page.drawText(`Page ${pageIndex + 1}`, {
          x: width - 80,
          y: bottomMargin / 2,
          size: 10,
          color: rgb(0.5, 0.5, 0.5)
        })
      }
    }
    
    await updatePdfStatus(supabase, book.id, user.id, 'Finalizing your memory ...')
    
    // 5. Save PDF and upload to Supabase Storage using centralized function
    const publicUrl = await saveAndUploadFile(pdfDoc, book, user, supabase, config, book.print_size || '7x5', logger)
    
    await updatePdfStatus(supabase, book.id, user.id, 'Working our magic ...')
    console.log('🎉 PDF generated and uploaded successfully')
    
    // Set a final status that the frontend can wait for
    await updatePdfStatus(supabase, book.id, user.id, 'PDF generation completed successfully')
    
    
    
    // Small delay to ensure database transaction is committed
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // ======= DEBUGGING SUMMARY LOG =======
    try {
      console.log('================ SAVTA PDF GENERATION SUMMARY ================')
      console.log('Book ID:', book.id)
      console.log('AI Supplemental Prompt:', book.ai_supplemental_prompt)
      console.log('Background type:', book.background_type)
      console.log('Background color:', book.background_color)
      if (typeof photoPool !== 'undefined') {
        console.log('Photo pool count:', Array.isArray(photoPool) ? photoPool.length : 'N/A')
        console.log('Photo pool IDs:', Array.isArray(photoPool) ? photoPool : 'N/A')
      }
      if (typeof allAssets !== 'undefined') {
        console.log('All assets count:', allAssets.length)
        console.log('All asset IDs:', allAssets.map(a => a.id))
      }
      if (typeof selectedAssets !== 'undefined') {
        console.log('Selected assets count (Savta picks):', selectedAssets.length)
        console.log('Selected asset IDs:', selectedAssets.map(a => a.id))
      }
      if (typeof searchWords !== 'undefined') {
        console.log('Savta picks search words:', searchWords)
      }
      if (typeof finalPrompt !== 'undefined') {
        console.log('Final AI prompt length:', finalPrompt.length)
      }
      if (typeof truncatedPhotoCount !== 'undefined' && truncatedPhotoCount > 0) {
        console.log(`⚠️ AI prompt was too long, reduced from ${selectedAssets.length + truncatedPhotoCount} to ${selectedAssets.length} photos`)
      }
      if (typeof fallbackResult !== 'undefined') {
        console.log('⚠️ Fallback result used:', fallbackResult)
      }
      // Add number of photos returned by the AI
      if (typeof magicData !== 'undefined' && magicData.selected_photo_numbers) {
        console.log('Number of photos returned by AI:', magicData.selected_photo_numbers.length)
        console.log('AI selected photo numbers:', magicData.selected_photo_numbers)
      }
      console.log('================ END SAVTA PDF GENERATION SUMMARY ================')
    } catch (summaryLogError) {
      console.warn('⚠️ Error in summary log:', summaryLogError)
    }
    // ... existing code ...
    
          // Log final summary
      logger.success('PDF generation completed successfully')
      await updatePdfStatus(supabase, book.id, user.id, 'completed')
    logger.summary()
    
    // Immediately clean up and update book status (no delays)
    await supabase.from('pdf_status').delete().eq('book_id', book.id).eq('user_id', user.id)
    
    try {
      // Now update the book status to ready immediately
      console.log('🔧 CRITICAL: Starting final status update for book:', book.id)
      console.log('🔧 Book format:', book.format)
      
      // Ensure the book has the required fields before updating status to ready
      const updateData = { status: 'ready' }
      
      // For card format, ensure magic_story is set
      if (book.format === 'card' && (!book.magic_story || book.magic_story === '')) {
        updateData.magic_story = 'A beautiful memory created with love'
      }
      
      // For book format, ensure magic_story is set if missing
      if (book.format === 'book' && (!book.magic_story || book.magic_story === '')) {
        updateData.magic_story = 'A beautiful memory book created with love'
      }
      
      // Ensure created_from_assets is set
      if (!book.created_from_assets || book.created_from_assets.length === 0) {
        updateData.created_from_assets = selectedAssets.map(asset => asset.id)
      }
      
      console.log('🔧 CRITICAL: About to update book status with data:', updateData)
      
      const { data: finalUpdateData, error: finalUpdateError } = await supabase
        .from('memory_books')
        .update(updateData)
        .eq('id', book.id)
        .select()
      
      if (finalUpdateError) {
        console.error('❌ Error updating book status to ready:', finalUpdateError)
      } else {
        console.log('SUCCESS: Book status updated to ready:', finalUpdateData)
      }
    } catch (statusUpdateError) {
      console.error('❌ Exception during status update:', statusUpdateError)
    }
    
    logger.success('📄 STEP 6: PDF CREATION - ✅ COMPLETED - PDF generated successfully')
    logger.step('🎉 PDF GENERATION PROCESS - ✅ COMPLETED SUCCESSFULLY')
    
    return {
      success: true,
      downloadUrl: publicUrl,
      message: 'PDF generated successfully'
    }
  } catch (error) {
    console.error('❌ PDF GENERATION PROCESS - FAILED', error.message)
    console.error('📊 Error details', {
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to generate PDF',
      stack: error.stack
    })
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to generate PDF'
    })
  }
})

async function updatePdfStatus(supabase, bookId, userId, status) {
  try {
    const { data, error } = await supabase.from('pdf_status').upsert({
      book_id: bookId,
      user_id: userId,
      status,
      updated_at: new Date().toISOString()
    }, { onConflict: ['book_id', 'user_id'] })
    
    if (error) {
      console.error('❌ PDF status update error:', error)
    }
  } catch (error) {
    // PDF status table might not exist yet, continuing without status updates
  }
} 



 