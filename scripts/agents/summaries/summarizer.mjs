import { callJSON } from '../lib/anthropic.mjs'

const SYSTEM_PROMPT = `You are an analyst for RateMyCorps, a corporate accountability platform.
Given a set of user reviews for a company, produce a concise summary.

Your summary should:
1. Identify 3-5 key themes across all reviews (e.g. "environmental concerns", "poor consumer trust")
2. Note areas of consensus and disagreement among reviewers
3. Highlight notable trends (improving or declining sentiment)
4. Be objective — report what reviewers say, don't inject opinions

Respond with JSON:
{
  "summary_html": "<p>2-3 short paragraphs summarizing the reviews, using <strong> for emphasis</p>",
  "themes": ["theme1", "theme2", ...],
  "sentiment": "positive" | "mixed" | "negative"
}`

/**
 * Generate a review summary for a company.
 * @param {string} companyName
 * @param {{ headline: string, body: string, rating_overall: number, rating_environmental: number, rating_ethical_business: number, rating_consumer_trust: number, rating_scandals: number }[]} reviews
 * @returns {Promise<{ summary_html: string, themes: string[], sentiment: string }>}
 */
export async function summarizeReviews(companyName, reviews) {
  const reviewsText = reviews.map((r, i) =>
    `[Review ${i + 1}] Rating: ${r.rating_overall}/5 | Env: ${r.rating_environmental}/5 | Ethics: ${r.rating_ethical_business}/5 | Trust: ${r.rating_consumer_trust}/5 | Scandals: ${r.rating_scandals}/5\n` +
    `Headline: ${r.headline}\n` +
    `${r.body}`
  ).join('\n\n---\n\n')

  return callJSON(
    'sonnet',
    SYSTEM_PROMPT,
    `Company: ${companyName}\n\n${reviewsText}`,
    2048
  )
}
