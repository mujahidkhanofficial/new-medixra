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

export async function getApprovedTechnicians() {
    const supabase = await createClient()
    if (!supabase) return []

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
            id,
            full_name,
            avatar_url,
            city,
            phone,
            created_at,
            technicians(
                speciality,
                experience_years,
                is_verified
            )
        `)
        .eq('role', 'technician')
        .eq('approval_status', 'approved')

    if (error) {
        console.error('Error fetching approved technicians:', error)
        return []
    }

    return profiles.map(profile => {
        const technicianData = profile.technicians ? (Array.isArray(profile.technicians) ? profile.technicians[0] : profile.technicians) : {}

        let parsedSpecialities: string[] = []
        try {
            if (technicianData?.speciality) {
                // Specialities might be saved as JSON array from the MultiSelect or comma-separated
                if (technicianData.speciality.startsWith('[')) {
                    parsedSpecialities = JSON.parse(technicianData.speciality)
                } else {
                    parsedSpecialities = technicianData.speciality.split(',').map((s: string) => s.trim())
                }
            }
        } catch (e) { /* ignore parse error */ }

        return {
            id: profile.id,
            name: profile.full_name || 'Technician',
            city: profile.city || technicianData?.city || 'Not specified',
            phone: profile.phone || '',
            speciality: technicianData?.speciality ? parsedSpecialities.join(', ') : 'General Maintenance',
            specialitiesList: parsedSpecialities,
            experience: technicianData?.experience_years ? `${technicianData.experience_years} years` : 'Not specified',
            verified: technicianData?.is_verified || false,
            // Fallbacks for UI that were in mock data
            rating: 5.0,
            reviews: 0,
            responseTime: 'Will contact ASAP',
            certifications: technicianData?.is_verified ? ['Platform Verified'] : [],
            image: `bg-gradient-to-br from-teal-100 to-teal-50`, // Randomize later if needed
            whatsapp: profile.phone ? profile.phone.replace(/\D/g, '') : '',
        }
    })
}
