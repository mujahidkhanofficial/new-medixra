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
import { ViewTracker } from '@/components/product/view-tracker'
import { ShowPhoneNumber } from '@/components/product/show-phone-number'
import type { Metadata } from 'next'

interface PageProps {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params
    const product = await getProductById(id)

    if (!product) {
        return {
            title: 'Product Not Found',
        }
    }

    // Stripping formatting to use as raw text description
    const rawDescription = product.description.replace(/<[^>]*>?/gm, '').substring(0, 160)

    return {
        title: product.name,
        description: rawDescription || `Buy ${product.name} from Medixra.`,
        openGraph: {
            images: product.image_url ? [{ url: product.image_url }] : [],
        },
    }
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

    // Access Control for non-active products
    if (product.status !== 'active') {
        if (!user) {
            notFound()
        }

        // Check if user is owner
        const isOwner = user.id === product.vendor_id
        let isAdmin = false

        // Check if user is admin (fetch profile to be safe)
        if (supabase) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            isAdmin = profile?.role === 'admin'
        }

        if (!isOwner && !isAdmin) {
            notFound()
        }
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

    // Schema.org Structured Data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.image_url ? [product.image_url] : [],
        description: product.description.replace(/<[^>]*>?/gm, '').substring(0, 160),
        brand: {
            '@type': 'Brand',
            name: product.brand || 'Unspecified'
        },
        offers: {
            '@type': 'Offer',
            url: `https://medixra.com/product/${product.id}`,
            priceCurrency: 'PKR',
            price: product.price || 0,
            itemCondition: product.condition === 'New'
                ? 'https://schema.org/NewCondition'
                : 'https://schema.org/UsedCondition',
            availability: product.status === 'active'
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            seller: {
                '@type': 'Organization',
                name: vendorData.name
            }
        }
    }

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Navigation />

            <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Status Alert for Owner/Admin */}
                    {product.status !== 'active' && (
                        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            <div>
                                <h3 className="text-sm font-semibold text-yellow-900">
                                    This product is currently {product.status}
                                </h3>
                                <p className="text-sm text-yellow-700">
                                    It is only visible to you (the owner) and administrators. Public users cannot see this page.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Breadcrumbs */}
                    <nav className="flex items-center text-sm text-muted-foreground mb-6 overflow-hidden whitespace-nowrap">
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <span className="mx-2 text-border">/</span>
                        <Link href="/products" className="hover:text-primary transition-colors">Browse</Link>
                        <span className="mx-2 text-border">/</span>
                        <span className="font-medium text-foreground truncate">{product.name}</span>
                    </nav>

                    <ViewTracker productId={product.id} />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* LEFT COLUMN: Gallery (7 Cols) */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <ProductGallery images={galleryImages} productName={product.name} />
                            </div>

                            {/* Description & Details (Moved to left col for better flow) */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-8">

                                {/* Technical Specs Grid */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                                        <Factory className="h-5 w-5 text-primary" />
                                        Specifications
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                                        <SpecItem label="Brand" value={product.brand} />
                                        <SpecItem label="Model" value={product.model} />
                                        <SpecItem label="Condition" value={product.condition} />
                                        <SpecItem label="Warranty" value={product.warranty} />
                                        <SpecItem label="Origin" value={product.origin_country} />
                                        {product.refurbishment_country && <SpecItem label="Refurbished In" value={product.refurbishment_country} />}
                                    </div>

                                    {/* Badges */}
                                    <div className="mt-6 flex flex-wrap gap-2">
                                        {product.ce_certified && <Badge>CE Certified</Badge>}
                                        {product.fda_approved && <Badge>FDA Approved</Badge>}
                                        {product.iso_certified && <Badge>ISO Certified</Badge>}
                                        {product.drap_registered && <Badge>DRAP Registered</Badge>}
                                        {product.other_certifications && <Badge>{product.other_certifications}</Badge>}
                                    </div>
                                </div>

                                <div className="h-px bg-gray-100" />

                                {/* Description */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Description</h3>
                                    <div className="prose prose-sm prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                                        {product.description}
                                    </div>
                                </div>

                                <div className="h-px bg-gray-100" />

                                {/* Service Support compact */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                                        <Wrench className="h-5 w-5 text-primary" />
                                        Service & Support
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <SupportCard
                                            icon={<ShieldCheck className="h-5 w-5" />}
                                            title="AMC"
                                            active={product.amc_available ?? false}
                                            label={product.amc_available ? "Available" : "Not Provided"}
                                        />
                                        <SupportCard
                                            icon={<Package className="h-5 w-5" />}
                                            title="Spare Parts"
                                            active={product.spare_parts_available ?? false}
                                            label={product.spare_parts_available ? "In Stock" : "Check Availability"}
                                        />
                                        <SupportCard
                                            icon={<Truck className="h-5 w-5" />}
                                            title="Installation"
                                            active={product.installation_included ?? false}
                                            label={product.installation_included ? "Included" : "Not Included"}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Info & Actions (5 Cols) */}
                        <div className="lg:col-span-5 space-y-5 sticky top-24">

                            {/* Primary Action Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-xs font-semibold tracking-wide text-primary bg-primary/5 px-2.5 py-1 rounded-full uppercase">
                                        {product.category}
                                    </span>
                                    <div className="flex gap-2">
                                        <SaveButton productId={product.id} initialIsSaved={isSaved} />
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                                            <Share2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-2">
                                    {product.name}
                                </h1>

                                <div className="flex items-baseline gap-2 mb-6">
                                    <p className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">
                                        {product.price_type === 'quote'
                                            ? 'Quote Only'
                                            : <>{product.currency || 'Rs'} <span className="text-foreground">{product.price.toLocaleString()}</span></>}
                                    </p>
                                    {product.price_type !== 'quote' && <span className="text-sm text-muted-foreground font-medium">fixed price</span>}
                                </div>

                                <div className="flex flex-col gap-3">
                                    {(product.vendor_whatsapp || product.vendor_phone) ? (
                                        <WhatsAppContact
                                            phoneNumber={(product.vendor_whatsapp || product.vendor_phone) as string}
                                            message={`Hi, I'm interested in ${product.name}...`}
                                            name="Chat on WhatsApp"
                                            size="lg"
                                            fullWidth
                                            productId={product.id}
                                            // Ensure text is readable on green
                                            className="font-semibold text-white shadow-md shadow-green-500/20"
                                        />
                                    ) : (
                                        <Button disabled className="w-full h-12 text-base font-medium opacity-70">
                                            WhatsApp Unavailable
                                        </Button>
                                    )}
                                    <ShowPhoneNumber phoneNumber={product.vendor_phone ?? undefined} />
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded text-xs font-medium text-gray-600">
                                        <MapPin className="h-3.5 w-3.5" />
                                        Item location: {product.location}
                                    </div>
                                    <span>Posted {timeAgo}</span>
                                </div>
                            </div>

                            {/* Seller & Trust Card */}
                            <TrustSignals vendor={vendorData} />

                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}

// Sub-components for cleaner internal code
function SpecItem({ label, value }: { label: string, value?: string | null }) {
    return (
        <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</dt>
            <dd className="text-sm font-semibold text-gray-900 truncate">{value || 'N/A'}</dd>
        </div>
    )
}

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground border border-border/50">
            {children}
        </span>
    )
}

function SupportCard({ icon, title, active, label }: { icon: React.ReactNode, title: string, active: boolean, label: string }) {
    return (
        <div className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${active ? 'bg-primary/5 border-primary/20' : 'bg-gray-50 border-transparent opacity-60'}`}>
            <div className={`p-2 rounded-full ${active ? 'bg-white text-primary shadow-sm' : 'bg-gray-200 text-gray-400'}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs font-medium text-gray-500">{title}</p>
                <p className="text-sm font-semibold text-gray-900">{label}</p>
            </div>
        </div>
    )
}
