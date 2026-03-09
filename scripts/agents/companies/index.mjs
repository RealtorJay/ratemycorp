import { supabase } from '../lib/supabase.mjs'
import { createRun, completeRun } from '../lib/logger.mjs'
import { searchNews } from '../lib/news-fetcher.mjs'
import { classifyArticles } from './news-classifier.mjs'
import { summarizeEvent } from './event-summarizer.mjs'

const KEYWORDS = 'scandal OR fine OR lawsuit OR violation OR ESG OR regulation OR settlement'

/**
 * Company News Agent — searches for and classifies recent news
 * about tracked companies. Significant events get AI summaries.
 * Runs every 6 hours.
 */
export async function runCompanyAgent() {
  const runId = await createRun('companies')
  const stats = { processed: 0, updated: 0, failed: 0, errors: [] }

  try {
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name, slug')

    if (error) throw new Error(`Failed to fetch companies: ${error.message}`)

    console.log(`[companies] Scanning news for ${companies.length} companies...`)

    for (const co of companies) {
      stats.processed++
      try {
        await processCompany(co, stats)
      } catch (err) {
        stats.failed++
        stats.errors.push({
          entity: co.name,
          error: err.message,
          timestamp: new Date().toISOString(),
        })
        console.error(`[companies] Error processing ${co.name}:`, err.message)
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

async function processCompany(co, stats) {
  // Search for recent news
  const articles = await searchNews(`"${co.name}" ${KEYWORDS}`, 8)
  if (articles.length === 0) return

  // Filter out articles we already have
  const urls = articles.map(a => a.url)
  const { data: existing } = await supabase
    .from('company_news')
    .select('url')
    .in('url', urls)

  const existingUrls = new Set((existing || []).map(e => e.url))
  const newArticles = articles.filter(a => !existingUrls.has(a.url))

  if (newArticles.length === 0) return

  // Classify with Haiku (batch call)
  const classifications = await classifyArticles(co.name, newArticles)

  const rows = []
  const significantEvents = []

  for (const cls of classifications) {
    const article = newArticles[cls.index]
    if (!article || cls.skip) continue

    const row = {
      company_id: co.id,
      title: article.title,
      url: article.url,
      source: article.source,
      published_at: null, // Google Custom Search doesn't always provide dates
      category: cls.category || 'other',
      sentiment: cls.sentiment ?? 0,
      relevance_score: cls.relevance ?? 0.5,
      raw_snippet: article.snippet,
    }

    rows.push(row)

    // Queue significant negative events for Sonnet summarization
    if (cls.relevance >= 0.7 && cls.sentiment <= -0.3) {
      significantEvents.push({ row, article })
    }
  }

  // Summarize significant events with Sonnet (limit to 3 per company per run to control costs)
  for (const { row, article } of significantEvents.slice(0, 3)) {
    const result = await summarizeEvent(co.name, article.title, article.snippet, article.url)
    if (result) {
      row.ai_summary = result.summary
    }
  }

  // Upsert all classified articles
  if (rows.length > 0) {
    const { error } = await supabase
      .from('company_news')
      .upsert(rows, { onConflict: 'url', ignoreDuplicates: true })

    if (error) {
      console.warn(`[companies] Upsert error for ${co.name}:`, error.message)
    } else {
      stats.updated += rows.length
      console.log(`[companies] ${co.name}: ${rows.length} new articles`)
    }
  }
}
