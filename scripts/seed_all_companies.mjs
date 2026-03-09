/**
 * Master seed script — seeds ALL companies + deep data (scandals, reviews, CEOs, etc.).
 * Run: node scripts/seed_all_companies.mjs
 *
 * This script is idempotent (uses upsert on slug).
 * Run supabase_data_expansion_migration.sql first.
 */
import { createClient } from '@supabase/supabase-js'
import { TECH_COMPANIES } from './data/companies_tech.mjs'
import { FINANCE_COMPANIES } from './data/companies_finance.mjs'
import { PHARMA_COMPANIES } from './data/companies_pharma.mjs'
import { DEFENSE_COMPANIES } from './data/companies_defense.mjs'
import { ENERGY_COMPANIES } from './data/companies_energy.mjs'
import { FOOD_COMPANIES } from './data/companies_food.mjs'
import { CONTROVERSIAL_COMPANIES } from './data/companies_controversial.mjs'
import { RETAIL_COMPANIES } from './data/companies_retail.mjs'
import { PLATFORM_COMPANIES } from './data/companies_platforms.mjs'
import { MISC_COMPANIES } from './data/companies_misc.mjs'
import { REALESTATE_COMPANIES } from './data/companies_realestate.mjs'
import { COMPANY_SCANDALS } from './data/company_scandals.mjs'
import { REVIEWS_ENVIRONMENTAL, REVIEWS_LABOR, REVIEWS_LEGAL, REVIEWS_CONSUMER, REVIEWS_LOBBYING } from './data/company_reviews.mjs'

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing env vars: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY)

// Seed user IDs for multi-angle reviews
const SEED_USERS = {
  environmental: '00000000-0000-0000-0000-000000000091',
  labor: '00000000-0000-0000-0000-000000000092',
  legal: '00000000-0000-0000-0000-000000000093',
  consumer: '00000000-0000-0000-0000-000000000094',
  lobbying: '00000000-0000-0000-0000-000000000095',
}

// Combine all company arrays — deduplicate by slug
const ALL_COMPANIES = []
const seen = new Set()

for (const list of [
  TECH_COMPANIES, FINANCE_COMPANIES, PHARMA_COMPANIES, DEFENSE_COMPANIES,
  ENERGY_COMPANIES, FOOD_COMPANIES, CONTROVERSIAL_COMPANIES, RETAIL_COMPANIES,
  PLATFORM_COMPANIES, MISC_COMPANIES, REALESTATE_COMPANIES
]) {
  for (const c of list) {
    if (!seen.has(c.slug)) {
      seen.add(c.slug)
      ALL_COMPANIES.push(c)
    }
  }
}

async function seedCompanies() {
  console.log(`\n── Seeding ${ALL_COMPANIES.length} companies ──`)
  let ok = 0, fail = 0
  for (const c of ALL_COMPANIES) {
    const { error } = await sb.from('companies').upsert({
      name: c.name,
      slug: c.slug,
      industry: c.industry,
      description: c.description,
      website: c.website,
      ceo_name: c.ceo_name,
      ceo_title: c.ceo_title || 'CEO',
      headquarters: c.headquarters,
      lobbying_spend: c.lobbying_spend,
      stock_ticker: c.stock_ticker,
      is_public: c.is_public !== undefined ? c.is_public : true,
      founded_year: c.founded_year,
      market_cap: c.market_cap,
    }, { onConflict: 'slug' })
    if (error) { console.error(`  FAIL ${c.name}: ${error.message}`); fail++ }
    else { ok++ }
  }
  console.log(`  OK: ${ok}  FAIL: ${fail}`)
}

async function seedScandals() {
  console.log(`\n── Seeding ${COMPANY_SCANDALS.length} scandal records ──`)
  const { data: companies } = await sb.from('companies').select('id, slug')
  const map = Object.fromEntries((companies || []).map(c => [c.slug, c.id]))

  let ok = 0, skip = 0
  for (const s of COMPANY_SCANDALS) {
    const companyId = map[s.company_slug]
    if (!companyId) { skip++; console.log(`  SKIP scandal: no company ${s.company_slug}`); continue }

    const { error } = await sb.from('company_scandals').insert({
      company_id: companyId,
      title: s.title,
      description: s.description,
      scandal_type: s.scandal_type,
      severity: s.severity,
      date_started: s.date_started,
      date_resolved: s.date_resolved,
      is_ongoing: s.is_ongoing || false,
      fine_amount_cents: s.fine_amount_cents,
      fine_amount_display: s.fine_amount_display,
      settlement_amount_cents: s.settlement_amount_cents,
      settlement_amount_display: s.settlement_amount_display,
      agency_involved: s.agency_involved,
      outcome: s.outcome,
      source_urls: s.source_urls || [],
    })
    if (error && error.code !== '23505') console.error(`  FAIL scandal for ${s.company_slug}: ${error.message}`)
    else ok++
  }
  console.log(`  OK: ${ok}  SKIP: ${skip}`)
}

async function seedReviews() {
  const reviewSets = [
    { label: 'Environmental', userId: SEED_USERS.environmental, data: REVIEWS_ENVIRONMENTAL },
    { label: 'Labor', userId: SEED_USERS.labor, data: REVIEWS_LABOR },
    { label: 'Legal', userId: SEED_USERS.legal, data: REVIEWS_LEGAL },
    { label: 'Consumer', userId: SEED_USERS.consumer, data: REVIEWS_CONSUMER },
    { label: 'Lobbying', userId: SEED_USERS.lobbying, data: REVIEWS_LOBBYING },
  ]

  const { data: companies } = await sb.from('companies').select('id, slug')
  const map = Object.fromEntries((companies || []).map(c => [c.slug, c.id]))

  for (const { label, userId, data } of reviewSets) {
    console.log(`\n── Seeding ${data.length} ${label} reviews ──`)
    let ok = 0, skip = 0
    for (const r of data) {
      const companyId = map[r.company_slug]
      if (!companyId) { skip++; continue }

      const { error } = await sb.from('reviews').insert({
        company_id: companyId,
        user_id: userId,
        headline: r.headline,
        body: r.body,
        overall: r.overall,
        environmental: r.environmental,
        ethical_business: r.ethical_business,
        consumer_trust: r.consumer_trust,
        scandals: r.scandals,
        sources: r.sources,
      })
      if (error && error.code !== '23505') console.error(`  FAIL review for ${r.company_slug}: ${error.message}`)
      else ok++
    }
    console.log(`  OK: ${ok}  SKIP: ${skip}`)
  }
}

async function run() {
  console.log('╔══════════════════════════════════════════╗')
  console.log('║  RateMyCorps — Full Company Seed          ║')
  console.log('╚══════════════════════════════════════════╝')

  await seedCompanies()
  await seedScandals()
  await seedReviews()

  console.log('\n✓ All done!')
}

run().catch(console.error)
