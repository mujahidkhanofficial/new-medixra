'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Phone, MapPin, Edit2, Calendar, Check, AlertCircle, Eye, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { useAuth } from '@/components/providers/auth-provider'
import { getTechnicianProfile } from '@/lib/actions/technician'
import { getErrorMessage } from '@/lib/error-handler'
import WhatsAppContact from '@/components/whatsapp-contact'
import { DashboardLoader } from '@/components/ui/dashboard-loader'

export default function TechnicianDashboard() {
    const { user } = useAuth()
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadProfile() {
            if (!user?.id) return
            setLoading(true)
            try {
                const data = await getTechnicianProfile(user.id)
                if (!data) {
                    setError('Profile not found')
                    return
                }
                setProfile(data)
                setError(null)
            } catch (err: any) {
                setError(getErrorMessage(err))
            } finally {
                setLoading(false)
            }
        }

        loadProfile()
    }, [user?.id])

    if (loading) {
        return <DashboardLoader />
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-background">
                <Navigation />
                <main className="flex-1 flex items-center justify-center px-4 py-12">
                    <div className="max-w-md text-center">
                        <h1 className="text-2xl font-bold text-foreground mb-4">{error || 'Profile not found'}</h1>
                        <Button asChild>
                            <Link href="/dashboard">Back to Dashboard</Link>
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    const joinDate = profile.created_at
        ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Unknown'

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navigation />

            <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-8 md:py-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div className="flex items-center gap-5">
                        <Avatar className="h-20 w-20 border-4 border-background shadow-sm">
                            <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name} />
                            <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                                {(profile.full_name || 'T').substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
                                {profile.full_name || 'Technician'}
                            </h1>
                            <p className="text-muted-foreground flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {profile.city || 'Location not set'}
                                <span className="text-border">•</span>
                                Member since {joinDate}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="gap-2" asChild>
                            <Link href="/dashboard/technician/edit">
                                <Edit2 className="h-4 w-4" />
                                Edit Profile
                            </Link>
                        </Button>
                        <Button className="gap-2" asChild>
                            <Link href="/technicians">View Directory</Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Status & Contact */}
                        <div className="rounded-2xl border border-border/50 bg-card/50 px-5 py-6 backdrop-blur-sm">
                            <h3 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wider">Contact & Status</h3>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                                        <Check className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Status</p>
                                        <p className="text-sm text-muted-foreground">Active & Available</p>
                                    </div>
                                </div>

                                {profile.phone && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <Phone className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Phone</p>
                                            <a href={`https://wa.me/${profile.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                                {profile.phone}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {profile.phone && (
                                <div className="mt-6">
                                    <WhatsAppContact
                                        phoneNumber={profile.phone || ''}
                                        name="Contact me on WhatsApp"
                                        message="Hi, I'm interested in your services."
                                    />
                                </div>
                            )}
                        </div>

                        {/* Experience */}
                        <div className="rounded-2xl border border-border/50 bg-card/50 px-5 py-6 backdrop-blur-sm">
                            <h3 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wider">Experience</h3>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Years in Field</p>
                                    <p className="text-sm text-muted-foreground">
                                        {profile.experience_years ? `${profile.experience_years} years` : 'Not specified'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Speciality & Analytics */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Specialities */}
                        <div className="rounded-2xl border border-border/50 bg-card/50 px-6 py-6 backdrop-blur-sm">
                            <h3 className="font-semibold mb-4 text-lg">Specialities</h3>
                            {profile.speciality ? (
                                <div className="flex flex-wrap gap-2">
                                    {(() => {
                                        try {
                                            const specialties = JSON.parse(profile.speciality)
                                            return Array.isArray(specialties)
                                                ? specialties.map((s, i) => <Badge key={i} variant="secondary" className="px-3 py-1 text-sm font-medium bg-secondary/50 hover:bg-secondary/80">{s}</Badge>)
                                                : <Badge variant="secondary" className="px-3 py-1 text-sm font-medium bg-secondary/50 hover:bg-secondary/80">{profile.speciality}</Badge>
                                        } catch {
                                            return profile.speciality.split(',').map((s: string, i: number) => (
                                                <Badge key={i} variant="secondary" className="px-3 py-1 text-sm font-medium bg-secondary/50 hover:bg-secondary/80">{s.trim()}</Badge>
                                            ))
                                        }
                                    })()}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No specialities listed</p>
                            )}
                        </div>

                        {/* Analytics */}
                        <h3 className="font-semibold text-lg mt-8 mb-4">Performance Analytics</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Profile Views */}
                            <div className="group rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm hover:bg-accent/5 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                        <Eye className="h-6 w-6" />
                                    </div>
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600">+ Active</span>
                                </div>
                                <h4 className="text-muted-foreground text-sm font-medium">Total Profile Views</h4>
                                <p className="text-4xl font-bold tracking-tight mt-1">{profile.views || 0}</p>
                            </div>

                            {/* WhatsApp Clicks */}
                            <div className="group rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm hover:bg-accent/5 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#25D366]/10 text-[#25D366] group-hover:scale-110 transition-transform">
                                        <MessageCircle className="h-6 w-6" />
                                    </div>
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600">+ Active</span>
                                </div>
                                <h4 className="text-muted-foreground text-sm font-medium">WhatsApp Inquiries</h4>
                                <p className="text-4xl font-bold tracking-tight mt-1">{profile.whatsapp_clicks || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
