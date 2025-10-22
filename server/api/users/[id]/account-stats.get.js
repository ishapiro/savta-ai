import { getHeader, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceRoleKey || config.public.supabaseKey
  )

  // Validate authentication
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
  }

  const userId = getRouterParam(event, 'id')
  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
  }

  // Verify ownership
  if (userId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  try {
    // Fetch all statistics in parallel
    const [
      { count: photosCount },
      { data: memoryBooksData },
      { data: personGroupsData },
      { count: pdfDownloadsCount },
      { count: imageDownloadsCount },
      { count: pdfSharesCount },
      { count: pdfShareFallbackCount },
      { count: imageSharesCount },
      { count: imageShareFallbackCount },
      { count: memoryBookSharesCount },
      { count: shareFailedCount },
      { count: imageShareFailedCount }
    ] = await Promise.all([
      // Count photos uploaded
      supabase
        .from('assets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('type', 'photo')
        .eq('deleted', false),

      // Get memory books/cards data
      supabase
        .from('memory_books')
        .select('id, format, status')
        .eq('user_id', userId)
        .eq('deleted', false),

      // Get people (person groups)
      supabase
        .from('person_groups')
        .select('id')
        .eq('user_id', userId)
        .eq('deleted', false),

      // Count PDF downloads
      supabase
        .from('activity_log')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('action', 'pdf_download'),

      // Count image downloads
      supabase
        .from('activity_log')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('action', 'image_download'),

      // Count PDF shares (Web Share API)
      supabase
        .from('activity_log')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('action', 'pdf_share'),

      // Count PDF shares (clipboard fallback)
      supabase
        .from('activity_log')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('action', 'pdf_share_fallback'),

      // Count image shares (Web Share API)
      supabase
        .from('activity_log')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('action', 'image_share'),

      // Count image shares (clipboard fallback)
      supabase
        .from('activity_log')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('action', 'image_share_fallback'),

      // Count memory book shares (from composable)
      supabase
        .from('activity_log')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('action', 'memory_book_shared'),

      // Count share failures (memory books)
      supabase
        .from('activity_log')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('action', 'memory_book_share_failed'),

      // Count image share failures
      supabase
        .from('activity_log')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('action', 'image_share_failed')
    ])

    // Count memory cards and books
    const memoryCards = memoryBooksData?.filter(b => b.format === 'card').length || 0
    const memoryBooks = memoryBooksData?.filter(b => b.format === 'book').length || 0
    const peopleCount = personGroupsData?.length || 0

    // Calculate total shares (all share types)
    const totalPdfShares = (pdfSharesCount || 0) + (pdfShareFallbackCount || 0)
    const totalImageShares = (imageSharesCount || 0) + (imageShareFallbackCount || 0)
    const totalShares = totalPdfShares + totalImageShares + (memoryBookSharesCount || 0)

    // Calculate total downloads
    const totalDownloads = (pdfDownloadsCount || 0) + (imageDownloadsCount || 0)

    return {
      success: true,
      stats: {
        photosUploaded: photosCount || 0,
        memoryCardsCreated: memoryCards,
        memoryBooksCreated: memoryBooks,
        peopleIdentified: peopleCount,
        pdfDownloads: pdfDownloadsCount || 0,
        imageDownloads: imageDownloadsCount || 0,
        pdfShares: pdfSharesCount || 0,
        pdfShareFallback: pdfShareFallbackCount || 0,
        imageShares: imageSharesCount || 0,
        imageShareFallback: imageShareFallbackCount || 0,
        memoryBookShares: memoryBookSharesCount || 0,
        memoryBookShareFailed: shareFailedCount || 0,
        imageShareFailed: imageShareFailedCount || 0,
        // Totals for convenience
        totalDownloads: totalDownloads,
        totalShares: totalShares,
        totalSharesFailed: (shareFailedCount || 0) + (imageShareFailedCount || 0)
      }
    }
  } catch (error) {
    console.error('❌ Error fetching account stats:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch account statistics'
    })
  }
})
