/**
 * Intel Items Seeder — populates the intel_items table with curated
 * social media posts, news articles, and research reports for companies.
 *
 * Prerequisite: Run supabase_intel_migration.sql first.
 *
 * Run:
 *   node scripts/seed_intel_items.mjs
 *
 * Options:
 *   --dry-run    Preview without writing
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { INTEL_ITEMS } from './data/intel_items.mjs'

// Load .env
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
const DRY_RUN = process.argv.includes('--dry-run')

async function run() {
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║  RateMyCorps — Intel Items Seeder                       ║')
  console.log('╚══════════════════════════════════════════════════════════╝')
  if (DRY_RUN) console.log('  (DRY RUN — no database writes)')

  // 1. Resolve company slugs → IDs
  const slugs = [...new Set(INTEL_ITEMS.map(i => i.company_slug))]
  console.log(`\n  Resolving ${slugs.length} company slugs…`)

  const { data: companies, error: coErr } = await sb
    .from('companies')
    .select('id, slug')
    .in('slug', slugs)

  if (coErr) { console.error('DB error:', coErr.message); process.exit(1) }

  const slugToId = {}
  for (const c of companies) slugToId[c.slug] = c.id

  const missing = slugs.filter(s => !slugToId[s])
  if (missing.length) {
    console.log(`  ⚠ Missing companies (skipping): ${missing.join(', ')}`)
  }
  console.log(`  Matched ${Object.keys(slugToId).length}/${slugs.length} companies`)

  // 2. Build insert rows
  const rows = []
  for (const item of INTEL_ITEMS) {
    const companyId = slugToId[item.company_slug]
    if (!companyId) continue

    rows.push({
      company_id: companyId,
      item_type: item.item_type,
      subject_type: item.subject_type || 'company',
      title: item.title || null,
      body: item.body || null,
      embed_url: item.embed_url || null,
      source_url: item.source_url || null,
      source_name: item.source_name || null,
      category: item.category || 'other',
      tags: item.tags || [],
      published_at: item.published_at || null,
      is_pinned: item.is_pinned || false,
      status: 'approved',  // seed data is pre-approved
    })
  }

  console.log(`  Prepared ${rows.length} intel items`)

  if (DRY_RUN) {
    // Show breakdown
    const byType = {}
    const bySubject = {}
    for (const r of rows) {
      byType[r.item_type] = (byType[r.item_type] || 0) + 1
      bySubject[r.subject_type] = (bySubject[r.subject_type] || 0) + 1
    }
    console.log('\n  By type:')
    Object.entries(byType).sort((a, b) => b[1] - a[1]).forEach(([t, c]) => console.log(`    ${t}: ${c}`))
    console.log('\n  By subject:')
    Object.entries(bySubject).sort((a, b) => b[1] - a[1]).forEach(([t, c]) => console.log(`    ${t}: ${c}`))
    console.log('\n  (dry run complete)')
    return
  }

  // 3. Insert in batches
  const BATCH = 50
  let created = 0, failed = 0

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { error } = await sb.from('intel_items').insert(batch)
    if (error) {
      console.error(`  FAIL batch ${i}: ${error.message}`)
      failed += batch.length
    } else {
      created += batch.length
    }
  }

  console.log(`\n  Intel items created: ${created}`)
  if (failed) console.log(`  Failed: ${failed}`)

  // 4. Verify
  const { count } = await sb
    .from('intel_items')
    .select('id', { count: 'exact', head: true })
  console.log(`  Total intel items in DB: ${count}`)
  console.log('\n✓ Intel seeding complete!')
}

run().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
