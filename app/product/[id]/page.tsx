'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Heart, MessageCircle, Share2, Star, MapPin, CheckCircle, AlertCircle, Package, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'

// Mock data - In production, this would come from Supabase
const productsData: Record<string, {
    id: string
    name: string
    category: string
    price: string
    vendor: {
        name: string
        rating: number
        reviews: number
        location: string
        verified: boolean
        yearsInBusiness: string
        whatsapp: string
    }
    images: string
    description: string
    features: string[]
    specifications: { name: string; value: string }[]
    regulations: string[]
    stock: number
    deliveryTime: string
    condition: string
}> = {
    '1': {
        id: '1',
        name: 'Portable Ultrasound Machine',
        category: 'Imaging Equipment',
        price: '₨ 450,000',
        condition: 'New',
        vendor: {
            name: 'MediTech Pakistan',
            rating: 4.8,
            reviews: 287,
            location: 'Lahore',
            verified: true,
            yearsInBusiness: '8 years',
            whatsapp: '923001234567',
        },
        images: 'bg-gradient-to-br from-purple-100 to-purple-50',
        description: 'Professional-grade portable ultrasound machine ideal for diagnostic imaging in hospitals, clinics, and portable care units.',
        features: [
            'Real-time imaging at 50-80 MHz',
            'Portable design with 8-hour battery',
            'Multiple probe options included',
            '2 year warranty',
        ],
        specifications: [
            { name: 'Display', value: '15-inch HD touchscreen' },
            { name: 'Probes', value: '4 standard probes' },
            { name: 'Battery Life', value: '8 hours' },
            { name: 'Weight', value: '12 kg' },
        ],
        regulations: [
            'DRAP registered',
            'ISO 13485 certified',
        ],
        stock: 5,
        deliveryTime: '3-5 business days',
    },
    '2': {
        id: '2',
        name: 'Advanced ECG Monitor',
        category: 'Monitoring Equipment',
        price: '₨ 95,000',
        condition: 'New',
        vendor: {
            name: 'CardioMed Solutions',
            rating: 4.6,
            reviews: 142,
            location: 'Karachi',
            verified: true,
            yearsInBusiness: '5 years',
            whatsapp: '923009876543',
        },
        images: 'bg-gradient-to-br from-orange-100 to-orange-50',
        description: '12-lead ECG monitor with advanced arrhythmia detection and wireless connectivity.',
        features: [
            '12-lead ECG recording',
            'Automatic arrhythmia detection',
            'Bluetooth & WiFi connectivity',
            '1 year warranty',
        ],
        specifications: [
            { name: 'Display', value: '10-inch color LCD' },
            { name: 'Channels', value: '12 leads' },
            { name: 'Memory', value: '1000 recordings' },
            { name: 'Weight', value: '3 kg' },
        ],
        regulations: [
            'DRAP registered',
            'CE marked',
        ],
        stock: 12,
        deliveryTime: '2-3 business days',
    },
}

export default function ProductDetailPage() {
    const params = useParams()
    const productId = params.id as string
    const [isSaved, setIsSaved] = useState(false)

    const product = productsData[productId]

    if (!product) {
        return (
            <div className="min-h-screen bg-background">
                <Navigation />
                <div className="mx-auto max-w-6xl px-4 py-24 text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
                    <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
                    <Button asChild>
                        <Link href="/product">Browse Products</Link>
                    </Button>
                </div>
                <Footer />
            </div>
        )
    }

    const handleWhatsAppClick = () => {
        const message = encodeURIComponent(`Hi! I'm interested in "${product.name}" listed on Medixra. Is it still available?`)
        window.open(`https://wa.me/${product.vendor.whatsapp}?text=${message}`, '_blank')
    }

    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            <div className="mx-auto max-w-6xl px-4 py-12">
                {/* Breadcrumb */}
                <div className="mb-6 flex gap-2 text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-primary">Home</Link>
                    <span>/</span>
                    <Link href="/product" className="hover:text-primary">{product.category}</Link>
                    <span>/</span>
                    <span className="text-foreground">{product.name}</span>
                </div>

                {/* Main Content */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
                    {/* Product Image */}
                    <div className="lg:col-span-1">
                        <div className={`${product.images} aspect-square rounded-lg mb-4`} />
                        <div className="flex gap-2">
                            <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                                {product.condition}
                            </span>
                        </div>
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
                                    <Star key={i} className={`h-5 w-5 ${i < Math.floor(product.vendor.rating) ? 'fill-primary text-primary' : 'text-muted'}`} />
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
                            </div>
                        </div>

                        {/* Stock & Delivery */}
                        <div className="mb-6 pb-6 border-b border-border space-y-3">
                            <div className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-primary" />
                                <span className="text-sm">
                                    <strong>Stock:</strong> {product.stock} units available
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
                                onClick={handleWhatsAppClick}
                                className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white gap-2 h-12"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Contact on WhatsApp
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
                    </div>
                </div>

                {/* Description & Features */}
                <div className="grid gap-8 md:grid-cols-2 mb-12">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground mb-4">Description</h2>
                        <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>

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

                    <div>
                        <h2 className="text-2xl font-bold text-foreground mb-4">Specifications</h2>
                        <div className="space-y-3">
                            {product.specifications.map((spec, idx) => (
                                <div key={idx} className="flex justify-between py-3 border-b border-border last:border-0">
                                    <span className="text-muted-foreground">{spec.name}</span>
                                    <span className="font-semibold text-foreground">{spec.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Compliance Notice */}
                <div className="rounded-lg bg-muted/50 border border-border p-6 mb-8">
                    <h3 className="font-semibold text-foreground mb-3">Safety & Compliance</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        <strong>Important:</strong> Medixra is a listing platform only. Buyers must verify compliance with Pakistani laws (including DRAP) before purchase. See our <Link href="/safety-compliance" className="text-primary hover:underline">Safety & Compliance</Link> guidelines.
                    </p>
                </div>
            </div>

            <Footer />
        </div>
    )
}
