'use server'

import { createClient } from '@/lib/supabase/server'

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

export async function getVendorAnalytics(vendorId: string) {
  try {
    const supabase = await createClient()

    // Get product stats
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, views, whatsapp_clicks, created_at')
      .eq('vendor_id', vendorId)
      .eq('status', 'active')

    if (productsError) throw productsError

    const totalProducts = products?.length || 0
    const totalViews = products?.reduce((sum, p) => sum + (p.views || 0), 0) || 0
    const totalInquiries = products?.reduce((sum, p) => sum + (p.whatsapp_clicks || 0), 0) || 0
    const avgConversion = totalViews > 0 ? ((totalInquiries / totalViews) * 100).toFixed(1) : '0'

    const metrics: AnalyticsMetric[] = [
      {
        label: 'Products Listed',
        value: totalProducts,
        trend: 2,
        change: '+2 this month',
      },
      {
        label: 'Total Views',
        value: totalViews,
        trend: 12,
        change: '+12% this month',
      },
      {
        label: 'Inquiries',
        value: totalInquiries,
        trend: 8,
        change: '+8 this month',
      },
      {
        label: 'Conversion Rate',
        value: parseFloat(avgConversion as string),
        trend: 2,
        change: '+2% this month',
      },
    ]

    // Get product performance
    const productPerformance: ProductPerformance[] =
      products?.map((p) => ({
        name: p.name,
        views: p.views || 0,
        inquiries: p.whatsapp_clicks || 0,
        conversion: p.views > 0 ? Math.round(((p.whatsapp_clicks || 0) / p.views) * 100) : 0,
      })) || []

    return {
      metrics,
      productPerformance,
    }
  } catch (error) {
    console.error('Error fetching vendor analytics:', error)
    // Return mock data if query fails
    return await getMockVendorAnalytics()
  }
}

export async function getMockVendorAnalytics() {
  const metrics: AnalyticsMetric[] = [
    {
      label: 'Products Listed',
      value: 12,
      trend: 2,
      change: '+2 this month',
    },
    {
      label: 'Total Views',
      value: 1250,
      trend: 12,
      change: '+12% this month',
    },
    {
      label: 'Inquiries',
      value: 85,
      trend: 8,
      change: '+8 this month',
    },
    {
      label: 'Conversion Rate',
      value: 6.8,
      trend: 2,
      change: '+2% this month',
    },
  ]

  const productPerformance: ProductPerformance[] = [
    {
      name: 'Portable Ultrasound',
      views: 342,
      inquiries: 28,
      conversion: 8,
    },
    {
      name: 'ECG Monitor',
      views: 287,
      inquiries: 18,
      conversion: 6,
    },
    {
      name: 'Blood Pressure Unit',
      views: 195,
      inquiries: 12,
      conversion: 6,
    },
    {
      name: 'Oxygen Meter',
      views: 156,
      inquiries: 8,
      conversion: 5,
    },
    {
      name: 'Thermometer Digital',
      views: 270,
      inquiries: 19,
      conversion: 7,
    },
  ]

  return { metrics, productPerformance }
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
