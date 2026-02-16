'use server'

import { db } from '@/lib/db/drizzle'
import { profiles, products } from '@/lib/db/schema'
import { sql, gt, desc } from 'drizzle-orm'
import { authenticatedAction } from '@/lib/safe-action'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

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
        inquiries: 0 // Placeholder
      })).slice(0, 5)
    }
  } catch (error) {
    console.error('Error fetching vendor analytics:', error)
    return { metrics: [], productPerformance: [] }
  }
}

export const generateViewsChartData = async () => {
  // Generate dummy data for the chart as we don't have historical view tracking yet
  const data = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: Math.floor(Math.random() * 50) + 10,
      inquiries: Math.floor(Math.random() * 10)
    })
  }
  return data
}

export const trackWhatsAppClick = async ({ productId }: { productId?: string }) => {
  // This would ideally log to an events table
  if (productId) {
    await db.update(products)
      .set({ whatsappClicks: sql`${products.whatsappClicks} + 1` })
      .where(sql`${products.id} = ${productId}`)
  }
  return { success: true }
}
