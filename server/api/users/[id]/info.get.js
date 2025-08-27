export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'id')
  
  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID is required'
    })
  }

  try {
    const config = useRuntimeConfig()
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(config.public.supabaseUrl, config.supabaseServiceRoleKey || config.public.supabaseKey)

    const { data, error } = await supabase
      .from('profiles')
      .select('*')  // ims was user_id, email, first_name, last_name
      .eq('user_id', userId)
      .eq('deleted', false)  // Only active users (deleted is boolean, not null)
      .single()

    if (error) {
      console.error('Error fetching user info:', error)
      
      // Handle specific case where user doesn't exist (PGRST116)
      if (error.code === 'PGRST116') {
        // Return a structured response instead of throwing an error
        return {
          user_id: userId,
          exists: false,
          deleted: true,
          error: 'User not found or has been deleted'
        }
      }
      
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    return {
      ...data,
      exists: true,
      deleted: false
    }
  } catch (error) {
    console.error('Error in user info API:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 