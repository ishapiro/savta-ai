import { getHeader, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey || config.public.supabaseKey
    )

    // Get user from auth token
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
    }

    // Check if requesting user is admin
    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()
    
    if (profileError || !adminProfile || adminProfile.role !== 'admin') {
      throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
    }

    // Get query parameters for filtering and pagination
    const query = getQuery(event)
    const page = parseInt(query.page) || 1
    const rows = parseInt(query.rows) || 10
    const from = (page - 1) * rows
    const to = from + rows - 1
    const userId = query.userId || null
    const status = query.status || null

    // Build the query without joins
    let backupQuery = supabase
      .from('user_backups')
      .select('*')
      .eq('deleted', false)

    // Add filters
    if (userId) {
      backupQuery = backupQuery.eq('user_id', userId)
    }
    if (status) {
      backupQuery = backupQuery.eq('status', status)
    }

    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from('user_backups')
      .select('*', { count: 'exact', head: true })
      .eq('deleted', false)
    
    if (countError) {
      console.error('Error counting backups:', countError)
      throw createError({ statusCode: 500, statusMessage: 'Failed to count backups' })
    }

    // Get paginated results
    const { data: backups, error: backupError } = await backupQuery
      .order('created_at', { ascending: false })
      .range(from, to)

    if (backupError) {
      console.error('Error fetching backups:', backupError)
      throw createError({ statusCode: 500, statusMessage: 'Failed to fetch backups' })
    }

    // Get unique user IDs for profile lookups
    const userIds = [...new Set(backups.map(b => b.user_id).concat(backups.map(b => b.created_by)))]
    
    // Fetch user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, email, first_name, last_name')
      .in('user_id', userIds)
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
    }
    
    // Create a map for quick lookup
    const profileMap = {}
    if (profiles) {
      profiles.forEach(profile => {
        profileMap[profile.user_id] = profile
      })
    }

    // Process backup data to include summary information
    const processedBackups = backups.map(backup => {
      const backupData = backup.backup_data
      const summary = {
        user_email: backupData?.user_profile?.email || profileMap[backup.user_id]?.email || 'Unknown',
        total_records: (backupData?.families?.length || 0) + 
                      (backupData?.assets?.length || 0) + 
                      (backupData?.memory_books?.length || 0) + 
                      (backupData?.pdf_status?.length || 0) + 
                      (backupData?.activity_logs?.length || 0) + 
                      (backupData?.email_events?.length || 0),
        total_files: backupData?.storage_files?.length || 0,
        files_copied_to_backup: backupData?.files_copied_to_backup || 0,
        backup_size_estimate: JSON.stringify(backupData).length
      }

      return {
        id: backup.id,
        user_id: backup.user_id,
        status: backup.status,
        created_at: backup.created_at,
        updated_at: backup.updated_at,
        target_user: profileMap[backup.user_id],
        created_by_user: profileMap[backup.created_by],
        summary: summary
      }
    })

    return {
      data: processedBackups,
      totalCount: totalCount,
      page: page,
      rows: rows,
      totalPages: Math.ceil(totalCount / rows)
    }

  } catch (error) {
    console.error('Backups list error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch backups'
    })
  }
})
