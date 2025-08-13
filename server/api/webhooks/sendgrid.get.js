export default defineEventHandler(async (event) => {
  return {
    success: true,
    message: 'SendGrid webhook endpoint is accessible',
    method: 'GET',
    timestamp: new Date().toISOString()
  }
})
