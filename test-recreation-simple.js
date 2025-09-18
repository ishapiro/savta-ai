#!/usr/bin/env node

/**
 * Simple test script for memory book recreation functionality
 * This script uses curl to test the API endpoints directly
 */

import { execSync } from 'child_process'

// Configuration
const BASE_URL = 'http://localhost:3000'
const TEST_USER_ID = '9429abe0-9af6-442a-a1de-b74537badbcf'

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function runCurl(command) {
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' })
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: error.message, stdout: error.stdout, stderr: error.stderr }
  }
}

async function main() {
  log('🧪 Starting Memory Book Recreation Test...\n', 'bright')
  
  try {
    // Step 1: Create a test memory book
    log('📝 Step 1: Creating test memory book...', 'blue')
    
    const createBookCommand = `curl -s -X POST "${BASE_URL}/api/memory-books/create-magic-memory" \\
      -H "Content-Type: application/json" \\
      -d '{
        "asset_ids": [],
        "photo_selection_pool": ["aa5395ce-24b1-41ec-b711-e5f29e54e36e", "2e0ce990-65d6-40e9-810a-01b79582e21f", "4ca2d4bb-a2ec-425b-b232-0bff1d36377e", "684fa310-a553-49ea-887d-a8516ca1e0e6", "bea03b4e-4621-4908-8622-366654a04b58", "2c195e27-4c8a-4b21-a0b7-462c2ba7b8fc", "1433a502-0139-4c45-9735-d495c8a197e9", "27022ccb-b1ff-4710-897b-39d67103f26f", "d85a74dc-c514-4fef-a952-0e24094ea72d"],
        "story": "",
        "title": "Test Memory Book - Recreation",
        "memory_event": null,
        "background_type": "white",
        "background_color": null,
        "photo_count": 3,
        "theme_id": "8581031d-1763-427d-98d5-6147fcff26e5",
        "print_size": "8.5x11",
        "output": "JPG",
        "photo_selection_method": "last_100"
      }'`
    
    const createResult = runCurl(createBookCommand)
    
    if (!createResult.success) {
      log('❌ Failed to create memory book:', 'red')
      log(createResult.stderr || createResult.error, 'red')
      return
    }
    
    let bookData
    try {
      bookData = JSON.parse(createResult.data)
    } catch (e) {
      log('❌ Invalid JSON response from create memory book:', 'red')
      log(createResult.data, 'red')
      return
    }
    
    if (!bookData.success || !bookData.book_id) {
      log('❌ Memory book creation failed:', 'red')
      log(JSON.stringify(bookData, null, 2), 'red')
      return
    }
    
    const bookId = bookData.book_id
    log(`✅ Created memory book: ${bookId}`, 'green')
    
    // Step 2: Generate the initial memory book
    log('\n🤖 Step 2: Generating initial memory book...', 'blue')
    
    const generateCommand = `curl -s -X POST "${BASE_URL}/api/ai/magic-memory" \\
      -H "Content-Type: application/json" \\
      -d '{
        "memoryBookId": "${bookId}",
        "userId": "${TEST_USER_ID}",
        "photoCount": 3
      }'`
    
    const generateResult = runCurl(generateCommand)
    
    if (!generateResult.success) {
      log('❌ Failed to generate memory book:', 'red')
      log(generateResult.stderr || generateResult.error, 'red')
      return
    }
    
    let generateData
    try {
      generateData = JSON.parse(generateResult.data)
    } catch (e) {
      log('❌ Invalid JSON response from generate memory book:', 'red')
      log(generateResult.data, 'red')
      return
    }
    
    if (!generateData.success || !generateData.selected_photo_ids) {
      log('❌ Memory book generation failed:', 'red')
      log(JSON.stringify(generateData, null, 2), 'red')
      return
    }
    
    log(`✅ Generated memory book with ${generateData.selected_photo_ids.length} photos`, 'green')
    log(`📸 Selected photos: ${generateData.selected_photo_ids.join(', ')}`, 'cyan')
    
    // Step 3: Test recreation
    log('\n🔄 Step 3: Testing recreation functionality...', 'blue')
    
    // Select the first photo for replacement
    const photoToReplace = generateData.selected_photo_ids[0]
    log(`🎯 Planning to replace photo: ${photoToReplace}`, 'yellow')
    
    const updateCommand = `curl -s -X POST "${BASE_URL}/api/memory-books/update-magic-memory" \\
      -H "Content-Type: application/json" \\
      -d '{
        "book_id": "${bookId}",
        "asset_ids": [],
        "photo_selection_pool": ["aa5395ce-24b1-41ec-b711-e5f29e54e36e", "2e0ce990-65d6-40e9-810a-01b79582e21f", "4ca2d4bb-a2ec-425b-b232-0bff1d36377e", "684fa310-a553-49ea-887d-a8516ca1e0e6", "bea03b4e-4621-4908-8622-366654a04b58", "2c195e27-4c8a-4b21-a0b7-462c2ba7b8fc", "1433a502-0139-4c45-9735-d495c8a197e9", "27022ccb-b1ff-4710-897b-39d67103f26f", "d85a74dc-c514-4fef-a952-0e24094ea72d"],
        "story": "",
        "title": "Test Memory Book - Recreation",
        "memory_event": null,
        "background_type": "white",
        "background_color": null,
        "photo_count": 3,
        "theme_id": "8581031d-1763-427d-98d5-6147fcff26e5",
        "print_size": "8.5x11",
        "output": "JPG",
        "photo_selection_method": "replace_selected",
        "photos_to_replace": ["${photoToReplace}"]
      }'`
    
    const updateResult = runCurl(updateCommand)
    
    if (!updateResult.success) {
      log('❌ Failed to update memory book for recreation:', 'red')
      log(updateResult.stderr || updateResult.error, 'red')
      return
    }
    
    let updateData
    try {
      updateData = JSON.parse(updateResult.data)
    } catch (e) {
      log('❌ Invalid JSON response from update memory book:', 'red')
      log(updateResult.data, 'red')
      return
    }
    
    if (!updateData.success) {
      log('❌ Memory book update failed:', 'red')
      log(JSON.stringify(updateData, null, 2), 'red')
      return
    }
    
    log('✅ Memory book updated for recreation', 'green')
    
    // Step 4: Test the recreation generation
    log('\n🤖 Step 4: Testing recreation generation...', 'blue')
    
    const recreateResult = runCurl(generateCommand)
    
    if (!recreateResult.success) {
      log('❌ Failed to generate recreation:', 'red')
      log(recreateResult.stderr || recreateResult.error, 'red')
      return
    }
    
    let recreateData
    try {
      recreateData = JSON.parse(recreateResult.data)
    } catch (e) {
      log('❌ Invalid JSON response from recreation generation:', 'red')
      log(recreateResult.data, 'red')
      return
    }
    
    if (!recreateData.success || !recreateData.selected_photo_ids) {
      log('❌ Recreation generation failed:', 'red')
      log(JSON.stringify(recreateData, null, 2), 'red')
      return
    }
    
    log(`✅ Recreation completed successfully!`, 'green')
    log(`📸 Original photos: ${generateData.selected_photo_ids.join(', ')}`, 'cyan')
    log(`📸 Recreated photos: ${recreateData.selected_photo_ids.join(', ')}`, 'cyan')
    
    // Check if photos were actually replaced
    const originalPhotos = generateData.selected_photo_ids
    const recreatedPhotos = recreateData.selected_photo_ids
    
    if (JSON.stringify(originalPhotos) === JSON.stringify(recreatedPhotos)) {
      log('⚠️ Warning: No photos were replaced (same photos as original)', 'yellow')
    } else {
      log('✅ Photos were successfully replaced!', 'green')
    }
    
    log('\n🎉 Test completed successfully!', 'bright')
    log(`📋 Memory book ID: ${bookId}`, 'cyan')
    
  } catch (error) {
    log(`\n❌ Test failed: ${error.message}`, 'red')
    process.exit(1)
  }
}

// Run the test
main()
