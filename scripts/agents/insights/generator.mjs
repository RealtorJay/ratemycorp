import { callJSON } from '../lib/anthropic.mjs'

const SYSTEM_PROMPT = `You are a personal analyst for RateMyCorps, a corporate accountability platform.
Generate 3-5 personalized insight cards for a user based on their reviews, followed companies, and stated values.

Card types to choose from:
- rating_trend: Patterns in the user's ratings (e.g. they rate environmental impact low across all companies)
- company_comparison: Comparisons between companies they follow or have reviewed
- value_alignment: How their followed companies align (or conflict) with their stated values
- industry_insight: Trends in the industries they care about
- alert: Recent developments at companies they follow (scandals, news, rating changes)

Keep each card body to 1-3 concise sentences. Be specific and data-driven.

Respond with JSON:
{
  "cards": [
    { "type": "rating_trend|company_comparison|value_alignment|industry_insight|alert", "title": "short title", "body": "insight text" }
  ]
}`

/**
 * Generate personalized insight cards for a user.
 * @param {object} context
 * @param {string} context.userValues - User's stated values
 * @param {string} context.userIssues - User's priority issues
 * @param {{ company_name: string, rating_overall: number, rating_environmental: number, rating_ethical_business: number, rating_consumer_trust: number, rating_scandals: number, headline: string }[]} context.reviews
 * @param {{ name: string, industry: string, avg_overall: number, avg_environmental: number, avg_ethical_business: number }[]} context.followedCompanies
 * @param {{ company_name: string, title: string }[]} context.recentNews
 * @returns {Promise<{ cards: { type: string, title: string, body: string }[] }>}
 */
export async function generateInsights(context) {
  const sections = []

  if (context.reviews.length > 0) {
    const reviewsText = context.reviews.map(r =>
      `${r.company_name}: Overall ${r.rating_overall}/5, Env ${r.rating_environmental}/5, Ethics ${r.rating_ethical_business}/5, Trust ${r.rating_consumer_trust}/5, Scandals ${r.rating_scandals}/5 — "${r.headline}"`
    ).join('\n')
    sections.push(`USER'S REVIEWS:\n${reviewsText}`)
  }

  if (context.followedCompanies.length > 0) {
    const companiesText = context.followedCompanies.map(c =>
      `${c.name} (${c.industry}): Avg ${c.avg_overall}/5, Env ${c.avg_environmental}/5, Ethics ${c.avg_ethical_business}/5`
    ).join('\n')
    sections.push(`FOLLOWED COMPANIES:\n${companiesText}`)
  }

  if (context.userValues.length > 0) {
    sections.push(`USER VALUES: ${context.userValues.join(', ')}`)
  }

  if (context.userIssues.length > 0) {
    sections.push(`PRIORITY ISSUES: ${context.userIssues.join(', ')}`)
  }

  if (context.recentNews.length > 0) {
    const newsText = context.recentNews.map(n =>
      `${n.company_name}: ${n.title}`
    ).join('\n')
    sections.push(`RECENT NEWS:\n${newsText}`)
  }

  return callJSON('sonnet', SYSTEM_PROMPT, sections.join('\n\n'), 2048)
}
