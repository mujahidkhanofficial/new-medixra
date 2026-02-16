import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdForm } from '@/components/post-ad/ad-form'
import { AdFormData } from '@/components/post-ad/types'

function safeJsonParse<T>(json: string | null, fallback: T): T {
    if (!json) return fallback
    try {
        return JSON.parse(json)
    } catch {
        return fallback
    }
}

export default async function EditAdPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const supabase = await createClient()
    if (!supabase) redirect('/login')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: product, error } = await supabase
        .from('products')
        .select(`
            *,
            product_images (
                url,
                display_order
            )
        `)
        .eq('id', id)
        .eq('vendor_id', user.id)
        .single()

    if (error || !product) {
        redirect('/dashboard/user')
    }

    const typedProduct = product as any
    const imageUrls = typedProduct.product_images
        ?.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
        .map((img: any) => img.url) || []

    const initialData: AdFormData & { id: string; imageUrls: string[] } = {
        id: typedProduct.id,
        imageUrls: imageUrls,
        // Standard Fields
        name: typedProduct.name,
        description: typedProduct.description || '', // Ensure no nulls for controlled inputs
        price: typedProduct.price?.toString() || '',
        category: typedProduct.category,
        condition: typedProduct.condition || 'Used',
        brand: typedProduct.brand || '',
        warranty: typedProduct.warranty || 'No Warranty',

        // JSON Arrays
        specialities: safeJsonParse(typedProduct.speciality, []),
        tags: safeJsonParse(typedProduct.tags, []),

        // Location
        city: typedProduct.city || '',
        area: typedProduct.area || '',

        // New Fields
        model: typedProduct.model || '',
        priceType: typedProduct.price_type || 'fixed',
        currency: typedProduct.currency || 'PKR',

        // Regulatory (Booleans)
        ceCertified: typedProduct.ce_certified || false,
        fdaApproved: typedProduct.fda_approved || false,
        isoCertified: typedProduct.iso_certified || false,
        drapRegistered: typedProduct.drap_registered || false,
        otherCertifications: typedProduct.other_certifications || '',

        // Origin
        originCountry: typedProduct.origin_country || '',
        refurbishmentCountry: typedProduct.refurbishment_country || '',
        installationSupportCountry: typedProduct.installation_support_country || '',

        // Service
        amcAvailable: typedProduct.amc_available || false,
        sparePartsAvailable: typedProduct.spare_parts_available || false,
        installationIncluded: typedProduct.installation_included || false,
    }

    return <AdForm initialData={initialData} />
}
