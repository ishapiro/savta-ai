#!/usr/bin/env node

/**
 * Automated test script for memory book recreation functionality
 * This script will:
 * 1. Clean up any existing test memory books
 * 2. Create a new memory book
 * 3. Test the recreation functionality
 * 4. Report results
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Configuration
const SUPABASE_URL = process.env.NUXT_PUBLIC_SUPABASE_URL || 'https://hjcfurvpshxbgxaedmeu.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BASE_URL = 'http://localhost:3000'

// Test user ID (you can replace this with your actual user ID)
const TEST_USER_ID = '9429abe0-9af6-442a-a1de-b74537badbcf'

// Test configuration
const TEST_CONFIG = {
  title: 'Test Memory Book - Recreation',
  theme_id: '8581031d-1763-427d-98d5-6147fcff26e5', // Default theme
  photo_count: 3,
  background_type: 'white'
}

async function main() {
  console.log('🧪 Starting Memory Book Recreation Test...\n')
  
  try {
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    console.log('✅ Connected to Supabase')
    
    // Step 1: Clean up existing test memory books
    await cleanupTestBooks(supabase)
    
    // Step 2: Create a new memory book
    const memoryBook = await createTestMemoryBook(supabase)
    console.log(`✅ Created test memory book: ${memoryBook.id}`)
    
    // Step 3: Test recreation functionality
    await testRecreation(supabase, memoryBook)
    
    console.log('\n🎉 Test completed successfully!')
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  }
}

async function cleanupTestBooks(supabase) {
  console.log('🧹 Cleaning up existing test memory books...')
  
  try {
    // Find all test memory books
    const { data: testBooks, error: fetchError } = await supabase
      .from('memory_books')
      .select('id, ai_supplemental_prompt')
      .eq('user_id', TEST_USER_ID)
      .like('ai_supplemental_prompt', 'Test Memory Book%')
    
    if (fetchError) {
      console.error('❌ Error fetching test books:', fetchError)
      return
    }
    
    if (testBooks && testBooks.length > 0) {
      console.log(`📋 Found ${testBooks.length} test memory books to clean up`)
      
      // Delete each test book
      for (const book of testBooks) {
        const { error: deleteError } = await supabase
          .from('memory_books')
          .delete()
          .eq('id', book.id)
          .eq('user_id', TEST_USER_ID)
        
        if (deleteError) {
          console.error(`❌ Error deleting book ${book.id}:`, deleteError)
        } else {
          console.log(`🗑️ Deleted test book: ${book.id}`)
        }
      }
    } else {
      console.log('📋 No test memory books found to clean up')
    }
    
    console.log('✅ Cleanup completed\n')
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  }
}

async function createTestMemoryBook(supabase) {
  console.log('📝 Creating new test memory book...')
  
  // First, get available assets for the user
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
  
  console.log(`📸 Found ${assets.length} available assets`)
  
  // Create the memory book
  const { data: memoryBook, error: createError } = await supabase
    .from('memory_books')
    .insert({
      user_id: TEST_USER_ID,
      ai_supplemental_prompt: TEST_CONFIG.title,
      layout_type: 'theme',
      ui: 'wizard',
      format: 'card',
      theme_id: TEST_CONFIG.theme_id,
      status: 'template',
      grid_layout: '2x2',
      print_size: '8.5x11',
      include_captions: true,
      include_tags: true,
      memory_shape: 'original',
      output: 'JPG',
      background_type: TEST_CONFIG.background_type,
      photo_selection_pool: assets.map(a => a.id),
      created_from_assets: assets.slice(0, 3).map(a => a.id), // Select first 3 photos
      photo_selection_method: 'last_100'
    })
    .select()
    .single()
  
  if (createError) {
    throw new Error(`Failed to create memory book: ${createError.message}`)
  }
  
  console.log(`📋 Memory book created with ${memoryBook.created_from_assets.length} photos`)
  console.log(`📋 Photo selection pool size: ${memoryBook.photo_selection_pool.length}`)
  
  return memoryBook
}

async function testRecreation(supabase, memoryBook) {
  console.log('🔄 Testing recreation functionality...')
  
  // Step 1: Update the memory book for recreation
  console.log('📝 Updating memory book for recreation...')
  
  const photosToReplace = [memoryBook.created_from_assets[0]] // Replace first photo
  console.log(`🎯 Planning to replace photo: ${photosToReplace[0]}`)
  
  const updateResponse = await fetch(`${BASE_URL}/api/memory-books/update-magic-memory`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}` // You might need to adjust this
    },
    body: JSON.stringify({
      book_id: memoryBook.id,
      asset_ids: [], // Template - will be populated after AI selection
      photo_selection_pool: memoryBook.photo_selection_pool,
      story: '', // Template - will be populated after AI generation
      title: TEST_CONFIG.title,
      memory_event: null,
      background_type: TEST_CONFIG.background_type,
      background_color: null,
      photo_count: TEST_CONFIG.photo_count,
      theme_id: TEST_CONFIG.theme_id,
      print_size: '8.5x11',
      output: 'JPG',
      photo_selection_method: 'replace_selected',
      photos_to_replace: photosToReplace
    })
  })
  
  if (!updateResponse.ok) {
    const errorText = await updateResponse.text()
    throw new Error(`Failed to update memory book: ${updateResponse.status} ${errorText}`)
  }
  
  const updateResult = await updateResponse.json()
  console.log('✅ Memory book updated for recreation')
  
  // Step 2: Verify the update worked correctly
  console.log('🔍 Verifying memory book state after update...')
  
  const { data: updatedBook, error: fetchError } = await supabase
    .from('memory_books')
    .select('*')
    .eq('id', memoryBook.id)
    .eq('user_id', TEST_USER_ID)
    .single()
  
  if (fetchError) {
    throw new Error(`Failed to fetch updated book: ${fetchError.message}`)
  }
  
  console.log(`📋 Updated book status: ${updatedBook.status}`)
  console.log(`📋 Photo selection pool size: ${updatedBook.photo_selection_pool?.length || 0}`)
  console.log(`📋 Previously used assets: ${updatedBook.previously_used_assets?.length || 0}`)
  console.log(`📋 Photos to replace: ${JSON.parse(updatedBook.photos_to_replace || '[]').length}`)
  
  // Step 3: Test the AI magic memory endpoint
  console.log('🤖 Testing AI magic memory endpoint...')
  
  const aiResponse = await fetch(`${BASE_URL}/api/ai/magic-memory`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      memoryBookId: memoryBook.id,
      userId: TEST_USER_ID,
      photoCount: TEST_CONFIG.photo_count
    })
  })
  
  if (!aiResponse.ok) {
    const errorText = await aiResponse.text()
    throw new Error(`AI magic memory failed: ${aiResponse.status} ${errorText}`)
  }
  
  const aiResult = await aiResponse.json()
  console.log('✅ AI magic memory completed successfully')
  console.log(`📸 Selected ${aiResult.selected_photo_ids?.length || 0} photos`)
  console.log(`💭 Reasoning: ${aiResult.reasoning}`)
  
  // Step 4: Verify final state
  console.log('🔍 Verifying final memory book state...')
  
  const { data: finalBook, error: finalError } = await supabase
    .from('memory_books')
    .select('*')
    .eq('id', memoryBook.id)
    .eq('user_id', TEST_USER_ID)
    .single()
  
  if (finalError) {
    throw new Error(`Failed to fetch final book: ${finalError.message}`)
  }
  
  console.log(`📋 Final book status: ${finalBook.status}`)
  console.log(`📋 Final created_from_assets: ${finalBook.created_from_assets?.length || 0}`)
  console.log(`📋 Final photo selection pool: ${finalBook.photo_selection_pool?.length || 0}`)
  
  // Verify that the photo was actually replaced
  const originalPhotos = memoryBook.created_from_assets
  const finalPhotos = finalBook.created_from_assets
  
  if (JSON.stringify(originalPhotos) === JSON.stringify(finalPhotos)) {
    console.log('⚠️ Warning: No photos were replaced (same photos as original)')
  } else {
    console.log('✅ Photos were successfully replaced!')
    console.log(`📸 Original photos: ${originalPhotos.join(', ')}`)
    console.log(`📸 Final photos: ${finalPhotos.join(', ')}`)
  }
  
  console.log('✅ Recreation test completed successfully!')
}

// Run the test
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { main }
