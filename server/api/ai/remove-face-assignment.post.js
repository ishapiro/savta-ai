import { getHeader, createError } from 'h3'

/**
 * Remove face assignment from a person
 * Marks the face as needing assignment again
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
  
  // Get request body
  const body = await readBody(event)
  const { faceId } = body
  
  if (!faceId) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Missing required parameter: faceId' 
    })
  }
  
  console.log(`🔓 Removing assignment for face ${faceId}`)
  
  try {
    // 1. Verify face belongs to user
    const { data: face, error: faceError } = await supabase
      .from('faces')
      .select('id, user_id')
      .eq('id', faceId)
      .eq('user_id', user.id)
      .eq('deleted', false)
      .single()
    
    if (faceError || !face) {
      throw createError({ statusCode: 404, statusMessage: 'Face not found' })
    }
    
    // 2. Soft delete the face-person link
    const { error: linkError } = await supabase
      .from('face_person_links')
      .update({ 
        deleted: true,
        updated_at: new Date().toISOString()
      })
      .eq('face_id', faceId)
      .eq('deleted', false)
    
    if (linkError) {
      console.error('❌ Error removing face assignment:', linkError)
      throw createError({ 
        statusCode: 500, 
        statusMessage: `Failed to remove assignment: ${linkError.message}` 
      })
    }
    
    // 3. Mark face as needing assignment again
    await supabase
      .from('faces')
      .update({ 
        needs_assignment: true,
        auto_assigned: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', faceId)
    
    console.log(`✅ Assignment removed for face ${faceId}`)
    
    return {
      success: true,
      faceId,
      message: 'Face assignment removed successfully'
    }
    
  } catch (error) {
    console.error('❌ Error removing face assignment:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: `Failed to remove assignment: ${error.message}` 
    })
  }
})

