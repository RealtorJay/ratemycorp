import { supabase } from '../lib/supabase.mjs'
import { createRun, completeRun } from '../lib/logger.mjs'
import { summarizeReviews } from './summarizer.mjs'

/**
 * Summaries Agent — generates AI review summaries for companies with 5+ reviews.
 * Only re-summarizes when new reviews have been added since the last summary.
 */
export async function runSummariesAgent() {
  const runId = await createRun('summaries')
  const stats = { processed: 0, updated: 0, failed: 0, errors: [] }

  try {
    // Find companies needing a summary refresh
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name, review_count, ai_summary_updated_at')
      .gte('review_count', 5)

    if (error) throw new Error(`Failed to fetch companies: ${error.message}`)

    console.log(`[summaries] Found ${companies.length} companies with 5+ reviews`)

    for (const company of companies) {
      stats.processed++
      try {
        // Check if newest review is more recent than last summary
        const { data: latestReview } = await supabase
          .from('reviews')
          .select('created_at')
          .eq('company_id', company.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (
          company.ai_summary_updated_at &&
          latestReview &&
          new Date(latestReview.created_at) <= new Date(company.ai_summary_updated_at)
        ) {
          // Summary is up to date
          continue
        }

        // Fetch all reviews for this company
        const { data: reviews, error: revErr } = await supabase
          .from('reviews')
          .select('headline, body, rating_overall, rating_environmental, rating_ethical_business, rating_consumer_trust, rating_scandals')
          .eq('company_id', company.id)
          .order('created_at', { ascending: false })
          .limit(100)

        if (revErr) throw new Error(`Reviews fetch error: ${revErr.message}`)

        const result = await summarizeReviews(company.name, reviews)

        const { error: updateErr } = await supabase
          .from('companies')
          .update({
            ai_review_summary: result.summary_html,
            ai_summary_updated_at: new Date().toISOString(),
          })
          .eq('id', company.id)

        if (updateErr) throw new Error(`Update error: ${updateErr.message}`)

        stats.updated++
        console.log(`[summaries] ${company.name}: ${result.themes.join(', ')} (${result.sentiment})`)
      } catch (err) {
        stats.failed++
        stats.errors.push({ entity: company.name, error: err.message, timestamp: new Date().toISOString() })
        console.error(`[summaries] Error for ${company.name}:`, err.message)
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
