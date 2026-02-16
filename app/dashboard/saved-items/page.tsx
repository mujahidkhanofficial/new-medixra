import Link from 'next/link'
import { Heart, ArrowLeft, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { getSavedItems } from '@/lib/actions/saved-items'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProductCard } from '@/components/product/product-card'

export const dynamic = 'force-dynamic'

export default async function SavedItemsPage() {
  const supabase = await createClient()

  if (!supabase) {
    redirect('/auth')
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const items = await getSavedItems(user.id)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1">
        <div className="mx-auto max-w-screen-2xl px-4 py-12">
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard/user" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-foreground mb-2">Saved Items</h1>
            <p className="text-muted-foreground">
              {items.length} item{items.length !== 1 ? 's' : ''} saved
            </p>
          </div>

          {/* Empty State */}
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed rounded-xl bg-muted/20">
              <Heart className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No Saved Items</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Start saving your favorite medical equipment to keep track of products you're interested in.
              </p>
              <Button asChild className="gap-2">
                <Link href="/products">
                  Browse Products
                </Link>
              </Button>
            </div>
          ) : (
            /* Items Grid */
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <ProductCard
                  key={item.id}
                  product={{
                    id: item.productId,
                    name: item.productName,
                    price: item.price,
                    currency: null, // Price string includes currency usually
                    image_url: item.image,
                    location: item.location,
                    created_at: item.productCreatedAt,
                    condition: item.condition,
                    category: item.category,
                    vendor_name: item.vendor
                  }}
                  isSaved={true}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
