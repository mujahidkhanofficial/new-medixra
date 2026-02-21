'use server'

import { db } from '@/lib/db/drizzle'
import { profiles, products, productAnalytics } from '@/lib/db/schema'
import { sql, gt, desc, eq } from 'drizzle-orm'
import { authenticatedAction } from '@/lib/safe-action'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createNotification } from './notifications'

async function checkAdmin() {
  const supabase = await createClient()
  if (!supabase) throw new Error('Service Unavailable')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const profile = await db.query.profiles.findFirst({
    where: (profiles, { eq }) => eq(profiles.id, user.id),
    columns: { role: true }
  })

  if (profile?.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required')
  }
  return user.id
}

export const getAnalyticsData = async () => {
  try {
    await checkAdmin()

    // 1. Category Distribution
    // Group products by category and count them
    const categoryStats = await db
      .select({
        name: products.category,
        value: sql<number>`count(*)::int`
      })
      .from(products)
      .groupBy(products.category)
      .orderBy(desc(sql`count(*)`))
      .limit(5)

    // 2. Growth Trends (Last 6 Months)
    // This is a bit complex in SQL, usually easier to fetch raw dates and aggregate in JS 
    // if dataset is small, or use date_trunc in SQL. 
    // Let's use SQL date_trunc for 'month'.

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const userGrowth = await db
      .select({
        date: sql<string>`to_char(${profiles.createdAt}, 'Mon')`,
        sortDate: sql<string>`date_trunc('month', ${profiles.createdAt})`,
        count: sql<number>`count(*)::int`
      })
      .from(profiles)
      .where(gt(profiles.createdAt, sixMonthsAgo.toISOString()))
      .groupBy(sql`to_char(${profiles.createdAt}, 'Mon')`, sql`date_trunc('month', ${profiles.createdAt})`)
      .orderBy(sql`date_trunc('month', ${profiles.createdAt})`)

    const productGrowth = await db
      .select({
        date: sql<string>`to_char(${products.createdAt}, 'Mon')`,
        sortDate: sql<string>`date_trunc('month', ${products.createdAt})`,
        count: sql<number>`count(*)::int`
      })
      .from(products)
      .where(gt(products.createdAt, sixMonthsAgo.toISOString()))
      .groupBy(sql`to_char(${products.createdAt}, 'Mon')`, sql`date_trunc('month', ${products.createdAt})`)
      .orderBy(sql`date_trunc('month', ${products.createdAt})`)

    // Merge growth data
    // We need a map of Month -> { sortDate, users, products }
    // Using sortDate (YYYY-MM-01) as key ensures correct chronological sorting
    const growthMap = new Map<string, { name: string, sortDate: string, users: number, products: number }>()

    userGrowth.forEach(item => {
      const entry = growthMap.get(item.sortDate) || { name: item.date, sortDate: item.sortDate, users: 0, products: 0 }
      entry.users = item.count
      growthMap.set(item.sortDate, entry)
    })

    productGrowth.forEach(item => {
      const entry = growthMap.get(item.sortDate) || { name: item.date, sortDate: item.sortDate, users: 0, products: 0 }
      entry.products = item.count
      growthMap.set(item.sortDate, entry)
    })

    // Sort by sortDate string (ISO format works for string sort)
    const growthData = Array.from(growthMap.values())
      .sort((a, b) => a.sortDate.localeCompare(b.sortDate))
      .map(({ name, users, products }) => ({ name, users, products }))

    return {
      categoryData: categoryStats,
      growthData: growthData
    }
  } catch (error) {
    console.error('Failed to fetch analytics:', error)
    return {
      categoryData: [],
      growthData: []
    }
  }
}

// Vendor Analytics Restoration

export const getVendorAnalytics = async (userId: string) => {
  try {
    // Basic metrics based on real data
    const vendorProducts = await db.query.products.findMany({
      where: (products, { eq }) => eq(products.vendorId, userId)
    })

    const activeListings = vendorProducts.length

    // Placeholder for views/inquiries until we have a real tracking table
    const totalViews = vendorProducts.reduce((acc, p) => acc + (p.views || 0), 0)

    return {
      metrics: [
        { value: activeListings, change: '+0' }, // Active Listings
        { value: totalViews, change: '+0%' },    // Total Views
        { value: '4.8', change: '+0.2' }         // Rating (Placeholder)
      ],
      productPerformance: vendorProducts.map(p => ({
        name: p.name,
        views: p.views || 0,
        inquiries: 0, // Placeholder
        conversion: 0 // Placeholder
      })).slice(0, 5)
    }
  } catch (error) {
    console.error('Error fetching vendor analytics:', error)
    return { metrics: [], productPerformance: [] }
  }
}

export const generateViewsChartData = async (vendorId?: string | undefined) => {
  try {
    const supabase = await createClient()
    let currentVendorId = vendorId

    if (!currentVendorId) {
      if (!supabase) return []
      const { data } = await supabase.auth.getUser()
      currentVendorId = data?.user?.id
    }

    if (!currentVendorId) return []

    // Get dates for the last 30 days
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 30)
    const thirtyDaysAgoIsoStr = thirtyDaysAgo.toISOString().split('T')[0]

    // Fetch data for the vendor from the last 30 days
    const analytics = await db.query.productAnalytics.findMany({
      where: (analytics, { eq, and, gte }) => and(
        eq(analytics.vendorId, currentVendorId!),
        gte(analytics.date, thirtyDaysAgoIsoStr)
      )
    })

    // Create a map to aggregate by date
    const dateMap = new Map<string, { views: number, inquiries: number }>()

    // Initialize map with zeroes for all 30 days to ensure continuous chart
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const isoDate = d.toISOString().split('T')[0]
      dateMap.set(isoDate, { views: 0, inquiries: 0 })
    }

    // Populate existing data
    analytics.forEach(record => {
      const existing = dateMap.get(record.date) || { views: 0, inquiries: 0 }
      existing.views += record.views
      existing.inquiries += record.inquiries
      dateMap.set(record.date, existing)
    })

    // Convert to chart format
    // Map entries maintain insertion order (from oldest to newest)
    const data = Array.from(dateMap.entries()).map(([isoDate, metrics]) => {
      // Parse ISO date and format it nicely, e.g. 'Feb 20'
      const dateObj = new Date(isoDate)
      const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      return {
        date: formattedDate,
        views: metrics.views,
        inquiries: metrics.inquiries
      }
    })

    return data
  } catch (error) {
    console.error('Error fetching views chart data:', error)
    return []
  }
}

export const trackWhatsAppClick = async ({ productId }: { productId?: string }) => {
  // This would ideally log to an events table
  if (productId) {
    const supabase = await createClient()
    let user = null
    if (supabase) {
      const { data } = await supabase.auth.getUser()
      user = data.user
    }



    // Fetch product to get vendor details
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
      columns: { vendorId: true, name: true }
    })

    if (product && product.vendorId) {
      // Don't notify if vendor clicks their own ad
      if (user?.id !== product.vendorId) {
        const clickerName = user?.user_metadata?.full_name || 'A visitor'
        const clickerType = user ? 'Verified User' : 'Guest'

        await createNotification(
          product.vendorId,
          'whatsapp_click',
          'New Lead!',
          `${clickerName} (${clickerType}) is interested in "${product.name}" and clicked to chat on WhatsApp.`,
          `/dashboard/vendor`
        )
      }
    }

    await db.update(products)
      .set({ whatsappClicks: sql`${products.whatsappClicks} + 1` })
      .where(sql`${products.id} = ${productId}`)

    if (product && product.vendorId) {
      const today = new Date().toISOString().split('T')[0]
      await db.insert(productAnalytics).values({
        productId,
        vendorId: product.vendorId,
        date: today,
        inquiries: 1
      }).onConflictDoUpdate({
        target: [productAnalytics.productId, productAnalytics.date],
        set: {
          inquiries: sql`${productAnalytics.inquiries} + 1`,
          updatedAt: new Date().toISOString()
        }
      })
    }
  }
  return { success: true }
}

export const incrementProductView = async (productId: string) => {
  try {
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
      columns: { vendorId: true }
    })

    await db.update(products)
      .set({ views: sql`${products.views} + 1` })
      .where(eq(products.id, productId))

    if (product?.vendorId) {
      const today = new Date().toISOString().split('T')[0]
      await db.insert(productAnalytics).values({
        productId,
        vendorId: product.vendorId,
        date: today,
        views: 1
      }).onConflictDoUpdate({
        target: [productAnalytics.productId, productAnalytics.date],
        set: {
          views: sql`${productAnalytics.views} + 1`,
          updatedAt: new Date().toISOString()
        }
      })
    }
    return { success: true }
  } catch (error) {
    console.error('Failed to increment view:', error)
    return { success: false }
  }
}
