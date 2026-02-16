import Link from 'next/link'
import Image from 'next/image'
import {
  MessageCircle, Wrench, Building2, Star, MapPin, Filter, Heart, Package,
  Scan, Activity, Scissors, FlaskConical, Stethoscope, Bed, HeartPulse, Syringe,
  Ear, Brain, Bone, Accessibility, Baby, ScanEye, Sparkles, Armchair, Smile, Cat
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

const iconMap = {
  'Activity': Activity,
  'HeartPulse': HeartPulse,
  'Ear': Ear,
  'Brain': Brain,
  'Bone': Bone,
  'Accessibility': Accessibility,
  'Baby': Baby,
  'Scalpel': Scissors, // Mapping Scalpel to Scissors as fallback
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

export default async function Home() {
  const products = await getProducts({ limit: 6 })
  const supabase = await createClient()

  let user = null
  if (supabase) {
    const { data } = await supabase.auth.getUser()
    user = data.user
  }

  const savedIds = user ? await getSavedProductIds(user.id) : []

  const technicians = [
    {
      name: 'Dr. Ahmed Technical Services',
      specialty: 'Ultrasound & Imaging Equipment',
      rating: 4.9,
      city: 'Karachi',
      experience: '15+ years',
    },
    {
      name: 'MediRepair Solutions',
      specialty: 'Diagnostic Equipment',
      rating: 4.8,
      city: 'Lahore',
      experience: '12+ years',
    },
    {
      name: 'Cardiac Care Technicians',
      specialty: 'Monitoring & ECG Equipment',
      rating: 4.7,
      city: 'Islamabad',
      experience: '10+ years',
    },
    {
      name: 'Respiratory Systems Experts',
      specialty: 'Oxygen & Ventilation',
      rating: 4.9,
      city: 'Lahore',
      experience: '14+ years',
    },
  ]

  const features = [
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: 'Direct WhatsApp',
      description: 'Chat via WhatsApp',
    },
    {
      icon: <Building2 className="w-8 h-8" />,
      title: 'Verified Vendors',
      description: 'Trusted sellers only',
    },
    {
      icon: <Wrench className="w-8 h-8" />,
      title: 'Technician Service',
      description: 'Equipment repair available',
    },
  ]

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-b from-primary/5 to-background py-16 md:py-24 tracking-tight">
        <div className="mx-auto max-w-screen-2xl px-4">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
              Find Medical Equipment
              <span className="block text-primary">Directly from Vendors</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              Connect with verified medical equipment vendors and technician services across Pakistan. No middlemen, no commissions. Direct communication via WhatsApp.
            </p>

            <HomeSearchBar />
          </div>

          {/* Feature Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
                <div className="flex h-8 w-8 items-center justify-center text-primary">
                  {feature.icon}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">{feature.title}</p>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipment Classification Section */}
      <section className="py-12 bg-muted/30">
        <div className="mx-auto max-w-screen-2xl px-4">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">Classified Equipment</h2>
            <p className="text-muted-foreground mt-2">Comprehensive medical equipment categorization</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EQUIPMENT_HIERARCHY.map((category) => {
              const Icon = iconMap[category.icon as keyof typeof iconMap] || Package
              return (
                <div key={category.name} className="flex flex-col bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-md text-foreground">{category.name}</h3>
                  </div>

                  <ul className="space-y-2 mb-4 grow">
                    {category.subcategories.slice(0, 5).map((sub) => (
                      <li key={sub}>
                        <Link
                          href={`/products?category=${encodeURIComponent(category.name)}&query=${encodeURIComponent(sub)}`}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                        >
                          <span className="h-1 w-1 rounded-full bg-primary/40 shrink-0" />
                          <span className="line-clamp-1">{sub}</span>
                        </Link>
                      </li>
                    ))}
                    {category.subcategories.length > 5 && (
                      <li className="pt-1">
                        <Link
                          href={`/products?category=${encodeURIComponent(category.name)}`}
                          className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                        >
                          View all {category.subcategories.length} items <Activity className="h-3 w-3" />
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              )
            })}
          </div>

          <div className="mt-10 text-center">
            <Button variant="outline" size="lg" asChild>
              <Link href="/products">Browse All Equipment</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 md:py-20">
        <div className="mx-auto max-w-screen-2xl px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Featured Equipment</h2>
            <Link href="/products" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors">
              <Filter className="h-4 w-4" />
              View All Assets
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isSaved={savedIds.includes(product.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed border-border">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground">No featured equipment yet</h3>
              <p className="text-muted-foreground mb-4">Be the first to post an ad!</p>
              <Button asChild>
                <Link href="/post-ad">Post Ad</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Technician Services Section */}
      <section className="border-y border-border bg-card py-12 md:py-20">
        <div className="mx-auto max-w-screen-2xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">Equipment Repair & Maintenance</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Connect with certified technicians for equipment repair and maintenance services
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {technicians.map((tech, idx) => (
              <div key={idx} className="rounded-lg border border-border bg-background p-6 hover:border-primary transition-colors">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">{tech.name}</h3>
                    <p className="text-sm text-primary">{tech.specialty}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="font-semibold text-foreground">{tech.rating}</span>
                  </div>
                </div>
                <p className="mb-3 text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {tech.city} • {tech.experience}
                </p>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors font-medium">
                  <MessageCircle className="h-4 w-4" />
                  Contact Technician
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Banner */}
      <section className="border-b border-border bg-muted/50 py-8 md:py-12">
        <div className="mx-auto max-w-screen-2xl px-4">
          <h3 className="mb-4 font-semibold text-foreground">Safety & Compliance</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            <strong>Medixra is a listing platform only</strong> and is not the manufacturer or seller of equipment. Responsibility for regulatory compliance with Pakistani laws (including DRAP and other health authorities) lies with the vendor and user, not Medixra. Some medical equipment may be regulated or restricted in Pakistan and may require licenses, approvals, or certifications. Users must verify that the equipment, seller, and use are compliant with applicable Pakistani laws and medical regulations before purchase or use. For more information, see our Safety & Compliance guidelines.
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  )
}
