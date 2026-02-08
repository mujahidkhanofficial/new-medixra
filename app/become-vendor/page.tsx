'use client'

import React from "react"

import { useState } from 'react'
import { Building2, MapPin, Phone, Mail, FileText, CheckCircle, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'

export default function BecomeVendorPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    companyName: '',
    businessType: '',
    location: '',
    phone: '',
    email: '',
    description: '',
    registrationNumber: '',
    yearsInBusiness: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handlePrev = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Become a Medixra Vendor</h1>
          <p className="text-muted-foreground">
            Join Pakistan's fastest-growing medical equipment marketplace. List your products for free and connect directly with buyers.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-12 flex gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm ${
                  s <= step
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-border text-muted-foreground'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 rounded-full ${s < step ? 'bg-primary' : 'bg-border'}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Container */}
        <div className="rounded-lg border border-border bg-card p-8 shadow-lg">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Step 1: Basic Information</h2>
                <p className="text-muted-foreground">Tell us about your business</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Enter your company name"
                  className="w-full rounded border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Business Type *</label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  className="w-full rounded border border-border bg-background px-4 py-2 text-foreground"
                >
                  <option value="">Select business type</option>
                  <option value="manufacturer">Manufacturer</option>
                  <option value="distributor">Distributor</option>
                  <option value="importer">Importer</option>
                  <option value="dealer">Dealer</option>
                  <option value="retailer">Retailer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City or area"
                  className="w-full rounded border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+92 300 1234567"
                    className="w-full rounded border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="contact@company.com"
                    className="w-full rounded border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Business Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Step 2: Business Details</h2>
                <p className="text-muted-foreground">Provide more information about your business</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Business Registration Number *
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                  placeholder="NTN or registration number"
                  className="w-full rounded border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Years in Business *
                </label>
                <select
                  name="yearsInBusiness"
                  value={formData.yearsInBusiness}
                  onChange={handleInputChange}
                  className="w-full rounded border border-border bg-background px-4 py-2 text-foreground"
                >
                  <option value="">Select years</option>
                  <option value="0-1">Less than 1 year</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Business Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell us about your business, products, and services..."
                  rows={4}
                  className="w-full rounded border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground"
                />
              </div>

              <div className="rounded-lg bg-muted/50 p-4 border border-border">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Your information will be reviewed and verified before your account is activated.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Step 3: Review & Confirm</h2>
                <p className="text-muted-foreground">Please review your information</p>
              </div>

              <div className="space-y-4 rounded-lg bg-muted/30 p-4 border border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company Name:</span>
                  <span className="font-semibold text-foreground">{formData.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Business Type:</span>
                  <span className="font-semibold text-foreground capitalize">{formData.businessType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-semibold text-foreground">{formData.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-semibold text-foreground">{formData.email}</span>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1"
                  />
                  <span className="text-sm text-muted-foreground">
                    I have read and agree to the Medixra Terms of Service and Vendor Guidelines
                  </span>
                </label>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1"
                  />
                  <span className="text-sm text-muted-foreground">
                    I certify that all information provided is accurate and complete
                  </span>
                </label>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1"
                  />
                  <span className="text-sm text-muted-foreground">
                    I understand my products must comply with Pakistani medical regulations
                  </span>
                </label>
              </div>

              <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
                <p className="text-sm text-primary flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  Your application will be reviewed within 24-48 hours. We'll send you an email confirmation.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex gap-3 justify-between pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={step === 1}
              className="min-w-24 bg-transparent"
            >
              Previous
            </Button>

            {step < 3 ? (
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-24 gap-2"
                onClick={handleNext}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-24 gap-2">
                <CheckCircle className="h-4 w-4" />
                Submit Application
              </Button>
            )}
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6 text-center">
            <Building2 className="h-12 w-12 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-2">List for Free</h3>
            <p className="text-sm text-muted-foreground">No listing fees, no commission. 100% free for vendors.</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 text-center">
            <Mail className="h-12 w-12 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-2">Direct Contact</h3>
            <p className="text-sm text-muted-foreground">Connect with buyers directly via WhatsApp. No middlemen.</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 text-center">
            <FileText className="h-12 w-12 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-2">Compliance Support</h3>
            <p className="text-sm text-muted-foreground">Guidelines to help you meet Pakistani health regulations.</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
