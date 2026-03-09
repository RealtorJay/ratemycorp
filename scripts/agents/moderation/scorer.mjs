import { callJSON } from '../lib/anthropic.mjs'

const SYSTEM_PROMPT = `You are a content moderator for RateMyCorps, a corporate accountability platform.
Score each piece of content on these 4 axes (0-100, where 0 = no concern, 100 = severe violation):

- spam: Promotional content, ads, gibberish, or bot-generated text
- off_topic: Not related to the company or corporate accountability
- harassment: Personal attacks, threats, hate speech, or doxxing
- misinformation: Demonstrably false claims presented as fact

Context: Users post about company ethics, environmental impact, political ties, scandals, and consumer trust.
Strong opinions and criticism of companies are ALLOWED — only flag actual violations.

Respond with a JSON array matching the input order:
[{ "spam": N, "off_topic": N, "harassment": N, "misinformation": N }]`

/**
 * Score a batch of content items for moderation.
 * @param {{ id: string, title?: string, body: string, company_name: string }[]} items
 * @returns {Promise<{ spam: number, off_topic: number, harassment: number, misinformation: number }[]>}
 */
export async function scoreContent(items) {
  const userMsg = items.map((item, i) =>
    `[${i + 1}] Company: ${item.company_name}\n` +
    (item.title ? `Title: ${item.title}\n` : '') +
    `Content: ${item.body}`
  ).join('\n\n---\n\n')

  return callJSON('haiku', SYSTEM_PROMPT, userMsg)
}
