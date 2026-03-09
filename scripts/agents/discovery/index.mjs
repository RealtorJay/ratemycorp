import { supabase } from '../lib/supabase.mjs'
import { createRun, completeRun } from '../lib/logger.mjs'
import { scanContent } from './scanner.mjs'
import { crossReference } from './cross-referencer.mjs'

const SCAN_BATCH_SIZE = 10

/**
 * Discovery Agent — scans reviews and forum posts for mentions of scandals,
 * lawsuits, and political ties. Cross-references against existing records.
 */
export async function runDiscoveryAgent() {
  const runId = await createRun('discovery')
  const stats = { processed: 0, updated: 0, failed: 0, errors: [] }

  try {
    // ── Fetch unscanned reviews ────────────────────────────────────────────
    const { data: reviews, error: revErr } = await supabase
      .from('reviews')
      .select('id, body, company_id, companies(name)')
      .is('ai_scanned_at', null)
      .limit(100)

    if (revErr) throw new Error(`Reviews fetch error: ${revErr.message}`)

    // ── Fetch unscanned forum posts ────────────────────────────────────────
    const { data: posts, error: postsErr } = await supabase
      .from('forum_posts')
      .select('id, title, body, company_id, companies(name)')
      .eq('status', 'approved')
      .is('ai_scanned_at', null)
      .limit(100)

    if (postsErr) throw new Error(`Posts fetch error: ${postsErr.message}`)

    console.log(`[discovery] Found ${reviews.length} reviews, ${posts.length} posts to scan`)

    // ── Build unified content list ─────────────────────────────────────────
    const items = [
      ...reviews.map(r => ({
        id: r.id,
        body: r.body,
        company_id: r.company_id,
        company_name: r.companies?.name || 'Unknown',
        source_type: 'review',
      })),
      ...posts.map(p => ({
        id: p.id,
        body: `${p.title}\n\n${p.body}`,
        company_id: p.company_id,
        company_name: p.companies?.name || 'Unknown',
        source_type: 'forum_post',
      })),
    ]

    // ── Scan in batches ────────────────────────────────────────────────────
    for (let i = 0; i < items.length; i += SCAN_BATCH_SIZE) {
      const batch = items.slice(i, i + SCAN_BATCH_SIZE)
      const scanItems = batch.map((item, j) => ({
        index: j,
        body: item.body,
        company_name: item.company_name,
      }))

      try {
        const { extractions } = await scanContent(scanItems)
        stats.processed += batch.length

        for (const extraction of extractions) {
          const sourceItem = batch[extraction.source_index]
          if (!sourceItem) continue

          // Cross-reference against existing scandals and connections
          const existingRecords = await fetchExistingRecords(sourceItem.company_id)
          const dupCheck = await crossReference(
            { ...extraction, company_name: sourceItem.company_name },
            existingRecords
          )

          const row = {
            company_id: sourceItem.company_id,
            discovery_type: extraction.type,
            title: extraction.title,
            description: extraction.description,
            confidence: extraction.confidence,
            source_type: sourceItem.source_type,
            source_id: sourceItem.id,
            status: dupCheck.is_duplicate ? 'duplicate' : 'pending',
            matched_existing: dupCheck.matched_id || null,
          }

          const { error: insertErr } = await supabase
            .from('ai_discoveries')
            .insert(row)

          if (insertErr) {
            console.warn(`[discovery] Insert error:`, insertErr.message)
          } else {
            stats.updated++
            console.log(`[discovery] ${dupCheck.is_duplicate ? 'DUPLICATE' : 'NEW'}: ${extraction.title} (${extraction.type}, confidence: ${extraction.confidence})`)
          }
        }

        // Mark batch items as scanned
        const reviewIds = batch.filter(b => b.source_type === 'review').map(b => b.id)
        const postIds = batch.filter(b => b.source_type === 'forum_post').map(b => b.id)

        if (reviewIds.length > 0) {
          await supabase
            .from('reviews')
            .update({ ai_scanned_at: new Date().toISOString() })
            .in('id', reviewIds)
        }
        if (postIds.length > 0) {
          await supabase
            .from('forum_posts')
            .update({ ai_scanned_at: new Date().toISOString() })
            .in('id', postIds)
        }
      } catch (err) {
        stats.failed += batch.length
        stats.errors.push({ entity: `batch_${i}`, error: err.message, timestamp: new Date().toISOString() })
        console.error(`[discovery] Batch error:`, err.message)
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

/**
 * Fetch existing scandals and connections for a company to cross-reference.
 */
async function fetchExistingRecords(companyId) {
  const records = []

  const { data: scandals } = await supabase
    .from('company_scandals')
    .select('id, title, description, type')
    .eq('company_id', companyId)

  if (scandals) records.push(...scandals)

  const { data: connections } = await supabase
    .from('politician_company_connections')
    .select('id, connection_type, description')
    .eq('company_id', companyId)

  if (connections) records.push(...connections)

  return records
}
