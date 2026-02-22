import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Vendor Dashboard',
}

/**
 * Server-side layout guard for vendor dashboard
 * CRITICAL: Prevents unapproved vendors from accessing /dashboard/vendor
 * 
 * Layered defense:
 * 1. Middleware checks role + approval_status
 * 2. This layout validates on every vendor route access
 * 3. Server actions (getVendorProfile) also verify approval
 */
export default async function VendorDashboardLayout({
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

    // 2. Fetch profile and verify vendor + approved status
    // TODO: Add suspension check once migration confirmed applied
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, approval_status')
        .eq('id', user.id)
        .single()

    if (profileError || !profile) {
        redirect('/dashboard')
    }

    // 3. CRITICAL: Block non-vendors
    if (profile.role !== 'vendor') {
        redirect('/unauthorized')
    }

    // 4. CRITICAL: Block unapproved vendors
    if (profile.approval_status !== 'approved') {
        redirect('/pending-approval')
    }

    // 5. Vendor is authenticated and approved - allow access
    return children
}
