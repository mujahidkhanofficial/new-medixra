'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { FormError } from '@/components/ui/form-error'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { useAuth } from '@/components/providers/auth-provider'
import { loginSchema } from '@/lib/validation'
import { getErrorMessage } from '@/lib/error-handler'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()
    const { user, loading } = useAuth()

    useEffect(() => {
        if (!loading && user) {
            router.replace('/dashboard')
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setErrors({})

        try {
            // Validate inputs
            const result = await loginSchema.parseAsync({ email, password })

            // Authenticate
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: result.email,
                password: result.password,
            })

            if (authError) {
                setError(getErrorMessage(authError))
                return
            }

            // Check user role and redirect accordingly
            const { data: { user: authUser } } = await supabase.auth.getUser()
            const role = authUser?.user_metadata?.role || 'buyer'

            if (role === 'vendor') {
                router.push('/dashboard/vendor')
            } else if (role === 'admin') {
                router.push('/admin')
            } else {
                router.push('/dashboard/buyer')
            }
            router.refresh()
        } catch (err) {
            setError(getErrorMessage(err))
        } finally {
            setIsLoading(false)
        }
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

                    <form onSubmit={handleLogin} className="space-y-6 bg-card p-8 rounded-xl border border-border shadow-sm">
                        {error && <FormError message={error} />}

                        <FormField label="Email Address" required error={errors.email}>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                disabled={isLoading}
                            />
                        </FormField>

                        <FormField label="Password" required error={errors.password}>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                disabled={isLoading}
                            />
                        </FormField>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Signing in...' : 'Sign In'}
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
