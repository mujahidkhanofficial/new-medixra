'use client'

import { Search, Heart, MessageCircle, Wrench, Building2, Star, MapPin, Filter } from 'lucide-react'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'

export default function Home() {


  const products = [
    {
      id: 1,
      name: 'Digital Thermometer',
      category: 'Diagnostic Equipment',
      vendor: 'SafeHealth Solutions',
      price: '₨ 2,500',
      rating: 4.8,
      reviews: 324,
      location: 'Karachi',
    },
    {
      id: 2,
      name: 'Portable Ultrasound Machine',
      category: 'Imaging Equipment',
      vendor: 'MediTech Pakistan',
      price: '₨ 450,000',
      rating: 4.9,
      reviews: 156,
      location: 'Lahore',
    },
    {
      id: 3,
      name: 'ECG Monitor',
      category: 'Monitoring Equipment',
      vendor: 'HeartCare Devices',
      price: '₨ 85,000',
      rating: 4.7,
      reviews: 89,
      location: 'Islamabad',
    },
    {
      id: 4,
      name: 'Oxygen Concentrator',
      category: 'Respiratory Equipment',
      vendor: 'BreathEasy Systems',
      price: '₨ 125,000',
      rating: 4.6,
      reviews: 234,
      location: 'Lahore',
    },
    {
      id: 5,
      name: 'Automatic BP Monitor',
      category: 'Diagnostic Equipment',
      vendor: 'VitalSigns Tech',
      price: '₨ 8,500',
      rating: 4.9,
      reviews: 512,
      location: 'Karachi',
    },
    {
      id: 6,
      name: 'Sterilization Autoclave',
      category: 'Sterilization Equipment',
      vendor: 'CleanMed Solutions',
      price: '₨ 320,000',
      rating: 4.8,
      reviews: 67,
      location: 'Rawalpindi',
    },
  ]

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

            <div className="mx-auto max-w-2xl">
              <div className="flex gap-2 rounded-lg border border-border bg-card p-2 shadow-lg">
                <Search className="ml-3 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search equipment, vendors, or services..."
                  className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground"
                />
                <button className="px-4 py-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground transition-colors font-medium">
                  Search
                </button>
              </div>
            </div>
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

      {/* Products Grid */}
      <section className="py-12 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Featured Equipment</h2>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors">
              <Filter className="h-4 w-4" />
              More Filters
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="group overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-lg hover:border-primary"
              >
                <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-50" />
                <div className="p-4">
                  <p className="text-sm text-primary font-semibold">{product.category}</p>
                  <h3 className="mb-1 font-semibold text-foreground text-lg">{product.name}</h3>
                  <p className="mb-3 text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {product.location}
                  </p>

                  <div className="mb-3 flex items-center gap-1">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${i < Math.floor(product.rating) ? 'fill-accent text-accent' : 'text-muted'
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">({product.reviews})</span>
                  </div>

                  <p className="mb-3 text-sm text-muted-foreground">Vendor: {product.vendor}</p>
                  <p className="mb-4 text-2xl font-bold text-primary">{product.price}</p>

                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors font-medium">
                      <MessageCircle className="h-4 w-4" />
                      Message
                    </button>
                    <button className="flex items-center justify-center p-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors">
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
