import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Server-side layout guard for user dashboard
 * Ensures only users (and approved vendors/technicians) can access
 */
export default async function UserDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    // 1. Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        redirect('/login')
    }

    // 2. Fetch profile to validate user exists
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profileError || !profile) {
        redirect('/dashboard')
    }

    // Users can view the user dashboard
    // Vendors/technicians can also access (for cross-platform features)
    // Admins should not see this
    if (profile.role === 'admin') {
        redirect('/admin')
    }

    return children
}
