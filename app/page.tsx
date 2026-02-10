import Link from 'next/link'
import Image from 'next/image'
import {
  MessageCircle, Wrench, Building2, Star, MapPin, Filter, Heart, Package,
  Scan, Activity, Scissors, FlaskConical, Stethoscope, Bed, HeartPulse, Syringe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { getProducts } from '@/lib/actions/products'
import { HomeSearchBar } from '@/components/home/search-bar'



export const dynamic = 'force-dynamic'

export default async function Home() {
  const products = await getProducts({ limit: 6 })

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
      description: 'Message vendors directly',
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
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/5 to-background py-12 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
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

      {/* Categories Section */}
      <section className="py-12 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">Browse by Category</h2>
            <p className="text-muted-foreground mt-2">Find the right equipment for your medical facility</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Imaging Equipment', icon: Scan },
              { name: 'Monitoring Equipment', icon: Activity },
              { name: 'Surgical Equipment', icon: Scissors },
              { name: 'Laboratory Equipment', icon: FlaskConical },
              { name: 'Dental Equipment', icon: Stethoscope },
              { name: 'Hospital Furniture', icon: Bed },
              { name: 'Cardiology Equipment', icon: HeartPulse },
              { name: 'Consumables', icon: Syringe }
            ].map((cat) => (
              <Link
                key={cat.name}
                href={`/products?category=${encodeURIComponent(cat.name === 'Consumables' ? 'Consumables & Accessories' : cat.name)}`}
                className="flex flex-col items-center p-6 bg-card border border-border rounded-xl hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                  <cat.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="font-semibold text-foreground text-center">{cat.name}</span>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button variant="outline" asChild>
              <Link href="/products">View All Categories</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
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
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-lg hover:border-primary block"
                >
                  <div className="aspect-square bg-muted relative">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Package className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className="bg-background/80 backdrop-blur text-xs font-semibold px-2 py-1 rounded-full border border-border">
                        {product.condition}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-primary font-semibold">{product.category}</p>
                    <h3 className="mb-1 font-semibold text-foreground text-lg line-clamp-1">{product.name}</h3>
                    <p className="mb-3 text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {product.location}
                    </p>

                    <p className="mb-3 text-sm text-muted-foreground">Vendor: {product.vendor_name}</p>
                    <p className="mb-4 text-2xl font-bold text-primary">₨ {product.price.toLocaleString()}</p>

                    <div className="flex gap-2">
                      <Button className="w-full">
                        View Details
                      </Button>
                    </div>
                  </div>
                </Link>
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
        <div className="mx-auto max-w-6xl px-4">
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
        <div className="mx-auto max-w-6xl px-4">
          <h3 className="mb-4 font-semibold text-foreground">Safety & Compliance</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            <strong>Medixra is a listing platform only</strong> and is not the manufacturer or seller of equipment. Responsibility for regulatory compliance with Pakistani laws (including DRAP and other health authorities) lies with the vendor and buyer, not Medixra. Some medical equipment may be regulated or restricted in Pakistan and may require licenses, approvals, or certifications. Buyers must verify that the equipment, seller, and use are compliant with applicable Pakistani laws and medical regulations before purchase or use. For more information, see our Safety & Compliance guidelines.
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
