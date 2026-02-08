'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, Heart, MessageSquare, Clock, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/auth-provider'

export default function BuyerDashboard() {
  const { user, loading } = useAuth()
  const [userName, setUserName] = useState('')

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setUserName(user.user_metadata.full_name)
    }
  }, [user])

  const quickActions = [
    { label: 'Browse Equipment', href: '/product', icon: Package },
    { label: 'Find Technicians', href: '/technicians', icon: Search },
    { label: 'Saved Items', href: '#', icon: Heart },
    { label: 'My Messages', href: '#', icon: MessageSquare },
  ]

  const recentActivity = [
    { type: 'view', text: 'Viewed Portable Ultrasound Machine', time: '2 hours ago' },
    { type: 'inquiry', text: 'Sent inquiry to MediTech Pakistan', time: '1 day ago' },
    { type: 'save', text: 'Saved Advanced ECG Monitor', time: '2 days ago' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group rounded-lg border border-border bg-card p-6 hover:border-primary transition-colors"
                >
                  <Icon className="h-8 w-8 text-primary mb-3" />
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {action.label}
                  </p>
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
            </div>

            {/* Become a Vendor CTA */}
            <div className="rounded-lg border border-border bg-gradient-to-br from-primary/10 to-primary/5 p-6">
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Have equipment to sell?
              </h2>
              <p className="text-muted-foreground mb-4">
                Join as a vendor and reach thousands of medical professionals looking for equipment.
              </p>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/become-vendor">Become a Vendor</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
