/**
 * API Route Protection Utilities
 * 
 * Provides middleware and helpers for protecting API routes with:
 * - Authentication verification
 * - Role-based access control
 * - Audit logging
 * - Rate limiting support
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db/drizzle'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { logAuditEvent } from '../audit/audit-logger'

export type UserRole = 'admin' | 'vendor' | 'technician' | 'user'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
  }
  profile?: {
    id: string
    role: UserRole
    status: string
    approval_status: string
  }
}

interface ApiProtectionOptions {
  requiredRoles?: UserRole[]
  requireApproval?: boolean
  auditAction?: string
  logSuccess?: boolean
}

/**
 * Verify authentication and authorization for API routes
 * 
 * Usage:
 * ```typescript
 * export async function POST(req: NextRequest) {
 *   const result = await verifyApiAuth(req, { 
 *     requiredRoles: ['vendor', 'admin'],
 *     auditAction: 'vendor.apply'
 *   })
 *   
 *   if (!result.authorized) {
 *     return result.response // Already formatted error response
 *   }
 *   
 *   const { user, profile } = result
 *   // ... rest of handler
 * }
 * ```
 */
export async function verifyApiAuth(
  request: NextRequest,
  options: ApiProtectionOptions = {}
) {
  const { requiredRoles, requireApproval = false, auditAction, logSuccess = true } = options

  try {
    // 1. Get authenticated user
    const supabase = await createClient()
    if (!supabase) {
      await logAuditEvent({
        action: auditAction || 'api.auth.failed',
        userId: 'unknown',
        status: 'error',
        reason: 'Database connection failed',
        route: request.nextUrl.pathname,
      })
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, error: 'Service unavailable' },
          { status: 503 }
        ),
      }
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user || authError) {
      await logAuditEvent({
        action: auditAction || 'api.auth.failed',
        userId: 'unknown',
        status: 'unauthorized',
        reason: 'User not authenticated',
        route: request.nextUrl.pathname,
      })
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        ),
      }
    }

    // 2. Get user profile
    const profileRow = await db.query.profiles.findFirst({
      where: eq(profiles.id, user.id),
    })

    if (!profileRow) {
      await logAuditEvent({
        action: auditAction || 'api.auth.failed',
        userId: user.id,
        status: 'error',
        reason: 'Profile not found',
        route: request.nextUrl.pathname,
      })
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, error: 'Profile not found' },
          { status: 404 }
        ),
      }
    }

    // 3. Check suspension status
    if (profileRow.status === 'suspended') {
      await logAuditEvent({
        action: auditAction || 'api.auth.failed',
        userId: user.id,
        status: 'forbidden',
        reason: 'Account suspended',
        route: request.nextUrl.pathname,
      })
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, error: 'Account suspended' },
          { status: 403 }
        ),
      }
    }

    // 4. Check role-based access
    if (requiredRoles && !requiredRoles.includes(profileRow.role as UserRole)) {
      await logAuditEvent({
        action: auditAction || 'api.auth.failed',
        userId: user.id,
        status: 'forbidden',
        reason: `Insufficient role: ${profileRow.role}`,
        route: request.nextUrl.pathname,
      })
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        ),
      }
    }

    // 5. Check approval status for vendors/technicians
    if (requireApproval && (profileRow.role === 'vendor' || profileRow.role === 'technician')) {
      if (profileRow.approvalStatus !== 'approved') {
        await logAuditEvent({
          action: auditAction || 'api.auth.failed',
          userId: user.id,
          status: 'forbidden',
          reason: `Not approved: ${profileRow.approvalStatus}`,
          route: request.nextUrl.pathname,
        })
        return {
          authorized: false,
          response: NextResponse.json(
            { success: false, error: 'Account not approved' },
            { status: 403 }
          ),
        }
      }
    }

    // Success - log if configured
    if (logSuccess) {
      await logAuditEvent({
        action: auditAction || 'api.auth.success',
        userId: user.id,
        status: 'success',
        route: request.nextUrl.pathname,
      })
    }

    return {
      authorized: true,
      user: {
        id: user.id,
        email: user.email!,
      },
      profile: {
        id: profileRow.id,
        role: profileRow.role as UserRole,
        status: profileRow.status,
        approval_status: profileRow.approvalStatus,
      },
    }
  } catch (error) {
    console.error('[API Auth Error]', error)
    await logAuditEvent({
      action: auditAction || 'api.auth.error',
      userId: 'unknown',
      status: 'error',
      reason: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown'}`,
      route: request.nextUrl.pathname,
    })
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      ),
    }
  }
}

/**
 * Helper to create an unauthorized response with audit logging
 */
export async function unauthorizedResponse(
  userId: string,
  reason: string,
  route: string,
  status: number = 403
) {
  await logAuditEvent({
    action: 'api.unauthorized',
    userId,
    status: 'forbidden',
    reason,
    route,
  })
  return NextResponse.json(
    { success: false, error: reason },
    { status }
  )
}

/**
 * Helper to create an error response with audit logging
 */
export async function errorResponse(
  userId: string,
  error: string,
  route: string,
  status: number = 500
) {
  await logAuditEvent({
    action: 'api.error',
    userId,
    status: 'error',
    reason: error,
    route,
  })
  return NextResponse.json(
    { success: false, error },
    { status }
  )
}
