// PDF generation endpoint
// Generates PDF using pre-generated background

import { PDFDocument, rgb } from 'pdf-lib'
import sharp from 'sharp'

import { generateFingerprintsForAssets } from '../../../utils/generate-fingerprint.js'
import { renderTextToImage, getPdfFallbackConfig, createCaptionImage } from '../../../utils/text-renderer.js'
import { enhanceImage } from '../../../utils/image-enhancer.js'

// Centralized function to save and upload PDF/PNG files
async function saveAndUploadFile(pdfDoc, book, user, supabase) {
  console.log('💾 Saving PDF to buffer...')
  const pdfBytes = await pdfDoc.save()
  console.log('✅ PDF saved, size:', pdfBytes.length, 'bytes')
  
  // Check if we should convert to PNG based on output field
  const shouldConvertToPng = book.output && (book.output.toLowerCase() === 'png')
  console.log(`🔍 Output field check: ${book.output} (convert to PNG: ${shouldConvertToPng})`)
  
  let finalBytes = pdfBytes
  let contentType = 'application/pdf'
  let fileExtension = 'pdf'
  let fileName = `${user.id}/memory_book/pdfs/${book.id}_${Date.now()}.pdf`
  
  if (shouldConvertToPng) {
    try {
      console.log('🔄 Checking PDF page count for PNG conversion...')
      
      // Load the PDF to check page count
      const pdfDocForCheck = await PDFDocument.load(pdfBytes)
      const pageCount = pdfDocForCheck.getPageCount()
      console.log(`📄 PDF has ${pageCount} page(s)`)
      
      if (pageCount === 1) {
        console.log('✅ Single page PDF detected, converting to PNG...')
        
        // Convert PDF to PNG using Sharp
        const pngBuffer = await sharp(pdfBytes, { density: 300 })
          .png()
          .toBuffer()
        
        console.log('✅ PDF converted to PNG successfully')
        console.log(`📊 PNG size: ${pngBuffer.length} bytes`)
        
        finalBytes = pngBuffer
        contentType = 'image/png'
        fileExtension = 'png'
        fileName = `${user.id}/memory_book/pdfs/${book.id}_${Date.now()}.png`
        
        console.log('🖼️ Will upload PNG instead of PDF')
      } else {
        console.log(`⚠️ PDF has ${pageCount} pages, keeping as PDF (PNG conversion only for single-page documents)`)
        // Show message to user about multi-page PDF
        await updatePdfStatus(supabase, book.id, user.id, `PDF has ${pageCount} pages - keeping as PDF (PNG conversion only available for single-page documents)`)
      }
    } catch (conversionError) {
      console.warn('⚠️ PNG conversion failed, keeping as PDF:', conversionError.message)
      await updatePdfStatus(supabase, book.id, user.id, 'PNG conversion failed - keeping as PDF')
    }
  }
  
  const timestamp = Date.now()
  
  // Delete old PDF files if they exist (try both old and new patterns)
  console.log('🗑️ Deleting old PDF files...')
  try {
    // List files in the PDF directory to find old files
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
          console.warn('⚠️ Failed to delete old PDF files:', deleteError.message)
        } else {
          console.log('✅ Old PDF files deleted successfully:', filesToDelete.length, 'files')
        }
      } else {
        console.log('ℹ️ No old PDF files found to delete')
      }
    }
  } catch (error) {
    console.warn('⚠️ Error deleting old PDF files:', error.message)
  }
  
  await updatePdfStatus(supabase, book.id, user.id, `Uploading ${fileExtension.toUpperCase()} to cloud storage...`)
  console.log(`📤 Uploading ${fileExtension.toUpperCase()} to Supabase Storage:`, fileName)
  
  // Upload to Supabase Storage (using assets bucket with memory_book subdirectory)
  const { data: uploadData, error: uploadError } = await supabase.storage.from('assets').upload(fileName, finalBytes, {
    contentType: contentType,
    upsert: true
  })
  
  if (uploadError) {
    console.error(`❌ Failed to upload ${fileExtension.toUpperCase()} to storage:`, uploadError)
    throw new Error(`Failed to upload ${fileExtension.toUpperCase()} to storage: ` + uploadError.message)
  }
  console.log(`✅ ${fileExtension.toUpperCase()} uploaded to storage successfully:`, uploadData)
  
  // Get public URL
  await updatePdfStatus(supabase, book.id, user.id, 'Generating download link...')
  console.log('🔗 Getting public URL for uploaded file...')
  const { data: publicUrlData } = supabase.storage.from('assets').getPublicUrl(fileName)
  const publicUrl = publicUrlData?.publicUrl
  if (!publicUrl) {
    console.error(`❌ Failed to get public URL for ${fileExtension.toUpperCase()}`)
    throw new Error(`Failed to get public URL for ${fileExtension.toUpperCase()}`)
  }
  console.log('✅ Public URL generated:', publicUrl)
  
  // Update the book with the public URL
  await updatePdfStatus(supabase, book.id, user.id, 'Saving file link to database...')
  console.log('📝 Updating memory book with file URL...')
  const { data: updateData, error: updateError } = await supabase
    .from('memory_books')
    .update({ 
      pdf_url: publicUrl
    })
    .eq('id', book.id)
    .select()
  
  if (updateError) {
    console.error('❌ Error updating book with file URL:', updateError)
    // Don't throw here, as the file was successfully uploaded
  } else {
    console.log('✅ Memory book updated with file URL successfully')
  }
  
  return publicUrl
}

export default defineEventHandler(async (event) => {
  try {
    console.log('📄 Starting PDF generation endpoint')
    const config = useRuntimeConfig()
    const { createClient } = await import('@supabase/supabase-js')
    
    // Use the service role key for server-side operations
    console.log('🔧 Creating Supabase client with service role')
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey || config.public.supabaseKey
    )
    
    // Get the book ID from the URL
    const bookId = getRouterParam(event, 'id')
    console.log('📖 Book ID from URL:', bookId)
    
    if (!bookId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Book ID is required'
      })
    }
    
    // Get user from auth token
    console.log('🔐 Getting user from auth token')
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }
    
    const token = authHeader.replace('Bearer ', '')
    console.log('🔑 Token extracted, getting user...')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('❌ Auth error:', authError)
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }
    console.log('✅ User authenticated:', user.id)
    
    // Verify the memory book exists and belongs to the user
    console.log('📚 Fetching memory book from database...')
    let { data: book, error: bookError } = await supabase
      .from('memory_books')
      .select('*')
      .eq('id', bookId)
      .eq('user_id', user.id)
      .single()
    
    if (bookError || !book) {
      console.error('❌ Book error:', bookError)
      throw createError({
        statusCode: 404,
        statusMessage: 'Memory book not found'
      })
    }
    console.log('✅ Memory book found:', book.id, 'Status:', book.status)
    
    console.log('📚 BOOK DATA - Memory book loaded:', {
      id: book.id,
      title: book.title,
      background_type: book.background_type,
      background_color: book.background_color,
      background_url: book.background_url ? 'exists' : 'none',
      layout_type: book.layout_type,
      memory_shape: book.memory_shape,
      status: book.status,
      photo_selection_pool_count: book.photo_selection_pool?.length || 0,
      created_from_assets_count: book.created_from_assets?.length || 0,
      theme_id: book.theme_id || 'none'
    })
    
    // Check if this is a magic memory book
    if (book.layout_type === 'magic') {
      console.log('✨ Magic memory detected, generating a new magic story for regeneration')
      
      // Load theme if specified for magic memory
      let theme = null
      if (book.theme_id) {
        console.log('🎨 Loading theme for magic memory:', book.theme_id)
        const { data: themeData, error: themeError } = await supabase
          .from('themes')
          .select('*')
          .eq('id', book.theme_id)
          .eq('deleted', false)
          .single()
        
        if (themeError || !themeData) {
          console.warn('⚠️ Theme not found for magic memory:', themeError)
        } else {
          theme = themeData
          console.log('🎨 Theme loaded for magic memory:', theme.name)
        }
      }
      
      // Update status for magic story generation
      await updatePdfStatus(supabase, book.id, user.id, '✨ Crafting your magical story... ✨')
      
      // Fetch the photos from the user's selection pool
      // Always use photo_selection_pool if available, even for regeneration
      // Only fall back to created_from_assets if photo_selection_pool is completely empty
      const photoPool = book.photo_selection_pool && book.photo_selection_pool.length > 0 
        ? book.photo_selection_pool 
        : book.created_from_assets || []
      
      // Log photo selection pool details
      console.log('📸 PHOTO SELECTION POOL DEBUG:')
      console.log(`   - photo_selection_pool count: ${book.photo_selection_pool?.length || 0}`)
      console.log(`   - created_from_assets count: ${book.created_from_assets?.length || 0}`)
      console.log(`   - Final photoPool count: ${photoPool.length}`)
      console.log(`   - Using photo_selection_pool: ${book.photo_selection_pool && book.photo_selection_pool.length > 0}`)
      console.log(`   - Fallback to created_from_assets: ${!book.photo_selection_pool || book.photo_selection_pool.length === 0}`)
      
      // Update status for photo selection
      await updatePdfStatus(supabase, book.id, user.id, 'Savta is selecting photos for you...')
      
      console.log('📸 Fetching photos from user selection pool...')
      console.log('Photo pool to use:', photoPool)
      
      const { data: allAssets, error: assetsError } = await supabase
        .from('assets')
        .select('*')
        .in('id', photoPool)
        .eq('approved', true)
        .eq('deleted', false)

      if (assetsError || !allAssets || allAssets.length === 0) {
        console.error('❌ No photos found in selection pool:', photoPool)
        throw new Error('Failed to fetch photos from selection pool for magic memory regeneration')
      }

      // Implement "Savta picks" logic to intelligently select photos
      console.log('🔍 Implementing Savta picks logic for photo selection...')
      let selectedAssets = allAssets
      
      // If we have a title, try to match it against tags, locations, and people
      if (book.title && book.title.trim()) {
        const userInput = book.title.toLowerCase().trim()
        console.log('🔍 User input for photo matching:', userInput)
        
        // Split the input into search words
        const searchWords = userInput.split(/\s+/).filter(word => word.length > 2)
        console.log('🔍 Search words:', searchWords)
        
        if (searchWords.length > 0) {
          // Find assets that match any of the search words
          const matchingAssets = allAssets.filter(asset => {
            // Check tags
            const assetTags = (asset.tags || []).map(tag => tag.toLowerCase())
            const tagMatch = searchWords.some(word => 
              assetTags.some(tag => tag.includes(word) || word.includes(tag))
            )
            
            // Check locations
            const locationMatch = searchWords.some(word => {
              const locations = [
                asset.city?.toLowerCase(),
                asset.state?.toLowerCase(),
                asset.country?.toLowerCase()
              ].filter(Boolean)
              return locations.some(loc => loc.includes(word) || word.includes(loc))
            })
            
            // Check people
            const peopleMatch = searchWords.some(word => {
              const people = (asset.people_detected || []).map(person => person.toLowerCase())
              return people.some(person => person.includes(word) || word.includes(person))
            })
            
            // Check captions
            const captionMatch = searchWords.some(word => {
              const caption = (asset.ai_caption || '').toLowerCase()
              return caption.includes(word)
            })
            
            return tagMatch || locationMatch || peopleMatch || captionMatch
          })
          
          console.log('🔍 Matching assets found:', matchingAssets.length)
          
          if (matchingAssets.length > 0) {
            const sortedMatchingAssets = matchingAssets
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            
            // Check if we have fewer than 10 total images available
            if (allAssets.length < 10) {
              console.log(`🔍 Only ${allAssets.length} total images available, returning all images`)
              selectedAssets = allAssets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            } else if (sortedMatchingAssets.length < 10) {
              console.log(`🔍 Only ${sortedMatchingAssets.length} matching photos found, supplementing with recent photos to reach minimum of 10`)
              
              const allAssetsSorted = allAssets
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              
              const nonMatchingAssets = allAssetsSorted.filter(asset => 
                !sortedMatchingAssets.some(matchingAsset => matchingAsset.id === asset.id)
              )
              
              const additionalNeeded = 10 - sortedMatchingAssets.length
              const additionalAssets = nonMatchingAssets.slice(0, additionalNeeded)
              
              selectedAssets = [...sortedMatchingAssets, ...additionalAssets]
              
              console.log(`🔍 Savta picks - selected ${sortedMatchingAssets.length} matching photos + ${additionalAssets.length} recent photos = ${selectedAssets.length} total`)
            } else {
              // We have 10 or more matching photos, take top 25
              selectedAssets = sortedMatchingAssets.slice(0, 25)
              console.log('🔍 Savta picks - selected 25 most recent matching photos')
            }
          } else {
            // Check if we have fewer than 10 total images available
            if (allAssets.length < 10) {
              console.log(`🔍 No matches found, but only ${allAssets.length} total images available, returning all images`)
              selectedAssets = allAssets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            } else {
              console.log('🔍 No matches found, falling back to most recent 25 photos')
              selectedAssets = allAssets
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 25)
            }
          }
        } else {
          console.log('🔍 No meaningful search words, using most recent 25 photos')
          selectedAssets = allAssets
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 25)
        }
      } else {
        console.log('🔍 No user input, using most recent 25 photos')
        selectedAssets = allAssets
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 25)
      }
      
      // Final check: if we have fewer than 10 total images, return all of them
      if (selectedAssets.length < 10) {
        console.log(`🔍 Final check: Only ${selectedAssets.length} total images available, returning all images`)
        selectedAssets = allAssets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      }
      
      console.log('🔍 Savta picks method - final selected assets count:', selectedAssets.length)
      console.log('🔍 First 5 asset IDs:', selectedAssets.slice(0, 5).map(a => a.id))
      
      const assets = selectedAssets

      console.log(`📸 Photo pool: ${assets.length} assets, ${book.created_from_assets?.length || 0} selected`)

      // Generate fingerprints for the selected assets
      const assetsWithFingerprints = generateFingerprintsForAssets(assets)

      // Convert assets to photos format expected by magic-memory endpoint
      const photos = assetsWithFingerprints.map(asset => ({
        id: asset.id,
        width: asset.width,
        height: asset.height,
        orientation: asset.orientation,
        ai_caption: asset.ai_caption || '',
        people_detected: asset.people_detected || [],
        tags: asset.tags || [],
        user_tags: asset.user_tags || [],
        city: asset.city || null,
        state: asset.state || null,
        country: asset.country || null,
        zip_code: asset.zip_code || null,
        asset_date: asset.asset_date || null,
        fingerprint: asset.fingerprint
      }))

      // Determine photo count based on the user's selection (1, 4, or 6 photos)
      // This follows the original pipeline: user selects pool, AI selects best ones from pool
      const photoCount = Math.min(assets.length, 4) // Default to 4, but could be 1 or 6 based on user preference

      // Log final selected assets before sending to AI
      console.log('🤖 AI CALL DEBUG - Before sending to magic-memory API:')
      console.log(`   - Final selected assets count: ${selectedAssets.length}`)
      console.log(`   - Photo count to send to AI: ${photoCount}`)
      console.log(`   - First 3 asset IDs: ${selectedAssets.slice(0, 3).map(a => a.id).join(', ')}`)
      console.log(`   - Book title: "${book.title}"`)
      console.log(`   - Theme ID: ${book.theme_id || 'none'}`)
      
      // Always generate a new magic story for magic memory books
      const magicRes = await fetch(`${config.public.siteUrl}/api/ai/magic-memory`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            photos: photos,
            title: book.title,
            memory_event: book.memory_event,
            theme: book.theme_id || null,
            photo_count: photoCount,
            background_type: book.background_type || 'white',
            background_color: book.background_color
          })
        })
      if (!magicRes.ok) {
        console.error('❌ Magic memory generation failed:', magicRes.status)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to generate magic memory'
        })
      }
      const magicData = await magicRes.json()
      // Update the book with the new magic story and selected photos
      const { error: updateError } = await supabase
        .from('memory_books')
        .update({ 
          magic_story: magicData.story,
          created_from_assets: magicData.selected_photo_ids
        })
        .eq('id', book.id)
      if (updateError) {
        console.error('❌ Failed to update book with magic story and selected photos:', updateError)
      } else {
        console.log('✨ Magic story and selected photos updated successfully')
        console.log('Selected photo IDs:', magicData.selected_photo_ids)
      }
      
      // Refresh the book object to get the updated magic_story
      const { data: updatedBook, error: refreshError } = await supabase
        .from('memory_books')
        .select('*')
        .eq('id', book.id)
        .single()
      
      if (refreshError) {
        console.error('❌ Failed to refresh book object:', refreshError)
      } else {
        console.log('✅ Book object refreshed with new magic story')
        book = updatedBook // Update the book object with the new data
      }
      
      // Continue with standard PDF generation but with magic layout
      console.log('✨ Proceeding with magic memory PDF creation')
    }

    // Check if the book has background ready
    if (book.status !== 'background_ready' && book.status !== 'ready' && book.status !== 'draft') {
      console.log('❌ Book not ready for PDF generation, status:', book.status)
      throw createError({
        statusCode: 400,
        statusMessage: 'Memory book background is not ready'
      })
    }

    // If pdf_url exists, return it directly (fast download)
    if (book.pdf_url && book.pdf_url.startsWith('https://')) {
      console.log('✅ PDF URL available for download, returning:', book.pdf_url)
      return {
        success: true,
        downloadUrl: book.pdf_url
      }
    }

    console.log('🔄 PDF URL not found, generating new PDF...')
    
    // Update status - use magic-specific messages for magic books
    const statusMessage = book.layout_type === 'magic' ? 'Gathering your magical memories...' : 'Retrieving your memories...'
    await updatePdfStatus(supabase, book.id, user.id, statusMessage)
    
    // 1. Fetch approved assets for this book
    console.log('📸 Fetching assets for book:', book.created_from_assets)
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('*')
      .in('id', book.created_from_assets || [])
      .eq('approved', true)
      .eq('deleted', false)

    if (assetsError) {
      console.error('❌ Error fetching assets:', assetsError)
      throw new Error(`Failed to fetch assets: ${assetsError.message}`)
    }

    console.log('✅ Found assets:', assets?.length || 0)

    if (!assets || assets.length === 0) {
      throw new Error('No approved assets found for this book')
    }

    // Generate fingerprints for assets to help AI avoid duplicates
    const assetsWithFingerprints = generateFingerprintsForAssets(assets)
    console.log('🔍 Generated fingerprints for', assetsWithFingerprints.length, 'assets')

    // 2. Get the background image from storage
    console.log('🎨 Loading background image from storage...')

    // Check background_type first to determine if we need to show background generation message
    console.log('🔍 Background type check:', {
      background_type: book.background_type,
      background_color: book.background_color,
      background_url: book.background_url ? 'exists' : 'none'
    })
    
    let backgroundBuffer
    
    if (book.background_type === 'solid') {
      // Handle solid color background - no background image needed, skip background generation message
      console.log('🎨 SOLID COLOR SELECTED - Using solid color background:', book.background_color)
      console.log('🎨 Background color details:', {
        raw: book.background_color,
        type: typeof book.background_color,
        length: book.background_color ? book.background_color.length : 0
      })
      await updatePdfStatus(supabase, book.id, user.id, 'Applying solid color background...')
      // No background buffer needed for solid color - will be applied directly in PDF
      backgroundBuffer = null
      console.log('🎨 Set backgroundBuffer to null for solid color')
    } else if (book.background_type === 'magical') {
      // Generate background for magical background type
      console.log('🎨 Generating magical background...')
      // Update status - use magic-specific messages for magic books
      const bgStatusMessage = book.layout_type === 'magic' ? 'Retrieving magical background...' : 'Retrieving background image...'
      await updatePdfStatus(supabase, book.id, user.id, bgStatusMessage)
      await updatePdfStatus(supabase, book.id, user.id, 'Creating magical background...')
      
      try {
        const bgGenRes = await fetch(`${config.public.siteUrl}/api/memory-books/generate-background/${book.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!bgGenRes.ok) {
          console.error('❌ Background generation failed:', bgGenRes.status)
          throw new Error(`Background generation failed: ${bgGenRes.status}`)
        }
        
        const bgGenData = await bgGenRes.json()
        console.log('✅ Background generated successfully:', bgGenData.backgroundUrl)
        
        // Download the newly generated background
        console.log('⬇️ Downloading newly generated background...')
        const bgRes = await fetch(bgGenData.backgroundUrl)
        if (!bgRes.ok) {
          console.error('❌ Failed to fetch generated background:', bgRes.status, bgRes.statusText)
          throw new Error(`Failed to fetch generated background: ${bgRes.status}`)
        }
        backgroundBuffer = Buffer.from(await bgRes.arrayBuffer())
        console.log('✅ Generated background downloaded, size:', backgroundBuffer.length, 'bytes')
        
        // Update the book with the new background URL
        const { error: updateError } = await supabase
          .from('memory_books')
          .update({ background_url: bgGenData.backgroundUrl })
          .eq('id', book.id)
        
        if (updateError) {
          console.error('❌ Failed to update book with background URL:', updateError)
        } else {
          console.log('✅ Book updated with new background URL')
        }
      } catch (bgError) {
        console.error('❌ Background generation error:', bgError)
        console.warn('⚠️ Proceeding with white background due to generation failure')
        // Continue with white background if generation fails
        backgroundBuffer = null
      }
    } else if (book.background_url && book.background_type !== 'solid') {
      // Download existing background from storage (for magical or other types)
      console.log('⬇️ Downloading background from storage:', book.background_url)
      // Update status - use magic-specific messages for magic books
      const bgStatusMessage = book.layout_type === 'magic' ? 'Retrieving magical background...' : 'Retrieving background image...'
      await updatePdfStatus(supabase, book.id, user.id, bgStatusMessage)
      const bgRes = await fetch(book.background_url)
      if (!bgRes.ok) {
        console.error('❌ Failed to fetch background:', bgRes.status, bgRes.statusText)
        throw new Error(`Failed to fetch background: ${bgRes.status}`)
      }
      backgroundBuffer = Buffer.from(await bgRes.arrayBuffer())
      console.log('✅ Background downloaded, size:', backgroundBuffer.length, 'bytes')
    } else {
      console.log('ℹ️ No background URL found and background_type is white, proceeding with white background.')
      // For white background, skip background generation message since no generation is needed
      // Continue without throwing; background will be white
      backgroundBuffer = null
    }
    
    // 3. Create PDF document
    console.log('📄 Creating PDF document...')
    const pdfDoc = await PDFDocument.create()
    let pdfBgImage = null
    if (backgroundBuffer) {
      pdfBgImage = await pdfDoc.embedPng(backgroundBuffer)
      console.log('✅ PDF document created with background image')
    } else {
      console.log('✅ PDF document created with blank background')
    }
    
    // Helper function to process image orientation
    async function processImageOrientation(imageBuffer, format) {
      try {
        console.log(`🔄 Processing image orientation for ${format} image...`)
        const processedImage = await sharp(imageBuffer)
          .rotate() // Auto-rotate based on EXIF orientation
          .toFormat(format === 'png' ? 'png' : 'jpeg')
          .toBuffer()
        console.log(`✅ Image orientation processed successfully`)
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
    async function smartCropImage(imageBuffer, targetWidth, targetHeight, storageUrl = null) {
      try {
        console.log('🧠 Performing OpenAI face detection crop...')
        console.log(`📏 Target dimensions: ${targetWidth}x${targetHeight}`)
        
        // Get image metadata to determine orientation
        const metadata = await sharp(imageBuffer).metadata()
        const isPortrait = metadata.height > metadata.width
        const isLandscape = metadata.width > metadata.height
        
        // Handle EXIF orientation to prevent automatic rotation
        let processedImageBuffer = imageBuffer
        if (metadata.orientation && metadata.orientation !== 1) {
          console.log(`🔄 Correcting EXIF orientation: ${metadata.orientation}`)
          // Create a new Sharp instance that will handle the orientation
          const sharpInstance = sharp(imageBuffer)
          
          // Apply the correct rotation based on EXIF orientation
          switch (metadata.orientation) {
            case 3: // 180 degrees
              processedImageBuffer = await sharpInstance.rotate(180).toBuffer()
              break
            case 6: // 90 degrees clockwise
              processedImageBuffer = await sharpInstance.rotate(90).toBuffer()
              break
            case 8: // 90 degrees counter-clockwise
              processedImageBuffer = await sharpInstance.rotate(-90).toBuffer()
              break
            default:
              // For other orientations, let Sharp handle it
              processedImageBuffer = await sharpInstance.withMetadata().toBuffer()
          }
          
          // Get updated metadata after rotation
          const updatedMetadata = await sharp(processedImageBuffer).metadata()
          console.log(`📐 Updated dimensions after orientation correction: ${updatedMetadata.width}x${updatedMetadata.height}`)
        }
        
        console.log(`📐 Image orientation: ${isPortrait ? 'Portrait' : isLandscape ? 'Landscape' : 'Square'}`)
        console.log(`📏 Original dimensions: ${metadata.width}x${metadata.height}`)
        
        // Use the processed image buffer for all operations
        const workingImageBuffer = processedImageBuffer || imageBuffer
        const workingMetadata = await sharp(workingImageBuffer).metadata()
        
        // Try OpenAI face detection first
        let faces = []
        if (storageUrl) {
          try {
            console.log('🔍 Using OpenAI face detection with storage URL:', storageUrl)
            
            // Call our face detection endpoint
            const faceRes = await fetch(`${config.public.siteUrl}/api/ai/detect-faces`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                imageUrl: storageUrl
              })
            })
            
            if (faceRes.ok) {
              const faceData = await faceRes.json()
              faces = faceData.faces || []
              console.log(`👥 OpenAI detected ${faces.length} faces`)
        } else {
              console.warn('⚠️ OpenAI face detection failed, using fallback')
            }
          } catch (faceError) {
            console.warn('⚠️ OpenAI face detection error:', faceError.message)
          }
        } else {
          console.log('⚠️ No storage URL provided, using fallback')
        }
        
        let cropArea = null
        
        if (faces.length > 0) {
          // Calculate crop area that includes all detected faces
          let minX = 100
          let minY = 100
          let maxX = 0
          let maxY = 0
          
          faces.forEach(face => {
            const x = face.x / 100 * workingMetadata.width
            const y = face.y / 100 * workingMetadata.height
            const width = face.width / 100 * workingMetadata.width
            const height = face.height / 100 * workingMetadata.height
            
            minX = Math.min(minX, x - width / 2)
            minY = Math.min(minY, y - height / 2)
            maxX = Math.max(maxX, x + width / 2)
            maxY = Math.max(maxY, y + height / 2)
          })
          
          // Add padding around faces (30% of face area)
          const faceWidth = maxX - minX
          const faceHeight = maxY - minY
          const paddingX = faceWidth * 0.3
          const paddingY = faceHeight * 0.3
          
          minX = Math.max(0, minX - paddingX)
          minY = Math.max(0, minY - paddingY)
          maxX = Math.min(workingMetadata.width, maxX + paddingX)
          maxY = Math.min(workingMetadata.height, maxY + paddingY)
          
          // Calculate the largest possible crop area that maintains target aspect ratio
          // Start with the face bounding box and expand to maximize area
          const targetAspectRatio = targetWidth / targetHeight
          const currentWidth = maxX - minX
          const currentHeight = maxY - minY
          
          console.log('🎯 Face detection crop calculation:', {
            targetAspectRatio: targetAspectRatio.toFixed(3),
            currentWidth: currentWidth.toFixed(1),
            currentHeight: currentHeight.toFixed(1),
            minX: minX.toFixed(1),
            minY: minY.toFixed(1),
            maxX: maxX.toFixed(1),
            maxY: maxY.toFixed(1)
          })
          
          // Calculate the maximum possible crop area that includes all faces
          let finalWidth, finalHeight
          let finalX, finalY
          
          if (isLandscape) {
            // For landscape, prioritize using full width when possible
            // Start with the full width and calculate height
            finalWidth = workingMetadata.width
            finalHeight = finalWidth / targetAspectRatio
            
            // If height exceeds image bounds, reduce width
            if (finalHeight > workingMetadata.height) {
              finalHeight = workingMetadata.height
              finalWidth = finalHeight * targetAspectRatio
            }
            
            // Center the crop horizontally, but ensure faces are included
            const centerX = Math.floor((workingMetadata.width - finalWidth) / 2)
            finalX = Math.max(0, Math.min(centerX, minX))
            
            // Ensure the crop includes all faces
            if (finalX + finalWidth < maxX) {
              finalX = Math.min(workingMetadata.width - finalWidth, maxX - finalWidth)
            }
            
            // For landscape with faces detected, center around faces instead of forcing top 1/3rd
            // Only apply top-1/3rd rule if no faces were detected
            if (faces.length === 0) {
              const topThirdHeight = Math.floor(workingMetadata.height / 3)
              finalY = Math.max(0, Math.min(minY, topThirdHeight - finalHeight))
            } else {
              // With faces detected, center the crop around the face bounding box
              // Calculate the center of the face bounding box
              const faceCenterY = (minY + maxY) / 2
              // Center the crop around the face, but ensure it fits within image bounds
              finalY = Math.max(0, Math.min(faceCenterY - finalHeight / 2, workingMetadata.height - finalHeight))
            }
          } else if (isPortrait) {
            // For portrait, prioritize using full height when possible
            // Start with the full height and calculate width
            finalHeight = workingMetadata.height
            finalWidth = finalHeight * targetAspectRatio
            
            // If width exceeds image bounds, reduce height
            if (finalWidth > workingMetadata.width) {
              finalWidth = workingMetadata.width
              finalHeight = finalWidth / targetAspectRatio
            }
            
            // Center the crop horizontally, but ensure faces are included
            const centerX = Math.floor((workingMetadata.width - finalWidth) / 2)
            finalX = Math.max(0, Math.min(centerX, minX))
            
            // Ensure the crop includes all faces
            if (finalX + finalWidth < maxX) {
              finalX = Math.min(workingMetadata.width - finalWidth, maxX - finalWidth)
            }
            
            // For portrait with faces detected, center around faces instead of forcing top half
            // Only apply top-half rule if no faces were detected
            if (faces.length === 0) {
              const topHalfHeight = Math.floor(workingMetadata.height / 2)
              finalY = Math.max(0, Math.min(minY, topHalfHeight - finalHeight))
            } else {
              // With faces detected, center the crop around the face bounding box
              // Calculate the center of the face bounding box
              const faceCenterY = (minY + maxY) / 2
              // Center the crop around the face, but ensure it fits within image bounds
              finalY = Math.max(0, Math.min(faceCenterY - finalHeight / 2, workingMetadata.height - finalHeight))
            }
          } else {
            // For square, use the largest possible square that includes all faces
            const maxSize = Math.min(workingMetadata.width, workingMetadata.height)
            finalWidth = maxSize
            finalHeight = maxSize
            
            // Center the crop, but ensure faces are included
            const centerX = Math.floor((workingMetadata.width - finalWidth) / 2)
            const centerY = Math.floor((workingMetadata.height - finalHeight) / 2)
            
            finalX = Math.max(0, Math.min(centerX, minX))
            finalY = Math.max(0, Math.min(centerY, minY))
            
            // Ensure the crop includes all faces
            if (finalX + finalWidth < maxX) {
              finalX = Math.min(workingMetadata.width - finalWidth, maxX - finalWidth)
            }
            if (finalY + finalHeight < maxY) {
              finalY = Math.min(workingMetadata.height - finalHeight, maxY - finalHeight)
            }
          }
          
          // Ensure the crop fits within image bounds
          if (finalX + finalWidth > workingMetadata.width) {
            finalWidth = workingMetadata.width - finalX
            finalHeight = finalWidth / targetAspectRatio
          }
          if (finalY + finalHeight > workingMetadata.height) {
            finalHeight = workingMetadata.height - finalY
            finalWidth = finalHeight * targetAspectRatio
          }
          
          cropArea = {
            x: Math.floor(finalX),
            y: Math.floor(finalY),
            width: Math.floor(finalWidth),
            height: Math.floor(finalHeight)
          }
          
          // Ensure all values are positive integers (handle any remaining decimals)
          cropArea.x = Math.max(0, Math.floor(cropArea.x))
          cropArea.y = Math.max(0, Math.floor(cropArea.y))
          cropArea.width = Math.max(1, Math.floor(cropArea.width))
          cropArea.height = Math.max(1, Math.floor(cropArea.height))
          
          console.log('🎯 Face-based crop area (maximized):', cropArea)
        } else {
          // No faces detected, use smartcrop fallback
          console.log('👥 No faces detected, using smartcrop fallback')
          
          try {
            // Use smartcrop with Sharp for intelligent cropping
            console.log('🎯 Using smartcrop fallback')
            
            // Convert image buffer to raw RGBA data for smartcrop
            const rawBuffer = await sharp(imageBuffer)
              .ensureAlpha()
              .raw()
              .toBuffer()
            
            const imgData = { 
              width: metadata.width, 
              height: metadata.height, 
              data: new Uint8ClampedArray(rawBuffer) // smartcrop requires this format
            }
            
            console.log('🔍 Smartcrop input:', { width: imgData.width, height: imgData.height, dataLength: imgData.data.length })
            
            // Use smartcrop to find the best crop area
            // Pass the target dimensions for the crop we want
            const result = await smartcrop.crop(imgData, { 
              width: targetWidth, 
              height: targetHeight 
            })
            
            console.log('🔍 Smartcrop result:', result)
            
            if (result && result.topCrop) {
              const { x, y, width: w, height: h } = result.topCrop
              
              // smartcrop returns coordinates relative to the original image
              // Scale them to maximize the crop area while maintaining aspect ratio
              const targetAspectRatio = targetWidth / targetHeight
              const currentAspectRatio = w / h
              
              let finalWidth, finalHeight
              
              if (currentAspectRatio > targetAspectRatio) {
                // Current crop is too wide, expand height
                finalWidth = w
                finalHeight = w / targetAspectRatio
              } else {
                // Current crop is too tall, expand width
                finalHeight = h
                finalWidth = h * targetAspectRatio
              }
              
              // Ensure the expanded crop fits within image bounds
              if (x + finalWidth > metadata.width) {
                finalWidth = metadata.width - x
                finalHeight = finalWidth / targetAspectRatio
              }
              if (y + finalHeight > metadata.height) {
                finalHeight = metadata.height - y
                finalWidth = finalHeight * targetAspectRatio
              }
              
              cropArea = {
                x: x,
                y: y,
                width: Math.floor(finalWidth),
                height: Math.floor(finalHeight)
              }
              
              // Ensure all values are positive integers (handle any remaining decimals)
              cropArea.x = Math.max(0, Math.floor(cropArea.x))
              cropArea.y = Math.max(0, Math.floor(cropArea.y))
              cropArea.width = Math.max(1, Math.floor(cropArea.width))
              cropArea.height = Math.max(1, Math.floor(cropArea.height))
              
              console.log('🎯 Smartcrop fallback crop area (maximized):', cropArea)
            } else {
              throw new Error('Smartcrop failed to return valid crop area')
            }
          } catch (smartcropError) {
            console.warn('⚠️ Smartcrop failed, using orientation-based fallback:', smartcropError.message)
            
            // Fallback to orientation-based cropping with maximized area
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
              
              // Center the crop horizontally, prioritize top 1/3rd vertically
              const topThirdHeight = Math.floor(metadata.height / 3)
              const maxCropHeight = Math.min(cropHeight, topThirdHeight)
              const centerX = Math.floor((metadata.width - cropWidth) / 2)
              
              cropArea = {
                x: Math.max(0, centerX),
                y: 0,
                width: Math.floor(cropWidth),
                height: Math.floor(maxCropHeight)
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
              
              // Center the crop horizontally, prioritize top half vertically
              const topHalfHeight = Math.floor(metadata.height / 2)
              const maxCropHeight = Math.min(cropHeight, topHalfHeight)
              const centerX = Math.floor((metadata.width - cropWidth) / 2)
              
              cropArea = {
                x: Math.max(0, centerX),
                y: 0,
                width: Math.floor(cropWidth),
                height: Math.floor(maxCropHeight)
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
        }
        
        // Apply the crop
        const croppedImage = await sharp(workingImageBuffer)
          .extract({
            left: cropArea.x,
            top: cropArea.y,
            width: cropArea.width,
            height: cropArea.height
          })
          .resize(targetWidth, targetHeight, { fit: 'cover' })
          .withMetadata() // Preserve original orientation
          .png()
          .toBuffer()
        
        console.log('✅ OpenAI face detection crop completed successfully')
        return croppedImage
      } catch (error) {
        console.warn('⚠️ OpenAI face detection crop failed, using fallback:', error.message)
        // Fallback to regular resize using original imageBuffer
        return await sharp(imageBuffer)
          .resize(targetWidth, targetHeight, { fit: 'cover' })
          .withMetadata() // Preserve original orientation
          .png()
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
                  .png()
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
                  .png()
                  .toBuffer()
                console.log('✅ AI-guided square crop applied successfully')
              } catch (cropError) {
                console.warn('⚠️ AI-guided square crop failed, using fallback:', cropError.message)
                // Use fallback to default cropping
                processedImage = await sharp(imageBuffer)
                  .resize(targetWidth, targetHeight, { fit: 'cover' })
                  .png()
                  .toBuffer()
                console.log('✅ Fallback square crop applied successfully')
              }
            } else {
              // Fallback to default square cropping
              console.log('⚠️ Using default center cropping for square (no AI analysis)')
              processedImage = await sharp(imageBuffer)
                .resize(targetWidth, targetHeight, { fit: 'cover' })
                .png()
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
                    input: Buffer.from(circleSvg),
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
                    input: Buffer.from(circleSvg),
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
                  input: Buffer.from(circleSvg),
                  blend: 'dest-in'
                }])
                .png()
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
                .png()
                .toBuffer()
            }
            break
            
                      case 'rounded':
              console.log('🎨 ROUNDED SHAPE DETECTED - Starting rounded corners processing')
              
              // Check if this is a magic memory book (layout_type === 'magic')
              const isMagicMemory = book.layout_type === 'magic'
              
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
              if (isMagicMemory || book.layout_type === 'theme') {
                console.log('🧠 Smart cropping detected - using smart cropping for rounded shape')
                console.log('🎯 Smart crop will prioritize faces in center area')
                console.log('🔍 Debug: imageUrl for smartCropImage:', imageUrl)
                // First apply smart cropping to ensure subject is properly positioned
                const smartCroppedImage = await smartCropImage(imageBuffer, highResWidth, highResHeight, imageUrl)
                resizedImage = smartCroppedImage
              } else {
                console.log('📚 Regular memory book - using standard resize for rounded shape')
                // For regular memory books, use standard resize with standardized dimensions
                resizedImage = await sharp(imageBuffer)
                  .resize(highResWidth, highResHeight, { fit: 'cover' })
                  .png()
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
              .png()
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
              .png()
              .toBuffer()
            
                          console.log(`✅ ${isMagicMemory ? 'SMART CROP + ' : ''}ROUNDED CORNERS PROCESSING COMPLETED`)
              console.log(`📐 Standardized dimensions used: ${standardizedWidth}x${standardizedHeight} (${isPortrait ? 'Portrait' : isLandscape ? 'Landscape' : 'Square'})`)
            break
            
          case 'original':
          default:
            // Keep original aspect ratio
            processedImage = await sharp(imageBuffer)
              .resize(targetWidth, targetHeight, { fit: 'inside' })
              .png()
              .toBuffer()
            
            // Add border to rectangular images
            processedImage = await sharp(processedImage)
              .extend({
                top: borderWidth,
                bottom: borderWidth,
                left: borderWidth,
                right: borderWidth,
                background: borderColor
              })
              .png()
              .toBuffer()
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
    
    // Check for Magic Memory layout
    const isMagicMemory = book.layout_type === 'magic'
    if (isMagicMemory) {
      // Magic Memory: 7x5 inch (504x360 points)
      const pageWidth = 504
      const pageHeight = 360
      const margin = 18 // 1/4 inch margin everywhere
      const page = pdfDoc.addPage([pageWidth, pageHeight])
      
      console.log(`📐 Magic Memory page dimensions: ${pageWidth}x${pageHeight} points (${(pageWidth/72).toFixed(2)}x${(pageHeight/72).toFixed(2)} inches)`)
      
      // Add border at 1/8" inside the page edge (1/8" = 9 points)
      const borderMargin = 9
      
      // For solid backgrounds, use transparent fill to show the background color
      // For other backgrounds, use white fill
      const borderFillColor = book.background_type === 'solid' ? undefined : rgb(1, 1, 1)
      
      console.log('🖼️ MAGIC MEMORY BORDER DRAWING - Border configuration:', {
        background_type: book.background_type,
        borderFillColor: borderFillColor ? 'white' : 'transparent',
        borderMargin: borderMargin,
        borderWidth: 3,
        borderDimensions: {
          x: borderMargin,
          y: borderMargin,
          width: pageWidth - 2 * borderMargin,
          height: pageHeight - 2 * borderMargin
        }
      })
      
      page.drawRectangle({
        x: borderMargin,
        y: borderMargin,
        width: pageWidth - 2 * borderMargin,
        height: pageHeight - 2 * borderMargin,
        borderColor: rgb(0, 0, 0),
        borderWidth: 3, // Increased from 1 to 3 points for better visibility
        color: borderFillColor // transparent for solid backgrounds, white for others
      })
      console.log(`🖼️ MAGIC MEMORY BORDER DRAWN - Border drawn: ${borderMargin} points from edge, width: ${pageWidth - 2 * borderMargin}x${pageHeight - 2 * borderMargin}, fill: ${borderFillColor ? 'white' : 'transparent'}`)
      
      // Use the same background handling as standard books, but respect background type
      console.log('🎨 MAGIC MEMORY BACKGROUND - Background handling for magic memory')
      console.log('🎨 Magic memory background check:', {
        background_type: book.background_type,
        background_color: book.background_color,
        has_background_color: !!book.background_color,
        has_pdfBgImage: !!pdfBgImage
      })
      
      if (book.background_type === 'solid' && book.background_color) {
        console.log('🎨 MAGIC MEMORY SOLID COLOR - Starting solid color background application')
        try {
          // Draw solid color background
          const hexColor = book.background_color.replace('#', '')
          console.log('🎨 Magic memory hex color processing:', {
            original: book.background_color,
            without_hash: hexColor,
            hex_length: hexColor.length
          })
          
          // Validate hex color format
          if (!/^[0-9A-Fa-f]{6}$/.test(hexColor)) {
            console.warn(`⚠️ Invalid hex color format: ${book.background_color}, using default gray`)
            console.log('🎨 Magic memory using fallback gray color')
            // Use default gray color
            page.drawRectangle({
              x: 0,
              y: 0,
              width: pageWidth,
              height: pageHeight,
              color: rgb(0.9, 0.9, 0.9) // Light gray
            })
            console.log('🎨 Magic memory gray fallback rectangle drawn')
          } else {
            const r = parseInt(hexColor.substr(0, 2), 16) / 255
            const g = parseInt(hexColor.substr(2, 2), 16) / 255
            const b = parseInt(hexColor.substr(4, 2), 16) / 255
            
            console.log('🎨 Magic memory RGB conversion successful:', {
              hex: hexColor,
              r: r,
              g: g,
              b: b,
              r_raw: parseInt(hexColor.substr(0, 2), 16),
              g_raw: parseInt(hexColor.substr(2, 2), 16),
              b_raw: parseInt(hexColor.substr(4, 2), 16)
            })
            
            console.log('🎨 Magic memory drawing solid color rectangle...')
            page.drawRectangle({
              x: 0,
              y: 0,
              width: pageWidth,
              height: pageHeight,
              color: rgb(r, g, b)
            })
            console.log(`🎨 MAGIC MEMORY SOLID BACKGROUND SUCCESS - Color applied: ${book.background_color} (RGB: ${r}, ${g}, ${b})`)
          }
        } catch (colorError) {
          console.error('❌ Error applying solid background color to magic memory:', colorError)
          console.warn('⚠️ Using default white background due to color error')
          // Fallback to white background
          page.drawRectangle({
            x: 0,
            y: 0,
            width: pageWidth,
            height: pageHeight,
            color: rgb(1, 1, 1) // White
          })
        }
      } else if (pdfBgImage && book.background_type !== 'white') {
        // Draw background image to fill the page with opacity from database
        // Safety feature: if opacity is 0, use 30% instead
        const backgroundOpacity = book.background_opacity || 30
        const opacity = (backgroundOpacity === 0 ? 30 : backgroundOpacity) / 100 // Convert percentage to decimal
        page.drawImage(pdfBgImage, {
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
          opacity: opacity
        })
        console.log(`✅ Magic memory background image applied with ${backgroundOpacity}% opacity`)
      } else {
        // Use white background (either no background image or white background type)
        page.drawRectangle({
          x: 0, y: 0, width: pageWidth, height: pageHeight,
          color: rgb(1, 1, 1), // white
          opacity: 1
        })
        console.log('✅ Magic memory using white background')
      }
      // Draw photos based on count - single photo gets special treatment
      const assetIds = book.created_from_assets || []
      const photoAssets = assets.filter(a => assetIds.includes(a.id))
      
      // Determine layout based on photo count
      let photoLayout
      if (photoAssets.length === 1) {
        // Single photo: fill 60% of the card area (left side)
        photoLayout = {
          type: 'single',
          photoArea: {
            x: margin,
            y: margin,
            width: pageWidth * 0.6 - margin, // 60% of card width minus margin
            height: pageHeight - 2 * margin // Full height minus margins
          }
        }
      } else {
        // Multiple photos: determine grid layout based on photo count
        let gridCols, gridRows
        if (photoAssets.length === 2) {
          gridCols = 2
          gridRows = 1
        } else if (photoAssets.length === 4) {
          gridCols = 2
          gridRows = 2
        } else if (photoAssets.length === 6) {
          gridCols = 3
          gridRows = 2
        } else {
          // Fallback for other counts
          gridCols = 2
          gridRows = 2
        }
        
        photoLayout = {
          type: 'grid',
          gridCols: gridCols,
          gridRows: gridRows,
          photoGridLeft: margin,
          photoGridTop: margin,
          photoGridWidth: pageWidth * 0.6 - margin, // 60% of card width minus margin
          photoGridHeight: pageHeight - 2 * margin,
          photoCellWidth: (pageWidth * 0.6 - margin - margin / 2) / gridCols, // Reduced margin between cells from margin to margin/2
          photoCellHeight: (pageHeight - 2 * margin - margin / 2) / gridRows // Reduced margin between cells from margin to margin/2
        }
        
        // Calculate positions for grid layout
        photoLayout.positions = []
        for (let row = 0; row < photoLayout.gridRows; row++) {
          for (let col = 0; col < photoLayout.gridCols; col++) {
            if (photoLayout.positions.length < photoAssets.length) {
              photoLayout.positions.push({
                x: photoLayout.photoGridLeft + col * (photoLayout.photoCellWidth + (photoLayout.gridCols > 1 ? margin / 2 / (photoLayout.gridCols - 1) : 0)), // Reduced spacing
                y: pageHeight - margin - (row + 1) * photoLayout.photoCellHeight - row * (photoLayout.gridRows > 1 ? margin / 2 / (photoLayout.gridRows - 1) : 0) // Reduced spacing
              })
            }
          }
        }
      }
      // Draw photos based on layout type
      for (let i = 0; i < photoAssets.length; i++) {
        const asset = photoAssets[i]
        console.log(`🔍 Debug: Asset ${i + 1} storage_url:`, asset.storage_url)
        try {
          const imageRes = await fetch(asset.storage_url)
          if (!imageRes.ok) throw new Error('Failed to fetch image')
          const imageBuffer = Buffer.from(await imageRes.arrayBuffer())
          
          // Get image dimensions and calculate aspect ratio
          const imageInfo = await sharp(imageBuffer).metadata()
          const aspectRatio = imageInfo.width / imageInfo.height
          
          let finalWidth, finalHeight, imgX, imgY
          
          if (photoLayout.type === 'single') {
            // Single photo: fill the entire photo area (50% of card)
            const photoArea = photoLayout.photoArea
            
            // For single photos, prioritize portrait orientation to fill the area better
            if (aspectRatio < 1) {
              // Portrait photo - can fill more of the area
              finalHeight = photoArea.height
              finalWidth = photoArea.height * aspectRatio
              if (finalWidth > photoArea.width) {
                finalWidth = photoArea.width
                finalHeight = photoArea.width / aspectRatio
              }
            } else {
              // Landscape photo - fit to width and crop height if needed
              finalWidth = photoArea.width
              finalHeight = photoArea.width / aspectRatio
              if (finalHeight > photoArea.height) {
                finalHeight = photoArea.height
                finalWidth = photoArea.height * aspectRatio
              }
            }
            
            // Center image in photo area
            imgX = photoArea.x + (photoArea.width - finalWidth) / 2
            imgY = photoArea.y + (photoArea.height - finalHeight) / 2
            
            console.log(`📸 Single photo layout: ${finalWidth}x${finalHeight} in ${photoArea.width}x${photoArea.height} area`)
          } else {
            // Grid layout: use exact cell dimensions for processing (like theme layout)
            const photoCellWidth = photoLayout.photoCellWidth
            const photoCellHeight = photoLayout.photoCellHeight
            
            // Use the exact cell dimensions for processing and placement
              finalWidth = photoCellWidth
                finalHeight = photoCellHeight
            
            // Center image in cell
            imgX = photoLayout.positions[i].x
            imgY = photoLayout.positions[i].y
          }
          
          // Process image orientation first, then shape
          const isPng = asset.storage_url.endsWith('.png')
          const processedImageBuffer = await processImageOrientation(imageBuffer, isPng ? 'png' : 'jpeg')
          console.log(`🔄 After orientation processing, size:`, processedImageBuffer.length, 'bytes')
          
          // Process image to the exact dimensions needed for placement
          // This ensures the processed image matches the placement dimensions perfectly
          const targetWidth = Math.round(finalWidth * 2)
          const targetHeight = Math.round(finalHeight * 2)
          const processedImage = await processImageShape(processedImageBuffer, book.memory_shape || 'original', targetWidth, targetHeight, asset.storage_url)
          const pdfImage = await pdfDoc.embedPng(processedImage)
          
          // Use the exact same dimensions for placement as were used for processing
          // This ensures no aspect ratio distortion - same approach as theme layout
          page.drawImage(pdfImage, {
            x: imgX,
            y: imgY,
            width: finalWidth,
            height: finalHeight
          })
          
          // Add hairline border around photo
          // Border is now added directly to the image using Sharp, no need to draw borders in PDF
          
          console.log(`✅ Photo ${i + 1} processed: ${finalWidth}x${finalHeight} (${photoLayout.type} layout)`)
          console.log(`📐 PDF PLACEMENT DEBUG - Photo ${i + 1}: processed at ${targetWidth}x${targetHeight}, placed at ${finalWidth}x${finalHeight}`)
        } catch (err) {
          console.warn(`⚠️ Failed to process photo ${i + 1}:`, err.message)
          // Draw placeholder if image fails
          if (photoLayout.type === 'single') {
            const photoArea = photoLayout.photoArea
            page.drawRectangle({
              x: photoArea.x, y: photoArea.y, width: photoArea.width, height: photoArea.height, color: rgb(0.9, 0.9, 1)
            })
          } else {
            page.drawRectangle({
              x: photoLayout.positions[i].x, y: photoLayout.positions[i].y, 
              width: photoLayout.photoCellWidth, height: photoLayout.photoCellHeight, color: rgb(0.9, 0.9, 1)
            })
          }
        }
      }
      // --- Story area: right half ---
      const storyAreaLeft = pageWidth * 0.6 + margin // Start at 60% position
      const storyAreaRight = pageWidth - margin
      const storyAreaTop = margin
      const storyAreaBottom = pageHeight - margin
      
      // Add reduced margin (5 points) on left/right and 1/2" margin (36 points) on top, reduced bottom margin by 10mm
      const storyMarginHorizontal = 5 // Reduced from 14 to 5 points
      const storyMarginVerticalTop = 36 // 1/2 inch in points for top margin
      const storyMarginVerticalBottom = 8 // Reduced bottom margin by ~28 points (10mm) from 36 to 8
      const storyTextLeft = storyAreaLeft + storyMarginHorizontal
      const storyTextRight = storyAreaRight - storyMarginHorizontal
      const storyTextTop = storyAreaTop + storyMarginVerticalTop
      const storyTextBottom = storyAreaBottom - storyMarginVerticalBottom
      const storyAreaWidth = storyTextRight - storyTextLeft
      const storyAreaHeight = storyTextBottom - storyTextTop
      
      console.log('📏 Story area dimensions:')
      console.log(`   Width: ${storyAreaWidth} points`)
      console.log(`   Height: ${storyAreaHeight} points`)
      console.log(`   Available space: ${storyAreaWidth * storyAreaHeight} square points`)
      
      // Draw the story in the calculated area
      const story = book.magic_story || 'A special family story.'
      
      console.log(`📖 Story for PDF: "${story.substring(0, 100)}..."`)
      

      
      // Render story text using shared text renderer
      console.log('🎨 Rendering story text with shared renderer...')
      let storyTextBuffer
      let storyTextImage
      
      try {
        // Convert points to pixels for image rendering (72 points = 1 inch, assume 96 DPI for screen)
        const pointsToPixels = 96 / 72 // Convert points to pixels
        const storyAreaWidthPixels = Math.round(storyAreaWidth * pointsToPixels)
        const storyAreaHeightPixels = Math.round(storyAreaHeight * pointsToPixels)
        
        // Ensure font color has # prefix for text rendering
        let fontColor = theme?.body_font_color || '#2D1810'
        if (fontColor && !fontColor.startsWith('#')) {
          fontColor = '#' + fontColor
        }
        console.log(`📏 Calling renderTextToImage with dimensions: ${storyAreaWidth}x${storyAreaHeight} points (${storyAreaWidthPixels}x${storyAreaHeightPixels} pixels)`)
        storyTextBuffer = await renderTextToImage(story, storyAreaWidthPixels, storyAreaHeightPixels, { color: fontColor })
        storyTextImage = await pdfDoc.embedPng(storyTextBuffer)
        console.log('✅ Story text rendered successfully with shared renderer')
        
        // Draw story text image
        page.drawImage(storyTextImage, {
          x: storyTextLeft,
          y: storyTextTop,
          width: storyAreaWidth,
          height: storyAreaHeight
        })
      } catch (textError) {
        console.warn('⚠️ Shared text renderer failed, using Times Roman fallback:', textError.message)
        
        // Fallback: Use pdf-lib's built-in Times Roman text rendering
        const fallbackConfig = getPdfFallbackConfig('Times-Roman')
        const fallbackFont = await pdfDoc.embedFont(fallbackConfig.fontName)
        const fallbackFontSize = fallbackConfig.fontSize
        const fallbackLineHeight = fallbackFontSize * fallbackConfig.lineHeight
        
        // Use theme body font color for fallback if available
        let fallbackColor = fallbackConfig.color
        if (theme?.body_font_color) {
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
            fallbackColor = { r, g, b }
          }
        }
        
        // Simple text wrapping for fallback
        const words = story.split(' ')
        const fallbackLines = []
        let currentLine = ''
        
        for (const word of words) {
          const testLine = currentLine ? currentLine + ' ' + word : word
          const testWidth = fallbackFont.widthOfTextAtSize(testLine, fallbackFontSize)
          
          if (testWidth <= storyAreaWidth) {
            currentLine = testLine
          } else {
            if (currentLine) fallbackLines.push(currentLine)
            currentLine = word
          }
        }
        if (currentLine) fallbackLines.push(currentLine)
        
        // Draw text directly on the page with truncation
        let yPosition = storyTextTop + storyAreaHeight - fallbackLineHeight
        let linesDrawn = 0
        const maxLines = Math.floor(storyAreaHeight / fallbackLineHeight)
        
        console.log(`📏 Fallback rendering: can fit ${maxLines} lines in ${storyAreaHeight}px height`)
        
        for (const line of fallbackLines) {
          if (yPosition >= storyTextTop && linesDrawn < maxLines) {
            // Truncate the last line if we're at the limit
            let displayLine = line
            if (linesDrawn === maxLines - 1 && linesDrawn < fallbackLines.length - 1) {
              // We're on the last line but there are more lines to show
              displayLine = line.substring(0, Math.max(0, line.length - 3)) + '...'
              console.log(`✂️ Fallback truncated last line to: "${displayLine}"`)
            }
            
            page.drawText(displayLine, {
              x: storyTextLeft,
              y: yPosition,
              size: fallbackFontSize,
              font: fallbackFont,
              color: rgb(fallbackColor.r, fallbackColor.g, fallbackColor.b)
            })
            linesDrawn++
          }
          yPosition -= fallbackLineHeight
        }
        
        console.log(`📊 Fallback rendered ${linesDrawn} lines (${fallbackLines.length} total available)`)
        
        console.log('✅ Times Roman fallback text rendering completed')
      }
      // End magic memory layout
      await updatePdfStatus(supabase, book.id, user.id, '✨ Magic Memory PDF created! ✨')
      
      // Use centralized function to save and upload file
      const pdfStorageUrl = await saveAndUploadFile(pdfDoc, book, user, supabase)
      
      // Update book status and return
      await supabase.from('memory_books').update({
        status: 'ready',
        generated_at: new Date().toISOString()
      }).eq('id', book.id)
      await updatePdfStatus(supabase, book.id, user.id, '✨ Your Magic Memory is ready! ✨')
      return { success: true, downloadUrl: pdfStorageUrl }
    }

    // Handle theme layout PDF generation
    if (book.layout_type === 'theme') {
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

      if (!layoutConfig || !layoutConfig.photos) {
        console.error('❌ Invalid layout_config in theme')
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid theme layout configuration'
        })
      }

      // Convert theme size to PDF dimensions
      let pageWidth, pageHeight
      switch (theme.size) {
        case '3x5': pageWidth = 216; pageHeight = 360; break
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

      // Process photos from layout_config
      const photoCount = layoutConfig.photos.length
      console.log(`📸 Processing ${photoCount} photos from theme layout`)

      // Fetch all assets for the book using photo_selection_pool if available, otherwise created_from_assets
      const assetIds = book.photo_selection_pool && book.photo_selection_pool.length > 0 
        ? book.photo_selection_pool 
        : book.created_from_assets || []
      
      console.log(`📸 Theme PDF - Asset pool: photo_selection_pool=${book.photo_selection_pool?.length || 0}, created_from_assets=${book.created_from_assets?.length || 0}, using ${assetIds.length} assets`)
      
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
      // Always call AI for theme layouts to ensure fresh story generation (like magic layout)
      console.log('🎨 Theme layout detected, generating a new story for regeneration')
      
      const photos = assets.map(asset => ({
        id: asset.id,
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
      const magicRes = await fetch(`${config.public.siteUrl}/api/ai/magic-memory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          photos: photos,
          title: book.title,
          memory_event: book.memory_event,
          theme: book.theme_id || null,
          photo_count: photoCount,
          background_type: book.background_type || 'white',
          background_color: book.background_color
        })
      })
      if (magicRes.ok) {
        const magicData = await magicRes.json()
        // Use selected_photo_ids (array of asset IDs) from AI response
        if (magicData.selected_photo_ids && Array.isArray(magicData.selected_photo_ids)) {
          selectedAssets = assets.filter(a => magicData.selected_photo_ids.includes(a.id))
        }
        aiStory = magicData.story
        // Update the book with the new story and asset IDs
        await supabase.from('memory_books').update({
          magic_story: aiStory,
          created_from_assets: selectedAssets.map(a => a.id)
        }).eq('id', book.id)
      }

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
          const photoX = cardX + (photoConfig.position.x * mmToPoints)
          const photoY = cardY + (cardHeightPoints - (photoConfig.position.y + photoConfig.size.height) * mmToPoints)
          const photoWidth = photoConfig.size.width * mmToPoints
          const photoHeight = photoConfig.size.height * mmToPoints
          const targetWidth = Math.round(photoWidth * 2)
          const targetHeight = Math.round(photoHeight * 2)
          let finalImageBuffer
          console.log(`🔍 Debug: Asset ${i + 1} storage_url:`, asset.storage_url)
          try {
            finalImageBuffer = await smartCropImage(imageBuffer, targetWidth, targetHeight, asset.storage_url)
          } catch (smartCropError) {
            finalImageBuffer = await sharp(imageBuffer)
              .resize(targetWidth, targetHeight, { fit: 'cover' })
              .withMetadata() // Preserve original orientation
              .png()
              .toBuffer()
          }
          // Apply photo border if specified in theme
          const photoBorder = theme.photo_border || 0
          if (photoBorder > 0) {
            // Ensure border color has # prefix for Sharp
            let borderColor = theme.body_font_color || '#333333'
            if (borderColor && !borderColor.startsWith('#')) {
              borderColor = '#' + borderColor
            }
            // photoBorder is already in pixels, no conversion needed
            const borderWidth = photoBorder
            try {
              // Create border by extending the image with border color
              const borderedImage = await sharp(finalImageBuffer)
                .extend({
                  top: borderWidth,
                  bottom: borderWidth,
                  left: borderWidth,
                  right: borderWidth,
                  background: borderColor
                })
                .png()
                .toBuffer()
              finalImageBuffer = borderedImage
              
              // Adjust drawing dimensions to account for border
              // Convert pixels to points for PDF drawing (1 point = 1/72 inch, 1 pixel = 1/96 inch)
              const borderPoints = photoBorder * (72 / 96)
              const pdfImage = await pdfDoc.embedPng(finalImageBuffer)
              page.drawImage(pdfImage, { 
                x: photoX - borderPoints, 
                y: photoY - borderPoints, 
                width: photoWidth + (borderPoints * 2), 
                height: photoHeight + (borderPoints * 2) 
              })
            } catch (borderError) {
              console.warn('⚠️ Failed to apply photo border:', borderError)
              const pdfImage = await pdfDoc.embedPng(finalImageBuffer)
              page.drawImage(pdfImage, { x: photoX, y: photoY, width: photoWidth, height: photoHeight })
            }
          } else {
            // Apply rounded corners if specified
            const borderRadius = photoConfig.borderRadius || (theme.rounded ? 5 : 0)
            if (borderRadius > 0) {
              const borderRadiusPixels = Math.round(borderRadius * 3.779527559)
              try {
                const roundedSvg = `<svg width="${targetWidth}" height="${targetHeight}"><rect width="${targetWidth}" height="${targetHeight}" rx="${borderRadiusPixels}" ry="${borderRadiusPixels}" fill="white"/></svg>`
                finalImageBuffer = await sharp(finalImageBuffer)
                  .composite([{ input: Buffer.from(roundedSvg), blend: 'dest-in' }])
                  .png()
                  .toBuffer()
              } catch (roundError) {}
            }
            const pdfImage = await pdfDoc.embedPng(finalImageBuffer)
            page.drawImage(pdfImage, { x: photoX, y: photoY, width: photoWidth, height: photoHeight })
          }
        } catch (err) {}
      }

      // Process story if layout_config includes story area
      if (layoutConfig.story) {
        let story = aiStory || 'A special family story.'
        const storyX = cardX + (layoutConfig.story.position.x * mmToPoints)
        const storyY = cardY + (cardHeightPoints - (layoutConfig.story.position.y + layoutConfig.story.size.height) * mmToPoints)
        const storyWidth = layoutConfig.story.size.width * mmToPoints
        const storyHeight = layoutConfig.story.size.height * mmToPoints
        try {
          const pointsToPixels = 96 / 72
          const storyWidthPixels = Math.round(storyWidth * pointsToPixels)
          const storyHeightPixels = Math.round(storyHeight * pointsToPixels)
          // Ensure font color has # prefix for text rendering
          let fontColor = theme.body_font_color || '#2D1810'
          if (fontColor && !fontColor.startsWith('#')) {
            fontColor = '#' + fontColor
          }
          const storyTextBuffer = await renderTextToImage(story, storyWidthPixels, storyHeightPixels, { color: fontColor })
          const storyTextImage = await pdfDoc.embedPng(storyTextBuffer)
          page.drawImage(storyTextImage, { x: storyX, y: storyY, width: storyWidth, height: storyHeight })
        } catch (textError) {
          page.drawText(story.substring(0, 200) + '...', { x: storyX + 10, y: storyY + storyHeight - 20, size: 12, color: rgb(0.2, 0.2, 0.2) })
        }
      }

      // Save and upload PDF
      await updatePdfStatus(supabase, book.id, user.id, '🎨 Theme PDF created!')
      
      // Use centralized function to save and upload file
      const pdfStorageUrl = await saveAndUploadFile(pdfDoc, book, user, supabase)
      
      // Update book status and return
      await supabase.from('memory_books').update({ 
        status: 'ready', 
        generated_at: new Date().toISOString() 
      }).eq('id', book.id)
      await updatePdfStatus(supabase, book.id, user.id, '🎨 Your themed memory is ready!')
      return { success: true, downloadUrl: pdfStorageUrl }
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
    const printSize = body.printSize || book.print_size || '8x10'
    
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
      
      // For solid backgrounds, use transparent fill to show the background color
      // For other backgrounds, use white fill
      const borderFillColor = book.background_type === 'solid' ? undefined : rgb(1, 1, 1)
      
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
      const topMargin = 60 // for heading
      const bottomMargin = 50 // for page number
      const gridYOffset = (pageIndex === 0) ? topMargin : 0
      const availableHeight = height - gridYOffset - bottomMargin
      
      // Draw title on first page, with extra space below
      if (pageIndex === 0) {
        const headingY = height - 60
        const title = (book.title || 'Memory Book').trim() // Use user's title or fallback, trim whitespace
        const titleWidth = title.length * 12 // Approximate width based on character count for font size 24
        const titleX = (width - titleWidth) / 2 // Center the title
        
        page.drawText(title, {
          x: titleX,
          y: headingY,
          size: 24,
          color: rgb(0.2, 0.2, 0.2)
        })
      }
      
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
            const isPng = asset.storage_url.endsWith('.png')
            const processedImageBuffer = await processImageOrientation(imageBuffer, isPng ? 'png' : 'jpeg')
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
            if (memoryShape !== 'original' || isPng) {
              console.log(`📄 Embedding PNG image (processed shape or PNG format)`)
              pdfImage = await pdfDoc.embedPng(finalImageBuffer)
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
    
    await updatePdfStatus(supabase, book.id, user.id, 'Finalizing PDF document...')
    
    // 5. Save PDF and upload to Supabase Storage using centralized function
    const publicUrl = await saveAndUploadFile(pdfDoc, book, user, supabase)
    
    await updatePdfStatus(supabase, book.id, user.id, 'Working our magic ...')
    console.log('🎉 PDF generated and uploaded successfully')
    
    // Set a final status that the frontend can wait for
    await updatePdfStatus(supabase, book.id, user.id, 'PDF generation completed successfully')
    
    // Immediately clean up and update book status (no delays)
    console.log('🧹 Cleaning up PDF status...')
    await supabase.from('pdf_status').delete().eq('book_id', book.id).eq('user_id', user.id)
    
    // Now update the book status to ready immediately
    console.log('📝 Final update: setting memory book status to ready')
    const { data: finalUpdateData, error: finalUpdateError } = await supabase
      .from('memory_books')
      .update({ status: 'ready' })
      .eq('id', book.id)
      .select()
    
    if (finalUpdateError) {
      console.error('❌ Error updating book status to ready:', finalUpdateError)
    } else {
      console.log('✅ Book status updated to ready successfully:', finalUpdateData)
    }
    
    // Verify the update worked
    const { data: verifyData, error: verifyError } = await supabase
      .from('memory_books')
      .select('status')
      .eq('id', book.id)
      .single()
    
    if (verifyError) {
      console.error('❌ Error verifying book status update:', verifyError)
    } else {
      console.log('✅ Verified book status is now:', verifyData.status)
    }
    
    // Small delay to ensure database transaction is committed
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // ======= DEBUGGING SUMMARY LOG =======
    try {
      console.log('================ SAVTA PDF GENERATION SUMMARY ================')
      console.log('Book ID:', book.id)
      console.log('Title:', book.title)
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
    
    return {
      success: true,
      downloadUrl: publicUrl,
      message: 'PDF generated successfully'
    }
    
  } catch (error) {
    console.error('❌ PDF generation error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to generate PDF'
    })
  }
})

async function updatePdfStatus(supabase, bookId, userId, status) {
  try {
    console.log('📊 Updating PDF status:', status, 'for book:', bookId)
    const { data, error } = await supabase.from('pdf_status').upsert({
      book_id: bookId,
      user_id: userId,
      status,
      updated_at: new Date().toISOString()
    }, { onConflict: ['book_id', 'user_id'] })
    
    if (error) {
      console.error('❌ PDF status update error:', error)
    } else {
      console.log('✅ PDF status updated successfully')
    }
  } catch (error) {
    console.log('⚠️ PDF status table might not exist yet, continuing without status updates:', error.message)
  }
} 

 