import Link from 'next/link'
import { Plus, Search, Heart, User, LayoutDashboard, FileText, Eye, MessageCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { createClient } from '@/lib/supabase/server'
import { AdsTable } from '@/components/dashboard/ads-table'
import { getSavedItems } from '@/lib/actions/saved-items'
import Image from 'next/image'

import { db } from '@/lib/db/drizzle'
import { products } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export default async function UserDashboard() {
  const supabase = await createClient()

  if (!supabase) return null

  // Fetch user session
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Should be handled by layout, but safe fallback
    return null
  }

  const userName = user.user_metadata?.full_name || 'User'

  // Fetch user's ads using Drizzle
  const ads = await db.query.products.findMany({
    where: eq(products.vendorId, user.id),
    orderBy: [desc(products.createdAt)],
  })

  // Fetch saved items
  const savedItems = await getSavedItems(user.id)

  // Calculate total views for "Activity"
  const totalViews = ads?.reduce((acc, ad) => acc + (ad.views || 0), 0) || 0
  const totalClicks = ads?.reduce((acc, ad) => acc + (ad.whatsappClicks || 0), 0) || 0

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1">
        <div className="mx-auto max-w-screen-2xl px-4 py-12">
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, {userName}!
              </h1>
              <p className="text-muted-foreground">
                Manage your ads and activity from here.
              </p>
            </div>
            <Button asChild size="lg" className="rounded-full">
              <Link href="/post-ad">
                <Plus className="mr-2 h-4 w-4" /> Post New Ad
              </Link>
            </Button>
          </div>

          {/* Quick Stats / Activity Overview */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <div className="rounded-lg border bg-card p-6 shadow-xs">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Ads</p>
                  <h3 className="text-2xl font-bold">{ads?.length || 0}</h3>
                </div>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-xs">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                  <h3 className="text-2xl font-bold">{totalViews}</h3>
                </div>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-xs">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <MessageCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">WhatsApp Clicks</p>
                  <h3 className="text-2xl font-bold">{totalClicks}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* My Ads Section */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" />
                My Ads
              </h2>
              <AdsTable ads={ads || []} />
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

        </div>
      </main>
      <Footer />
    </div>
  )
}
