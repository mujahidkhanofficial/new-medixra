'use client'

import { useState } from 'react'
import { Menu, X, User, LogOut, Plus, LayoutDashboard, Store, ChevronDown, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { EQUIPMENT_HIERARCHY } from '@/lib/constants'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { logout } from '@/lib/actions/auth'
import { NotificationBell } from '@/components/notifications/notification-bell'

export default function Navigation() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const { user, profile, loading } = useAuth()
    const router = useRouter()

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            const result = await logout() // Call server action
            if (result && !result.success) {
                console.error('Logout failed:', result.error)
                setIsLoggingOut(false)
            } else {
                // Successful logout
                router.replace('/login')
                router.refresh()

            }
        } catch (error) {
            console.error('Logout failed', error)
            setIsLoggingOut(false)
        }
    }

    const getDashboardLink = () => {
        if (profile?.role === 'vendor') return '/dashboard/vendor'
        if (profile?.role === 'admin') return '/admin'
        if (profile?.role === 'technician') return '/dashboard/technician'
        return '/dashboard/user'
    }

    const getDashboardLabel = () => {
        if (profile?.role === 'vendor') return 'Vendor Dashboard'
        if (profile?.role === 'admin') return 'Admin Dashboard'
        if (profile?.role === 'technician') return 'Technician Dashboard'
        return 'My Dashboard'
    }

    return (
        <nav className="sticky top-0 z-50 border-b border-border bg-card">
            <div className="mx-auto max-w-screen-2xl px-4 w-full">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="relative h-12 w-[150px]">
                                <Image
                                    src="/logo.svg"
                                    alt="Medixra Logo"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </Link>
                    </div>

                    <div className="hidden items-center gap-8 md:flex">
                        <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                            Home
                        </Link>

                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors outline-none cursor-pointer">
                                Equipment <ChevronDown className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-64 max-h-[80vh] overflow-y-auto" align="start">
                                {EQUIPMENT_HIERARCHY.map((category) => (
                                    <DropdownMenuSub key={category.name}>
                                        <DropdownMenuSubTrigger className="cursor-pointer">
                                            {category.name}
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuPortal>
                                            <DropdownMenuSubContent className="max-h-[80vh] overflow-y-auto">
                                                {category.subcategories.map((sub) => (
                                                    <DropdownMenuItem key={sub} asChild>
                                                        <Link href={`/products?category=${encodeURIComponent(category.name)}&query=${encodeURIComponent(sub)}`} className="cursor-pointer w-full">
                                                            {sub}
                                                        </Link>
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuSubContent>
                                        </DropdownMenuPortal>
                                    </DropdownMenuSub>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Link href="/technicians" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                            Technicians
                        </Link>
                        <Link href="/how-it-works" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                            How it Works
                        </Link>

                        {profile?.role !== 'vendor' && (
                            <Link href="/signup?role=vendor" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                                For Vendors
                            </Link>
                        )}
                    </div>

                    <div className="hidden items-center gap-3 md:flex">
                        <Link href="/post-ad" className="group relative inline-flex items-center justify-center rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 transition-all duration-300 hover:shadow-lg hover:shadow-amber-400/30">
                            <span className="absolute inset-0 rounded-full bg-linear-to-br from-amber-400 via-orange-500 to-yellow-500 opacity-100 transition-opacity duration-300 group-hover:opacity-110"></span>
                            <span className="relative flex h-full w-full items-center gap-2 rounded-full bg-background px-6 py-2 text-sm font-bold text-foreground transition-all group-hover:bg-transparent group-hover:text-white group-hover:scale-105">
                                <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
                                SELL NOW
                            </span>
                        </Link>
                        <NotificationBell />
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-transparent transition-all duration-200 group border-2 border-primary/30 hover:border-primary/60">
                                        <div className="relative h-full w-full rounded-full overflow-hidden">
                                            {profile?.avatar_url ? (
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={profile.avatar_url} alt={profile?.full_name || ''} />
                                                </Avatar>
                                            ) : (
                                                <Image
                                                    src="/user-icon.svg"
                                                    alt="User Profile"
                                                    width={40}
                                                    height={40}
                                                    className="w-full h-full"
                                                />
                                            )}
                                        </div>
                                        <ChevronDown className="absolute -bottom-1 -right-1 h-4 w-4 bg-primary text-white rounded-full p-0.5 ring-2 ring-background group-hover:bg-primary/80 transition-colors duration-200" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{profile?.full_name || 'User'}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user.email}
                                            </p>
                                            <p className="text-xs text-primary font-semibold mt-1 capitalize">
                                                {profile?.role === 'user' ? 'Individual' : profile?.role || 'Individual'}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href={getDashboardLink()}>
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            {getDashboardLabel()}
                                        </Link>
                                    </DropdownMenuItem>
                                    {profile?.role === 'vendor' && (
                                        <DropdownMenuItem asChild>
                                            <Link href={`/shop/${profile.vendors?.showroom_slug || profile.id}`}>
                                                <Store className="mr-2 h-4 w-4" />
                                                My Webstore
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard/settings">
                                            <User className="mr-2 h-4 w-4" />
                                            Profile Settings
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer" disabled={isLoggingOut}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        {isLoggingOut ? 'Logging out...' : 'Log out'}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : loading ? (
                            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                        ) : (
                            <>
                                <Button variant="ghost" className="rounded-full" asChild>
                                    <Link href="/login">Sign In</Link>
                                </Button>
                                <Button variant="outline" className="rounded-full" asChild>
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
                            <div className="px-4 pb-2 border-b border-border mb-2">
                                {loading ? (
                                    <div className="space-y-2">
                                        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                                        <div className="h-3 w-40 bg-muted rounded animate-pulse" />
                                    </div>
                                ) : user ? (
                                    <div className="flex items-center gap-3">
                                        {profile?.avatar_url ? (
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={profile.avatar_url} alt={profile?.full_name || ''} />
                                            </Avatar>
                                        ) : (
                                            <div className="h-10 w-10 shrink-0">
                                                <Image
                                                    src="/user-icon.svg"
                                                    alt="User Profile"
                                                    width={40}
                                                    height={40}
                                                    className="w-full h-full"
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium">{profile?.full_name || 'User'}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-sm">Welcome to Medixra</p>
                                )}
                            </div>

                            <Link href="/" className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded">
                                Home
                            </Link>
                            <Link href="/products" className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded">
                                Equipment
                            </Link>
                            <Link href="/technicians" className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded">
                                Technicians
                            </Link>

                            {profile?.role !== 'vendor' && (
                                <Link href="/signup?role=vendor" className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded">
                                    For Vendors
                                </Link>
                            )}

                            <div className="border-t border-border pt-3 flex flex-col gap-2 px-4">
                                {loading ? (
                                    <div className="h-10 bg-muted rounded animate-pulse" />
                                ) : user ? (
                                    <>
                                        <Link href={getDashboardLink()} className="flex items-center gap-2 py-2 text-sm font-medium text-foreground hover:bg-muted rounded">
                                            <LayoutDashboard className="h-4 w-4" />
                                            {getDashboardLabel()}
                                        </Link>
                                        <Link href="/dashboard/settings" className="flex items-center gap-2 py-2 text-sm font-medium text-foreground hover:bg-muted rounded">
                                            <User className="h-4 w-4" />
                                            Profile Settings
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            disabled={isLoggingOut}
                                            className="flex items-center gap-2 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded w-full text-left disabled:opacity-50"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            {isLoggingOut ? 'Logging out...' : 'Logout'}
                                        </button>
                                    </>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="outline" className="w-full rounded-full" asChild>
                                            <Link href="/login">Sign In</Link>
                                        </Button>
                                        <Button className="w-full rounded-full" asChild>
                                            <Link href="/signup">Sign Up</Link>
                                        </Button>
                                    </div>
                                )}
                                <Button variant="cta" className="w-full gap-2 group hover:shadow-lg hover:shadow-amber-400/30 transition-all duration-300 hover:scale-105 rounded-full" asChild>
                                    <Link href="/post-ad">
                                        <PlusCircle className="h-4 w-4 transition-transform group-hover:rotate-90" />
                                        SELL NOW
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
