import { createClient } from '@/lib/supabase/server'

// ... imports

export type Product = {
    id: string
    name: string
    category: string
    vendor_id: string
    vendor_name?: string
    vendor_avatar?: string
    vendor_phone?: string
    vendor_whatsapp?: string
    vendor_city?: string
    vendor_joined_at?: string
    vendor_verified?: boolean
    price: number
    description: string
    condition: 'New' | 'Used' | 'Refurbished'
    location: string
    image_url: string
    created_at: string
    speciality?: string | null
    brand?: string | null
    warranty?: string | null
    views?: number
    images?: { id: string; url: string }[]
}

// ... imports

export type ProductFilterOptions = {
    query?: string
    category?: string
    city?: string
    minPrice?: number
    maxPrice?: number
    condition?: string
    limit?: number
}

export async function getProducts(options: ProductFilterOptions = {}) {
    const supabase = await createClient()

    let query = supabase
        .from('products')
        .select(`
      *,
      vendor:profiles!vendor_id (
        full_name,
        city
      )
    `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

    if (options.limit) {
        query = query.limit(options.limit)
    }

    if (options.category && options.category !== 'All Categories') {
        query = query.eq('category', options.category)
    }

    if (options.condition && options.condition !== 'All') {
        query = query.eq('condition', options.condition as "New" | "Used" | "Refurbished")
    }

    if (options.city && options.city !== 'All Pakistan') {
        query = query.or(`city.eq.${options.city},location.ilike.%${options.city}%`)
    }

    if (options.minPrice !== undefined) {
        query = query.gte('price', options.minPrice)
    }

    if (options.maxPrice !== undefined && options.maxPrice < 10000000) {
        query = query.lte('price', options.maxPrice)
    }

    if (options.query) {
        query = query.or(`name.ilike.%${options.query}%,description.ilike.%${options.query}%,brand.ilike.%${options.query}%`)
    }

    // Execute query
    const { data: products, error } = await query

    if (error) {
        console.error('Error fetching products detailed:', JSON.stringify(error, null, 2))
        return []
    }

    return products.map((p: any) => ({
        ...p,
        vendor_name: (p.vendor as any)?.full_name || 'Unknown Vendor',
        location: (p.vendor as any)?.city || p.location || 'Pakistan'
    }))
}

export async function getProductById(id: string) {
    const supabase = await createClient()

    // Increment View Count (Fire and forget)

    const { data: product, error } = await supabase
        .from('products')
        .select(`
            *,
            vendor:profiles!vendor_id (
                full_name,
                avatar_url,
                phone,
                city,
                created_at,
                vendors (
                    whatsapp_number,
                    is_verified
                )
            ),
            images:product_images(id, url, display_order)
        `)
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching product:', error)
        return null
    }

    // Sort images by display_order
    const sortedImages = (product.images as any[])?.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)) || []

    const vendorProfile = product.vendor as any
    const vendorProDetails = Array.isArray(vendorProfile?.vendors) ? vendorProfile.vendors[0] : vendorProfile?.vendors

    return {
        ...product,
        vendor_name: vendorProfile?.full_name || 'Medixra Member',
        vendor_avatar: vendorProfile?.avatar_url,
        vendor_phone: vendorProfile?.phone,
        vendor_city: vendorProfile?.city,
        vendor_joined_at: vendorProfile?.created_at,
        vendor_whatsapp: vendorProDetails?.whatsapp_number || vendorProfile?.phone,
        vendor_verified: vendorProDetails?.is_verified || false,
        images: sortedImages
    }
}

export async function getVendorProducts(vendorId: string) {
    const supabase = await createClient()

    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', vendorId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

    if (error) return []
    return products
}
