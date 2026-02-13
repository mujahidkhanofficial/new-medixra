import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getRoleDashboard } from '@/lib/auth/role-redirect'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

/**
 * 403 Unauthorized page
 * Shown when a user tries to access a route they don't have permission for
 */
export default async function UnauthorizedPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // If not logged in, redirect to login
    if (!user) {
        redirect('/login')
    }

    // Fetch user's profile to show their proper dashboard
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const dashboardPath = getRoleDashboard(profile?.role)

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navigation />
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md space-y-8 text-center">
                    <div>
                        <h1 className="text-4xl font-bold text-foreground">403</h1>
                        <p className="text-xl font-semibold text-muted-foreground mt-2">Access Denied</p>
                        <p className="text-muted-foreground mt-4">
                            You don't have permission to access this page. Your account is restricted to specific areas.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Link href={dashboardPath} className="block">
                            <Button className="w-full">
                                Go to Your Dashboard
                            </Button>
                        </Link>
                        <Link href="/" className="block">
                            <Button variant="outline" className="w-full">
                                Return Home
                            </Button>
                        </Link>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        If you believe this is a mistake, please contact support.
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    )
}
