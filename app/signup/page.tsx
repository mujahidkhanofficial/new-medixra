'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'

export default function SignupPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [role, setRole] = useState<'buyer' | 'vendor'>('buyer')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: role,
                },
            },
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else if (data.user) {
            setSuccess(true)
            setLoading(false)
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

                    <form onSubmit={handleSignup} className="mt-8 space-y-6 bg-card p-8 rounded-xl border border-border shadow-sm">
                        {error && (
                            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-1">
                                    Full Name
                                </label>
                                <input
                                    id="fullName"
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="••••••••"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    I want to
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRole('buyer')}
                                        className={`p-4 rounded-lg border text-center transition-all ${role === 'buyer'
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-border hover:border-primary/50'
                                            }`}
                                    >
                                        <span className="font-medium block">Buy Equipment</span>
                                        <span className="text-xs text-muted-foreground">Browse & purchase</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('vendor')}
                                        className={`p-4 rounded-lg border text-center transition-all ${role === 'vendor'
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-border hover:border-primary/50'
                                            }`}
                                    >
                                        <span className="font-medium block">Sell Equipment</span>
                                        <span className="text-xs text-muted-foreground">List your inventory</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Creating account...' : 'Create Account'}
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
