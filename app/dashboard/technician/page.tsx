'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Phone, MapPin, Edit2, Calendar, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
        <div className="min-h-screen bg-background">
            <Navigation />

            <div className="mx-auto max-w-6xl px-4 py-12">
                {/* Profile Card */}
                <div className="mb-8 rounded-lg border border-border bg-card p-6 md:p-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">{profile.full_name || 'Technician'}</h1>

                            {profile.speciality && (
                                <p className="text-primary font-semibold mb-3">
                                    {profile.speciality}
                                </p>
                            )}

                            <p className="text-sm text-muted-foreground mb-4">
                                {profile.city || 'Location not set'} • Member since {joinDate}
                            </p>

                            {/* Contact Information */}
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Contact Information</p>
                                {profile.phone && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Phone className="h-4 w-4" />
                                        <a href={`https://wa.me/${profile.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                            {profile.phone}
                                        </a>
                                    </div>
                                )}
                                {profile.city && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        {profile.city}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            {profile.phone && (
                                <WhatsAppContact
                                    phoneNumber={profile.phone || ''}
                                    name="Contact me on WhatsApp"
                                    message="Hi, I'm interested in your services."
                                />
                            )}
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2" asChild>
                                <Link href="/dashboard/technician/edit">
                                    <Edit2 className="h-4 w-4" />
                                    Edit Profile
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Profile Details Card */}
                <div className="mb-8 rounded-lg border border-border bg-card p-6">
                    <h2 className="text-xl font-bold text-foreground mb-6">Professional Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Speciality */}
                        <div className="rounded-lg bg-muted/50 p-4 border border-border">
                            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Speciality</p>
                            <p className="font-semibold text-foreground">
                                {profile.speciality || 'Not specified'}
                            </p>
                        </div>

                        {/* Experience */}
                        <div className="rounded-lg bg-muted/50 p-4 border border-border">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-3.5 w-3.5 text-primary" />
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Experience</p>
                            </div>
                            <p className="font-semibold text-foreground">
                                {profile.experience_years ? `${profile.experience_years} years` : 'Not specified'}
                            </p>
                        </div>

                        {/* Status */}
                        <div className="rounded-lg bg-muted/50 p-4 border border-border">
                            <div className="flex items-center gap-2 mb-2">
                                <Check className="h-3.5 w-3.5 text-green-600" />
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</p>
                            </div>
                            <p className="font-semibold text-green-600">
                                Active
                            </p>
                        </div>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Services Info */}
                    <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900 p-6">
                        <div className="flex gap-3">
                            <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Service Inquiries</h3>
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    Customers can contact you directly on WhatsApp to discuss services and schedule work.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Verification Info */}
                    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-6">
                        <div className="flex gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-1">Profile Visibility</h3>
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    Your profile is visible to customers searching for technicians in your city and speciality.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-12 text-base" asChild>
                        <Link href="/technicians">View Technician Directory</Link>
                    </Button>
                    <Button variant="outline" className="h-12 text-base" asChild>
                        <Link href="/dashboard">Back to Dashboard</Link>
                    </Button>
                </div>
            </div>

            <Footer />
        </div>
    )
}
