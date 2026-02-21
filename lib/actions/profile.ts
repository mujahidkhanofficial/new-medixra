'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const profileSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(10, 'Phone must be at least 10 characters'),
    city: z.string().min(1, 'City is required'),
    businessType: z.string().optional(),
    yearsInBusiness: z.string().optional(),
})

export type UpdateProfileState = {
    success: boolean
    message?: string
    errors?: Record<string, string[]>
}

export async function updateProfile(prevState: any, formData: FormData): Promise<UpdateProfileState> {
    const supabase = await createClient()
    if (!supabase) return { success: false, message: 'Service Unavailable' }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { success: false, message: 'Authentication failed' }
    }

    const rawData = {
        fullName: formData.get('fullName'),
        phone: formData.get('phone'),
        city: formData.get('city'),
        businessType: formData.get('businessType'),
        yearsInBusiness: formData.get('yearsInBusiness'),
    }

    try {
        const validatedData = profileSchema.parse(rawData)

        // Update Profile
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                full_name: validatedData.fullName,
                phone: validatedData.phone,
                city: validatedData.city,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)

        if (updateError) {
            console.error('Update Profile Error:', updateError)
            return { success: false, message: 'Failed to update profile' }
        }

        // Conditionally update Vendor data if these exist in the FormData
        if (validatedData.businessType !== undefined || validatedData.yearsInBusiness !== undefined) {
            const { error: vendorError } = await supabase
                .from('vendors')
                .update({
                    business_type: validatedData.businessType,
                    years_in_business: validatedData.yearsInBusiness,
                    updated_at: new Date().toISOString(),
                } as any)
                .eq('id', user.id)

            if (vendorError) {
                console.error('Update Vendor Meta Error:', vendorError)
                // don't hard crash the profile save if vendor extension fails
            }
        }

        // Also update Auth Metadata (optional but good for consistency)
        await supabase.auth.updateUser({
            data: {
                full_name: validatedData.fullName,
                city: validatedData.city,
            }
        })

        revalidatePath('/dashboard/user')
        revalidatePath('/dashboard/vendor')
        revalidatePath('/dashboard/settings')

        return { success: true, message: 'Profile updated successfully' }

    } catch (e) {
        if (e instanceof z.ZodError) {
            return { success: false, errors: e.flatten().fieldErrors as any, message: 'Validation failed' }
        }
        return { success: false, message: 'An unexpected error occurred' }
    }
}
