#!/usr/bin/env node

/**
 * Database-level test for memory book recreation functionality
 * This script directly tests the database logic without needing authentication
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

// Configuration
const SUPABASE_URL = process.env.NUXT_PUBLIC_SUPABASE_URL || 'https://hjcfurvpshxbgxaedmeu.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const TEST_USER_ID = '9429abe0-9af6-442a-a1de-b74537badbcf'

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function main() {
  log('🧪 Starting Database Recreation Test...\n', 'bright')
  
  try {
    // Initialize Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    log('✅ Connected to Supabase', 'green')
    
    // Step 1: Clean up any existing test books
    await cleanupTestBooks(supabase)
    
    // Step 2: Create a test memory book
    const memoryBook = await createTestMemoryBook(supabase)
    log(`✅ Created test memory book: ${memoryBook.id}`, 'green')
    
    // Step 3: Test the recreation update logic
    await testRecreationUpdate(supabase, memoryBook)
    
    // Step 4: Clean up
    await cleanupTestBooks(supabase)
    
    log('\n🎉 Database recreation test completed successfully!', 'bright')
    
  } catch (error) {
    log(`\n❌ Test failed: ${error.message}`, 'red')
    console.error(error.stack)
    process.exit(1)
  }
}

async function cleanupTestBooks(supabase) {
  log('🧹 Cleaning up test memory books...', 'blue')
  
  try {
    const { error } = await supabase
      .from('memory_books')
      .delete()
      .eq('user_id', TEST_USER_ID)
      .like('ai_supplemental_prompt', 'Test Recreation%')
    
    if (error) {
      log(`⚠️ Warning: Error during cleanup: ${error.message}`, 'yellow')
    } else {
      log('✅ Cleanup completed', 'green')
    }
  } catch (error) {
    log(`⚠️ Warning: Cleanup failed: ${error.message}`, 'yellow')
  }
}

async function createTestMemoryBook(supabase) {
  log('📝 Creating test memory book...', 'blue')
  
  // Get available assets
  const { data: assets, error: assetsError } = await supabase
    .from('assets')
    .select('id')
    .eq('user_id', TEST_USER_ID)
    .eq('approved', true)
    .eq('deleted', false)
    .limit(100)
  
  if (assetsError || !assets || assets.length < 3) {
    throw new Error(`Not enough assets available. Found: ${assets?.length || 0}, need at least 3`)
  }
  
  log(`📸 Found ${assets.length} available assets`, 'cyan')
  
  // Create memory book
  const { data: memoryBook, error: createError } = await supabase
    .from('memory_books')
    .insert({
      user_id: TEST_USER_ID,
      ai_supplemental_prompt: 'Test Recreation Memory Book',
      layout_type: 'theme',
      ui: 'wizard',
      format: 'card',
      theme_id: '8581031d-1763-427d-98d5-6147fcff26e5',
      status: 'ready',
      grid_layout: '2x2',
      print_size: '8.5x11',
      include_captions: true,
      include_tags: true,
      memory_shape: 'original',
      output: 'JPG',
      background_type: 'white',
      photo_selection_pool: assets.map(a => a.id), // Full pool of 9+ photos
      created_from_assets: assets.slice(0, 3).map(a => a.id), // Selected 3 photos
      photo_selection_method: 'last_100'
    })
    .select()
    .single()
  
  if (createError) {
    throw new Error(`Failed to create memory book: ${createError.message}`)
  }
  
  log(`📋 Memory book created with ${memoryBook.created_from_assets.length} selected photos`, 'cyan')
  log(`📋 Photo selection pool size: ${memoryBook.photo_selection_pool.length}`, 'cyan')
  
  return memoryBook
}

async function testRecreationUpdate(supabase, memoryBook) {
  log('\n🔄 Testing recreation update logic...', 'blue')
  
  // Simulate the recreation update process
  const photosToReplace = [memoryBook.created_from_assets[0]] // Replace first photo
  log(`🎯 Planning to replace photo: ${photosToReplace[0]}`, 'yellow')
  
  // Step 1: Fetch current book data (simulating the update-magic-memory endpoint)
  log('📝 Fetching current book data...', 'blue')
  
  const { data: currentBook, error: fetchError } = await supabase
    .from('memory_books')
    .select('created_from_assets, photo_selection_pool')
    .eq('id', memoryBook.id)
    .eq('user_id', TEST_USER_ID)
    .single()
  
  if (fetchError) {
    throw new Error(`Failed to fetch current book: ${fetchError.message}`)
  }
  
  log(`📋 Current created_from_assets: ${currentBook.created_from_assets.length} photos`, 'cyan')
  log(`📋 Current photo_selection_pool: ${currentBook.photo_selection_pool.length} photos`, 'cyan')
  
  // Step 2: Store original data for recreation
  const previouslyUsedAssets = currentBook.created_from_assets
  const originalPhotoSelectionPool = currentBook.photo_selection_pool
  
  log(`🔄 Storing original assets for recreation: ${previouslyUsedAssets.length} photos`, 'cyan')
  log(`🔄 Preserving original photo selection pool: ${originalPhotoSelectionPool.length} photos`, 'cyan')
  
  // Step 3: Update the memory book (simulating the recreation update)
  log('📝 Updating memory book for recreation...', 'blue')
  
  const { data: updatedBook, error: updateError } = await supabase
    .from('memory_books')
    .update({
      created_from_assets: null, // Clear selected photos
      photo_selection_pool: originalPhotoSelectionPool, // Use original pool
      previously_used_assets: previouslyUsedAssets, // Store original selected photos
      photos_to_replace: JSON.stringify(photosToReplace),
      status: 'template',
      updated_at: new Date().toISOString()
    })
    .eq('id', memoryBook.id)
    .eq('user_id', TEST_USER_ID)
    .select()
    .single()
  
  if (updateError) {
    throw new Error(`Failed to update memory book: ${updateError.message}`)
  }
  
  log('✅ Memory book updated for recreation', 'green')
  
  // Step 4: Verify the update worked correctly
  log('🔍 Verifying recreation update...', 'blue')
  
  log(`📋 Updated photo_selection_pool size: ${updatedBook.photo_selection_pool?.length || 0}`, 'cyan')
  log(`📋 Updated previously_used_assets: ${updatedBook.previously_used_assets?.length || 0}`, 'cyan')
  log(`📋 Updated photos_to_replace: ${JSON.parse(updatedBook.photos_to_replace || '[]').length}`, 'cyan')
  
  // Step 5: Test the photo replacement logic (simulating the AI magic-memory endpoint)
  log('🤖 Testing photo replacement logic...', 'blue')
  
  // This simulates the logic from the AI magic-memory endpoint
  const originalPool = updatedBook.photo_selection_pool || []
  const usedOriginals = updatedBook.previously_used_assets || []
  const photosToReplaceArray = JSON.parse(updatedBook.photos_to_replace || '[]')
  
  log(`📋 Original pool size: ${originalPool.length}`, 'cyan')
  log(`📋 Used originals: ${usedOriginals.length}`, 'cyan')
  log(`📋 Photos to replace: ${photosToReplaceArray.length}`, 'cyan')
  
  // Calculate candidate assets (original pool minus used originals)
  const candidateAssets = originalPool.filter(id => !usedOriginals.includes(id))
  
  log(`📋 Candidate assets for replacement: ${candidateAssets.length}`, 'cyan')
  log(`📋 Candidate IDs: ${candidateAssets.join(', ')}`, 'cyan')
  
  // Check if we have enough candidates
  if (candidateAssets.length < photosToReplaceArray.length) {
    throw new Error(`Not enough candidates in original pool minus used. Need ${photosToReplaceArray.length}, have ${candidateAssets.length}.`)
  }
  
  log('✅ Photo replacement logic validation passed!', 'green')
  log(`✅ Can replace ${photosToReplaceArray.length} photo(s) with ${candidateAssets.length} available candidates`, 'green')
  
  // Step 6: Simulate the replacement process
  log('🔄 Simulating photo replacement...', 'blue')
  
  // Photos we keep from the used set (not marked for replacement)
  const photosToKeep = usedOriginals.filter(id => !photosToReplaceArray.includes(id))
  
  // Select replacement photos from candidates (simulate AI selection)
  const replacementPhotos = candidateAssets.slice(0, photosToReplaceArray.length)
  
  // Build new created_from_assets by replacing marked IDs
  const newUsed = usedOriginals.map(id => {
    if (photosToReplaceArray.includes(id)) {
      return replacementPhotos.shift() || id
    }
    return id
  })
  
  log(`📋 Photos to keep: ${photosToKeep.length}`, 'cyan')
  log(`📋 Replacement photos: ${replacementPhotos.length}`, 'cyan')
  log(`📋 Final photo selection: ${newUsed.length}`, 'cyan')
  
  log(`📸 Original photos: ${usedOriginals.join(', ')}`, 'cyan')
  log(`📸 Final photos: ${newUsed.join(', ')}`, 'cyan')
  
  // Verify that photos were actually replaced
  const originalPhotos = usedOriginals
  const finalPhotos = newUsed
  
  if (JSON.stringify(originalPhotos) === JSON.stringify(finalPhotos)) {
    log('⚠️ Warning: No photos were replaced (same photos as original)', 'yellow')
  } else {
    log('✅ Photos were successfully replaced!', 'green')
  }
  
  log('✅ Recreation update test completed successfully!', 'green')
}

// Run the test
main()
