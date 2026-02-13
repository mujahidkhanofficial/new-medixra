'use server'

import { db } from '@/lib/db/drizzle'
import { profiles, vendors, products, technicians } from '@/lib/db/schema'
import { eq, and, ne, sql, desc } from 'drizzle-orm'
import { authenticatedAction } from '@/lib/safe-action'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// Helper to check admin role (uses reliable select query)
async function checkAdmin(userId: string) {
    const result = await db
        .select({ role: profiles.role })
        .from(profiles)
        .where(eq(profiles.id, userId))
        .limit(1)

    if (!result[0] || result[0].role !== 'admin') {
        throw new Error('Unauthorized: Admin access required')
    }
}

// --- Vendor Management ---

export const approveUser = authenticatedAction(
    z.object({ userId: z.string().uuid() }),
    async ({ userId: targetUserId }, adminId) => {
        await checkAdmin(adminId)

        const user = await db.query.profiles.findFirst({
            where: eq(profiles.id, targetUserId)
        })

        if (!user) throw new Error('User not found')

        // Update profile status
        await db.update(profiles)
            .set({ approvalStatus: 'approved' })
            .where(eq(profiles.id, targetUserId))

        // In a real app, we'd fetch the user's metadata from Supabase Auth 
        // to populate the specialized tables (vendors/technicians).
        // For now, since the dashboard handles the specialized row creation 
        // via UPSERT, we just approve the profile. 
        // However, to be proactive, let's create the row if it's missing.

        if (user.role === 'vendor') {
            await db.insert(vendors)
                .values({
                    id: targetUserId,
                    businessName: user.fullName || 'New Vendor',
                    isVerified: true
                })
                .onConflictDoUpdate({
                    target: vendors.id,
                    set: { isVerified: true }
                })
        } else if (user.role === 'technician') {
            await db.insert(technicians)
                .values({ id: targetUserId, isVerified: true })
                .onConflictDoUpdate({
                    target: technicians.id,
                    set: { isVerified: true }
                })
        }

        revalidatePath('/admin')
        return { success: true }
    }
)

export const rejectUser = authenticatedAction(
    z.object({ userId: z.string().uuid() }),
    async ({ userId: targetUserId }, adminId) => {
        await checkAdmin(adminId)

        await db.update(profiles)
            .set({ approvalStatus: 'rejected' })
            .where(eq(profiles.id, targetUserId))

        revalidatePath('/admin')
        return { success: true }
    }
)

// Legacy actions (kept for compatibility or updated)
export const approveVendor = approveUser
export const rejectVendor = rejectUser

// --- User Management ---

export const banUser = authenticatedAction(
    z.object({ userId: z.string().uuid() }),
    async ({ userId: targetUserId }, adminId) => {
        await checkAdmin(adminId)

        if (targetUserId === adminId) {
            throw new Error('Admin cannot suspend its own account')
        }

        const targetProfile = await db.query.profiles.findFirst({
            where: eq(profiles.id, targetUserId),
            columns: { role: true }
        })

        if (!targetProfile) {
            throw new Error('User not found')
        }

        if (targetProfile.role === 'admin') {
            throw new Error('Admin account cannot be suspended')
        }

        // Suspend user by setting status='suspended' (preserves their role)
        await db.update(profiles)
            .set({ status: 'suspended' })
            .where(eq(profiles.id, targetUserId))

        // Deactivate their products if they were a vendor
        if (targetProfile.role === 'vendor') {
            await db.update(products)
                .set({ status: 'archived' })
                .where(eq(products.vendorId, targetUserId))
        }

        revalidatePath('/admin')
        return { success: true }
    }
)

export const activateUser = authenticatedAction(
    z.object({ userId: z.string().uuid(), role: z.enum(['user', 'vendor', 'technician']) }),
    async ({ userId: targetUserId, role }, adminId) => {
        await checkAdmin(adminId)

        // Activate user by setting status='active'
        // Role is optional — if provided, update it; otherwise just reactivate
        const updates: any = { status: 'active' }
        if (role) {
            updates.role = role
        }

        await db.update(profiles)
            .set(updates)
            .where(eq(profiles.id, targetUserId))

        // Reactivate products if vendor
        if (role === 'vendor') {
            await db.update(products)
                .set({ status: 'active' })
                .where(eq(products.vendorId, targetUserId))
        }

        revalidatePath('/admin')
        return { success: true }
    }
)

import { createClient } from '@/lib/supabase/server'

// --- Authenticated Admin Data Fetchers ---
// These are called from server components, so we verify the caller via Supabase session

export const getAdminStats = async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')
    await checkAdmin(user.id)

    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(profiles)
    const [productCount] = await db.select({ count: sql<number>`count(*)` }).from(products)
    const [pendingCount] = await db.select({ count: sql<number>`count(*)` }).from(profiles).where(eq(profiles.approvalStatus, 'pending'))

    return {
        totalUsers: userCount.count,
        totalProducts: productCount.count,
        pendingApprovals: pendingCount.count
    }
}

export const getAllUsers = async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')
    await checkAdmin(user.id)

    return await db
        .select()
        .from(profiles)
        .orderBy(desc(profiles.createdAt))
}

export const getPendingApprovals = async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')
    await checkAdmin(user.id)

    return await db
        .select()
        .from(profiles)
        .where(eq(profiles.approvalStatus, 'pending'))
        .orderBy(desc(profiles.createdAt))
}

// --- Product Management ---

export const adminDeleteProduct = authenticatedAction(
    z.object({ productId: z.string().uuid() }),
    async ({ productId }, adminId) => {
        await checkAdmin(adminId)

        await db.delete(products).where(eq(products.id, productId))

        revalidatePath('/admin')
        return { success: true }
    }
)
