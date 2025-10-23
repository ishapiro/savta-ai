import { getHeader, createError } from 'h3'

/**
 * Get faces that need user assignment
 * Used by Person Manager and after reindexing
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceRoleKey || config.public.supabaseKey
  )
  
  // Validate authentication
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  
  if (authError || !user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
  }
  
  try {
    // Get faces needing assignment
    const { data: faces, error: facesError } = await supabase
      .from('faces')
      .select(`
        id,
        asset_id,
        rekognition_face_id,
        bounding_box,
        confidence,
        needs_assignment,
        auto_assigned,
        created_at,
        assets!inner(
          id,
          storage_url,
          thumbnail_url,
          title
        )
      `)
      .eq('user_id', user.id)
      .eq('deleted', false)
      .eq('needs_assignment', true)
      .order('created_at', { ascending: false })
    
    if (facesError) {
      console.error('❌ Error fetching unassigned faces:', facesError)
      throw createError({ 
        statusCode: 500, 
        statusMessage: `Failed to fetch faces: ${facesError.message}` 
      })
    }
    
    console.log(`📋 Found ${faces?.length || 0} unassigned faces for user ${user.id}`)
    
    return {
      success: true,
      count: faces?.length || 0,
      faces: faces || []
    }
    
  } catch (error) {
    console.error('❌ Error fetching unassigned faces:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: `Failed to fetch faces: ${error.message}` 
    })
  }
})
