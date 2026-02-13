'use client'

import Link from 'next/link'
import { Shield, Eye, Database, Lock, Users, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            <div className="mx-auto max-w-4xl px-4 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
                    <p className="text-muted-foreground">Last updated: February 2026</p>
                </div>

                <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Eye className="h-5 w-5 text-primary" />
                            1. Information We Collect
                        </h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">We collect information you provide directly:</p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                            <li>Account information (name, email, phone number)</li>
                            <li>Business details for vendors (company name, location, certifications)</li>
                            <li>Product listings and descriptions</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Database className="h-5 w-5 text-primary" />
                            2. How We Use Your Information
                        </h2>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                            <li>To provide and improve our marketplace services</li>
                            <li>To connect users with vendors</li>
                            <li>To verify vendor credentials</li>
                            <li>To send platform updates and notifications</li>
                            <li>To ensure platform security and prevent fraud</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            3. Information Sharing
                        </h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            We share your information only in these cases:
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                            <li>Vendor profiles are visible to registered users</li>
                            <li>Contact details are shared when you initiate communication</li>
                            <li>When required by Pakistani law or legal process</li>
                            <li>To protect the rights and safety of our users</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Lock className="h-5 w-5 text-primary" />
                            4. Data Security
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We use industry-standard security measures including encryption,
                            secure servers, and regular security audits to protect your data.
                            However, no system is 100% secure.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            5. Your Rights
                        </h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">You have the right to:</p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                            <li>Access your personal data</li>
                            <li>Request correction of inaccurate data</li>
                            <li>Request deletion of your account</li>
                            <li>Opt-out of marketing communications</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Mail className="h-5 w-5 text-primary" />
                            6. Contact Us
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            For privacy inquiries, contact:{' '}
                            <a href="mailto:privacy@medixra.com" className="text-primary hover:underline">
                                privacy@medixra.com
                            </a>
                        </p>
                    </section>
                </div>

                <div className="flex gap-4 mt-8">
                    <Button asChild variant="outline">
                        <Link href="/terms">Terms of Service</Link>
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
