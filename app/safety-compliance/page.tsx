'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle, Shield, BookOpen, HelpCircle, ExternalLink } from 'lucide-react'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'

export default function SafetyCompliancePage() {
  const [expandedSection, setExpandedSection] = useState('overview')

  const sections = [
    {
      id: 'overview',
      title: 'Platform Overview',
      icon: Shield,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            <strong>Medixra is a listing platform only</strong> and is not the manufacturer, seller, or distributor of medical equipment. We facilitate connections between buyers and vendors but are not responsible for the products, services, or regulatory compliance of listed items.
          </p>
          <p className="text-muted-foreground">
            All equipment listings, vendors, and services on Medixra must comply with applicable Pakistani laws and regulations. Medixra does not warrant or guarantee the legality, safety, or appropriateness of any equipment or service listed on the platform.
          </p>
        </div>
      ),
    },
    {
      id: 'regulations',
      title: 'Pakistani Regulatory Requirements',
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4 border border-border">
            <h4 className="font-semibold text-foreground mb-3">Key Regulatory Bodies:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Drug Regulatory Authority of Pakistan (DRAP)</strong> - Regulates pharmaceutical and medical devices
                </div>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Pakistan Medical Council (PMC)</strong> - Oversees medical practice and standards
                </div>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Pakistan Standards and Quality Control Authority (PSQCA)</strong> - Sets quality standards
                </div>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Ministry of National Health Services</strong> - Regulates health services
                </div>
              </li>
            </ul>
          </div>

          <h4 className="font-semibold text-foreground mt-6 mb-3">Restricted Equipment:</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Some medical equipment may be regulated, restricted, or require special licenses, approvals, or certifications to import, sell, or use in Pakistan:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
              <span>Radiological equipment (X-ray machines, CT scanners)</span>
            </li>
            <li className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
              <span>Surgical and anesthetic equipment</span>
            </li>
            <li className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
              <span>Diagnostic imaging systems</span>
            </li>
            <li className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
              <span>In-vitro diagnostic (IVD) equipment</span>
            </li>
            <li className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
              <span>Equipment using radioactive materials</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'buyer',
      title: 'Buyer Responsibilities',
      icon: CheckCircle,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            As a buyer using Medixra, you are responsible for:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span>Verifying the legal status and appropriateness of equipment before purchase</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span>Ensuring the seller has proper licenses and certifications required in Pakistan</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span>Obtaining necessary approvals or registrations from regulatory authorities</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span>Ensuring equipment meets your facility's operational and legal requirements</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span>Maintaining proper documentation of purchase and regulatory compliance</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span>Reporting non-compliant or suspicious listings to Medixra immediately</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'vendor',
      title: 'Vendor Responsibilities',
      icon: Shield,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            All vendors on Medixra must:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span>Hold appropriate business licenses and registrations in Pakistan</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span>Only list equipment that is legal and safe to sell in Pakistan</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span>Provide accurate, complete, and honest product information and specifications</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span>Disclose any regulatory restrictions or certifications required for use</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span>Ensure equipment is new, refurbished, or used as accurately described</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span>Not list counterfeit, stolen, or unlicensed equipment</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span>Comply with all applicable Pakistani health and safety laws</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'disclaimer',
      title: 'Liability Disclaimer',
      icon: AlertCircle,
      content: (
        <div className="space-y-4 text-sm text-muted-foreground">
          <div className="rounded-lg bg-accent/10 border border-accent/20 p-4">
            <p className="font-semibold text-accent mb-2">No Warranties or Guarantees</p>
            <p>
              Medixra provides the platform "as is" and makes no warranties regarding the legality, safety, quality, or fitness of any equipment or service listed. Medixra is not responsible for:
            </p>
          </div>

          <ul className="space-y-2">
            <li className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
              <span>Regulatory non-compliance or violations by vendors or products</span>
            </li>
            <li className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
              <span>Fraudulent or deceptive listings</span>
            </li>
            <li className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
              <span>Equipment quality, performance, or durability</span>
            </li>
            <li className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
              <span>Injuries, damages, or losses resulting from equipment use</span>
            </li>
            <li className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
              <span>Disputes between buyers and vendors</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'faq',
      title: 'Frequently Asked Questions',
      icon: HelpCircle,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Can I sell controlled or restricted equipment on Medixra?</h4>
            <p className="text-sm text-muted-foreground">
              No. Equipment that requires special licenses, approvals, or has import restrictions cannot be sold on Medixra. Vendors must ensure full compliance before listing.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">What if I find non-compliant equipment?</h4>
            <p className="text-sm text-muted-foreground">
              Report it immediately using the "Report Listing" button. Provide details about the equipment and why you believe it's non-compliant. Our team will review and take appropriate action.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Who verifies vendor compliance?</h4>
            <p className="text-sm text-muted-foreground">
              Vendors are responsible for their own compliance. Medixra performs basic verification but does not guarantee vendor legitimacy or regulatory compliance. Buyers should independently verify vendor credentials.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">How do I report a compliance issue?</h4>
            <p className="text-sm text-muted-foreground">
              Contact us at compliance@medixra.com with details about the vendor, product, or issue. We will investigate and respond within 48 hours.
            </p>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Safety & Compliance Guidelines</h1>
          <p className="text-lg text-muted-foreground">
            Important information about regulatory compliance, vendor verification, and platform policies for medical equipment in Pakistan
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section) => {
            const Icon = section.icon
            const isExpanded = expandedSection === section.id

            return (
              <div
                key={section.id}
                className="rounded-lg border border-border bg-card overflow-hidden"
              >
                <button
                  onClick={() => setExpandedSection(isExpanded ? '' : section.id)}
                  className="w-full flex items-center justify-between p-6 hover:bg-muted/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
                  </div>
                  <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                {isExpanded && (
                  <div className="border-t border-border px-6 py-6 bg-background">
                    {section.content}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Contact Section */}
        <div className="mt-12 rounded-lg bg-primary/5 border border-primary/20 p-8">
          <h3 className="text-xl font-semibold text-foreground mb-3">Questions about Compliance?</h3>
          <p className="text-muted-foreground mb-6">
            If you have questions about regulatory compliance, vendor verification, or want to report an issue:
          </p>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              <strong>Email:</strong> <a href="mailto:compliance@medixra.com" className="text-primary hover:underline">compliance@medixra.com</a>
            </p>
            <p className="text-muted-foreground">
              <strong>WhatsApp:</strong> <a href="https://wa.me/923001234567" className="text-primary hover:underline">+92 300 1234567</a>
            </p>
            <p className="text-muted-foreground">
              <strong>Response Time:</strong> Within 48 hours for all compliance inquiries
            </p>
          </div>
        </div>

        {/* Footer Notice */}
        <div className="mt-12 rounded-lg bg-muted/50 border border-border p-6 text-center">
          <p className="text-xs text-muted-foreground">
            <strong>Last Updated:</strong> January 2024 • <strong>Version:</strong> 1.0
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            This policy is subject to change at any time. Users are responsible for staying informed of updates.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}
