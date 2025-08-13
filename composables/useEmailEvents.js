export const useEmailEvents = () => {
  const supabase = useNuxtApp().$supabase
  const user = useSupabaseUser()

  // Get email events for the current user
  const getUserEmailEvents = async (limit = 50) => {
    if (!user.value) return { data: null, error: 'User not authenticated' }

    const { data, error } = await supabase
      .from('email_events')
      .select('*')
      .eq('user_id', user.value.id)
      .order('timestamp', { ascending: false })
      .limit(limit)

    return { data, error }
  }

  // Get email events for a specific email address
  const getEmailEventsByEmail = async (email, limit = 50) => {
    const { data, error } = await supabase
      .from('email_events')
      .select('*')
      .eq('email', email)
      .order('timestamp', { ascending: false })
      .limit(limit)

    return { data, error }
  }

  // Get email delivery statistics for the current user
  const getUserEmailStats = async () => {
    if (!user.value) return { data: null, error: 'User not authenticated' }

    const { data, error } = await supabase
      .from('email_events')
      .select('event_type')
      .eq('user_id', user.value.id)

    if (error) return { data: null, error }

    // Calculate statistics
    const stats = {
      total: data.length,
      delivered: data.filter(e => e.event_type === 'delivered').length,
      opened: data.filter(e => e.event_type === 'opened').length,
      clicked: data.filter(e => e.event_type === 'clicked').length,
      bounced: data.filter(e => e.event_type === 'bounced').length,
      dropped: data.filter(e => e.event_type === 'dropped').length
    }

    return { data: stats, error: null }
  }

  // Get recent email events (for admin dashboard)
  const getRecentEmailEvents = async (limit = 100) => {
    const { data, error } = await supabase
      .from('email_events')
      .select(`
        *,
        profiles!email_events_user_id_fkey (
          first_name,
          last_name,
          email
        )
      `)
      .order('timestamp', { ascending: false })
      .limit(limit)

    return { data, error }
  }

  return {
    getUserEmailEvents,
    getEmailEventsByEmail,
    getUserEmailStats,
    getRecentEmailEvents
  }
}
