/**
 * Rate Limiting Utility
 * 
 * Implements basic rate limiting using in-memory store.
 * For production, consider using Redis or Upstash.
 * 
 * Rate limit rules:
 * - Login attempts: 5 per minute per email + IP
 * - Sign up: 3 per hour per IP
 * - API endpoints: 30 per minute per user
 * - Admin API: 10 per minute per admin
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// Simple in-memory store (use Redis for production)
const rateLimitStore = new Map<string, RateLimitEntry>()

interface RateLimitConfig {
  maxRequests: number
  windowMs: number // milliseconds
}

const RATE_LIMIT_PRESETS = {
  login: { maxRequests: 5, windowMs: 60 * 1000 }, // 5 per minute
  signup: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  api: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 per minute
  admin: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 per minute
  vendor: { maxRequests: 20, windowMs: 60 * 1000 }, // 20 per minute
}

/**
 * Check if a request should be rate limited
 * 
 * Usage:
 * ```typescript
 * const isLimited = checkRateLimit(email, 'login')
 * if (isLimited) {
 *   return NextResponse.json({ error: 'Too many attempts' }, { status: 429 })
 * }
 * ```
 */
export function checkRateLimit(
  identifier: string,
  limitType: keyof typeof RATE_LIMIT_PRESETS,
  customConfig?: RateLimitConfig
): boolean {
  const config = customConfig || RATE_LIMIT_PRESETS[limitType]
  const now = Date.now()
  const key = `${limitType}:${identifier}`

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    cleanupExpiredEntries(now)
  }

  const entry = rateLimitStore.get(key)

  // No entry = first request
  if (!entry) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return false // Not rate limited
  }

  // Check if window has expired
  if (now > entry.resetTime) {
    // Reset the window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return false // Not rate limited
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    return true
  }

  // Increment counter
  entry.count++
  return false // Not rate limited yet
}

/**
 * Get remaining requests for an identifier
 */
export function getRemainingRequests(
  identifier: string,
  limitType: keyof typeof RATE_LIMIT_PRESETS,
  customConfig?: RateLimitConfig
): { remaining: number; resetTime: number } {
  const config = customConfig || RATE_LIMIT_PRESETS[limitType]
  const key = `${limitType}:${identifier}`
  const entry = rateLimitStore.get(key)

  if (!entry || Date.now() > entry.resetTime) {
    return {
      remaining: config.maxRequests,
      resetTime: Date.now() + config.windowMs,
    }
  }

  return {
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetTime: entry.resetTime,
  }
}

/**
 * Reset rate limit for an identifier (e.g., after successful login)
 */
export function resetRateLimit(
  identifier: string,
  limitType: keyof typeof RATE_LIMIT_PRESETS
): void {
  const key = `${limitType}:${identifier}`
  rateLimitStore.delete(key)
}

/**
 * Clean up expired entries from the store
 */
function cleanupExpiredEntries(now: number): void {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Clear all rate limits (for admin/testing)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear()
}

/**
 * Get rate limit statistics (for monitoring)
 */
export function getRateLimitStats(): {
  entries: number
  oldestEntry: number | null
  newestEntry: number | null
} {
  if (rateLimitStore.size === 0) {
    return { entries: 0, oldestEntry: null, newestEntry: null }
  }

  let oldest: number | null = null
  let newest: number | null = null

  for (const entry of rateLimitStore.values()) {
    if (oldest === null || entry.resetTime < oldest) oldest = entry.resetTime
    if (newest === null || entry.resetTime > newest) newest = entry.resetTime
  }

  return {
    entries: rateLimitStore.size,
    oldestEntry: oldest,
    newestEntry: newest,
  }
}
