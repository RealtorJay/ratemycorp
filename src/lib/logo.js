/**
 * Returns a logo URL using Google's high-quality favicon service.
 * Falls back to null if no domain is stored.
 */
export function getLogoUrl(website, size = 64) {
  if (!website) return null
  try {
    const domain = new URL(website).hostname.replace(/^www\./, '')
    const px = size >= 64 ? 64 : 32
    return `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=${px}`
  } catch {
    return null
  }
}
