'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db/drizzle'
import { profiles, engineers } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { authenticatedAction } from '@/lib/safe-action'
import { z } from 'zod'

export async function getEngineerProfile(userId: string) {
    const supabase = await createClient()
    if (!supabase) return null

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
      *,
      engineers(*)
    `)
        .eq('id', userId)
        .single()

    if (profileError) {
        console.error('Error fetching engineer profile:', profileError)
        return null
    }

    // Combine profile and engineer data
    const engineerData = profile.engineers ? (Array.isArray(profile.engineers) ? profile.engineers[0] : profile.engineers) : {}

    return {
        ...profile,
        ...engineerData,
        speciality: engineerData?.speciality || '',
        experience_years: engineerData?.experience_years,
        views: engineerData?.views || 0,
        whatsapp_clicks: engineerData?.whatsapp_clicks || 0,
    }
}

export async function incrementEngineerViews(engineerId: string) {
    try {
        await db.update(engineers)
            .set({ views: sql`${engineers.views} + 1` })
            .where(eq(engineers.id, engineerId))
        return { success: true }
    } catch (error) {
        console.error('Failed to increment engineer views:', error)
        return { success: false }
    }
}

export async function incrementEngineerWhatsappClicks(engineerId: string) {
    try {
        await db.update(engineers)
            .set({ whatsappClicks: sql`${engineers.whatsappClicks} + 1` })
            .where(eq(engineers.id, engineerId))
        return { success: true }
    } catch (error) {
        console.error('Failed to increment engineer whatsapp clicks:', error)
        return { success: false }
    }
}

export const updateEngineerProfile = authenticatedAction(
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

            // Update engineer details
            if (data.speciality || data.experienceYears) {
                const engUpdate: any = {}
                if (data.speciality) engUpdate.speciality = data.speciality
                if (data.experienceYears) engUpdate.experience_years = data.experienceYears
                engUpdate.updated_at = new Date().toISOString()

                await db.update(engineers).set(engUpdate).where(eq(engineers.id, userId))
            }

            revalidatePath('/dashboard/engineer')

            return { success: true }
        } catch (error: any) {
            throw new Error(error?.message || 'Failed to update engineer profile')
        }
    }
)

export async function getApprovedEngineers() {
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
            engineers(
                speciality,
                experience_years,
                is_verified
            )
        `)
        .eq('role', 'engineer')
        .eq('approval_status', 'approved')

    if (error) {
        console.error('Error fetching approved engineers:', error)
        return []
    }

    return profiles.map(profile => {
        const engineerData = profile.engineers ? (Array.isArray(profile.engineers) ? profile.engineers[0] : profile.engineers) : {}

        let parsedSpecialities: string[] = []
        try {
            if (engineerData?.speciality) {
                // Specialities might be saved as JSON array from the MultiSelect or comma-separated
                if (engineerData.speciality.startsWith('[')) {
                    parsedSpecialities = JSON.parse(engineerData.speciality)
                } else {
                    parsedSpecialities = engineerData.speciality.split(',').map((s: string) => s.trim())
                }
            }
        } catch (e) { /* ignore parse error */ }

        return {
            id: profile.id,
            name: profile.full_name || 'Engineer',
            city: profile.city || engineerData?.city || 'Not specified',
            phone: profile.phone || '',
            speciality: engineerData?.speciality ? parsedSpecialities.join(', ') : 'General Maintenance',
            specialitiesList: parsedSpecialities,
            experience: engineerData?.experience_years ? `${engineerData.experience_years} years` : 'Not specified',
            verified: engineerData?.is_verified || false,
            // Fallbacks for UI that were in mock data
            rating: 5.0,
            reviews: 0,
            responseTime: 'Will contact ASAP',
            certifications: engineerData?.is_verified ? ['Platform Verified'] : [],
            image: `bg-gradient-to-br from-teal-100 to-teal-50`, // Randomize later if needed
            whatsapp: profile.phone ? profile.phone.replace(/\D/g, '') : '',
        }
    })
}
