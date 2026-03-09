import { callJSON } from '../lib/anthropic.mjs'

const SYSTEM_PROMPT = `You classify news articles about companies into categories for a corporate accountability platform. Given a batch of article titles and snippets, classify each one.

Return a JSON array with one object per article:
[
  {
    "index": 0,
    "category": "<environmental|labor|consumer|legal|financial|regulatory|scandal|positive|neutral|other>",
    "sentiment": <number from -1.0 (very negative) to 1.0 (very positive)>,
    "relevance": <number from 0.0 (irrelevant) to 1.0 (highly relevant to corporate ethics/accountability)>,
    "skip": <true if the article is not about the company or is irrelevant>
  }
]

Focus on corporate ethics, consumer impact, environmental actions, legal issues, and regulatory matters.`

/**
 * Classify a batch of news articles using Haiku.
 * @param {string} companyName
 * @param {Array<{title: string, snippet: string}>} articles
 * @returns {Promise<Array<{index: number, category: string, sentiment: number, relevance: number, skip: boolean}>>}
 */
export async function classifyArticles(companyName, articles) {
  if (articles.length === 0) return []

  const user = `Company: ${companyName}\n\nArticles:\n` +
    articles.map((a, i) => `[${i}] ${a.title}\n    ${a.snippet}`).join('\n\n')

  try {
    const result = await callJSON('haiku', SYSTEM_PROMPT, user, 1024)
    return Array.isArray(result) ? result : []
  } catch (err) {
    console.warn(`[company-news] Classification failed for ${companyName}:`, err.message)
    return []
  }
}
