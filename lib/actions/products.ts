import { createClient } from '@/lib/supabase/server'

export type Product = {
    id: string
    name: string
    category: string
    vendor_id: string
    vendor_name?: string // Joined from profiles
    price: number
    description: string
    condition: 'New' | 'Used' | 'Refurbished'
    location: string
    image_url: string
    created_at: string
}

export async function getProducts() {
    const supabase = await createClient()

    const { data: products, error } = await supabase
        .from('products')
        .select(`
      *,
      vendor:vendor_id (
        full_name,
        city
      )
    `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching products:', error)
        return []
    }

    return products.map(p => ({
        ...p,
        vendor_name: p.vendor?.full_name || 'Unknown Vendor',
        location: p.vendor?.city || p.location || 'Pakistan'
    }))
}
