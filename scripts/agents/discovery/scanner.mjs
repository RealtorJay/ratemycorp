import { callJSON } from '../lib/anthropic.mjs'

const SYSTEM_PROMPT = `You are an investigative analyst for RateMyCorps, a corporate accountability platform.
Analyze user-generated content (reviews or forum posts) and extract any mentions of:

1. **scandal** — Corporate scandals, cover-ups, unethical behavior
2. **lawsuit** — Legal actions, fines, settlements, regulatory enforcement
3. **political_tie** — Political donations, lobbying relationships, revolving door
4. **lobbying** — Direct lobbying efforts, PAC spending, industry group activity
5. **conflict_of_interest** — Board relationships, insider trading, self-dealing

Only extract claims that are specific and substantive — not vague complaints.
For each extraction, assess confidence (0.0-1.0) based on specificity and plausibility.

Respond with JSON:
{ "extractions": [{ "type": "scandal|lawsuit|political_tie|lobbying|conflict_of_interest", "title": "short title", "description": "1-2 sentence summary of the claim", "confidence": 0.0-1.0, "source_index": N }] }

If no substantive claims are found, return: { "extractions": [] }`

/**
 * Scan a batch of content items for discoverable claims.
 * @param {{ index: number, body: string, company_name: string }[]} items
 * @returns {Promise<{ extractions: { type: string, title: string, description: string, confidence: number, source_index: number }[] }>}
 */
export async function scanContent(items) {
  const userMsg = items.map(item =>
    `[${item.index}] Company: ${item.company_name}\n${item.body}`
  ).join('\n\n---\n\n')

  return callJSON('haiku', SYSTEM_PROMPT, userMsg)
}
