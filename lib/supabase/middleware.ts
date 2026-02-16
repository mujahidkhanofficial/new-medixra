
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
    const publicPaths = ['/login', '/signup']
    const isPublicPath = publicPaths.some(path =>
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
        // Fetch user's profile to check role, approval status, AND suspension status
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, approval_status, status')
            .eq('id', user.id)
            .single()

        const userRole = profile?.role
        const approvalStatus = profile?.approval_status
        const userStatus = profile?.status

        // ⚠️ CRITICAL SECURITY: Block suspended users from accessing ANY protected route
        // This check happens BEFORE all other checks to prevent any bypass
        if (userStatus === 'suspended') {
            return NextResponse.redirect(new URL('/account-suspended', request.url))
        }

        // Check if user's role can access this route
        if (!canAccessRoute(request.nextUrl.pathname, userRole)) {
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
