import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { REALESTATE_COMPANIES } from './data/companies_realestate.mjs'

try {
  const envFile = readFileSync(new URL('../.env', import.meta.url), 'utf8')
  for (const line of envFile.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match && !process.env[match[1].trim()]) {
      process.env[match[1].trim()] = match[2].trim()
    }
  }
} catch {}

const sb = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

let ok = 0, fail = 0
for (const c of REALESTATE_COMPANIES) {
  const row = {
    name: c.name, slug: c.slug, industry: c.industry, description: c.description,
    website: c.website, ceo_name: c.ceo_name, ceo_title: c.ceo_title || 'CEO',
    headquarters: c.headquarters, lobbying_spend: c.lobbying_spend,
    stock_ticker: c.stock_ticker,
    is_public: c.is_public !== undefined ? c.is_public : true,
  }
  const { error } = await sb.from('companies').upsert(row, { onConflict: 'slug' })
  if (error) { console.error('FAIL', c.name, error.message); fail++ }
  else ok++
}
console.log(`Real estate companies seeded: ${ok} ok, ${fail} failed`)

const { count } = await sb.from('companies').select('id', { count: 'exact', head: true })
console.log(`Total companies in database: ${count}`)
