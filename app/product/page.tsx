'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Share2, Star, MapPin, CheckCircle, AlertCircle, Package, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'

export default function ProductDetailPage() {
  const [isSaved, setIsSaved] = useState(false)

  const product = {
    id: 1,
    name: 'Portable Ultrasound Machine',
    category: 'Imaging Equipment',
    price: '₨ 450,000',
    vendor: {
      name: 'MediTech Pakistan',
      rating: 4.8,
      reviews: 287,
      location: 'Lahore',
      verified: true,
      yearsInBusiness: '8 years',
      phone: '+92 300 1234567',
    },
    images: 'bg-gradient-to-br from-purple-100 to-purple-50',
    description: 'Professional-grade portable ultrasound machine ideal for diagnostic imaging in hospitals, clinics, and portable care units. Features advanced imaging technology with multiple probe options.',
    features: [
      'Real-time imaging at 50-80 MHz frequency',
      'Portable design with rechargeable battery (8 hours)',
      'Multiple probe options: Linear, Convex, Phased Array',
      'Built-in storage for 1000+ images',
      'WiFi connectivity for data transfer',
      'Warranty: 2 years manufacturing',
      'Free training included',
      'Technical support available',
    ],
    specifications: [
      { name: 'Display', value: '15-inch HD touchscreen' },
      { name: 'Probes', value: '4 standard probes included' },
      { name: 'Image Quality', value: '4K resolution' },
      { name: 'Battery Life', value: '8 hours continuous use' },
      { name: 'Weight', value: '12 kg (excluding probes)' },
      { name: 'Dimensions', value: '52cm x 34cm x 15cm' },
    ],
    regulations: [
      'DRAP registered and approved',
      'Meets Pakistani medical equipment standards',
      'ISO 13485 certified',
      'Safe for hospital use',
    ],
    stock: 5,
    deliveryTime: '3-5 business days',
    relatedProducts: [
      { id: 2, name: 'Ultrasound Probe Set', price: '₨ 45,000' },
      { id: 3, name: 'ECG Monitor', price: '₨ 85,000' },
      { id: 4, name: 'Portable X-Ray Machine', price: '₨ 380,000' },
    ],
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Breadcrumb */}
        <div className="mb-6 flex gap-2 text-sm text-muted-foreground">
          <a href="/" className="hover:text-primary">Home</a>
          <span>/</span>
          <a href="/" className="hover:text-primary">{product.category}</a>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {/* Product Image */}
          <div className="lg:col-span-1">
            <div className={`${product.images} aspect-square rounded-lg mb-4`} />
            <Button variant="outline" className="w-full gap-2 bg-transparent">
              <Share2 className="h-4 w-4" />
              Share Product
            </Button>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <p className="text-sm text-primary font-semibold">{product.category}</p>
              <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
              <p className="text-4xl font-bold text-primary mb-4">{product.price}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                ))}
              </div>
              <span className="font-bold text-foreground">{product.vendor.rating}</span>
              <span className="text-sm text-muted-foreground">({product.vendor.reviews} reviews)</span>
            </div>

            {/* Vendor Info */}
            <div className="mb-6 pb-6 border-b border-border">
              <p className="text-sm text-muted-foreground mb-3">Sold by</p>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-foreground">{product.vendor.name}</h3>
                    {product.vendor.verified && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    <MapPin className="h-3.5 w-3.5 inline mr-1" />
                    {product.vendor.location}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {product.vendor.yearsInBusiness} in business
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
              </div>
            </div>

            {/* Stock & Delivery */}
            <div className="mb-6 pb-6 border-b border-border space-y-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <span className="text-sm">
                  <strong>Stock Available:</strong> {product.stock} units
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                <span className="text-sm">
                  <strong>Delivery:</strong> {product.deliveryTime}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-12"
              >
                <MessageCircle className="h-5 w-5" />
                Message Vendor
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 bg-transparent"
                onClick={() => setIsSaved(!isSaved)}
              >
                <Heart className={`h-5 w-5 ${isSaved ? 'fill-primary text-primary' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Regulations Card */}
          <div className="lg:col-span-1 rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Regulatory Compliance
            </h3>
            <ul className="space-y-2 mb-6">
              {product.regulations.map((reg, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  {reg}
                </li>
              ))}
            </ul>

            <div className="rounded-lg bg-accent/10 border border-accent/20 p-3 text-sm text-accent">
              <strong>Note:</strong> Buyer must verify compliance with local regulations before purchase.
            </div>
          </div>
        </div>

        {/* Description & Features */}
        <div className="grid gap-8 md:grid-cols-2 mb-12">
          {/* Description */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Description</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {product.description}
            </p>

            <h3 className="text-lg font-bold text-foreground mb-4">Key Features</h3>
            <ul className="space-y-2">
              {product.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Specifications */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Specifications</h2>
            <div className="space-y-3 mb-6">
              {product.specifications.map((spec, idx) => (
                <div key={idx} className="flex justify-between py-3 border-b border-border last:border-0">
                  <span className="text-muted-foreground">{spec.name}</span>
                  <span className="font-semibold text-foreground">{spec.value}</span>
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-muted/50 border border-border p-4">
              <p className="text-xs text-muted-foreground">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                For detailed specifications, contact the vendor directly via WhatsApp
              </p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Related Equipment</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {product.relatedProducts.map((item) => (
              <div key={item.id} className="rounded-lg border border-border bg-card p-4 hover:border-primary transition-all">
                <div className="bg-gradient-to-br from-blue-100 to-blue-50 aspect-square rounded-lg mb-3" />
                <h3 className="font-semibold text-foreground mb-2">{item.name}</h3>
                <p className="text-lg font-bold text-primary mb-4">{item.price}</p>
                <Button variant="outline" className="w-full gap-2 bg-transparent">
                  <MessageCircle className="h-4 w-4" />
                  Message Vendor
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Notice */}
        <div className="rounded-lg bg-muted/50 border border-border p-6 mb-8">
          <h3 className="font-semibold text-foreground mb-3">Safety & Compliance</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            <strong>Important:</strong> Medixra is a listing platform only. Responsibility for regulatory compliance with Pakistani laws (including DRAP) lies with the vendor and buyer, not Medixra. Buyers must verify that the equipment, seller, and use are compliant with applicable Pakistani laws and medical regulations before purchase. For more information, see our Safety & Compliance guidelines.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}
