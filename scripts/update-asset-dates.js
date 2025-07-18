#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import exifr from 'exifr'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
const envPath = join(__dirname, '..', '.env')
let envVars = {}

try {
  const envContent = readFileSync(envPath, 'utf8')
  envVars = Object.fromEntries(
    envContent
      .split('\n')
      .filter(line => line.includes('=') && !line.startsWith('#'))
      .map(line => {
        const [key, ...valueParts] = line.split('=')
        return [key.trim(), valueParts.join('=').trim()]
      })
  )
} catch (error) {
  console.log('No .env file found, using process.env')
}

const supabaseUrl = envVars.SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  console.error('   Please check your .env file or environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Function to extract date from EXIF data
async function extractDateFromExif(buffer) {
  try {
    // Use exifr to extract date information
    const exifData = await exifr.parse(buffer, {
      tiff: false,
      xmp: false,
      icc: false,
      iptc: false,
      jfif: false,
      ihdr: false,
      exif: true
    })
    
    if (exifData && exifData.DateTimeOriginal) {
      return exifData.DateTimeOriginal.toISOString()
    } else if (exifData && exifData.DateTime) {
      return exifData.DateTime.toISOString()
    } else if (exifData && exifData.CreateDate) {
      return exifData.CreateDate.toISOString()
    }
    
    return null
  } catch (error) {
    console.error('Error parsing EXIF date:', error)
    return null
  }
}

// Function to download and analyze a photo
async function analyzePhoto(asset) {
  try {
    if (!asset.storage_url || asset.type !== 'photo') {
      return null
    }

    console.log(`📸 Analyzing photo: ${asset.title || asset.id}`)
    
    // Extract the file path from the storage URL
    // Storage URLs look like: https://xxx.supabase.co/storage/v1/object/public/assets/user-id/filename
    const urlParts = asset.storage_url.split('/storage/v1/object/public/assets/')
    if (urlParts.length !== 2) {
      console.error(`❌ Invalid storage URL format: ${asset.storage_url}`)
      return null
    }
    
    const filePath = urlParts[1]
    console.log(`📁 File path: ${filePath}`)
    
    // Download the photo from Supabase storage
    const { data: photoData, error: downloadError } = await supabase.storage
      .from('assets')
      .download(filePath)
    
    if (downloadError) {
      console.error(`❌ Failed to download photo: ${downloadError.message}`)
      return null
    }

    // Convert to buffer for EXIF reading
    const buffer = await photoData.arrayBuffer()
    
    // Extract date from EXIF
    const assetDate = await extractDateFromExif(buffer)
    
    if (assetDate) {
      console.log(`✅ Found date: ${assetDate}`)
      return assetDate
    } else {
      console.log(`⚠️  No date found in EXIF data`)
      return null
    }
    
  } catch (error) {
    console.error(`❌ Error analyzing photo: ${error.message}`)
    return null
  }
}

// Main function to update asset dates
async function updateAssetDates() {
  console.log('🚀 Starting asset date update process...\n')
  
  try {
    // Get all assets that don't have asset_date set
    const { data: assets, error } = await supabase
      .from('assets')
      .select('id, title, storage_url, type, asset_date')
      .is('asset_date', null)
      .eq('type', 'photo')
      .eq('deleted', false)
    
    if (error) {
      console.error('❌ Failed to fetch assets:', error.message)
      return
    }
    
    console.log(`📊 Found ${assets.length} assets without asset_date`)
    
    if (assets.length === 0) {
      console.log('✅ All assets already have dates!')
      return
    }
    
    let updatedCount = 0
    let skippedCount = 0
    let errorCount = 0
    
    // Process assets in batches to avoid overwhelming the system
    const batchSize = 5
    for (let i = 0; i < assets.length; i += batchSize) {
      const batch = assets.slice(i, i + batchSize)
      
      console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(assets.length / batchSize)}`)
      
      for (const asset of batch) {
        try {
          const assetDate = await analyzePhoto(asset)
          
          if (assetDate) {
            // Update the asset with the extracted date
            const { error: updateError } = await supabase
              .from('assets')
              .update({ asset_date: assetDate })
              .eq('id', asset.id)
            
            if (updateError) {
              console.error(`❌ Failed to update asset ${asset.id}: ${updateError.message}`)
              errorCount++
            } else {
              console.log(`✅ Updated asset ${asset.id}`)
              updatedCount++
            }
          } else {
            skippedCount++
          }
          
          // Small delay to be nice to the system
          await new Promise(resolve => setTimeout(resolve, 100))
          
        } catch (error) {
          console.error(`❌ Error processing asset ${asset.id}: ${error.message}`)
          errorCount++
        }
      }
      
      // Delay between batches
      if (i + batchSize < assets.length) {
        console.log('⏳ Waiting 2 seconds before next batch...')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
    
    console.log('\n📈 Update Summary:')
    console.log(`   ✅ Updated: ${updatedCount}`)
    console.log(`   ⚠️  Skipped: ${skippedCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)
    console.log(`   📊 Total processed: ${assets.length}`)
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message)
  }
}

// Run the script
updateAssetDates()
  .then(() => {
    console.log('\n🎉 Asset date update process completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error)
    process.exit(1)
  }) 