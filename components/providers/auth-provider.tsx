
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { toast } from 'sonner'

type Profile = Database['public']['Tables']['profiles']['Row'] & {
    vendors?: { showroom_slug: string | null } | null
}

type AuthContextType = {
    session: Session | null
    user: User | null
    profile: Profile | null
    loading: boolean
    refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    profile: null,
    loading: true,
    refreshProfile: async () => { },
})

export const useAuth = () => {
    return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchProfile = async (userId: string) => {
        try {
            // 1. Fetch basic profile first (fast)
            const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                console.error('Error fetching profile:', error)
                return null
            }

            // 2. If vendor, fetch vendor details (lazy load)
            if (profileData.role === 'vendor') {
                const { data: vendorData } = await supabase
                    .from('vendors')
                    .select('showroom_slug')
                    .eq('id', userId)
                    .single()

                return { ...profileData, vendors: vendorData }
            }

            return profileData
        } catch (error) {
            console.error('Unexpected error fetching profile:', error)
            return null
        }
    }

    const refreshProfile = async () => {
        if (!user) return
        const data = await fetchProfile(user.id)
        if (data) setProfile(data)
    }

    useEffect(() => {
        let mounted = true

        const initializeAuth = async () => {
            try {
                // 1. Get initial session (cached from localStorage by Supabase)
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) throw error

                if (mounted) {
                    setSession(session)
                    setUser(session?.user ?? null)

                    if (session?.user) {
                        const profileData = await fetchProfile(session.user.id)
                        if (mounted) setProfile(profileData)
                    } else {
                        if (mounted) setProfile(null)
                    }
                }
            } catch (error) {
                console.error("Auth initialization error:", error)
                // Only show error toast for actual auth failures, not network timeouts
                const errorMsg = (error as any)?.message || ''
                if (mounted && !errorMsg.includes('timeout') && !errorMsg.includes('network')) {
                    toast.error('Authentication Error', {
                        description: 'Please check your connection and refresh.'
                    })
                }
            } finally {
                if (mounted) setLoading(false)
            }
        }

        initializeAuth()

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return

            // If we get an explicit event, we can trust it
            setSession(session)
            setUser(session?.user ?? null)

            if (session?.user) {
                // Only refetch profile if it's a SIGN_IN event or we don't have it yet
                if (event === 'SIGNED_IN' || !profile) {
                    const profileData = await fetchProfile(session.user.id)
                    if (mounted) setProfile(profileData)
                }
            } else {
                if (mounted) setProfile(null)
            }

            if (mounted) setLoading(false)
        })

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, []) // Empty dependency array is correct here

    const value = {
        session,
        user,
        profile,
        loading,
        refreshProfile
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
