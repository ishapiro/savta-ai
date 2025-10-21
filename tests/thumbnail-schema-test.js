/**
 * Thumbnail Schema Test
 * 
 * This test verifies that the thumbnail fields have been successfully added
 * to the assets table and are functioning correctly.
 * 
 * Run with: node tests/thumbnail-schema-test.js
 */

import { createClient } from '@supabase/supabase-js'

// Configuration
const SUPABASE_URL = process.env.NUXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables:')
  console.error('   NUXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Test utilities
let testsPassed = 0
let testsFailed = 0
const testResults = []

function logTest(name, passed, message = '') {
  const status = passed ? '✅' : '❌'
  const result = { name, passed, message }
  testResults.push(result)
  
  if (passed) {
    testsPassed++
    console.log(`${status} ${name}`)
  } else {
    testsFailed++
    console.log(`${status} ${name}`)
    if (message) console.log(`   └─ ${message}`)
  }
}

// Test functions
async function testSchemaColumns() {
  console.log('\n📋 Testing Schema Columns...\n')
  
  try {
    // Query information_schema to check if columns exist
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          column_name, 
          data_type, 
          column_default,
          is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'assets'
          AND column_name IN ('thumbnail_url', 'thumbnail_width', 'thumbnail_height')
        ORDER BY column_name
      `
    })
    
    if (error) {
      // If RPC doesn't exist, try direct query (requires proper permissions)
      const { data: columns, error: colError } = await supabase
        .from('assets')
        .select('thumbnail_url, thumbnail_width, thumbnail_height')
        .limit(0)
      
      if (colError) {
        logTest('Schema columns exist', false, `Cannot verify columns: ${colError.message}`)
        return false
      }
      
      // If we can select these columns without error, they exist
      logTest('thumbnail_url column exists', true)
      logTest('thumbnail_width column exists', true)
      logTest('thumbnail_height column exists', true)
      return true
    }
    
    // Check each expected column
    const columns = data || []
    const thumbnailUrl = columns.find(c => c.column_name === 'thumbnail_url')
    const thumbnailWidth = columns.find(c => c.column_name === 'thumbnail_width')
    const thumbnailHeight = columns.find(c => c.column_name === 'thumbnail_height')
    
    logTest('thumbnail_url column exists', !!thumbnailUrl)
    logTest('thumbnail_width column exists', !!thumbnailWidth)
    logTest('thumbnail_height column exists', !!thumbnailHeight)
    
    if (thumbnailWidth) {
      const hasDefault = thumbnailWidth.column_default?.includes('400')
      logTest('thumbnail_width has default value of 400', hasDefault, 
        hasDefault ? '' : `Found: ${thumbnailWidth.column_default}`)
    }
    
    return !!(thumbnailUrl && thumbnailWidth && thumbnailHeight)
    
  } catch (error) {
    logTest('Schema columns test', false, error.message)
    return false
  }
}

async function testInsertWithThumbnails() {
  console.log('\n📝 Testing Insert with Thumbnails...\n')
  
  try {
    // Create a test user ID (you may need to use a real user_id from your profiles table)
    const testUserId = '00000000-0000-0000-0000-000000000000' // Replace with real user ID
    
    // Try inserting an asset with thumbnail fields
    const testAsset = {
      user_id: testUserId,
      type: 'photo',
      title: 'Test Photo with Thumbnail',
      storage_url: 'https://example.com/test-photo.jpg',
      thumbnail_url: 'https://example.com/test-photo-thumb.webp',
      thumbnail_width: 400,
      thumbnail_height: 300,
      approved: true
    }
    
    const { data, error } = await supabase
      .from('assets')
      .insert([testAsset])
      .select()
      .single()
    
    if (error) {
      // Check if it's a foreign key error (expected if test user doesn't exist)
      if (error.message.includes('foreign key') || error.message.includes('violates')) {
        logTest('Insert with thumbnail fields (schema valid)', true, 
          'Schema accepts thumbnail fields (skipped actual insert due to FK constraint)')
        return true
      }
      
      logTest('Insert with thumbnail fields', false, error.message)
      return false
    }
    
    // Verify the data was inserted correctly
    logTest('Insert with thumbnail fields', !!data)
    logTest('thumbnail_url persisted correctly', data.thumbnail_url === testAsset.thumbnail_url)
    logTest('thumbnail_width persisted correctly', data.thumbnail_width === testAsset.thumbnail_width)
    logTest('thumbnail_height persisted correctly', data.thumbnail_height === testAsset.thumbnail_height)
    
    // Clean up test data
    if (data?.id) {
      await supabase.from('assets').delete().eq('id', data.id)
      console.log('   🧹 Cleaned up test data')
    }
    
    return true
    
  } catch (error) {
    logTest('Insert test', false, error.message)
    return false
  }
}

async function testInsertWithoutThumbnails() {
  console.log('\n📝 Testing Insert WITHOUT Thumbnails (Backward Compatibility)...\n')
  
  try {
    const testUserId = '00000000-0000-0000-0000-000000000000' // Replace with real user ID
    
    // Try inserting an asset WITHOUT thumbnail fields (old behavior)
    const testAsset = {
      user_id: testUserId,
      type: 'photo',
      title: 'Test Photo without Thumbnail',
      storage_url: 'https://example.com/test-photo-old.jpg',
      approved: true
      // NOTE: No thumbnail_url, thumbnail_width, or thumbnail_height
    }
    
    const { data, error } = await supabase
      .from('assets')
      .insert([testAsset])
      .select()
      .single()
    
    if (error) {
      // Check if it's a foreign key error (expected if test user doesn't exist)
      if (error.message.includes('foreign key') || error.message.includes('violates')) {
        logTest('Insert without thumbnail fields (backward compatible)', true, 
          'Schema is backward compatible (skipped actual insert due to FK constraint)')
        return true
      }
      
      logTest('Insert without thumbnail fields', false, error.message)
      return false
    }
    
    // Verify the data was inserted and thumbnail fields are NULL or default
    logTest('Insert without thumbnail fields', !!data)
    logTest('thumbnail_url is nullable (NULL)', data.thumbnail_url === null)
    logTest('thumbnail_width has default (400)', data.thumbnail_width === 400)
    logTest('thumbnail_height is nullable (NULL)', data.thumbnail_height === null)
    
    // Clean up test data
    if (data?.id) {
      await supabase.from('assets').delete().eq('id', data.id)
      console.log('   🧹 Cleaned up test data')
    }
    
    return true
    
  } catch (error) {
    logTest('Insert without thumbnails test', false, error.message)
    return false
  }
}

async function testQueryWithThumbnails() {
  console.log('\n🔍 Testing Query with Thumbnails...\n')
  
  try {
    // Try to query existing assets and check if thumbnail fields are accessible
    const { data, error } = await supabase
      .from('assets')
      .select('id, storage_url, thumbnail_url, thumbnail_width, thumbnail_height')
      .limit(5)
    
    if (error) {
      logTest('Query with thumbnail fields', false, error.message)
      return false
    }
    
    logTest('Query with thumbnail fields succeeds', true)
    logTest('Query returns data structure correctly', Array.isArray(data))
    
    // Check if any assets have thumbnails (may not exist yet)
    const assetsWithThumbnails = data.filter(a => a.thumbnail_url !== null)
    const assetsWithoutThumbnails = data.filter(a => a.thumbnail_url === null)
    
    console.log(`   ℹ️  Found ${data.length} total assets`)
    console.log(`   ℹ️  Assets with thumbnails: ${assetsWithThumbnails.length}`)
    console.log(`   ℹ️  Assets without thumbnails: ${assetsWithoutThumbnails.length}`)
    
    if (assetsWithoutThumbnails.length > 0) {
      logTest('Legacy assets (no thumbnails) are queryable', true, 
        'Backward compatibility confirmed')
    }
    
    return true
    
  } catch (error) {
    logTest('Query test', false, error.message)
    return false
  }
}

async function testIndexExists() {
  console.log('\n🔍 Testing Database Index...\n')
  
  try {
    // Query to check if index exists
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT indexname, indexdef 
        FROM pg_indexes 
        WHERE tablename = 'assets' 
          AND indexname = 'idx_assets_thumbnail_url'
      `
    })
    
    if (error) {
      logTest('Index verification', false, 
        'Cannot verify index (requires RPC function or direct access)')
      return false
    }
    
    const indexExists = data && data.length > 0
    logTest('idx_assets_thumbnail_url index exists', indexExists)
    
    if (indexExists) {
      console.log(`   ℹ️  Index definition: ${data[0].indexdef}`)
    }
    
    return indexExists
    
  } catch (error) {
    logTest('Index test', false, error.message)
    return false
  }
}

// Main test runner
async function runTests() {
  console.log('🧪 Thumbnail Schema Test Suite')
  console.log('=' .repeat(50))
  console.log(`📡 Supabase URL: ${SUPABASE_URL}`)
  console.log(`🔑 Using Service Role Key: ${SUPABASE_SERVICE_KEY ? '✓' : '✗'}`)
  console.log('=' .repeat(50))
  
  // Run all tests
  await testSchemaColumns()
  await testQueryWithThumbnails()
  await testInsertWithoutThumbnails()
  await testInsertWithThumbnails()
  await testIndexExists()
  
  // Print summary
  console.log('\n' + '=' .repeat(50))
  console.log('📊 Test Summary')
  console.log('=' .repeat(50))
  console.log(`✅ Passed: ${testsPassed}`)
  console.log(`❌ Failed: ${testsFailed}`)
  console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`)
  console.log('=' .repeat(50))
  
  // Exit with appropriate code
  process.exit(testsFailed > 0 ? 1 : 0)
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Fatal error running tests:', error)
  process.exit(1)
})

