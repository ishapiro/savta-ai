// GET endpoint to fetch unassigned faces for a user
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

    // Get query parameters
    const query = getQuery(event);
    const limit = parseInt(query.limit) || 50;

    // Initialize Supabase client
    const config = useRuntimeConfig();
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey || config.public.supabaseKey
    );

    // Call the database function to find unassigned faces
    const { data: unassignedFaces, error } = await supabase
      .rpc('find_unassigned_faces', {
        user_id_param: userId,
        limit_param: limit
      });

    if (error) {
      console.error('❌ Error fetching unassigned faces:', error);
      throw createError({ 
        statusCode: 500, 
        statusMessage: "Failed to fetch unassigned faces" 
      });
    }

    return {
      success: true,
      unassignedFaces: unassignedFaces || [],
      count: unassignedFaces?.length || 0
    };

  } catch (error) {
    console.error('❌ Error in unassigned-faces GET:', error);
    
    // Preserve authentication errors
    if (error.statusCode === 401) {
      throw error;
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: `Failed to fetch unassigned faces: ${error.message}` 
    });
  }
});
