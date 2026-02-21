'use client'

import { useState, useMemo } from 'react'
import { Search, MapPin, Store, CheckCircle, Briefcase, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { VendorProfile } from '@/lib/actions/vendors'
import Image from 'next/image'

export default function VendorsClientPage({ initialVendors }: { initialVendors: VendorProfile[] }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCity, setSelectedCity] = useState('all')

    // Extract unique cities from vendors + default 'all'
    const cities = useMemo(() => {
        const uniqueCities = new Set(initialVendors.map(v => v.city).filter(Boolean))
        return ['all', ...Array.from(uniqueCities).sort()]
    }, [initialVendors])

    const filteredVendors = initialVendors.filter((vendor) => {
        const vendorName = vendor.business_name || vendor.full_name || ''
        const matchesSearch = vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (vendor.business_type || '').toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCity = selectedCity === 'all' || vendor.city === selectedCity
        return matchesSearch && matchesCity
    })

    return (
        <div className="flex-1">
            {/* Hero Section */}
            <section className="border-b border-border bg-linear-to-b from-primary/5 to-background py-12 md:py-16">
                <div className="mx-auto max-w-screen-2xl px-4">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-foreground md:text-4xl mb-2">Medical Equipment Vendors</h1>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Connect with verified suppliers, distributors, and manufacturers for your medical equipment needs.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="mx-auto max-w-2xl">
                        <div className="flex gap-2 rounded-lg border border-border bg-card p-2 shadow-lg">
                            <Search className="ml-3 h-5 w-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by company name or business type..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="mx-auto max-w-screen-2xl px-4 py-12">
                {/* Filters */}
                <div className="mb-8">
                    <h3 className="font-semibold text-foreground mb-4">Filter by City</h3>
                    <div className="flex flex-wrap gap-2">
                        {cities.map((city) => (
                            <button
                                key={city as string}
                                onClick={() => setSelectedCity(city as string)}
                                className={`px-4 py-2 rounded-full font-medium transition-colors text-sm ${selectedCity === city
                                    ? 'bg-primary text-primary-foreground'
                                    : 'border border-border bg-background text-foreground hover:border-primary'
                                    }`}
                            >
                                {city === 'all' ? 'All Cities' : city as string}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Vendors Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredVendors.map((vendor) => {
                        const storeUrl = vendor.showroom_slug ? `/shop/${vendor.showroom_slug}` : `/shop/${vendor.id}`

                        return (
                            <div
                                key={vendor.id}
                                className="rounded-xl border border-border bg-card hover:border-primary/50 transition-all hover:shadow-xl overflow-hidden flex flex-col group"
                            >
                                {/* Banner Placeholder / Image */}
                                <div className="h-32 bg-muted relative w-full overflow-hidden">
                                    {vendor.banner_url ? (
                                        <Image
                                            src={vendor.banner_url}
                                            alt={vendor.business_name || 'Vendor Banner'}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-linear-to-r from-primary/10 to-primary/5 flex items-center justify-center">
                                            <Store className="h-10 w-10 text-primary/20" />
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 flex flex-col flex-1 relative">
                                    {/* Avatar overlapping banner */}
                                    <div className="absolute -top-10 left-6 rounded-lg bg-background p-1 shadow-md">
                                        <div className="h-16 w-16 bg-muted rounded flex items-center justify-center overflow-hidden border border-border relative">
                                            {vendor.avatar_url ? (
                                                <Image src={vendor.avatar_url} alt="Logo" fill className="object-cover" />
                                            ) : (
                                                <Store className="h-8 w-8 text-muted-foreground" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Spacer for avatar */}
                                    <div className="h-8" />

                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-foreground text-xl line-clamp-1 group-hover:text-primary transition-colors">
                                                    {vendor.business_name || vendor.full_name}
                                                </h3>
                                                {vendor.is_verified && (
                                                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1.5 line-clamp-1">
                                                <MapPin className="h-3.5 w-3.5" />
                                                {vendor.city || 'Pakistan'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-3 mb-6 mt-2 pt-4 border-t border-border/50">
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                                <Briefcase className="h-3 w-3" /> Business Type
                                            </p>
                                            <p className="text-sm text-foreground font-medium line-clamp-1">
                                                {vendor.business_type || 'Retailer'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> Experience
                                            </p>
                                            <p className="text-sm text-foreground font-medium">
                                                {vendor.years_in_business ? `${vendor.years_in_business} Years` : 'New Vendor'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Visit Showroom Button */}
                                    <div className="mt-auto pt-2">
                                        <Button
                                            asChild
                                            className="w-full gap-2 rounded-lg"
                                            variant="default"
                                        >
                                            <Link href={storeUrl}>
                                                <Store className="h-4 w-4" />
                                                Visit Webstore
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* No Results */}
                {filteredVendors.length === 0 && (
                    <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border mt-8">
                        <Store className="h-12 w-12 text-muted mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No vendors found</h3>
                        <p className="text-muted-foreground">Try adjusting your search criteria and location filters</p>
                    </div>
                )}
            </div>
        </div>
    )
}
