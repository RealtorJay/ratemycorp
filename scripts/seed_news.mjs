#!/usr/bin/env node

/**
 * News seeder — Fetches relevant news for companies, politicians, and legislation.
 * Supports multiple free news APIs with automatic failover.
 *
 * Usage:
 *   GNEWS_API_KEY=xxx node scripts/seed_news.mjs                    # all entities
 *   NEWSDATA_API_KEY=xxx node scripts/seed_news.mjs                 # use NewsData.io
 *   GNEWS_API_KEY=xxx NEWSDATA_API_KEY=yyy node scripts/seed_news.mjs  # GNews primary, NewsData fallback
 *   node scripts/seed_news.mjs --type companies                     # companies only
 *   node scripts/seed_news.mjs --type politicians                   # politicians only
 *   node scripts/seed_news.mjs --limit 20                           # first 20 of each type
 *   node scripts/seed_news.mjs --dry-run                            # preview without inserting
 *
 * Free API keys:
 *   GNews:        https://gnews.io (100 req/day)
 *   NewsData.io:  https://newsdata.io (200 req/day)
 *   WorldNewsAPI: https://worldnewsapi.com (500 req/day)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// ── Load .env ──
try {
  const envFile = readFileSync(new URL('../.env', import.meta.url), 'utf8')
  for (const line of envFile.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match && !process.env[match[1].trim()]) {
      process.env[match[1].trim()] = match[2].trim()
    }
  }
} catch { /* no .env */ }

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const GNEWS_KEY = process.env.GNEWS_API_KEY
const NEWSDATA_KEY = process.env.NEWSDATA_API_KEY
const WORLDNEWS_KEY = process.env.WORLDNEWS_API_KEY
if (!GNEWS_KEY && !NEWSDATA_KEY && !WORLDNEWS_KEY) {
  console.error('❌ Set GNEWS_API_KEY, NEWSDATA_API_KEY, or WORLDNEWS_API_KEY')
  process.exit(1)
}

// ── CLI args ──
const args = process.argv.slice(2)
const limitIdx = args.indexOf('--limit')
const entityLimit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : Infinity
const typeIdx = args.indexOf('--type')
const typeFilter = typeIdx >= 0 ? args[typeIdx + 1] : 'all'
const dryRun = args.includes('--dry-run')
// Rate delay adjusts based on which API is currently active
function getRateDelay() {
  if (GNEWS_KEY && !gnewsExhausted) return 1500  // GNews needs 1.5s
  if (NEWSDATA_KEY && !newsdataExhausted) return 1000 // NewsData is moderate
  return 300 // WorldNewsAPI is fast
}

// ── Classification ──

const CATEGORY_KEYWORDS = {
  scandal: ['scandal', 'fraud', 'corruption', 'cover-up', 'whistleblower', 'crime', 'indicted', 'charged'],
  legal: ['lawsuit', 'sued', 'settlement', 'court', 'legal', 'indictment', 'plea', 'verdict', 'trial'],
  regulatory: ['regulation', 'fined', 'penalty', 'compliance', 'investigation', 'probe', 'sec', 'ftc'],
  environmental: ['pollution', 'emissions', 'epa', 'climate', 'toxic', 'spill', 'environmental', 'carbon'],
  labor: ['labor', 'workers', 'union', 'osha', 'wages', 'layoff', 'strike', 'employee', 'fired'],
  consumer: ['recall', 'consumer', 'safety', 'class action', 'data breach', 'privacy', 'fda'],
  financial: ['earnings', 'revenue', 'stock', 'quarterly', 'profit', 'loss', 'ipo', 'market'],
  positive: ['award', 'innovation', 'sustainability', 'philanthropy', 'donated', 'breakthrough'],
  policy: ['policy', 'executive order', 'legislation', 'bill', 'act', 'congress', 'signed into law'],
  election: ['election', 'campaign', 'vote', 'ballot', 'primary', 'poll', 'running for'],
  executive_order: ['executive order', 'presidential order', 'memorandum', 'directive'],
  legislation: ['bill', 'senate vote', 'house vote', 'passed', 'vetoed', 'filibuster', 'amendment'],
  investigation: ['investigation', 'subpoena', 'committee hearing', 'testimony', 'impeach', 'ethics'],
}

function classifyCategory(title, snippet) {
  const text = `${title} ${snippet || ''}`.toLowerCase()
  let bestCat = 'neutral'
  let bestScore = 0
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter(k => text.includes(k)).length
    if (score > bestScore) { bestScore = score; bestCat = cat }
  }
  return bestCat
}

function estimateSentiment(title, snippet) {
  const text = `${title} ${snippet || ''}`.toLowerCase()
  const neg = ['scandal', 'fraud', 'lawsuit', 'fine', 'penalty', 'violation', 'recalled', 'breach',
    'sued', 'guilty', 'death', 'toxic', 'crash', 'layoff', 'indicted', 'corruption', 'arrested',
    'impeach', 'resign', 'fired', 'bankrupt', 'crisis']
  const pos = ['growth', 'profit', 'award', 'innovation', 'record', 'breakthrough', 'approved',
    'partnership', 'donated', 'elected', 'victory', 'bipartisan', 'historic']
  let score = 0.5
  for (const w of neg) if (text.includes(w)) score -= 0.06
  for (const w of pos) if (text.includes(w)) score += 0.06
  return Math.max(0, Math.min(1, Math.round(score * 100) / 100))
}

// ── Relevance filtering ──

const IRRELEVANT_KEYWORDS = [
  'nfl', 'nba', 'mlb', 'nhl', 'soccer', 'football score', 'basketball',
  'touchdown', 'home run', 'world cup', 'super bowl', 'playoffs',
  'fantasy sports', 'batting average', 'quarterback', 'goalkeeper',
  'celebrity gossip', 'reality tv', 'kardashian', 'horoscope',
  'recipe', 'cooking tips', 'fashion week', 'red carpet',
]

function isRelevant(article, entityName) {
  const text = `${article.title} ${article.raw_snippet || ''}`.toLowerCase()
  const nameLower = entityName.toLowerCase()

  // Filter out sports/entertainment noise
  for (const kw of IRRELEVANT_KEYWORDS) {
    if (text.includes(kw)) return false
  }

  // For short/generic company names, require the name appears in title or snippet
  if (nameLower.length <= 4 || /^\d/.test(nameLower)) {
    if (!text.includes(nameLower)) return false
  }

  return true
}

// ── GNews API ──

let gnewsExhausted = false

async function fetchGNews(query) {
  if (gnewsExhausted) return null
  const cleanQuery = query.replace(/[()@#'"]/g, ' ').replace(/\s+/g, ' ').trim()
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(cleanQuery)}&lang=en&max=10&apikey=${GNEWS_KEY}`
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
  if (res.status === 403 || res.status === 429) {
    gnewsExhausted = true
    console.log('[GNews limit hit, switching to fallback] ')
    return null // signal to try fallback
  }
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

// ── NewsData.io API ──

let newsdataExhausted = false

async function fetchNewsData(query) {
  if (newsdataExhausted) return null
  const cleanQuery = query.replace(/[()@#'"]/g, ' ').replace(/\s+/g, ' ').trim()
  const url = `https://newsdata.io/api/1/latest?q=${encodeURIComponent(cleanQuery)}&language=en&size=10&apikey=${NEWSDATA_KEY}`
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
  if (res.status === 429) {
    newsdataExhausted = true
    console.log('[NewsData limit hit, switching to fallback] ')
    return null
  }
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`NewsData ${res.status}: ${text.slice(0, 200)}`)
  }
  const json = await res.json()
  return (json.results || []).map(a => ({
    title: a.title,
    url: a.link,
    source: a.source_name || a.source_id,
    published_at: a.pubDate,
    raw_snippet: a.description,
  }))
}

// ── WorldNewsAPI ──

async function fetchWorldNews(query) {
  const url = `https://api.worldnewsapi.com/search-news?text=${encodeURIComponent(query)}&language=en&number=10&api-key=${WORLDNEWS_KEY}`
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

// ── Fetch with automatic failover ──
// Tries APIs in priority order: GNews → NewsData → WorldNewsAPI
// If an API returns null (rate limited), moves to next. On hard error, throws.

async function fetchNews(query) {
  const apis = []
  if (GNEWS_KEY) apis.push({ fn: fetchGNews, name: 'GNews' })
  if (NEWSDATA_KEY) apis.push({ fn: fetchNewsData, name: 'NewsData' })
  if (WORLDNEWS_KEY) apis.push({ fn: fetchWorldNews, name: 'WorldNews' })

  for (const api of apis) {
    const result = await api.fn(query)
    if (result !== null) return result
  }

  throw new Error('All news APIs exhausted')
}

// Build display name
const apiNames = []
if (GNEWS_KEY) apiNames.push('GNews')
if (NEWSDATA_KEY) apiNames.push('NewsData.io')
if (WORLDNEWS_KEY) apiNames.push('WorldNewsAPI')
const apiName = apiNames.join(' → ')

// ── Build search queries ──

function buildCompanyQuery(company) {
  // Use industry context to make generic names specific
  const name = company.name
  const industry = company.industry
  const ticker = company.stock_ticker

  // For well-known companies with tickers, just use the name
  if (ticker && name.length > 4) return `"${name}" company`

  // Add industry context for disambiguation
  if (industry) return `"${name}" ${industry}`

  return `"${name}" corporation OR company`
}

function buildPoliticianQuery(pol) {
  const name = pol.full_name
  const title = pol.title || ''
  const chamber = pol.chamber

  // Presidents and VP get special treatment
  if (title.includes('President') || title.includes('Vice President')) {
    return `"${name}" president`
  }
  // Cabinet/Executive
  if (chamber === 'executive') {
    return `"${name}" ${title || 'administration'}`
  }
  // Senators
  if (chamber === 'senate') {
    return `"${name}" senator`
  }
  // House
  if (chamber === 'house') {
    return `"${name}" representative OR congress`
  }
  // Governors
  if (chamber === 'governor') {
    return `"${name}" governor`
  }

  return `"${name}" politics`
}

// ── Main ──

async function main() {
  console.log(`\n🗞️  News Seeder v2 — using ${apiName}`)
  console.log(`   Type: ${typeFilter} | Limit: ${entityLimit === Infinity ? 'all' : entityLimit} | ${dryRun ? 'DRY RUN' : 'LIVE'}\n`)

  let totalInserted = 0
  let totalFiltered = 0
  let totalErrors = 0
  let requestCount = 0

  // ── Companies ──
  if (typeFilter === 'all' || typeFilter === 'companies') {
    console.log('── Companies ──────────────────────────────────')

    // Only fetch companies that have reviews (real tracked companies, not bulk stock imports)
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name, slug, industry, stock_ticker')
      .gt('review_count', 0)
      .order('review_count', { ascending: false })

    if (error) { console.error('❌ Companies fetch failed:', error.message); process.exit(1) }

    const toProcess = companies.slice(0, entityLimit)
    console.log(`   ${toProcess.length} companies with reviews\n`)

    for (const co of toProcess) {
      const query = buildCompanyQuery(co)
      process.stdout.write(`   ${co.name} → "${query}"... `)

      try {
        const articles = await fetchNews(query)
        const relevant = articles.filter(a => isRelevant(a, co.name))
        const filtered = articles.length - relevant.length

        if (relevant.length === 0) {
          console.log(`0 relevant (${filtered} filtered)`)
          totalFiltered += filtered
          requestCount++
          await new Promise(r => setTimeout(r, getRateDelay()))
          continue
        }

        const rows = relevant.map(a => ({
          company_id: co.id,
          politician_id: null,
          news_type: 'company',
          title: a.title,
          url: a.url,
          source: a.source,
          published_at: a.published_at,
          category: classifyCategory(a.title, a.raw_snippet),
          sentiment: estimateSentiment(a.title, a.raw_snippet),
          relevance_score: 0.75,
          raw_snippet: a.raw_snippet?.slice(0, 1000),
        }))

        if (dryRun) {
          console.log(`${relevant.length} articles (${filtered} filtered) [dry run]`)
          totalInserted += relevant.length
          totalFiltered += filtered
        } else {
          const { data: inserted, error: insertErr } = await supabase
            .from('company_news')
            .upsert(rows, { onConflict: 'url', ignoreDuplicates: true })
            .select('id')

          if (insertErr) {
            console.log(`ERROR: ${insertErr.message}`)
            totalErrors++
          } else {
            const count = inserted?.length || relevant.length
            console.log(`${count} inserted (${filtered} filtered)`)
            totalInserted += count
            totalFiltered += filtered
          }
        }
      } catch (err) {
        console.log(`FETCH ERROR: ${err.message}`)
        totalErrors++
      }

      requestCount++
      await new Promise(r => setTimeout(r, getRateDelay()))
    }
  }

  // ── Politicians ──
  if (typeFilter === 'all' || typeFilter === 'politicians') {
    console.log('\n── Politicians ─────────────────────────────────')

    const { data: politicians, error } = await supabase
      .from('politicians')
      .select('id, full_name, slug, party, chamber, title, state, in_office')
      .eq('in_office', true)
      .order('full_name')

    if (error) { console.error('❌ Politicians fetch failed:', error.message); process.exit(1) }

    // Prioritize: presidents/VP first, then cabinet, then senate leaders, then all
    const prioritized = politicians.sort((a, b) => {
      const order = { executive: 0, senate: 1, house: 2, governor: 3 }
      return (order[a.chamber] ?? 4) - (order[b.chamber] ?? 4)
    })

    const toProcess = prioritized.slice(0, entityLimit)
    console.log(`   ${toProcess.length} active politicians\n`)

    for (const pol of toProcess) {
      const query = buildPoliticianQuery(pol)
      process.stdout.write(`   ${pol.full_name} (${pol.title || pol.chamber})... `)

      try {
        const articles = await fetchNews(query)
        const relevant = articles.filter(a => isRelevant(a, pol.full_name))
        const filtered = articles.length - relevant.length

        if (relevant.length === 0) {
          console.log(`0 relevant (${filtered} filtered)`)
          totalFiltered += filtered
          requestCount++
          await new Promise(r => setTimeout(r, getRateDelay()))
          continue
        }

        const rows = relevant.map(a => ({
          company_id: null,
          politician_id: pol.id,
          news_type: 'politician',
          title: a.title,
          url: a.url,
          source: a.source,
          published_at: a.published_at,
          category: classifyCategory(a.title, a.raw_snippet),
          sentiment: estimateSentiment(a.title, a.raw_snippet),
          relevance_score: 0.8,
          raw_snippet: a.raw_snippet?.slice(0, 1000),
        }))

        if (dryRun) {
          console.log(`${relevant.length} articles (${filtered} filtered) [dry run]`)
          totalInserted += relevant.length
          totalFiltered += filtered
        } else {
          const { data: inserted, error: insertErr } = await supabase
            .from('company_news')
            .upsert(rows, { onConflict: 'url', ignoreDuplicates: true })
            .select('id')

          if (insertErr) {
            console.log(`ERROR: ${insertErr.message}`)
            totalErrors++
          } else {
            const count = inserted?.length || relevant.length
            console.log(`${count} inserted (${filtered} filtered)`)
            totalInserted += count
            totalFiltered += filtered
          }
        }
      } catch (err) {
        console.log(`FETCH ERROR: ${err.message}`)
        totalErrors++
      }

      requestCount++
      await new Promise(r => setTimeout(r, getRateDelay()))
    }
  }

  // ── Legislation / General political news ──
  if (typeFilter === 'all' || typeFilter === 'legislation') {
    console.log('\n── Legislation & Policy ─────────────────────────')

    const GENERAL_QUERIES = [
      { query: 'corporate accountability regulation 2025', type: 'legislation' },
      { query: 'SEC enforcement action 2025', type: 'legislation' },
      { query: 'EPA environmental violation corporate', type: 'legislation' },
      { query: 'OSHA workplace safety violation fine', type: 'legislation' },
      { query: 'consumer protection CFPB enforcement', type: 'legislation' },
      { query: 'antitrust DOJ corporate merger', type: 'legislation' },
      { query: 'corporate lobbying spending disclosure', type: 'legislation' },
      { query: 'congressional hearing corporate executives', type: 'legislation' },
      { query: 'executive order business regulation', type: 'legislation' },
      { query: 'FTC privacy data protection enforcement', type: 'legislation' },
    ]

    for (const gq of GENERAL_QUERIES.slice(0, entityLimit)) {
      process.stdout.write(`   "${gq.query}"... `)

      try {
        const articles = await fetchNews(gq.query)
        if (articles.length === 0) {
          console.log('0 articles')
          requestCount++
          await new Promise(r => setTimeout(r, getRateDelay()))
          continue
        }

        const rows = articles.map(a => ({
          company_id: null,
          politician_id: null,
          news_type: gq.type,
          title: a.title,
          url: a.url,
          source: a.source,
          published_at: a.published_at,
          category: classifyCategory(a.title, a.raw_snippet),
          sentiment: estimateSentiment(a.title, a.raw_snippet),
          relevance_score: 0.6,
          raw_snippet: a.raw_snippet?.slice(0, 1000),
        }))

        if (dryRun) {
          console.log(`${rows.length} articles [dry run]`)
          totalInserted += rows.length
        } else {
          const { data: inserted, error: insertErr } = await supabase
            .from('company_news')
            .upsert(rows, { onConflict: 'url', ignoreDuplicates: true })
            .select('id')

          if (insertErr) {
            console.log(`ERROR: ${insertErr.message}`)
            totalErrors++
          } else {
            console.log(`${inserted?.length || rows.length} inserted`)
            totalInserted += inserted?.length || rows.length
          }
        }
      } catch (err) {
        console.log(`FETCH ERROR: ${err.message}`)
        totalErrors++
      }

      requestCount++
      await new Promise(r => setTimeout(r, getRateDelay()))
    }
  }

  console.log(`\n✅ Done!`)
  console.log(`   API requests: ${requestCount}`)
  console.log(`   Inserted: ${totalInserted}`)
  console.log(`   Filtered (irrelevant): ${totalFiltered}`)
  console.log(`   Errors: ${totalErrors}\n`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
