'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Eye, Clock, CheckCircle, AlertCircle, Plus, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'

export default function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState('wishlist')

  const wishlistItems = [
    {
      id: 1,
      name: 'Portable Ultrasound Machine',
      vendor: 'MediTech Pakistan',
      price: '₨ 450,000',
      savedDate: '5 days ago',
      image: 'bg-gradient-to-br from-purple-100 to-purple-50',
    },
    {
      id: 2,
      name: 'ECG Monitor',
      vendor: 'HeartCare Devices',
      price: '₨ 85,000',
      savedDate: '2 weeks ago',
      image: 'bg-gradient-to-br from-orange-100 to-orange-50',
    },
  ]

  const savedSearches = [
    { id: 1, query: 'Ultrasound Equipment', results: 34, lastSearch: '3 days ago' },
    { id: 2, query: 'Diagnostic Devices under ₨ 50,000', results: 127, lastSearch: '1 week ago' },
    { id: 3, query: 'Sterilization Equipment', results: 45, lastSearch: '2 weeks ago' },
  ]

  const conversations = [
    {
      id: 1,
      vendor: 'MediTech Pakistan',
      lastMessage: 'We can deliver within 3 days...',
      unread: 2,
      timestamp: '2 hours ago',
      product: 'Ultrasound Machine',
    },
    {
      id: 2,
      vendor: 'SafeHealth Solutions',
      lastMessage: 'Thank you for your interest',
      unread: 0,
      timestamp: '1 day ago',
      product: 'Digital Thermometer',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Buyer Dashboard</h1>
          <p className="text-muted-foreground">Manage your saved equipment, messages, and searches</p>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-border">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`pb-4 font-semibold transition-colors ${
                activeTab === 'wishlist'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Heart className="h-4 w-4 inline mr-2" />
              Wishlist ({wishlistItems.length})
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`pb-4 font-semibold transition-colors ${
                activeTab === 'messages'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <MessageCircle className="h-4 w-4 inline mr-2" />
              Messages ({conversations.length})
            </button>
            <button
              onClick={() => setActiveTab('searches')}
              className={`pb-4 font-semibold transition-colors ${
                activeTab === 'searches'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye className="h-4 w-4 inline mr-2" />
              Saved Searches
            </button>
          </div>
        </div>

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistItems.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="overflow-hidden rounded-lg border border-border bg-card hover:shadow-lg transition-all">
                    <div className={`${item.image} aspect-square`} />
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-1">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{item.vendor}</p>
                      <p className="text-lg font-bold text-primary mb-3">{item.price}</p>
                      <p className="text-xs text-muted-foreground mb-4">Saved {item.savedDate}</p>
                      <div className="flex gap-2">
                        <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                          <MessageCircle className="h-4 w-4" />
                          Message Vendor
                        </Button>
                        <Button variant="outline" size="icon">
                          <Heart className="h-4 w-4 fill-primary text-primary" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No saved items yet</h3>
                <p className="text-muted-foreground mb-6">Start saving equipment to your wishlist</p>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Browse Equipment
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="rounded-lg border border-border bg-card p-4 hover:border-primary transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{conv.vendor}</h3>
                    <p className="text-sm text-primary mb-2">{conv.product}</p>
                    <p className="text-sm text-muted-foreground">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="ml-4 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold w-6 h-6">
                      {conv.unread}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{conv.timestamp}</span>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <MessageCircle className="h-4 w-4" />
                    Open Chat
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Searches Tab */}
        {activeTab === 'searches' && (
          <div className="space-y-4">
            {savedSearches.map((search) => (
              <div
                key={search.id}
                className="rounded-lg border border-border bg-card p-4 hover:border-primary transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{search.query}</h3>
                  <span className="text-sm font-bold text-primary">{search.results} Results</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Last searched {search.lastSearch}</p>
                <Button variant="outline" className="w-full gap-2 bg-transparent">
                  <Eye className="h-4 w-4" />
                  View Results
                </Button>
              </div>
            ))}
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Plus className="h-4 w-4" />
              Create New Search
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
