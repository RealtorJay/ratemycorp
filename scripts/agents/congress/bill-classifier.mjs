import { callJSON } from '../lib/anthropic.mjs'

const SYSTEM_PROMPT = `You are a nonpartisan legislative analyst. Given a bill title and any available context, classify the bill and provide a brief description.

Return JSON with exactly these fields:
{
  "category": "<one of: environment, healthcare, economy, taxes, immigration, defense, education, criminal_justice, campaign_finance, corporate_regulation, infrastructure, technology, foreign_policy, social_services, other>",
  "description": "<1-2 sentence plain language description of what the bill does>"
}

Be concise and factual. Do not editorialize.`

/**
 * Use Haiku to classify a bill's category and generate a description.
 * @param {string} billTitle
 * @param {string} [billNumber]
 * @param {string} [summary] - Policy area or existing summary
 * @returns {Promise<{category: string, description: string}>}
 */
export async function classifyBill(billTitle, billNumber = '', summary = '') {
  const user = [
    `Bill: ${billNumber} - ${billTitle}`,
    summary ? `Policy area: ${summary}` : '',
  ].filter(Boolean).join('\n')

  try {
    const result = await callJSON('haiku', SYSTEM_PROMPT, user, 256)
    return {
      category: result.category || 'other',
      description: result.description || '',
    }
  } catch (err) {
    console.warn(`[bill-classifier] Failed to classify "${billTitle}":`, err.message)
    return { category: 'other', description: '' }
  }
}
