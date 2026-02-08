'use client'

import { useState } from 'react'
import { Package, MessageSquare, Eye, TrendingUp, Plus, Edit2, Trash2, Star, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState('products')

  const vendorInfo = {
    name: 'MediTech Pakistan',
    rating: 4.8,
    reviews: 287,
    location: 'Lahore',
    joinDate: 'March 2023',
    products: 24,
    activeListings: 22,
    monthlyViews: 12450,
    monthlyMessages: 384,
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
    { label: 'New Messages', value: vendorInfo.monthlyMessages, change: '+8%', icon: MessageSquare },
    { label: 'Active Listings', value: vendorInfo.activeListings, change: '+2', icon: Package },
    { label: 'Avg Rating', value: `${vendorInfo.rating}★`, change: '+0.1', icon: Star },
  ]

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
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {analytics.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-start justify-between mb-3">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-xs font-semibold text-accent">{stat.change}</span>
                </div>
                <p className="text-muted-foreground text-sm mb-2">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            )
          })}
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-border">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('products')}
              className={`pb-4 font-semibold transition-colors ${
                activeTab === 'products'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Package className="h-4 w-4 inline mr-2" />
              My Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-4 font-semibold transition-colors ${
                activeTab === 'analytics'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`pb-4 font-semibold transition-colors ${
                activeTab === 'messages'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <MessageSquare className="h-4 w-4 inline mr-2" />
              Messages
            </button>
          </div>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
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
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {product.views} views
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {product.messages} messages
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 md:flex-col">
                      <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {product.status}
                      </span>
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Performance Overview</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Profile Views (This Month)</span>
                    <span className="text-sm font-bold text-primary">{vendorInfo.monthlyViews}</span>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '65%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Customer Inquiries (This Month)</span>
                    <span className="text-sm font-bold text-primary">{vendorInfo.monthlyMessages}</span>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '72%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-6">
                <h4 className="font-semibold text-foreground mb-4">Top Performing Products</h4>
                <div className="space-y-3">
                  {products.slice(0, 2).map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors">
                      <span className="text-sm text-foreground font-medium">{p.name}</span>
                      <span className="text-xs text-muted-foreground">{p.views} views</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h4 className="font-semibold text-foreground mb-4">Response Rate</h4>
                <div className="text-center py-8">
                  <p className="text-4xl font-bold text-primary mb-2">94%</p>
                  <p className="text-sm text-muted-foreground">Average response time: 2 hours</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No messages yet</h3>
            <p className="text-muted-foreground">When buyers message you about your equipment, they'll appear here</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
