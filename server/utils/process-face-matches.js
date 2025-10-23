/**
 * Process faces from IndexFaces with SearchFaces results
 * Handles auto-assignment logic and determination of what needs user input
 */

/**
 * Process faces with their match results and determine assignment strategy
 * 
 * @param {Array} facesWithMatches - Array of faces with their match results
 * @param {string} assetId - Asset ID
 * @param {string} userId - User ID
 * @param {string} collectionId - Collection ID
 * @param {object} supabase - Supabase client
 * @returns {Promise<object>} Results categorized by assignment type
 */
export async function processFacesWithMatches(facesWithMatches, assetId, userId, collectionId, supabase) {
  const results = {
    autoAssigned: [],
    needsUserInput: [],
    newFaces: []
  }
  
  console.log(`🔍 Processing ${facesWithMatches.length} faces for asset ${assetId}`)
  
  for (const face of facesWithMatches) {
    try {
      // Filter matches to only include this user's faces
      const userMatches = await filterUserMatches(face.matches, userId, supabase)
      
      console.log(`👤 Face ${face.faceId}: Found ${userMatches.length} user matches`)
      
      if (userMatches.length === 0) {
        // No matches - needs user to create new person or assign to existing
        const storedFace = await storeFaceInDb(face, assetId, userId, collectionId, true, false, supabase)
        results.needsUserInput.push({
          face: storedFace,
          suggestions: []
        })
        console.log(`📝 Face needs user input: ${storedFace.id}`)
      } else {
        const bestMatch = userMatches[0]
        const similarity = bestMatch.Similarity
        
        console.log(`🎯 Best match similarity: ${similarity}%`)
        
        if (similarity >= 95) {
          // Very high confidence - auto-assign
          const personGroup = await getPersonGroupForFaceId(bestMatch.Face.FaceId, supabase)
          
          if (personGroup) {
            const storedFace = await storeFaceInDb(face, assetId, userId, collectionId, false, true, supabase)
            await assignFaceToPerson(storedFace.id, personGroup.id, similarity / 100, 'system', supabase)
            
            results.autoAssigned.push({ 
              face: storedFace, 
              person: personGroup,
              similarity 
            })
            
            console.log(`✅ Auto-assigned face ${storedFace.id} to ${personGroup.name} (${similarity}%)`)
          } else {
            // No person group found for match - needs user input
            const storedFace = await storeFaceInDb(face, assetId, userId, collectionId, true, false, supabase)
            const suggestions = await getSuggestedPeople(userMatches, supabase)
            results.needsUserInput.push({ face: storedFace, suggestions })
          }
        } else if (similarity >= 80) {
          // Medium confidence - prompt user
          const storedFace = await storeFaceInDb(face, assetId, userId, collectionId, true, false, supabase)
          const suggestions = await getSuggestedPeople(userMatches, supabase)
          
          results.needsUserInput.push({ 
            face: storedFace, 
            suggestions 
          })
          
          console.log(`📝 Face needs user confirmation: ${storedFace.id} (similarity: ${similarity}%)`)
        } else {
          // Below threshold - treat as new face
          const storedFace = await storeFaceInDb(face, assetId, userId, collectionId, true, false, supabase)
          results.needsUserInput.push({
            face: storedFace,
            suggestions: []
          })
        }
      }
    } catch (error) {
      console.error(`❌ Error processing face ${face.faceId}:`, error)
      // Continue processing other faces
    }
  }
  
  console.log(`📊 Results: ${results.autoAssigned.length} auto-assigned, ${results.needsUserInput.length} need user input`)
  
  return results
}

/**
 * Filter matches to only include faces belonging to the current user
 * 
 * @param {Array} matches - Array of face matches from SearchFaces
 * @param {string} userId - User ID
 * @param {object} supabase - Supabase client
 * @returns {Promise<Array>} Filtered matches
 */
async function filterUserMatches(matches, userId, supabase) {
  if (!matches || matches.length === 0) {
    return []
  }
  
  const faceIds = matches.map(m => m.Face.FaceId)
  
  const { data, error } = await supabase
    .from('faces')
    .select('rekognition_face_id')
    .in('rekognition_face_id', faceIds)
    .eq('user_id', userId)
    .eq('deleted', false)
    
  if (error) {
    console.error('❌ Error filtering user matches:', error)
    return []
  }
  
  const userFaceIds = new Set(data.map(f => f.rekognition_face_id))
  
  // Filter matches to only include user's faces
  return matches.filter(m => userFaceIds.has(m.Face.FaceId))
}

/**
 * Store face in database
 * 
 * @param {object} face - Face data from IndexFaces
 * @param {string} assetId - Asset ID
 * @param {string} userId - User ID
 * @param {string} collectionId - Collection ID
 * @param {boolean} needsAssignment - Whether face needs user assignment
 * @param {boolean} autoAssigned - Whether face was auto-assigned
 * @param {object} supabase - Supabase client
 * @returns {Promise<object>} Stored face record
 */
async function storeFaceInDb(face, assetId, userId, collectionId, needsAssignment, autoAssigned, supabase) {
  const { data, error } = await supabase
    .from('faces')
    .insert({
      user_id: userId,
      asset_id: assetId,
      rekognition_face_id: face.faceId,
      rekognition_image_id: assetId,
      bounding_box: face.boundingBox,
      confidence: face.confidence / 100, // Convert to 0-1 scale
      needs_assignment: needsAssignment,
      auto_assigned: autoAssigned
    })
    .select(`
      *,
      assets (
        id,
        storage_url,
        thumbnail_url,
        title
      )
    `)
    .single()
    
  if (error) {
    console.error('❌ Error storing face in database:', error)
    throw error
  }
  
  return data
}

/**
 * Get person group for a given face ID
 * 
 * @param {string} faceId - Rekognition face ID
 * @param {object} supabase - Supabase client
 * @returns {Promise<object|null>} Person group or null
 */
async function getPersonGroupForFaceId(faceId, supabase) {
  const { data, error } = await supabase
    .from('faces')
    .select(`
      id,
      face_person_links!inner(
        person_group_id,
        person_groups!inner(
          id,
          name,
          display_name
        )
      )
    `)
    .eq('rekognition_face_id', faceId)
    .eq('deleted', false)
    .eq('face_person_links.deleted', false)
    .eq('face_person_links.person_groups.deleted', false)
    .single()
    
  if (error) {
    if (error.code === 'PGRST116') {
      // No person group found
      return null
    }
    console.error('❌ Error getting person group for face:', error)
    return null
  }
  
  // Extract person group from nested structure
  if (data?.face_person_links?.[0]?.person_groups) {
    return data.face_person_links[0].person_groups
  }
  
  return null
}

/**
 * Assign face to person
 * 
 * @param {string} faceId - Face ID (local database)
 * @param {string} personGroupId - Person group ID
 * @param {number} confidence - Confidence score (0-1)
 * @param {string} assignedBy - Who assigned ('system', 'user', 'ai')
 * @param {object} supabase - Supabase client
 * @returns {Promise<object>} Assignment record
 */
async function assignFaceToPerson(faceId, personGroupId, confidence, assignedBy, supabase) {
  const { data, error} = await supabase
    .from('face_person_links')
    .insert({
      face_id: faceId,
      person_group_id: personGroupId,
      confidence,
      assigned_by: assignedBy,
      assigned_at: new Date().toISOString()
    })
    .select()
    .single()
    
  if (error) {
    console.error('❌ Error assigning face to person:', error)
    throw error
  }
  
  return data
}

/**
 * Get suggested people from matches
 * 
 * @param {Array} matches - Array of face matches
 * @param {object} supabase - Supabase client
 * @returns {Promise<Array>} Array of suggested person groups
 */
async function getSuggestedPeople(matches, supabase) {
  if (!matches || matches.length === 0) {
    return []
  }
  
  const suggestions = []
  
  for (const match of matches.slice(0, 3)) { // Top 3 matches
    const personGroup = await getPersonGroupForFaceId(match.Face.FaceId, supabase)
    
    if (personGroup) {
      suggestions.push({
        person: personGroup,
        similarity: match.Similarity,
        faceId: match.Face.FaceId
      })
    }
  }
  
  return suggestions
}

