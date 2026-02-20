import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { canAccessRoute } from '@/lib/auth/role-redirect'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
        return supabaseResponse
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh the auth token
    const { data: { user } } = await supabase.auth.getUser()

    // Public routes that should be accessible to unauthenticated users
    const publicPaths = ['/', '/login', '/signup', '/about-us', '/how-it-works', '/products', '/technicians', '/shop', '/privacy', '/terms', '/safety-compliance']
    const isPublicPath = publicPaths.some(path =>
        path === '/' ?
            request.nextUrl.pathname === '/' :
            request.nextUrl.pathname.startsWith(path)
    )

    // Protected routes configuration
    const protectedPaths = ['/dashboard', '/admin', '/post-ad']
    const isProtectedPath = protectedPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    )

    // 1. Public routes are accessible to anyone (both authenticated and unauthenticated users)
    // No restrictions here - let the client-side handle redirects for already-logged-in users
    if (isPublicPath) {
        return supabaseResponse
    }

    // 2. Check if user is authenticated for protected routes
    if (isProtectedPath && !user) {
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
    }

    // 3. Check role-based authorization for protected routes
    if (isProtectedPath && user) {
        // Optimization: Try to read role and status from JWT metadata (custom claims) first
        // This avoids a database query on every request if triggers are perfectly in sync
        let userRole = user.app_metadata?.role || user.user_metadata?.role
        let approvalStatus = user.app_metadata?.approval_status || user.user_metadata?.approval_status
        let userStatus = user.app_metadata?.status || user.user_metadata?.status

        // FALLBACK: If JWT metadata is missing or out-of-sync, perform a targeted, fast DB lookup.
        // This ensures legitimate users aren't locked out of '/post-ad' etc. due to trigger lag.
        if (!userRole || !approvalStatus || !userStatus) {
            console.log('[Middleware] JWT claims missing, falling back to DB lookup for user:', user.id)
            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, approval_status, status')
                    .eq('id', user.id)
                    .single()

                if (profile) {
                    // Strictly use DB values as the source of truth if a fallback was required
                    userRole = profile.role
                    approvalStatus = profile.approval_status
                    userStatus = profile.status
                }
            } catch (error) {
                console.error('[Middleware] DB fallback failed:', error)
                // Continue with whatever we have, restrictive defaults will apply below
            }
        }

        // ⚠️ CRITICAL SECURITY: Block suspended users from accessing ANY protected route
        // This check happens BEFORE all other checks to prevent any bypass
        if (userStatus === 'suspended') {
            console.log('[Middleware] User suspended, redirecting')
            return NextResponse.redirect(new URL('/account-suspended', request.url))
        }

        // Check if user's role can access this route
        if (!canAccessRoute(request.nextUrl.pathname, userRole)) {
            console.log('[Middleware] Access denied for role:', userRole, 'path:', request.nextUrl.pathname)
            return NextResponse.redirect(new URL('/unauthorized', request.url))
        }

        // CRITICAL: For vendor/technician restricted routes, also check approval status
        const vendorTechRoutes = ['/dashboard/vendor', '/dashboard/technician']
        const isVendorTechRoute = vendorTechRoutes.some(route => request.nextUrl.pathname.startsWith(route))

        if (isVendorTechRoute && (userRole === 'vendor' || userRole === 'technician')) {
            if (approvalStatus !== 'approved') {
                // Redirect to pending approval page, not unauthorized
                return NextResponse.redirect(new URL('/pending-approval', request.url))
            }
        }
    }

    return supabaseResponse
}
