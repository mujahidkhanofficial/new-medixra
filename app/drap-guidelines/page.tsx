import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'DRAP Compliance Guidelines | Medixra',
    description: 'Important regulatory information for medical equipment vendors in Pakistan.',
}

export default function DrapGuidelinesPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navigation />
            <main className="flex-1 py-16 px-4">
                <div className="mx-auto max-w-4xl prose prose-slate dark:prose-invert">
                    <h1 className="text-4xl font-bold mb-8">DRAP Compliance Guidelines</h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Medixra requires all listed equipment to comply with the Drug Regulatory Authority of Pakistan (DRAP). This resource section is currently under construction.
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    )
}
