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
import { signupSchema } from '@/lib/validation'
import { getErrorMessage } from '@/lib/error-handler'

export default function SignupPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [role, setRole] = useState<'buyer' | 'vendor'>('buyer')
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState(false)
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

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setErrors({})

        try {
            // Validate inputs
            const result = await signupSchema.parseAsync({
                email,
                password,
                fullName,
                role,
            })

            // Create account
            const { data, error: authError } = await supabase.auth.signUp({
                email: result.email,
                password: result.password,
                options: {
                    data: {
                        full_name: result.fullName,
                        role: result.role,
                    },
                },
            })

            if (authError) {
                setError(getErrorMessage(authError))
                return
            }

            if (data.user) {
                setSuccess(true)
            }
        } catch (err) {
            setError(getErrorMessage(err))
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Navigation />
                <main className="flex-1 flex items-center justify-center px-4 py-12">
                    <div className="w-full max-w-md text-center space-y-6 bg-card p-8 rounded-xl border border-border shadow-sm">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">Check Your Email</h1>
                        <p className="text-muted-foreground">
                            We've sent a confirmation link to <strong>{email}</strong>. Please verify your email to continue.
                        </p>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/login">Back to Login</Link>
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navigation />
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-foreground">Create Account</h1>
                        <p className="mt-2 text-muted-foreground">Join Medixra as a buyer or vendor</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-6 bg-card p-8 rounded-xl border border-border shadow-sm">
                        {error && <FormError message={error} />}

                        <FormField label="Full Name" required error={errors.fullName}>
                            <Input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                                disabled={isLoading}
                            />
                        </FormField>

                        <FormField label="Email Address" required error={errors.email}>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                disabled={isLoading}
                            />
                        </FormField>

                        <FormField
                            label="Password"
                            required
                            error={errors.password}
                            helpText="Minimum 8 characters with uppercase, lowercase, and number"
                        >
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                disabled={isLoading}
                            />
                        </FormField>

                        <div>
                            <p className="text-sm font-medium text-foreground mb-2">What would you like to do?</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole('buyer')}
                                    className={`p-4 rounded-lg border text-center transition-all ${
                                        role === 'buyer'
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-border hover:border-primary/50'
                                    }`}
                                    disabled={isLoading}
                                >
                                    <span className="font-medium block">Buy Equipment</span>
                                    <span className="text-xs text-muted-foreground">Browse & purchase</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('vendor')}
                                    className={`p-4 rounded-lg border text-center transition-all ${
                                        role === 'vendor'
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-border hover:border-primary/50'
                                    }`}
                                    disabled={isLoading}
                                >
                                    <span className="font-medium block">Sell Equipment</span>
                                    <span className="text-xs text-muted-foreground">List your inventory</span>
                                </button>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary hover:underline font-medium">
                                Sign in
                            </Link>
                        </p>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    )
}
