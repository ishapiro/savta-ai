export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const userId = body.user_id
  if (!userId) {
    return { error: 'Missing user_id' }
  }

  // Use Supabase service role key for privileged access
  const config = useRuntimeConfig()
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceRoleKey || config.public.supabaseKey
  )

  // Optionally, check admin role from session if you want to restrict further

  const { error } = await supabase
    .from('profiles')
    .update({ deleted: true })
    .eq('user_id', userId)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}) 