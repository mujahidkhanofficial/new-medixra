import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Engineer Dashboard',
}

/**
 * Server-side layout guard for engineer dashboard
 * CRITICAL: Prevents unapproved engineers from accessing /dashboard/engineer
 * 
 * Layered defense matches vendor dashboard:
 * 1. Middleware checks role + approval_status
 * 2. This layout validates on every engineer route access
 * 3. Server actions also verify approval
 */
export default async function EngineerDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    if (!supabase) {
        redirect('/login')
    }

    // 1. Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        redirect('/login')
    }

    // 2. Fetch profile and verify engineer + approved status
    // TODO: Add suspension check once migration confirmed applied
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, approval_status')
        .eq('id', user.id)
        .single()

    if (profileError || !profile) {
        redirect('/dashboard')
    }

    // 3. CRITICAL: Block non-engineers
    if (profile.role !== 'engineer') {
        redirect('/unauthorized')
    }

    // 4. CRITICAL: Block unapproved engineers
    if (profile.approval_status !== 'approved') {
        redirect('/pending-approval')
    }

    // 5. Engineer is authenticated and approved - allow access
    return children
}
