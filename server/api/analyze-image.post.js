import sharp from 'sharp'
import exifr from 'exifr'



export default defineEventHandler(async (event) => {
  try {
    console.log('📸 Image analysis endpoint called')
    const formData = await readFormData(event)
    const file = formData.get('file')
    
    if (!file) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No file provided'
      })
    }

    console.log(`📸 Analyzing file: ${file.name} (${file.size} bytes)`)
    
    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Import Sharp for image processing
    const imageInfo = await sharp(buffer).metadata()
    console.log(`📐 Image: ${imageInfo.width}x${imageInfo.height}`)
    console.log(`📋 EXIF data present: ${imageInfo.exif ? 'Yes' : 'No'}`)
    
    let photoMetadata = {
      width: imageInfo.width || 0,
      height: imageInfo.height || 0,
      orientation: 'square',
      location: null,
      city: null,
      state: null,
      country: null,
      zip_code: null
    }
    
    // Determine orientation
    if (photoMetadata.width > photoMetadata.height) {
      photoMetadata.orientation = 'landscape'
    } else if (photoMetadata.height > photoMetadata.width) {
      photoMetadata.orientation = 'portrait'
    }
    
    // Extract GPS data from EXIF if available
    try {
      console.log('📍 Attempting GPS extraction with exifr...')
      
      // Use exifr to parse GPS data - it's more robust and handles various formats
      const gpsData = await exifr.gps(buffer)
      console.log('📍 GPS extraction result:', gpsData)
      
      if (gpsData && gpsData.latitude && gpsData.longitude) {
        photoMetadata.location = `${gpsData.latitude},${gpsData.longitude}`
        console.log(`📍 GPS coordinates extracted: ${gpsData.latitude}, ${gpsData.longitude}`)
      } else {
        console.log('📍 No GPS coordinates found in image')
      }
      
      // Also try to get other EXIF data
      const exifData = await exifr.parse(buffer, { gps: true, exif: true })
      console.log('📍 Full EXIF data:', exifData)
      
      // Log other useful EXIF data
      if (exifData && exifData.DateTime) {
        console.log(`📍 Photo taken: ${exifData.DateTime}`)
      }
      if (exifData && (exifData.Make || exifData.Model)) {
        console.log(`📍 Camera: ${exifData.Make || ''} ${exifData.Model || ''}`.trim())
      }
      
    } catch (gpsError) {
      console.warn('⚠️ Failed to extract GPS data:', gpsError.message)
    }
    
    // If we have GPS coordinates, geocode them
    if (photoMetadata.location) {
      try {
        console.log('🌍 Starting geocoding process...')
        const [lat, lon] = photoMetadata.location.split(',').map(Number)
        console.log(`🌍 GPS coordinates: ${lat}, ${lon}`)
        
        // Use MapBox API for geocoding
        const mapboxToken = process.env.MAPBOX_TOKEN
        if (mapboxToken) {
          console.log('🌍 MapBox token found, making geocoding request...')
          const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${mapboxToken}&types=place,locality,neighborhood`
          console.log(`🌍 Geocoding URL: ${geocodeUrl.replace(mapboxToken, '[TOKEN_HIDDEN]')}`)
          
          try {
            const geocodeResponse = await fetch(geocodeUrl)
            console.log(`🌍 Geocoding response status: ${geocodeResponse.status}`)
            
            if (geocodeResponse.ok) {
              const geocodeData = await geocodeResponse.json()
              console.log(`🌍 Geocoding response features: ${geocodeData.features?.length || 0}`)
              
              if (geocodeData.features && geocodeData.features.length > 0) {
                const feature = geocodeData.features[0]
                const context = feature.context || []
                console.log(`🌍 Primary feature: ${feature.text}`)
                console.log(`🌍 Context items: ${context.length}`)
                
                // Extract location components
                photoMetadata.city = feature.text || null
                photoMetadata.state = context.find(c => c.id.startsWith('region'))?.text || null
                photoMetadata.country = context.find(c => c.id.startsWith('country'))?.text || null
                photoMetadata.zip_code = context.find(c => c.id.startsWith('postcode'))?.text || null
                
                console.log(`📍 Geocoding successful:`)
                console.log(`   City: ${photoMetadata.city}`)
                console.log(`   State: ${photoMetadata.state}`)
                console.log(`   Country: ${photoMetadata.country}`)
                console.log(`   ZIP: ${photoMetadata.zip_code}`)
              } else {
                console.warn('⚠️ No features found in geocoding response')
              }
            } else {
              const errorText = await geocodeResponse.text()
              console.warn(`⚠️ Geocoding API request failed: ${geocodeResponse.status} - ${errorText}`)
            }
          } catch (fetchError) {
            console.warn('⚠️ Failed to fetch geocoding data:', fetchError.message)
          }
        } else {
          console.warn('⚠️ MapBox token not configured - skipping geocoding')
        }
      } catch (geocodeError) {
        console.warn('⚠️ Failed to geocode location:', geocodeError.message)
      }
    } else {
      console.log('📍 No GPS coordinates to geocode')
    }
    
    console.log(`📐 Image analysis complete: ${photoMetadata.width}x${photoMetadata.height} (${photoMetadata.orientation})`)
    
    return {
      success: true,
      metadata: photoMetadata
    }
    
  } catch (error) {
    console.error('❌ Image analysis error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to analyze image'
    })
  }
}) 