export default defineEventHandler(async (event) => {
  try {
    // Get the request body
    const body = await readBody(event)
    
    // SendGrid sends events as an array
    if (!Array.isArray(body)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid webhook payload - expected array'
      })
    }

    // Get Supabase client
    const config = useRuntimeConfig()
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey
    )

    // Process each event
    const events = []
    for (const eventData of body) {
      const {
        event: eventType,
        email,
        timestamp,
        'sg_message_id': messageId,
        'sg_event_id': sendgridEventId,
        user_id: sendgridUserId, // SendGrid's user ID (different from our user_id)
        ...otherData
      } = eventData

      // Try to find the user by email
      let userId = null
      if (email) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('email', email)
          .single()
        
        if (userData) {
          userId = userData.user_id
        }
      }

      // Prepare event record
      const eventRecord = {
        event_type: eventType,
        email: email || 'unknown',
        user_id: userId,
        message_id: messageId,
        timestamp: timestamp ? new Date(timestamp * 1000).toISOString() : new Date().toISOString(),
        sendgrid_event_id: sendgridEventId,
        event_data: eventData
      }

      events.push(eventRecord)
    }

    // Insert all events
    if (events.length > 0) {
      const { error } = await supabase
        .from('email_events')
        .insert(events)

      if (error) {
        console.error('Error inserting email events:', error)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to store email events'
        })
      }
    }

    // Log for debugging
    console.log(`Processed ${events.length} SendGrid events`)

    return {
      success: true,
      eventsProcessed: events.length
    }

  } catch (error) {
    console.error('SendGrid webhook error:', error)
    
    // Always return 200 to SendGrid to prevent retries
    // (unless it's a malformed request)
    if (error.statusCode === 400) {
      throw error
    }
    
    return {
      success: false,
      error: error.message
    }
  }
})
