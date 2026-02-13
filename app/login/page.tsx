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
    const [state, formAction, isPending] = useActionState(loginAction, initialState)
    const router = useRouter()
    const { user, profile, loading } = useAuth()
    const formErrors = (state?.errors || {}) as Record<string, string[]>

    useEffect(() => {
        if (!loading && user && profile?.role) {
            // Redirect based on user role using the centralized utility
            const dashboard = getRoleDashboard(profile.role)
            router.replace(dashboard)
        }
    }, [user, profile?.role, loading, router])

    // If user is already logged in and has a role, show loading state while redirecting
    if (!loading && user && profile?.role) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">Redirecting to your dashboard...</p>
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
                        {state?.message && <FormError message={state.message} />}

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
