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

    const targetUserId = event.context.params.id
    if (!targetUserId) {
      throw createError({ statusCode: 400, statusMessage: 'Missing user id' })
    }

    console.log(`🔄 Starting backup for user: ${targetUserId}`)

    // 1. Get user profile
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .single()

    if (userError || !userProfile) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    // 1.5. Get Supabase Auth user data
    const { data: authUser, error: authUserError } = await supabase.auth.admin.getUserById(targetUserId)
    
    if (authUserError) {
      console.warn('Could not fetch Auth user data:', authUserError.message)
    }

    // 2. Get user's families
    const { data: families, error: familiesError } = await supabase
      .from('families')
      .select('*')
      .eq('user_id', targetUserId)

    if (familiesError) {
      console.error('Error fetching families:', familiesError)
    }

    // 3. Get user's assets
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', targetUserId)

    if (assetsError) {
      console.error('Error fetching assets:', assetsError)
    }

    // 4. Get user's memory books
    const { data: memoryBooks, error: booksError } = await supabase
      .from('memory_books')
      .select('*')
      .eq('user_id', targetUserId)

    if (booksError) {
      console.error('Error fetching memory books:', booksError)
    }

    // 5. Get user's PDF status records
    const { data: pdfStatus, error: pdfError } = await supabase
      .from('pdf_status')
      .select('*')
      .eq('user_id', targetUserId)

    if (pdfError) {
      console.error('Error fetching PDF status:', pdfError)
    }

    // 6. Get user's activity logs
    const { data: activityLogs, error: activityError } = await supabase
      .from('activity_log')
      .select('*')
      .eq('user_id', targetUserId)

    if (activityError) {
      console.error('Error fetching activity logs:', activityError)
    }

    // 7. Get user's email events
    const { data: emailEvents, error: emailError } = await supabase
      .from('email_events')
      .select('*')
      .eq('user_id', targetUserId)

    if (emailError) {
      console.error('Error fetching email events:', emailError)
    }

    // 8. Get storage files and copy to backup storage
    const storageFiles = []
    const copiedFiles = []
    
    // Check if backup bucket exists and is accessible
    try {
      const { data: bucketInfo, error: bucketError } = await supabase.storage
        .from('backups')
        .list('', { limit: 1 })
      
      if (bucketError) {
        console.warn('Backup bucket not accessible, skipping file copy:', bucketError.message)
      } else {
        console.log('✅ Backup bucket accessible, proceeding with file copy')
      }
    } catch (bucketCheckError) {
      console.warn('Could not verify backup bucket access:', bucketCheckError.message)
    }
    
    try {
      // List all files in user's folder
      const { data: files, error: listError } = await supabase.storage
        .from('assets')
        .list(`${targetUserId}/`)
      
      if (!listError && files) {
        // Recursively collect and copy all files
        const collectAndCopyFiles = async (path) => {
          const { data: folderFiles } = await supabase.storage
            .from('assets')
            .list(path)
          
          if (folderFiles) {
            for (const file of folderFiles) {
              if (file.id) {
                // It's a file, get its metadata and download URL
                const { data: urlData } = supabase.storage
                  .from('assets')
                  .getPublicUrl(`${path}/${file.name}`)
                
                const filePath = `${path}/${file.name}`
                storageFiles.push({
                  path: filePath,
                  name: file.name,
                  size: file.metadata?.size,
                  mime_type: file.metadata?.mimetype,
                  created_at: file.created_at,
                  updated_at: file.updated_at,
                  public_url: urlData?.publicUrl
                })

                // Copy file to backup storage
                try {
                  // Download the file
                  const { data: fileData, error: downloadError } = await supabase.storage
                    .from('assets')
                    .download(filePath)
                  
                  if (downloadError) {
                    console.error(`Failed to download file ${filePath}:`, downloadError)
                    continue
                  }

                  // Upload to backup storage with same path structure
                  const { error: uploadError } = await supabase.storage
                    .from('backups')
                    .upload(filePath, fileData, {
                      contentType: file.metadata?.mimetype || 'application/octet-stream'
                    })
                  
                  if (uploadError) {
                    console.error(`Failed to copy file ${filePath} to backup storage:`, uploadError)
                    // Continue with backup even if file copy fails
                  } else {
                    copiedFiles.push(filePath)
                    console.log(`✅ Copied file to backup storage: ${filePath}`)
                  }
                } catch (copyError) {
                  console.error(`Error copying file ${filePath}:`, copyError)
                  // Continue with backup even if file copy fails
                }
              } else {
                // It's a folder, recurse
                await collectAndCopyFiles(`${path}/${file.name}`)
              }
            }
          }
        }
        
        await collectAndCopyFiles(`${targetUserId}/`)
        console.log(`📁 Copied ${copiedFiles.length} files to backup storage`)
      }
    } catch (storageError) {
      console.error('Error fetching/copying storage files:', storageError)
    }

    // 9. Create backup object
    const backup = {
      metadata: {
        backup_created_at: new Date().toISOString(),
        backup_created_by: user.id,
        target_user_id: targetUserId,
        target_user_email: userProfile.email
      },
      user_profile: userProfile,
      auth_user: authUser || null,
      families: families || [],
      assets: assets || [],
      memory_books: memoryBooks || [],
      pdf_status: pdfStatus || [],
      activity_logs: activityLogs || [],
      email_events: emailEvents || [],
      storage_files: storageFiles
    }

    // 10. Create backup record in database
    const { data: backupRecord, error: backupError } = await supabase
      .from('user_backups')
      .insert([{
        user_id: targetUserId,
        original_uuid: targetUserId,
        original_email: userProfile.email,
        backup_data: backup,
        created_by: user.id,
        status: 'completed'
      }])
      .select()
      .single()

    if (backupError) {
      console.error('Error creating backup record:', backupError)
      // Continue without saving to backup table, but log the specific error
      console.error('Backup record creation failed:', {
        error: backupError.message,
        code: backupError.code,
        details: backupError.details,
        hint: backupError.hint
      })
    } else {
      console.log('✅ Backup record created successfully:', backupRecord?.id)
    }

    console.log(`✅ Backup completed for user: ${targetUserId}`)
    console.log(`📊 Backup summary:`)
    console.log(`   - Profile: 1 record`)
    console.log(`   - Families: ${families?.length || 0} records`)
    console.log(`   - Assets: ${assets?.length || 0} records`)
    console.log(`   - Memory Books: ${memoryBooks?.length || 0} records`)
    console.log(`   - PDF Status: ${pdfStatus?.length || 0} records`)
    console.log(`   - Activity Logs: ${activityLogs?.length || 0} records`)
    console.log(`   - Email Events: ${emailEvents?.length || 0} records`)
    console.log(`   - Storage Files: ${storageFiles.length} files`)
    console.log(`   - Files Copied to Backup Storage: ${copiedFiles.length} files`)

    return {
      success: true,
      backup: backup,
      backup_id: backupRecord?.id,
      summary: {
        user_email: userProfile.email,
        total_records: (families?.length || 0) + (assets?.length || 0) + (memoryBooks?.length || 0) + 
                      (pdfStatus?.length || 0) + (activityLogs?.length || 0) + (emailEvents?.length || 0),
        total_files: storageFiles.length,
        files_copied_to_backup: copiedFiles.length,
        backup_size_estimate: JSON.stringify(backup).length
      }
    }

  } catch (error) {
    console.error('Backup error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to create backup'
    })
  }
})
