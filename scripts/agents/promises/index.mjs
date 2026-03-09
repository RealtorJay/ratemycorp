import { supabase } from '../lib/supabase.mjs'
import { createRun, completeRun } from '../lib/logger.mjs'
import { searchNews } from '../lib/news-fetcher.mjs'
import { evaluatePromise } from './promise-evaluator.mjs'

/**
 * Promise Tracker Agent — evaluates pending/not_yet_due political promises
 * against recent news to determine if their status should be updated.
 * Runs every 12 hours.
 */
export async function runPromiseAgent() {
  const runId = await createRun('promises')
  const stats = { processed: 0, updated: 0, failed: 0, errors: [] }

  try {
    // Fetch promises that need evaluation
    const { data: promises, error } = await supabase
      .from('political_promises')
      .select(`
        id, promise_text, status, category,
        politician:politicians!political_promises_politician_id_fkey (
          id, full_name, party, state
        )
      `)
      .in('status', ['pending', 'not_yet_due', 'stalled'])

    if (error) throw new Error(`Failed to fetch promises: ${error.message}`)

    console.log(`[promises] Evaluating ${promises.length} promises...`)

    for (const promise of promises) {
      stats.processed++
      try {
        await processPromise(promise, stats)
      } catch (err) {
        stats.failed++
        stats.errors.push({
          entity: `${promise.politician?.full_name}: ${promise.promise_text?.slice(0, 50)}`,
          error: err.message,
          timestamp: new Date().toISOString(),
        })
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

async function processPromise(promise, stats) {
  const pol = promise.politician
  if (!pol) return

  // Build a targeted search query
  const searchTerms = buildSearchQuery(promise.promise_text, pol.full_name, promise.category)
  const articles = await searchNews(searchTerms, 5)

  if (articles.length === 0) return

  // Evaluate with Sonnet
  const evaluation = await evaluatePromise({
    promiseText: promise.promise_text,
    currentStatus: promise.status,
    politicianName: pol.full_name,
    party: pol.party || '',
    state: pol.state || '',
    articles,
  })

  if (!evaluation.should_update) return

  // Update the promise status
  const update = {
    status: evaluation.new_status,
    verdict_notes: evaluation.verdict_notes,
    verdict_date: new Date().toISOString().split('T')[0],
    verdict_source: evaluation.sources?.[0]?.url || null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('political_promises')
    .update(update)
    .eq('id', promise.id)

  if (error) {
    console.warn(`[promises] Update error for promise ${promise.id}:`, error.message)
  } else {
    stats.updated++
    console.log(`[promises] ${pol.full_name}: "${promise.promise_text.slice(0, 60)}..." → ${evaluation.new_status} (confidence: ${evaluation.confidence})`)
  }
}

/**
 * Build a targeted search query for a political promise.
 */
function buildSearchQuery(promiseText, politicianName, category) {
  // Extract key nouns/phrases from the promise (simple heuristic)
  const keywords = promiseText
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 4)
    .slice(0, 4)
    .join(' ')

  const categoryMap = {
    environment: 'climate environment EPA',
    healthcare: 'healthcare ACA insurance',
    economy: 'economy jobs employment',
    taxes: 'tax reform IRS',
    immigration: 'immigration border visa',
    defense: 'military defense Pentagon',
    education: 'education student schools',
    criminal_justice: 'criminal justice prison reform',
    campaign_finance: 'campaign finance Citizens United',
    corporate_regulation: 'regulation SEC antitrust',
  }

  const categoryTerms = categoryMap[category] || ''
  return `${politicianName} ${keywords} ${categoryTerms}`.trim()
}
