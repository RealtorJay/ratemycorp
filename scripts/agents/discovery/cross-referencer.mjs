import { callJSON } from '../lib/anthropic.mjs'

const SYSTEM_PROMPT = `You are a fact-checker for RateMyCorps, a corporate accountability platform.
Given a newly discovered claim about a company and a list of existing known records,
determine if the claim duplicates an existing record or is genuinely new.

Respond with JSON:
{
  "is_duplicate": true|false,
  "matched_id": "uuid_of_matched_record" | null,
  "reason": "brief explanation"
}`

/**
 * Check a discovery against existing records to detect duplicates.
 * @param {{ title: string, description: string, type: string, company_name: string }} discovery
 * @param {{ id: string, title?: string, description?: string, type?: string, connection_type?: string }[]} existingRecords
 * @returns {Promise<{ is_duplicate: boolean, matched_id: string|null, reason: string }>}
 */
export async function crossReference(discovery, existingRecords) {
  if (existingRecords.length === 0) {
    return { is_duplicate: false, matched_id: null, reason: 'No existing records to compare' }
  }

  const existingText = existingRecords.map(r =>
    `[${r.id}] ${r.title || r.connection_type || 'Untitled'}: ${r.description || 'No description'}`
  ).join('\n')

  const userMsg =
    `New discovery about ${discovery.company_name}:\n` +
    `Type: ${discovery.type}\n` +
    `Title: ${discovery.title}\n` +
    `Description: ${discovery.description}\n\n` +
    `Existing records:\n${existingText}`

  return callJSON('sonnet', SYSTEM_PROMPT, userMsg)
}
