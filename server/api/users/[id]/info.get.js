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
      .is('deleted', null)  // Only active users
      .single()

    if (error) {
      console.error('Error fetching user info:', error)
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    return data
  } catch (error) {
    console.error('Error in user info API:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 