import Image from 'next/image'
import Link from 'next/link'
import { Linkedin, Twitter, MessageCircle, Activity } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="border-t border-border bg-card mt-auto">
            <div className="mx-auto max-w-screen-2xl px-4 py-12 w-full">
                <div className="grid gap-8 md:grid-cols-4">
                    <div className="md:col-span-1">
                        <Link href="/" className="group flex items-center gap-2.5 mb-4 inline-flex">
                            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-[#1B7484] to-[#14E8D8] shadow-md shadow-[#14E8D8]/20 group-hover:shadow-[#14E8D8]/40 transition-shadow duration-300">
                                <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
                            </div>
                            <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#033342] via-[#1B7484] to-[#14E8D8] relative overflow-hidden group-hover:opacity-90 transition-opacity duration-300">
                                PakMedinex
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Connecting users with medical equipment vendors directly across Pakistan.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Marketplace</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/products" className="text-muted-foreground hover:text-primary transition-colors">All Medical Equipment</Link></li>
                            <li><Link href="/engineers" className="text-muted-foreground hover:text-primary transition-colors">Find Certified Engineers</Link></li>
                            <li><Link href="/vendors" className="text-muted-foreground hover:text-primary transition-colors">Verified Vendors Directory</Link></li>
                            <li><Link href="/buyer-protection" className="text-muted-foreground hover:text-primary transition-colors">Buyer Protection & Safety</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Business Resources</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/post-ad" className="text-muted-foreground hover:text-primary transition-colors">Post an Ad</Link></li>
                            <li><Link href="/signup?role=vendor" className="text-muted-foreground hover:text-primary transition-colors">Vendor Registration</Link></li>
                            <li><Link href="/signup?role=engineer" className="text-muted-foreground hover:text-primary transition-colors">Engineer Registration</Link></li>
                            <li><Link href="/drap-guidelines" className="text-muted-foreground hover:text-primary transition-colors">DRAP Compliance Guidelines</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Support & Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/about-us" className="text-muted-foreground hover:text-primary transition-colors">About Pakmedinex</Link></li>
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
                        © 2026 Pakmedinex. All rights reserved. Pakistan&apos;s trusted medical equipment marketplace.
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
