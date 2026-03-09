import { createClient } from '@supabase/supabase-js'
import { CONFIG } from '../config.mjs'

if (!CONFIG.supabase.url || !CONFIG.supabase.serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

/** Service-role client — bypasses RLS for automated data ingestion */
export const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.serviceKey)
