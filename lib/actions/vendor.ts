'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db/drizzle'
import { profiles, vendors } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { authenticatedAction } from '@/lib/safe-action'
import { z } from 'zod'

export async function getVendorProfile(userId: string) {
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    // SECURITY: Verify caller is authenticated and is the vendor themselves
    if (!currentUser || currentUser.id !== userId) {
        throw new Error('Unauthorized: Cannot access other vendor profiles')
    }

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

    // SECURITY: Verify vendor is approved before returning profile
    if (profile.role === 'vendor' && profile.approval_status !== 'approved') {
        throw new Error('Vendor account not approved. Access denied.')
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

export const updateVendorProfile = authenticatedAction(
    z.object({
        fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
        phone: z.string().optional(),
        city: z.string().optional(),
        businessName: z.string().min(2, 'Business name must be at least 2 characters').optional(),
        description: z.string().optional(),
        contactPhone: z.string().optional(),
        whatsappNumber: z.string().optional(),
    }),
    async (data, userId) => {
        try {
            // Update profile
            if (data.fullName || data.phone || data.city) {
                const profileUpdate: any = {}
                if (data.fullName) profileUpdate.full_name = data.fullName
                if (data.phone) profileUpdate.phone = data.phone
                if (data.city) profileUpdate.city = data.city

                await db.update(profiles).set(profileUpdate).where(eq(profiles.id, userId))
            }

            // Update vendor details
            if (data.businessName || data.description || data.contactPhone || data.whatsappNumber) {
                const vendorUpdate: any = {}
                if (data.businessName) vendorUpdate.business_name = data.businessName
                if (data.description) vendorUpdate.description = data.description
                if (data.contactPhone) vendorUpdate.contact_phone = data.contactPhone
                if (data.whatsappNumber) vendorUpdate.whatsapp_number = data.whatsappNumber
                vendorUpdate.updated_at = new Date().toISOString()

                await db.update(vendors).set(vendorUpdate).where(eq(vendors.id, userId))
            }

            revalidatePath('/dashboard/vendor')

            return { success: true }
        } catch (error: any) {
            throw new Error(error?.message || 'Failed to update vendor profile')
        }
    }
)
