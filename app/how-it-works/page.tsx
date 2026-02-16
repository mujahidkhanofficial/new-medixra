import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { CheckCircle2, ShoppingBag, MessageSquare, Handshake, Info } from 'lucide-react'

export default function HowItWorksPage() {
    const steps = [
        {
            title: 'Search equipment',
            description: 'Browse our extensive catalog to find the exact medical equipment you need.',
            icon: ShoppingBag,
            color: 'text-primary'
        },
        {
            title: 'Contact Vendor',
            description: 'Use the WhatsApp or Call buttons to connect directly with the equipment seller.',
            icon: MessageSquare,
            color: 'text-primary'
        },
        {
            title: 'Discuss Terms',
            description: 'Negotiate pricing, delivery, and payment terms directly with the vendor.',
            icon: Handshake,
            color: 'text-primary'
        },
        {
            title: 'Close the Deal',
            description: 'Finalize your agreement privately. Medixra helps you find the right partner.',
            icon: CheckCircle2,
            color: 'text-primary'
        }
    ]

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navigation />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="py-20 bg-card border-b border-border">
                    <div className="mx-auto max-w-screen-2xl px-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">How Medixra Works</h1>
                        <p className="text-xl text-muted-foreground">
                            A direct bridge between medical equipment users, sellers, and specialized technicians in Pakistan.
                        </p>
                    </div>
                </section>

                {/* Steps Section */}
                <section className="py-24">
                    <div className="mx-auto max-w-screen-2xl px-4">
                        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
                            {steps.map((step, index) => (
                                <div key={index} className="flex flex-col items-center text-center group">
                                    <div className={`h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                        <step.icon className={`h-10 w-10 ${step.color}`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                                    <p className="text-muted-foreground">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Platform Role Section */}
                <section className="py-20 bg-muted/30">
                    <div className="mx-auto max-w-screen-2xl px-4 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold mb-8">
                            <Info className="h-4 w-4" />
                            Our Role: Connection Platform
                        </div>
                        <h2 className="text-3xl font-bold text-foreground mb-8">Connecting The Healthcare Industry</h2>
                        <div className="grid md:grid-cols-2 gap-8 text-left">
                            <div className="p-8 bg-card rounded-3xl border border-border">
                                <h3 className="text-xl font-bold text-foreground mb-4">Direct Communication</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Medixra is a listing marketplace. We do not handle payments, logistics, or deliveries. All discussions regarding price, warranty, and shipping happen directly between the user and the seller.
                                </p>
                            </div>
                            <div className="p-8 bg-card rounded-3xl border border-border">
                                <h3 className="text-xl font-bold text-foreground mb-4">Transparent Negotiation</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    By removing the middleman, we allow healthcare providers to talk directly to vendors. This ensures better pricing and clearer technical discussions for specialized equipment.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Disclaimer / Notice Section */}
                <section className="py-24 bg-background">
                    <div className="mx-auto max-w-3xl px-4 text-center">
                        <div className="p-10 rounded-[32px] border-2 border-dashed border-border">
                            <h2 className="text-2xl font-bold text-foreground mb-4">Important Notice</h2>
                            <p className="text-muted-foreground leading-relaxed italic">
                                "Medixra serves as a facilitator to help you discover equipment and service providers. The final transaction, product verification, and delivery are the sole responsibility of the parties involved. We recommend verifying equipment in person before completing high-value payments."
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
