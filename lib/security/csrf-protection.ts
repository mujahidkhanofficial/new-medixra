/**
 * CSRF Protection Utilities
 * 
 * Provides CSRF token generation, validation, and middleware.
 * Uses SameSite cookies for additional protection.
 */

import { cookies } from 'next/headers'
import crypto from 'crypto'

const CSRF_TOKEN_LENGTH = 32
const CSRF_COOKIE_NAME = '__csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'

/**
 * Generate a new CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex')
}

/**
 * Helper to add CSRF token to response meta tags
 * Use in your layout component and add to head
 */
export async function getCsrfToken(): Promise<string> {
  const cookieStore = await cookies()
  const existingToken = cookieStore.get(CSRF_COOKIE_NAME)?.value

  if (existingToken) {
    return existingToken
  }

  const newToken = generateCsrfToken()
  cookieStore.set(CSRF_COOKIE_NAME, newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })

  return newToken
}

/**
 * Verify CSRF token from request header or form data
 * Call this in protected API routes
 */
export async function verifyCsrfToken(request: Request): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value

    if (!cookieToken) {
      console.warn('[CSRF] No token in cookie')
      return false
    }

    // Try to get token from request headers first
    let headerToken = request.headers.get(CSRF_HEADER_NAME)

    // Fallback: try to get from form data if POST
    if (!headerToken && request.method === 'POST') {
      try {
        const clonedRequest = request.clone()
        const formData = await clonedRequest.formData()
        const csrfValue = formData.get('_csrf')
        headerToken = csrfValue ? csrfValue.toString() : null
      } catch {
        // Form parsing might fail, check header only
      }
    }

    if (!headerToken) {
      console.warn('[CSRF] No token in headers or form')
      return false
    }

    // Use constant-time comparison to prevent timing attacks
    const match = crypto.timingSafeEqual(
      Buffer.from(cookieToken),
      Buffer.from(headerToken)
    )

    return match
  } catch (error) {
    console.error('[CSRF] Verification error:', error)
    return false
  }
}

/**
 * Helper to add CSRF token to response meta tags
 * Use in your layout component:
 * 
 * const csrfToken = await getCsrfToken()
 * Add this meta tag to head: <meta name="csrf-token" content={csrfToken} />
 */
export function createCsrfMetaTag(token: string): { name: string; content: string } {
  return {
    name: 'csrf-token',
    content: token,
  }
}

/**
 * Helper for forms - returns hidden input field
 * 
 * Usage in forms:
 * Add this hidden field: <input type="hidden" name="_csrf" value={csrfToken} />
 */
export function getCsrfInputField(token: string): { name: string; value: string } {
  return {
    name: '_csrf',
    value: token,
  }
}

/**
 * Middleware helper to validate CSRF on protected routes
 * 
 * Check request.method and validate token for POST, PUT, DELETE requests
 */
export function getCsrfProtectionConfig() {
  return {
    protectedMethods: ['POST', 'PUT', 'DELETE', 'PATCH'],
    tokenLocation: {
      header: CSRF_HEADER_NAME,
      formField: '_csrf',
      cookie: CSRF_COOKIE_NAME,
    },
  }
}
