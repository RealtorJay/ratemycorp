import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { REALESTATE_COMPANIES } from './scripts/data/companies_realestate.mjs';

const env = readFileSync('.env','utf8');
const vars = {};
env.split('\n').forEach(l => { const m = l.match(/^([^#=]+)=(.*)$/); if(m) vars[m[1].trim()] = m[2].trim(); });

const sb = createClient(vars.VITE_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY);

let ok=0, fail=0;
for (const c of REALESTATE_COMPANIES) {
  const { error } = await sb.from('companies').upsert({
    name: c.name, slug: c.slug, industry: c.industry, description: c.description,
    website: c.website, ceo_name: c.ceo_name, ceo_title: c.ceo_title || 'CEO',
    headquarters: c.headquarters, lobbying_spend: c.lobbying_spend,
    stock_ticker: c.stock_ticker, is_public: c.is_public !== undefined ? c.is_public : true,
    founded_year: c.founded_year, market_cap: c.market_cap,
  }, { onConflict: 'slug' });
  if (error) { console.error('FAIL', c.name, error.message); fail++; }
  else ok++;
}
console.log('Real estate companies seeded:', ok, 'ok,', fail, 'failed');

const { count } = await sb.from('companies').select('id', { count: 'exact', head: true });
console.log('Total companies in database:', count);
