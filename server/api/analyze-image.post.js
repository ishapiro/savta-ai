import sharp from 'sharp'
import exifr from 'exifr'

// Function to analyze location using OpenAI Vision API
async function analyzeLocationWithOpenAI(imageBuffer, openaiApiKey) {
  try {
    console.log('🤖 Starting OpenAI location analysis...')
    console.log(`🤖 Image buffer size: ${imageBuffer.length} bytes`)
    
    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64')
    console.log(`🤖 Base64 image size: ${base64Image.length} characters`)
    
    const locationPrompt = `Analyze this photo and determine the location where it was taken. Look for visual clues such as:
- Landmarks, buildings, or distinctive architecture
- Street signs, store names, or business names
- Natural features like mountains, beaches, parks, or distinctive landscapes
- Cultural or regional indicators (flags, signs in different languages, etc.)
- Weather conditions or seasonal indicators
- Any text or signage visible in the image
- Famous monuments, museums, or tourist attractions
- Distinctive neighborhoods or districts
- Natural landmarks (rivers, mountains, coastlines)

If you can identify a specific location, provide the details in the following JSON format:
{
  "city": "City name",
  "state": "State or province name", 
  "country": "Country name",
  "zip_code": "Postal code if visible",
  "landmarks": ["Landmark 1", "Landmark 2"],
  "neighborhood": "Neighborhood or district name",
  "confidence": "high|medium|low",
  "reasoning": "Brief explanation of how you identified the location"
}

If you cannot determine the location with any confidence, respond with:
{
  "city": null,
  "state": null,
  "country": null,
  "zip_code": null,
  "landmarks": [],
  "neighborhood": null,
  "confidence": "none",
  "reasoning": "No clear location indicators found in the image"
}

Respond only with valid JSON.`
    
    console.log('🤖 OpenAI location prompt:', locationPrompt)

    console.log('🤖 Making OpenAI API request...')
    console.log(`🤖 OpenAI API key length: ${openaiApiKey.length} characters`)
    console.log(`🤖 Request payload size: ${JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: locationPrompt
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_completion_tokens: 1000
    }).length} characters`)
    
    const startTime = Date.now()
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-5',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: locationPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_completion_tokens: 1000
      })
    })
    const endTime = Date.now()
    console.log(`🤖 OpenAI API response time: ${endTime - startTime}ms`)

    console.log(`🤖 OpenAI API response status: ${response.status}`)
    console.log(`🤖 Response headers:`, Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.warn(`⚠️ OpenAI API error: ${response.status} - ${errorText}`)
      console.error(`🤖 OpenAI API error details: status=${response.status}, statusText=${response.statusText}`)
      return null
    }

    const result = await response.json()
    console.log(`🤖 OpenAI API response structure:`, JSON.stringify(result, null, 2))
    const content = result.choices[0].message.content
    
    console.log('🤖 OpenAI location analysis response:', content)
    console.log(`🤖 Response content length: ${content.length} characters`)
    
    // Parse the JSON response
    try {
      console.log('🤖 Attempting to parse JSON from response...')
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        console.log(`🤖 Found JSON match: ${jsonMatch[0]}`)
        const locationData = JSON.parse(jsonMatch[0])
        console.log('🤖 Parsed location data:', locationData)
        console.log(`🤖 Location data validation:`)
        console.log(`   - City: ${locationData.city} (${typeof locationData.city})`)
        console.log(`   - State: ${locationData.state} (${typeof locationData.state})`)
        console.log(`   - Country: ${locationData.country} (${typeof locationData.country})`)
        console.log(`   - ZIP: ${locationData.zip_code} (${typeof locationData.zip_code})`)
        console.log(`   - Landmarks: ${locationData.landmarks} (${typeof locationData.landmarks})`)
        console.log(`   - Neighborhood: ${locationData.neighborhood} (${typeof locationData.neighborhood})`)
        console.log(`   - Confidence: ${locationData.confidence} (${typeof locationData.confidence})`)
        console.log(`   - Reasoning: ${locationData.reasoning} (${typeof locationData.reasoning})`)
        return locationData
      } else {
        console.warn('⚠️ No JSON found in OpenAI response')
        console.log(`🤖 Full response content for debugging:`, content)
        return null
      }
    } catch (parseError) {
      console.warn('⚠️ Failed to parse OpenAI location response:', parseError.message)
      console.error(`🤖 Parse error details:`, parseError)
      console.log(`🤖 Content that failed to parse:`, content)
      return null
    }
    
  } catch (error) {
    console.warn('⚠️ OpenAI location analysis failed:', error.message)
    return null
  }
}

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
      zip_code: null,
      asset_date: null
    }
    
    // Determine orientation
    if (photoMetadata.width > photoMetadata.height) {
      photoMetadata.orientation = 'landscape'
    } else if (photoMetadata.height > photoMetadata.width) {
      photoMetadata.orientation = 'portrait'
    }
    
    // Extract GPS data from EXIF if available
    let gpsDataFound = false
    try {
      console.log('📍 Attempting GPS extraction with exifr...')
      
      // Use exifr to parse GPS data - it's more robust and handles various formats
      const gpsData = await exifr.gps(buffer)
      console.log('📍 GPS extraction result:', gpsData)
      
      if (gpsData && gpsData.latitude && gpsData.longitude) {
        photoMetadata.location = `${gpsData.latitude},${gpsData.longitude}`
        console.log(`📍 GPS coordinates extracted: ${gpsData.latitude}, ${gpsData.longitude}`)
        gpsDataFound = true
      } else {
        console.log('📍 No GPS coordinates found in image')
      }
      
      // Also try to get other EXIF data
      const exifData = await exifr.parse(buffer, { gps: true, exif: true })
      console.log('📍 Full EXIF data:', exifData)
      
      // Log other useful EXIF data
      if (exifData && exifData.DateTime) {
        console.log(`📍 Photo taken: ${exifData.DateTime}`)
        
        // Extract and parse the date from EXIF
        try {
          // EXIF DateTime format is typically "YYYY:MM:DD HH:MM:SS"
          const dateTimeStr = exifData.DateTime
          console.log(`📅 Raw EXIF DateTime: ${dateTimeStr}`)
          
          // Parse the EXIF date format
          const [datePart, timePart] = dateTimeStr.split(' ')
          const [year, month, day] = datePart.split(':').map(Number)
          const [hour, minute, second] = timePart.split(':').map(Number)
          
          // Create a Date object (months are 0-indexed in JavaScript)
          const photoDate = new Date(year, month - 1, day, hour, minute, second)
          
          // Validate the date
          if (!isNaN(photoDate.getTime()) && photoDate.getFullYear() > 1900 && photoDate.getFullYear() <= new Date().getFullYear()) {
            photoMetadata.asset_date = photoDate.toISOString()
            console.log(`📅 Parsed asset date: ${photoMetadata.asset_date}`)
          } else {
            console.warn(`⚠️ Invalid date parsed from EXIF: ${dateTimeStr}`)
          }
        } catch (dateError) {
          console.warn('⚠️ Failed to parse EXIF date:', dateError.message)
        }
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
        console.log(`🌍 Latitude: ${lat}, Longitude: ${lon}`)
        console.log(`🌍 Coordinate validation: lat=${typeof lat}, lon=${typeof lon}, lat valid=${!isNaN(lat)}, lon valid=${!isNaN(lon)}`)
        
        // Use MapBox API for geocoding
        const mapboxToken = process.env.MAPBOX_TOKEN
        if (mapboxToken) {
          console.log('🌍 MapBox token found, making geocoding request...')
          console.log(`🌍 MapBox token length: ${mapboxToken.length} characters`)
          const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${mapboxToken}&types=place,locality,neighborhood,poi&limit=5`
          console.log(`🌍 Geocoding URL: ${geocodeUrl.replace(mapboxToken, '[TOKEN_HIDDEN]')}`)
          console.log(`🌍 Full geocoding URL (with token): ${geocodeUrl}`)
          
                      try {
              console.log('🌍 Making MapBox API request...')
              const startTime = Date.now()
              const geocodeResponse = await fetch(geocodeUrl)
              const endTime = Date.now()
              console.log(`🌍 MapBox API response time: ${endTime - startTime}ms`)
              console.log(`🌍 Geocoding response status: ${geocodeResponse.status}`)
              console.log(`🌍 Response headers:`, Object.fromEntries(geocodeResponse.headers.entries()))
              
              if (geocodeResponse.ok) {
                const geocodeData = await geocodeResponse.json()
                console.log(`🌍 Geocoding response features: ${geocodeData.features?.length || 0}`)
                console.log(`🌍 Full MapBox response:`, JSON.stringify(geocodeData, null, 2))
                
                if (geocodeData.features && geocodeData.features.length > 0) {
                  const feature = geocodeData.features[0]
                  const context = feature.context || []
                  console.log(`🌍 Primary feature: ${feature.text}`)
                  console.log(`🌍 Context items: ${context.length}`)
                  console.log(`🌍 Feature type: ${feature.place_type?.[0] || 'unknown'}`)
                  console.log(`🌍 Feature details:`, JSON.stringify(feature, null, 2))
                  
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
                  
                  // Create comprehensive location string with landmarks and POIs
                  const locationParts = []
                  
                  // Add landmark/POI if this is a point of interest
                  if (feature.place_type && feature.place_type.includes('poi')) {
                    locationParts.push(feature.text)
                    console.log(`🏛️ Landmark/POI detected: ${feature.text}`)
                  }
                  
                  // Add city, state, country, zip
                  if (photoMetadata.city) locationParts.push(photoMetadata.city)
                  if (photoMetadata.state) locationParts.push(photoMetadata.state)
                  if (photoMetadata.country) locationParts.push(photoMetadata.country)
                  if (photoMetadata.zip_code) locationParts.push(photoMetadata.zip_code)
                  
                  // Look for additional landmarks in other features
                  const landmarks = []
                  for (let i = 1; i < Math.min(geocodeData.features.length, 5); i++) {
                    const otherFeature = geocodeData.features[i]
                    if (otherFeature.place_type && otherFeature.place_type.includes('poi')) {
                      landmarks.push(otherFeature.text)
                    }
                  }
                  
                  if (landmarks.length > 0) {
                    console.log(`🏛️ Additional landmarks found: ${landmarks.join(', ')}`)
                    // Add the most relevant landmark to the location string
                    locationParts.splice(1, 0, landmarks[0])
                  }
                  
                  if (locationParts.length > 0) {
                    photoMetadata.location = locationParts.join(', ')
                    console.log(`📍 Comprehensive location: ${photoMetadata.location}`)
                  }
                } else {
                  console.warn('⚠️ No features found in geocoding response')
                  console.log(`🌍 Empty features array in response`)
                }
              } else {
                const errorText = await geocodeResponse.text()
                console.warn(`⚠️ Geocoding API request failed: ${geocodeResponse.status} - ${errorText}`)
                console.error(`🌍 MapBox API error details: status=${geocodeResponse.status}, statusText=${geocodeResponse.statusText}`)
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
    
    // If no GPS data was found, try OpenAI location analysis
    if (!gpsDataFound && !photoMetadata.city) {
      console.log('🤖 No GPS data found, attempting OpenAI location analysis...')
      console.log(`🤖 GPS data found: ${gpsDataFound}`)
      console.log(`🤖 Current city: ${photoMetadata.city}`)
      
      const config = useRuntimeConfig()
      const openaiApiKey = config.openaiApiKey || process.env.OPENAI_API_KEY
      console.log(`🤖 OpenAI API key available: ${!!openaiApiKey}`)
      
      if (openaiApiKey) {
        console.log('🤖 Calling OpenAI location analysis...')
        const openaiLocationData = await analyzeLocationWithOpenAI(buffer, openaiApiKey)
        console.log(`🤖 OpenAI location analysis completed, result:`, openaiLocationData)
        
        if (openaiLocationData && openaiLocationData.confidence !== 'none') {
          console.log('🤖 OpenAI location analysis successful')
          console.log(`   City: ${openaiLocationData.city}`)
          console.log(`   State: ${openaiLocationData.state}`)
          console.log(`   Country: ${openaiLocationData.country}`)
          console.log(`   ZIP: ${openaiLocationData.zip_code}`)
          console.log(`   Neighborhood: ${openaiLocationData.neighborhood}`)
          console.log(`   Landmarks: ${openaiLocationData.landmarks?.join(', ') || 'None'}`)
          console.log(`   Confidence: ${openaiLocationData.confidence}`)
          console.log(`   Reasoning: ${openaiLocationData.reasoning}`)
          
          // Store the OpenAI location data in the same fields used by MapBox
          photoMetadata.city = openaiLocationData.city
          photoMetadata.state = openaiLocationData.state
          photoMetadata.country = openaiLocationData.country
          photoMetadata.zip_code = openaiLocationData.zip_code
          
          // Create comprehensive location string with landmarks and neighborhoods
          const locationParts = []
          
          // Add landmarks if available
          if (openaiLocationData.landmarks && openaiLocationData.landmarks.length > 0) {
            locationParts.push(openaiLocationData.landmarks[0])
            console.log(`🏛️ Primary landmark: ${openaiLocationData.landmarks[0]}`)
          }
          
          // Add neighborhood if available
          if (openaiLocationData.neighborhood) {
            locationParts.push(openaiLocationData.neighborhood)
            console.log(`🏘️ Neighborhood: ${openaiLocationData.neighborhood}`)
          }
          
          // Add city, state, country, zip
          if (openaiLocationData.city) locationParts.push(openaiLocationData.city)
          if (openaiLocationData.state) locationParts.push(openaiLocationData.state)
          if (openaiLocationData.country) locationParts.push(openaiLocationData.country)
          if (openaiLocationData.zip_code) locationParts.push(openaiLocationData.zip_code)
          
          if (locationParts.length > 0) {
            photoMetadata.location = locationParts.join(', ')
            console.log(`📍 Comprehensive location: ${photoMetadata.location}`)
          }
        } else {
          console.log('🤖 OpenAI could not determine location from image')
          console.log(`🤖 OpenAI result confidence: ${openaiLocationData?.confidence || 'null'}`)
        }
      } else {
        console.warn('⚠️ OpenAI API key not configured - skipping location analysis')
        console.log(`🤖 Config openaiApiKey: ${!!config.openaiApiKey}`)
        console.log(`🤖 Process env OPENAI_API_KEY: ${!!process.env.OPENAI_API_KEY}`)
      }
    } else {
      console.log(`🤖 Skipping OpenAI location analysis:`)
      console.log(`   - GPS data found: ${gpsDataFound}`)
      console.log(`   - City already exists: ${!!photoMetadata.city}`)
    }
    
    console.log(`📐 Image analysis complete: ${photoMetadata.width}x${photoMetadata.height} (${photoMetadata.orientation})`)
    if (photoMetadata.asset_date) {
      console.log(`📅 Asset date: ${photoMetadata.asset_date}`)
    }
    
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