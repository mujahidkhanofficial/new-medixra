'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Package, Eye, TrendingUp, Plus, Edit2, Trash2, Star, MessageSquare, LayoutDashboard, Heart, ArrowRight, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/dashboard/stat-card'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { ViewsChart, ProductPerformanceChart } from '@/components/dashboard/analytics-charts'
import { getVendorAnalytics, generateViewsChartData } from '@/lib/actions/analytics'
import { getVendorProfile } from '@/lib/actions/vendor'
import { getVendorProducts, deleteProduct } from '@/lib/actions/products'
import { getSavedItems } from '@/lib/actions/saved-items'
import { AdsTable } from '@/components/dashboard/ads-table'
import { useAuth } from '@/components/providers/auth-provider'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import WhatsAppContact from '@/components/whatsapp-contact'
import { DashboardLoader } from '@/components/ui/dashboard-loader'

export default function VendorDashboard() {
  const { user } = useAuth()
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [viewsData, setViewsData] = useState<any[]>([])
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  const [vendorProfile, setVendorProfile] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [savedItems, setSavedItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return
      setLoading(true)
      try {
        const [profile, prods, saved] = await Promise.all([
          getVendorProfile(user.id),
          getVendorProducts(user.id),
          getSavedItems(user.id)
        ])
        setVendorProfile(profile)
        setProducts(prods || [])
        setSavedItems(saved || [])

        // Allow analytics to load independently
        loadAnalytics()
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user?.id])

  const loadAnalytics = async () => {
    if (!user?.id) return
    setAnalyticsLoading(true)
    try {
      const data = await getVendorAnalytics(user.id)
      setAnalyticsData(data)
      const chartData = await generateViewsChartData()
      setViewsData(chartData)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      const res = await deleteProduct({ productId })
      if (res.success) {
        setProducts(products.filter(p => p.id !== productId))
      }
    } catch (error) {
      console.error("Failed to delete product", error)
    }
  }

  // Helper to safely get display values
  const getDisplayInfo = () => {
    if (!vendorProfile) return {
      name: user?.user_metadata?.full_name || 'Vendor',
      location: 'Pakistan',
      joinDate: new Date().toLocaleDateString(),
      whatsapp: '',
      phone: ''
    }

    return {
      name: vendorProfile.business_name || vendorProfile.full_name || 'Vendor',
      location: vendorProfile.city || 'Pakistan',
      joinDate: new Date(vendorProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      whatsapp: vendorProfile.whatsapp_number || vendorProfile.phone || '',
      phone: vendorProfile.contact_phone || vendorProfile.phone || ''
    }
  }

  const info = getDisplayInfo()

  const totalViews = products.reduce((acc, p) => acc + (p.views || 0), 0)
  const totalClicks = products.reduce((acc, p) => acc + (p.whatsapp_clicks || 0), 0)

  const analytics = [
    { label: 'Total Ads', value: products.length, icon: FileText, change: '' },
    { label: 'Total Views', value: totalViews, icon: Eye, change: '', iconColorClass: "text-blue-600 dark:text-blue-400", iconBgClass: "bg-blue-100 dark:bg-blue-900/20" },
    { label: 'WhatsApp Clicks', value: totalClicks, icon: MessageSquare, change: '', iconColorClass: "text-green-600 dark:text-green-400", iconBgClass: "bg-green-100 dark:bg-green-900/20" },
  ]

  if (loading) {
    return <DashboardLoader />
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="mx-auto max-w-screen-2xl px-4 py-12">
        {/* Profile Header */}
        <DashboardHeader
          title={info.name}
          subtitle={vendorProfile?.business_type || 'Retailer'}
          location={`Experience: ${vendorProfile?.years_in_business || 'New'} Years • ${info.location}`}
          joinDate={info.joinDate}
          contactChildren={
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <a href={`https://wa.me/${info.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                {info.whatsapp}
              </a>
            </div>
          }
          actions={
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <Button variant="outline" className="hidden sm:flex bg-background hover:bg-muted" asChild>
                <Link href={`/shop/${user?.id || ''}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Webstore
                </Link>
              </Button>
              <WhatsAppContact
                phoneNumber={info.whatsapp}
                name="Contact on WhatsApp"
                message="Hi, I'm interested in your products and services."
              />
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2" asChild>
                <Link href="/dashboard/vendor/edit">
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
            </div>
          }
        />

        {/* Analytics Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {analytics.map((item, idx) => (
            <StatCard
              key={idx}
              label={item.label}
              value={item.value}
              icon={item.icon}
              iconBgClass={item.iconBgClass}
              iconColorClass={item.iconColorClass}
            />
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Products Tab */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" />
                Active Listings
              </h2>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-9 px-4" asChild>
                <Link href="/post-ad">
                  <Plus className="h-4 w-4" />
                  Post New Ad
                </Link>
              </Button>
            </div>

            <AdsTable
              ads={products.map((p) => ({
                id: p.id,
                name: p.name,
                price: p.price,
                currency: 'PKR',
                views: p.views || 0,
                whatsappClicks: p.whatsapp_clicks || 0,
                status: p.status,
                createdAt: p.created_at,
                imageUrl: p.image_url,
              }))}
            />
          </div>

          {/* Saved Ads Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Saved Ads
              </h2>
              <Link href="/dashboard/saved-items" className="text-sm text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-4">
              {savedItems && savedItems.length > 0 ? (
                savedItems.slice(0, 3).map((item) => (
                  <Link key={item.id} href={`/product/${item.productId}`} className="group block">
                    <div className="flex gap-3 p-3 rounded-lg border bg-card hover:border-primary/50 transition-colors">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.productName}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-secondary">
                            <Heart className="h-6 w-6 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                          {item.productName}
                        </h4>
                        <p className="text-sm font-bold text-primary mt-1">
                          {item.price}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {item.vendor}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <Heart className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground font-medium">No saved ads yet</p>
                  <Button variant="link" size="sm" asChild className="mt-1">
                    <Link href="/products">Browse Equipment</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mt-12 space-y-6">
          <h2 className="text-xl font-bold text-foreground">Performance Analytics</h2>
          {/* Views Chart */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Views & Inquiries (Last 30 Days)</h3>
            {viewsData.length > 0 ? (
              <ViewsChart data={viewsData} />
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                {analyticsLoading ? 'Loading chart...' : 'No data available'}
              </div>
            )}
          </div>

          {/* Product Performance Chart */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Product Performance</h3>
            {analyticsData?.productPerformance && analyticsData.productPerformance.length > 0 ? (
              <ProductPerformanceChart data={analyticsData.productPerformance} />
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                {analyticsLoading ? 'Loading chart...' : 'No products to display'}
              </div>
            )}
          </div>
        </div>

      </div>

      <Footer />
    </div>
  )
}
