// Memory book PDF download endpoint
// Uses two-step process: background generation + PDF generation

export default defineEventHandler(async (event) => {
  try {
    console.log('🚀 Starting memory book download endpoint')
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
    const { data: book, error: bookError } = await supabase
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
    
    // Check if the book is ready for download
    if (book.status !== 'ready' && book.status !== 'draft') {
      console.log('❌ Book not ready for download, status:', book.status)
      throw createError({
        statusCode: 400,
        statusMessage: 'Memory book is not ready for download'
      })
    }

    // If book is draft, we need to generate it first
    if (book.status === 'draft') {
      console.log('📝 Book is draft, generating PDF...')
      // Continue to PDF generation below
    }

    // If pdf_url exists, return it directly (fast download)
    if (book.pdf_url && book.pdf_url.startsWith('https://')) {
      console.log('✅ PDF URL already exists, returning:', book.pdf_url)
      return {
        success: true,
        downloadUrl: book.pdf_url
      }
    }

    console.log('🔄 PDF URL not found, generating simple PDF...')
    
    // For now, create a simple placeholder PDF instead of the complex generation
    // This will help us test the download flow
    try {
      // Create a simple PDF using pdf-lib
      console.log('📄 Importing pdf-lib...')
      const pdfLib = await import('pdf-lib')
      console.log('✅ pdf-lib imported successfully')
      
      const pdfDoc = await pdfLib.PDFDocument.create()
      const page = pdfDoc.addPage([595, 842]) // A4 size
      
      // Add a simple title
      page.drawText('Memory Book', {
        x: 50,
        y: 750,
        size: 24,
        color: pdfLib.rgb(0.2, 0.2, 0.2)
      })
      
      page.drawText(`Book ID: ${book.id}`, {
        x: 50,
        y: 700,
        size: 12,
        color: pdfLib.rgb(0.5, 0.5, 0.5)
      })
      
      page.drawText('This is a placeholder PDF. Full PDF generation is being implemented.', {
        x: 50,
        y: 650,
        size: 14,
        color: pdfLib.rgb(0.3, 0.3, 0.3)
      })
      
      // Save PDF
      console.log('💾 Saving PDF to buffer...')
      const pdfBytes = await pdfDoc.save()
      console.log('✅ Simple PDF created, size:', pdfBytes.length, 'bytes')
      
      // Upload to Supabase Storage
      const fileName = `${user.id}/memory_book/pdfs/${book.id}.pdf`
      console.log('📤 Uploading PDF to Supabase Storage:', fileName)
      console.log('📊 PDF size:', pdfBytes.length, 'bytes')
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('assets')
        .upload(fileName, pdfBytes, {
          contentType: 'application/pdf',
          upsert: true
        })
      
      if (uploadError) {
        console.error('❌ Failed to upload PDF to storage:', uploadError)
        console.error('❌ Upload error details:', {
          message: uploadError.message,
          statusCode: uploadError.statusCode,
          statusMessage: uploadError.statusMessage
        })
        throw new Error('Failed to upload PDF to storage: ' + uploadError.message)
      }
      
      console.log('✅ PDF uploaded successfully:', uploadData)
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('assets')
        .getPublicUrl(fileName)
      
      const publicUrl = publicUrlData?.publicUrl
      if (!publicUrl) {
        console.error('❌ Failed to get public URL for PDF')
        throw new Error('Failed to get public URL for PDF')
      }
      
      // Update the book with the PDF URL
      const { error: updateError } = await supabase
        .from('memory_books')
        .update({ 
          pdf_url: publicUrl,
          status: 'ready'
        })
        .eq('id', book.id)
      
      if (updateError) {
        console.error('❌ Error updating book with PDF URL:', updateError)
      }
      
      console.log('✅ PDF generated and uploaded successfully')
      return {
        success: true,
        downloadUrl: publicUrl
      }
      
    } catch (error) {
      console.error('❌ PDF generation failed:', error)
      throw new Error('Failed to generate PDF: ' + error.message)
    }
    
  } catch (error) {
    console.error('❌ Memory book download error:', error)
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      statusMessage: error.statusMessage
    })
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to generate download URL: ' + error.message
    })
  }
}) 