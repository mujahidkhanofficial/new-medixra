import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db/drizzle'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Clock, AlertCircle, Mail, Phone, ArrowLeft } from 'lucide-react'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'

export default async function PendingApprovalPage() {
    const supabase = await createClient()

    if (!supabase) {
        redirect('/login')
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const profile = await db.query.profiles.findFirst({
        where: eq(profiles.id, user.id)
    })

    if (!profile) {
        redirect('/login')
    }

    // If already approved, go to dashboard
    if (profile.approvalStatus === 'approved') {
        const dashboardPath = profile.role === 'admin' ? '/admin' : `/dashboard/${profile.role}`
        redirect(dashboardPath)
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navigation />

            <main className="flex-1 flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-8 bg-card p-8 rounded-2xl border border-border shadow-sm">
                    {profile.approvalStatus === 'pending' ? (
                        <>
                            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                                <Clock className="h-8 w-8" />
                            </div>

                            <div className="space-y-3">
                                <h1 className="text-2xl font-bold text-foreground">Application Under Review</h1>
                                <p className="text-muted-foreground">
                                    Hello <strong>{profile.fullName || 'User'}</strong>! Your application as a <strong>{profile.role}</strong> is currently being reviewed by our admin team.
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    This usually takes 24-48 hours. We'll notify you via email (<strong>{profile.email}</strong>) once your account is activated.
                                </p>
                            </div>

                            <div className="pt-4 space-y-4">
                                <div className="p-4 bg-muted rounded-xl text-left space-y-2">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Need help?</p>
                                    <div className="flex items-center gap-3 text-sm text-foreground">
                                        <Mail className="h-4 w-4 text-primary" />
                                        <span>support@medixra.com</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-foreground">
                                        <Phone className="h-4 w-4 text-primary" />
                                        <span>+92 300 1234567</span>
                                    </div>
                                </div>

                                <Button asChild variant="ghost" className="w-full gap-2">
                                    <Link href="/">
                                        <ArrowLeft className="h-4 w-4" />
                                        Back to Homepage
                                    </Link>
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                                <AlertCircle className="h-8 w-8" />
                            </div>

                            <div className="space-y-3">
                                <h1 className="text-2xl font-bold text-foreground">Application Rejected</h1>
                                <p className="text-muted-foreground">
                                    We regret to inform you that your application as a <strong>{profile.role}</strong> was not approved at this time.
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    If you believe this was a mistake, please contact our support team.
                                </p>
                            </div>

                            <div className="pt-4">
                                <Button asChild variant="default" className="w-full">
                                    <Link href="mailto:support@medixra.com">Contact Support</Link>
                                </Button>
                                <Button asChild variant="ghost" className="w-full mt-2">
                                    <Link href="/">Back to Homepage</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}
