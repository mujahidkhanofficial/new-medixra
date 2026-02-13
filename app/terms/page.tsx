'use client'

import Link from 'next/link'
import { Shield, FileText, Users, AlertTriangle, CheckCircle, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            <div className="mx-auto max-w-4xl px-4 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
                    <p className="text-muted-foreground">Last updated: February 2026</p>
                </div>

                <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            1. Acceptance of Terms
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            By accessing or using Medixra ("the Platform"), you agree to be bound by these Terms of Service.
                            If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            2. Platform Description
                        </h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Medixra is a B2B marketplace connecting medical equipment vendors with users in Pakistan.
                            We provide a listing platform only and do not:
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                            <li>Sell or purchase medical equipment directly</li>
                            <li>Guarantee the quality or regulatory compliance of listed equipment</li>
                            <li>Handle payments between users and vendors</li>
                            <li>Provide medical advice or equipment recommendations</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            3. User Responsibilities
                        </h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            <strong>Vendors must:</strong>
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                            <li>Ensure all listed equipment complies with DRAP regulations</li>
                            <li>Provide accurate product descriptions and pricing</li>
                            <li>Maintain valid business licenses and certifications</li>
                            <li>Respond to user inquiries in a timely manner</li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            <strong>Buyers must:</strong>
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                            <li>Verify equipment compliance before purchase</li>
                            <li>Conduct due diligence on vendors</li>
                            <li>Use equipment in accordance with Pakistani medical regulations</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-primary" />
                            4. Disclaimer of Liability
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Medixra is not responsible for any transactions, disputes, or damages arising from
                            the use of our platform. All transactions are conducted directly between users and vendors.
                            Users assume full responsibility for verifying regulatory compliance.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            5. Free Platform
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Medixra is currently free to use. We do not charge vendors for listings
                            or users for accessing the platform. This may change in the future with prior notice.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Phone className="h-5 w-5 text-primary" />
                            6. Contact
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            For questions about these terms, contact us at:{' '}
                            <a href="mailto:legal@medixra.com" className="text-primary hover:underline">
                                legal@medixra.com
                            </a>
                        </p>
                    </section>
                </div>

                <div className="flex gap-4 mt-8">
                    <Button asChild variant="outline">
                        <Link href="/privacy">Privacy Policy</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/safety-compliance">Safety & Compliance</Link>
                    </Button>
                </div>
            </div>

            <Footer />
        </div>
    )
}
