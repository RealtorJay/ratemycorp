import 'dotenv/config'

export const CONFIG = {
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    models: {
      fast: 'claude-haiku-4-5-20251001',
      smart: 'claude-sonnet-4-6-20250514',
    },
  },
  apis: {
    congressGov: {
      key: process.env.CONGRESS_GOV_API_KEY,
      baseUrl: 'https://api.congress.gov/v3',
    },
    fec: {
      key: process.env.FEC_API_KEY,
      baseUrl: 'https://api.open.fec.gov/v1',
    },
    googleSearch: {
      key: process.env.GOOGLE_SEARCH_API_KEY,
      cx: process.env.GOOGLE_SEARCH_CX,
      baseUrl: 'https://www.googleapis.com/customsearch/v1',
    },
  },
  schedule: {
    congress:    '0 */6 * * *',       // Every 6 hours
    promises:    '0 */12 * * *',      // Every 12 hours
    companies:   '0 */6 * * *',       // Every 6 hours
    connections: '0 4 * * *',         // Daily at 4 AM UTC
    financial:   '0 14,20 * * 1-5',   // 10 AM & 4 PM ET (UTC+4), weekdays
  },
}

// Validate required env vars
const REQUIRED = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'ANTHROPIC_API_KEY']

export function validateConfig() {
  const missing = REQUIRED.filter(k => !process.env[k])
  if (missing.length) {
    console.error(`Missing required env vars: ${missing.join(', ')}`)
    console.error('Copy .env.example to .env and fill in your keys.')
    process.exit(1)
  }
}
