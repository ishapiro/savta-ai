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

    // Check if user exists in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)
    
    const exists = !!authUser && !authError
    
    console.log(`Auth check for user ${userId}:`, { exists, error: authError?.message })

    return {
      exists,
      user_id: userId,
      error: authError?.message
    }
  } catch (error) {
    console.error('Error in auth check API:', error)
    return {
      exists: false,
      user_id: userId,
      error: error.message
    }
  }
})
