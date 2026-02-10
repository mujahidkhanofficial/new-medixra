import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MessageCircle, MapPin, CheckCircle2, ShieldCheck, Tag, Stethoscope, AlertTriangle, Truck, Package, Factory, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { getProductById } from '@/lib/actions/products'
import { ProductGallery } from '@/components/product/product-gallery'
import { TrustSignals } from '@/components/product/trust-signals'
import { formatDistanceToNow } from 'date-fns'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function ProductDetailPage({ params }: PageProps) {
    const { id } = await params
    const product = await getProductById(id)

    if (!product) {
        notFound()
    }

    // Format Data
    const timeAgo = formatDistanceToNow(new Date(product.created_at), { addSuffix: true })

    // Vendor Data for Trust Signals
    const vendorData = {
        id: product.vendor_id,
        name: product.vendor_name || 'Member',
        joinedAt: product.vendor_joined_at,
        city: product.vendor_city,
        phone: product.vendor_phone,
        isVerified: !!product.vendor_phone // Simple verification logic for now
    }

    // Images for Gallery
    const galleryImages = product.images && product.images.length > 0
        ? product.images
        : product.image_url
            ? [{ id: 'main', url: product.image_url }]
            : []

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navigation />

            <main className="flex-1">
                <div className="mx-auto max-w-7xl px-4 py-8">

                    {/* Breadcrumbs */}
                    <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto whitespace-nowrap">
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <span className="text-border">/</span>
                        <Link href="/products" className="hover:text-primary transition-colors">Browse</Link>
                        <span className="text-border">/</span>
                        <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* LEFT COLUMN: Gallery & Description (8 cols) */}
                        <div className="lg:col-span-8 space-y-8">
                            {/* Gallery */}
                            <ProductGallery images={galleryImages} productName={product.name} />

                            {/* Mobile-Only Title & Price (Visible on small screens) */}
                            <div className="block lg:hidden space-y-4">
                                <div>
                                    <span className="text-sm font-medium text-muted-foreground mr-2">{product.category}</span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                        {product.condition}
                                    </span>
                                </div>
                                <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
                                <p className="text-3xl font-bold text-primary">₨ {product.price.toLocaleString()}</p>
                            </div>

                            {/* Industrial Data Grid */}
                            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    <Factory className="h-5 w-5 text-primary" />
                                    Technical Specifications
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Tag className="h-3 w-3" /> Brand
                                        </span>
                                        <p className="font-medium text-foreground">{product.brand || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <ShieldCheck className="h-3 w-3" /> Warranty
                                        </span>
                                        <p className="font-medium text-foreground">{product.warranty || 'No Warranty'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" /> Condition
                                        </span>
                                        <p className="font-medium text-foreground">{product.condition}</p>
                                    </div>
                                    {product.speciality && (
                                        <div className="space-y-1">
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Stethoscope className="h-3 w-3" /> Speciality
                                            </span>
                                            <p className="font-medium text-foreground">{product.speciality}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                                <h3 className="font-semibold text-lg mb-4">Description</h3>
                                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                                    {product.description}
                                </div>
                            </div>

                            {/* Location */}
                            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    Location
                                </h3>
                                <p className="text-muted-foreground">{product.location}</p>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Sidebar (4 cols) */}
                        <div className="lg:col-span-4 space-y-6">

                            {/* Price Card (Desktop) */}
                            <div className="hidden lg:block bg-card border border-border rounded-xl p-6 shadow-sm sticky top-24">
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-muted-foreground">{timeAgo}</span>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                            <Share2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <h1 className="text-2xl font-bold text-foreground mb-2 leading-tight">{product.name}</h1>
                                    <p className="text-3xl font-bold text-primary">₨ {product.price.toLocaleString()}</p>
                                </div>

                                <div className="space-y-3">
                                    {product.vendor_whatsapp ? (
                                        <Link
                                            href={`https://wa.me/${product.vendor_whatsapp}?text=Hi, I am interested in ${encodeURIComponent(product.name)} on Medixra.`}
                                            target="_blank"
                                            className="w-full"
                                        >
                                            <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white gap-2 h-12 text-lg font-medium shadow-md transition-all hover:shadow-lg">
                                                <MessageCircle className="h-5 w-5" />
                                                Chat on WhatsApp
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button disabled className="w-full gap-2 h-12 text-lg font-medium opacity-70">
                                            <MessageCircle className="h-5 w-5" />
                                            WhatsApp Unavailable
                                        </Button>
                                    )}

                                    <Button variant="outline" className="w-full h-12 text-lg font-medium border-primary/20 hover:bg-primary/5 hover:text-primary">
                                        Show Phone Number
                                    </Button>
                                </div>
                            </div>

                            {/* Trust Signals */}
                            <TrustSignals vendor={vendorData} />

                            {/* Safety Notice */}
                            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 rounded-xl p-4 flex gap-3">
                                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                                <div className="text-xs text-amber-800 dark:text-amber-200">
                                    <strong>Disclaimer:</strong> Medixra does not inspect equipment. Compliance with DRAP regulations is the buyer's responsibility.
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
