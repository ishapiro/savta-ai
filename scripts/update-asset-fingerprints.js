import { createClient } from '@supabase/supabase-js'
import { generateAssetFingerprint } from '../server/utils/generate-fingerprint.js'

// Load environment variables
const config = {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
}

if (!config.supabaseUrl || !config.supabaseServiceKey) {
  console.error('❌ Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey)

async function updateAssetFingerprints() {
  try {
    console.log('🔍 Starting asset fingerprint update...')
    
    // Get all assets that don't have fingerprints
    const { data: assets, error: fetchError } = await supabase
      .from('assets')
      .select('*')
      .is('fingerprint', null)
      .eq('deleted', false)
    
    if (fetchError) {
      console.error('❌ Error fetching assets:', fetchError)
      return
    }
    
    console.log(`📸 Found ${assets.length} assets without fingerprints`)
    
    if (assets.length === 0) {
      console.log('✅ All assets already have fingerprints')
      return
    }
    
    // Update assets with fingerprints
    let updatedCount = 0
    let errorCount = 0
    
    for (const asset of assets) {
      try {
        const fingerprint = generateAssetFingerprint(asset)
        
        const { error: updateError } = await supabase
          .from('assets')
          .update({ fingerprint })
          .eq('id', asset.id)
        
        if (updateError) {
          console.error(`❌ Error updating asset ${asset.id}:`, updateError)
          errorCount++
        } else {
          updatedCount++
          if (updatedCount % 10 === 0) {
            console.log(`✅ Updated ${updatedCount} assets...`)
          }
        }
      } catch (error) {
        console.error(`❌ Error processing asset ${asset.id}:`, error)
        errorCount++
      }
    }
    
    console.log(`🎉 Fingerprint update complete!`)
    console.log(`✅ Successfully updated: ${updatedCount} assets`)
    console.log(`❌ Errors: ${errorCount} assets`)
    
  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

// Run the script
updateAssetFingerprints()
  .then(() => {
    console.log('✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  }) 