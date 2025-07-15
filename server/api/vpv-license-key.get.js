const config = useRuntimeConfig()

export default defineEventHandler(() => {
  try {
    // Get VPV license key using the same pattern as other environment variables
    const vpvLicenseKey = config.vpvLicenseKey || process.env.NUXT_VPV_LICENSE_KEY
    
    console.log('API: vpvLicenseKey from config:', config.vpvLicenseKey ? 'exists' : 'missing')
    console.log('API: vpvLicenseKey from process.env:', process.env.NUXT_VPV_LICENSE_KEY ? 'exists' : 'missing')
    
    if (!vpvLicenseKey) {
      throw new Error('VPV license key not found in runtime config or environment')
    }
    
    return {
      licenseKey: vpvLicenseKey
    }
  } catch (error) {
    console.error('API: Error in vpv-license-key endpoint:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve license key'
    })
  }
}) 