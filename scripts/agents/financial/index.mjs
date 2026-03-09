import { supabase } from '../lib/supabase.mjs'
import { createRun, completeRun } from '../lib/logger.mjs'
import { fetchStockData } from './stock-fetcher.mjs'
import { fetchStockActTrades } from './stock-act-fetcher.mjs'

/**
 * Financial Agent — fetches stock snapshots for public companies
 * and tracks congressional stock trades.
 * Runs at 10 AM & 4 PM ET on weekdays.
 */
export async function runFinancialAgent() {
  const runId = await createRun('financial')
  const stats = { processed: 0, updated: 0, failed: 0, errors: [] }

  try {
    // --- Stock Snapshots ---
    await fetchStockSnapshots(stats)

    // --- Congressional Stock Trades ---
    await processStockActTrades(stats)

    await completeRun(runId, stats.failed > 0 ? 'partial' : 'completed', stats)
  } catch (err) {
    stats.errors.push({ entity: 'agent', error: err.message, timestamp: new Date().toISOString() })
    await completeRun(runId, 'failed', stats)
    throw err
  }

  return stats
}

async function fetchStockSnapshots(stats) {
  // Fetch all public companies with stock tickers
  const { data: companies, error } = await supabase
    .from('companies')
    .select('id, name, stock_ticker')
    .not('stock_ticker', 'is', null)
    .eq('is_public', true)

  if (error) {
    stats.errors.push({ entity: 'fetch_companies', error: error.message })
    return
  }

  console.log(`[financial] Fetching stock data for ${companies.length} companies...`)

  for (const co of companies) {
    stats.processed++
    try {
      const data = await fetchStockData(co.stock_ticker)
      if (!data) continue

      const { error: upsertErr } = await supabase
        .from('stock_snapshots')
        .upsert({
          company_id: co.id,
          ticker: co.stock_ticker,
          snapshot_date: data.date,
          open_price: data.open,
          close_price: data.close,
          high_price: data.high,
          low_price: data.low,
          volume: data.volume,
          market_cap: data.marketCap,
        }, {
          onConflict: 'company_id,snapshot_date',
        })

      if (upsertErr) {
        console.warn(`[financial] Upsert error for ${co.stock_ticker}:`, upsertErr.message)
        stats.failed++
      } else {
        stats.updated++
      }
    } catch (err) {
      stats.failed++
      stats.errors.push({
        entity: co.stock_ticker,
        error: err.message,
        timestamp: new Date().toISOString(),
      })
    }
  }

  console.log(`[financial] Stock snapshots: ${stats.updated} updated, ${stats.failed} failed`)
}

async function processStockActTrades(stats) {
  const trades = await fetchStockActTrades()
  if (trades.length === 0) return

  console.log(`[financial] Found ${trades.length} potential STOCK Act trades`)

  for (const trade of trades) {
    try {
      // Try to match politician by name
      const { data: pols } = await supabase
        .from('politicians')
        .select('id, full_name')
        .ilike('full_name', `%${trade.politician_name}%`)
        .limit(1)

      if (!pols?.length) continue
      const politician = pols[0]

      // Try to match company by ticker or name
      let companyId = null
      if (trade.ticker) {
        const { data: cos } = await supabase
          .from('companies')
          .select('id')
          .eq('stock_ticker', trade.ticker.toUpperCase())
          .limit(1)
        if (cos?.length) companyId = cos[0].id
      }
      if (!companyId && trade.company_name) {
        const { data: cos } = await supabase
          .from('companies')
          .select('id')
          .ilike('name', `%${trade.company_name}%`)
          .limit(1)
        if (cos?.length) companyId = cos[0].id
      }
      if (!companyId) continue

      // Upsert into politician_company_connections
      const { error: connErr } = await supabase
        .from('politician_company_connections')
        .upsert({
          politician_id: politician.id,
          company_id: companyId,
          connection_type: 'stock_ownership',
          amount_display: trade.amount_range || null,
          date_start: trade.date || null,
          description: `${trade.transaction_type === 'sale' ? 'Sold' : 'Purchased'} stock${trade.amount_range ? ` (${trade.amount_range})` : ''}`,
          source_url: trade.source_url || 'https://efdsearch.senate.gov',
          source_type: 'stock_act',
          is_verified: false,
        }, {
          onConflict: 'politician_id,company_id,connection_type,source_url',
          ignoreDuplicates: true,
        })

      if (!connErr) {
        stats.updated++
        console.log(`[financial] STOCK Act: ${politician.full_name} → ${trade.company_name}`)
      }
    } catch (err) {
      stats.errors.push({
        entity: `stock_act_${trade.politician_name}`,
        error: err.message,
        timestamp: new Date().toISOString(),
      })
    }
  }
}
