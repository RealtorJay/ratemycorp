import { callJSON } from '../lib/anthropic.mjs'

const SYSTEM_PROMPT = `You are a corporate accountability analyst. Given a significant news event about a company, write a fact-checked summary with source attribution.

Return JSON:
{
  "summary": "<2-3 sentence factual summary of the event and its significance for consumers/workers/environment>",
  "severity": "<low|medium|high|critical>"
}

Be factual and cite specific details (dollar amounts, dates, agencies involved). Do not editorialize.`

/**
 * Use Sonnet to produce a fact-checked summary of a significant corporate event.
 * @param {string} companyName
 * @param {string} articleTitle
 * @param {string} snippet
 * @param {string} url
 * @returns {Promise<{summary: string, severity: string}|null>}
 */
export async function summarizeEvent(companyName, articleTitle, snippet, url) {
  const user = `Company: ${companyName}
Article: ${articleTitle}
Source: ${url}
Content: ${snippet}`

  try {
    return await callJSON('sonnet', SYSTEM_PROMPT, user, 512)
  } catch (err) {
    console.warn(`[company-news] Summarization failed for "${articleTitle}":`, err.message)
    return null
  }
}
