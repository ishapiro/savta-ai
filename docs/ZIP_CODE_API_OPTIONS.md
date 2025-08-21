# Zip Code API Options for Location Hierarchy

## Overview
To improve the accuracy of our location-based photo selection, we can integrate with zip code distance APIs to get all zip codes within 100 miles of a target zip code.

## API Options

### 1. **ZipCodeAPI.com** (Recommended - Free Tier Available)
- **URL**: https://zipcodeapi.com/
- **Free Tier**: 1,000 requests/month
- **Features**: Distance calculations, radius search, zip code validation
- **Authentication**: API key required

#### Implementation Example:
```javascript
async function getZipCodesWithinRadius(targetZipCode, radiusMiles = 100) {
  const API_KEY = process.env.ZIPCODE_API_KEY;
  const url = `https://www.zipcodeapi.com/rest/${API_KEY}/radius.json/${targetZipCode}/${radiusMiles}/miles`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.zip_codes) {
      return data.zip_codes.map(zip => zip.zip_code);
    }
    return [];
  } catch (error) {
    console.error('Error fetching zip codes:', error);
    return null; // Fall back to approximation
  }
}
```

### 2. **ZipCodeBase.com** (Paid - More Reliable)
- **URL**: https://zipcodebase.com/
- **Pricing**: $0.01 per request
- **Features**: Accurate distance calculations, comprehensive data
- **Authentication**: API key required

#### Implementation Example:
```javascript
async function getZipCodesWithinRadius(targetZipCode, radiusMiles = 100) {
  const API_KEY = process.env.ZIPCODEBASE_API_KEY;
  const url = `https://app.zipcodebase.com/api/v1/radius?apikey=${API_KEY}&code=${targetZipCode}&radius=${radiusMiles}&country=us&unit=miles`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.results) {
      return data.results.map(result => result.code);
    }
    return [];
  } catch (error) {
    console.error('Error fetching zip codes:', error);
    return null; // Fall back to approximation
  }
}
```

### 3. **Zippopotam.us** (Free - Limited)
- **URL**: https://zippopotam.us/
- **Free**: No API key required
- **Limitations**: No distance calculations, basic info only
- **Use Case**: Zip code validation and basic info

#### Implementation Example:
```javascript
async function validateZipCode(zipCode) {
  try {
    const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
    if (response.ok) {
      const data = await response.json();
      return {
        valid: true,
        city: data.places[0]['place name'],
        state: data.places[0]['state abbreviation'],
        country: data.country
      };
    }
    return { valid: false };
  } catch (error) {
    return { valid: false };
  }
}
```

## Recommended Implementation Strategy

### Phase 1: API Integration
1. **Choose ZipCodeAPI.com** for the free tier
2. **Set up environment variable**: `ZIPCODE_API_KEY`
3. **Implement API call** with fallback to approximation
4. **Add error handling** and rate limiting

### Phase 2: Caching
1. **Cache results** to avoid repeated API calls
2. **Store in Redis** or similar for fast access
3. **Set TTL** of 24 hours (zip codes don't change often)

### Phase 3: Optimization
1. **Batch requests** for multiple zip codes
2. **Implement retry logic** for failed requests
3. **Monitor API usage** and costs

## Environment Setup

### 1. Get API Key
```bash
# Sign up at https://zipcodeapi.com/
# Get your API key from the dashboard
```

### 2. Add to Environment
```bash
# .env file
ZIPCODE_API_KEY=your_api_key_here
```

### 3. Update Code
```javascript
// server/utils/openai-client.js
const ZIPCODE_API_KEY = process.env.ZIPCODE_API_KEY;

async function getZipCodesWithinRadius(targetZipCode, radiusMiles = 100) {
  if (!ZIPCODE_API_KEY) {
    console.log('⚠️ No ZIPCODE_API_KEY found, using approximation');
    return null;
  }
  
  // Implementation with API call
  // ... (see examples above)
}
```

## Fallback Strategy

### Current Implementation
- Uses zip code difference approximation
- Formula: `distance = Math.abs(zip1 - zip2) / 20`
- Works reasonably well for most cases

### Enhanced Fallback
```javascript
async function getZipCodesWithinRadius(targetZipCode, radiusMiles = 100) {
  // Try API first
  const apiResult = await tryZipCodeAPI(targetZipCode, radiusMiles);
  if (apiResult) return apiResult;
  
  // Fall back to approximation
  console.log('⚠️ Using zip code approximation method');
  return generateApproximateZipCodes(targetZipCode, radiusMiles);
}
```

## Cost Considerations

### ZipCodeAPI.com
- **Free Tier**: 1,000 requests/month
- **Paid**: $0.05 per 1,000 requests
- **Typical Usage**: ~100 requests per day = $0.15/month

### ZipCodeBase.com
- **Cost**: $0.01 per request
- **Typical Usage**: ~100 requests per day = $30/month
- **Better**: More accurate, faster, reliable

## Implementation Priority

1. **Start with ZipCodeAPI.com** (free tier)
2. **Monitor usage** and accuracy
3. **Upgrade to ZipCodeBase.com** if needed
4. **Implement caching** to reduce costs
5. **Add more cities** to zip code lookup

## Testing

### Test API Integration
```javascript
// Test script
async function testZipCodeAPI() {
  const zipCodes = await getZipCodesWithinRadius('60601', 100);
  console.log('Zip codes within 100 miles of Chicago:', zipCodes);
  
  // Test distance calculation
  const distance = calculateZipCodeDistance('60601', '53201');
  console.log('Distance from Chicago to Milwaukee:', distance);
}
```

## Benefits of API Integration

1. **Accuracy**: Real geographic distances instead of approximations
2. **Completeness**: All zip codes within radius, not just major cities
3. **Reliability**: Professional service with uptime guarantees
4. **Scalability**: Can handle any US zip code
5. **Future-proof**: Easy to extend to international postal codes

## Next Steps

1. **Choose API provider** (recommend ZipCodeAPI.com)
2. **Get API key** and add to environment
3. **Implement API integration** with fallback
4. **Test with real data** and monitor accuracy
5. **Add caching** to optimize performance
6. **Monitor costs** and adjust as needed
