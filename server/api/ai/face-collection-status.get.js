import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  try {
    // Get user from auth context
    const user = event.context.user;
    if (!user) {
      // Don't log authentication errors as they're expected during testing
      throw createError({ 
        statusCode: 401, 
        statusMessage: "Authentication required" 
      });
    }

    const config = useRuntimeConfig()
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey || config.public.supabaseKey
    )

    // Get user's face collection
    const { data: collection, error: collectionError } = await supabase
      .from('face_collections')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (collectionError && collectionError.code !== 'PGRST116') {
      throw createError({ 
        statusCode: 500, 
        statusMessage: `Database error: ${collectionError.message}` 
      });
    }

    // Get face statistics
    const { data: faceStats, error: faceError } = await supabase
      .from('faces')
      .select('id, confidence, created_at')
      .eq('user_id', user.id)
      .eq('deleted', false);

    if (faceError) {
      throw createError({ 
        statusCode: 500, 
        statusMessage: `Database error: ${faceError.message}` 
      });
    }

    // Get person group statistics
    const { data: personStats, error: personError } = await supabase
      .from('person_groups')
      .select('id, name, created_at')
      .eq('user_id', user.id)
      .eq('deleted', false);

    if (personError) {
      throw createError({ 
        statusCode: 500, 
        statusMessage: `Database error: ${personError.message}` 
      });
    }

    // Calculate statistics
    const totalFaces = faceStats?.length || 0;
    const totalPeople = personStats?.length || 0;
    const avgConfidence = totalFaces > 0 
      ? faceStats.reduce((sum, face) => sum + face.confidence, 0) / totalFaces 
      : 0;

    // Get recent activity
    const recentFaces = faceStats
      ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5) || [];

    const result = {
      success: true,
      hasCollection: !!collection,
      collection: collection ? {
        id: collection.id,
        aws_collection_id: collection.aws_collection_id,
        created_at: collection.created_at
      } : null,
      statistics: {
        totalFaces,
        totalPeople,
        averageConfidence: Math.round(avgConfidence * 100) / 100,
        recentActivity: recentFaces.length
      },
      recentFaces: recentFaces.map(face => ({
        id: face.id,
        confidence: face.confidence,
        created_at: face.created_at
      })),
      people: personStats?.map(person => ({
        id: person.id,
        name: person.name,
        created_at: person.created_at
      })) || []
    };

    return result;

  } catch (error) {
    console.error('❌ Face collection status error:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: `Failed to get face collection status: ${error.message}` 
    });
  }
});
