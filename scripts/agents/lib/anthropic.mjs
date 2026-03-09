import Anthropic from '@anthropic-ai/sdk'
import { CONFIG } from '../config.mjs'

const client = new Anthropic({ apiKey: CONFIG.anthropic.apiKey })

/** Track cumulative token usage across all calls in a workflow run */
let _usage = { haiku_input: 0, haiku_output: 0, sonnet_input: 0, sonnet_output: 0 }

export function resetUsage() {
  _usage = { haiku_input: 0, haiku_output: 0, sonnet_input: 0, sonnet_output: 0 }
}

export function getUsage() {
  return { ..._usage }
}

/**
 * Estimate cost in cents based on accumulated token usage.
 * Pricing (per 1M tokens): Haiku input=$0.80, output=$4.00; Sonnet input=$3.00, output=$15.00
 */
export function estimateCostCents() {
  return Math.round(
    (_usage.haiku_input / 1e6) * 80 +
    (_usage.haiku_output / 1e6) * 400 +
    (_usage.sonnet_input / 1e6) * 300 +
    (_usage.sonnet_output / 1e6) * 1500
  )
}

/**
 * Call Claude Haiku — fast, cheap model for extraction/classification/formatting.
 * @param {string} system - System prompt
 * @param {string} user - User message
 * @param {number} [maxTokens=1024] - Max output tokens
 * @returns {Promise<string>} - Text response
 */
export async function callHaiku(system, user, maxTokens = 1024) {
  return callModel(CONFIG.anthropic.models.fast, 'haiku', system, user, maxTokens)
}

/**
 * Call Claude Sonnet — powerful model for analysis/fact-checking/summaries.
 * @param {string} system - System prompt
 * @param {string} user - User message
 * @param {number} [maxTokens=2048] - Max output tokens
 * @returns {Promise<string>} - Text response
 */
export async function callSonnet(system, user, maxTokens = 2048) {
  return callModel(CONFIG.anthropic.models.smart, 'sonnet', system, user, maxTokens)
}

/**
 * Call Claude and parse the response as JSON.
 * @param {'haiku'|'sonnet'} tier - Which model tier to use
 * @param {string} system - System prompt (should instruct JSON output)
 * @param {string} user - User message
 * @param {number} [maxTokens=1024] - Max output tokens
 * @returns {Promise<object>} - Parsed JSON
 */
export async function callJSON(tier, system, user, maxTokens = 1024) {
  const fn = tier === 'sonnet' ? callSonnet : callHaiku
  const text = await fn(system, user, maxTokens)
  // Extract JSON from response — handle markdown code fences
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text]
  return JSON.parse(jsonMatch[1].trim())
}

async function callModel(model, tier, system, user, maxTokens) {
  const maxRetries = 3
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content: user }],
      })

      // Track usage
      const prefix = tier === 'sonnet' ? 'sonnet' : 'haiku'
      _usage[`${prefix}_input`] += response.usage.input_tokens
      _usage[`${prefix}_output`] += response.usage.output_tokens

      return response.content[0].text
    } catch (err) {
      if (attempt === maxRetries) throw err
      // Exponential backoff for rate limits (429) or server errors (5xx)
      const status = err?.status || err?.error?.status
      if (status === 429 || (status >= 500 && status < 600)) {
        const delay = Math.pow(2, attempt) * 1000
        console.warn(`[anthropic] ${status} on attempt ${attempt}, retrying in ${delay}ms...`)
        await new Promise(r => setTimeout(r, delay))
      } else {
        throw err
      }
    }
  }
}
