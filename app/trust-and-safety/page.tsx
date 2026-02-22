import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Trust & Safety Hub | Medixra',
    description: 'Learn how Medixra maintains a secure and verified medical marketplace.',
}

export default function TrustAndSafetyPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navigation />
            <main className="flex-1 py-16 px-4">
                <div className="mx-auto max-w-4xl prose prose-slate dark:prose-invert">
                    <h1 className="text-4xl font-bold mb-8">Trust & Safety Hub</h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Medixra is committed to providing a secure B2B platform. Our dedicated Trust & Safety Hub is currently being updated.
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    )
}
