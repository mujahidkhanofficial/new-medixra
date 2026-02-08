import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function Navigation() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
                        <Link href="/product" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                            Equipment
                        </Link>
                        <Link href="/technicians" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                            Technicians
                        </Link>
                        <Link href="/become-vendor" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                            For Vendors
                        </Link>
                        <Link href="/safety-compliance" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                            Safety & Compliance
                        </Link>
                    </div>

                    <div className="hidden items-center gap-3 md:flex">
                        <Button variant="outline" asChild>
                            <Link href="/login">Sign In</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/signup">Sign Up</Link>
                        </Button>
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
                            <Link href="/product" className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded">
                                Equipment
                            </Link>
                            <Link href="/technicians" className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded">
                                Technicians
                            </Link>
                            <Link href="/become-vendor" className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded">
                                For Vendors
                            </Link>
                            <Link href="/safety-compliance" className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded">
                                Safety & Compliance
                            </Link>
                            <div className="border-t border-border pt-3 flex flex-col gap-2">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/login">Sign In</Link>
                                </Button>
                                <Button className="w-full" asChild>
                                    <Link href="/signup">Sign Up</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
