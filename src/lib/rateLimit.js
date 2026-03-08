const timestamps = {}

/**
 * Client-side submission throttle. Returns true if the action is allowed.
 * @param {string} key   Unique key per action (e.g. "review-nike")
 * @param {number} cooldownMs  Minimum ms between submissions (default 30s)
 */
export function canSubmit(key, cooldownMs = 30000) {
  const now = Date.now()
  if (timestamps[key] && now - timestamps[key] < cooldownMs) {
    return false
  }
  timestamps[key] = now
  return true
}
