/**
 * Adds stock_ticker column to companies table and seeds tickers for known companies.
 * Run after the politicians schema is applied.
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing env vars: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY)

// Map of company slug → NYSE/NASDAQ ticker
const TICKERS = {
  'exxonmobil': 'XOM',
  'chevron': 'CVX',
  'shell': 'SHEL',
  'bp': 'BP',
  'amazon': 'AMZN',
  'meta': 'META',
  'alphabet': 'GOOGL',
  'microsoft': 'MSFT',
  'apple': 'AAPL',
  'tesla': 'TSLA',
  'walmart': 'WMT',
  'jpmorgan-chase': 'JPM',
  'goldman-sachs': 'GS',
  'bank-of-america': 'BAC',
  'wells-fargo': 'WFC',
  'citigroup': 'C',
  'morgan-stanley': 'MS',
  'pfizer': 'PFE',
  'johnson-johnson': 'JNJ',
  'mckesson': 'MCK',
  'bayer': 'BAYN.DE',
  'boeing': 'BA',
  '3m': 'MMM',
  'dupont': 'DD',
  'general-motors': 'GM',
  'ford-motor-company': 'F',
  'at-t': 'T',
  'verizon': 'VZ',
  'comcast': 'CMCSA',
  'nestle': 'NESN.SW',
  'tyson-foods': 'TSN',
  'lockheed-martin': 'LMT',
  'coca-cola': 'KO',
  'nike': 'NKE',
  'home-depot': 'HD',
  'cvs-health': 'CVS',
  'target': 'TGT',
  'costco-wholesale': 'COST',
  'starbucks': 'SBUX',
  'mcdonalds': 'MCD',
  'walt-disney': 'DIS',
  'philip-morris-international': 'PM',
  'altria-group': 'MO',
  'berkshire-hathaway': 'BRK-B',
  'caterpillar': 'CAT',
  'uber-technologies': 'UBER',
  'visa': 'V',
  'mastercard': 'MA',
  'paypal-holdings': 'PYPL',
  'dow': 'DOW',
  'cigna': 'CI',
  'elevance-health': 'ELV',
  'unitedhealth-group': 'UNH',
  'procter-gamble': 'PG',
}

async function main() {
  // First, get all companies and their slugs
  const { data: companies, error } = await sb
    .from('companies')
    .select('id, name, slug')

  if (error) { console.error('Error fetching companies:', error.message); return }

  console.log(`Found ${companies.length} companies. Attempting to update stock tickers...\n`)

  let updated = 0, skipped = 0

  for (const company of companies) {
    const slug = company.slug
    let ticker = TICKERS[slug]

    // If no exact slug match, try fuzzy match
    if (!ticker) {
      const slugWords = slug.replace(/-/g, ' ').toLowerCase()
      for (const [key, val] of Object.entries(TICKERS)) {
        const keyWords = key.replace(/-/g, ' ').toLowerCase()
        if (slugWords.includes(keyWords.split(' ')[0]) || keyWords.includes(slugWords.split(' ')[0])) {
          ticker = val
          break
        }
      }
    }

    if (!ticker) {
      console.log(`  SKIP (no ticker): ${company.name} (${slug})`)
      skipped++
      continue
    }

    const { error: updateError } = await sb
      .from('companies')
      .update({ stock_ticker: ticker })
      .eq('id', company.id)

    if (updateError) {
      // Column might not exist yet — that's OK, user needs to add it via SQL editor
      console.log(`  ERROR: ${company.name}: ${updateError.message}`)
      if (updateError.message.includes('column')) {
        console.log('\n⚠️  The stock_ticker column does not exist yet.')
        console.log('Please run this SQL in Supabase SQL Editor:')
        console.log('ALTER TABLE companies ADD COLUMN IF NOT EXISTS stock_ticker text;')
        console.log('ALTER TABLE companies ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true;')
        console.log('\nThen re-run this script.')
        return
      }
    } else {
      console.log(`  OK: ${company.name} → ${ticker}`)
      updated++
    }
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped`)
}

main()
