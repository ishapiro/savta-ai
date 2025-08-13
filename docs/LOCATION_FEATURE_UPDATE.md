# Location Feature Update

This update adds GPS location detection and geocoding to photos, storing city, state, country, and ZIP code information.

## Changes Made

### 1. Database Schema Update
- Added `location`, `city`, `state`, `country`, and `zip_code` fields to the `assets` table
- Added indexes for efficient location queries
- Created migration file: `supabase/migration_add_location_fields.sql`

### 2. Upload Enhancement
- Modified `server/api/upload-asset.post.js` to extract GPS data from EXIF metadata
- Integrated MapBox geocoding API to convert coordinates to location names
- Automatically populates location fields during upload

### 3. Review Page Enhancement
- Updated `pages/app/review.vue` to display location information
- Added location chips showing city, state, and country
- Color-coded chips for easy identification

### 4. Migration Script
- Created `scripts/update-photo-locations.js` to update existing assets
- Processes all existing photos to extract GPS data and geocode locations

## Installation Steps

### 1. Apply Database Migration
```sql
-- Run the migration in your Supabase SQL editor
-- File: supabase/migration_add_location_fields.sql
```

### 2. Set Environment Variables
Add your MapBox token to your `.env` file:
```bash
MAPBOX_TOKEN=your_mapbox_token_here
```

### 3. Update Existing Assets (Optional)
```bash
# Set environment variables
export SUPABASE_URL="your-supabase-url"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
export MAPBOX_TOKEN="your-mapbox-token"

# Run the update script
node scripts/update-photo-locations.js
```

### 4. Restart Development Server
```bash
npm run dev
```

## Features

### GPS Extraction
- Extracts GPS coordinates from photo EXIF metadata
- Works with photos taken on GPS-enabled devices
- Handles various EXIF formats

### Geocoding
- Uses MapBox API for accurate location data
- Converts coordinates to human-readable addresses
- Stores city, state, country, and ZIP code

### Location Display
- Shows location information on review page
- Color-coded chips for different location components
- Only displays when location data is available

## Technical Details

### Database Fields
```sql
location text        -- GPS coordinates "latitude,longitude"
city text           -- City name
state text          -- State/province name
country text        -- Country name
zip_code text       -- Postal/ZIP code
```

### MapBox Integration
- Uses MapBox Geocoding API
- 100,000 free requests per month
- Accurate location data with context

### EXIF Processing
- Uses Sharp library for EXIF extraction
- Handles GPS coordinate parsing
- Graceful fallback for photos without GPS data

## Benefits

1. **Location Context**: Photos now have location information for better organization
2. **Search & Filter**: Can filter photos by location in the future
3. **Memory Enhancement**: Location adds context to family memories
4. **Automatic Processing**: No manual input required
5. **Privacy Conscious**: Only processes photos with GPS data

## Testing

1. Upload photos with GPS data and verify location extraction
2. Check review page for location chips
3. Test with photos without GPS data (should handle gracefully)
4. Verify MapBox API integration and rate limits

## Future Enhancements

- Location-based photo filtering
- Map view of photo locations
- Location-based memory book themes
- Travel timeline features 