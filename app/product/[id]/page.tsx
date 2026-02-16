import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MessageCircle, MapPin, CheckCircle2, ShieldCheck, Tag, Stethoscope, AlertTriangle, Truck, Package, Factory, Share2, Wrench, Globe, FileCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import WhatsAppContact from '@/components/whatsapp-contact'
import { getProductById } from '@/lib/actions/products'
import { ProductGallery } from '@/components/product/product-gallery'
import { TrustSignals } from '@/components/product/trust-signals'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/lib/supabase/server'
import { checkSavedStatus } from '@/lib/actions/saved-items'
import { SaveButton } from '@/components/product/save-button'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function ProductDetailPage({ params }: PageProps) {
    const { id } = await params
    const product = await getProductById(id)
    const supabase = await createClient()

    let user = null
    if (supabase) {
        const { data } = await supabase.auth.getUser()
        user = data.user
    }

    if (!product) {
        notFound()
    }

    // Check saved status
    const isSaved = user ? await checkSavedStatus(user.id, product.id) : false

    // Format Data
    const timeAgo = formatDistanceToNow(new Date(product.created_at), { addSuffix: true })

    // Vendor Data for Trust Signals
    const vendorData = {
        id: product.vendor_id,
        name: product.vendor_name || 'Member',
        joinedAt: product.vendor_joined_at,
        city: product.vendor_city ?? undefined,
        phone: product.vendor_phone ?? undefined,
        isVerified: !!product.vendor_phone
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
                <div className="mx-auto max-w-screen-2xl px-4 py-8">

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
                                <p className="text-3xl font-bold text-primary">
                                    {product.price_type === 'quote'
                                        ? 'Quote Only'
                                        : `${product.currency || 'Rs'} ${product.price.toLocaleString()}`}
                                </p>
                            </div>

                            {/* Industrial Data Grid */}
                            <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
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
                                            <Package className="h-3 w-3" /> Model
                                        </span>
                                        <p className="font-medium text-foreground">{product.model || 'N/A'}</p>
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
                                </div>

                                {product.tags && product.tags.length > 0 && (
                                    <div className="pt-4 border-t">
                                        <span className="text-xs text-muted-foreground mb-2 block">Equipment Type</span>
                                        <div className="flex flex-wrap gap-2">
                                            {product.tags.map(tag => (
                                                <span key={tag} className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium border border-border">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {product.speciality && (
                                    <div className="pt-4 border-t">
                                        <span className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                            <Stethoscope className="h-3 w-3" /> Medical Specialities
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                            {(() => {
                                                try {
                                                    const specArray = JSON.parse(product.speciality);
                                                    return Array.isArray(specArray) ? specArray.map((s: string) => (
                                                        <span key={s} className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                                                            {s}
                                                        </span>
                                                    )) : <span className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">{product.speciality}</span>
                                                } catch {
                                                    return <span className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">{product.speciality}</span>
                                                }
                                            })()}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Compliance & Origin */}
                            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-primary" />
                                    Origin & Compliance
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Origin</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center py-2 border-b border-dashed">
                                                <span className="text-sm">Country of Origin</span>
                                                <span className="font-medium">{product.origin_country || 'N/A'}</span>
                                            </div>
                                            {product.refurbishment_country && (
                                                <div className="flex justify-between items-center py-2 border-b border-dashed">
                                                    <span className="text-sm">Refurbished In</span>
                                                    <span className="font-medium">{product.refurbishment_country}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                            <FileCheck className="h-4 w-4" /> Certifications
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {product.ce_certified && <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium">CE Certified</span>}
                                            {product.fda_approved && <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium">FDA Approved</span>}
                                            {product.iso_certified && <span className="px-3 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-lg text-sm font-medium">ISO Certified</span>}
                                            {product.drap_registered && <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-sm font-medium">DRAP Registered</span>}
                                            {product.other_certifications && <span className="px-3 py-1 bg-secondary text-secondary-foreground border border-border rounded-lg text-sm font-medium">{product.other_certifications}</span>}

                                            {!product.ce_certified && !product.fda_approved && !product.iso_certified && !product.drap_registered && !product.other_certifications && (
                                                <span className="text-sm text-muted-foreground italic">No certifications listed</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Service & Support */}
                            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    <Wrench className="h-5 w-5 text-primary" />
                                    Service & Support
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className={`p-4 rounded-lg border flex flex-col items-center text-center gap-2 ${product.amc_available ? 'bg-primary/5 border-primary/20' : 'bg-muted/20 border-border opacity-60'}`}>
                                        <ShieldCheck className={`h-6 w-6 ${product.amc_available ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <span className="font-medium text-sm">AMC Available</span>
                                        <span className="text-xs text-muted-foreground">{product.amc_available ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className={`p-4 rounded-lg border flex flex-col items-center text-center gap-2 ${product.spare_parts_available ? 'bg-primary/5 border-primary/20' : 'bg-muted/20 border-border opacity-60'}`}>
                                        <Package className={`h-6 w-6 ${product.spare_parts_available ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <span className="font-medium text-sm">Spare Parts</span>
                                        <span className="text-xs text-muted-foreground">{product.spare_parts_available ? 'In Stock' : 'Not Listed'}</span>
                                    </div>
                                    <div className={`p-4 rounded-lg border flex flex-col items-center text-center gap-2 ${product.installation_included ? 'bg-primary/5 border-primary/20' : 'bg-muted/20 border-border opacity-60'}`}>
                                        <Truck className={`h-6 w-6 ${product.installation_included ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <span className="font-medium text-sm">Installation</span>
                                        <span className="text-xs text-muted-foreground">{product.installation_included ? 'Included' : 'Extra / Not Listed'}</span>
                                    </div>
                                </div>
                                {product.installation_support_country && (
                                    <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm">
                                        <span className="text-muted-foreground">Installation Support available in:</span>
                                        <span className="font-medium">{product.installation_support_country}</span>
                                    </div>
                                )}
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
                                        <div className="flex gap-2">
                                            <SaveButton productId={product.id} initialIsSaved={isSaved} />
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                <Share2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <h1 className="text-2xl font-bold text-foreground mb-2 leading-tight">{product.name}</h1>
                                    <p className="text-3xl font-bold text-primary">
                                        {product.price_type === 'quote'
                                            ? 'Quote Only'
                                            : `${product.currency || 'Rs'} ${product.price.toLocaleString()}`}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    {product.vendor_whatsapp ? (
                                        <WhatsAppContact
                                            phoneNumber={product.vendor_whatsapp}
                                            message={`Hi, I am interested in ${product.name} on Medixra.`}
                                            name="Chat on WhatsApp"
                                            size="lg"
                                            fullWidth
                                            productId={product.id}
                                        />
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
                                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
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
