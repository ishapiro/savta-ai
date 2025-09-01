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

    const { faceId, limit = 10, similarityThreshold = 0.8 } = await readBody(event);
    
    if (!faceId) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: "faceId is required" 
      });
    }

    const config = useRuntimeConfig()
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey || config.public.supabaseKey
    )

    // Get the source face vector
    const { data: sourceFace, error: sourceError } = await supabase
      .from('faces')
      .select('id, face_vector, confidence, bounding_box, asset_id')
      .eq('id', faceId)
      .eq('user_id', user.id)
      .eq('deleted', false)
      .single();

    if (sourceError || !sourceFace) {
      throw createError({ 
        statusCode: 404, 
        statusMessage: "Source face not found" 
      });
    }

    // Find similar faces using vector similarity search
    const { data: similarFaces, error: similarityError } = await supabase
      .rpc('find_similar_faces', {
        source_face_id: faceId,
        similarity_threshold: similarityThreshold,
        max_results: limit
      });

    if (similarityError) {
      // Fallback to manual similarity search if RPC function doesn't exist
      console.log('⚠️ RPC function not found, using manual similarity search');
      return await manualSimilaritySearch(supabase, user.id, sourceFace, limit, similarityThreshold);
    }

    // Get additional details for similar faces
    const faceIds = similarFaces.map(f => f.face_id);
    const { data: faceDetails, error: detailsError } = await supabase
      .from('faces')
      .select(`
        id,
        confidence,
        bounding_box,
        asset_id,
        created_at,
        assets!inner(
          id,
          title,
          storage_url,
          ai_caption
        )
      `)
      .in('id', faceIds)
      .eq('user_id', user.id)
      .eq('deleted', false);

    if (detailsError) {
      throw createError({ 
        statusCode: 500, 
        statusMessage: `Failed to get face details: ${detailsError.message}` 
      });
    }

    // Get person assignments for these faces
    const { data: personAssignments, error: personError } = await supabase
      .from('face_person_links')
      .select(`
        face_id,
        confidence as assignment_confidence,
        assigned_by,
        person_groups!inner(
          id,
          name,
          display_name,
          relationship
        )
      `)
      .in('face_id', faceIds)
      .eq('deleted', false);

    if (personError) {
      console.warn('⚠️ Warning: Failed to get person assignments:', personError.message);
    }

    // Combine results
    const results = similarFaces.map(similarFace => {
      const faceDetail = faceDetails.find(f => f.id === similarFace.face_id);
      const personAssignment = personAssignments?.find(p => p.face_id === similarFace.face_id);
      
      return {
        faceId: similarFace.face_id,
        similarityScore: similarFace.similarity_score,
        confidence: faceDetail?.confidence,
        boundingBox: faceDetail?.bounding_box,
        asset: faceDetail?.assets ? {
          id: faceDetail.assets.id,
          title: faceDetail.assets.title,
          storageUrl: faceDetail.assets.storage_url,
          caption: faceDetail.assets.ai_caption
        } : null,
        person: personAssignment?.person_groups ? {
          id: personAssignment.person_groups.id,
          name: personAssignment.person_groups.name,
          displayName: personAssignment.person_groups.display_name,
          relationship: personAssignment.person_groups.relationship,
          assignmentConfidence: personAssignment.assignment_confidence,
          assignedBy: personAssignment.assigned_by
        } : null,
        createdAt: faceDetail?.created_at
      };
    });

    return {
      success: true,
      sourceFace: {
        id: sourceFace.id,
        confidence: sourceFace.confidence,
        boundingBox: sourceFace.bounding_box,
        assetId: sourceFace.asset_id
      },
      similarFaces: results,
      totalFound: results.length,
      similarityThreshold,
      limit
    };

  } catch (error) {
    console.error('❌ Face similarity search error:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: `Failed to find similar faces: ${error.message}` 
    });
  }
});

// Fallback manual similarity search function
async function manualSimilaritySearch(supabase, userId, sourceFace, limit, similarityThreshold) {
  try {
    // Get all faces for the user (excluding the source face)
    const { data: allFaces, error: facesError } = await supabase
      .from('faces')
      .select(`
        id,
        face_vector,
        confidence,
        bounding_box,
        asset_id,
        created_at,
        assets!inner(
          id,
          title,
          storage_url,
          ai_caption
        )
      `)
      .eq('user_id', userId)
      .eq('deleted', false)
      .neq('id', sourceFace.id);

    if (facesError) {
      throw createError({ 
        statusCode: 500, 
        statusMessage: `Failed to get faces: ${facesError.message}` 
      });
    }

    // Calculate similarities manually
    const similarities = [];
    for (const face of allFaces) {
      // Calculate cosine similarity between face vectors
      const similarity = calculateCosineSimilarity(sourceFace.face_vector, face.face_vector);
      
      if (similarity >= similarityThreshold) {
        similarities.push({
          faceId: face.id,
          similarityScore: similarity,
          face: face
        });
      }
    }

    // Sort by similarity score (highest first) and limit results
    similarities.sort((a, b) => b.similarityScore - a.similarityScore);
    const topSimilarities = similarities.slice(0, limit);

    // Get person assignments for top similar faces
    const faceIds = topSimilarities.map(s => s.faceId);
    const { data: personAssignments, error: personError } = await supabase
      .from('face_person_links')
      .select(`
        face_id,
        confidence as assignment_confidence,
        assigned_by,
        person_groups!inner(
          id,
          name,
          display_name,
          relationship
        )
      `)
      .in('face_id', faceIds)
      .eq('deleted', false);

    if (personError) {
      console.warn('⚠️ Warning: Failed to get person assignments:', personError.message);
    }

    // Format results
    const results = topSimilarities.map(similarity => {
      const personAssignment = personAssignments?.find(p => p.face_id === similarity.faceId);
      
      return {
        faceId: similarity.faceId,
        similarityScore: similarity.similarityScore,
        confidence: similarity.face.confidence,
        boundingBox: similarity.face.bounding_box,
        asset: similarity.face.assets ? {
          id: similarity.face.assets.id,
          title: similarity.face.assets.title,
          storageUrl: similarity.face.assets.storage_url,
          caption: similarity.face.assets.ai_caption
        } : null,
        person: personAssignment?.person_groups ? {
          id: personAssignment.person_groups.id,
          name: personAssignment.person_groups.name,
          displayName: personAssignment.person_groups.display_name,
          relationship: personAssignment.person_groups.relationship,
          assignmentConfidence: personAssignment.assignment_confidence,
          assignedBy: personAssignment.assigned_by
        } : null,
        createdAt: similarity.face.created_at
      };
    });

    return {
      success: true,
      sourceFace: {
        id: sourceFace.id,
        confidence: sourceFace.confidence,
        boundingBox: sourceFace.bounding_box,
        assetId: sourceFace.asset_id
      },
      similarFaces: results,
      totalFound: results.length,
      similarityThreshold,
      limit,
      method: 'manual'
    };

  } catch (error) {
    console.error('❌ Manual similarity search error:', error);
    throw error;
  }
}

// Helper function to calculate cosine similarity between two vectors
function calculateCosineSimilarity(vector1, vector2) {
  if (!vector1 || !vector2 || vector1.length !== vector2.length) {
    return 0;
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < vector1.length; i++) {
    dotProduct += vector1[i] * vector2[i];
    norm1 += vector1[i] * vector1[i];
    norm2 += vector2[i] * vector2[i];
  }

  norm1 = Math.sqrt(norm1);
  norm2 = Math.sqrt(norm2);

  if (norm1 === 0 || norm2 === 0) {
    return 0;
  }

  return dotProduct / (norm1 * norm2);
}
