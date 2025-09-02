// GET endpoint to list all person groups for a user
import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  try {
    // Get user ID from auth
    const user = event.context.user;
    if (!user) {
      throw createError({ 
        statusCode: 401, 
        statusMessage: "Authentication required" 
      });
    }

    const userId = user.id;

    // Initialize Supabase client
    const config = useRuntimeConfig();
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey || config.public.supabaseKey
    );

    // Get all person groups for the user
    const { data: personGroups, error } = await supabase
      .from('person_groups')
      .select(`
        id,
        name,
        display_name,
        description,
        relationship,
        is_primary_person,
        created_at,
        updated_at,
        avatar_face_id,
        (
          SELECT COUNT(*) 
          FROM face_person_links 
          WHERE person_group_id = person_groups.id
        ) as face_count
      `)
      .eq('user_id', userId)
      .eq('deleted', false)
      .order('name');

    if (error) {
      console.error('❌ Error fetching person groups:', error);
      throw createError({ 
        statusCode: 500, 
        statusMessage: "Failed to fetch person groups" 
      });
    }

    return {
      success: true,
      personGroups: personGroups || []
    };

  } catch (error) {
    console.error('❌ Error in person-groups GET:', error);
    
    // Preserve authentication errors
    if (error.statusCode === 401) {
      throw error;
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: `Failed to fetch person groups: ${error.message}` 
    });
  }
});
