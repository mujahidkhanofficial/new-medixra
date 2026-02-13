import { db } from '@/lib/db/drizzle'
import { profiles, vendors, products, technicians, productReports } from '@/lib/db/schema'
import { eq, desc, count, sql } from 'drizzle-orm'
import AdminDashboardClient from './client-page'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Verify Admin Role - use simple findFirst for clarity
    try {
        const profile = await db.query.profiles.findFirst({
            where: eq(profiles.id, user.id),
            columns: { role: true }
        })

        if (!profile || profile.role !== 'admin') {
            console.warn(`Non-admin access attempt: User ${user.id} with role ${profile?.role}`)
            redirect('/')
        }
    } catch (error: any) {
        console.error('CRITICAL: Admin verification failed:', error.message || error)
        // If it's a database error like "column status does not exist", it will show here
        if (error.message?.includes('status')) {
            console.error('SQL Error: Missing "status" column in profiles table. Please run database migrations.')
        }
        redirect('/login')
    }

    // Fetch Stats
    const [
        totalUsersResult,
        activeVendorsResult,
        activeTechniciansResult,
        listedProductsResult,
        pendingApprovalsData,
        allUsersData,
        totalInquiriesResult
    ] = await Promise.all([
        db.select({ count: count() }).from(profiles),
        db.select({ count: count() }).from(vendors).where(eq(vendors.isVerified, true)),
        db.select({ count: count() }).from(technicians).where(eq(technicians.isVerified, true)),
        db.select({ count: count() }).from(products).where(eq(products.status, 'active')),
        db.select({
            id: profiles.id,
            fullName: profiles.fullName,
            email: profiles.email,
            role: profiles.role,
            city: profiles.city,
            approvalStatus: profiles.approvalStatus,
            createdAt: profiles.createdAt
        }).from(profiles).where(eq(profiles.approvalStatus, 'pending')).orderBy(desc(profiles.createdAt)),
        db.select({
            id: profiles.id,
            fullName: profiles.fullName,
            email: profiles.email,
            role: profiles.role,
            status: profiles.status,
            createdAt: profiles.createdAt
        }).from(profiles).orderBy(desc(profiles.createdAt)), // Removed .limit(50) to fetch "all" as requested
        db.select({ sum: sql<number>`sum(${products.whatsappClicks})` }).from(products)
    ])

    // Fetch reported listings separately with error handling
    let reportedListingsData: any[] = []
    try {
        reportedListingsData = await db
            .select()
            .from(productReports)
            .where(eq(productReports.status, 'open'))
            .orderBy(desc(productReports.createdAt))
            .limit(50)
    } catch (error) {
        console.error('Failed to fetch reported listings:', error)
    }

    const stats = {
        totalUsers: totalUsersResult[0].count,
        activeVendors: activeVendorsResult[0].count,
        activeTechnicians: activeTechniciansResult[0].count,
        listedProducts: listedProductsResult[0].count,
        totalInquiries: Number(totalInquiriesResult[0].sum || 0)
    }

    // Transform Pending Approvals
    const pendingApprovals = pendingApprovalsData.map(u => ({
        id: u.id,
        name: u.fullName || u.email,
        role: u.role,
        location: u.city || 'Pakistan',
        appliedDate: new Date(u.createdAt).toLocaleDateString(),
        equipment: u.role === 'vendor' ? 'Vendor Application' : 'Technician Application',
        status: 'pending'
    }))

    // Transform Users
    const allUsers = allUsersData.map(u => ({
        id: u.id,
        name: u.fullName || 'Unknown',
        email: u.email,
        role: u.role || 'user',
        status: u.status || 'active', // Now directly from database
        joined: new Date(u.createdAt).toLocaleDateString()
    }))

    // Transform Reported Listings - enrich with product and vendor details
    const reportedListings = await Promise.all(
        reportedListingsData.map(async (report) => {
            try {
                const productData = await db.select().from(products).where(eq(products.id, report.productId)).limit(1)
                const product = productData[0]

                const vendorData = await db.select({ fullName: profiles.fullName, email: profiles.email }).from(profiles).where(eq(profiles.id, product?.vendorId || '')).limit(1)
                const vendor = vendorData[0]

                return {
                    id: report.id,
                    productId: product?.id,
                    productName: product?.name || 'Unknown',
                    productPrice: product?.price || '0',
                    vendorName: vendor?.fullName || 'Unknown Vendor',
                    vendorEmail: vendor?.email || 'N/A',
                    reason: report.reason,
                    description: report.description,
                    reportedBy: 'User Report',
                    status: report.status,
                    createdAt: new Date(report.createdAt).toLocaleDateString(),
                    reportCount: 1,
                }
            } catch (error) {
                console.error('Failed to enrich report:', error)
                return {
                    id: report.id,
                    productId: report.productId,
                    productName: 'Unknown',
                    productPrice: '0',
                    vendorName: 'Unknown Vendor',
                    vendorEmail: 'N/A',
                    reason: report.reason,
                    description: report.description,
                    reportedBy: 'User Report',
                    status: report.status,
                    createdAt: new Date(report.createdAt).toLocaleDateString(),
                    reportCount: 1,
                }
            }
        })
    )

    return (
        <AdminDashboardClient
            initialStats={stats}
            initialPendingApprovals={pendingApprovals}
            initialAllUsers={allUsers}
            initialReportedListings={reportedListings}
            currentAdminId={user.id}
        />
    )
}
