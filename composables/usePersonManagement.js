// Vue composable for person management functionality
export const usePersonManagement = () => {
  const supabase = useNuxtApp().$supabase;
  const user = useSupabaseUser();

  // State
  const personGroups = ref([]);
  const unassignedFaces = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Fetch all person groups for the current user
  const fetchPersonGroups = async () => {
    try {
      loading.value = true;
      error.value = null;
      
      if (!user.value) {
        throw new Error('User not authenticated');
      }
      
      // First get person groups
      const { data: personGroupsData, error: personGroupsError } = await supabase
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
          avatar_face_id
        `)
        .eq('user_id', user.value.id)
        .eq('deleted', false)
        .order('name');
      
      if (personGroupsError) {
        throw personGroupsError;
      }
      
      // Then get face counts for each person group
      const personGroupsWithCounts = await Promise.all(
        personGroupsData.map(async (person) => {
          const { count, error: countError } = await supabase
            .from('face_person_links')
            .select('*', { count: 'exact', head: true })
            .eq('person_group_id', person.id)
            .eq('deleted', false);
          
          if (countError) {
            console.error('Error getting face count for person:', person.id, countError);
            return { ...person, face_count: 0 };
          }
          
          return { ...person, face_count: count || 0 };
        })
      );
      
      personGroups.value = personGroupsWithCounts;
      return personGroupsWithCounts;
    } catch (err) {
      error.value = err.message || 'Failed to fetch person groups';
      console.error('Error fetching person groups:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Create a new person group
  const createPersonGroup = async (personData) => {
    try {
      loading.value = true;
      error.value = null;
      
      if (!user.value) {
        throw new Error('User not authenticated');
      }
      
      const { data, error: dbError } = await supabase
        .from('person_groups')
        .insert([{
          user_id: user.value.id,
          name: personData.name,
          display_name: personData.display_name,
          description: personData.description,
          relationship: personData.relationship,
          is_primary_person: personData.is_primary_person || false
        }])
        .select()
        .single();
      
      if (dbError) {
        throw dbError;
      }
      
      // Refresh the person groups list
      await fetchPersonGroups();
      return data;
    } catch (err) {
      error.value = err.message || 'Failed to create person group';
      console.error('Error creating person group:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update an existing person group
  const updatePersonGroup = async (personId, personData) => {
    try {
      loading.value = true;
      error.value = null;
      
      if (!user.value) {
        throw new Error('User not authenticated');
      }
      
      const { data, error: dbError } = await supabase
        .from('person_groups')
        .update({
          name: personData.name,
          display_name: personData.display_name,
          description: personData.description,
          relationship: personData.relationship,
          is_primary_person: personData.is_primary_person || false,
          updated_at: new Date().toISOString()
        })
        .eq('id', personId)
        .eq('user_id', user.value.id)
        .select()
        .single();
      
      if (dbError) {
        throw dbError;
      }
      
      // Refresh the person groups list
      await fetchPersonGroups();
      return data;
    } catch (err) {
      error.value = err.message || 'Failed to update person group';
      console.error('Error updating person group:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Delete a person group
  const deletePersonGroup = async (personId) => {
    try {
      loading.value = true;
      error.value = null;
      
      if (!user.value) {
        throw new Error('User not authenticated');
      }
      
      const { error: dbError } = await supabase
        .from('person_groups')
        .update({ deleted: true })
        .eq('id', personId)
        .eq('user_id', user.value.id);
      
      if (dbError) {
        throw dbError;
      }
      
      // Refresh the person groups list
      await fetchPersonGroups();
      return { success: true };
    } catch (err) {
      error.value = err.message || 'Failed to delete person group';
      console.error('Error deleting person group:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Fetch unassigned faces
  const fetchUnassignedFaces = async (limit = 50) => {
    try {
      loading.value = true;
      error.value = null;
      
      console.log('fetchUnassignedFaces called, user:', user.value);
      
      if (!user.value) {
        throw new Error('User not authenticated');
      }
      
      console.log('User ID:', user.value.id);
      
      const { data, error: dbError } = await supabase
        .rpc('find_unassigned_faces', {
          user_id_param: user.value.id,
          limit_count: limit
        });
      
      if (dbError) {
        throw dbError;
      }
      
      console.log('Unassigned faces data:', data);
      unassignedFaces.value = data || [];
      return data;
    } catch (err) {
      error.value = err.message || 'Failed to fetch unassigned faces';
      console.error('Error fetching unassigned faces:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Assign a face to a person
  const assignFaceToPerson = async (faceId, personGroupId, confidence = 1.0) => {
    try {
      loading.value = true;
      error.value = null;
      
      if (!user.value) {
        throw new Error('User not authenticated');
      }
      
      const { data, error: dbError } = await supabase
        .from('face_person_links')
        .insert([{
          face_id: faceId,
          person_group_id: personGroupId,
          confidence: confidence,
          assigned_by: 'user'
        }])
        .select()
        .single();
      
      if (dbError) {
        throw dbError;
      }
      
      // Refresh both lists
      await Promise.all([
        fetchPersonGroups(),
        fetchUnassignedFaces()
      ]);
      
      return data;
    } catch (err) {
      error.value = err.message || 'Failed to assign face to person';
      console.error('Error assigning face to person:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Find similar faces
  const findSimilarFaces = async (faceId, limit = 10) => {
    try {
      loading.value = true;
      error.value = null;
      
      if (!user.value) {
        throw new Error('User not authenticated');
      }
      
      const { data, error: dbError } = await supabase
        .rpc('find_similar_faces', {
          source_face_id: faceId,
          similarity_threshold: 0.8,
          max_results: limit
        });
      
      if (dbError) {
        throw dbError;
      }
      
      return data || [];
    } catch (err) {
      error.value = err.message || 'Failed to find similar faces';
      console.error('Error finding similar faces:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Get faces for a specific person
  const getFacesByPerson = async (personGroupId, limit = 50) => {
    try {
      loading.value = true;
      error.value = null;
      
      if (!user.value) {
        throw new Error('User not authenticated');
      }
      
      const { data, error: dbError } = await supabase
        .rpc('find_faces_by_person', {
          person_group_id: personGroupId,
          limit_count: limit
        });
      
      if (dbError) {
        throw dbError;
      }
      
      return data || [];
    } catch (err) {
      error.value = err.message || 'Failed to get faces by person';
      console.error('Error getting faces by person:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    personGroups: readonly(personGroups),
    unassignedFaces: readonly(unassignedFaces),
    loading: readonly(loading),
    error: readonly(error),
    
    // Methods
    fetchPersonGroups,
    createPersonGroup,
    updatePersonGroup,
    deletePersonGroup,
    fetchUnassignedFaces,
    assignFaceToPerson,
    findSimilarFaces,
    getFacesByPerson
  };
};
