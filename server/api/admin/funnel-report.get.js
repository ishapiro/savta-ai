import { useRuntimeConfig } from '#imports'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    // Get query parameters
    const query = getQuery(event)
    const timeRange = query.timeRange || '30d'
    const reportType = query.reportType || 'all'
    const userId = query.userId

    // Calculate date range
    const now = new Date()
    let startDate
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Initialize Supabase client
    const config = useRuntimeConfig()
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey || config.public.supabaseKey
    )

    // Build base query conditions
    let baseConditions = `timestamp >= '${startDate.toISOString()}'`
    if (reportType === 'user' && userId) {
      baseConditions += ` AND user_id = '${userId}'`
    }

    // Stage 1: Site Visits (unique users who visited)
    const { data: siteVisits, error: visitsError } = await supabase
      .from('activity_log')
      .select('user_id')
      .eq('action', 'page_visit')
      .gte('timestamp', startDate.toISOString())
      .not('user_id', 'is', null)

    if (visitsError) throw visitsError

    const uniqueVisitors = new Set(siteVisits?.map(v => v.user_id) || [])
    const siteVisitsCount = uniqueVisitors.size

    // Stage 2: Sign Ups (users who have profiles)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, created_at')
      .gte('created_at', startDate.toISOString())

    if (profilesError) throw profilesError

    const signUpsInRange = profiles?.filter(p => new Date(p.created_at) >= startDate) || []
    const signUpsCount = signUpsInRange.length

    // Stage 3: Asset Uploads
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('user_id, created_at')
      .gte('created_at', startDate.toISOString())

    if (assetsError) throw assetsError

    const assetUploadsInRange = assets?.filter(a => new Date(a.created_at) >= startDate) || []
    const uniqueAssetUploaders = new Set(assetUploadsInRange.map(a => a.user_id))
    const assetUploadsCount = uniqueAssetUploaders.size

    // Stage 4: Memory Book Creation
    const { data: memoryBooks, error: booksError } = await supabase
      .from('memory_books')
      .select('user_id, created_at')
      .gte('created_at', startDate.toISOString())

    if (booksError) throw booksError

    const booksInRange = memoryBooks?.filter(b => new Date(b.created_at) >= startDate) || []
    const uniqueBookCreators = new Set(booksInRange.map(b => b.user_id))
    const bookCreationCount = uniqueBookCreators.size

    // Stage 5: Downloads/Shares (tracked via activity_log)
    const { data: downloads, error: downloadsError } = await supabase
      .from('activity_log')
      .select('user_id')
      .in('action', ['memory_book_downloaded', 'memory_book_shared'])
      .gte('timestamp', startDate.toISOString())
      .not('user_id', 'is', null)

    if (downloadsError) throw downloadsError

    const uniqueDownloaders = new Set(downloads?.map(d => d.user_id) || [])
    const downloadsCount = uniqueDownloaders.size

    // Calculate conversion rates
    const calculateConversionRate = (current, previous) => {
      if (previous === 0) return 0
      return Math.round((current / previous) * 100)
    }

    const stages = [
      {
        name: 'Site Visit',
        description: 'Users who visited the site',
        count: siteVisitsCount,
        conversionRate: 100 // Base stage
      },
      {
        name: 'Sign Up',
        description: 'Users who created an account',
        count: signUpsCount,
        conversionRate: calculateConversionRate(signUpsCount, siteVisitsCount)
      },
      {
        name: 'Asset Upload',
        description: 'Users who uploaded photos or videos',
        count: assetUploadsCount,
        conversionRate: calculateConversionRate(assetUploadsCount, signUpsCount)
      },
      {
        name: 'Memory Book Creation',
        description: 'Users who created memory books',
        count: bookCreationCount,
        conversionRate: calculateConversionRate(bookCreationCount, assetUploadsCount)
      },
      {
        name: 'Download/Share',
        description: 'Users who downloaded or shared books',
        count: downloadsCount,
        conversionRate: calculateConversionRate(downloadsCount, bookCreationCount)
      }
    ]

    // Calculate overall conversion (from first to last stage)
    const overallConversion = calculateConversionRate(downloadsCount, siteVisitsCount)

    // Find bottleneck stage (lowest conversion rate)
    const bottleneckStage = stages.reduce((lowest, current) => {
      return current.conversionRate < lowest.conversionRate ? current : lowest
    }, stages[1]).name

    // Calculate revenue potential (simplified - could be enhanced with actual pricing)
    const revenuePotential = downloadsCount * 10 // Assuming $10 per conversion

    const funnelData = {
      stages,
      overallConversion,
      totalUsers: siteVisitsCount,
      bottleneckStage,
      revenuePotential: `$${revenuePotential.toLocaleString()}`
    }

    return {
      success: true,
      funnelData,
      timeRange,
      reportType,
      userId: userId || null
    }

  } catch (error) {
    console.error('Error generating funnel report:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate funnel report'
    })
  }
})

