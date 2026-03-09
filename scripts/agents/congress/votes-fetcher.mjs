import { CONFIG } from '../config.mjs'
import { createLimiter } from '../lib/rate-limiter.mjs'

const limiter = createLimiter({ maxPerSecond: 2 })

/**
 * Fetch recent votes for a member from Congress.gov API.
 * @param {string} bioguideId - e.g. "M000355"
 * @param {number} [limit=20]
 * @returns {Promise<Array>} - Raw vote records
 */
export async function fetchVotes(bioguideId, limit = 20) {
  const { key, baseUrl } = CONFIG.apis.congressGov
  if (!key) return []

  await limiter.wait()

  const url = `${baseUrl}/member/${bioguideId}/votes?limit=${limit}&format=json&api_key=${key}`

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
    if (!res.ok) {
      console.warn(`[congress] Votes API ${res.status} for ${bioguideId}`)
      return []
    }
    const json = await res.json()
    return json.votes || []
  } catch (err) {
    console.warn(`[congress] Vote fetch failed for ${bioguideId}:`, err.message)
    return []
  }
}

/**
 * Transform a Congress.gov vote record into our DB schema.
 * @param {object} vote - Raw vote from API
 * @param {string} politicianId - UUID from our politicians table
 * @returns {object} - Row for votes table
 */
export function transformVote(vote, politicianId) {
  // Congress.gov vote structure varies; normalize what we can
  const rollCall = vote.rollCallNumber || vote.roll_call_number || null
  const voteDate = vote.date || vote.voteDate || null
  const chamber = vote.chamber?.toLowerCase() || null

  // Map Congress.gov position to our enum
  const positionMap = {
    'Yea': 'yea', 'Yes': 'yea', 'Aye': 'yea',
    'Nay': 'nay', 'No': 'nay',
    'Not Voting': 'not_voting',
    'Present': 'present',
  }
  const rawPosition = vote.memberVotes?.vote || vote.position || vote.vote || ''
  const position = positionMap[rawPosition] || 'not_voting'

  return {
    politician_id: politicianId,
    bill_id: vote.bill?.billId || vote.bill?.number || null,
    bill_title: vote.description || vote.bill?.title || vote.question || null,
    bill_number: vote.bill?.number || null,
    congress_number: vote.congress || null,
    vote_date: voteDate,
    chamber: chamber === 'senate' || chamber === 'house' ? chamber : null,
    vote_type: vote.category || vote.voteType || null,
    position,
    roll_call_number: rollCall ? Number(rollCall) : null,
    source_url: vote.url || `https://www.congress.gov/member/${vote.bioguideId || ''}`,
    external_vote_id: rollCall && voteDate
      ? `${chamber}-${voteDate}-${rollCall}`
      : null,
  }
}
