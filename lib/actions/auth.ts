'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { loginSchema } from '@/lib/validation'
import { z } from 'zod'
import { db } from '@/lib/db/drizzle'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { authenticatedAction } from '@/lib/safe-action'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'
import { getRoleDashboard } from '@/lib/auth/role-redirect'

async function ensureDefaultAdminAccount(email: string, password: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const adminName = process.env.ADMIN_DEFAULT_NAME || 'Administrator'

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Admin bootstrap missing configuration: set SUPABASE_SERVICE_ROLE_KEY in .env.local')
    }

    const adminSupabase = createAdminClient<Database>(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false }
    })

    const { data: usersData, error: listError } = await adminSupabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
    })

    if (listError) {
        throw new Error(listError.message || 'Failed to validate admin account')
    }

    const existing = usersData.users.find((u) => (u.email || '').toLowerCase() === email.toLowerCase())
    let adminUserId = existing?.id

    if (!adminUserId) {
        const { data: created, error: createError } = await adminSupabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name: adminName,
                role: 'admin',
            }
        })

        if (createError || !created.user) {
            throw new Error(createError?.message || 'Failed to create admin account')
        }

        adminUserId = created.user.id
    } else {
        const { error: updateError } = await adminSupabase.auth.admin.updateUserById(adminUserId, {
            password,
            email,
            user_metadata: {
                full_name: adminName,
                role: 'admin',
            }
        })

        if (updateError) {
            throw new Error(updateError.message || 'Failed to sync admin account')
        }
    }

    const { error: profileError } = await adminSupabase
        .from('profiles')
        .upsert({
            id: adminUserId,
            email,
            full_name: adminName,
            role: 'admin',
            approval_status: 'approved',
            updated_at: new Date().toISOString(),
        } as any, { onConflict: 'id' })

    if (profileError) {
        throw new Error(profileError.message || 'Failed to sync admin profile')
    }
}

export async function logout() {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error('Logout error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/login')
}

export async function loginAction(prevState: any, formData: FormData) {
    const email = (formData.get('email') as string).trim().toLowerCase()
    const password = formData.get('password') as string

    // 1. Validation
    const validationResult = loginSchema.safeParse({ email, password })
    if (!validationResult.success) {
        return {
            success: false,
            errors: validationResult.error.flatten().fieldErrors,
            message: 'Invalid email or password format'
        }
    }

    const supabase = await createClient()

    const defaultAdminEmail = process.env.ADMIN_DEFAULT_EMAIL?.trim().toLowerCase()
    const defaultAdminPassword = process.env.ADMIN_DEFAULT_PASSWORD
    const isDefaultAdminLogin = !!defaultAdminEmail && !!defaultAdminPassword && email === defaultAdminEmail && password === defaultAdminPassword

    if (isDefaultAdminLogin) {
        try {
            await ensureDefaultAdminAccount(defaultAdminEmail!, defaultAdminPassword!)
        } catch (adminBootstrapError: any) {
            return {
                success: false,
                message: adminBootstrapError?.message || 'Admin login is not configured correctly',
                errors: {}
            }
        }
    }

    // 2. Authentication
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return {
            success: false,
            message: error.message,
            errors: {}
        }
    }

    // 3. User Role & Approval Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'User not found' }

    const profile = await db.query.profiles.findFirst({
        where: eq(profiles.id, user.id)
    })

    if (!profile) return { success: false, message: 'Profile not found' }

    // ⚠️ CRITICAL SECURITY: Block suspended accounts from logging in
    if (profile.status === 'suspended') {
        return {
            success: false,
            message: 'Account Suspended',
            errors: {}
        }
    }

    if (isDefaultAdminLogin && profile.role !== 'admin') {
        await db.update(profiles)
            .set({ role: 'admin', approvalStatus: 'approved' })
            .where(eq(profiles.id, user.id))
    }

    const effectiveProfile = isDefaultAdminLogin
        ? { ...profile, role: 'admin', approvalStatus: 'approved' }
        : profile

    if (effectiveProfile.role === 'user' && effectiveProfile.approvalStatus !== 'approved') {
        await db.update(profiles)
            .set({ approvalStatus: 'approved' })
            .where(eq(profiles.id, user.id))
    }

    revalidatePath('/', 'layout')

    // Handle Pending/Rejected Status
    if (effectiveProfile.role === 'vendor' || effectiveProfile.role === 'technician') {
        if (effectiveProfile.approvalStatus !== 'approved') {
            redirect('/pending-approval')
        }
    }

    // Redirect to role-specific dashboard using centralized utility
    const dashboardPath = getRoleDashboard(effectiveProfile.role)
    redirect(dashboardPath)
}

export const deleteProfile = authenticatedAction(
    z.object({
        confirmation: z.literal('DELETE')
    }),
    async (data, userId) => {
        try {
            const currentProfile = await db.query.profiles.findFirst({
                where: eq(profiles.id, userId)
            })

            if (currentProfile?.role === 'admin') {
                throw new Error('Admin account cannot be deleted')
            }

            // 1. Delete profile from database (cascades to vendors, technicians, products, saved_items)
            await db.delete(profiles).where(eq(profiles.id, userId))

            // 2. Delete Supabase auth user using service role (anon key cannot call admin API)
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
            const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

            if (supabaseUrl && serviceRoleKey) {
                const adminSupabase = createAdminClient<Database>(supabaseUrl, serviceRoleKey, {
                    auth: { persistSession: false, autoRefreshToken: false }
                })
                const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(userId)
                if (deleteError) {
                    console.error('Error deleting auth user:', deleteError)
                    // Profile already deleted from DB, log this but don't throw
                }
            } else {
                console.error('Cannot delete auth user: SUPABASE_SERVICE_ROLE_KEY not configured')
            }

            // 3. CRITICAL: Sign out the user to clear their session immediately
            const supabase = await createClient()
            await supabase.auth.signOut()

            revalidatePath('/', 'layout')

            // 4. Redirect to home page after deletion
            redirect('/')
        } catch (error: any) {
            throw new Error(error?.message || 'Failed to delete profile')
        }
    }
)
