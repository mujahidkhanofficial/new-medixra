'use client'

import Link from 'next/link'
import { Shield, AlertTriangle, CheckCircle, FileText, Search, AlertCircle, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'

export default function SafetyCompliancePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="mx-auto max-w-screen-2xl px-4 py-12">
        <div className="mb-8">          <h1 className="text-3xl font-bold text-foreground mb-2">Safety & Compliance</h1>
          <p className="text-muted-foreground">Guidelines for buying and selling medical equipment safely on Medixra</p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <section className="mb-8 rounded-lg border border-primary/20 bg-primary/5 p-6 md:p-8">
            <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2 mt-0">
              <AlertTriangle className="h-6 w-6" />
              DRAP Compliance Warning
            </h2>
            <p className="text-foreground font-medium mb-3 leading-relaxed">
              All medical equipment bought and sold in Pakistan must comply with the Drug Regulatory Authority of Pakistan (DRAP) Medical Devices Rules involving registration, import, and sale.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Medixra strictly facilitates connections between users and vendors. We do not verify the physical condition or legal compliance of every item listed. <strong>It is the user's responsibility to verify DRAP registration certificates before purchase.</strong>
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              User Safety Checklist
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4 p-5 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
                <Search className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1 text-base">1. Verify Vendor Credentials</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Check the vendor's profile for verified status, years in business, and physical location. Ask for their business license number.</p>
                </div>
              </div>
              <div className="flex gap-4 p-5 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
                <FileText className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1 text-base">2. Request Documentation</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Ask for original invoices, warranty cards, and DRAP registration forms (Form-6 or Form-7) for imported devices.</p>
                </div>
              </div>
              <div className="flex gap-4 p-5 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
                <Eye className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1 text-base">3. Inspect Equipment</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">For used/refurbished items, inspect personally or hire a biomedical engineer. Verify serial numbers match the paperwork.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Prohibited Items
            </h2>
            <p className="text-muted-foreground mb-4">The following items are strictly prohibited on Medixra:</p>
            <div className="grid md:grid-cols-2 gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Expired medical disposables
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Recalled medical devices
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Prescription-only drugs (pharmaceuticals)
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Radioactive materials without PNRA license
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Counterfeit equipment
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Organs or biological tissue
              </div>
            </div>
          </section>

          <section className="mb-12 rounded-lg bg-muted/30 p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Reporting Violations
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              If you suspect a listing violates these safety guidelines or local laws, please report it immediately using the "Report Listing" button on the product page or contact us directly.
            </p>
            <Button variant="destructive" asChild>
              <a href="mailto:zovetica@gmail.com">Report a Violation</a>
            </Button>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}
