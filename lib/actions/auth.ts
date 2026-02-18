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

async function ensureDefaultAdminAccount(email: string, password: string, userId?: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const adminName = process.env.ADMIN_DEFAULT_NAME || 'Administrator'

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Admin bootstrap missing configuration: set SUPABASE_SERVICE_ROLE_KEY in .env.local')
    }

    const adminSupabase = createAdminClient<Database>(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false }
    })

    let targetUserId = userId

    // If we don't have the ID, we need to find it
    if (!targetUserId) {
        // Optimization: Check local DB profiles first (fastest)
        const localProfile = await db.query.profiles.findFirst({
            where: eq(profiles.email, email)
        })

        if (localProfile) {
            targetUserId = localProfile.id
        } else {
            // Fallback: Slow listing (only happens if user exists in Auth but NOT in profiles, rare)
            const { data: usersData, error: listError } = await adminSupabase.auth.admin.listUsers({
                page: 1,
                perPage: 1000,
            })

            if (listError) throw new Error(listError.message || 'Failed to list users')

            const existing = usersData.users.find((u) => (u.email || '').toLowerCase() === email.toLowerCase())
            targetUserId = existing?.id
        }
    }

    if (!targetUserId) {
        // Create new admin
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
        targetUserId = created.user.id
    } else {
        // Update existing admin password/metadata
        const { error: updateError } = await adminSupabase.auth.admin.updateUserById(targetUserId, {
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

    // Ensure profile exists and has admin role
    const { error: profileError } = await adminSupabase
        .from('profiles')
        .upsert({
            id: targetUserId,
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
    if (!supabase) return { success: false, error: 'Service Unavailable' }

    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error('Logout error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
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
    if (!supabase) return { success: false, message: 'Service Unavailable', errors: {} }

    const defaultAdminEmail = process.env.ADMIN_DEFAULT_EMAIL?.trim().toLowerCase()
    const defaultAdminPassword = process.env.ADMIN_DEFAULT_PASSWORD
    const isDefaultAdminLogin = !!defaultAdminEmail && !!defaultAdminPassword && email === defaultAdminEmail

    // 2. Authentication Strategy
    // Attempt standard login first (Fast Path)
    let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    // 3. Admin Recovery / Bootstrap (Slow Path)
    // Only triggering if standard login fails OR it succeded but we need to verify it's the right admin
    if (isDefaultAdminLogin) {
        // If login failed (maybe password changed in env, or user doesn't exist)
        // OR login succeeded (we just want to ensure profile role text is correct)

        if (authError || (authData.user && password === defaultAdminPassword)) {
            // If auth failed, OR it matched the hardcoded password, we might need to bootstrap/sync.
            // If auth failed: we definitely need to bootstrap.
            // If auth succeeded: we already have the user.id. We just need to ensure profile is 'admin'.

            if (authError) {
                // Optimization: Try to bootstrap only if password matches .env
                if (password === defaultAdminPassword) {
                    try {
                        console.log('Admin login failed, attempting bootstrap...')
                        await ensureDefaultAdminAccount(defaultAdminEmail!, defaultAdminPassword!)
                        // Retry login
                        const retry = await supabase.auth.signInWithPassword({ email, password })
                        authData = retry.data
                        authError = retry.error
                    } catch (err: any) {
                        console.error('Admin bootstrap failed:', err)
                        // Fall out to standard error handling
                    }
                }
            } else if (authData.user) {
                // Optimization: Login succeeded, just perform a lightweight check ensuring role is admin
                // We do this via the DB update below, no need to call ensureDefaultAdminAccount (which calls Admin API) 
                // UNLESS useDefaultAdminAccount does something critical? 
                // It updates password (already correct) and upserts profile.
                // We can skip the API call and just do the DB update.
            }
        }
    }

    if (authError) {
        return {
            success: false,
            message: authError.message,
            errors: {}
        }
    }

    try {
        // 4. User Role & Approval Check
        const user = authData.user!
        if (!user) return { success: false, message: 'User not found' }

        // Fetch or Create Profile if missing (Critical Resilience)
        let profile = await db.query.profiles.findFirst({
            where: eq(profiles.id, user.id)
        })

        if (!profile) {
            // Self-healing: If auth exists but profile doesn't, create it now
            console.log('Profile missing for authenticated user, creating...')
            const newProfile = {
                id: user.id,
                email: user.email!,
                fullName: user.user_metadata.full_name || 'User',
                role: isDefaultAdminLogin ? 'admin' : ('user' as const),
                approvalStatus: isDefaultAdminLogin ? 'approved' : ('approved' as const),
                status: 'active' as const
            }
            await db.insert(profiles).values(newProfile)

            // Fetch again
            profile = await db.query.profiles.findFirst({ where: eq(profiles.id, user.id) })
        }

        if (!profile) return { success: false, message: 'Profile could not be created' }

        // ⚠️ CRITICAL SECURITY: Block suspended accounts from logging in
        if (profile.status === 'suspended') {
            return {
                success: false,
                message: 'Account Suspended',
                errors: {}
            }
        }

        // ENTERPRISE SECURITY: Enforce Admin Role for System Account
        // This ensures the system admin ALWAYS has the correct role, regardless of DB state history.
        if (isDefaultAdminLogin) {
            if (profile.role !== 'admin' || profile.approvalStatus !== 'approved') {
                // Perform critical update with verification
                const [updated] = await db.update(profiles)
                    .set({ role: 'admin', approvalStatus: 'approved' })
                    .where(eq(profiles.id, user.id))
                    .returning()

                if (!updated || updated.role !== 'admin') {
                    throw new Error('System-Critical Error: Failed to enforce Admin privileges.')
                }

                // Sync local variable for immediate redirection usage
                profile.role = 'admin'
                profile.approvalStatus = 'approved'
            }
        }

        revalidatePath('/', 'layout')

        // Handle Pending/Rejected Status
        if (profile.role === 'vendor' || profile.role === 'technician') {
            if (profile.approvalStatus !== 'approved') {
                redirect('/pending-approval')
            }
        }

        // Redirect to role-specific dashboard using centralized utility
        const dashboardPath = getRoleDashboard(profile.role)
        redirect(dashboardPath)
    } catch (error: any) {
        // Allow redirects to bubble up
        if (error.message === 'NEXT_REDIRECT') throw error;

        console.error('Login error:', error)
        return {
            success: false,
            message: 'Service Unavailable: Unable to retrieve user profile',
            errors: {}
        }
    }
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
            if (supabase) await supabase.auth.signOut()

            revalidatePath('/', 'layout')

            // 4. Redirect to home page after deletion
            redirect('/')
        } catch (error: any) {
            throw new Error(error?.message || 'Failed to delete profile')
        }
    }
)

export const updateProfile = authenticatedAction(
    z.object({
        fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
        city: z.string().optional(),
    }),
    async (data, userId) => {
        try {
            const updateData: any = {
                updated_at: new Date().toISOString()
            }

            if (data.fullName) updateData.full_name = data.fullName
            if (data.city) updateData.city = data.city

            await db.update(profiles)
                .set(updateData)
                .where(eq(profiles.id, userId))

            revalidatePath('/dashboard/settings')
            revalidatePath('/dashboard/user')

            return { success: true }
        } catch (error: any) {
            throw new Error(error?.message || 'Failed to update profile')
        }
    }
)
