#!/usr/bin/env node

/**
 * Cleanup Duplicate Faces Script
 * 
 * This script removes duplicate face records from the database and Rekognition collection.
 * 
 * Problem: If SearchFaces was run multiple times on the same asset, it created
 * duplicate face records in both the database and Rekognition collection.
 * 
 * Solution:
 * 1. Find all assets with multiple face records
 * 2. For each asset, keep only the first face record (oldest)
 * 3. Delete duplicate face records from database
 * 4. Delete duplicate faces from Rekognition collection
 * 
 * Usage:
 *   node scripts/cleanup-duplicate-faces.js [--dry-run] [--user-id <uuid>]
 * 
 * Options:
 *   --dry-run    Show what would be deleted without actually deleting
 *   --user-id    Process only faces for a specific user
 */

import { createClient } from '@supabase/supabase-js'
import { RekognitionClient, DeleteFacesCommand, ListFacesCommand } from '@aws-sdk/client-rekognition'
import 'dotenv/config'

// Initialize clients
const supabase = createClient(
  process.env.NUXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})

// Parse command line arguments
const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const userIdIndex = args.indexOf('--user-id')
const targetUserId = userIdIndex !== -1 ? args[userIdIndex + 1] : null

console.log('🧹 Face Cleanup Script')
console.log('='.repeat(50))
console.log(`Mode: ${isDryRun ? 'DRY RUN (no changes)' : 'LIVE (will delete duplicates)'}`)
if (targetUserId) {
  console.log(`Target User: ${targetUserId}`)
}
console.log('')

async function main() {
  try {
    // 1. Find assets with duplicate faces
    console.log('📊 Finding assets with duplicate faces...')
    
    let query = supabase
      .from('faces')
      .select('asset_id, user_id, rekognition_face_id, created_at')
      .eq('deleted', false)
      .order('asset_id')
      .order('created_at')
    
    if (targetUserId) {
      query = query.eq('user_id', targetUserId)
    }
    
    const { data: allFaces, error: fetchError } = await query
    
    if (fetchError) {
      throw fetchError
    }
    
    console.log(`✅ Found ${allFaces.length} total face records`)
    
    // Group faces by asset_id
    const facesByAsset = {}
    for (const face of allFaces) {
      if (!facesByAsset[face.asset_id]) {
        facesByAsset[face.asset_id] = []
      }
      facesByAsset[face.asset_id].push(face)
    }
    
    // Find assets with duplicates
    const assetsWithDuplicates = Object.entries(facesByAsset)
      .filter(([_, faces]) => faces.length > 1)
      .map(([assetId, faces]) => ({
        assetId,
        faces,
        count: faces.length
      }))
      .sort((a, b) => b.count - a.count)
    
    console.log(`🔍 Found ${assetsWithDuplicates.length} assets with duplicate faces`)
    
    if (assetsWithDuplicates.length === 0) {
      console.log('✨ No duplicates found! Database is clean.')
      return
    }
    
    // Show top duplicates
    console.log('\n📋 Top 10 assets with most duplicates:')
    for (const asset of assetsWithDuplicates.slice(0, 10)) {
      console.log(`   ${asset.assetId}: ${asset.count} faces`)
    }
    
    // Calculate totals
    const totalDuplicateFaces = assetsWithDuplicates.reduce(
      (sum, asset) => sum + (asset.count - 1), 
      0
    )
    
    console.log(`\n📊 Summary:`)
    console.log(`   Assets with duplicates: ${assetsWithDuplicates.length}`)
    console.log(`   Total duplicate faces to remove: ${totalDuplicateFaces}`)
    console.log(`   Total faces to keep: ${assetsWithDuplicates.length}`)
    
    if (isDryRun) {
      console.log('\n⚠️  DRY RUN MODE - No changes will be made')
      console.log('   Run without --dry-run to actually delete duplicates')
      return
    }
    
    // Confirm deletion
    console.log('\n⚠️  WARNING: This will delete duplicate face records!')
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...')
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // 2. Delete duplicates
    console.log('\n🗑️  Deleting duplicate faces...')
    
    let deletedFromDb = 0
    let deletedFromRekognition = 0
    let errors = 0
    
    for (const asset of assetsWithDuplicates) {
      const facesToKeep = [asset.faces[0]] // Keep first (oldest) face
      const facesToDelete = asset.faces.slice(1) // Delete rest
      
      console.log(`\n📸 Processing asset ${asset.assetId} (${asset.count} faces)`)
      console.log(`   Keeping: ${facesToKeep[0].rekognition_face_id}`)
      console.log(`   Deleting: ${facesToDelete.map(f => f.rekognition_face_id).join(', ')}`)
      
      // Get user's collection ID
      const { data: collection } = await supabase
        .from('face_collections')
        .select('aws_collection_id')
        .eq('user_id', asset.faces[0].user_id)
        .single()
      
      if (!collection) {
        console.log(`   ⚠️  No collection found for user ${asset.faces[0].user_id}`)
        continue
      }
      
      // Delete from Rekognition
      try {
        await rekognitionClient.send(new DeleteFacesCommand({
          CollectionId: collection.aws_collection_id,
          FaceIds: facesToDelete.map(f => f.rekognition_face_id)
        }))
        deletedFromRekognition += facesToDelete.length
        console.log(`   ✅ Deleted ${facesToDelete.length} faces from Rekognition`)
      } catch (rekogError) {
        console.log(`   ⚠️  Rekognition delete failed: ${rekogError.message}`)
        errors++
      }
      
      // Soft delete from database
      const { error: dbError } = await supabase
        .from('faces')
        .update({ deleted: true })
        .in('rekognition_face_id', facesToDelete.map(f => f.rekognition_face_id))
      
      if (dbError) {
        console.log(`   ⚠️  Database delete failed: ${dbError.message}`)
        errors++
      } else {
        deletedFromDb += facesToDelete.length
        console.log(`   ✅ Soft-deleted ${facesToDelete.length} faces from database`)
      }
    }
    
    console.log('\n✅ Cleanup complete!')
    console.log(`   Deleted from database: ${deletedFromDb}`)
    console.log(`   Deleted from Rekognition: ${deletedFromRekognition}`)
    if (errors > 0) {
      console.log(`   ⚠️  Errors: ${errors}`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main()

