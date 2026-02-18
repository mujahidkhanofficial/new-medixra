/**
 * Audit Logging System
 * 
 * Logs all critical security events:
 * - Authentication successes/failures
 * - Authorization checks
 * - Admin actions (role changes, suspensions, etc)
 * - API access by sensitive routes
 * - Account state changes
 */

import { db } from '@/lib/db/drizzle'
import { auditLogs } from '@/lib/db/schema'

export interface AuditEvent {
  action: string // e.g., 'auth.login', 'admin.suspend_user', 'api.admin.called'
  userId: string // who performed the action
  targetUserId?: string // who was affected (if different from actor)
  status: 'success' | 'error' | 'unauthorized' | 'forbidden' // outcome
  reason?: string // error message or why it was denied
  route?: string // API route or page path
  metadata?: Record<string, any> // additional context
}

/**
 * Log an audit event to the database
 * 
 * Usage:
 * ```typescript
 * await logAuditEvent({
 *   action: 'admin.suspend_user',
 *   userId: adminId,
 *   targetUserId: userBeingSuspended,
 *   status: 'success',
 *   metadata: { previousStatus: 'active', newStatus: 'suspended' }
 * })
 * ```
 */
export async function logAuditEvent(event: AuditEvent): Promise<void> {
  try {
    // Only insert if auditLogs table exists
    // This prevents crashes if migration hasn't run
    if (!db) return

    await db.insert(auditLogs).values({
      action: event.action,
      userId: event.userId,
      targetUserId: event.targetUserId,
      status: event.status,
      reason: event.reason,
      route: event.route,
      metadata: event.metadata ? JSON.stringify(event.metadata) : null,
    }).catch(() => {
      // Table might not exist yet, silently fail
      console.warn('[Audit] auditLogs table may not exist yet')
    })
  } catch (error) {
    // Never let audit logging failure crash the application
    console.error('[Audit Error]', error)
  }
}

/**
 * Get audit logs for a user (for analytics)
 */
export async function getUserAuditLogs(userId: string, limit: number = 50) {
  try {
    return await db.query.auditLogs.findMany({
      where: (logs, { eq }) => eq(logs.userId, userId),
      limit,
      orderBy: (logs) => [logs.createdAt],
    })
  } catch (error) {
    console.error('[Audit Query Error]', error)
    return []
  }
}

/**
 * Get audit logs for admin actions (for compliance)
 */
export async function getAdminAuditLogs(limit: number = 100) {
  try {
    return await db.query.auditLogs.findMany({
      where: (logs, { like }) => like(logs.action, 'admin.%'),
      limit,
      orderBy: (logs) => [logs.createdAt],
    })
  } catch (error) {
    console.error('[Audit Query Error]', error)
    return []
  }
}

/**
 * Get failed auth attempts for a user (for security analysis)
 */
export async function getFailedAuthAttempts(userId: string, sinceMinutes: number = 30) {
  try {
    const sinceDate = new Date(Date.now() - sinceMinutes * 60 * 1000).toISOString()
    return await db.query.auditLogs.findMany({
      where: (logs, { eq, gte, and, like }) => and(
        eq(logs.userId, userId),
        like(logs.action, 'auth.%'),
        gte(logs.createdAt, sinceDate)
      ),
      limit: 100,
      orderBy: (logs) => [logs.createdAt],
    })
  } catch (error) {
    console.error('[Audit Query Error]', error)
    return []
  }
}
