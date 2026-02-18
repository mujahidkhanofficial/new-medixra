
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export default async function proxy(request: NextRequest) {
    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes - handled separately)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - public (public assets)
         * - favicon.ico (favicon file)
         * - *.png, *.jpg, *.jpeg, *.gif, *.webp, *.svg, *.woff, *.woff2, etc (static assets)
         */
        '/((?!api|_next|_assets|favicon|robots|sitemap|manifest|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot)$).*)',
    ],
}
