import Link from 'next/link'
import {
  MessageCircle, Wrench, Building2, Star, MapPin, Filter, Package,
  Activity, Scissors, FlaskConical, Stethoscope, HeartPulse,
  Ear, Brain, Bone, Accessibility, Baby, ScanEye, Sparkles, Armchair, Smile, Cat, CheckCircle, ArrowRight, ShieldCheck, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { ProductCard } from '@/components/product/product-card'
import { getProducts } from '@/lib/actions/products'
import { createClient } from '@/lib/supabase/server'
import { getSavedProductIds } from '@/lib/actions/saved-items'
import { HomeSearchBar } from '@/components/home/search-bar'
import { EQUIPMENT_HIERARCHY } from '@/lib/constants'
import { VendorsMarquee } from '@/components/home/vendors-marquee'
import { getApprovedTechnicians } from '@/lib/actions/technician'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Metadata } from 'next'

const iconMap = {
  'Activity': Activity,
  'HeartPulse': HeartPulse,
  'Ear': Ear,
  'Brain': Brain,
  'Bone': Bone,
  'Accessibility': Accessibility,
  'Baby': Baby,
  'Scalpel': Scissors,
  'ScanEye': ScanEye,
  'FlaskConical': FlaskConical,
  'Stethoscope': Stethoscope,
  'Sparkles': Sparkles,
  'Armchair': Armchair,
  'Building2': Building2,
  'Smile': Smile,
  'Cat': Cat
}

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Home',
}

export default async function Home() {
  const products = await getProducts({ limit: 6 })
  const supabase = await createClient()

  let user = null
  if (supabase) {
    const { data } = await supabase.auth.getUser()
    user = data.user
  }

  const savedIds = user ? await getSavedProductIds(user.id) : []

  // Dynamically fetch actual approved technicians instead of using mock data
  const allTechnicians = await getApprovedTechnicians()
  const topTechnicians = allTechnicians.slice(0, 4)

  return (
    <main className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Navigation />

      {/* High-Impact Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32 md:pt-32 md:pb-40 tracking-tight">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 text-center">

          <h1 className="mb-6 mx-auto max-w-4xl text-5xl font-black tracking-tighter sm:text-6xl md:text-7xl">
            The Direct Network for
            <span className="block text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/60 mt-1">
              Medical Equipment
            </span>
          </h1>

          <p className="mx-auto mb-12 max-w-2xl text-lg md:text-xl text-muted-foreground font-medium leading-relaxed">
            Connect directly with verified vendors, buyers, and certified technicians across Pakistan. <strong className="text-foreground">Zero commissions. Complete transparency.</strong>
          </p>

          {/* Minimalist Search Bar */}
          <div className="mx-auto max-w-2xl mb-14 relative z-10">
            <HomeSearchBar />
          </div>

          {/* Inline Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-semibold text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Verified Vendors
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-blue-500" />
              Direct WhatsApp Chat
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Secure Ecosystem
            </div>
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-amber-500" />
              Certified Technicians
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <VendorsMarquee />

      {/* Sleek Bento-Box Categories */}
      <section className="py-24 bg-muted/20 border-y border-border/50">
        <div className="mx-auto max-w-screen-2xl px-4">
          <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Explore Categories</h2>
              <p className="text-muted-foreground mt-2 text-lg">Comprehensive taxonomy of professional medical grade assets.</p>
            </div>
            <Button variant="outline" size="lg" className="rounded-full shadow-sm" asChild>
              <Link href="/products">Browse Directory <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative">
            {EQUIPMENT_HIERARCHY.map((category) => {
              const Icon = iconMap[category.icon as keyof typeof iconMap] || Package
              return (
                <Link
                  href={`/products?category=${encodeURIComponent(category.name)}`}
                  key={category.name}
                  className="group flex flex-col bg-card/50 backdrop-blur-sm border border-border/60 hover:border-primary/40 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-inner">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-lg text-foreground tracking-tight line-clamp-2">{category.name}</h3>
                  </div>

                  <ul className="space-y-3 mb-6 grow">
                    {category.subcategories.slice(0, 4).map((sub) => (
                      <li key={sub}>
                        <div className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors flex items-center gap-2.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-border group-hover:bg-primary/50 transition-colors shrink-0" />
                          <span className="line-clamp-1 group-hover:translate-x-1 transition-transform duration-300">{sub}</span>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between text-sm font-semibold text-primary/80 group-hover:text-primary transition-colors">
                    <span>View Collection</span>
                    <ArrowRight className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Equipment Grid */}
      <section className="py-24">
        <div className="mx-auto max-w-screen-2xl px-4">
          <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Featured Listings</h2>
              <p className="text-muted-foreground mt-2 text-lg">Recently posted premium equipment from verified sellers.</p>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/80 bg-card hover:bg-muted text-foreground transition-colors font-medium text-sm shadow-sm">
              <Filter className="h-4 w-4" />
              Filter & Sort All
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isSaved={savedIds.includes(product.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-3xl border border-dashed border-border/60">
              <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                <Package className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Marketplace is pristine</h3>
              <p className="text-muted-foreground mb-6 max-w-md text-center">Be the very first vendor to list an asset on the network and capture the entire initial audience.</p>
              <Button asChild className="rounded-full px-8 shadow-lg">
                <Link href="/post-ad">Post the First Ad</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Premium Technicians Network */}
      <section className="py-24 bg-card border-y border-border/40 relative overflow-hidden">
        {/* Decorative Background Element */}
        <div className="absolute right-0 bottom-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] -z-10 translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="mx-auto max-w-screen-2xl px-4 relative">
          <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs tracking-wider uppercase mb-4">
                <Zap className="h-3.5 w-3.5" /> Service Network
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Certified Technical Support</h2>
              <p className="text-muted-foreground mt-3 text-lg leading-relaxed">
                Connect instantly with top-rated medical technicians for emergency repairs, preventative maintenance, and calibration.
              </p>
            </div>
            <Button variant="outline" className="rounded-full shadow-sm shrink-0" asChild>
              <Link href="/technicians">View All Technicians <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {topTechnicians.length > 0 ? topTechnicians.map((tech) => (
              <div key={tech.id} className="group flex flex-col rounded-2xl border border-border/50 bg-background/60 backdrop-blur-md p-6 hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5">
                <div className="flex items-start gap-4 mb-5">
                  <Avatar className="h-14 w-14 border border-border bg-card shadow-sm group-hover:border-primary/20 transition-colors">
                    <AvatarImage src={tech.image} alt={tech.name} />
                    <AvatarFallback className="bg-primary/5 text-primary font-bold">
                      {tech.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors">{tech.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 font-medium">
                      <MapPin className="h-3 w-3" />
                      {tech.city || 'Pakistan'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-6 grow">
                  {tech.specialitiesList?.slice(0, 3).map((s: string, i: number) => (
                    <Badge key={i} variant="secondary" className="font-medium bg-muted text-muted-foreground hover:bg-muted/80 text-[10px] px-2 py-0.5 rounded-md">
                      {s}
                    </Badge>
                  ))}
                  {tech.specialitiesList?.length > 3 && (
                    <span className="text-[10px] font-medium text-muted-foreground self-center ml-1">
                      +{tech.specialitiesList.length - 3} more
                    </span>
                  )}
                  {(!tech.specialitiesList || tech.specialitiesList.length === 0) && (
                    <span className="text-xs text-muted-foreground italic">No specialties listed</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-6 p-3 rounded-xl bg-muted/30 border border-border/40">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Experience</p>
                    <p className="text-xs text-foreground font-bold">{tech.experience}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Availability</p>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                      Available Now
                    </span>
                  </div>
                </div>

                <Link href={`/technicians`} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-colors font-bold text-sm">
                  View Profile
                </Link>
              </div>
            )) : (
              <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border rounded-2xl bg-muted/10">
                No technicians have joined the network yet.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modern Refined Compliance Banner */}
      <section className="py-16 md:py-20 bg-background border-t border-border">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h3 className="mb-4 font-bold text-foreground flex items-center justify-center gap-2">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            Platform Disclaimer & Compliance
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Medixra operates strictly as a listing directory and facilitator. We are not the manufacturer, distributor, or direct seller of any medical inventory listed on this domain. The regulatory compliance burden pertaining to the Drug Regulatory Authority of Pakistan (DRAP) or local health authorities falls entirely upon the transacting vendors and end-users. Certain specialized clinical hardware may require distinct governmental licenses to procure or operate.
            <br /><br />
            By utilizing Medixra, all parties acknowledge responsibility for verifying equipment legitimacy and regulatory alignment prior to purchase.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
