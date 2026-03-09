/**
 * Simple token-bucket rate limiter for external API calls.
 * Usage:
 *   const limiter = createLimiter({ maxPerSecond: 5 })
 *   await limiter.wait()
 *   // ... make API call
 */

export function createLimiter({ maxPerSecond = 5 } = {}) {
  const interval = 1000 / maxPerSecond
  let lastCall = 0

  return {
    async wait() {
      const now = Date.now()
      const elapsed = now - lastCall
      if (elapsed < interval) {
        await new Promise(r => setTimeout(r, interval - elapsed))
      }
      lastCall = Date.now()
    },
  }
}
