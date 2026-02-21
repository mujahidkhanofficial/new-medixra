import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { AlertTriangle } from 'lucide-react'

/**
 * Account suspended page
 * Shown when a user with status='suspended' tries to access protected routes
 */
export default function AccountSuspendedPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navigation />
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md space-y-8 text-center">
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                        <AlertTriangle className="w-8 h-8 text-destructive" />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Account Suspended</h1>
                        <p className="text-muted-foreground mt-4">
                            Your account has been suspended. If you believe this is a mistake, please contact our support team.
                        </p>
                    </div>

                    <div className="space-y-3 pt-4">
                        <Link href="/login" className="block">
                            <Button variant="outline" className="w-full">
                                Return to Login
                            </Button>
                        </Link>
                        <Link href="/" className="block">
                            <Button variant="ghost" className="w-full">
                                Back to Home
                            </Button>
                        </Link>
                    </div>

                    <div className="text-xs text-muted-foreground bg-secondary p-4 rounded-lg">
                        <p>Please contact medixra@gmail.com for assistance</p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
