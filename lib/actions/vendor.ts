'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getVendorProfile(userId: string) {
    const supabase = await createClient()

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
      *,
      vendors(*)
    `)
        .eq('id', userId)
        .single()

    if (profileError) {
        console.error('Error fetching vendor profile:', profileError)
        return null
    }

    // Combine profile and vendor data
    const vendorData = profile.vendors ? (Array.isArray(profile.vendors) ? profile.vendors[0] : profile.vendors) : {}

    return {
        ...profile,
        ...vendorData, // Vendor data overrides profile data if keys collide (shouldn't for most part)
        // specific mappings if needed
        business_name: vendorData?.business_name || profile.full_name,
        whatsapp_number: vendorData?.whatsapp_number || profile.phone
    }
}
