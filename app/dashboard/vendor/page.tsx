'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, Eye, TrendingUp, Plus, Edit2, Trash2, Star, BarChart3, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ViewsChart, ProductPerformanceChart } from '@/components/dashboard/analytics-charts'
import { getVendorAnalytics, generateViewsChartData } from '@/lib/actions/analytics'
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
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [viewsData, setViewsData] = useState<any[]>([])
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('products')

  useEffect(() => {
    if (user?.id) {
      loadAnalytics()
    }
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

  const vendorInfo = {
    name: 'MediTech Pakistan',
    rating: 4.8,
    reviews: 287,
    location: 'Lahore',
    joinDate: 'March 2023',
    products: 24,
    activeListings: 22,
    monthlyViews: 12450,
    whatsappNumber: '+92-300-1234567',
    contactPhone: '+92-42-35234567',
  }

  const products = [
    {
      id: 1,
      name: 'Portable Ultrasound Machine',
      price: '₨ 450,000',
      status: 'Active',
      views: 1204,
      messages: 34,
      image: 'bg-gradient-to-br from-purple-100 to-purple-50',
    },
    {
      id: 2,
      name: 'Advanced ECG Monitor',
      price: '₨ 95,000',
      status: 'Active',
      views: 892,
      messages: 28,
      image: 'bg-gradient-to-br from-orange-100 to-orange-50',
    },
    {
      id: 3,
      name: 'X-Ray Protective Apron',
      price: '₨ 12,500',
      status: 'Active',
      views: 456,
      messages: 12,
      image: 'bg-gradient-to-br from-blue-100 to-blue-50',
    },
  ]

  const analytics = [
    { label: 'Total Views', value: vendorInfo.monthlyViews, change: '+12%', icon: Eye },
    { label: 'Active Listings', value: vendorInfo.activeListings, change: '+2', icon: Package },
    { label: 'Avg Rating', value: `${vendorInfo.rating}★`, change: '+0.1', icon: Star },
    { label: 'Products Listed', value: vendorInfo.products, change: '+3', icon: TrendingUp },
  ]

  if (analyticsLoading) {
    return <DashboardLoader />
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Profile Card */}
        <div className="mb-8 rounded-lg border border-border bg-card p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{vendorInfo.name}</h1>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < 4 ? 'fill-accent text-accent' : 'text-muted'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({vendorInfo.reviews} reviews)</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {vendorInfo.location} • Member since {vendorInfo.joinDate}
              </p>

              {/* Contact Information */}
              <div className="space-y-2 mb-4">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Contact Information</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <a href={`https://wa.me/${vendorInfo.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    {vendorInfo.whatsappNumber}
                  </a>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <WhatsAppContact
                phoneNumber={vendorInfo.whatsappNumber}
                name="Contact on WhatsApp"
                message="Hi, I'm interested in your products and services."
              />
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2" asChild>
                <Link href="/dashboard/settings">
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        {/* No analytics cards - keep only vendor info and product listing */}

        {/* Tabs */}
        {/* No tabs - just show product listing and add/edit/delete */}

        {/* Products Tab */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Active Listings</h2>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Plus className="h-4 w-4" />
              Add New Equipment
            </Button>
          </div>

          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="rounded-lg border border-border bg-card p-4 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex gap-4">
                    <div className={`${product.image} w-24 h-24 rounded-lg flex-shrink-0`} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
                      <p className="text-primary font-bold text-lg mb-2">{product.price}</p>
                      {/* WhatsApp Contact Button for each product */}
                      <WhatsAppContact
                        phoneNumber={vendorInfo.whatsappNumber}
                        name="Contact Vendor"
                        message={`Hi, I'm interested in ${product.name}. Please provide more details.`}
                        size="sm"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 md:flex-col">
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Edit2 className="h-4 w-4" />
                      Edit
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
                          <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Views Chart */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Views & Inquiries (Last 30 Days)</h3>
              {viewsData.length > 0 ? (
                <ViewsChart data={viewsData} />
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  Loading chart...
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
                  No products to display
                </div>
              )}
            </div>

            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-6">
                <h4 className="font-semibold text-foreground mb-4">Top Performing Products</h4>
                {analyticsData?.productPerformance && analyticsData.productPerformance.length > 0 ? (
                  <div className="space-y-3">
                    {analyticsData.productPerformance.slice(0, 3).map((p: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors">
                        <div>
                          <span className="text-sm text-foreground font-medium block">{p.name}</span>
                          <span className="text-xs text-muted-foreground">{p.views} views • {p.inquiries} inquiries</span>
                        </div>
                        <span className="text-xs font-bold text-primary">{p.conversion}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h4 className="font-semibold text-foreground mb-4">Quick Stats</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Views</span>
                    <span className="text-lg font-bold text-primary">
                      {analyticsData?.metrics?.[1]?.value?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg. Conversion</span>
                    <span className="text-lg font-bold text-primary">
                      {analyticsData?.metrics?.[3]?.value?.toFixed(1) || '0'}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-sm text-muted-foreground">Response Rate</span>
                    <span className="text-lg font-bold text-accent">94%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
