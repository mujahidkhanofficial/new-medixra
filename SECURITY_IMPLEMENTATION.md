# Security Implementation Guide

This document describes the security enhancements implemented across the Medixra platform.

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Rate Limiting](#rate-limiting)
3. [Audit Logging](#audit-logging)
4. [CSRF Protection](#csrf-protection)
5. [API Route Protection](#api-route-protection)
6. [Migration Steps](#migration-steps)

---

## Authentication & Authorization

### Overview

The platform now uses a **multi-layered server-authoritative authentication model** with:
- Root middleware for route protection
- API Authorization wrapper for API endpoints
- Audit logging for all auth events
- Rate limiting for brute-force protection

### Key Components

#### 1. Root Middleware (`middleware.ts`)

**Location:** [middleware.ts](../../middleware.ts)

Protects all routes by:
- Validating session on every request
- Checking user role and approval status
- Blocking suspended accounts
- Handling role-based redirects

**Configuration:**
```typescript
export const config = {
  matcher: [
    // Protects all routes except API, static files, etc.
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
```

**Flow:**
1. Request → Middleware validates session
2. Checks if route is public (login, signup) → Allow
3. Checks if user is authenticated → Redirect to login if not
4. Fetches user profile from DB (role, status, approval_status)
5. Validates role can access route
6. Checks approval status if needed → Redirect to pending-approval
7. Blocks suspended users → Redirect to account-suspended

#### 2. API Authorization Wrapper (`lib/api/protect-route.ts`)

**Location:** [lib/api/protect-route.ts](../../lib/api/protect-route.ts)

Protects API routes with role-based access control.

**Usage Example:**
```typescript
import { verifyApiAuth } from '@/lib/api/protect-route'

export async function POST(req: NextRequest) {
  // Verify auth and role
  const authResult = await verifyApiAuth(req, {
    requiredRoles: ['vendor', 'admin'],
    requireApproval: true,
    auditAction: 'vendor.createAd'
  })

  if (!authResult.authorized) {
    return authResult.response
  }

  const { user, profile } = authResult
  // ... rest of handler
}
```

**Options:**
- `requiredRoles`: Array of allowed roles (e.g., `['admin', 'vendor']`)
- `requireApproval`: Check approval_status for vendors/technicians
- `auditAction`: Name of action to log
- `logSuccess`: Whether to log on success (default: true)

**Checks Performed:**
1. User is authenticated
2. User exists in database
3. User is not suspended
4. User has required role
5. User has approval status (if required)

---

## Rate Limiting

### Overview

Prevents brute-force attacks on login and other sensitive endpoints.

### Configuration

**Location:** [lib/rate-limit/rate-limiter.ts](../../lib/rate-limit/rate-limiter.ts)

**Presets:**
```typescript
const RATE_LIMIT_PRESETS = {
  login: { maxRequests: 5, windowMs: 60 * 1000 },      // 5 per minute
  signup: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  api: { maxRequests: 30, windowMs: 60 * 1000 },        // 30 per minute
  admin: { maxRequests: 10, windowMs: 60 * 1000 },      // 10 per minute
  vendor: { maxRequests: 20, windowMs: 60 * 1000 },     // 20 per minute
}
```

### Usage

#### In Login Action
```typescript
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit/rate-limiter'

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email')

  // Check if rate limited
  if (checkRateLimit(email, 'login')) {
    return {
      success: false,
      message: 'Too many login attempts. Please try again later.',
      errors: {}
    }
  }

  // ... perform login

  // Reset rate limit after successful login
  resetRateLimit(email, 'login')
}
```

#### Custom Limits
```typescript
const isLimited = checkRateLimit(
  identifier,
  'api',
  { maxRequests: 100, windowMs: 60000 }
)
```

### Getting Rate Limit Info
```typescript
const { remaining, resetTime } = getRemainingRequests(email, 'login')
console.log(`${remaining} attempts remaining. Resets at ${new Date(resetTime)}`)
```

---

## Audit Logging

### Overview

Logs all critical security events for compliance and analysis.

### Configuration

**Location:** [lib/audit/audit-logger.ts](../../lib/audit/audit-logger.ts)

**Database Schema:**
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,           -- e.g., 'auth.login.success'
  user_id TEXT NOT NULL,          -- Actor (who performed action)
  target_user_id TEXT,            -- Subject (who was affected)
  status TEXT NOT NULL,           -- 'success', 'error', 'unauthorized', 'forbidden'
  reason TEXT,                    -- Error or denial reason
  route TEXT,                     -- API route or page path
  metadata TEXT,                  -- JSON with additional context
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Usage

#### Basic Event Logging
```typescript
import { logAuditEvent } from '@/lib/audit/audit-logger'

await logAuditEvent({
  action: 'auth.login.success',
  userId: user.id,
  status: 'success',
  metadata: { role: 'vendor', email: user.email }
})
```

#### Admin Action Logging
```typescript
await logAuditEvent({
  action: 'admin.suspend_user',
  userId: adminId,              // Who did it
  targetUserId: suspendedUserId, // Who was affected
  status: 'success',
  metadata: {
    previousStatus: 'active',
    newStatus: 'suspended',
    reason: 'Spam violation'
  }
})
```

#### Error Logging
```typescript
await logAuditEvent({
  action: 'auth.login.failed',
  userId: email,
  status: 'unauthorized',
  reason: 'Invalid credentials',
  route: '/api/auth/login'
})
```

### Querying Audit Logs

#### User's Activity
```typescript
import { getUserAuditLogs } from '@/lib/audit/audit-logger'

const logs = await getUserAuditLogs(userId, limit = 50)
```

#### Admin Actions
```typescript
import { getAdminAuditLogs } from '@/lib/audit/audit-logger'

const adminLogs = await getAdminAuditLogs(limit = 100)
```

#### Failed Auth Attempts
```typescript
import { getFailedAuthAttempts } from '@/lib/audit/audit-logger'

const failures = await getFailedAuthAttempts(userId, sinceMinutes = 30)
```

### Common Actions Logged

```
Authentication:
  - auth.login.success
  - auth.login.failed
  - auth.login.rate_limited
  - auth.logout.success
  - auth.logout.failed

API Access:
  - api.auth.success
  - api.auth.failed
  - api.unauthorized
  - api.error

Admin Operations:
  - admin.suspend_user
  - admin.approve_vendor
  - admin.reject_vendor
  - admin.create_admin

User Operations:
  - vendor.apply
  - user.create
  - user.update
```

---

## CSRF Protection

### Overview

Prevents Cross-Site Request Forgery attacks using token-based verification.

### Configuration

**Location:** [lib/security/csrf-protection.ts](../../lib/security/csrf-protection.ts)

**Token Storage:**
- Cookie: `__csrf_token` (httpOnly, Secure, SameSite=Lax)
- Form Field: `_csrf`
- Header: `x-csrf-token`

### Usage

#### In Layout (Generate Token)
```typescript
import { getCsrfToken, createCsrfMetaTag } from '@/lib/security/csrf-protection'

export default async function RootLayout({ children }) {
  const csrfToken = await getCsrfToken()
  const metaTag = createCsrfMetaTag(csrfToken)

  return (
    <html>
      <head>
        <meta name={metaTag.name} content={metaTag.content} />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

#### In Forms
```typescript
import { getCsrfInputField } from '@/lib/security/csrf-protection'

export default function MyForm() {
  const csrfToken = /* get from meta tag or props */
  const inputField = getCsrfInputField(csrfToken)

  return (
    <form method="POST" action="/api/create">
      <input type="hidden" name={inputField.name} value={inputField.value} />
      {/* form fields */}
    </form>
  )
}
```

#### In API Routes (Validate Token)
```typescript
import { verifyCsrfToken } from '@/lib/security/csrf-protection'

export async function POST(req: NextRequest) {
  // Validate CSRF token
  const isValid = await verifyCsrfToken(req)
  if (!isValid) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    )
  }

  // Process request
}
```

#### In Fetch Requests
```typescript
// Get token from meta tag
const token = document.querySelector('meta[name="csrf-token"]')?.content

// Send request with token
const response = await fetch('/api/create', {
  method: 'POST',
  headers: {
    'x-csrf-token': token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ /* data */ })
})
```

---

## API Route Protection

### Pattern

All API routes should use the `verifyApiAuth` wrapper:

```typescript
import { NextResponse, NextRequest } from 'next/server'
import { verifyApiAuth } from '@/lib/api/protect-route'
import { logAuditEvent } from '@/lib/audit/audit-logger'

export async function POST(req: NextRequest) {
  // 1. Verify auth and role
  const authResult = await verifyApiAuth(req, {
    requiredRoles: ['admin', 'vendor'],
    requireApproval: true,
    auditAction: 'api.action.name'
  })

  if (!authResult.authorized) {
    return authResult.response
  }

  const { user, profile } = authResult

  try {
    // 2. Parse request
    const body = await req.json()
    // Validate with zod schema
    const parsed = mySchema.safeParse(body)
    if (!parsed.success) {
      await logAuditEvent({
        action: 'api.validation.failed',
        userId: user.id,
        status: 'error',
        reason: 'Invalid input'
      })
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      )
    }

    // 3. Process request
    const result = await processData(parsed.data)

    // 4. Log success
    await logAuditEvent({
      action: 'api.action.success',
      userId: user.id,
      status: 'success'
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('[API Error]', error)
    await logAuditEvent({
      action: 'api.action.error',
      userId: user.id,
      status: 'error',
      reason: error instanceof Error ? error.message : 'Unknown'
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## Migration Steps

### Phase 1: Deploying New Security Infrastructure

1. **Database Migration**
   ```bash
   npm run db:push  # Adds auditLogs table
   ```

2. **Deployment**
   - Deploy middleware.ts
   - Deploy protect-route.ts
   - Deploy audit-logger.ts
   - Deploy rate-limiter.ts
   - Deploy csrf-protection.ts

3. **Testing**
   - Test middleware blocks unauthenticated access
   - Test API routes require proper role
   - Test rate limiting works
   - Verify audit logs are created

### Phase 2: Updating Existing API Routes

For each API route in `/app/api`:

1. Add `verifyApiAuth` call
2. Add proper error handling
3. Add audit logging
4. Test with wrong role/status
5. Verify audit logs

Example:
```typescript
// BEFORE
export async function POST(req: Request) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Unauthorized
  // ... process

// AFTER
export async function POST(req: NextRequest) {
  const authResult = await verifyApiAuth(req, {
    requiredRoles: ['admin'],
    auditAction: 'admin.deleteUser'
  })
  if (!authResult.authorized) return authResult.response
  // ... process
}
```

### Phase 3: Adding CSRF Protection

1. Update layout to generate token:
   ```typescript
   const csrfToken = await getCsrfToken()
   ```

2. Add to forms and fetch requests

3. Validate in API routes:
   ```typescript
   const isValid = await verifyCsrfToken(req)
   ```

---

## Security Checklist

- [ ] Middleware.ts exports and configured
- [ ] API routes use `verifyApiAuth`
- [ ] All auth events logged
- [ ] Rate limiting enabled on login/signup
- [ ] Admin pages verify role on server
- [ ] Suspended users blocked everywhere
- [ ] CSRF tokens on all forms
- [ ] No auth data in localStorage
- [ ] Error messages are generic
- [ ] Audit logs are queryable
- [ ] Database migrations applied

---

## Best Practices

1. **Never trust client-side role**
   - Always re-validate on server
   - Check role in middleware AND API route

2. **Always log security events**
   - Failed logins
   - Admin actions
   - Role changes
   - Approval status changes

3. **Use generic error messages**
   - Don't reveal if email exists
   - Don't reveal specific permission issues

4. **Invalidate cache on sensitive changes**
   - Use `revalidatePath()` after role updates
   - Use `revalidateTag()` for specific caches

5. **Monitor rate limits**
   - Watch for brute force attempts
   - Alert on multiple failed logins

6. **Regular audit reviews**
   - Review admin actions weekly
   - Look for suspicious patterns
   - Archive old logs

---

## Testing Security

### Test Unauthorized Access
```bash
# Test accessing /admin without admin role
curl -H "Cookie: auth-token=user-token" http://localhost:3000/admin
# Expected: 403 or redirect to /unauthorized
```

### Test Rate Limiting
```bash
# Test 5+ failed logins in 1 minute
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -d '{"email":"test@example.com","password":"wrong"}'
  sleep 5
done
# Expected: 429 Too Many Requests after 5 attempts
```

### Test Audit Logging
```typescript
// Check audit logs after any sensitive operation
const logs = await getAdminAuditLogs()
console.log(logs)
```

---

## Future Enhancements

1. **Redis Session Store** - Replace in-memory rate limit store
2. **IP-based Rate Limiting** - Rate limit by IP instead of email
3. **2FA** - Two-factor authentication
4. **Session Recording** - Log HTTP method, IP, user agent
5. **Real-time Alerts** - Alert on suspicious activity
6. **Breach Database** - Check passwords against breached databases

---

**Last Updated:** February 18, 2026  
**Maintained By:** Security Team
