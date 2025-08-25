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

    const backupId = event.context.params.id
    if (!backupId) {
      throw createError({ statusCode: 400, statusMessage: 'Missing backup id' })
    }

    console.log(`🗑️ Starting backup deletion: ${backupId}`)

    // 1. Get the backup record
    const { data: backup, error: backupError } = await supabase
      .from('user_backups')
      .select('*')
      .eq('id', backupId)
      .single()

    if (backupError || !backup) {
      throw createError({ statusCode: 404, statusMessage: 'Backup not found' })
    }

    const targetUserId = backup.user_id
    console.log(`🗑️ Deleting backup for user: ${targetUserId}`)

    // 2. Delete backup storage files
    try {
      // List all files in the backup storage folder
      const { data: files, error: listError } = await supabase.storage
        .from('backups')
        .list(`${targetUserId}/`)
      
      if (!listError && files) {
        // Recursively collect all files
        const allFiles = []
        const collectFiles = async (path) => {
          const { data: folderFiles } = await supabase.storage
            .from('backups')
            .list(path)
          
          if (folderFiles) {
            for (const file of folderFiles) {
              if (file.id) {
                // It's a file
                allFiles.push(`${path}/${file.name}`)
              } else {
                // It's a folder, recurse
                await collectFiles(`${path}/${file.name}`)
              }
            }
          }
        }
        
        await collectFiles(`${targetUserId}/`)
        
        // Delete all files
        if (allFiles.length > 0) {
          const { error: deleteError } = await supabase.storage
            .from('backups')
            .remove(allFiles)
          
          if (deleteError) {
            console.error('Failed to delete backup storage files:', deleteError)
            // Continue with database deletion even if storage deletion fails
          } else {
            console.log(`✅ Deleted ${allFiles.length} backup storage files`)
          }
        }
      }
    } catch (storageError) {
      console.error('Error deleting backup storage files:', storageError)
      // Continue with database deletion even if storage deletion fails
    }

    // 3. Delete the backup record from database
    const { error: deleteRecordError } = await supabase
      .from('user_backups')
      .delete()
      .eq('id', backupId)

    if (deleteRecordError) {
      console.error('Error deleting backup record:', deleteRecordError)
      throw createError({ statusCode: 500, statusMessage: 'Failed to delete backup record' })
    }

    console.log(`✅ Backup deletion completed: ${backupId}`)

    return {
      success: true,
      message: 'Backup deleted successfully',
      deletedBackupId: backupId,
      deletedUserId: targetUserId
    }

  } catch (error) {
    console.error('Backup deletion error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to delete backup'
    })
  }
})
