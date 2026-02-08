'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function DashboardRedirect() {
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            // Check profiles table for role
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (error) {
                console.error('Error fetching profile:', error)
                // Default to buyer if profile check fails but user is authenticated
                router.push('/dashboard/buyer')
                return
            }

            if (profile && (profile as any).role === 'vendor') {
                router.push('/dashboard/vendor')
            } else if (profile && (profile as any).role === 'admin') {
                router.push('/admin') // Redirect admins to admin panel
            } else {
                router.push('/dashboard/buyer')
            }
        }

        checkUser()
    }, [router, supabase])

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4 font-sans">
                <div className="relative h-12 w-12 text-primary">
                    <Loader2 className="h-12 w-12 animate-spin-slow" />
                </div>
                <p className="text-muted-foreground animate-pulse text-sm font-medium tracking-tight">
                    Preparing your workspace...
                </p>
            </div>
        </div>
    )
}
