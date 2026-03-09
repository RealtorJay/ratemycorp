import { CONFIG } from '../config.mjs'
import { createLimiter } from '../lib/rate-limiter.mjs'

const limiter = createLimiter({ maxPerSecond: 2 })

/**
 * Fetch recently sponsored legislation for a member from Congress.gov API.
 * @param {string} bioguideId
 * @param {number} [limit=20]
 * @returns {Promise<Array>}
 */
export async function fetchLegislation(bioguideId, limit = 20) {
  const { key, baseUrl } = CONFIG.apis.congressGov
  if (!key) return []

  await limiter.wait()

  const url = `${baseUrl}/member/${bioguideId}/sponsored-legislation?limit=${limit}&format=json&api_key=${key}`

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
    if (!res.ok) {
      console.warn(`[congress] Legislation API ${res.status} for ${bioguideId}`)
      return []
    }
    const json = await res.json()
    return json.sponsoredLegislation || []
  } catch (err) {
    console.warn(`[congress] Legislation fetch failed for ${bioguideId}:`, err.message)
    return []
  }
}

/**
 * Transform a Congress.gov legislation record into our DB schema.
 * @param {object} bill - Raw bill from API
 * @param {string} politicianId
 * @returns {object} - Row for legislation table
 */
export function transformLegislation(bill, politicianId) {
  // Map Congress.gov action status to our status enum
  const statusMap = {
    'Introduced': 'introduced',
    'Referred to Committee': 'committee',
    'Reported by Committee': 'committee',
    'Passed House': 'passed_chamber',
    'Passed Senate': 'passed_chamber',
    'Passed Both': 'passed_both',
    'Became Law': 'signed',
    'Signed by President': 'signed',
    'Vetoed': 'vetoed',
  }

  const latestAction = bill.latestAction || {}
  const rawStatus = latestAction.text || ''
  let status = 'introduced'
  for (const [pattern, mapped] of Object.entries(statusMap)) {
    if (rawStatus.includes(pattern)) {
      status = mapped
      break
    }
  }

  const billNumber = bill.number
    ? `${bill.type || ''}${bill.number}`
    : bill.billNumber || ''

  return {
    politician_id: politicianId,
    bill_number: billNumber,
    bill_title: bill.title || '',
    congress_number: bill.congress || null,
    introduced_date: bill.introducedDate || null,
    last_action_date: latestAction.actionDate || null,
    status,
    role: 'sponsor',
    summary: bill.policyArea?.name || null,
    source_url: bill.url || `https://www.congress.gov/bill/${bill.congress}th-congress/${(bill.type || '').toLowerCase()}-bill/${bill.number}`,
    external_bill_id: bill.congress && billNumber
      ? `${bill.congress}-${billNumber}`
      : null,
  }
}
