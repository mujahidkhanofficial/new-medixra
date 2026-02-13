'use server'

import { db } from '@/lib/db/drizzle'
import { productReports, products, profiles } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { authenticatedAction } from '@/lib/safe-action'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Fetch all reported listings for admin (requires admin authentication)
export async function getReportedListings() {
    try {
        // Verify caller is admin
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            console.error('getReportedListings: unauthorized - no user')
            return []
        }

        const adminCheck = await db
            .select({ role: profiles.role })
            .from(profiles)
            .where(eq(profiles.id, user.id))
            .limit(1)

        if (!adminCheck[0] || adminCheck[0].role !== 'admin') {
            console.error('getReportedListings: unauthorized - not admin')
            return []
        }

        const reports = await db.query.productReports.findMany({
            where: eq(productReports.status, 'open'),
            orderBy: [desc(productReports.createdAt)],
            with: {
                product: {
                    columns: {
                        id: true,
                        name: true,
                        price: true,
                        vendorId: true,
                    }
                },
                reporter: {
                    columns: {
                        id: true,
                        fullName: true,
                        email: true,
                    }
                }
            },
        })

        // Enrich with vendor info
        const enriched = await Promise.all(
            reports.map(async (report) => {
                const vendor = await db.query.profiles.findFirst({
                    where: eq(profiles.id, report.product?.vendorId || ''),
                    columns: { fullName: true, email: true }
                })

                return {
                    id: report.id,
                    productId: report.product?.id,
                    productName: report.product?.name || 'Unknown',
                    productPrice: report.product?.price || '0',
                    vendorName: vendor?.fullName || 'Unknown Vendor',
                    vendorEmail: vendor?.email || 'N/A',
                    reason: report.reason,
                    description: report.description,
                    reportedBy: report.reporter?.fullName || 'Anonymous',
                    status: report.status,
                    createdAt: new Date(report.createdAt).toLocaleDateString(),
                    reportCount: 1, // In real implementation, count duplicates
                }
            })
        )

        return enriched
    } catch (error) {
        console.error('Failed to fetch reported listings:', error)
        return []
    }
}

// Resolve a report
export const resolveReport = authenticatedAction(
    z.object({
        reportId: z.string().uuid(),
        actionTaken: z.enum(['listing_removed', 'vendor_warned', 'no_action', 'under_review']),
        shouldRemoveProduct: z.boolean().optional().default(false),
    }),
    async (data, adminId) => {
        try {
            // Verify admin role
            const adminProfile = await db.query.profiles.findFirst({
                where: eq(profiles.id, adminId),
                columns: { role: true }
            })

            if (adminProfile?.role !== 'admin') {
                throw new Error('Only admins can resolve reports')
            }

            // Update report status
            const result = await db.update(productReports)
                .set({
                    status: data.actionTaken === 'listing_removed' ? 'resolved' : 'investigating',
                    actionTaken: data.actionTaken,
                    resolvedAt: new Date().toISOString(),
                    resolvedBy: adminId,
                    updatedAt: new Date().toISOString(),
                })
                .where(eq(productReports.id, data.reportId))
                .returning()

            // If listing should be removed, update product status
            if (data.shouldRemoveProduct && result[0]?.productId) {
                await db.update(products)
                    .set({
                        status: 'removed',
                        updatedAt: new Date().toISOString(),
                    })
                    .where(eq(products.id, result[0].productId))
            }

            return { success: true, message: 'Report resolved successfully' }
        } catch (error: any) {
            throw new Error(error?.message || 'Failed to resolve report')
        }
    }
)

// Dismiss a report (no action needed)
export const dismissReport = authenticatedAction(
    z.object({
        reportId: z.string().uuid(),
        reason: z.string().optional(),
    }),
    async (data, adminId) => {
        try {
            // Verify admin role
            const adminProfile = await db.query.profiles.findFirst({
                where: eq(profiles.id, adminId),
                columns: { role: true }
            })

            if (adminProfile?.role !== 'admin') {
                throw new Error('Only admins can dismiss reports')
            }

            await db.update(productReports)
                .set({
                    status: 'dismissed',
                    actionTaken: 'dismissed',
                    resolvedAt: new Date().toISOString(),
                    resolvedBy: adminId,
                    updatedAt: new Date().toISOString(),
                })
                .where(eq(productReports.id, data.reportId))

            return { success: true, message: 'Report dismissed' }
        } catch (error: any) {
            throw new Error(error?.message || 'Failed to dismiss report')
        }
    }
)

// Delete a report
export const deleteReport = authenticatedAction(
    z.object({
        reportId: z.string().uuid(),
    }),
    async (data, adminId) => {
        try {
            // Verify admin role
            const adminProfile = await db.query.profiles.findFirst({
                where: eq(profiles.id, adminId),
                columns: { role: true }
            })

            if (adminProfile?.role !== 'admin') {
                throw new Error('Only admins can delete reports')
            }

            await db.delete(productReports)
                .where(eq(productReports.id, data.reportId))

            return { success: true, message: 'Report deleted' }
        } catch (error: any) {
            throw new Error(error?.message || 'Failed to delete report')
        }
    }
)
