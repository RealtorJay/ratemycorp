/**
 * Bulk Company Seeder — pulls ~2000+ real public companies from SEC EDGAR,
 * enriches with SIC industry codes, headquarters, stock tickers, and websites.
 *
 * Run:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed_bulk_companies.mjs
 *
 * Options:
 *   --limit=500        Only seed first N companies (default: all)
 *   --enrich           Fetch full details from SEC (slower, ~2 req/sec)
 *   --dry-run          Print stats without inserting
 *
 * Data sources:
 *   - SEC EDGAR company_tickers.json (10k+ public companies, sorted by market cap)
 *   - SEC EDGAR submissions API (SIC codes, addresses, exchanges)
 *   - Domain inference from company name for logos
 *
 * This is idempotent — uses upsert on slug. Existing hand-curated data wins.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Load .env file if present
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
  console.error('Missing env vars.')
  console.error('  SUPABASE_URL: ' + (SUPABASE_URL ? '✓' : '✗ (set SUPABASE_URL or VITE_SUPABASE_URL)'))
  console.error('  SUPABASE_SERVICE_ROLE_KEY: ' + (SERVICE_KEY ? '✓' : '✗'))
  console.error('')
  console.error('The service role key is required for bulk inserts (bypasses RLS).')
  console.error('Find it in: Supabase Dashboard → Settings → API → service_role (secret)')
  console.error('')
  console.error('Usage:')
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/seed_bulk_companies.mjs')
  process.exit(1)
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY)

const args = process.argv.slice(2)
const LIMIT = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1]) || 0
const ENRICH = args.includes('--enrich')
const DRY_RUN = args.includes('--dry-run')

// ── SIC Code → Industry Mapping ──────────────────────────────────────────────
// Groups SEC's 400+ SIC codes into clean industry categories
const SIC_TO_INDUSTRY = {
  // Mining & Energy
  '10': 'Mining', '12': 'Mining', '13': 'Oil & Gas', '14': 'Mining',
  // Construction
  '15': 'Construction', '16': 'Construction', '17': 'Construction',
  // Manufacturing
  '20': 'Food & Beverage', '21': 'Tobacco', '22': 'Textiles', '23': 'Apparel',
  '24': 'Lumber', '25': 'Furniture', '26': 'Paper', '27': 'Publishing',
  '28': 'Chemicals & Pharmaceuticals', '29': 'Petroleum Refining',
  '30': 'Rubber & Plastics', '31': 'Leather', '32': 'Glass & Concrete',
  '33': 'Metals', '34': 'Metal Products', '35': 'Industrial Machinery',
  '36': 'Electronics', '37': 'Transportation Equipment', '38': 'Instruments',
  '39': 'Miscellaneous Manufacturing',
  // Transportation & Utilities
  '40': 'Railroads', '41': 'Transit', '42': 'Trucking & Warehousing',
  '43': 'Postal Services', '44': 'Shipping', '45': 'Airlines',
  '46': 'Pipelines', '47': 'Travel Services', '48': 'Telecommunications',
  '49': 'Utilities',
  // Wholesale & Retail
  '50': 'Wholesale', '51': 'Wholesale', '52': 'Retail', '53': 'Retail',
  '54': 'Grocery', '55': 'Auto Dealers', '56': 'Apparel Retail',
  '57': 'Furniture Retail', '58': 'Restaurants', '59': 'Retail',
  // Finance
  '60': 'Banking', '61': 'Credit & Lending', '62': 'Securities & Investments',
  '63': 'Insurance', '64': 'Insurance', '65': 'Real Estate',
  '67': 'Investment Services',
  // Services
  '70': 'Hotels & Lodging', '72': 'Personal Services', '73': 'Business Services',
  '75': 'Auto Services', '76': 'Repair Services', '78': 'Entertainment',
  '79': 'Recreation', '80': 'Healthcare', '81': 'Legal Services',
  '82': 'Education', '83': 'Social Services', '84': 'Museums',
  '86': 'Membership Organizations', '87': 'Engineering & Management Services',
  '89': 'Services',
  // Public Admin
  '91': 'Government', '92': 'Government', '93': 'Government',
  '94': 'Government', '95': 'Government', '96': 'Government',
  '97': 'Government', '99': 'Nonclassifiable',
}

// More specific 4-digit SIC overrides for key tech/pharma categories
const SIC_SPECIFIC = {
  '2834': 'Pharmaceuticals', '2835': 'Diagnostics', '2836': 'Biotechnology',
  '3559': 'Semiconductor Equipment', '3571': 'Computer Hardware',
  '3572': 'Data Storage', '3576': 'Networking Equipment',
  '3577': 'Computer Peripherals', '3579': 'Office Equipment',
  '3661': 'Telecommunications Equipment', '3669': 'Communications Equipment',
  '3672': 'Circuit Boards', '3674': 'Semiconductors',
  '3679': 'Electronic Components', '3711': 'Automotive',
  '3714': 'Auto Parts', '3721': 'Aerospace & Defense',
  '3724': 'Aircraft Engines', '3728': 'Aircraft Parts',
  '3761': 'Missiles & Space', '3769': 'Space & Defense',
  '3812': 'Defense Electronics', '3825': 'Instruments',
  '3826': 'Lab Equipment', '3827': 'Optics',
  '3841': 'Medical Devices', '3842': 'Medical Supplies',
  '3845': 'Medical Instruments',
  '4812': 'Wireless Telecom', '4813': 'Telecom Services',
  '4899': 'Cable & Telecom',
  '4911': 'Electric Utilities', '4922': 'Natural Gas', '4923': 'Natural Gas',
  '4931': 'Electric & Gas Utilities', '4941': 'Water Utilities',
  '4953': 'Waste Management',
  '5045': 'Computer & Electronics Wholesale', '5047': 'Medical Wholesale',
  '5065': 'Electronic Parts Distribution', '5122': 'Drug Wholesale',
  '5141': 'Grocery Wholesale', '5311': 'Department Stores',
  '5331': 'Variety Stores', '5411': 'Grocery Stores',
  '5412': 'Convenience Stores', '5812': 'Restaurants',
  '5912': 'Pharmacy & Drugstores', '5944': 'Jewelry Stores',
  '5945': 'Hobby & Toy Stores', '5961': 'E-Commerce',
  '6020': 'Banking', '6021': 'Banking', '6022': 'Banking',
  '6035': 'Savings & Loans', '6036': 'Savings & Loans',
  '6141': 'Consumer Finance', '6153': 'Payment Processing',
  '6159': 'Lending', '6162': 'Mortgage', '6163': 'Mortgage',
  '6199': 'Financial Services', '6200': 'Securities',
  '6211': 'Securities & Brokerage', '6221': 'Commodities',
  '6282': 'Investment Management', '6311': 'Insurance',
  '6321': 'Health Insurance', '6324': 'Health Insurance',
  '6331': 'Property & Casualty Insurance', '6399': 'Insurance',
  '6411': 'Insurance Brokerage',
  '6500': 'Real Estate', '6510': 'Real Estate', '6512': 'REITs',
  '6726': 'Investment Holding', '6770': 'Blank Check / SPAC',
  '7011': 'Hotels', '7310': 'Staffing', '7311': 'Advertising',
  '7361': 'Staffing', '7363': 'Staffing',
  '7370': 'Software & IT Services', '7371': 'Software',
  '7372': 'Software', '7374': 'Cloud & Data Services',
  '7380': 'Security Services', '7381': 'Security Services',
  '7812': 'Film & Entertainment', '7819': 'Entertainment Services',
  '7841': 'Video Streaming', '7990': 'Gaming & Recreation',
  '7997': 'Fitness & Recreation',
  '8000': 'Healthcare', '8011': 'Healthcare Services',
  '8040': 'Healthcare Services', '8042': 'Healthcare Services',
  '8049': 'Healthcare Services', '8050': 'Nursing Facilities',
  '8051': 'Nursing Facilities', '8060': 'Hospitals',
  '8062': 'Hospitals', '8071': 'Medical Labs',
  '8082': 'Home Healthcare', '8090': 'Healthcare Services',
  '8093': 'Specialty Healthcare', '8099': 'Healthcare Services',
  '8200': 'Education', '8211': 'Education', '8742': 'IT Consulting',
  '8731': 'R&D Services', '8734': 'Testing Labs',
  '8741': 'Management Services', '8742': 'IT Consulting',
  '8744': 'Facilities Management',
}

// ── ETF / Fund tickers to exclude ────────────────────────────────────────────
const EXCLUDE_TICKERS = new Set([
  'SPY', 'VOO', 'QQQ', 'IVV', 'VTI', 'BND', 'VEA', 'VWO', 'AGG', 'GLD',
  'IWM', 'EFA', 'VNQ', 'LQD', 'TLT', 'HYG', 'SHY', 'IEFA', 'XLF', 'XLK',
  'XLE', 'XLV', 'XLI', 'XLP', 'XLY', 'XLB', 'XLU', 'XLRE', 'DIA', 'IWF',
  'IWD', 'IJR', 'IJH', 'VIG', 'VYM', 'SCHD', 'JEPI', 'JEPQ',
])

// ── Slugify ──────────────────────────────────────────────────────────────────
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

// ── Clean company name ───────────────────────────────────────────────────────
function cleanName(rawName) {
  // Strip common corporate suffixes and legal entity types
  let name = rawName
    .replace(/\b(INC|CORP|CORPORATION|LTD|LLC|PLC|LP|L\.P\.|CO|GROUP|HOLDINGS?|ENTERPRISES?|INTERNATIONAL|TECHNOLOGIES|SOLUTIONS|COMMON STOCK|CLASS [A-Z]|CL [A-Z]|SHS|NEW|DE|NV|AG|SA|SE)\b\.?/gi, '')
    .replace(/[,./\\]/g, '')
    .replace(/\s*&\s*$/g, '') // trailing "&"
    .replace(/\s+/g, ' ')
    .trim()

  // Title-case, preserving known acronyms
  const ACRONYMS = new Set(['IBM', 'AMD', 'HP', 'AT&T', 'UPS', 'GE', '3M', 'GM', 'BP', 'AB', 'BHP', 'SAP', 'ASML', 'TSMC', 'JD', 'SK', 'LG', 'NXP', 'ADP', 'CME', 'CDW'])
  name = name
    .split(' ')
    .map(w => {
      const upper = w.toUpperCase()
      if (ACRONYMS.has(upper)) return upper
      if (w.length <= 2 && w === w.toUpperCase()) return upper // Keep 2-letter caps
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    })
    .join(' ')
    .trim()

  return name
}

// ── Guess website from company name ──────────────────────────────────────────
// Known domain overrides for companies whose domain doesn't match their name
const KNOWN_DOMAINS = {
  'alphabet': 'abc.xyz',
  'meta platforms': 'meta.com',
  'broadcom': 'broadcom.com',
  'berkshire hathaway': 'berkshirehathaway.com',
  'unitedhealth group': 'unitedhealthgroup.com',
  'eli lilly': 'lilly.com',
  'jpmorgan chase': 'jpmorganchase.com',
  'exxon mobil': 'exxonmobil.com',
  'johnson & johnson': 'jnj.com',
  'procter & gamble': 'pg.com',
  'thermo fisher scientific': 'thermofisher.com',
  'at&t': 'att.com',
  'charles schwab': 'schwab.com',
  'conocophillips': 'conocophillips.com',
  'general motors': 'gm.com',
  'general electric': 'ge.com',
  'general dynamics': 'gd.com',
  'lockheed martin': 'lockheedmartin.com',
  'northrop grumman': 'northropgrumman.com',
  'raytheon': 'rtx.com',
  'bank of america': 'bankofamerica.com',
  'wells fargo': 'wellsfargo.com',
  'goldman sachs': 'goldmansachs.com',
  'morgan stanley': 'morganstanley.com',
  'american express': 'americanexpress.com',
  'coca-cola': 'coca-colacompany.com',
  'pepsico': 'pepsico.com',
  'home depot': 'homedepot.com',
  'walt disney': 'thewaltdisneycompany.com',
  'philip morris': 'pmi.com',
  '3m': '3m.com',
  'the travelers': 'travelers.com',
}

function guessWebsite(name) {
  const lower = name.toLowerCase()
  for (const [key, domain] of Object.entries(KNOWN_DOMAINS)) {
    if (lower.includes(key)) return `https://${domain}`
  }
  // Fallback: clean the name and guess domain
  const domain = lower
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .slice(0, 30)
  return `https://${domain}.com`
}

// ── Map SIC code to industry ─────────────────────────────────────────────────
function sicToIndustry(sic) {
  if (!sic) return 'Other'
  const code = String(sic)
  // Try specific 4-digit first
  if (SIC_SPECIFIC[code]) return SIC_SPECIFIC[code]
  // Try 2-digit prefix
  const prefix = code.slice(0, 2)
  if (SIC_TO_INDUSTRY[prefix]) return SIC_TO_INDUSTRY[prefix]
  return 'Other'
}

// ── Rate limiter ─────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// ── Fetch SEC EDGAR company list ─────────────────────────────────────────────
async function fetchEdgarCompanies() {
  console.log('Fetching SEC EDGAR company list...')
  const res = await fetch('https://www.sec.gov/files/company_tickers.json', {
    headers: { 'User-Agent': 'RateMyCorps admin@ratemycorp.com' },
  })
  if (!res.ok) throw new Error(`SEC EDGAR fetch failed: ${res.status}`)
  const data = await res.json()

  // Convert from indexed object to array
  const companies = Object.values(data)
  console.log(`  Found ${companies.length} total SEC entries`)

  // Filter out ETFs, blank checks, and duplicate tickers
  const seen = new Set()
  const filtered = companies.filter(c => {
    if (EXCLUDE_TICKERS.has(c.ticker)) return false
    if (seen.has(c.ticker)) return false
    // Skip if name suggests ETF/fund
    const name = c.title.toUpperCase()
    if (name.includes(' ETF') || name.includes('TRUST') && name.includes('FUND')) return false
    if (name.includes('ACQUISITION') && name.includes('BLANK')) return false
    seen.add(c.ticker)
    return true
  })

  console.log(`  After filtering: ${filtered.length} companies`)
  return filtered
}

// ── Enrich a single company via SEC submissions API ──────────────────────────
async function enrichFromEdgar(cik) {
  const paddedCik = String(cik).padStart(10, '0')
  try {
    const res = await fetch(`https://data.sec.gov/submissions/CIK${paddedCik}.json`, {
      headers: { 'User-Agent': 'RateMyCorps admin@ratemycorp.com' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const data = await res.json()
    return {
      sic: data.sic,
      sicDescription: data.sicDescription,
      state: data.addresses?.business?.stateOrCountry,
      city: data.addresses?.business?.city,
      exchanges: data.exchanges,
      website: data.website || null,
    }
  } catch {
    return null
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║  RateMyCorps — Bulk Company Seeder (SEC EDGAR)  ║')
  console.log('╚══════════════════════════════════════════════════╝')
  if (DRY_RUN) console.log('  (DRY RUN — no database writes)')

  // 1. Fetch company list
  const edgarCompanies = await fetchEdgarCompanies()

  // 2. Get existing slugs so we don't overwrite hand-curated data
  const { data: existing } = await sb.from('companies').select('slug')
  const existingSlugs = new Set((existing || []).map(c => c.slug))
  console.log(`\n  ${existingSlugs.size} companies already in database`)

  // 3. Prepare companies for insert
  const limit = LIMIT || edgarCompanies.length
  const toProcess = edgarCompanies.slice(0, limit)
  console.log(`  Processing ${toProcess.length} companies${LIMIT ? ` (limited to ${LIMIT})` : ''}`)
  if (ENRICH) console.log('  Enriching from SEC submissions API (this will take a while)...')

  const toUpsert = []
  let enriched = 0, skippedExisting = 0

  for (let i = 0; i < toProcess.length; i++) {
    const c = toProcess[i]
    const name = cleanName(c.title)
    const slug = slugify(name)

    if (!slug || slug.length < 2) continue

    // Skip if we already have hand-curated data for this company
    if (existingSlugs.has(slug)) {
      skippedExisting++
      continue
    }

    let industry = 'Other'
    let headquarters = null
    let website = guessWebsite(name)

    if (ENRICH) {
      const details = await enrichFromEdgar(c.cik_str)
      if (details) {
        industry = sicToIndustry(details.sic)
        if (details.city && details.state) {
          headquarters = `${details.city}, ${details.state}`
        }
        if (details.website) {
          website = details.website.startsWith('http') ? details.website : `https://${details.website}`
        }
        enriched++
      }
      // Rate limit: SEC asks for max 10 req/sec, we'll do 5/sec to be safe
      if (i % 5 === 4) await sleep(1000)

      // Progress log every 100
      if ((i + 1) % 100 === 0) {
        console.log(`  ... processed ${i + 1}/${toProcess.length} (enriched: ${enriched})`)
      }
    }

    toUpsert.push({
      name,
      slug,
      industry,
      stock_ticker: c.ticker,
      is_public: true,
      website,
      headquarters,
      description: null, // Will be null for bulk-seeded companies
    })
  }

  console.log(`\n  Ready to upsert: ${toUpsert.length} new companies`)
  console.log(`  Skipped (already in DB): ${skippedExisting}`)
  if (ENRICH) console.log(`  Enriched from SEC: ${enriched}`)

  if (DRY_RUN) {
    // Print industry breakdown
    const byIndustry = {}
    for (const c of toUpsert) {
      byIndustry[c.industry] = (byIndustry[c.industry] || 0) + 1
    }
    console.log('\n  Industry breakdown:')
    Object.entries(byIndustry)
      .sort((a, b) => b[1] - a[1])
      .forEach(([ind, count]) => console.log(`    ${ind}: ${count}`))

    console.log('\n  Sample companies:')
    toUpsert.slice(0, 20).forEach(c =>
      console.log(`    ${c.stock_ticker.padEnd(6)} ${c.name.padEnd(35)} ${c.industry}`)
    )
    console.log('\n  (dry run complete — no changes made)')
    return
  }

  // 4. Batch upsert in chunks of 100
  console.log('\n  Upserting to Supabase...')
  let ok = 0, fail = 0
  const BATCH_SIZE = 100
  for (let i = 0; i < toUpsert.length; i += BATCH_SIZE) {
    const batch = toUpsert.slice(i, i + BATCH_SIZE)
    const { error } = await sb.from('companies').upsert(batch, {
      onConflict: 'slug',
      ignoreDuplicates: true, // Don't overwrite existing records
    })
    if (error) {
      console.error(`  FAIL batch ${i}-${i + batch.length}: ${error.message}`)
      fail += batch.length
    } else {
      ok += batch.length
    }
  }

  console.log(`\n  Inserted: ${ok}`)
  if (fail) console.log(`  Failed: ${fail}`)

  // 5. Verify final count
  const { count } = await sb.from('companies').select('id', { count: 'exact', head: true })
  console.log(`\n  Total companies in database: ${count}`)
  console.log('\n✓ Bulk seed complete!')
}

run().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
