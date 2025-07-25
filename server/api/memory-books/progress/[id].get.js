export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceRoleKey || config.public.supabaseKey
  )
  const bookId = getRouterParam(event, 'id')
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader) return { progress: null }
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return { progress: null }
  
  try {
    const { data: statusRow } = await supabase
      .from('pdf_status')
      .select('status')
      .eq('book_id', bookId)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()
    return { progress: statusRow ? statusRow.status : null }
  } catch (tableError) {
    console.log(`[PROGRESS] PDF status table might not exist yet: ${tableError.message}`)
    // Return null progress if table doesn't exist - this is expected if the table hasn't been created yet
    return { progress: null }
  }
}) 