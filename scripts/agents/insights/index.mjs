import { supabase } from '../lib/supabase.mjs'
import { createRun, completeRun } from '../lib/logger.mjs'
import { generateInsights } from './generator.mjs'

const MAX_USERS_PER_RUN = 50

/**
 * Insights Agent — generates personalized insight cards for users
 * based on their reviews, followed companies, and preferences.
 */
export async function runInsightsAgent() {
  const runId = await createRun('insights')
  const stats = { processed: 0, updated: 0, failed: 0, errors: [] }

  try {
    // Find users who have reviews and need insight refresh
    // (no insights row, or insights expired)
    const { data: usersWithReviews, error: usersErr } = await supabase
      .from('reviews')
      .select('user_id')
      .limit(1000)

    if (usersErr) throw new Error(`Users fetch error: ${usersErr.message}`)

    // Deduplicate user IDs
    const userIds = [...new Set(usersWithReviews.map(r => r.user_id))]

    // Filter to users needing refresh
    const { data: existingInsights } = await supabase
      .from('user_insights')
      .select('user_id, expires_at')
      .in('user_id', userIds)

    const insightsMap = new Map(
      (existingInsights || []).map(i => [i.user_id, i.expires_at])
    )

    const now = new Date()
    const needsRefresh = userIds.filter(uid => {
      const expiresAt = insightsMap.get(uid)
      return !expiresAt || new Date(expiresAt) < now
    }).slice(0, MAX_USERS_PER_RUN)

    console.log(`[insights] ${needsRefresh.length} users need insight refresh (of ${userIds.length} total)`)

    for (const userId of needsRefresh) {
      stats.processed++
      try {
        const context = await buildUserContext(userId)

        if (context.reviews.length === 0 && context.followedCompanies.length === 0) {
          continue // Not enough data to generate insights
        }

        const result = await generateInsights(context)

        const { error: upsertErr } = await supabase
          .from('user_insights')
          .upsert({
            user_id: userId,
            insights_data: result,
            generated_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          }, { onConflict: 'user_id' })

        if (upsertErr) throw new Error(`Upsert error: ${upsertErr.message}`)

        stats.updated++
        console.log(`[insights] User ${userId}: generated ${result.cards.length} insight cards`)
      } catch (err) {
        stats.failed++
        stats.errors.push({ entity: userId, error: err.message, timestamp: new Date().toISOString() })
        console.error(`[insights] Error for user ${userId}:`, err.message)
      }
    }

    await completeRun(runId, stats.failed > 0 ? 'partial' : 'completed', stats)
  } catch (err) {
    stats.errors.push({ entity: 'agent', error: err.message, timestamp: new Date().toISOString() })
    await completeRun(runId, 'failed', stats)
    throw err
  }

  return stats
}

/**
 * Build the full context for insight generation.
 */
async function buildUserContext(userId) {
  // User's reviews with company names
  const { data: reviews } = await supabase
    .from('reviews')
    .select('headline, rating_overall, rating_environmental, rating_ethical_business, rating_consumer_trust, rating_scandals, company_id, companies(name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  // User's followed companies
  const { data: follows } = await supabase
    .from('user_followed_companies')
    .select('companies(name, industry, avg_overall, avg_environmental, avg_ethical_business)')
    .eq('user_id', userId)

  // User preferences
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('user_values, issues')
    .eq('user_id', userId)
    .single()

  // Recent news for followed companies
  const followedCompanyNames = (follows || []).map(f => f.companies?.name).filter(Boolean)
  let recentNews = []
  if (followedCompanyNames.length > 0) {
    const followedIds = (follows || []).map(f => f.companies?.id).filter(Boolean)
    if (followedIds.length > 0) {
      const { data: news } = await supabase
        .from('company_news')
        .select('title, company_id, companies(name)')
        .in('company_id', followedIds)
        .order('published_at', { ascending: false })
        .limit(10)
      recentNews = (news || []).map(n => ({
        company_name: n.companies?.name || 'Unknown',
        title: n.title,
      }))
    }
  }

  return {
    reviews: (reviews || []).map(r => ({
      company_name: r.companies?.name || 'Unknown',
      headline: r.headline,
      rating_overall: r.rating_overall,
      rating_environmental: r.rating_environmental,
      rating_ethical_business: r.rating_ethical_business,
      rating_consumer_trust: r.rating_consumer_trust,
      rating_scandals: r.rating_scandals,
    })),
    followedCompanies: (follows || []).map(f => f.companies).filter(Boolean),
    userValues: prefs?.user_values || [],
    userIssues: prefs?.issues || [],
    recentNews,
  }
}
