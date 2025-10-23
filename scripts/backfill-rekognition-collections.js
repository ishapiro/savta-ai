#!/usr/bin/env node

/**
 * Backfill Script: Reindex All Assets with AWS Rekognition Collections
 * 
 * This script processes all user assets and indexes faces using the new
 * AWS Rekognition Collections system (IndexFaces + SearchFaces).
 * 
 * Usage:
 *   node scripts/backfill-rekognition-collections.js [--user-id=<uuid>] [--dry-run] [--limit=<number>]
 * 
 * Options:
 *   --user-id=<uuid>   Process only specific user (optional, processes all users if omitted)
 *   --dry-run          Show what would be processed without making changes
 *   --limit=<number>   Limit number of assets to process (for testing)
 *   --skip-prompt      Skip confirmation prompt (use with caution)
 *   --batch-size=<n>   Process assets in batches (default: 10)
 */

import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'

// Load environment variables
const SUPABASE_URL = process.env.NUXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SITE_URL = process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'

// Parse command line arguments
const args = process.argv.slice(2)
const options = {
  userId: args.find(arg => arg.startsWith('--user-id='))?.split('=')[1],
  dryRun: args.includes('--dry-run'),
  limit: parseInt(args.find(arg => arg.startsWith('--limit='))?.split('=')[1] || '0'),
  skipPrompt: args.includes('--skip-prompt'),
  batchSize: parseInt(args.find(arg => arg.startsWith('--batch-size='))?.split('=')[1] || '10')
}

// Validate environment
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
  process.exit(1)
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Statistics
const stats = {
  totalUsers: 0,
  totalAssets: 0,
  processed: 0,
  successful: 0,
  failed: 0,
  skipped: 0,
  facesDetected: 0,
  facesAutoAssigned: 0,
  facesNeedingInput: 0,
  errors: []
}

// Progress tracking
let progressInterval

/**
 * Display progress bar
 */
function showProgress() {
  const percent = Math.round((stats.processed / stats.totalAssets) * 100)
  const bar = '█'.repeat(Math.floor(percent / 2)) + '░'.repeat(50 - Math.floor(percent / 2))
  
  process.stdout.write(`\r[${bar}] ${percent}% | ${stats.processed}/${stats.totalAssets} assets | ` +
    `✅ ${stats.successful} | ❌ ${stats.failed} | 👥 ${stats.facesDetected} faces`)
}

/**
 * Fetch all users or specific user
 */
async function getUsers() {
  console.log('📋 Fetching users...\n')
  
  let query = supabase
    .from('profiles')
    .select('user_id, email, full_name')
    .eq('deleted', false)
    .order('created_at', { ascending: true })
  
  if (options.userId) {
    query = query.eq('user_id', options.userId)
  }
  
  const { data, error } = await query
  
  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`)
  }
  
  return data || []
}

/**
 * Fetch assets for a user
 */
async function getUserAssets(userId) {
  let query = supabase
    .from('assets')
    .select('id, user_id, storage_url, file_name, mime_type')
    .eq('user_id', userId)
    .eq('deleted', false)
    .eq('approved', true) // Only process approved assets
    .like('mime_type', 'image/%') // Only images
    .not('storage_url', 'is', null)
    .order('created_at', { ascending: true })
  
  if (options.limit > 0) {
    query = query.limit(options.limit)
  }
  
  const { data, error } = await query
  
  if (error) {
    throw new Error(`Failed to fetch assets for user ${userId}: ${error.message}`)
  }
  
  return data || []
}

/**
 * Get session token for user (for API authentication)
 */
async function getServiceToken() {
  // For service-to-service calls, we'll use the service role key
  // The API endpoints will need to handle service role authentication
  return SUPABASE_SERVICE_KEY
}

/**
 * Index faces for a single asset
 */
async function indexAsset(asset, userEmail) {
  try {
    // Call the index-face-rekognition endpoint
    const response = await fetch(`${SITE_URL}/api/ai/index-face-rekognition`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getServiceToken()}`,
        'X-User-Id': asset.user_id // Pass user ID for service role calls
      },
      body: JSON.stringify({
        imageUrl: asset.storage_url,
        assetId: asset.id,
        reprocessOptions: { faces: true }
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    
    const result = await response.json()
    
    // Update statistics
    stats.facesDetected += result.facesDetected || 0
    stats.facesAutoAssigned += result.autoAssigned?.length || 0
    stats.facesNeedingInput += result.needsUserInput?.length || 0
    stats.successful++
    
    return {
      success: true,
      facesDetected: result.facesDetected || 0,
      autoAssigned: result.autoAssigned?.length || 0,
      needsUserInput: result.needsUserInput?.length || 0
    }
    
  } catch (error) {
    stats.failed++
    stats.errors.push({
      assetId: asset.id,
      fileName: asset.file_name,
      userEmail,
      error: error.message
    })
    
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Process all assets for a user
 */
async function processUser(user) {
  console.log(`\n👤 Processing user: ${user.email || user.user_id}`)
  
  // Fetch assets
  const assets = await getUserAssets(user.user_id)
  
  if (assets.length === 0) {
    console.log('   ℹ️  No assets found')
    return
  }
  
  console.log(`   📸 Found ${assets.length} assets`)
  stats.totalAssets += assets.length
  
  if (options.dryRun) {
    console.log('   🔍 DRY RUN: Would process these assets')
    assets.forEach((asset, i) => {
      console.log(`      ${i + 1}. ${asset.file_name}`)
    })
    stats.skipped += assets.length
    return
  }
  
  // Process assets in batches
  for (let i = 0; i < assets.length; i += options.batchSize) {
    const batch = assets.slice(i, i + options.batchSize)
    
    // Process batch in parallel
    const results = await Promise.all(
      batch.map(asset => indexAsset(asset, user.email))
    )
    
    stats.processed += batch.length
    showProgress()
    
    // Small delay between batches to avoid overwhelming AWS
    if (i + options.batchSize < assets.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}

/**
 * Display summary statistics
 */
function displaySummary() {
  console.log('\n\n' + '='.repeat(80))
  console.log('📊 BACKFILL SUMMARY')
  console.log('='.repeat(80))
  console.log()
  console.log(`👥 Users processed:           ${stats.totalUsers}`)
  console.log(`📸 Total assets:              ${stats.totalAssets}`)
  console.log(`✅ Successfully processed:    ${stats.successful}`)
  console.log(`❌ Failed:                    ${stats.failed}`)
  console.log(`⏭️  Skipped (dry run):        ${stats.skipped}`)
  console.log()
  console.log(`🎭 Faces detected:            ${stats.facesDetected}`)
  console.log(`🤖 Faces auto-assigned:       ${stats.facesAutoAssigned}`)
  console.log(`👤 Faces needing user input:  ${stats.facesNeedingInput}`)
  console.log()
  
  if (stats.errors.length > 0) {
    console.log('❌ ERRORS:')
    console.log('─'.repeat(80))
    stats.errors.forEach((err, i) => {
      console.log(`${i + 1}. Asset: ${err.fileName} (${err.assetId})`)
      console.log(`   User: ${err.userEmail}`)
      console.log(`   Error: ${err.error}`)
      console.log()
    })
  }
  
  // Calculate estimated costs
  const indexFacesCalls = stats.successful
  const searchFacesCalls = stats.facesDetected
  const estimatedCost = (indexFacesCalls * 0.001) + (searchFacesCalls * 0.001)
  
  console.log('💰 ESTIMATED AWS COSTS:')
  console.log('─'.repeat(80))
  console.log(`IndexFaces calls:   ${indexFacesCalls} × $0.001 = $${(indexFacesCalls * 0.001).toFixed(2)}`)
  console.log(`SearchFaces calls:  ${searchFacesCalls} × $0.001 = $${(searchFacesCalls * 0.001).toFixed(2)}`)
  console.log(`Total estimated:    $${estimatedCost.toFixed(2)}`)
  console.log()
  console.log('='.repeat(80))
  
  if (options.dryRun) {
    console.log('\n✨ DRY RUN COMPLETED - No changes were made')
  } else {
    console.log('\n✅ BACKFILL COMPLETED')
    
    if (stats.facesNeedingInput > 0) {
      console.log(`\n⚠️  ${stats.facesNeedingInput} faces need user assignment.`)
      console.log('   Users should visit the Person Manager page to assign these faces.')
    }
  }
}

/**
 * Prompt user for confirmation
 */
async function promptConfirmation(users, totalAssets) {
  if (options.skipPrompt) {
    return true
  }
  
  console.log('\n' + '='.repeat(80))
  console.log('⚠️  CONFIRMATION REQUIRED')
  console.log('='.repeat(80))
  console.log()
  console.log(`This will process:`)
  console.log(`  • ${users.length} user(s)`)
  console.log(`  • ~${totalAssets} asset(s)`)
  console.log()
  
  // Estimate costs
  const avgFacesPerPhoto = 2
  const estimatedFaces = totalAssets * avgFacesPerPhoto
  const estimatedCost = (totalAssets * 0.001) + (estimatedFaces * 0.001)
  
  console.log(`Estimated AWS costs:`)
  console.log(`  • IndexFaces:  ${totalAssets} calls × $0.001 = $${(totalAssets * 0.001).toFixed(2)}`)
  console.log(`  • SearchFaces: ~${estimatedFaces} calls × $0.001 = $${(estimatedFaces * 0.001).toFixed(2)}`)
  console.log(`  • Total:       ~$${estimatedCost.toFixed(2)}`)
  console.log()
  
  if (options.dryRun) {
    console.log('🔍 DRY RUN MODE: No changes will be made')
    console.log()
  }
  
  // Use readline for interactive prompt
  const readline = await import('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  return new Promise((resolve) => {
    rl.question('Do you want to continue? (yes/no): ', (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y')
    })
  })
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 AWS Rekognition Collections Backfill Script')
  console.log('='.repeat(80))
  console.log()
  
  if (options.dryRun) {
    console.log('🔍 DRY RUN MODE ENABLED')
  }
  
  if (options.userId) {
    console.log(`🎯 Filtering: User ID = ${options.userId}`)
  }
  
  if (options.limit > 0) {
    console.log(`🔢 Limit: ${options.limit} assets per user`)
  }
  
  console.log(`📦 Batch size: ${options.batchSize} assets`)
  console.log()
  
  try {
    // Fetch users
    const users = await getUsers()
    
    if (users.length === 0) {
      console.log('ℹ️  No users found')
      return
    }
    
    stats.totalUsers = users.length
    console.log(`✅ Found ${users.length} user(s)`)
    
    // Quick count of total assets
    let totalAssetsCount = 0
    for (const user of users) {
      const assets = await getUserAssets(user.user_id)
      totalAssetsCount += assets.length
    }
    
    // Confirmation prompt
    const confirmed = await promptConfirmation(users, totalAssetsCount)
    
    if (!confirmed) {
      console.log('\n❌ Backfill cancelled by user')
      process.exit(0)
    }
    
    console.log('\n🏁 Starting backfill...')
    
    // Start progress indicator
    if (!options.dryRun) {
      progressInterval = setInterval(() => {
        // Progress is updated after each batch
      }, 1000)
    }
    
    // Process each user
    for (const user of users) {
      await processUser(user)
    }
    
    // Stop progress indicator
    if (progressInterval) {
      clearInterval(progressInterval)
    }
    
    // Display summary
    displaySummary()
    
    process.exit(stats.failed > 0 ? 1 : 0)
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  if (progressInterval) {
    clearInterval(progressInterval)
  }
  console.log('\n\n⚠️  Backfill interrupted by user')
  displaySummary()
  process.exit(130)
})

// Run the script
main()

