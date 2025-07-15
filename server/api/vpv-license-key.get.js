const config = useRuntimeConfig()

export default defineEventHandler(() => {
  return {
    licenseKey: config.vpvLicenseKey
  }
}) 