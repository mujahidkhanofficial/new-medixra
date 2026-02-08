'use client'

import { useState } from 'react'
import { BarChart3, Users, Package, AlertCircle, Eye, MessageSquare, TrendingUp, Settings, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  const stats = [
    { label: 'Total Users', value: 2847, change: '+12%', icon: Users },
    { label: 'Active Vendors', value: 156, change: '+3', icon: Package },
    { label: 'Listed Equipment', value: 4521, change: '+124', icon: Eye },
    { label: 'Monthly Messages', value: 18945, change: '+34%', icon: MessageSquare },
  ]

  const pendingVendors = [
    {
      id: 1,
      name: 'AdvancedMedi Solutions',
      location: 'Karachi',
      appliedDate: '2 days ago',
      equipment: 'Diagnostic Equipment',
      status: 'pending',
    },
    {
      id: 2,
      name: 'HealthTech Innovations',
      location: 'Lahore',
      appliedDate: '1 week ago',
      equipment: 'Surgical Equipment',
      status: 'pending',
    },
    {
      id: 3,
      name: 'CareNet Systems',
      location: 'Islamabad',
      appliedDate: '3 days ago',
      equipment: 'Monitoring Equipment',
      status: 'pending',
    },
  ]

  const reportedListings = [
    {
      id: 1,
      product: 'Portable X-Ray Machine',
      vendor: 'Unknown Vendor',
      reason: 'Suspicious pricing',
      reportedDate: '1 day ago',
      reports: 3,
    },
    {
      id: 2,
      product: 'Medical Equipment Bundle',
      vendor: 'Quick Sales',
      reason: 'Incomplete information',
      reportedDate: '5 days ago',
      reports: 2,
    },
  ]

  const systemStats = [
    { label: 'Platform Uptime', value: '99.9%', status: 'good' },
    { label: 'Avg Response Time', value: '245ms', status: 'good' },
    { label: 'Active API Calls', value: '1,204/min', status: 'good' },
    { label: 'Database Health', value: 'Optimal', status: 'good' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage platform content, vendors, and monitor activity</p>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-border">
          <div className="flex gap-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('vendors')}
              className={`pb-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'vendors'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Pending Vendors ({pendingVendors.length})
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`pb-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'reports'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <AlertCircle className="h-4 w-4 inline mr-2" />
              Reported Listings ({reportedListings.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Settings className="h-4 w-4 inline mr-2" />
              Settings
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => {
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

            {/* System Status */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">System Status</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {systemStats.map((sys) => (
                  <div key={sys.label} className="p-4 rounded-lg bg-background border border-border">
                    <p className="text-xs text-muted-foreground mb-2">{sys.label}</p>
                    <p className="text-lg font-bold text-foreground mb-2">{sys.value}</p>
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Operational
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Platform Activity</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-3 rounded hover:bg-muted transition-colors">
                  <span className="text-foreground">5 new vendor applications submitted</span>
                  <span className="text-muted-foreground">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded hover:bg-muted transition-colors">
                  <span className="text-foreground">23 new equipment listings added</span>
                  <span className="text-muted-foreground">4 hours ago</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded hover:bg-muted transition-colors">
                  <span className="text-foreground">1 compliance report submitted</span>
                  <span className="text-muted-foreground">6 hours ago</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded hover:bg-muted transition-colors">
                  <span className="text-foreground">312 user registrations completed</span>
                  <span className="text-muted-foreground">1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vendors Tab */}
        {activeTab === 'vendors' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Review and approve pending vendor applications</p>
            {pendingVendors.map((vendor) => (
              <div
                key={vendor.id}
                className="rounded-lg border border-border bg-card p-6 hover:border-primary transition-colors"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-lg mb-1">{vendor.name}</h3>
                    <p className="text-sm text-primary mb-2">{vendor.equipment}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{vendor.location}</span>
                      <span>Applied {vendor.appliedDate}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Review and take action on reported listings</p>
            {reportedListings.map((report) => (
              <div
                key={report.id}
                className="rounded-lg border border-border bg-card p-6 hover:border-primary transition-colors"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-lg mb-1">{report.product}</h3>
                    <p className="text-sm text-muted-foreground mb-2">Vendor: {report.vendor}</p>
                    <div className="inline-block bg-accent/10 text-accent px-2 py-1 rounded text-xs font-medium mb-3">
                      {report.reason}
                    </div>
                    <p className="text-xs text-muted-foreground">{report.reports} reports • {report.reportedDate}</p>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="gap-2 bg-transparent">
                      Review Details
                    </Button>
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Platform Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    defaultValue="0"
                    className="w-full rounded border border-border bg-background px-3 py-2 text-foreground"
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Medixra is 100% free - no commission applied</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Platform Status
                  </label>
                  <select className="w-full rounded border border-border bg-background px-3 py-2 text-foreground">
                    <option>Active</option>
                    <option>Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-border"
                    />
                    <span className="text-sm font-medium text-foreground">
                      Enable new vendor registrations
                    </span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-border"
                    />
                    <span className="text-sm font-medium text-foreground">
                      Display compliance banner
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Content Management</h3>
              
              <div className="space-y-4">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground justify-start">
                  Manage Safety & Compliance Guidelines
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  Edit Platform FAQ
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  Update Terms of Service
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  Manage Categories
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Save Changes
              </Button>
              <Button variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
