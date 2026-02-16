import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Phone, CheckCircle2, Calendar, LayoutGrid, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { getVendorBySlug } from '@/lib/actions/vendors'
import { getVendorProducts } from '@/lib/actions/products'
import { format } from 'date-fns'

interface PageProps {
    params: Promise<{ slug: string }>
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

            {/* Banner Area */}
            <div className="h-48 md:h-64 bg-gradient-to-r from-primary/10 to-primary/5 relative">
                {vendor.banner_url && (
                    <Image
                        src={vendor.banner_url}
                        alt="Shop Banner"
                        fill
                        className="object-cover opacity-80"
                    />
                )}
                <div className="absolute inset-0 bg-black/10" />
            </div>

            <main className="flex-1 -mt-20 relative z-10 px-4 pb-12">
                <div className="mx-auto max-w-screen-2xl">

                    {/* Key Info Card */}
                    <div className="bg-card border border-border rounded-xl shadow-lg p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center mb-8">
                        {/* Avatar / Logo */}
                        <div className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-background bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm relative">
                            {vendor.avatar_url ? (
                                <Image src={vendor.avatar_url} alt={vendor.full_name} fill className="object-cover" />
                            ) : (
                                <span className="text-4xl font-bold text-muted-foreground">{vendor.full_name?.charAt(0).toUpperCase()}</span>
                            )}
                            {vendor.is_verified && (
                                <div className="absolute bottom-1 right-1 bg-background rounded-full p-1">
                                    <CheckCircle2 className="h-6 w-6 text-blue-500 fill-blue-500/10" />
                                </div>
                            )}
                        </div>

                        {/* Text Info */}
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-3xl font-bold text-foreground">
                                    {vendor.business_name || vendor.full_name}
                                </h1>
                                {vendor.is_verified && (
                                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200">
                                        Verified Business
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4" />
                                    {vendor.city || 'Pakistan'}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4" />
                                    Member since {joinedDate}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Award className="h-4 w-4" />
                                    {products.length} Active Listings
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            {vendor.whatsapp_number && (
                                <Button className="bg-[#25D366] hover:bg-[#128C7E] text-white gap-2" asChild>
                                    <Link href={`https://wa.me/${vendor.whatsapp_number}`} target="_blank">
                                        <Phone className="h-4 w-4" /> WhatsApp
                                    </Link>
                                </Button>
                            )}
                            {vendor.phone && (
                                <Button variant="outline" className="gap-2">
                                    <Phone className="h-4 w-4" /> {vendor.phone}
                                </Button>
                            )}
                        </div>
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
                                            <div className="aspect-[4/3] bg-muted relative">
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
