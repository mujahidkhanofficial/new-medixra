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
                        <h4 className="font-semibold text-foreground mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/products" className="text-muted-foreground hover:text-primary transition-colors">Browse Equipment</Link></li>
                            <li><Link href="/technicians" className="text-muted-foreground hover:text-primary transition-colors">Find Technicians</Link></li>
                            <li><Link href="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors">How it Works</Link></li>
                            <li><Link href="/signup?role=vendor" className="text-muted-foreground hover:text-primary transition-colors">Become a Vendor</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-foreground mb-4">For Vendors</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/signup?role=vendor" className="text-muted-foreground hover:text-primary transition-colors">Vendor Registration</Link></li>
                            <li><Link href="/login" className="text-muted-foreground hover:text-primary transition-colors">Member Login</Link></li>
                            <li><Link href="/signup?role=vendor" className="text-muted-foreground hover:text-primary transition-colors">Vendor Guide</Link></li>
                            <li><Link href="/safety-compliance" className="text-muted-foreground hover:text-primary transition-colors">Safety & Standards</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Company</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/about-us" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link href="/safety-compliance" className="text-muted-foreground hover:text-primary transition-colors">Safety & Compliance</Link></li>
                            <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
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
                        <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn">
                            <Linkedin className="h-5 w-5" />
                        </a>
                        <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter">
                            <Twitter className="h-5 w-5" />
                        </a>
                    </div>
                </div>

                <div className="mt-8 rounded-lg border border-border bg-muted/50 p-4">
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        <strong>Important Disclaimer:</strong> Medixra is a listing platform only and is not the manufacturer or seller of equipment. Responsibility for regulatory compliance with Pakistani laws (including DRAP and other health authorities) lies with the vendor and user, not Medixra.
                    </p>
                </div>
            </div>
        </footer>
    )
}
