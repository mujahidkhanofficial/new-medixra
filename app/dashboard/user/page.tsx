'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, Heart, Clock, Package, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { useAuth } from '@/components/providers/auth-provider'
import { DashboardSkeleton } from '@/components/skeletons'

export default function UserDashboard() {
  const { user, loading } = useAuth()
  const [userName, setUserName] = useState('')

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setUserName(user.user_metadata.full_name)
    }
  }, [user])

  const quickActions = [
    { label: 'Post an Ad', href: '/post-ad', icon: Package },
    { label: 'Browse Equipment', href: '/products', icon: Search },
    { label: 'Saved Items', href: '/dashboard/saved-items', icon: Heart },
    { label: 'Profile Settings', href: '/dashboard/settings', icon: User },
  ]

  const recentActivity: any[] = []

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-12">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back{userName ? `, ${userName}` : ''}!
            </h1>
            <p className="text-muted-foreground">
              Browse medical equipment from trusted vendors across Pakistan.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {quickActions.map((action: any) => {
              const Icon = action.icon
              const isDisabled = action.disabled || false
              return (
                <Link
                  key={action.label}
                  href={isDisabled ? '#' : action.href}
                  onClick={(e) => isDisabled && e.preventDefault()}
                  className={`group rounded-lg border border-border bg-card p-6 transition-colors ${isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:border-primary'
                    }`}
                >
                  <Icon className="h-8 w-8 text-primary mb-3" />
                  <p className={`font-semibold transition-colors ${isDisabled
                    ? 'text-muted-foreground'
                    : 'text-foreground group-hover:text-primary'
                    }`}>
                    {action.label}
                  </p>
                  {isDisabled && (
                    <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Two Column Layout */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Activity */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Activity
              </h2>
              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Clock className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">No activity yet</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Start by browsing equipment or finding technicians
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/products">Browse Equipment</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div>
                        <p className="text-sm text-foreground">{activity.text}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Become a Vendor CTA */}
            <div className="rounded-lg border border-border bg-linear-to-br from-primary/10 to-primary/5 p-6">
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Have equipment to sell?
              </h2>
              <p className="text-muted-foreground mb-4">
                Join as a vendor and reach thousands of medical professionals looking for equipment.
              </p>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/signup?role=vendor">Become a Vendor</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
