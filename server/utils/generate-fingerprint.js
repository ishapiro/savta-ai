import crypto from 'crypto'

/**
 * Generate a unique fingerprint for an asset based on its content and metadata
 * This helps the AI avoid selecting duplicate photos in memory cards
 * 
 * @param {Object} asset - The asset object with metadata
 * @param {string} asset.id - Asset ID
 * @param {number} asset.width - Image width
 * @param {number} asset.height - Image height
 * @param {string} asset.orientation - Image orientation
 * @param {string} asset.ai_caption - AI-generated caption
 * @param {Array} asset.people_detected - Detected people
 * @param {Array} asset.tags - AI tags
 * @param {Array} asset.user_tags - User tags
 * @param {string} asset.location - Location
 * @param {string} asset.asset_date - Photo date
 * @param {string} asset.created_at - Upload date
 * @returns {string} - Unique fingerprint
 */
export function generateAssetFingerprint(asset) {
  // Create a string representation of the asset's key characteristics
  const fingerprintData = {
    id: asset.id,
    dimensions: `${asset.width}x${asset.height}`,
    orientation: asset.orientation || 'unknown',
    caption: asset.ai_caption || '',
    people: Array.isArray(asset.people_detected) ? asset.people_detected.sort().join(',') : '',
    tags: Array.isArray(asset.tags) ? asset.tags.sort().join(',') : '',
    userTags: Array.isArray(asset.user_tags) ? asset.user_tags.sort().join(',') : '',
    location: asset.location || asset.city || asset.state || asset.country || '',
    date: asset.asset_date || asset.created_at || ''
  }

  // Convert to JSON string and create hash
  const dataString = JSON.stringify(fingerprintData)
  const hash = crypto.createHash('sha256').update(dataString).digest('hex')
  
  // Return a shorter, more readable fingerprint (first 16 characters)
  return hash.substring(0, 16)
}

/**
 * Generate fingerprints for multiple assets
 * 
 * @param {Array} assets - Array of asset objects
 * @returns {Array} - Array of assets with fingerprints added
 */
export function generateFingerprintsForAssets(assets) {
  return assets.map(asset => ({
    ...asset,
    fingerprint: generateAssetFingerprint(asset)
  }))
} 