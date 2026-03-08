/**
 * Returns a logo URL for a company domain via Clearbit's logo API.
 * Falls back to null if no domain is stored.
 */
export function getLogoUrl(website, size = 64) {
  if (!website) return null
  try {
    const domain = new URL(website).hostname.replace(/^www\./, '')
    return `https://logo.clearbit.com/${domain}?size=${size}`
  } catch {
    return null
  }
}
