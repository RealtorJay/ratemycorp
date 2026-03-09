import { searchNews } from '../lib/news-fetcher.mjs'
import { callJSON } from '../lib/anthropic.mjs'

const SYSTEM_PROMPT = `You are a financial analyst tracking congressional stock trades. Given search results about congressional stock trades, extract any trades you can identify.

Return JSON array:
[
  {
    "politician_name": "<full name>",
    "ticker": "<stock ticker if mentioned>",
    "company_name": "<company name>",
    "transaction_type": "purchase" | "sale",
    "amount_range": "<e.g. '$1,001 - $15,000'>",
    "date": "<YYYY-MM-DD if available>",
    "source_url": "<url of the report>"
  }
]

Only include trades you are confident about from the sources. Return an empty array if no trades found.`

/**
 * Search for recent congressional stock trade disclosures.
 * Uses news search + AI extraction since the STOCK Act filings
 * don't have a clean public API.
 * @returns {Promise<Array>} - Extracted trade records
 */
export async function fetchStockActTrades() {
  const articles = await searchNews('congressional stock trade STOCK Act disclosure', 10)

  if (articles.length === 0) return []

  const snippets = articles
    .map((a, i) => `${i + 1}. ${a.title}\n   ${a.snippet}\n   Source: ${a.url}`)
    .join('\n\n')

  try {
    const trades = await callJSON(
      'haiku',
      SYSTEM_PROMPT,
      `Recent articles about congressional stock trades:\n\n${snippets}`,
      2048
    )
    return Array.isArray(trades) ? trades : []
  } catch (err) {
    console.warn('[financial] STOCK Act extraction failed:', err.message)
    return []
  }
}
