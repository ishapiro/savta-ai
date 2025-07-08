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
    
    // Create asset record
    const { data, error } = await supabase
      .from('assets')
      .insert([{
        user_id: user.id,
        storage_url: storageUrl,
        ...assetData
      }])
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