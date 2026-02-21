import { createClient } from '@/lib/supabase/server'

export type VendorProfile = {
    id: string
    full_name: string
    email: string
    phone: string | null
    city: string | null
    avatar_url: string | null
    created_at: string
    // Extended Vendor Details (from vendors table)
    business_name?: string
    description?: string | null
    is_verified?: boolean
    showroom_slug?: string | null
    banner_url?: string | null
    whatsapp_number?: string | null
    business_type?: string | null
    years_in_business?: string | null
}

export async function getVendorBySlug(slug: string) {
    const supabase = await createClient()
    if (!supabase) return null

    // 1. Try to find by showroom_slug in vendors table
    const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('showroom_slug', slug)
        .single()

    if (vendorData) {
        // Fetch base profile to merge
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', vendorData.id)
            .single()

        return { ...profile, ...vendorData } as VendorProfile
    }

    // 2. Fallback: Try to find by Profile ID (if slug is a UUID)
    // This allows linking to /shop/USER_ID before they set a custom slug
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
            *,
            vendors (*)
        `)
        .eq('id', slug)
        .single()

    if (profileError || !profile) return null

    // Merge profile with vendor details if they exist
    const vendorDetails = Array.isArray(profile.vendors) ? profile.vendors[0] : profile.vendors

    return {
        ...profile,
        ...vendorDetails,
        // Prefer business name if set, else full name
        business_name: vendorDetails?.business_name || profile.full_name || 'Medixra Member'
    } as VendorProfile
}

export async function getApprovedVendors(): Promise<VendorProfile[]> {
    const supabase = await createClient()
    if (!supabase) return []

    // Fetch all profiles that are approved vendors
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
            id, full_name, email, phone, city, avatar_url, created_at,
            vendors (business_name, business_type, years_in_business, description, is_verified, showroom_slug, banner_url, whatsapp_number)
        `)
        .eq('role', 'vendor')
        .eq('approval_status', 'approved')
        .order('created_at', { ascending: false })

    if (error || !profiles) {
        console.error('Error fetching approved vendors:', error)
        return []
    }

    // Map the returned relational data into a flat VendorProfile array
    return profiles.map((profile) => {
        const vendorDetails = Array.isArray(profile.vendors) ? profile.vendors[0] : profile.vendors
        return {
            ...profile,
            ...vendorDetails,
            business_name: vendorDetails?.business_name || profile.full_name || 'Medixra Vendor',
            city: vendorDetails?.city || profile.city
        } as VendorProfile
    })
}
