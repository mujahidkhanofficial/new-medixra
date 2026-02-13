/**
 * Role-based redirect mapping utility
 * Defines where each role should be routed after login or unauthorized access
 */

export type UserRole = 'admin' | 'vendor' | 'technician' | 'user'

export interface RoleDashboard {
    path: string
    label: string
}

/**
 * Maps each role to their primary dashboard destination
 */
export const ROLE_DASHBOARDS: Record<UserRole, RoleDashboard> = {
    admin: { path: '/admin', label: 'Admin Dashboard' },
    vendor: { path: '/dashboard/vendor', label: 'Vendor Dashboard' },
    technician: { path: '/dashboard/technician', label: 'Technician Dashboard' },
    user: { path: '/dashboard/user', label: 'User Dashboard' },
}

/**
 * Routes that require specific roles
 * Other routes are allowed if authenticated
 */
export const ROLE_PROTECTED_ROUTES: Record<string, UserRole[]> = {
    '/admin': ['admin'],
    '/post-ad': ['vendor'],
    '/dashboard/vendor': ['vendor'],
    '/dashboard/technician': ['technician'],
    '/dashboard/user': ['user', 'vendor', 'technician'], // Users can access other user dashboards
}

/**
 * Get the redirect destination for a given role
 * @param role The user's role
 * @returns The dashboard path for the role, or '/dashboard/user' as fallback
 */
export function getRoleDashboard(role?: string | null): string {
    if (!role || !ROLE_DASHBOARDS[role as UserRole]) {
        return ROLE_DASHBOARDS.user.path
    }
    return ROLE_DASHBOARDS[role as UserRole].path
}

/**
 * Check if a user with a given role can access a specific route
 * @param route The requested route path
 * @param role The user's role
 * @returns true if the role is allowed to access the route, false otherwise
 */
export function canAccessRoute(route: string, role?: string | null): boolean {
    if (!role) return false

    // Check if this route has specific role requirements
    for (const [protectedRoute, allowedRoles] of Object.entries(ROLE_PROTECTED_ROUTES)) {
        if (route.startsWith(protectedRoute)) {
            return allowedRoles.includes(role as UserRole)
        }
    }

    // If no specific protection, allow any authenticated user
    return true
}

/**
 * Get the redirect destination when an unauthorized user tries to access a route
 * They are sent to their role's primary dashboard
 * @param role The user's role
 * @param currentPath The path they were trying to access
 * @returns The redirect destination
 */
export function getUnauthorizedRedirect(role?: string | null, currentPath?: string): string {
    const dashboard = getRoleDashboard(role)
    
    // Log attempted unauthorized access if we're not already in a safe zone
    if (currentPath && !currentPath.startsWith(dashboard)) {
        console.warn(`Unauthorized access attempt: role=${role} tried to access ${currentPath}, redirecting to ${dashboard}`)
    }

    return dashboard
}
