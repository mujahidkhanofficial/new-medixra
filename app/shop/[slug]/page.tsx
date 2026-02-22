import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Phone, CheckCircle2, Calendar, LayoutGrid, Award, Briefcase, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { getVendorBySlug } from '@/lib/actions/vendors'
import { getVendorProducts } from '@/lib/actions/products'
import { format } from 'date-fns'
import type { Metadata } from 'next'

interface PageProps {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const vendor = await getVendorBySlug(slug)

    if (!vendor) {
        return { title: 'Store Not Found' }
    }

    const businessName = vendor.business_name || vendor.full_name
    return {
        title: `${businessName} Webstore`,
        description: vendor.description || `Browse medical equipment from ${businessName} on Medixra.`,
    }
}

export default async function VendorShowroomPage({ params }: PageProps) {
    const { slug } = await params
    const vendor = await getVendorBySlug(slug)

    if (!vendor) {
        notFound()
    }

    const products = await getVendorProducts(vendor.id)
    const joinedDate = format(new Date(vendor.created_at), 'MMM yyyy')

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navigation />

            <main className="flex-1 py-12 px-4">
                <div className="mx-auto max-w-7xl">
                    {/* Minimal Header Section */}
                    <div className="mb-12 border-b border-border/60 pb-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                                        {vendor.business_name || vendor.full_name}
                                    </h1>
                                    {vendor.is_verified && (
                                        <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            <span>Verified Business</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-muted-foreground">
                                    {vendor.business_type && (
                                        <div className="flex items-center gap-1.5">
                                            <Briefcase className="h-4 w-4 text-foreground/70" />
                                            {vendor.business_type}
                                        </div>
                                    )}
                                    {vendor.years_in_business && (
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-4 w-4 text-foreground/70" />
                                            {vendor.years_in_business} Years Experience
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="h-4 w-4 text-foreground/70" />
                                        {vendor.city || 'Pakistan'}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4 text-foreground/70" />
                                        Member since {joinedDate}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Award className="h-4 w-4 text-foreground/70" />
                                        {products.length} Active Listings
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                {(vendor.whatsapp_number || vendor.phone) && (
                                    <Button className="bg-[#25D366] hover:bg-[#128C7E] text-white gap-2 rounded-full px-6 shadow-sm" asChild>
                                        <Link href={`https://wa.me/${vendor.whatsapp_number || vendor.phone}`} target="_blank">
                                            <Phone className="h-4 w-4" /> WhatsApp
                                        </Link>
                                    </Button>
                                )}
                                {vendor.phone && (
                                    <Button variant="outline" className="gap-2 rounded-full px-6 shadow-sm border-border/60 hover:bg-muted/50">
                                        <Phone className="h-4 w-4 text-foreground/70" /> {vendor.phone}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {vendor.description && (
                            <div className="mt-8 pt-6 border-t border-border/40 text-muted-foreground leading-relaxed whitespace-pre-wrap max-w-4xl">
                                {vendor.description}
                            </div>
                        )}
                    </div>

                    {/* Inventory Area */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b pb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <LayoutGrid className="h-5 w-5 text-primary" />
                                Active Inventory
                            </h2>
                            <span className="text-sm text-muted-foreground">{products.length} Products</span>
                        </div>

                        {products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {products.map((product) => (
                                    <Link href={`/product/${product.id}`} key={product.id} className="group block h-full">
                                        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm h-full flex flex-col hover:shadow-md transition-shadow">
                                            <div className="aspect-4/3 bg-muted relative">
                                                {product.image_url ? (
                                                    <Image
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                                                        No Image
                                                    </div>
                                                )}
                                                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                                                    {product.condition}
                                                </div>
                                            </div>
                                            <div className="p-4 flex flex-col flex-1">
                                                <div className="mb-2">
                                                    <span className="text-xs text-muted-foreground">{product.category}</span>
                                                    <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                                                        {product.name}
                                                    </h3>
                                                </div>
                                                <div className="mt-auto">
                                                    <p className="text-xl font-bold text-primary">₨ {product.price.toLocaleString()}</p>
                                                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" /> {product.location || vendor.city}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24 bg-muted/20 rounded-xl border border-dashed">
                                <p className="text-muted-foreground">No active listings available.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
