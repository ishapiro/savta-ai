export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { file, assetData } = body
    
    // Get Supabase client
    const config = useRuntimeConfig()
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabase = createClient(
      config.public.supabaseUrl,
      config.public.supabaseKey
    )
    
    // Import Sharp for image processing
    const sharp = await import('sharp')
    
    // Get user from the request (you'll need to pass auth token)
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }
    
    // Extract user from token (simplified - you might need more robust auth)
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }
    
    let storageUrl = null
    let photoMetadata = null
    
    // Handle file upload if provided
    if (file) {
      // Convert base64 to buffer if needed
      let fileBuffer
      if (file.data) {
        // Handle base64 file data
        fileBuffer = Buffer.from(file.data, 'base64')
      } else {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid file data'
        })
      }
      
      // Detect photo orientation and dimensions if it's an image
      if (file.type && file.type.startsWith('image/')) {
        try {
          console.log('📸 Analyzing image dimensions and orientation...')
          const imageInfo = await sharp.default(fileBuffer).metadata()
          
          const width = imageInfo.width || 0
          const height = imageInfo.height || 0
          
          // Determine orientation
          let orientation = 'square'
          if (width > height) {
            orientation = 'landscape'
          } else if (height > width) {
            orientation = 'portrait'
          }
          
          photoMetadata = {
            width,
            height,
            orientation
          }
          
          console.log(`📐 Image analysis: ${width}x${height} (${orientation})`)
        } catch (error) {
          console.warn('⚠️ Failed to analyze image dimensions:', error.message)
          // Continue without metadata
        }
      }
      
      // Create file name
      const fileName = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      
      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('assets')
        .upload(fileName, fileBuffer, {
          contentType: file.type || 'application/octet-stream'
        })
      
      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to upload file to storage'
        })
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('assets')
        .getPublicUrl(fileName)
      
      storageUrl = urlData.publicUrl
    }
    
    // Create asset record with photo metadata if available
    const assetRecord = {
      user_id: user.id,
      storage_url: storageUrl,
      ...assetData
    }
    
    // Add photo metadata if available
    if (photoMetadata) {
      assetRecord.width = photoMetadata.width
      assetRecord.height = photoMetadata.height
      assetRecord.orientation = photoMetadata.orientation
    }
    
    const { data, error } = await supabase
      .from('assets')
      .insert([assetRecord])
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create asset record'
      })
    }
    
    return {
      success: true,
      asset: data
    }
    
  } catch (error) {
    console.error('Upload API error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Upload failed'
    })
  }
}) 