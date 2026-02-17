import { db } from '@/lib/db/drizzle'
import { profiles, vendors, products, technicians, productReports } from '@/lib/db/schema'
import { eq, desc, count, sql } from 'drizzle-orm'
import AdminDashboardClient from './client-page'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAnalyticsData } from '@/lib/actions/analytics'

export default async function AdminDashboardPage() {
    const supabase = await createClient()

    if (!supabase) {
        redirect('/login')
    }

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

    // Fetch Data with Error Handling
    try {
        const [
            totalUsersResult,
            activeVendorsResult,
            activeTechniciansResult,
            listedProductsResult,
            pendingApprovalsData,
            allUsersData,
            totalInquiriesResult,
            analyticsData, // New analytics data
            recentProfiles, // Recent users for feed
            recentProductsData // Recent products for feed
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
                createdAt: profiles.createdAt,
                phone: profiles.phone,
                city: profiles.city,
                avatarUrl: profiles.avatarUrl,
            }).from(profiles).orderBy(desc(profiles.createdAt)),
            db.select({ sum: sql<number>`sum(${products.whatsappClicks})` }).from(products),
            getAnalyticsData(),
            db.select().from(profiles).orderBy(desc(profiles.createdAt)).limit(5),
            db.select({
                id: products.id,
                name: products.name,
                category: products.category,
                createdAt: products.createdAt,
                vendorId: products.vendorId
            }).from(products).orderBy(desc(products.createdAt)).limit(5)
        ])

        // Generate Activity Feed
        const activityFeed = [
            ...recentProfiles.map(p => ({
                id: `user-${p.id}`,
                type: 'user_join',
                title: 'New User Joined',
                description: `${p.fullName || p.email} created an account.`,
                timestamp: new Date(p.createdAt),
                user: { name: p.fullName || 'User', image: p.avatarUrl }
            })),
            ...recentProductsData.map(p => ({
                id: `product-${p.id}`,
                type: 'product_list',
                title: 'New Product Listed',
                description: `${p.name} added to ${p.category}`,
                timestamp: new Date(p.createdAt),
                // We could fetch vendor name here but for performance, skipping for now or can use "Vendor"
            }))
        ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10)

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
            joined: new Date(u.createdAt).toLocaleDateString(),
            phone: u.phone,
            location: u.city,
            avatarUrl: u.avatarUrl
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
                analyticsData={analyticsData}
                activityFeed={activityFeed}
            />
        )
    } catch (error: any) {
        console.error('CRITICAL: Dashboard Fetch Failed:', error)
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50 text-center">
                <div className="bg-white p-6 rounded-lg shadow-md max-w-lg w-full border border-red-200">
                    <h1 className="text-2xl font-bold text-red-600 mb-2">Dashboard Error</h1>
                    <p className="text-gray-700 mb-4">Something went wrong while loading the dashboard.</p>
                    <div className="bg-red-50 p-3 rounded-md text-left overflow-auto max-h-60 mb-4">
                        <p className="font-mono text-xs text-red-600 break-all">{error.message || 'Unknown error'}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                        Likely cause: Database schema mismatch.
                        Try running <span className="font-mono bg-gray-100 px-1 rounded">npm run db:push</span>
                    </p>
                </div>
            </div>
        )
    }
}
