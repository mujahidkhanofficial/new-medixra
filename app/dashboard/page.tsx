import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getRoleDashboard } from '@/lib/auth/role-redirect'
import { Loader2 } from 'lucide-react'

// This page acts as a router/dispatcher for the dashboard
export default async function DashboardPage() {
    const supabase = await createClient()

    if (!supabase) {
        redirect('/login')
    }

    // 1. Check Auth (Server-Side)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        redirect('/login')
    }

    // 2. Check Profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, approval_status')
        .eq('id', user.id)
        .single() as { data: { role: string, approval_status: string } | null, error: any }

    // 2.5. Early admin redirect - CRITICAL for isolation
    // If user has admin role, they should NEVER see regular dashboard
    if (profile && profile.role === 'admin') {
        redirect('/admin')
    }

    // 3. Handle Missing Profile (Self-healing on server with UPSERT to prevent race conditions)
    if (profileError && !profile) {
        const requestedRole = user.user_metadata.role
        const safeRole: 'user' | 'vendor' | 'technician' = requestedRole === 'vendor' || requestedRole === 'technician' ? requestedRole : 'user'

        // Use UPSERT to handle race conditions where trigger might have created it
        const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                email: user.email || '',
                full_name: user.user_metadata.full_name || 'User',
                role: safeRole,
                avatar_url: user.user_metadata.avatar_url || null,
                approval_status: (safeRole === 'vendor' || safeRole === 'technician') ? 'pending' : 'approved',
                updated_at: new Date().toISOString()
            } as any, { onConflict: 'id' })
            .select('role, approval_status')
            .single()

        if (!createError && newProfile) {
            // Check approval status first
            if ((newProfile.role === 'vendor' || newProfile.role === 'technician') && newProfile.approval_status !== 'approved') {
                redirect('/pending-approval')
            }

            // Ensure specialized rows exist
            if (newProfile.role === 'vendor') {
                try {
                    const vendorMeta = user.user_metadata?.vendor || null
                    await supabase.from('vendors').upsert({
                        id: user.id,
                        business_name: vendorMeta?.company_name || user.user_metadata?.full_name || 'Vendor',
                        contact_phone: vendorMeta?.phone || null,
                        whatsapp_number: vendorMeta?.phone || null,
                        city: vendorMeta?.city || null,
                    } as any, { onConflict: 'id' })
                } catch (err) {
                    console.error('Error upserting vendor row:', err)
                }
            }

            if (newProfile.role === 'technician') {
                try {
                    const techMeta = user.user_metadata?.technician || null
                    await supabase.from('technicians').upsert({
                        id: user.id,
                        speciality: techMeta?.speciality || null,
                        experience_years: techMeta?.experience_years || null,
                        city: techMeta?.city || null,
                    } as any, { onConflict: 'id' })
                } catch (err) {
                    console.error('Error upserting technician row:', err)
                }
            }

            // Use centralized role redirect utility
            const dashboardPath = getRoleDashboard(newProfile.role)
            redirect(dashboardPath)
        }

        console.error('Failed to create/fetch profile on dashboard entry:', createError)
        redirect(getRoleDashboard('user'))
    }

    // 4. Standard Redirect
    // Check approval status for restricted roles
    if ((profile?.role === 'vendor' || profile?.role === 'technician') && profile?.approval_status !== 'approved') {
        redirect('/pending-approval')
    }

    if (profile?.role === 'vendor') {
        // Ensure vendors row exists
        try {
            const { data: existingVendor } = await supabase.from('vendors').select('id').eq('id', user.id).single()
            if (!existingVendor) {
                const vendorMeta = user.user_metadata?.vendor || null
                await supabase.from('vendors').upsert({
                    id: user.id,
                    business_name: vendorMeta?.company_name || user.user_metadata?.full_name || 'Vendor',
                    contact_phone: vendorMeta?.phone || null,
                    whatsapp_number: vendorMeta?.phone || null,
                    city: vendorMeta?.city || null,
                } as any, { onConflict: 'id' })
            }
        } catch (err) {
            console.error('Error ensuring vendor row exists:', err)
        }
    } else if (profile?.role === 'technician') {
        // Ensure technicians row exists
        try {
            const { data: existingTech } = await supabase.from('technicians').select('id').eq('id', user.id).single()
            if (!existingTech) {
                const techMeta = user.user_metadata?.technician || null
                await supabase.from('technicians').upsert({
                    id: user.id,
                    speciality: techMeta?.speciality || null,
                    experience_years: techMeta?.experience_years || null,
                    city: techMeta?.city || null,
                } as any, { onConflict: 'id' })
            }
        } catch (err) {
            console.error('Error ensuring technician row exists:', err)
        }
    }

    // Use centralized role redirect utility
    const dashboardPath = getRoleDashboard(profile?.role)
    redirect(dashboardPath)
}
