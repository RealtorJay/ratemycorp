import { CONFIG } from '../config.mjs'
import { createLimiter } from './rate-limiter.mjs'

const limiter = createLimiter({ maxPerSecond: 1 }) // Google allows ~1 QPS on free tier

/**
 * Search Google Custom Search for recent news articles.
 * @param {string} query - Search query
 * @param {number} [num=5] - Number of results (max 10)
 * @returns {Promise<Array<{title: string, url: string, snippet: string, source: string}>>}
 */
export async function searchNews(query, num = 5) {
  const { key, cx, baseUrl } = CONFIG.apis.googleSearch
  if (!key || !cx) {
    console.warn('[news-fetcher] Google Search API not configured, skipping')
    return []
  }

  await limiter.wait()

  const params = new URLSearchParams({
    key,
    cx,
    q: query,
    num: String(Math.min(num, 10)),
    dateRestrict: 'd7', // Last 7 days
    sort: 'date',
  })

  try {
    const res = await fetch(`${baseUrl}?${params}`, {
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) {
      console.warn(`[news-fetcher] Google API ${res.status}: ${res.statusText}`)
      return []
    }
    const json = await res.json()
    return (json.items || []).map(item => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet || '',
      source: item.displayLink || '',
    }))
  } catch (err) {
    console.warn(`[news-fetcher] Search failed for "${query}":`, err.message)
    return []
  }
}

/**
 * Search Yahoo Finance news for a given ticker symbol.
 * No API key required.
 * @param {string} ticker
 * @param {number} [count=5]
 * @returns {Promise<Array<{title: string, url: string, source: string, publishedAt: string}>>}
 */
export async function searchYahooNews(ticker, count = 5) {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(ticker)}&newsCount=${count}&quotesCount=0`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return []
    const json = await res.json()
    return (json.news || []).slice(0, count).map(a => ({
      title: a.title,
      url: a.link,
      source: a.publisher || '',
      publishedAt: a.providerPublishTime
        ? new Date(a.providerPublishTime * 1000).toISOString()
        : null,
    }))
  } catch {
    return []
  }
}
