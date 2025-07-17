// Script to update existing assets with location data
// Run this after applying the migration to populate location data for existing photos

import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import fetch from 'node-fetch'

const config = {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  mapboxToken: process.env.MAPBOX_TOKEN
}

console.log('🔍 Environment check:')
console.log('SUPABASE_URL:', config.supabaseUrl ? '✅ Set' : '❌ Missing')
console.log('SUPABASE_SERVICE_ROLE_KEY:', config.supabaseServiceRoleKey ? '✅ Set' : '❌ Missing')
console.log('MAPBOX_TOKEN:', config.mapboxToken ? '✅ Set' : '❌ Missing')

if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
  console.error('❌ Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  console.error('Please make sure these are set in your environment')
  process.exit(1)
}

if (!config.mapboxToken) {
  console.error('❌ Missing MAPBOX_TOKEN environment variable')
  console.error('Please add your MapBox token to the environment')
  process.exit(1)
}

const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey)

// Function to extract GPS coordinates from EXIF data
function extractGPSFromEXIF(exifBuffer) {
  try {
    console.log(`📍 EXIF buffer size: ${exifBuffer.length} bytes`)
    
    // This is a simplified GPS extraction - in production you'd want a proper EXIF parser
    // For now, we'll return null and focus on the geocoding structure
    // You can implement proper GPS extraction here using a library like 'exif-reader'
    console.log('📍 GPS extraction not implemented yet - returning null')
    return null
  } catch (error) {
    console.warn('⚠️ Failed to extract GPS from EXIF:', error.message)
    return null
  }
}

// Function to geocode coordinates using MapBox
async function geocodeCoordinates(lat, lon) {
  try {
    const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${config.mapboxToken}&types=place,locality,neighborhood`
    const response = await fetch(geocodeUrl)
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0]
      const context = feature.context || []
      
      return {
        city: feature.text || null,
        state: context.find(c => c.id.startsWith('region'))?.text || null,
        country: context.find(c => c.id.startsWith('country'))?.text || null,
        zip_code: context.find(c => c.id.startsWith('postcode'))?.text || null
      }
    }
    
    return null
  } catch (error) {
    console.warn('⚠️ Geocoding failed:', error.message)
    return null
  }
}

async function updatePhotoLocations() {
  try {
    console.log('🔄 Starting photo location update...')
    
    // Get all photo assets without location data
    const { data: assets, error } = await supabase
      .from('assets')
      .select('id, storage_url, type')
      .eq('type', 'photo')
      .is('city', null)
      .not('storage_url', 'is', null)
    
    if (error) {
      console.error('❌ Error fetching assets:', error)
      return
    }
    
    console.log(`📸 Found ${assets.length} photos to update`)
    
    let updated = 0
    let failed = 0
    let skipped = 0
    
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
        
        // Analyze image metadata
        const imageInfo = await sharp(imageBuffer).metadata()
        
        // Extract GPS coordinates from EXIF
        let location = null
        if (imageInfo.exif) {
          console.log(`📍 EXIF data found for ${asset.id}`)
          location = extractGPSFromEXIF(imageInfo.exif)
        } else {
          console.log(`📍 No EXIF data found for ${asset.id}`)
        }
        
        let locationData = null
        
        // If we have GPS coordinates, geocode them
        if (location) {
          console.log(`📍 GPS coordinates found: ${location}`)
          const [lat, lon] = location.split(',').map(Number)
          console.log(`📍 Parsed coordinates: ${lat}, ${lon}`)
          
          locationData = await geocodeCoordinates(lat, lon)
          
          if (locationData) {
            console.log(`📍 Geocoding successful:`)
            console.log(`   City: ${locationData.city}`)
            console.log(`   State: ${locationData.state}`)
            console.log(`   Country: ${locationData.country}`)
            console.log(`   ZIP: ${locationData.zip_code}`)
          } else {
            console.log(`📍 Geocoding failed for ${asset.id}`)
          }
        } else {
          console.log(`📍 No GPS data found for ${asset.id}`)
          skipped++
          continue
        }
        
        // Update database with location data
        const updateData = {
          location: location
        }
        
        if (locationData) {
          updateData.city = locationData.city
          updateData.state = locationData.state
          updateData.country = locationData.country
          updateData.zip_code = locationData.zip_code
        }
        
        const { error: updateError } = await supabase
          .from('assets')
          .update(updateData)
          .eq('id', asset.id)
        
        if (updateError) {
          console.error(`❌ Failed to update ${asset.id}:`, updateError)
          failed++
        } else {
          console.log(`✅ Updated ${asset.id} with location data`)
          updated++
        }
        
        // Small delay to avoid overwhelming the APIs
        await new Promise(resolve => setTimeout(resolve, 200))
        
      } catch (error) {
        console.error(`❌ Error processing ${asset.id}:`, error.message)
        failed++
      }
    }
    
    console.log(`\n🎉 Update complete!`)
    console.log(`✅ Updated: ${updated}`)
    console.log(`⏭️ Skipped (no GPS): ${skipped}`)
    console.log(`❌ Failed: ${failed}`)
    
  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

// Run the script
updatePhotoLocations()
  .then(() => {
    console.log('✅ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  }) 