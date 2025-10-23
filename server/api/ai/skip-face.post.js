import { getHeader, createError } from 'h3'

/**
 * Mark a face as permanently skipped
 * Face will not appear in unassigned faces anymore
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
  
  console.log(`⏭️ Permanently skipping face ${faceId}`)
  
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
    
    // 2. Mark face as skipped
    const { error: updateError } = await supabase
      .from('faces')
      .update({ 
        skipped: true,
        needs_assignment: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', faceId)
    
    if (updateError) {
      console.error('❌ Error skipping face:', updateError)
      throw createError({ 
        statusCode: 500, 
        statusMessage: `Failed to skip face: ${updateError.message}` 
      })
    }
    
    console.log(`✅ Face ${faceId} permanently skipped`)
    
    return {
      success: true,
      faceId
    }
    
  } catch (error) {
    console.error('❌ Error skipping face:', error)
    
    if (error.statusCode) {
      throw error // Re-throw createError errors
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: `Failed to skip face: ${error.message}` 
    })
  }
})

