# Security Quick Reference Card

## 🔐 Core Security Rules

### ❌ DO NOT
- Don't trust client-side role
- Don't skip middleware checks
- Don't reveal specific error reasons
- Don't store auth state in localStorage
- Don't skip audit logging
- Don't ratify unlimited requests

### ✅ DO
- Always re-validate role on server
- Log all security events
- Use generic error messages
- Validate on every request
- Check suspension status
- Allow rate limiting to trigger

---

## 🚀 Quick Start Patterns

### Protect an API Route
```typescript
import { verifyApiAuth } from '@/lib/api/protect-route'

export async function POST(req: NextRequest) {
  const authResult = await verifyApiAuth(req, {
    requiredRoles: ['admin'],        // Or ['vendor', 'user']
    requireApproval: true,            // For vendors/technicians
    auditAction: 'admin.deleteUser'   // What to log
  })

  if (!authResult.authorized) {
    return authResult.response  // Already formatted error
  }

  const { user, profile } = authResult
  // Now safe to process request
}
```

### Log an Event
```typescript
import { logAuditEvent } from '@/lib/audit/audit-logger'

await logAuditEvent({
  action: 'admin.suspend_user',
  userId: adminId,
  targetUserId: userBeingSuspended,
  status: 'success',
  metadata: { reason: 'Spam violation' }
})
```

### Check Rate Limit
```typescript
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit/rate-limiter'

if (checkRateLimit(email, 'login')) {
  return { error: 'Too many attempts' }
}

// After successful login
resetRateLimit(email, 'login')
```

### CSRF Protection
```typescript
// In layout
import { getCsrfToken, createCsrfMetaTag } from '@/lib/security/csrf-protection'
const csrfToken = await getCsrfToken()
const metaTag = createCsrfMetaTag(csrfToken)
// Add to head: <meta name={metaTag.name} content={metaTag.content} />

// In API route
import { verifyCsrfToken } from '@/lib/security/csrf-protection'
const isValid = await verifyCsrfToken(req)
if (!isValid) return { error: 'Invalid token', status: 403 }
```

---

## 🎯 Common Scenarios

### Scenario: User tries to access admin page without role
```
Request → Middleware → Check auth → Check role
                                      ❌ User role ≠ admin
                                      → Redirect /unauthorized
```

### Scenario: Vendor not yet approved tries to post ad
```
Request → Middleware → Check auth → Check role → Check approval
                                                   ❌ status ≠ approved
                                                   → Redirect /pending-approval
```

### Scenario: Suspended user tries to login
```
POST /login → Rate limit check ✅ → Auth check ✅ → Status check
                                                      ❌ status = suspended
                                                      → Error: "Account Suspended"
```

### Scenario: API call with wrong role
```
POST /api/admin/* → Verify auth ✅ → Check role
                                      ❌ User role ≠ admin
                                      → Response: 403 Forbidden + audit log
```

---

## 📊 Rate Limit Limits

| Category | Max Requests | Time Window | Reset On |
|----------|--------------|-------------|----------|
| **login** | 5 | Per minute | Success |
| **signup** | 3 | Per hour | N/A |
| **api** | 30 | Per minute | N/A |
| **admin** | 10 | Per minute | N/A |
| **vendor** | 20 | Per minute | N/A |

---

## 🔍 Audit Events to Log

### Authentication
```
auth.login.success          // User logged in
auth.login.failed           // Wrong password
auth.login.rate_limited     // Too many attempts
auth.logout.success         // User logged out
```

### Authorization
```
api.auth.success            // API call authorized
api.auth.failed             // User not authenticated
api.unauthorized            // User lacks role
api.error                   // Server error
```

### Admin Actions
```
admin.suspend_user
admin.approve_vendor
admin.reject_vendor
admin.delete_user
admin.change_role
```

### User Actions
```
vendor.apply
vendor.update_profile
user.create_ad
user.save_item
```

---

## ✋ Error Messages

### Generic Messages (What users see)
```
"Invalid email or password"
"Account suspended"
"You don't have permission"
"Too many attempts, try again later"
```

### Never reveal
- Whether email exists
- Why specifically they don't have access
- What happened during processing
- Server internals or stack traces

---

## 🧪 Testing Checklist

### Security Testing
- [ ] Try accessing `/admin` without authentication
- [ ] Try `/admin` with user role (should block)
- [ ] Try accessing as unapproved vendor
- [ ] Try 6 failed logins (should rate limit)
- [ ] Check audit logs are created

### Happy Path Testing
- [ ] Login as user works
- [ ] Login as vendor works
- [ ] Login as admin works
- [ ] Admin page loads
- [ ] Vendor dashboard loads

### APIs Testing
```bash
# Test without auth
curl -X POST http://localhost:3000/api/admin/something
# Should return 401

# Test with wrong role
curl -X POST http://localhost:3000/api/admin/something \
  -H "Authorization: Bearer user-token"
# Should return 403

# Test with correct role (check audit log)
curl -X POST http://localhost:3000/api/admin/something \
  -H "Authorization: Bearer admin-token"
# Should return 200 + audit event
```

---

## 📞 Support

### Where to get help
- **middleware issues**: Check [middleware.ts](../../middleware.ts)
- **API protection**: See [lib/api/protect-route.ts](../../lib/api/protect-route.ts)
- **Rate limiting**: Read [lib/rate-limit/rate-limiter.ts](../../lib/rate-limit/rate-limiter.ts)
- **Audit logging**: Read [lib/audit/audit-logger.ts](../../lib/audit/audit-logger.ts)
- **CSRF**: Read [lib/security/csrf-protection.ts](../../lib/security/csrf-protection.ts)
- **Full guide**: [SECURITY_IMPLEMENTATION.md](../../SECURITY_IMPLEMENTATION.md)

### Common Questions

**Q: Why am I getting 401 on API call?**  
A: Missing authentication. Ensure you have valid session/token.

**Q: Why blocked with 403?**  
A: Wrong role. Check user has required role in database.

**Q: Why rate limited?**  
A: Too many requests. Rate limits reset after window expires.

**Q: How to see audit logs?**  
A: Query `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100`

**Q: CSRF token always invalid?**  
A: Ensure token generated in layout and passed in request header/form.

---

**Last Updated:** February 18, 2026
