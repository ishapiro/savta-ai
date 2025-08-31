// Enhanced location detection utilities
// Handles AI-based location detection with Mapbox geocoding fallback

/**
 * Geocode GPS coordinates using Mapbox API
 * @param {number} latitude - GPS latitude
 * @param {number} longitude - GPS longitude
 * @returns {Promise<Object|null>} Location data or null if failed
 */
async function geocodeWithMapbox(latitude, longitude) {
  try {
    const config = useRuntimeConfig();
    const mapboxToken = config.mapboxToken || process.env.MAPBOX_TOKEN;
    
    if (!mapboxToken) {
      console.warn('⚠️ Mapbox token not configured, skipping geocoding');
      return null;
    }

    console.log(`🗺️ Geocoding coordinates with Mapbox: ${latitude}, ${longitude}`);
    
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}&types=country,region,district,place,locality,neighborhood,address&limit=1`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`⚠️ Mapbox geocoding failed: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      console.warn('⚠️ Mapbox returned no results for coordinates');
      return null;
    }
    
    const feature = data.features[0];
    const context = feature.context || [];
    
    // Extract location components from Mapbox response
    const locationData = {
      location: feature.place_name || null,
      city: null,
      state: null,
      country: null,
      zip_code: null
    };
    
    // Parse context for structured data
    context.forEach(item => {
      if (item.id.startsWith('country.')) {
        locationData.country = item.text;
      } else if (item.id.startsWith('region.')) {
        locationData.state = item.text;
      } else if (item.id.startsWith('place.')) {
        locationData.city = item.text;
      } else if (item.id.startsWith('postcode.')) {
        locationData.zip_code = item.text;
      }
    });
    
    // If no city found in context, try to extract from place name
    if (!locationData.city && feature.text) {
      locationData.city = feature.text;
    }
    
    console.log('✅ Mapbox geocoding successful:', locationData);
    return locationData;
    
  } catch (error) {
    console.error('❌ Mapbox geocoding error:', error);
    return null;
  }
}

/**
 * Enhanced location detection that uses AI first, then falls back to Mapbox
 * @param {Object} analysisResult - AI analysis result from OpenAI
 * @param {Object} exifData - Extracted EXIF data with GPS coordinates
 * @returns {Promise<Object>} Enhanced location data
 */
async function enhanceLocationDetection(analysisResult, exifData) {
  console.log('🔍 Starting enhanced location detection...');
  
  // Start with AI-provided location data
  let locationData = {
    location: analysisResult.location || null,
    city: null,
    state: null,
    country: null,
    zip_code: null
  };
  
  // Check if AI provided a valid location (not "Unknown location")
  const hasValidAILocation = locationData.location && 
    !locationData.location.toLowerCase().includes('unknown') &&
    locationData.location.trim() !== '';
  
  console.log(`🤖 AI location result: "${locationData.location}" (valid: ${hasValidAILocation})`);
  
  // If AI didn't provide a valid location but we have GPS coordinates, use Mapbox
  if (!hasValidAILocation && exifData.gps_latitude && exifData.gps_longitude) {
    console.log('🗺️ AI location invalid, attempting Mapbox geocoding...');
    
    const mapboxResult = await geocodeWithMapbox(exifData.gps_latitude, exifData.gps_longitude);
    
    if (mapboxResult) {
      console.log('✅ Using Mapbox location data as fallback');
      locationData = mapboxResult;
    } else {
      console.warn('⚠️ Mapbox geocoding also failed, keeping AI result');
    }
  } else if (hasValidAILocation) {
    console.log('✅ Using AI-provided location data');
    
    // Try to parse structured data from AI location string if available
    if (locationData.location) {
      const locationParts = locationData.location.split(',').map(part => part.trim());
      if (locationParts.length >= 3) {
        locationData.city = locationParts[0];
        locationData.state = locationParts[1];
        locationData.country = locationParts[2];
      } else if (locationParts.length === 2) {
        locationData.city = locationParts[0];
        locationData.country = locationParts[1];
      }
    }
  } else {
    console.log('ℹ️ No GPS coordinates available, keeping AI result as-is');
  }
  
  return locationData;
}

/**
 * Check if EXIF data contains useful metadata
 * @param {Object} exifData - Extracted EXIF data
 * @returns {boolean} True if EXIF data is available and useful
 */
function hasUsefulExifData(exifData) {
  if (!exifData) return false;
  
  // Consider EXIF useful if it has GPS coordinates OR camera info OR date
  return !!(
    (exifData.gps_latitude && exifData.gps_longitude) ||
    exifData.camera_make ||
    exifData.camera_model ||
    exifData.date_taken
  );
}

export { geocodeWithMapbox, enhanceLocationDetection, hasUsefulExifData };
