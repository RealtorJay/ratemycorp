import { supabase } from './supabase.mjs'
import { getUsage, estimateCostCents, resetUsage } from './anthropic.mjs'

/**
 * Create a new workflow run record.
 * @param {string} agentName - e.g. 'congress', 'promises'
 * @returns {Promise<string>} - The run ID (uuid)
 */
export async function createRun(agentName) {
  resetUsage()
  const { data, error } = await supabase
    .from('workflow_runs')
    .insert({ agent_name: agentName, status: 'running' })
    .select('id')
    .single()

  if (error) {
    console.error(`[logger] Failed to create run for ${agentName}:`, error.message)
    return null
  }
  console.log(`[${agentName}] Run started: ${data.id}`)
  return data.id
}

/**
 * Complete a workflow run with results.
 * @param {string} runId
 * @param {'completed'|'failed'|'partial'} status
 * @param {object} stats - { processed, updated, failed, errors }
 */
export async function completeRun(runId, status, stats = {}) {
  if (!runId) return

  const update = {
    status,
    completed_at: new Date().toISOString(),
    entities_processed: stats.processed || 0,
    entities_updated: stats.updated || 0,
    entities_failed: stats.failed || 0,
    error_log: stats.errors?.length ? stats.errors : null,
    ai_tokens_used: getUsage(),
    cost_estimate_cents: estimateCostCents(),
    metadata: stats.metadata || null,
  }

  const { error } = await supabase
    .from('workflow_runs')
    .update(update)
    .eq('id', runId)

  if (error) {
    console.error(`[logger] Failed to update run ${runId}:`, error.message)
  } else {
    console.log(`[run:${runId}] ${status} — processed:${update.entities_processed} updated:${update.entities_updated} failed:${update.entities_failed} cost:${update.cost_estimate_cents}¢`)
  }
}
