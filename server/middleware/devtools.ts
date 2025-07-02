import { defineEventHandler, getRequestURL, setResponseStatus, setResponseHeader } from 'h3'

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  
  // Handle Chrome DevTools requests
  if (url.pathname.includes('/.well-known/appspecific/')) {
    setResponseStatus(event, 200)
    setResponseHeader(event, 'Content-Type', 'application/json')
    return { status: 'ok' }
  }
}) 