import Link from 'next/link'
import * as LucideIcons from 'lucide-react'
import { ArrowRight, ShieldCheck, MapPin, Zap, Filter, Package, Stethoscope, Building2, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { getProducts } from '@/lib/actions/products'
import { createClient } from '@/lib/supabase/server'
import { getSavedProductIds } from '@/lib/actions/saved-items'
import { EQUIPMENT_HIERARCHY } from '@/lib/constants'
import { VendorsMarquee } from '@/components/home/vendors-marquee'
import { FeaturedSlider } from '@/components/home/featured-slider'
import { getApprovedEngineers } from '@/lib/actions/engineer'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
export const dynamic = 'force-dynamic'

export default async function Home() {
  const products = await getProducts({ limit: 10 })
  const supabase = await createClient()

  let user = null
  if (supabase) {
    const { data } = await supabase.auth.getUser()
    user = data.user
  }

  const savedIds = user ? await getSavedProductIds(user.id) : []

  // Dynamically fetch actual approved engineers instead of using mock data
  const allEngineers = await getApprovedEngineers()
  const topEngineers = allEngineers.slice(0, 4)

  // Force Turbopack HMR cache clearing
  return (
    <main className="min-h-screen flex flex-col bg-background selection:bg-primary/20" suppressHydrationWarning>
      <Navigation />

      {/* High-Impact Hero Section (Teal Redesign) */}
      <section className="relative w-full bg-[#1B7484] pt-24 pb-40 md:pt-32 md:pb-48">
        <div className="mx-auto max-w-7xl px-4 md:px-8">

          <div className="max-w-2xl text-left">
            <h1 className="mb-6 text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl leading-[1.1]">
              Medical Equipment Marketplace for Pakistan
            </h1>

            <p className="mb-10 text-lg text-white/90 font-medium leading-relaxed max-w-xl">
              The trusted platform for doctors, hospitals, and vendors to buy and sell quality medical equipment securely and efficiently.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Button asChild className="bg-white text-[#1B7484] hover:bg-gray-100 font-bold px-8 py-6 rounded-md shadow-lg text-base transition-colors">
                <Link href="/products">Browse Equipment</Link>
              </Button>
              <Button asChild className="bg-emerald-500 text-white hover:bg-emerald-600 font-bold px-8 py-6 rounded-md shadow-lg text-base flex items-center gap-2 transition-colors">
                <Link href="/post-ad">
                  Post a Listing <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Overlapping Quick Access Cards */}
      <div className="relative z-10 -mt-24 md:-mt-16 lg:-mt-28 px-4 md:px-8 mb-12 lg:mb-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-4 lg:gap-6">

            {/* Card 1 */}
            <Link href="/products" className="group flex flex-col items-center justify-center bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 md:p-5 lg:p-8 text-center border border-gray-100 min-h-[160px] lg:min-h-[180px]">
              <div className="h-12 w-12 rounded-full bg-[#1B7484]/10 flex items-center justify-center mb-4 text-[#1B7484] group-hover:scale-110 transition-transform">
                <Stethoscope className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg md:text-base lg:text-lg mb-2">Browse by Specialty</h3>
              <p className="text-gray-500 text-sm md:text-xs lg:text-sm leading-relaxed">Find equipment for specific medical fields</p>
            </Link>

            {/* Card 2 */}
            <Link href="/products" className="group flex flex-col items-center justify-center bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 md:p-5 lg:p-8 text-center border border-gray-100 min-h-[160px] lg:min-h-[180px]">
              <div className="h-12 w-12 rounded-full bg-[#1B7484]/10 flex items-center justify-center mb-4 text-[#1B7484] group-hover:scale-110 transition-transform">
                <Package className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg md:text-base lg:text-lg mb-2">Browse by Category</h3>
              <p className="text-gray-500 text-sm md:text-xs lg:text-sm leading-relaxed">Explore diagnostic, surgical & more</p>
            </Link>

            {/* Card 3 */}
            <Link href="/signup?role=vendor" className="group flex flex-col items-center justify-center bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 md:p-5 lg:p-8 text-center border border-gray-100 min-h-[160px] lg:min-h-[180px]">
              <div className="h-12 w-12 rounded-full bg-[#1B7484]/10 flex items-center justify-center mb-4 text-[#1B7484] group-hover:scale-110 transition-transform">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg md:text-base lg:text-lg mb-2">Register as Vendor</h3>
              <p className="text-gray-500 text-sm md:text-xs lg:text-sm leading-relaxed">Create your professional store profile</p>
            </Link>

            {/* Card 4 */}
            <Link href="/engineers" className="group flex flex-col items-center justify-center bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 md:p-5 lg:p-8 text-center border border-gray-100 min-h-[160px] lg:min-h-[180px]">
              <div className="h-12 w-12 rounded-full bg-[#1B7484]/10 flex items-center justify-center mb-4 text-[#1B7484] group-hover:scale-110 transition-transform">
                <Wrench className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg md:text-base lg:text-lg mb-2">Find Engineers</h3>
              <p className="text-gray-500 text-sm md:text-xs lg:text-sm leading-relaxed">Certified equipment maintenance</p>
            </Link>

          </div>
        </div>
      </div>

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
              const Icon = (LucideIcons as any)[category.icon] || Package
              return (
                <div
                  key={category.name}
                  className="group relative flex flex-col bg-card/50 backdrop-blur-sm border border-border/60 hover:border-primary/40 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
                >
                  <Link
                    href={`/products?category=${encodeURIComponent(category.name)}`}
                    className="absolute inset-0 z-0 rounded-2xl"
                    aria-label={`View all ${category.name}`}
                  />

                  <div className="flex items-center gap-4 mb-6 relative z-10 pointer-events-none">
                    <div className="h-12 w-12 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-inner">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-lg text-foreground tracking-tight line-clamp-2">{category.name}</h3>
                  </div>

                  <ul className="space-y-1.5 mb-6 grow relative z-10 pointer-events-none">
                    {category.subcategories.map((sub) => (
                      <li key={sub} className="pointer-events-auto">
                        <Link
                          href={`/products?category=${encodeURIComponent(category.name)}&speciality=${encodeURIComponent(sub)}`}
                          className="group/item flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300 px-2 -mx-2 py-1.5 rounded-md"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-border group-hover/item:bg-primary group-hover:bg-primary/50 transition-colors shrink-0" />
                          <span className="line-clamp-1 group-hover/item:translate-x-1 transition-transform duration-300">{sub}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between text-sm font-semibold text-primary/80 group-hover:text-primary transition-colors relative z-10 pointer-events-none">
                    <span>View Collection</span>
                    <ArrowRight className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
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
            <div className="-mx-4 md:mx-0">
              <FeaturedSlider products={products} savedIds={savedIds} />
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

      {/* Premium Engineers Network */}
      <section className="py-24 bg-card border-y border-border/40 relative overflow-hidden">
        {/* Decorative Background Element */}
        <div className="absolute right-0 bottom-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] -z-10 translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="mx-auto max-w-screen-2xl px-4 relative">
          <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs tracking-wider uppercase mb-4">
                <Zap className="h-3.5 w-3.5" /> Service Network
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Certified Engineering Support</h2>
              <p className="text-muted-foreground mt-3 text-lg leading-relaxed">
                Connect instantly with top-rated medical engineers for emergency repairs, preventative maintenance, and calibration.
              </p>
            </div>
            <Button variant="outline" className="rounded-full shadow-sm shrink-0" asChild>
              <Link href="/engineers">View All Engineers <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {topEngineers.length > 0 ? topEngineers.map((tech) => (
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

                <Link href={`/engineers`} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-colors font-bold text-sm">
                  View Profile
                </Link>
              </div>
            )) : (
              <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border rounded-2xl bg-muted/10">
                No engineers have joined the network yet.
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
            Pakmedinex operates strictly as a listing directory and facilitator. We are not the manufacturer, distributor, or direct seller of any medical inventory listed on this domain. The regulatory compliance burden pertaining to the Drug Regulatory Authority of Pakistan (DRAP) or local health authorities falls entirely upon the transacting vendors and end-users. Certain specialized clinical hardware may require distinct governmental licenses to procure or operate.
            <br /><br />
            By utilizing Pakmedinex, all parties acknowledge responsibility for verifying equipment legitimacy and regulatory alignment prior to purchase.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
