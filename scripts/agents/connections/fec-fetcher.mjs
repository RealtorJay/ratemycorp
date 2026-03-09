import { CONFIG } from '../config.mjs'
import { createLimiter } from '../lib/rate-limiter.mjs'

const limiter = createLimiter({ maxPerSecond: 1 })

/**
 * Fetch campaign contributions for a candidate from the FEC API.
 * @param {string} candidateId - FEC candidate ID, e.g. "P80001571"
 * @param {string} [cycle] - Election cycle, e.g. "2024"
 * @param {number} [perPage=20]
 * @returns {Promise<Array>} - Raw contribution records
 */
export async function fetchContributions(candidateId, cycle = '2024', perPage = 20) {
  const { key, baseUrl } = CONFIG.apis.fec
  if (!key) {
    console.warn('[connections] FEC API key not configured')
    return []
  }

  await limiter.wait()

  const params = new URLSearchParams({
    api_key: key,
    candidate_id: candidateId,
    two_year_transaction_period: cycle,
    per_page: String(perPage),
    sort: '-contribution_receipt_amount',
    is_individual: 'false', // Committee/PAC contributions
  })

  try {
    const res = await fetch(
      `${baseUrl}/schedules/schedule_a/?${params}`,
      { signal: AbortSignal.timeout(15000) }
    )
    if (!res.ok) {
      console.warn(`[connections] FEC API ${res.status} for ${candidateId}`)
      return []
    }
    const json = await res.json()
    return json.results || []
  } catch (err) {
    console.warn(`[connections] FEC fetch failed for ${candidateId}:`, err.message)
    return []
  }
}

/**
 * Fetch top PAC/committee donors for a candidate.
 * @param {string} candidateId
 * @param {string} [cycle]
 * @returns {Promise<Array>}
 */
export async function fetchTopDonors(candidateId, cycle = '2024') {
  const { key, baseUrl } = CONFIG.apis.fec
  if (!key) return []

  await limiter.wait()

  const params = new URLSearchParams({
    api_key: key,
    candidate_id: candidateId,
    cycle: cycle,
    per_page: '20',
    sort: '-total',
  })

  try {
    const res = await fetch(
      `${baseUrl}/schedules/schedule_a/by_contributor/?${params}`,
      { signal: AbortSignal.timeout(15000) }
    )
    if (!res.ok) return []
    const json = await res.json()
    return json.results || []
  } catch (err) {
    console.warn(`[connections] Top donors fetch failed for ${candidateId}:`, err.message)
    return []
  }
}
