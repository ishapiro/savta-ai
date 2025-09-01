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

    const { action, personGroup } = await readBody(event);
    
    if (!action || !personGroup) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: "action and personGroup required" 
      });
    }

    const config = useRuntimeConfig()
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey || config.public.supabaseKey
    )

    switch (action) {
      case 'create':
        return await createPersonGroup(supabase, user.id, personGroup);
      
      case 'update':
        return await updatePersonGroup(supabase, user.id, personGroup);
      
      case 'delete':
        return await deletePersonGroup(supabase, user.id, personGroup.id);
      
      default:
        throw createError({ 
          statusCode: 400, 
          statusMessage: "Invalid action. Must be 'create', 'update', or 'delete'" 
        });
    }

  } catch (error) {
    console.error('❌ Person group management error:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: `Failed to manage person group: ${error.message}` 
    });
  }
});

async function createPersonGroup(supabase, userId, personGroup) {
  const { name, displayName, description, relationship, isPrimaryPerson } = personGroup;
  
  if (!name) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: "Person name is required" 
    });
  }

  // Check if person with this name already exists for this user
  const { data: existingPerson, error: checkError } = await supabase
    .from('person_groups')
    .select('id')
    .eq('user_id', userId)
    .eq('name', name)
    .eq('deleted', false)
    .single();

  if (existingPerson) {
    throw createError({ 
      statusCode: 409, 
      statusMessage: "A person with this name already exists" 
    });
  }

  // Create new person group
  const { data: newPerson, error: insertError } = await supabase
    .from('person_groups')
    .insert({
      user_id: userId,
      name: name,
      display_name: displayName || name,
      description: description,
      relationship: relationship,
      is_primary_person: isPrimaryPerson || false
    })
    .select()
    .single();

  if (insertError) {
    throw createError({ 
      statusCode: 500, 
      statusMessage: `Failed to create person group: ${insertError.message}` 
    });
  }

  console.log('👤 Created person group:', newPerson.id, 'for user:', userId);

  return {
    success: true,
    personGroup: {
      id: newPerson.id,
      name: newPerson.name,
      displayName: newPerson.display_name,
      description: newPerson.description,
      relationship: newPerson.relationship,
      isPrimaryPerson: newPerson.is_primary_person,
      createdAt: newPerson.created_at
    }
  };
}

async function updatePersonGroup(supabase, userId, personGroup) {
  const { id, name, displayName, description, relationship, isPrimaryPerson } = personGroup;
  
  if (!id) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: "Person ID is required for updates" 
    });
  }

  // Verify the person group belongs to the user
  const { data: existingPerson, error: fetchError } = await supabase
    .from('person_groups')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .eq('deleted', false)
    .single();

  if (!existingPerson) {
    throw createError({ 
      statusCode: 404, 
      statusMessage: "Person group not found" 
    });
  }

  // Check for name conflicts if name is being changed
  if (name && name !== existingPerson.name) {
    const { data: nameConflict, error: nameCheckError } = await supabase
      .from('person_groups')
      .select('id')
      .eq('user_id', userId)
      .eq('name', name)
      .eq('deleted', false)
      .neq('id', id)
      .single();

    if (nameConflict) {
      throw createError({ 
        statusCode: 409, 
        statusMessage: "A person with this name already exists" 
      });
    }
  }

  // Update person group
  const updateData = {};
  if (name) updateData.name = name;
  if (displayName !== undefined) updateData.display_name = displayName;
  if (description !== undefined) updateData.description = description;
  if (relationship !== undefined) updateData.relationship = relationship;
  if (isPrimaryPerson !== undefined) updateData.is_primary_person = isPrimaryPerson;

  const { data: updatedPerson, error: updateError } = await supabase
    .from('person_groups')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (updateError) {
    throw createError({ 
      statusCode: 500, 
      statusMessage: `Failed to update person group: ${updateError.message}` 
    });
  }

  console.log('✏️ Updated person group:', updatedPerson.id, 'for user:', userId);

  return {
    success: true,
    personGroup: {
      id: updatedPerson.id,
      name: updatedPerson.name,
      displayName: updatedPerson.display_name,
      description: updatedPerson.description,
      relationship: updatedPerson.relationship,
      isPrimaryPerson: updatedPerson.is_primary_person,
      createdAt: updatedPerson.created_at,
      updatedAt: updatedPerson.updated_at
    }
  };
}

async function deletePersonGroup(supabase, userId, personGroupId) {
  if (!personGroupId) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: "Person ID is required for deletion" 
    });
  }

  // Verify the person group belongs to the user
  const { data: existingPerson, error: fetchError } = await supabase
    .from('person_groups')
    .select('*')
    .eq('id', personGroupId)
    .eq('user_id', userId)
    .eq('deleted', false)
    .single();

  if (!existingPerson) {
    throw createError({ 
      statusCode: 404, 
      statusMessage: "Person group not found" 
    });
  }

  // Soft delete the person group
  const { error: deleteError } = await supabase
    .from('person_groups')
    .update({ deleted: true })
    .eq('id', personGroupId)
    .eq('user_id', userId);

  if (deleteError) {
    throw createError({ 
      statusCode: 500, 
      statusMessage: `Failed to delete person group: ${deleteError.message}` 
    });
  }

  // Also soft delete associated face-person links
  const { error: linkDeleteError } = await supabase
    .from('face_person_links')
    .update({ deleted: true })
    .eq('person_group_id', personGroupId);

  if (linkDeleteError) {
    console.warn('⚠️ Warning: Failed to delete face-person links:', linkDeleteError.message);
  }

  console.log('🗑️ Deleted person group:', personGroupId, 'for user:', userId);

  return {
    success: true,
    message: "Person group deleted successfully"
  };
}
