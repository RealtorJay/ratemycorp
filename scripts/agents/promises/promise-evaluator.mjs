import { callJSON } from '../lib/anthropic.mjs'

const SYSTEM_PROMPT = `You are a nonpartisan political fact-checker. Given a political promise and recent news articles, determine if the promise's status should be updated.

Possible statuses:
- "kept" — The promise has been fully delivered
- "broken" — The politician has acted against the promise or it's now impossible
- "compromised" — Partially fulfilled with significant concessions
- "stalled" — No progress despite opportunity to act
- "not_yet_due" — Too early to evaluate; promise is still in progress

Return JSON:
{
  "should_update": true/false,
  "new_status": "<status>",
  "confidence": <0.0 to 1.0>,
  "verdict_notes": "<2-3 sentence factual explanation with specific evidence>",
  "sources": [
    { "url": "<source url>", "title": "<article title>" }
  ]
}

Only recommend an update if your confidence is >= 0.8. Be conservative — when in doubt, do not update. Never update based on opinion pieces or partisan sources alone. Look for concrete actions, votes, executive orders, or legislation.`

/**
 * Evaluate whether a political promise should have its status updated.
 * @param {object} params
 * @param {string} params.promiseText
 * @param {string} params.currentStatus
 * @param {string} params.politicianName
 * @param {string} params.party
 * @param {string} params.state
 * @param {Array<{title: string, url: string, snippet: string}>} params.articles
 * @returns {Promise<{should_update: boolean, new_status: string, confidence: number, verdict_notes: string, sources: Array}>}
 */
export async function evaluatePromise({ promiseText, currentStatus, politicianName, party, state, articles }) {
  if (articles.length === 0) {
    return { should_update: false }
  }

  const articleList = articles
    .map((a, i) => `${i + 1}. ${a.title}\n   ${a.snippet}\n   Source: ${a.url}`)
    .join('\n\n')

  const user = `PROMISE: "${promiseText}" by ${politicianName} (${party}-${state})
Current status: ${currentStatus}

Recent news articles:
${articleList}`

  try {
    const result = await callJSON('sonnet', SYSTEM_PROMPT, user, 1024)
    return {
      should_update: result.should_update === true && (result.confidence || 0) >= 0.8,
      new_status: result.new_status || currentStatus,
      confidence: result.confidence || 0,
      verdict_notes: result.verdict_notes || '',
      sources: result.sources || [],
    }
  } catch (err) {
    console.warn(`[promises] Evaluation failed for "${promiseText.slice(0, 50)}...":`, err.message)
    return { should_update: false }
  }
}
