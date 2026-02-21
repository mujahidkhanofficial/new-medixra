
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

export function AuthProvider({ children, initialSession = null }: { children: React.ReactNode, initialSession?: Session | null }) {
    const [session, setSession] = useState<Session | null>(initialSession)
    const [user, setUser] = useState<User | null>(initialSession?.user ?? null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(!initialSession)
    const supabase = createClient()

    const fetchProfile = async (userId: string) => {
        console.log('[AuthProvider] Fetching profile for:', userId)
        try {
            // 1. Fetch basic profile first (fast)
            const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                // Ignore "No rows found" error (PGRST116) as it just means profile doesn't exist yet
                if (error.code === 'PGRST116') {
                    return null
                }

                // Ignore completely empty error objects often caused by aborted signals in React Strict Mode
                if (typeof error === 'object' && error !== null && Object.keys(error).length === 0) {
                    return null
                }

                // Also ignore AbortError type if it somehow gets wrapped
                if (error.name === 'AbortError' || error.message?.includes('aborted')) {
                    return null
                }

                console.error('[AuthProvider] Fetch Error:', error)
                return null
            }

            console.log('[AuthProvider] Profile Found:', profileData?.role)

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
        } catch (error: any) {
            // Ignore abort errors
            if (error.name === 'AbortError' || error.message?.includes('aborted')) {
                return null
            }
            console.error('[AuthProvider] Unexpected error:', error)
            return null
        }
    }

    const refreshProfile = async () => {
        if (!user) return
        const data = await fetchProfile(user.id)
        if (data) setProfile(data)
    }

    // Handle props change (server-side update of session)
    useEffect(() => {
        if (initialSession?.user?.id !== user?.id) {
            setSession(initialSession)
            setUser(initialSession?.user ?? null)
            if (initialSession?.user) {
                fetchProfile(initialSession.user.id).then(data => setProfile(data))
            } else {
                setProfile(null)
            }
        }
    }, [initialSession])

    useEffect(() => {
        let mounted = true

        const initializeAuth = async () => {
            try {
                // If we already have a session from props, we might just want to fetch the profile if missing
                if (initialSession?.user && !profile) {
                    const profileData = await fetchProfile(initialSession.user.id)
                    if (mounted) {
                        setProfile(profileData)
                        setLoading(false)
                    }
                    return
                }

                // Fallback to client-side session fetch if no prop provided or strict check needed
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
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error("Auth initialization error:", error)
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
                // ALWAYS refetch profile on state change to prevent new-tab race conditions
                // where the initial Session is valid but the profile object is null
                const profileData = await fetchProfile(session.user.id)
                if (mounted) setProfile(profileData)
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
