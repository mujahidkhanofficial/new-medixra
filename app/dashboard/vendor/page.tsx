'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Package, Eye, TrendingUp, Plus, Edit2, Trash2, Star, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ViewsChart, ProductPerformanceChart } from '@/components/dashboard/analytics-charts'
import { getVendorAnalytics, generateViewsChartData } from '@/lib/actions/analytics'
import { getVendorProfile } from '@/lib/actions/vendor'
import { getVendorProducts, deleteProduct } from '@/lib/actions/products'
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return
      setLoading(true)
      try {
        const [profile, prods] = await Promise.all([
          getVendorProfile(user.id),
          getVendorProducts(user.id)
        ])
        setVendorProfile(profile)
        setProducts(prods || [])

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

  const analytics = [
    { label: 'Total Views', value: analyticsData?.metrics?.[1]?.value || 0, change: analyticsData?.metrics?.[1]?.change || '', icon: Eye },
    { label: 'Active Listings', value: analyticsData?.metrics?.[0]?.value || 0, change: analyticsData?.metrics?.[0]?.change || '', icon: Package },
    { label: 'Avg Rating', value: '4.8★', change: '+0.0', icon: Star }, // Placeholder rating
    { label: 'Products Listed', value: products.length, change: '', icon: TrendingUp },
  ]

  if (loading) {
    return <DashboardLoader />
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="mx-auto max-w-screen-2xl px-4 py-12">
        {/* Profile Card */}
        <div className="mb-8 rounded-lg border border-border bg-card p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{info.name}</h1>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < 4 ? 'fill-accent text-accent' : 'text-muted'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({0} reviews)</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {info.location} • Member since {info.joinDate}
              </p>

              {/* Contact Information */}
              <div className="space-y-2 mb-4">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Contact Information</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <a href={`https://wa.me/${info.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    {info.whatsapp}
                  </a>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
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
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {analytics.map((item, idx) => (
            <div key={idx} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-foreground">{item.value}</span>
                {item.change && (
                  <span className="text-xs text-primary font-medium">{item.change}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Products Tab */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Active Listings</h2>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2" asChild>
              <Link href="/post-ad">
                <Plus className="h-4 w-4" />
                Add New Equipment
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {products.length > 0 ? (products.map((product) => (
              <div key={product.id} className="rounded-lg border border-border bg-card p-4 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex gap-4">
                    <div className={`w-24 h-24 rounded-lg shrink-0 bg-muted overflow-hidden relative`}>
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Package className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
                      <p className="text-primary font-bold text-lg mb-2">₨ {product.price?.toLocaleString()}</p>
                      {/* WhatsApp Contact Button for each product */}
                      <WhatsAppContact
                        phoneNumber={info.whatsapp}
                        name="Contact Vendor"
                        message={`Hi, I'm interested in ${product.name}. Please provide more details.`}
                        size="sm"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 md:flex-col">
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent" asChild>
                      <Link href={`/product/${product.id}/edit`}>
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 bg-transparent text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-foreground">"{product.name}"</span>? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex gap-3 justify-end">
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))) : (
              <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed border-border">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-foreground">No equipment listed yet</h3>
                <p className="text-muted-foreground mb-4">Start selling by adding your first product.</p>
                <Button asChild>
                  <Link href="/post-ad">Post Ad</Link>
                </Button>
              </div>
            )}
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
