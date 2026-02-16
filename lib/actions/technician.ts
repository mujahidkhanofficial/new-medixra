'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db/drizzle'
import { profiles, technicians } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { authenticatedAction } from '@/lib/safe-action'
import { z } from 'zod'

export async function getTechnicianProfile(userId: string) {
    const supabase = await createClient()
    if (!supabase) return null

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
      *,
      technicians(*)
    `)
        .eq('id', userId)
        .single()

    if (profileError) {
        console.error('Error fetching technician profile:', profileError)
        return null
    }

    // Combine profile and technician data
    const technicianData = profile.technicians ? (Array.isArray(profile.technicians) ? profile.technicians[0] : profile.technicians) : {}

    return {
        ...profile,
        ...technicianData,
        speciality: technicianData?.speciality || '',
        experience_years: technicianData?.experience_years,
    }
}

export const updateTechnicianProfile = authenticatedAction(
    z.object({
        fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
        phone: z.string().optional(),
        city: z.string().optional(),
        speciality: z.string().optional(),
        experienceYears: z.string().optional(),
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

            // Update technician details
            if (data.speciality || data.experienceYears) {
                const techUpdate: any = {}
                if (data.speciality) techUpdate.speciality = data.speciality
                if (data.experienceYears) techUpdate.experience_years = data.experienceYears
                techUpdate.updated_at = new Date().toISOString()

                await db.update(technicians).set(techUpdate).where(eq(technicians.id, userId))
            }

            revalidatePath('/dashboard/technician')

            return { success: true }
        } catch (error: any) {
            throw new Error(error?.message || 'Failed to update technician profile')
        }
    }
)
