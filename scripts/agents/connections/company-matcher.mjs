import { supabase } from '../lib/supabase.mjs'

let _companies = null

/**
 * Load all companies from Supabase (cached for the duration of the run).
 * @returns {Promise<Array<{id: string, name: string, slug: string}>>}
 */
async function loadCompanies() {
  if (_companies) return _companies
  const { data, error } = await supabase
    .from('companies')
    .select('id, name, slug')
  if (error) {
    console.warn('[company-matcher] Failed to load companies:', error.message)
    return []
  }
  _companies = data || []
  return _companies
}

/** Reset the cache (call between workflow runs if needed) */
export function resetCache() {
  _companies = null
}

/**
 * Fuzzy-match a donor/organization name to a company in our database.
 * Uses normalized substring matching — good enough for PAC names like
 * "AMAZON.COM INC PAC" → "Amazon" or "EXXON MOBIL CORPORATION" → "ExxonMobil".
 *
 * @param {string} donorName - Raw name from FEC
 * @returns {Promise<{id: string, name: string}|null>}
 */
export async function matchCompany(donorName) {
  if (!donorName) return null

  const companies = await loadCompanies()
  const normalized = donorName.toLowerCase().replace(/[^a-z0-9\s]/g, '')

  // Try exact slug match first
  for (const co of companies) {
    const coNorm = co.name.toLowerCase().replace(/[^a-z0-9\s]/g, '')
    if (normalized.includes(coNorm) || coNorm.includes(normalized)) {
      return { id: co.id, name: co.name }
    }
  }

  // Try individual word matching (for cases like "WALMART INC" matching "Walmart")
  for (const co of companies) {
    const coWords = co.name.toLowerCase().split(/\s+/)
    // Match if the primary word (first significant word) is in the donor name
    const primaryWord = coWords.find(w => w.length > 3)
    if (primaryWord && normalized.includes(primaryWord)) {
      return { id: co.id, name: co.name }
    }
  }

  return null
}

/**
 * Format cents to display string.
 * @param {number} cents
 * @returns {string} e.g. "$1,250,000"
 */
export function formatAmount(cents) {
  if (!cents) return null
  const dollars = Math.round(cents / 100)
  return `$${dollars.toLocaleString('en-US')}`
}
