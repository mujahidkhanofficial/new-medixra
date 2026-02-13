'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db/drizzle'
import { products, profiles } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { authenticatedAction, publicAction } from '@/lib/safe-action'
import { z } from 'zod'

export interface AnalyticsMetric {
  label: string
  value: number
  trend?: number
  change?: string
}

export interface ProductPerformance {
  name: string
  views: number
  inquiries: number
  conversion: number
  revenue?: number
}

export interface ViewsData {
  date: string
  views: number
  inquiries: number
}

// Track WhatsApp Click (Public Action as users might not be logged in)
export const trackWhatsAppClick = publicAction(
    z.object({ productId: z.string().uuid() }),
    async ({ productId }) => {
        await db.update(products)
            .set({ whatsappClicks: sql`${products.whatsappClicks} + 1` })
            .where(eq(products.id, productId))
            
        return { success: true }
    }
)

export async function getVendorAnalytics(vendorId: string) {
  try {
    // Verify caller is the vendor themselves or an admin
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        console.error('getVendorAnalytics: no authenticated user')
        return { metrics: [], productPerformance: [] }
    }
    // Only allow vendor to see their own analytics (or admin to see any)
    if (user.id !== vendorId) {
        const callerProfile = await db
            .select({ role: profiles.role })
            .from(profiles)
            .where(eq(profiles.id, user.id))
            .limit(1)
        if (!callerProfile[0] || callerProfile[0].role !== 'admin') {
            console.error('getVendorAnalytics: unauthorized access attempt')
            return { metrics: [], productPerformance: [] }
        }
    }

    // using Drizzle for analytics
    const vendorProducts = await db.query.products.findMany({
        where: eq(products.vendorId, vendorId),
        columns: {
            id: true,
            name: true,
            views: true,
            whatsappClicks: true,
            createdAt: true
        }
    })

    const totalProducts = vendorProducts.length
    const totalViews = vendorProducts.reduce((sum, p) => sum + (p.views || 0), 0)
    const totalInquiries = vendorProducts.reduce((sum, p) => sum + (p.whatsappClicks || 0), 0)
    const avgConversion = totalViews > 0 ? ((totalInquiries / totalViews) * 100).toFixed(1) : '0'

    const metrics: AnalyticsMetric[] = [
      {
        label: 'Products Listed',
        value: totalProducts,
        trend: 0, // Calculate trend if we have historical data
        change: 'Total Active',
      },
      {
        label: 'Total Views',
        value: totalViews,
        trend: 0,
        change: 'All time',
      },
      {
        label: 'Inquiries',
        value: totalInquiries,
        trend: 0,
        change: 'WhatsApp Clicks',
      },
      {
        label: 'Conversion Rate',
        value: parseFloat(avgConversion),
        trend: 0,
        change: 'Click Rate',
      },
    ]

    // Get product performance
    const productPerformance: ProductPerformance[] =
      vendorProducts.map((p) => {
        const views = p.views || 0
        const inquiries = p.whatsappClicks || 0
        return {
          name: p.name,
          views,
          inquiries,
          conversion: views > 0 ? Math.round((inquiries / views) * 100) : 0,
        }
      })

    return {
      metrics,
      productPerformance,
    }
  } catch (error) {
    console.error('Error fetching vendor analytics:', error)
    return { metrics: [], productPerformance: [] }
  }
}

export async function generateViewsChartData() {
  // Generate 30 days of views data
  const data: ViewsData[] = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: Math.floor(Math.random() * 150) + 20,
      inquiries: Math.floor(Math.random() * 20) + 2,
    })
  }
  return data
}
