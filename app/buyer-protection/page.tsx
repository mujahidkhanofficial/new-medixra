import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Buyer Protection & Safety | Medixra',
    description: 'Learn how Medixra protects buyers and ensures a safe medical equipment marketplace.',
}

export default function BuyerProtectionPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navigation />
            <main className="flex-1 py-16 px-4">
                <div className="mx-auto max-w-4xl prose prose-slate dark:prose-invert">
                    <h1 className="text-4xl font-bold mb-8">Buyer Protection & Safety</h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        At Medixra, your safety and satisfaction are our top priorities. This page is currently under development. Please check back soon for our comprehensive Buyer Protection policies.
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    )
}
