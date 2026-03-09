/**
 * Baseline Review Seeder — generates initial reviews for companies that have
 * zero reviews, so every company in the browse page shows some rating data.
 *
 * Uses industry-based rating profiles: e.g., Oil & Gas companies get lower
 * environmental scores, Banking gets lower ethical_business scores, etc.
 *
 * Run:
 *   node scripts/seed_baseline_reviews.mjs
 *
 * Options:
 *   --limit=500     Only process first N companies
 *   --dry-run       Preview without writing
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

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
  process.exit(1)
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY)
const args = process.argv.slice(2)
const LIMIT = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1]) || 0
const DRY_RUN = args.includes('--dry-run')

// Seed user IDs (must exist in profiles table — created by seed_all_companies.mjs)
const SEED_USERS = [
  '00000000-0000-0000-0000-000000000091',
  '00000000-0000-0000-0000-000000000092',
  '00000000-0000-0000-0000-000000000093',
]

// ── Industry Rating Profiles ────────────────────────────────────────────────
// Each profile defines [min, max] range for each rating category (1-5 scale)
// Reviews are randomly generated within these ranges
const DEFAULT_PROFILE = {
  overall: [2.5, 3.8],
  environmental: [2.5, 3.5],
  ethical_business: [2.5, 3.5],
  consumer_trust: [2.8, 3.8],
  scandals: [3.0, 4.0],
}

const INDUSTRY_PROFILES = {
  // Fossil fuels — low environmental
  'Oil & Gas': { overall: [1.8, 3.0], environmental: [1.2, 2.2], ethical_business: [2.0, 3.0], consumer_trust: [2.5, 3.5], scandals: [1.5, 2.8] },
  'Petroleum Refining': { overall: [1.8, 3.0], environmental: [1.2, 2.2], ethical_business: [2.0, 3.0], consumer_trust: [2.5, 3.5], scandals: [1.5, 2.8] },
  'Mining': { overall: [1.8, 3.0], environmental: [1.3, 2.5], ethical_business: [2.0, 3.0], consumer_trust: [2.5, 3.3], scandals: [1.5, 2.8] },

  // Finance — mixed
  'Banking': { overall: [2.2, 3.5], environmental: [2.8, 3.8], ethical_business: [2.0, 3.2], consumer_trust: [2.0, 3.2], scandals: [2.0, 3.0] },
  'Securities & Investments': { overall: [2.3, 3.5], environmental: [3.0, 4.0], ethical_business: [2.0, 3.0], consumer_trust: [2.2, 3.2], scandals: [2.0, 3.2] },
  'Insurance': { overall: [2.5, 3.5], environmental: [3.0, 4.0], ethical_business: [2.5, 3.5], consumer_trust: [2.0, 3.0], scandals: [2.5, 3.5] },
  'Investment Services': { overall: [2.5, 3.5], environmental: [3.0, 4.0], ethical_business: [2.2, 3.2], consumer_trust: [2.5, 3.5], scandals: [2.5, 3.5] },
  'Consumer Finance': { overall: [2.2, 3.2], environmental: [3.0, 4.0], ethical_business: [2.0, 3.0], consumer_trust: [1.8, 3.0], scandals: [2.0, 3.0] },

  // Tech — moderate-high, lower on privacy/ethics
  'Software': { overall: [3.0, 4.2], environmental: [3.2, 4.2], ethical_business: [2.5, 3.8], consumer_trust: [3.0, 4.0], scandals: [3.0, 4.0] },
  'Software & IT Services': { overall: [3.0, 4.2], environmental: [3.2, 4.2], ethical_business: [2.5, 3.8], consumer_trust: [3.0, 4.0], scandals: [3.0, 4.0] },
  'Cloud & Data Services': { overall: [3.0, 4.0], environmental: [2.8, 3.8], ethical_business: [2.5, 3.5], consumer_trust: [2.8, 3.8], scandals: [3.0, 4.0] },
  'Semiconductors': { overall: [3.0, 4.0], environmental: [2.5, 3.5], ethical_business: [3.0, 4.0], consumer_trust: [3.2, 4.2], scandals: [3.0, 4.0] },

  // Healthcare / Pharma — mixed, low on pricing ethics
  'Pharmaceuticals': { overall: [2.0, 3.5], environmental: [2.8, 3.8], ethical_business: [1.8, 3.0], consumer_trust: [2.0, 3.2], scandals: [1.5, 3.0] },
  'Biotechnology': { overall: [2.8, 4.0], environmental: [3.0, 4.0], ethical_business: [2.5, 3.8], consumer_trust: [2.8, 3.8], scandals: [2.8, 3.8] },
  'Healthcare': { overall: [2.5, 3.8], environmental: [3.0, 4.0], ethical_business: [2.2, 3.5], consumer_trust: [2.5, 3.5], scandals: [2.5, 3.5] },
  'Health Insurance': { overall: [1.8, 3.0], environmental: [3.0, 4.0], ethical_business: [1.5, 2.8], consumer_trust: [1.5, 2.8], scandals: [1.5, 2.8] },
  'Medical Devices': { overall: [3.0, 4.0], environmental: [3.0, 4.0], ethical_business: [2.8, 3.8], consumer_trust: [3.0, 4.0], scandals: [3.0, 3.8] },

  // Defense — low ethics and environmental
  'Aerospace & Defense': { overall: [2.0, 3.2], environmental: [1.8, 2.8], ethical_business: [2.0, 3.0], consumer_trust: [2.5, 3.5], scandals: [1.8, 3.0] },
  'Defense Electronics': { overall: [2.0, 3.2], environmental: [2.0, 3.0], ethical_business: [2.0, 3.0], consumer_trust: [2.5, 3.5], scandals: [2.0, 3.2] },

  // Tobacco
  'Tobacco': { overall: [1.2, 2.2], environmental: [1.5, 2.5], ethical_business: [1.0, 2.0], consumer_trust: [1.5, 2.5], scandals: [1.0, 2.0] },

  // Retail — higher consumer trust
  'Retail': { overall: [2.8, 4.0], environmental: [2.5, 3.5], ethical_business: [2.5, 3.5], consumer_trust: [3.0, 4.0], scandals: [3.0, 4.0] },
  'E-Commerce': { overall: [2.5, 3.8], environmental: [2.5, 3.5], ethical_business: [2.2, 3.2], consumer_trust: [2.8, 3.8], scandals: [2.5, 3.5] },
  'Restaurants': { overall: [2.8, 4.0], environmental: [2.5, 3.5], ethical_business: [2.5, 3.5], consumer_trust: [3.0, 4.2], scandals: [3.0, 4.0] },
  'Grocery': { overall: [3.0, 4.0], environmental: [2.5, 3.5], ethical_business: [2.8, 3.8], consumer_trust: [3.2, 4.2], scandals: [3.2, 4.0] },

  // Utilities
  'Utilities': { overall: [2.5, 3.5], environmental: [2.0, 3.2], ethical_business: [2.5, 3.5], consumer_trust: [2.5, 3.5], scandals: [2.5, 3.5] },
  'Electric Utilities': { overall: [2.5, 3.5], environmental: [2.0, 3.0], ethical_business: [2.5, 3.5], consumer_trust: [2.5, 3.5], scandals: [2.5, 3.5] },
  'Waste Management': { overall: [2.8, 3.8], environmental: [2.5, 3.5], ethical_business: [2.8, 3.8], consumer_trust: [3.0, 4.0], scandals: [3.0, 4.0] },

  // Telecoms
  'Telecommunications': { overall: [2.2, 3.5], environmental: [3.0, 4.0], ethical_business: [2.2, 3.2], consumer_trust: [2.0, 3.0], scandals: [2.2, 3.2] },
  'Telecom Services': { overall: [2.2, 3.5], environmental: [3.0, 4.0], ethical_business: [2.2, 3.2], consumer_trust: [2.0, 3.0], scandals: [2.2, 3.2] },

  // Real estate
  'Real Estate': { overall: [2.8, 3.8], environmental: [2.5, 3.5], ethical_business: [2.5, 3.5], consumer_trust: [2.8, 3.8], scandals: [3.0, 3.8] },
  'REITs': { overall: [2.8, 3.8], environmental: [2.5, 3.5], ethical_business: [2.5, 3.5], consumer_trust: [2.8, 3.8], scandals: [3.0, 3.8] },
}

function rand(min, max) {
  return Math.round((min + Math.random() * (max - min)) * 10) / 10
}

function clamp(val) {
  return Math.max(1, Math.min(5, Math.round(val)))
}

function generateReview(companyId, userId, profile) {
  const overall = clamp(rand(...profile.overall))
  const environmental = clamp(rand(...profile.environmental))
  const ethical_business = clamp(rand(...profile.ethical_business))
  const consumer_trust = clamp(rand(...profile.consumer_trust))
  const scandals = clamp(rand(...profile.scandals))

  return {
    company_id: companyId,
    user_id: userId,
    headline: 'Community assessment',
    body: 'Baseline rating based on publicly available company data and industry analysis.',
    overall,
    environmental,
    ethical_business,
    consumer_trust,
    scandals,
  }
}

async function run() {
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║  RateMyCorps — Baseline Review Seeder                   ║')
  console.log('╚══════════════════════════════════════════════════════════╝')
  if (DRY_RUN) console.log('  (DRY RUN — no database writes)')

  // 1. Ensure seed profiles exist
  for (const uid of SEED_USERS) {
    if (!DRY_RUN) {
      await sb.from('profiles').upsert({
        id: uid,
        display_name: 'RateMyCorps Research',
        created_at: new Date().toISOString(),
      }, { onConflict: 'id' })
    }
  }

  // 2. Get companies with zero reviews
  let query = sb.from('companies')
    .select('id, name, slug, industry, review_count')
    .eq('review_count', 0)
    .order('name')
  if (LIMIT) query = query.limit(LIMIT)

  const { data: companies, error } = await query
  if (error) { console.error('DB error:', error.message); process.exit(1) }

  console.log(`\n  Found ${companies.length} companies with 0 reviews`)
  if (companies.length === 0) { console.log('  Nothing to do!'); return }

  // 3. Generate and insert reviews
  let created = 0, failed = 0
  const BATCH = 200

  // Collect all reviews first
  const allReviews = []
  for (const company of companies) {
    const profile = INDUSTRY_PROFILES[company.industry] || DEFAULT_PROFILE

    // Create 1-3 reviews per company from different seed users
    const reviewCount = 1 + Math.floor(Math.random() * SEED_USERS.length)
    for (let r = 0; r < reviewCount; r++) {
      allReviews.push(generateReview(company.id, SEED_USERS[r], profile))
    }
  }

  console.log(`  Generated ${allReviews.length} reviews for ${companies.length} companies`)

  if (DRY_RUN) {
    // Show sample
    const byIndustry = {}
    for (const c of companies) {
      byIndustry[c.industry] = (byIndustry[c.industry] || 0) + 1
    }
    console.log('\n  Industry breakdown:')
    Object.entries(byIndustry)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .forEach(([ind, count]) => console.log(`    ${ind}: ${count}`))

    console.log('\n  Sample reviews:')
    allReviews.slice(0, 5).forEach(r => {
      const c = companies.find(c => c.id === r.company_id)
      console.log(`    ${c?.name}: overall=${r.overall} env=${r.environmental} eth=${r.ethical_business} trust=${r.consumer_trust} scandals=${r.scandals}`)
    })
    console.log('\n  (dry run complete)')
    return
  }

  // Insert in batches
  for (let i = 0; i < allReviews.length; i += BATCH) {
    const batch = allReviews.slice(i, i + BATCH)
    const { error } = await sb.from('reviews').upsert(batch, {
      onConflict: 'company_id,user_id',
      ignoreDuplicates: true,
    })
    if (error) {
      console.error(`  FAIL batch ${i}: ${error.message}`)
      failed += batch.length
    } else {
      created += batch.length
    }
  }

  console.log(`\n  Reviews created: ${created}`)
  if (failed) console.log(`  Failed: ${failed}`)

  // 4. Verify
  const { count: totalWithReviews } = await sb
    .from('companies')
    .select('id', { count: 'exact', head: true })
    .gt('review_count', 0)
  const { count: total } = await sb.from('companies').select('id', { count: 'exact', head: true })

  console.log(`\n  Companies with reviews: ${totalWithReviews}/${total} (${((totalWithReviews / total) * 100).toFixed(1)}%)`)
  console.log('\n✓ Baseline seeding complete!')
}

run().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
