#!/usr/bin/env node

/**
 * News seeder — Fetches news articles for all tracked companies and inserts them
 * into the company_news table. Uses GNews API (free tier: 100 req/day).
 *
 * Usage:
 *   GNEWS_API_KEY=your_key node scripts/seed_news.mjs
 *   GNEWS_API_KEY=your_key node scripts/seed_news.mjs --limit 10   # only first 10 companies
 *   GNEWS_API_KEY=your_key node scripts/seed_news.mjs --dry-run    # don't insert, just log
 *
 * Get a free API key at: https://gnews.io (100 requests/day)
 *
 * Alternatively, set WORLDNEWS_API_KEY for WorldNewsAPI (500 req/day):
 *   WORLDNEWS_API_KEY=your_key node scripts/seed_news.mjs
 */

import { createClient } from '@supabase/supabase-js'

import { readFileSync } from 'fs'

// Load .env manually (no dotenv dependency)
try {
  const envFile = readFileSync(new URL('../.env', import.meta.url), 'utf8')
  for (const line of envFile.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match && !process.env[match[1].trim()]) {
      process.env[match[1].trim()] = match[2].trim()
    }
  }
} catch { /* no .env file */ }

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing env vars: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const GNEWS_KEY = process.env.GNEWS_API_KEY
const WORLDNEWS_KEY = process.env.WORLDNEWS_API_KEY

if (!GNEWS_KEY && !WORLDNEWS_KEY) {
  console.error('❌ Set GNEWS_API_KEY or WORLDNEWS_API_KEY environment variable')
  console.error('   Get free key at https://gnews.io or https://worldnewsapi.com')
  process.exit(1)
}

const args = process.argv.slice(2)
const limitIdx = args.indexOf('--limit')
const companyLimit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : Infinity
const dryRun = args.includes('--dry-run')

const CATEGORY_KEYWORDS = {
  environmental: ['pollution', 'emissions', 'epa', 'climate', 'toxic', 'spill', 'environmental'],
  labor: ['labor', 'workers', 'union', 'osha', 'wages', 'layoff', 'strike', 'employee'],
  consumer: ['recall', 'consumer', 'safety', 'ftc', 'class action', 'data breach', 'privacy'],
  legal: ['lawsuit', 'sued', 'settlement', 'court', 'legal', 'indictment', 'plea'],
  financial: ['earnings', 'revenue', 'stock', 'sec', 'quarterly', 'profit', 'loss', 'ipo'],
  regulatory: ['regulation', 'fined', 'penalty', 'compliance', 'investigation', 'probe'],
  scandal: ['scandal', 'fraud', 'corruption', 'cover-up', 'whistleblower', 'crime'],
  positive: ['award', 'innovation', 'sustainability', 'philanthropy', 'donated', 'breakthrough'],
}

function classifyCategory(title, snippet) {
  const text = `${title} ${snippet || ''}`.toLowerCase()
  let bestCat = 'neutral'
  let bestScore = 0

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter(k => text.includes(k)).length
    if (score > bestScore) {
      bestScore = score
      bestCat = cat
    }
  }

  return bestCat
}

function estimateSentiment(title, snippet) {
  const text = `${title} ${snippet || ''}`.toLowerCase()
  const negWords = ['scandal', 'fraud', 'lawsuit', 'fine', 'penalty', 'violation', 'recalled', 'breach', 'sued', 'guilty', 'death', 'toxic', 'crash', 'layoff']
  const posWords = ['growth', 'profit', 'award', 'innovation', 'record', 'breakthrough', 'approved', 'partnership', 'donated']

  let score = 0.5
  for (const w of negWords) if (text.includes(w)) score -= 0.08
  for (const w of posWords) if (text.includes(w)) score += 0.08

  return Math.max(0, Math.min(1, Math.round(score * 100) / 100))
}

// ── GNews Fetcher ──

async function fetchGNews(companyName) {
  // Strip special chars that break GNews query syntax
  const cleanName = companyName.replace(/[()@#&'"]/g, ' ').replace(/\s+/g, ' ').trim()
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(cleanName)}&lang=en&max=10&apikey=${GNEWS_KEY}`
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GNews ${res.status}: ${text.slice(0, 200)}`)
  }
  const json = await res.json()
  return (json.articles || []).map(a => ({
    title: a.title,
    url: a.url,
    source: a.source?.name,
    published_at: a.publishedAt,
    raw_snippet: a.description,
  }))
}

// ── WorldNewsAPI Fetcher ──

async function fetchWorldNews(companyName) {
  const url = `https://api.worldnewsapi.com/search-news?text=${encodeURIComponent(companyName)}&language=en&number=10&api-key=${WORLDNEWS_KEY}`
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
  if (!res.ok) throw new Error(`WorldNewsAPI ${res.status}`)
  const json = await res.json()
  return (json.news || []).map(a => ({
    title: a.title,
    url: a.url,
    source: a.source,
    published_at: a.publish_date,
    raw_snippet: a.summary || a.text?.slice(0, 300),
  }))
}

const fetchNews = GNEWS_KEY ? fetchGNews : fetchWorldNews
const apiName = GNEWS_KEY ? 'GNews' : 'WorldNewsAPI'

// ── Main ──

async function main() {
  console.log(`\n🗞️  News Seeder — using ${apiName}`)
  console.log(`   ${dryRun ? '(DRY RUN — no inserts)' : ''}\n`)

  // Fetch all companies
  const { data: companies, error } = await supabase
    .from('companies')
    .select('id, name, slug')
    .order('name')

  if (error) { console.error('❌ Failed to fetch companies:', error.message); process.exit(1) }

  const toProcess = companies.slice(0, companyLimit)
  console.log(`   Processing ${toProcess.length} of ${companies.length} companies\n`)

  let totalInserted = 0
  let totalSkipped = 0
  let totalErrors = 0

  for (const co of toProcess) {
    process.stdout.write(`   ${co.name}... `)

    try {
      const articles = await fetchNews(co.name)
      if (articles.length === 0) {
        console.log('0 articles')
        continue
      }

      const rows = articles.map(a => ({
        company_id: co.id,
        title: a.title,
        url: a.url,
        source: a.source,
        published_at: a.published_at,
        category: classifyCategory(a.title, a.raw_snippet),
        sentiment: estimateSentiment(a.title, a.raw_snippet),
        relevance_score: 0.7,
        raw_snippet: a.raw_snippet?.slice(0, 1000),
      }))

      if (dryRun) {
        console.log(`${rows.length} articles (dry run)`)
        totalInserted += rows.length
        continue
      }

      // Upsert (url is unique)
      const { data: inserted, error: insertErr } = await supabase
        .from('company_news')
        .upsert(rows, { onConflict: 'url', ignoreDuplicates: true })
        .select('id')

      if (insertErr) {
        console.log(`ERROR: ${insertErr.message}`)
        totalErrors++
      } else {
        const count = inserted?.length || rows.length
        console.log(`${count} articles inserted`)
        totalInserted += count
      }
    } catch (err) {
      console.log(`FETCH ERROR: ${err.message}`)
      totalErrors++
    }

    // Rate limit: GNews = 1/sec, WorldNewsAPI = more generous
    await new Promise(r => setTimeout(r, GNEWS_KEY ? 1100 : 200))
  }

  console.log(`\n✅ Done!`)
  console.log(`   Inserted: ${totalInserted}`)
  console.log(`   Skipped (duplicate): ${totalSkipped}`)
  console.log(`   Errors: ${totalErrors}\n`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
