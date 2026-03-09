/**
 * Master seed script — seeds ALL politicians + deep data.
 * Run: node scripts/seed_all_politicians.mjs
 *
 * This script is idempotent (uses upsert on slug).
 * Run supabase_politicians.sql + supabase_politicians_v2.sql first.
 */
import { createClient } from '@supabase/supabase-js'
import { REPUBLICAN_SENATORS } from './data/republican_senators.mjs'
import { DEMOCRAT_SENATORS } from './data/democrat_senators.mjs'
import { HOUSE_MEMBERS } from './data/house_members.mjs'
import { GOVERNORS } from './data/governors.mjs'
import { EXECUTIVE } from './data/executive.mjs'
import { FORMER_OFFICIALS } from './data/former_officials.mjs'
import { EDUCATION, CAREER_HISTORY, FAMILY_CONNECTIONS, NET_WORTH, FINANCIAL_DISCLOSURES } from './data/backgrounds.mjs'
import { NEW_PROMISES, NEW_CONNECTIONS } from './data/new_promises.mjs'

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing env vars: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY)

// Combine all politician arrays — filter out duplicate slugs
const ALL_POLITICIANS = []
const seen = new Set()

for (const list of [EXECUTIVE, FORMER_OFFICIALS, REPUBLICAN_SENATORS, DEMOCRAT_SENATORS, HOUSE_MEMBERS, GOVERNORS]) {
  for (const p of list) {
    if (!seen.has(p.slug)) {
      seen.add(p.slug)
      ALL_POLITICIANS.push(p)
    }
  }
}

async function seedPoliticians() {
  console.log(`\n── Seeding ${ALL_POLITICIANS.length} politicians ──`)
  let ok = 0, fail = 0
  for (const p of ALL_POLITICIANS) {
    // Separate v2 fields that need to go into politicians table
    const row = { ...p }
    delete row.notes // Not a db column
    const { error } = await sb.from('politicians').upsert(row, { onConflict: 'slug' })
    if (error) { console.error(`  FAIL ${p.full_name}: ${error.message}`); fail++ }
    else { ok++ }
  }
  console.log(`  OK: ${ok}  FAIL: ${fail}`)
}

async function seedEducation() {
  console.log(`\n── Seeding ${EDUCATION.length} education records ──`)
  const { data: politicians } = await sb.from('politicians').select('id, slug')
  const map = Object.fromEntries((politicians || []).map(p => [p.slug, p.id]))

  let ok = 0, skip = 0
  for (const e of EDUCATION) {
    const pid = map[e.politician_slug]
    if (!pid) { skip++; continue }
    const { error } = await sb.from('politician_education').insert({
      politician_id: pid,
      institution: e.institution,
      degree: e.degree,
      field_of_study: e.field_of_study,
      start_year: e.start_year,
      end_year: e.end_year,
      honors: e.honors,
      notes: e.notes,
    })
    if (error && error.code !== '23505') console.error(`  FAIL edu for ${e.politician_slug}: ${error.message}`)
    else ok++
  }
  console.log(`  OK: ${ok}  SKIP: ${skip}`)
}

async function seedCareer() {
  console.log(`\n── Seeding ${CAREER_HISTORY.length} career records ──`)
  const { data: politicians } = await sb.from('politicians').select('id, slug')
  const map = Object.fromEntries((politicians || []).map(p => [p.slug, p.id]))

  let ok = 0, skip = 0
  for (const c of CAREER_HISTORY) {
    const pid = map[c.politician_slug]
    if (!pid) { skip++; continue }
    const { error } = await sb.from('politician_career_history').insert({
      politician_id: pid,
      position_title: c.position_title,
      organization: c.organization,
      sector: c.sector,
      start_date: c.start_date,
      end_date: c.end_date,
      is_current: c.is_current || false,
      description: c.description,
    })
    if (error && error.code !== '23505') console.error(`  FAIL career for ${c.politician_slug}: ${error.message}`)
    else ok++
  }
  console.log(`  OK: ${ok}  SKIP: ${skip}`)
}

async function seedFamily() {
  console.log(`\n── Seeding ${FAMILY_CONNECTIONS.length} family records ──`)
  const { data: politicians } = await sb.from('politicians').select('id, slug')
  const map = Object.fromEntries((politicians || []).map(p => [p.slug, p.id]))

  let ok = 0, skip = 0
  for (const f of FAMILY_CONNECTIONS) {
    const pid = map[f.politician_slug]
    if (!pid) { skip++; continue }
    const { error } = await sb.from('politician_family_connections').insert({
      politician_id: pid,
      relation_type: f.relation_type,
      relation_name: f.relation_name,
      occupation: f.occupation,
      employer: f.employer,
      relevant_holdings: f.relevant_holdings,
      notes: f.notes,
    })
    if (error && error.code !== '23505') console.error(`  FAIL family for ${f.politician_slug}: ${error.message}`)
    else ok++
  }
  console.log(`  OK: ${ok}  SKIP: ${skip}`)
}

async function seedNetWorth() {
  console.log(`\n── Seeding ${NET_WORTH.length} net worth records ──`)
  const { data: politicians } = await sb.from('politicians').select('id, slug')
  const map = Object.fromEntries((politicians || []).map(p => [p.slug, p.id]))

  let ok = 0, skip = 0
  for (const n of NET_WORTH) {
    const pid = map[n.politician_slug]
    if (!pid) { skip++; continue }
    const { error } = await sb.from('politician_net_worth').upsert({
      politician_id: pid,
      year: n.year,
      estimated_min: n.estimated_min,
      estimated_max: n.estimated_max,
      source: n.source,
    }, { onConflict: 'politician_id,year,source' })
    if (error) console.error(`  FAIL net worth for ${n.politician_slug}: ${error.message}`)
    else ok++
  }
  console.log(`  OK: ${ok}  SKIP: ${skip}`)
}

async function seedFinancialDisclosures() {
  console.log(`\n── Seeding ${FINANCIAL_DISCLOSURES.length} financial disclosures ──`)
  const { data: politicians } = await sb.from('politicians').select('id, slug')
  const map = Object.fromEntries((politicians || []).map(p => [p.slug, p.id]))

  let ok = 0, skip = 0
  for (const f of FINANCIAL_DISCLOSURES) {
    const pid = map[f.politician_slug]
    if (!pid) { skip++; continue }
    const { error } = await sb.from('politician_financial_disclosures').insert({
      politician_id: pid,
      disclosure_year: f.disclosure_year,
      filing_type: f.filing_type,
      asset_description: f.asset_description,
      transaction_type: f.transaction_type,
      transaction_date: f.transaction_date,
      asset_value_min: f.asset_value_min,
      asset_value_max: f.asset_value_max,
      income_type: f.income_type,
      income_amount_min: f.income_amount_min,
      income_amount_max: f.income_amount_max,
      source_type: f.source_type,
      notes: f.notes,
    })
    if (error && error.code !== '23505') console.error(`  FAIL disclosure for ${f.politician_slug}: ${error.message}`)
    else ok++
  }
  console.log(`  OK: ${ok}  SKIP: ${skip}`)
}

async function seedPromises() {
  console.log(`\n── Seeding ${NEW_PROMISES.length} promises ──`)
  const { data: politicians } = await sb.from('politicians').select('id, slug')
  const map = Object.fromEntries((politicians || []).map(p => [p.slug, p.id]))

  let ok = 0, skip = 0
  for (const p of NEW_PROMISES) {
    const pid = map[p.politician_slug]
    if (!pid) { skip++; console.log(`  SKIP promise: no politician ${p.politician_slug}`); continue }
    const { error } = await sb.from('political_promises').insert({
      politician_id: pid,
      category: p.category,
      promise_text: p.promise_text,
      source_type: p.source_type,
      status: p.status,
      verdict_notes: p.verdict_notes,
      is_verified: true,
    })
    if (error) console.error(`  FAIL promise for ${p.politician_slug}: ${error.message}`)
    else ok++
  }
  console.log(`  OK: ${ok}  SKIP: ${skip}`)
}

async function seedConnections() {
  console.log(`\n── Seeding ${NEW_CONNECTIONS.length} corporate connections ──`)
  const { data: politicians } = await sb.from('politicians').select('id, slug')
  const politicianMap = Object.fromEntries((politicians || []).map(p => [p.slug, p.id]))

  const { data: companies } = await sb.from('companies').select('id, name')
  const companyMap = {}
  for (const c of companies || []) {
    companyMap[c.name.toLowerCase()] = c.id
  }

  let ok = 0, skip = 0
  for (const c of NEW_CONNECTIONS) {
    const politicianId = politicianMap[c.politician_slug]
    if (!politicianId) { skip++; console.log(`  SKIP connection: no politician ${c.politician_slug}`); continue }

    // Find company by partial name match
    let companyId = null
    const targetName = c.company_name.toLowerCase()
    for (const [name, id] of Object.entries(companyMap)) {
      if (name.includes(targetName) || targetName.includes(name.split(' ')[0])) {
        companyId = id
        break
      }
    }
    if (!companyId) { skip++; console.log(`  SKIP connection: no company "${c.company_name}"`); continue }

    const { error } = await sb.from('politician_company_connections').upsert({
      politician_id: politicianId,
      company_id: companyId,
      connection_type: c.connection_type,
      amount_cents: c.amount_cents,
      amount_display: c.amount_display,
      cycle: c.cycle,
      description: c.description,
      source_url: c.source_url,
      source_type: c.source_type,
      is_verified: c.is_verified,
    }, { onConflict: 'politician_id,company_id,connection_type,source_url' })

    if (error) console.error(`  FAIL: ${c.politician_slug} → ${c.company_name}: ${error.message}`)
    else ok++
  }
  console.log(`  OK: ${ok}  SKIP: ${skip}`)
}

async function run() {
  console.log('╔══════════════════════════════════════════╗')
  console.log('║  RateMyCorps — Full Politician Seed      ║')
  console.log('╚══════════════════════════════════════════╝')

  await seedPoliticians()
  await seedEducation()
  await seedCareer()
  await seedFamily()
  await seedNetWorth()
  await seedFinancialDisclosures()
  await seedPromises()
  await seedConnections()

  console.log('\n✓ All done!')
}

run().catch(console.error)
