import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Loader2 } from 'lucide-react'

// This page acts as a router/dispatcher for the dashboard
export default async function DashboardPage() {
    const supabase = await createClient()

    // 1. Check Auth (Server-Side)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        redirect('/login')
    }

    // 2. Check Profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    // 3. Handle Missing Profile (Self-healing on server with UPSERT to prevent race conditions)
    if (profileError && !profile) {
        // Use UPSERT to handle race conditions where trigger might have created it
        const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                email: user.email || '',
                full_name: user.user_metadata.full_name || 'User',
                role: (user.user_metadata.role || 'buyer') as 'buyer' | 'vendor' | 'admin',
                avatar_url: user.user_metadata.avatar_url || null,
                updated_at: new Date().toISOString()
            } as any, { onConflict: 'id' })
            .select('role')
            .single()

        if (!createError && newProfile) {
            // Success - Redirect based on new role
            if (newProfile.role === 'vendor') redirect('/dashboard/vendor')
            if (newProfile.role === 'admin') redirect('/admin')
            redirect('/dashboard/buyer')
        }

        console.error('Failed to create/fetch profile on dashboard entry:', createError)
        redirect('/dashboard/buyer')
    }

    // 4. Standard Redirect
    if (profile?.role === 'vendor') {
        redirect('/dashboard/vendor')
    } else if (profile?.role === 'admin') {
        redirect('/admin')
    } else {
        redirect('/dashboard/buyer')
    }

    // Fallback UI (rarely seen due to server-side redirect)
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground text-sm">Redirecting...</p>
            </div>
        </div>
    )
}
