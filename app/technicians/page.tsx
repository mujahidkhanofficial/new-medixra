'use client'

import { useState } from 'react'
import { Search, MapPin, Star, MessageCircle, CheckCircle, Award, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'

export default function TechniciansPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('all')

  const technicians = [
    {
      id: 1,
      name: 'Dr. Ahmed Malik',
      specialty: 'Ultrasound & Imaging Equipment',
      rating: 4.9,
      reviews: 156,
      city: 'Karachi',
      experience: '15+ years',
      responseTime: '2 hours',
      verified: true,
      certifications: ['DRAP Certified', 'Advanced Technician'],
      image: 'bg-gradient-to-br from-blue-100 to-blue-50',
    },
    {
      id: 2,
      name: 'MediRepair Solutions Team',
      specialty: 'Diagnostic Equipment',
      rating: 4.8,
      reviews: 98,
      city: 'Lahore',
      experience: '12+ years',
      responseTime: '1 hour',
      verified: true,
      certifications: ['Hospital Approved', 'Diagnostic Specialist'],
      image: 'bg-gradient-to-br from-emerald-100 to-emerald-50',
    },
    {
      id: 3,
      name: 'Muhammad Hassan',
      specialty: 'Monitoring & ECG Equipment',
      rating: 4.7,
      reviews: 67,
      city: 'Islamabad',
      experience: '10+ years',
      responseTime: '3 hours',
      verified: true,
      certifications: ['ECG Specialist', 'Maintenance Expert'],
      image: 'bg-gradient-to-br from-orange-100 to-orange-50',
    },
    {
      id: 4,
      name: 'Respiratory Systems Experts',
      specialty: 'Oxygen & Ventilation Equipment',
      rating: 4.9,
      reviews: 203,
      city: 'Lahore',
      experience: '14+ years',
      responseTime: '1.5 hours',
      verified: true,
      certifications: ['Respiratory Certified', 'Emergency Response'],
      image: 'bg-gradient-to-br from-cyan-100 to-cyan-50',
    },
    {
      id: 5,
      name: 'Surgical Equipment Care',
      specialty: 'Surgical & Sterilization Equipment',
      rating: 4.6,
      reviews: 89,
      city: 'Rawalpindi',
      experience: '11+ years',
      responseTime: '2.5 hours',
      verified: true,
      certifications: ['Surgical Specialist', 'Sterilization Expert'],
      image: 'bg-gradient-to-br from-pink-100 to-pink-50',
    },
    {
      id: 6,
      name: 'Digital Lab Systems Support',
      specialty: 'Laboratory Equipment',
      rating: 4.8,
      reviews: 124,
      city: 'Karachi',
      experience: '13+ years',
      responseTime: '2 hours',
      verified: true,
      certifications: ['Lab Equipment Expert', 'Quality Assured'],
      image: 'bg-gradient-to-br from-purple-100 to-purple-50',
    },
  ]

  const cities = ['all', 'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Multan']

  const filteredTechnicians = technicians.filter((tech) => {
    const matchesSearch = tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCity = selectedCity === 'all' || tech.city === selectedCity
    return matchesSearch && matchesCity
  })

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground md:text-4xl mb-2">Equipment Repair & Maintenance</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Connect with certified technicians for professional equipment repair, maintenance, and calibration services
            </p>
          </div>

          {/* Search Bar */}
          <div className="mx-auto max-w-2xl">
            <div className="flex gap-2 rounded-lg border border-border bg-card p-2 shadow-lg">
              <Search className="ml-3 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by technician name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Filters */}
        <div className="mb-8">
          <h3 className="font-semibold text-foreground mb-4">Filter by City</h3>
          <div className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-4 py-2 rounded-full font-medium transition-colors text-sm ${
                  selectedCity === city
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-background text-foreground hover:border-primary'
                }`}
              >
                {city === 'all' ? 'All Cities' : city}
              </button>
            ))}
          </div>
        </div>

        {/* Technicians Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {filteredTechnicians.map((tech) => (
            <div
              key={tech.id}
              className="rounded-lg border border-border bg-card hover:border-primary transition-all hover:shadow-lg overflow-hidden"
            >
              <div className={`${tech.image} aspect-video`} />
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground text-lg">{tech.name}</h3>
                      {tech.verified && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-primary font-medium">{tech.specialty}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(tech.rating) ? 'fill-accent text-accent' : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-foreground">{tech.rating}</span>
                  <span className="text-xs text-muted-foreground">({tech.reviews} reviews)</span>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-border">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Location</p>
                    <p className="flex items-center gap-1 text-sm text-foreground font-medium">
                      <MapPin className="h-3.5 w-3.5" />
                      {tech.city}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Response Time</p>
                    <p className="text-sm text-foreground font-medium">{tech.responseTime}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Experience</p>
                    <p className="text-sm text-foreground font-medium">{tech.experience}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <span className="inline-flex items-center gap-1 text-sm text-emerald-700 font-medium">
                      <Zap className="h-3.5 w-3.5" />
                      Available
                    </span>
                  </div>
                </div>

                {/* Certifications */}
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <Award className="h-3.5 w-3.5" />
                    Certifications
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tech.certifications.map((cert) => (
                      <span
                        key={cert}
                        className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Request Service
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredTechnicians.length === 0 && (
          <div className="text-center py-16">
            <Search className="h-12 w-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No technicians found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
