'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { FormError } from '@/components/ui/form-error'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { useAuth } from '@/components/providers/auth-provider'
import { loginAction } from '@/lib/actions/auth'
import { getRoleDashboard } from '@/lib/auth/role-redirect'

const initialState = {
    message: '',
    errors: {} as Record<string, string[]>,
    success: false,
}

export default function LoginPage() {
    // @ts-ignore
    const [state, formAction, isPending] = useActionState(loginAction, initialState)
    const router = useRouter()
    const { user, profile, loading } = useAuth()
    const formErrors = (state?.errors || {}) as Record<string, string[]>

    // Handle server action success
    useEffect(() => {
        if (state?.success && state.redirect) {
            router.replace(state.redirect)
        }
    }, [state, router])

    // Handle server action success (Just logged in)
    useEffect(() => {
        if (state?.success && state.redirect) {
            // Force a hard navigation if router.replace doesn't work effectively
            router.replace(state.redirect)
        }
    }, [state, router])

    // If login was successful (via form action), show loading spinner immediately
    // This takes precedence over the form
    if (state?.success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <div className="space-y-2">
                        <p className="text-foreground font-medium">Login Successful!</p>
                        <p className="text-muted-foreground text-sm">Taking you to your dashboard...</p>
                    </div>
                </div>
            </div>
        )
    }

    // If user is ALREADY logged in (visited page while authenticated), show the choice screen
    // We strictly check this ONLY if we haven't just successfully logged in
    if (!loading && user && profile?.role && !state?.success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
                <div className="w-full max-w-md text-center space-y-6 bg-card p-8 rounded-xl border border-border shadow-sm">
                    <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-foreground">Welcome back!</h2>
                        <p className="text-muted-foreground">
                            You are currently signed in as <span className="font-semibold text-foreground">{profile.full_name || user.email}</span>.
                        </p>
                    </div>

                    <div className="grid gap-3">
                        <Button className="w-full" asChild>
                            <Link href={getRoleDashboard(profile.role)}>
                                Continue to Dashboard
                            </Link>
                        </Button>

                        <form action={async () => {
                            // Client-side logout to clear state logic if needed
                            // We use a form to invoke the server action via a wrapper if needed, 
                            // but here we can just use a button that calls a function
                        }}>
                            <Button
                                variant="outline"
                                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={async () => {
                                    // Hard refresh logout
                                    const { createClient } = await import('@/lib/supabase/client')
                                    const supabase = createClient()
                                    await supabase.auth.signOut()
                                    window.location.reload()
                                }}
                            >
                                Sign Out
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }

    // Show loading state while checking authentication status
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navigation />
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
                        <p className="mt-2 text-muted-foreground">Sign in to your Medixra account</p>
                    </div>

                    <form action={formAction} className="space-y-6 bg-card p-8 rounded-xl border border-border shadow-sm">
                        {state?.message && !state?.success && <FormError message={state.message} />}
                        {state?.message && state?.success && (
                            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-md text-sm font-medium flex items-center justify-center">
                                {state.message}
                            </div>
                        )}

                        <FormField label="Email Address" required error={formErrors.email?.[0]}>
                            <Input
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                disabled={isPending}
                            />
                        </FormField>

                        <FormField label="Password" required error={formErrors.password?.[0]}>
                            <Input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                disabled={isPending}
                            />
                        </FormField>

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? 'Signing in...' : 'Sign In'}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <Link href="/signup" className="text-primary hover:underline font-medium">
                                Sign up
                            </Link>
                        </p>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    )
}
