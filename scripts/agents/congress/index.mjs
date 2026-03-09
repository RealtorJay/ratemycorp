import { supabase } from '../lib/supabase.mjs'
import { createRun, completeRun } from '../lib/logger.mjs'
import { fetchVotes, transformVote } from './votes-fetcher.mjs'
import { fetchLegislation, transformLegislation } from './legislation-fetcher.mjs'
import { classifyBill } from './bill-classifier.mjs'

/**
 * Congress Agent — fetches recent votes and legislation for all tracked politicians.
 * Runs every 6 hours. Upserts data idempotently.
 */
export async function runCongressAgent() {
  const runId = await createRun('congress')
  const stats = { processed: 0, updated: 0, failed: 0, errors: [] }

  try {
    // Fetch all politicians with bioguide_id (i.e. members of Congress)
    const { data: politicians, error } = await supabase
      .from('politicians')
      .select('id, bioguide_id, full_name, chamber')
      .not('bioguide_id', 'is', null)

    if (error) throw new Error(`Failed to fetch politicians: ${error.message}`)

    console.log(`[congress] Processing ${politicians.length} politicians...`)

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
        console.error(`[congress] Error processing ${pol.full_name}:`, err.message)
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
  // --- Votes ---
  const rawVotes = await fetchVotes(pol.bioguide_id)
  if (rawVotes.length > 0) {
    const voteRows = rawVotes.map(v => transformVote(v, pol.id))
    const validVotes = voteRows.filter(v => v.external_vote_id)

    if (validVotes.length > 0) {
      const { error } = await supabase
        .from('votes')
        .upsert(validVotes, {
          onConflict: 'external_vote_id',
          ignoreDuplicates: true,
        })

      if (error) {
        console.warn(`[congress] Vote upsert error for ${pol.full_name}:`, error.message)
      } else {
        stats.updated += validVotes.length
      }
    }
  }

  // --- Legislation ---
  const rawBills = await fetchLegislation(pol.bioguide_id)
  if (rawBills.length > 0) {
    const billRows = []

    for (const bill of rawBills) {
      const row = transformLegislation(bill, pol.id)
      if (!row.external_bill_id) continue

      // Check if we already have this bill — skip AI classification if so
      const { data: existing } = await supabase
        .from('legislation')
        .select('id, category')
        .eq('external_bill_id', row.external_bill_id)
        .single()

      if (!existing) {
        // New bill — classify with AI
        const { category, description } = await classifyBill(
          row.bill_title,
          row.bill_number,
          row.summary
        )
        row.category = category
        if (description) row.summary = description
      } else {
        // Existing bill — just update status if changed
        row.category = existing.category
      }

      billRows.push(row)
    }

    if (billRows.length > 0) {
      const { error } = await supabase
        .from('legislation')
        .upsert(billRows, {
          onConflict: 'external_bill_id',
        })

      if (error) {
        console.warn(`[congress] Legislation upsert error for ${pol.full_name}:`, error.message)
      } else {
        stats.updated += billRows.length
      }
    }
  }

  console.log(`[congress] ${pol.full_name}: ${rawVotes.length} votes, ${rawBills.length} bills`)
}
