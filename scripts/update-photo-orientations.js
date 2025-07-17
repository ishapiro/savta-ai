// Script to update existing assets with photo orientation data
// Run this after applying the migration to populate orientation data for existing photos

import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import fetch from 'node-fetch'

const config = {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
}

console.log('🔍 Environment check:')
console.log('SUPABASE_URL:', config.supabaseUrl ? '✅ Set' : '❌ Missing')
console.log('SUPABASE_SERVICE_ROLE_KEY:', config.supabaseServiceRoleKey ? '✅ Set' : '❌ Missing')

if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
  console.error('❌ Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  console.error('Please make sure these are set in your environment')
  process.exit(1)
}

const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey)

async function updatePhotoOrientations() {
  try {
    console.log('🔄 Starting photo orientation update...')
    
    // Get all photo assets without orientation data
    const { data: assets, error } = await supabase
      .from('assets')
      .select('id, storage_url, type')
      .eq('type', 'photo')
      .is('orientation', null)
      .not('storage_url', 'is', null)
    
    if (error) {
      console.error('❌ Error fetching assets:', error)
      return
    }
    
    console.log(`📸 Found ${assets.length} photos to update`)
    
    let updated = 0
    let failed = 0
    
    for (const asset of assets) {
      try {
        console.log(`🔄 Processing asset ${asset.id}...`)
        
        // Download image
        const response = await fetch(asset.storage_url)
        if (!response.ok) {
          console.warn(`⚠️ Failed to fetch image for ${asset.id}: ${response.status}`)
          failed++
          continue
        }
        
        const imageBuffer = await response.buffer()
        
        // Analyze image dimensions
        const imageInfo = await sharp(imageBuffer).metadata()
        
        const width = imageInfo.width || 0
        const height = imageInfo.height || 0
        
        // Determine orientation
        let orientation = 'square'
        if (width > height) {
          orientation = 'landscape'
        } else if (height > width) {
          orientation = 'portrait'
        }
        
        // Update database
        const { error: updateError } = await supabase
          .from('assets')
          .update({
            width,
            height,
            orientation
          })
          .eq('id', asset.id)
        
        if (updateError) {
          console.error(`❌ Failed to update ${asset.id}:`, updateError)
          failed++
        } else {
          console.log(`✅ Updated ${asset.id}: ${width}x${height} (${orientation})`)
          updated++
        }
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error(`❌ Error processing ${asset.id}:`, error.message)
        failed++
      }
    }
    
    console.log(`\n🎉 Update complete!`)
    console.log(`✅ Updated: ${updated}`)
    console.log(`❌ Failed: ${failed}`)
    
  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

// Run the script
updatePhotoOrientations()
  .then(() => {
    console.log('✅ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  }) 