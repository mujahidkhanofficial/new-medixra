import Image from 'next/image'
import Link from 'next/link'
import { Linkedin, Twitter, MessageCircle } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="border-t border-border bg-card mt-auto">
            <div className="mx-auto max-w-screen-2xl px-4 py-12 w-full">
                <div className="grid gap-8 md:grid-cols-4">
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="relative h-12 w-[150px]">
                                <Image
                                    src="/logo.svg"
                                    alt="Medixra Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Connecting users with medical equipment vendors directly across Pakistan.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Marketplace</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/products" className="text-muted-foreground hover:text-primary transition-colors">All Medical Equipment</Link></li>
                            <li><Link href="/technicians" className="text-muted-foreground hover:text-primary transition-colors">Find Certified Technicians</Link></li>
                            <li><Link href="/vendors" className="text-muted-foreground hover:text-primary transition-colors">Verified Vendors Directory</Link></li>
                            <li><Link href="/buyer-protection" className="text-muted-foreground hover:text-primary transition-colors">Buyer Protection & Safety</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Business Resources</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/post-ad" className="text-muted-foreground hover:text-primary transition-colors">Post an Ad</Link></li>
                            <li><Link href="/signup?role=vendor" className="text-muted-foreground hover:text-primary transition-colors">Vendor Registration</Link></li>
                            <li><Link href="/signup?role=technician" className="text-muted-foreground hover:text-primary transition-colors">Technician Registration</Link></li>
                            <li><Link href="/drap-guidelines" className="text-muted-foreground hover:text-primary transition-colors">DRAP Compliance Guidelines</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Support & Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/about-us" className="text-muted-foreground hover:text-primary transition-colors">About Medixra</Link></li>
                            <li><Link href="/trust-and-safety" className="text-muted-foreground hover:text-primary transition-colors">Trust & Safety Hub</Link></li>
                            <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">General Terms of Service</Link></li>
                            <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><a href="mailto:zovetica@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">Report an Issue</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border my-8" />

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <p className="text-sm text-muted-foreground">
                        © 2026 Medixra. All rights reserved. Pakistan&apos;s trusted medical equipment marketplace.
                    </p>

                    <div className="flex gap-4">
                        <a href="https://wa.me" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="WhatsApp">
                            <MessageCircle className="h-5 w-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
