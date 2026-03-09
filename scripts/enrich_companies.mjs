/**
 * Company Enrichment Script — fills in missing CEO, description, headquarters,
 * founded year, and website for bulk-seeded companies using Wikidata SPARQL API.
 *
 * Run:
 *   node scripts/enrich_companies.mjs
 *
 * Options:
 *   --limit=500     Only process first N unenriched companies
 *   --dry-run       Preview changes without writing to DB
 *   --force         Re-enrich companies that already have a CEO
 *   --batch=100     Batch size for SPARQL queries (default: 100)
 *
 * Data source: Wikidata (free, no API key needed)
 * Matches by stock ticker symbol (P249) for public companies.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// ── Load .env ───────────────────────────────────────────────────────────────
try {
  const envFile = readFileSync(new URL('../.env', import.meta.url), 'utf8')
  for (const line of envFile.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match && !process.env[match[1].trim()]) {
      process.env[match[1].trim()] = match[2].trim()
    }
  }
} catch {}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required.')
  console.error('Find service_role key in: Supabase Dashboard → Settings → API')
  process.exit(1)
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY)

const args = process.argv.slice(2)
const LIMIT = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1]) || 0
const BATCH_SIZE = parseInt(args.find(a => a.startsWith('--batch='))?.split('=')[1]) || 100
const DRY_RUN = args.includes('--dry-run')
const FORCE = args.includes('--force')

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// ── Wikidata SPARQL query ───────────────────────────────────────────────────
// Fetches company data by stock ticker symbols in batches
async function queryWikidata(tickers) {
  const tickerValues = tickers.map(t => `"${t}"`).join(' ')

  const sparql = `
    SELECT ?ticker ?companyLabel ?ceoLabel ?hqLabel ?inception ?website ?description ?employeeCount WHERE {
      ?company wdt:P31/wdt:P279* wd:Q4830453 .
      ?company wdt:P249 ?ticker .
      FILTER(?ticker IN (${tickerValues}))

      OPTIONAL { ?company wdt:P169 ?ceo . }
      OPTIONAL { ?company wdt:P159 ?hq . }
      OPTIONAL { ?company wdt:P571 ?inception . }
      OPTIONAL { ?company wdt:P856 ?website . }
      OPTIONAL { ?company wdt:P1128 ?employeeCount . }
      OPTIONAL {
        ?company schema:description ?description .
        FILTER(LANG(?description) = "en")
      }

      SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
    }
  `

  const url = 'https://query.wikidata.org/sparql?query=' + encodeURIComponent(sparql)

  const res = await fetch(url, {
    headers: {
      'Accept': 'application/sparql-results+json',
      'User-Agent': 'RateMyCorps/1.0 (admin@ratemycorp.com) enrichment-script',
    },
    signal: AbortSignal.timeout(30000),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Wikidata query failed (${res.status}): ${text.slice(0, 200)}`)
  }

  const data = await res.json()
  return data.results.bindings
}

// ── Parse Wikidata results into a map by ticker ─────────────────────────────
function parseResults(bindings) {
  const byTicker = {}

  for (const row of bindings) {
    const ticker = row.ticker?.value
    if (!ticker) continue

    // Take first result per ticker (highest priority)
    if (byTicker[ticker]) continue

    const entry = {}

    if (row.ceoLabel?.value && !row.ceoLabel.value.startsWith('Q'))
      entry.ceo_name = row.ceoLabel.value

    if (row.hqLabel?.value && !row.hqLabel.value.startsWith('Q'))
      entry.headquarters = row.hqLabel.value

    if (row.inception?.value) {
      const year = parseInt(row.inception.value.slice(0, 4))
      if (year > 1600 && year <= 2026) entry.founded_year = year
    }

    if (row.website?.value)
      entry.website = row.website.value

    if (row.description?.value && row.description.value.length > 20)
      entry.description = row.description.value

    if (row.employeeCount?.value) {
      const count = parseInt(row.employeeCount.value)
      if (count > 0) {
        entry.employee_count = count >= 1000
          ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K`
          : String(count)
      }
    }

    if (Object.keys(entry).length > 0) {
      byTicker[ticker] = entry
    }
  }

  return byTicker
}

// ── Wikipedia API for better descriptions ───────────────────────────────────
async function fetchWikipediaExcerpt(companyName) {
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(companyName + ' company')}&srlimit=1&format=json`

  try {
    const searchRes = await fetch(searchUrl, {
      headers: { 'User-Agent': 'RateMyCorps/1.0 (admin@ratemycorp.com)' },
      signal: AbortSignal.timeout(8000),
    })
    if (!searchRes.ok) return null
    const searchData = await searchRes.json()
    const title = searchData.query?.search?.[0]?.title
    if (!title) return null

    const excerptUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=true&explaintext=true&titles=${encodeURIComponent(title)}&format=json&exsentences=3`
    const excerptRes = await fetch(excerptUrl, {
      headers: { 'User-Agent': 'RateMyCorps/1.0 (admin@ratemycorp.com)' },
      signal: AbortSignal.timeout(8000),
    })
    if (!excerptRes.ok) return null
    const excerptData = await excerptRes.json()
    const pages = excerptData.query?.pages
    if (!pages) return null
    const page = Object.values(pages)[0]
    const extract = page?.extract
    if (extract && extract.length > 50 && extract.length < 2000) return extract
    return null
  } catch {
    return null
  }
}

// ── Main ────────────────────────────────────────────────────────────────────
async function run() {
  console.log('╔═══════════════════════════════════════════════════════╗')
  console.log('║  RateMyCorps — Company Enrichment (Wikidata + Wiki)  ║')
  console.log('╚═══════════════════════════════════════════════════════╝')
  if (DRY_RUN) console.log('  (DRY RUN — no database writes)')

  // 1. Get companies that need enrichment
  let query = sb.from('companies').select('id, name, slug, stock_ticker, ceo_name, description, headquarters, founded_year, website')
  if (!FORCE) {
    // Only get companies missing CEO data (our proxy for "unenriched")
    query = query.is('ceo_name', null)
  }
  query = query.not('stock_ticker', 'is', null).order('name')
  if (LIMIT) query = query.limit(LIMIT)

  const { data: companies, error } = await query
  if (error) { console.error('DB error:', error.message); process.exit(1) }

  console.log(`\n  Found ${companies.length} companies to enrich`)
  if (companies.length === 0) { console.log('  Nothing to do!'); return }

  // 2. Process in batches via Wikidata SPARQL
  let enriched = 0, wikiDescriptions = 0, failed = 0

  for (let i = 0; i < companies.length; i += BATCH_SIZE) {
    const batch = companies.slice(i, i + BATCH_SIZE)
    const tickers = batch.map(c => c.stock_ticker).filter(Boolean)

    console.log(`\n  Batch ${Math.floor(i / BATCH_SIZE) + 1}: querying Wikidata for ${tickers.length} tickers...`)

    let wikidataMap = {}
    try {
      const bindings = await queryWikidata(tickers)
      wikidataMap = parseResults(bindings)
      console.log(`    Wikidata returned data for ${Object.keys(wikidataMap).length}/${tickers.length} tickers`)
    } catch (err) {
      console.error(`    Wikidata query failed: ${err.message}`)
      failed += batch.length
      await sleep(5000)
      continue
    }

    // 3. For companies with data, update DB + optionally fetch Wikipedia descriptions
    for (const company of batch) {
      const wd = wikidataMap[company.stock_ticker] || {}
      const updates = {}

      // Only update fields that are currently empty
      if (!company.ceo_name && wd.ceo_name) updates.ceo_name = wd.ceo_name
      if (!company.headquarters && wd.headquarters) updates.headquarters = wd.headquarters
      if (!company.founded_year && wd.founded_year) updates.founded_year = wd.founded_year
      if (!company.website && wd.website) updates.website = wd.website
      if (wd.employee_count) updates.employee_count = wd.employee_count

      // Fetch Wikipedia description if we don't have one (or have a short Wikidata one)
      if (!company.description || company.description.length < 50) {
        if (wd.description && wd.description.length > 80) {
          updates.description = wd.description
        } else {
          // Try Wikipedia for a better description
          const wikiDesc = await fetchWikipediaExcerpt(company.name)
          if (wikiDesc) {
            updates.description = wikiDesc
            wikiDescriptions++
            await sleep(200) // Rate limit Wikipedia
          }
        }
      }

      if (Object.keys(updates).length === 0) continue

      if (DRY_RUN) {
        console.log(`    [DRY] ${company.name} (${company.stock_ticker}):`)
        for (const [k, v] of Object.entries(updates)) {
          const val = String(v).length > 60 ? String(v).slice(0, 60) + '...' : v
          console.log(`      ${k}: ${val}`)
        }
        enriched++
        continue
      }

      const { error: updateError } = await sb
        .from('companies')
        .update(updates)
        .eq('id', company.id)

      if (updateError) {
        console.error(`    FAIL ${company.name}: ${updateError.message}`)
        failed++
      } else {
        enriched++
      }
    }

    // Rate limit between batches
    await sleep(2000)
    console.log(`  Progress: ${Math.min(i + BATCH_SIZE, companies.length)}/${companies.length} processed, ${enriched} enriched`)
  }

  // 4. Summary
  console.log('\n═══════════════════════════════════════')
  console.log(`  Companies enriched: ${enriched}`)
  console.log(`  Wikipedia descriptions: ${wikiDescriptions}`)
  if (failed) console.log(`  Failed: ${failed}`)

  // Show final stats
  const { count: totalCompanies } = await sb.from('companies').select('id', { count: 'exact', head: true })
  const { count: withCeo } = await sb.from('companies').select('id', { count: 'exact', head: true }).not('ceo_name', 'is', null)
  const { count: withDesc } = await sb.from('companies').select('id', { count: 'exact', head: true }).not('description', 'is', null)
  const { count: withHq } = await sb.from('companies').select('id', { count: 'exact', head: true }).not('headquarters', 'is', null)

  console.log(`\n  Database coverage:`)
  console.log(`    Total companies: ${totalCompanies}`)
  console.log(`    With CEO:         ${withCeo} (${((withCeo / totalCompanies) * 100).toFixed(1)}%)`)
  console.log(`    With description: ${withDesc} (${((withDesc / totalCompanies) * 100).toFixed(1)}%)`)
  console.log(`    With headquarters: ${withHq} (${((withHq / totalCompanies) * 100).toFixed(1)}%)`)

  console.log('\n✓ Enrichment complete!')
}

run().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
