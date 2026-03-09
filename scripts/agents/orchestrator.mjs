import 'dotenv/config'
import cron from 'node-cron'
import { validateConfig, CONFIG } from './config.mjs'
import { runCongressAgent } from './congress/index.mjs'
import { runPromiseAgent } from './promises/index.mjs'
import { runCompanyAgent } from './companies/index.mjs'
import { runConnectionsAgent } from './connections/index.mjs'
import { runFinancialAgent } from './financial/index.mjs'
import { runModerationAgent } from './moderation/index.mjs'
import { runSummariesAgent } from './summaries/index.mjs'
import { runDiscoveryAgent } from './discovery/index.mjs'
import { runInsightsAgent } from './insights/index.mjs'

// ── Validate environment ──────────────────────────────────────────────────────
validateConfig()

// ── Agent registry ────────────────────────────────────────────────────────────
const AGENTS = {
  congress:    { fn: runCongressAgent,    schedule: CONFIG.schedule.congress },
  promises:    { fn: runPromiseAgent,     schedule: CONFIG.schedule.promises },
  companies:   { fn: runCompanyAgent,     schedule: CONFIG.schedule.companies },
  connections: { fn: runConnectionsAgent, schedule: CONFIG.schedule.connections },
  financial:   { fn: runFinancialAgent,   schedule: CONFIG.schedule.financial },
  moderation:  { fn: runModerationAgent,  schedule: CONFIG.schedule.moderation },
  summaries:   { fn: runSummariesAgent,   schedule: CONFIG.schedule.summaries },
  discovery:   { fn: runDiscoveryAgent,   schedule: CONFIG.schedule.discovery },
  insights:    { fn: runInsightsAgent,    schedule: CONFIG.schedule.insights },
}

/**
 * Safely run an agent — errors are logged but never crash the process.
 */
async function safeRun(name) {
  const start = Date.now()
  console.log(`\n${'='.repeat(60)}`)
  console.log(`[orchestrator] Starting ${name} agent at ${new Date().toISOString()}`)
  console.log(`${'='.repeat(60)}`)

  try {
    const stats = await AGENTS[name].fn()
    const elapsed = ((Date.now() - start) / 1000).toFixed(1)
    console.log(`[orchestrator] ${name} completed in ${elapsed}s — processed:${stats?.processed || 0} updated:${stats?.updated || 0}`)
  } catch (err) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1)
    console.error(`[orchestrator] ${name} FAILED after ${elapsed}s:`, err.message)
    // Do NOT re-throw — other agents should continue
  }
}

// ── CLI mode: run a single agent ──────────────────────────────────────────────
const manualAgent = process.argv[2]

if (manualAgent) {
  if (manualAgent === 'all') {
    // Run all agents sequentially
    console.log('[orchestrator] Running ALL agents sequentially...')
    for (const name of Object.keys(AGENTS)) {
      await safeRun(name)
    }
    console.log('\n[orchestrator] All agents complete.')
    process.exit(0)
  }

  if (!AGENTS[manualAgent]) {
    console.error(`Unknown agent: ${manualAgent}`)
    console.error(`Available agents: ${Object.keys(AGENTS).join(', ')}, all`)
    process.exit(1)
  }

  await safeRun(manualAgent)
  process.exit(0)
}

// ── Daemon mode: schedule all agents with cron ────────────────────────────────
console.log('[orchestrator] Starting in daemon mode...')
console.log('[orchestrator] Schedules:')
for (const [name, { schedule }] of Object.entries(AGENTS)) {
  console.log(`  ${name}: ${schedule}`)
  cron.schedule(schedule, () => safeRun(name))
}
console.log('[orchestrator] Waiting for scheduled runs. Press Ctrl+C to stop.\n')

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\n[orchestrator] Shutting down...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n[orchestrator] Received SIGTERM, shutting down...')
  process.exit(0)
})
