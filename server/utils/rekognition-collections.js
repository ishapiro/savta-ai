import { 
  RekognitionClient, 
  CreateCollectionCommand, 
  DescribeCollectionCommand,
  DeleteCollectionCommand,
  DeleteFacesCommand,
  ListFacesCommand
} from "@aws-sdk/client-rekognition"

const client = new RekognitionClient({ 
  region: process.env.AWS_REGION || 'us-east-1'
})

/**
 * Ensure a user has an AWS Rekognition collection
 * Creates collection if it doesn't exist
 * Format: savta-user-{userId}
 * 
 * @param {string} userId - User ID (UUID)
 * @returns {Promise<{collectionId: string, exists: boolean}>}
 */
export async function ensureUserCollection(userId) {
  const collectionId = `savta-user-${userId}`
  
  try {
    // Check if collection already exists
    const describeResult = await client.send(
      new DescribeCollectionCommand({ CollectionId: collectionId })
    )
    
    console.log(`✅ Collection exists: ${collectionId}`)
    return { 
      collectionId, 
      exists: true,
      faceCount: describeResult.FaceCount || 0,
      arn: describeResult.CollectionARN
    }
  } catch (error) {
    if (error.name === 'ResourceNotFoundException') {
      // Collection doesn't exist, create it
      console.log(`📦 Creating new collection: ${collectionId}`)
      
      const createResult = await client.send(
        new CreateCollectionCommand({ CollectionId: collectionId })
      )
      
      console.log(`✅ Collection created: ${createResult.CollectionArn}`)
      return { 
        collectionId, 
        exists: false,
        faceCount: 0,
        arn: createResult.CollectionArn
      }
    }
    
    // Other error - rethrow
    console.error('❌ Error with Rekognition collection:', error)
    throw error
  }
}

/**
 * Store or update collection info in database
 * 
 * @param {object} supabase - Supabase client
 * @param {string} userId - User ID
 * @param {string} collectionId - AWS collection ID
 * @param {string} arn - Collection ARN
 * @param {number} faceCount - Number of faces in collection
 * @returns {Promise<object>} Collection record
 */
export async function saveCollectionToDb(supabase, userId, collectionId, arn, faceCount = 0) {
  const { data, error } = await supabase
    .from('face_collections')
    .upsert({
      user_id: userId,
      aws_collection_id: collectionId,
      rekognition_arn: arn,
      face_count: faceCount,
      last_indexed_at: new Date().toISOString()
    }, { 
      onConflict: 'user_id',
      ignoreDuplicates: false 
    })
    .select()
    .single()
    
  if (error) {
    console.error('❌ Error saving collection to database:', error)
    throw error
  }
  
  console.log(`💾 Collection saved to database: ${collectionId}`)
  return data
}

/**
 * Get collection info from database
 * 
 * @param {object} supabase - Supabase client
 * @param {string} userId - User ID
 * @returns {Promise<object|null>} Collection record or null
 */
export async function getCollectionFromDb(supabase, userId) {
  const { data, error } = await supabase
    .from('face_collections')
    .select('*')
    .eq('user_id', userId)
    .eq('deleted', false)
    .single()
    
  if (error) {
    if (error.code === 'PGRST116') {
      // No collection found
      return null
    }
    console.error('❌ Error fetching collection from database:', error)
    throw error
  }
  
  return data
}

/**
 * Delete a face from Rekognition collection
 * 
 * @param {string} collectionId - Collection ID
 * @param {string[]} faceIds - Array of face IDs to delete
 * @returns {Promise<object>} Delete result
 */
export async function deleteFacesFromCollection(collectionId, faceIds) {
  if (!faceIds || faceIds.length === 0) {
    return { deletedFaces: [] }
  }
  
  try {
    const result = await client.send(
      new DeleteFacesCommand({
        CollectionId: collectionId,
        FaceIds: faceIds
      })
    )
    
    console.log(`🗑️ Deleted ${result.DeletedFaces?.length || 0} faces from collection`)
    return result
  } catch (error) {
    console.error('❌ Error deleting faces from collection:', error)
    throw error
  }
}

/**
 * Delete entire collection
 * WARNING: This deletes all faces in the collection
 * 
 * @param {string} collectionId - Collection ID
 * @returns {Promise<object>} Delete result
 */
export async function deleteCollection(collectionId) {
  try {
    const result = await client.send(
      new DeleteCollectionCommand({ CollectionId: collectionId })
    )
    
    console.log(`🗑️ Collection deleted: ${collectionId}`)
    return result
  } catch (error) {
    console.error('❌ Error deleting collection:', error)
    throw error
  }
}

/**
 * List faces in a collection
 * 
 * @param {string} collectionId - Collection ID
 * @param {number} maxResults - Maximum results to return
 * @returns {Promise<Array>} List of faces
 */
export async function listCollectionFaces(collectionId, maxResults = 100) {
  try {
    const result = await client.send(
      new ListFacesCommand({
        CollectionId: collectionId,
        MaxResults: maxResults
      })
    )
    
    return result.Faces || []
  } catch (error) {
    console.error('❌ Error listing collection faces:', error)
    throw error
  }
}

