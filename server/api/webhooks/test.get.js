export default defineEventHandler(async (event) => {
  return {
    success: true,
    message: 'Webhooks directory is accessible',
    timestamp: new Date().toISOString()
  }
})
