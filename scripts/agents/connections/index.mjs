import { supabase } from '../lib/supabase.mjs'
import { createRun, completeRun } from '../lib/logger.mjs'
import { fetchContributions, fetchTopDonors } from './fec-fetcher.mjs'
import { matchCompany, formatAmount, resetCache } from './company-matcher.mjs'

/**
 * Connections Agent — discovers campaign finance links between
 * politicians and companies via FEC data.
 * Runs daily at 4 AM UTC.
 */
export async function runConnectionsAgent() {
  const runId = await createRun('connections')
  const stats = { processed: 0, updated: 0, failed: 0, errors: [] }
  resetCache()

  try {
    // Fetch politicians with FEC candidate IDs
    const { data: politicians, error } = await supabase
      .from('politicians')
      .select('id, full_name, fec_candidate_id')
      .not('fec_candidate_id', 'is', null)

    if (error) throw new Error(`Failed to fetch politicians: ${error.message}`)

    console.log(`[connections] Processing ${politicians.length} politicians with FEC IDs...`)

    for (const pol of politicians) {
      stats.processed++
      try {
        await processPolitician(pol, stats)
      } catch (err) {
        stats.failed++
        stats.errors.push({
          entity: pol.full_name,
          error: err.message,
          timestamp: new Date().toISOString(),
        })
        console.error(`[connections] Error for ${pol.full_name}:`, err.message)
      }
    }

    await completeRun(runId, stats.failed > 0 ? 'partial' : 'completed', stats)
  } catch (err) {
    stats.errors.push({ entity: 'agent', error: err.message, timestamp: new Date().toISOString() })
    await completeRun(runId, 'failed', stats)
    throw err
  }

  return stats
}

async function processPolitician(pol, stats) {
  // Fetch top committee/PAC contributors
  const donors = await fetchTopDonors(pol.fec_candidate_id)
  let matched = 0

  for (const donor of donors) {
    const donorName = donor.contributor_name || donor.committee_name || ''
    const company = await matchCompany(donorName)
    if (!company) continue

    const amountCents = donor.total ? Math.round(donor.total * 100) : null
    const cycle = donor.cycle || '2024'

    const { error } = await supabase
      .from('politician_company_connections')
      .upsert({
        politician_id: pol.id,
        company_id: company.id,
        connection_type: donor.committee_type === 'S'
          ? 'super_pac'
          : donor.committee_type === 'N'
            ? 'industry_pac'
            : 'campaign_donation',
        amount_cents: amountCents,
        amount_display: formatAmount(amountCents),
        cycle,
        description: `${donorName} contributed to ${pol.full_name}'s campaign (${cycle} cycle)`,
        source_url: `https://www.fec.gov/data/receipts/?committee_id=${donor.committee_id || ''}&candidate_id=${pol.fec_candidate_id}`,
        source_type: 'fec_filing',
        is_verified: true,
      }, {
        onConflict: 'politician_id,company_id,connection_type,source_url',
      })

    if (!error) {
      matched++
      stats.updated++
    }
  }

  if (matched > 0) {
    console.log(`[connections] ${pol.full_name}: ${matched} company connections found`)
  }
}
