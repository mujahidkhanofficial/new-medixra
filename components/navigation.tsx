'use client'

import { useState, useEffect } from 'react'
import { Menu, X, User, LogOut } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Navigation() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [user, setUser] = useState<any>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [supabase.auth])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    return (
        <nav className="sticky top-0 z-50 border-b border-border bg-card">
            <div className="mx-auto max-w-6xl px-4 w-full">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10">
                            <Image
                                src="/logo.png"
                                alt="Medixra Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <span className="hidden font-bold text-foreground text-lg sm:inline">Medixra</span>
                    </div>

                    <div className="hidden items-center gap-8 md:flex">
                        <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                            Home
                        </Link>
                        <Link href="/products" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                            Equipment
                        </Link>
                        <Link href="/technicians" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                            Technicians
                        </Link>
                        <Link href="/how-it-works" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                            How it Works
                        </Link>
                        <Link href="/about-us" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                            About Us
                        </Link>
                        <Link href="/become-vendor" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                            For Vendors
                        </Link>
                    </div>

                    <div className="hidden items-center gap-3 md:flex">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-4 w-4 text-primary" />
                                    </div>
                                    <span>Dashboard</span>
                                </Link>
                                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Button variant="outline" asChild>
                                    <Link href="/login">Sign In</Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/signup">Sign Up</Link>
                                </Button>
                            </>
                        )}
                    </div>

                    <button
                        className="md:hidden p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="border-t border-border bg-background py-4 md:hidden">
                        <div className="flex flex-col gap-3">
                            <Link href="/" className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded">
                                Home
                            </Link>
                            <Link href="/products" className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded">
                                Equipment
                            </Link>
                            <Link href="/technicians" className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded">
                                Technicians
                            </Link>
                            <Link href="/how-it-works" className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded">
                                How it Works
                            </Link>
                            <Link href="/about-us" className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded">
                                About Us
                            </Link>
                            <Link href="/become-vendor" className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded">
                                For Vendors
                            </Link>
                            <div className="border-t border-border pt-3 flex flex-col gap-2">
                                {user ? (
                                    <>
                                        <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded">
                                            <User className="h-4 w-4" />
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded w-full text-left"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="outline" className="w-full" asChild>
                                            <Link href="/login">Sign In</Link>
                                        </Button>
                                        <Button className="w-full" asChild>
                                            <Link href="/signup">Sign Up</Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
