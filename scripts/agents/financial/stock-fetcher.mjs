import { createLimiter } from '../lib/rate-limiter.mjs'

const limiter = createLimiter({ maxPerSecond: 2 })

/**
 * Fetch stock data from Yahoo Finance v8 API (no key required).
 * Same API used by the frontend StockWidget component.
 * @param {string} ticker - e.g. "AAPL"
 * @returns {Promise<object|null>} - { price, open, high, low, close, volume, marketCap, date }
 */
export async function fetchStockData(ticker) {
  await limiter.wait()

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=5d&includePrePost=false`,
      { signal: AbortSignal.timeout(10000) }
    )
    if (!res.ok) return null

    const json = await res.json()
    const result = json?.chart?.result?.[0]
    if (!result) return null

    const meta = result.meta
    const timestamps = result.timestamp || []
    const quotes = result.indicators?.quote?.[0] || {}

    // Get the most recent trading day's data
    const lastIdx = timestamps.length - 1
    if (lastIdx < 0) return null

    const date = new Date(timestamps[lastIdx] * 1000).toISOString().split('T')[0]

    return {
      ticker,
      date,
      open: quotes.open?.[lastIdx] || null,
      high: quotes.high?.[lastIdx] || null,
      low: quotes.low?.[lastIdx] || null,
      close: meta.regularMarketPrice || quotes.close?.[lastIdx] || null,
      volume: quotes.volume?.[lastIdx] || null,
      marketCap: meta.marketCap || null,
    }
  } catch (err) {
    console.warn(`[financial] Stock fetch failed for ${ticker}:`, err.message)
    return null
  }
}
