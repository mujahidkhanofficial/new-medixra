'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Trash2, Loader2, AlertCircle, ArrowLeft, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { getSavedItems, unsaveItem } from '@/lib/actions/saved-items'
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
} from '@/components/ui/alert-dialog'

export default function SavedItemsPage() {
  const { user, loading: authLoading } = useAuth()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      loadItems()
    }
  }, [user?.id])

  const loadItems = async () => {
    if (!user?.id) return
    setLoading(true)
    setError('')
    try {
      const data = await getSavedItems(user.id)
      setItems(data)
    } catch (err) {
      setError('Failed to load saved items')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    if (!user?.id) return
    setDeletingId(itemId)
    try {
      await unsaveItem(user.id, itemId)
      setItems(items.filter((item) => item.id !== itemId))
    } catch (err) {
      setError('Failed to remove item')
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  if (authLoading) {
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

          {/* Error State */}
          {error && (
            <div className="mb-6 rounded-lg bg-destructive/10 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Empty State */}
          {!loading && items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
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
          )}

          {/* Items Grid */}
          {!loading && items.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <div key={item.id} className="rounded-lg border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Image */}
                  {item.image ? (
                    <div className="relative w-full h-48">
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <Heart className="h-12 w-12 text-primary/30" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4">
                    <div className="mb-3">
                      {item.category && (
                        <p className="text-xs font-semibold text-primary uppercase mb-1">{item.category}</p>
                      )}
                      <h3 className="font-semibold text-foreground line-clamp-2 mb-1">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">{item.vendor}</p>
                      <p className="text-lg font-bold text-primary">{item.price}</p>
                    </div>

                    <p className="text-xs text-muted-foreground mb-4">
                      Saved {item.savedAt}
                    </p>

                    <div className="flex gap-2">
                      <Button asChild variant="default" className="flex-1 gap-2">
                        <Link href={`/product/${item.productId}`}>
                          View Details
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            disabled={deletingId === item.id}
                          >
                            {deletingId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Saved Item?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove <span className="font-semibold text-foreground">"{item.productName}"</span> from your saved items?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="flex gap-3 justify-end">
                            <AlertDialogCancel>Keep It</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              Remove
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
