import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  try {
    // Get user from auth context
    const user = event.context.user;
    if (!user) {
      throw createError({ 
        statusCode: 401, 
        statusMessage: "Authentication required" 
      });
    }

    const { faceId, personGroupId, confidence = 1.0, assignedBy = 'user' } = await readBody(event);
    
    if (!faceId || !personGroupId) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: "faceId and personGroupId are required" 
      });
    }

    const config = useRuntimeConfig()
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey || config.public.supabaseKey
    )

    // Verify the face belongs to the user
    const { data: face, error: faceError } = await supabase
      .from('faces')
      .select('id, asset_id, confidence')
      .eq('id', faceId)
      .eq('user_id', user.id)
      .eq('deleted', false)
      .single();

    if (faceError || !face) {
      throw createError({ 
        statusCode: 404, 
        statusMessage: "Face not found" 
      });
    }

    // Verify the person group belongs to the user
    const { data: personGroup, error: personError } = await supabase
      .from('person_groups')
      .select('id, name, display_name')
      .eq('id', personGroupId)
      .eq('user_id', user.id)
      .eq('deleted', false)
      .single();

    if (personError || !personGroup) {
      throw createError({ 
        statusCode: 404, 
        statusMessage: "Person group not found" 
      });
    }

    // Check if face is already assigned to this person
    const { data: existingAssignment, error: checkError } = await supabase
      .from('face_person_links')
      .select('id')
      .eq('face_id', faceId)
      .eq('person_group_id', personGroupId)
      .eq('deleted', false)
      .single();

    if (existingAssignment) {
      throw createError({ 
        statusCode: 409, 
        statusMessage: "Face is already assigned to this person" 
      });
    }

    // Remove any existing assignments for this face
    const { error: removeError } = await supabase
      .from('face_person_links')
      .update({ deleted: true })
      .eq('face_id', faceId)
      .eq('deleted', false);

    if (removeError) {
      console.warn('⚠️ Warning: Failed to remove existing assignments:', removeError.message);
    }

    // Create new assignment
    const { data: assignment, error: insertError } = await supabase
      .from('face_person_links')
      .insert({
        face_id: faceId,
        person_group_id: personGroupId,
        confidence: confidence,
        assigned_by: assignedBy
      })
      .select(`
        id,
        face_id,
        person_group_id,
        confidence,
        assigned_by,
        assigned_at,
        person_groups!inner(
          id,
          name,
          display_name,
          relationship
        )
      `)
      .single();

    if (insertError) {
      throw createError({ 
        statusCode: 500, 
        statusMessage: `Failed to assign face to person: ${insertError.message}` 
      });
    }

    console.log('👤 Assigned face:', faceId, 'to person:', personGroup.name, 'for user:', user.id);

    return {
      success: true,
      assignment: {
        id: assignment.id,
        faceId: assignment.face_id,
        personGroupId: assignment.person_group_id,
        confidence: assignment.confidence,
        assignedBy: assignment.assigned_by,
        assignedAt: assignment.assigned_at,
        person: {
          id: assignment.person_groups.id,
          name: assignment.person_groups.name,
          displayName: assignment.person_groups.display_name,
          relationship: assignment.person_groups.relationship
        }
      }
    };

  } catch (error) {
    console.error('❌ Face assignment error:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: `Failed to assign face to person: ${error.message}` 
    });
  }
});
