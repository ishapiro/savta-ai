import { getHeader, createError } from 'h3'

/**
 * Create a new person and assign a face to them
 * Called when user identifies a new person in a photo
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
  const { faceId, personName, displayName, relationship } = body
  
  if (!faceId || !personName) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Missing required parameters: faceId, personName' 
    })
  }
  
  console.log(`👤 Creating new person "${personName}" and assigning face ${faceId}`)
  
  try {
    // 1. Verify face belongs to user and is not already assigned
    const { data: face, error: faceError } = await supabase
      .from('faces')
      .select('id, user_id, asset_id')
      .eq('id', faceId)
      .eq('user_id', user.id)
      .eq('deleted', false)
      .single()
    
    if (faceError || !face) {
      throw createError({ statusCode: 404, statusMessage: 'Face not found' })
    }
    
    // 2. Create new person group
    const { data: personGroup, error: personError } = await supabase
      .from('person_groups')
      .insert({
        user_id: user.id,
        name: personName,
        display_name: displayName || personName,
        relationship: relationship || null,
        is_primary_person: false
      })
      .select()
      .single()
    
    if (personError) {
      console.error('❌ Error creating person group:', personError)
      throw createError({ 
        statusCode: 500, 
        statusMessage: `Failed to create person: ${personError.message}` 
      })
    }
    
    console.log(`✅ Created person group: ${personGroup.id} (${personName})`)
    
    // 3. Assign face to new person
    const { data: link, error: linkError } = await supabase
      .from('face_person_links')
      .insert({
        face_id: faceId,
        person_group_id: personGroup.id,
        confidence: 1.0, // User-assigned, full confidence
        assigned_by: 'user',
        assigned_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (linkError) {
      console.error('❌ Error creating face-person link:', linkError)
      // Try to clean up person group
      await supabase
        .from('person_groups')
        .update({ deleted: true })
        .eq('id', personGroup.id)
      
      throw createError({ 
        statusCode: 500, 
        statusMessage: `Failed to assign face: ${linkError.message}` 
      })
    }
    
    // 4. Update face to mark as no longer needing assignment
    await supabase
      .from('faces')
      .update({ 
        needs_assignment: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', faceId)
    
    // 5. Set this face as the avatar for the person group
    await supabase
      .from('person_groups')
      .update({ avatar_face_id: faceId })
      .eq('id', personGroup.id)
    
    console.log(`✅ Face ${faceId} assigned to new person ${personName}`)
    
    return {
      success: true,
      person: {
        id: personGroup.id,
        name: personGroup.name,
        displayName: personGroup.display_name,
        relationship: personGroup.relationship
      },
      assignment: {
        faceId,
        personGroupId: personGroup.id,
        linkId: link.id
      }
    }
    
  } catch (error) {
    console.error('❌ Error creating person from face:', error)
    
    if (error.statusCode) {
      throw error // Re-throw createError errors
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: `Failed to create person: ${error.message}` 
    })
  }
})

