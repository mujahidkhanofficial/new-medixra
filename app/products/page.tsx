'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Filter, X, MapPin, Star, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'

// Mock data - In production, fetch from Supabase
const allProducts = [
    {
        id: '1',
        name: 'Portable Ultrasound Machine',
        category: 'Imaging Equipment',
        vendor: 'MediTech Pakistan',
        price: 450000,
        priceDisplay: '₨ 450,000',
        rating: 4.9,
        reviews: 156,
        location: 'Lahore',
        condition: 'New',
        image: 'bg-gradient-to-br from-purple-100 to-purple-50',
    },
    {
        id: '2',
        name: 'Advanced ECG Monitor',
        category: 'Monitoring Equipment',
        vendor: 'CardioMed Solutions',
        price: 95000,
        priceDisplay: '₨ 95,000',
        rating: 4.6,
        reviews: 142,
        location: 'Karachi',
        condition: 'New',
        image: 'bg-gradient-to-br from-orange-100 to-orange-50',
    },
    {
        id: '3',
        name: 'Digital Thermometer Pro',
        category: 'Diagnostic Equipment',
        vendor: 'SafeHealth Solutions',
        price: 2500,
        priceDisplay: '₨ 2,500',
        rating: 4.8,
        reviews: 324,
        location: 'Karachi',
        condition: 'New',
        image: 'bg-gradient-to-br from-green-100 to-green-50',
    },
    {
        id: '4',
        name: 'Oxygen Concentrator 5L',
        category: 'Respiratory Equipment',
        vendor: 'BreathEasy Systems',
        price: 125000,
        priceDisplay: '₨ 125,000',
        rating: 4.6,
        reviews: 234,
        location: 'Lahore',
        condition: 'Refurbished',
        image: 'bg-gradient-to-br from-blue-100 to-blue-50',
    },
    {
        id: '5',
        name: 'Automatic BP Monitor',
        category: 'Diagnostic Equipment',
        vendor: 'VitalSigns Tech',
        price: 8500,
        priceDisplay: '₨ 8,500',
        rating: 4.9,
        reviews: 512,
        location: 'Karachi',
        condition: 'New',
        image: 'bg-gradient-to-br from-red-100 to-red-50',
    },
    {
        id: '6',
        name: 'Sterilization Autoclave',
        category: 'Sterilization Equipment',
        vendor: 'CleanMed Solutions',
        price: 320000,
        priceDisplay: '₨ 320,000',
        rating: 4.8,
        reviews: 67,
        location: 'Rawalpindi',
        condition: 'New',
        image: 'bg-gradient-to-br from-teal-100 to-teal-50',
    },
    {
        id: '7',
        name: 'Patient Monitor',
        category: 'Monitoring Equipment',
        vendor: 'MediCare Plus',
        price: 180000,
        priceDisplay: '₨ 180,000',
        rating: 4.7,
        reviews: 89,
        location: 'Islamabad',
        condition: 'Used',
        image: 'bg-gradient-to-br from-indigo-100 to-indigo-50',
    },
    {
        id: '8',
        name: 'Surgical Light LED',
        category: 'Surgical Equipment',
        vendor: 'SurgeTech',
        price: 250000,
        priceDisplay: '₨ 250,000',
        rating: 4.5,
        reviews: 45,
        location: 'Lahore',
        condition: 'New',
        image: 'bg-gradient-to-br from-yellow-100 to-yellow-50',
    },
]

const categories = [
    'All Categories',
    'Imaging Equipment',
    'Monitoring Equipment',
    'Diagnostic Equipment',
    'Respiratory Equipment',
    'Sterilization Equipment',
    'Surgical Equipment',
]

const conditions = ['All', 'New', 'Refurbished', 'Used']
const locations = ['All Cities', 'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi']

export default function ProductsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All Categories')
    const [selectedCondition, setSelectedCondition] = useState('All')
    const [selectedLocation, setSelectedLocation] = useState('All Cities')
    const [showFilters, setShowFilters] = useState(false)

    const filteredProducts = useMemo(() => {
        return allProducts.filter((product) => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.vendor.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory
            const matchesCondition = selectedCondition === 'All' || product.condition === selectedCondition
            const matchesLocation = selectedLocation === 'All Cities' || product.location === selectedLocation

            return matchesSearch && matchesCategory && matchesCondition && matchesLocation
        })
    }, [searchQuery, selectedCategory, selectedCondition, selectedLocation])

    const clearFilters = () => {
        setSearchQuery('')
        setSelectedCategory('All Categories')
        setSelectedCondition('All')
        setSelectedLocation('All Cities')
    }

    const hasActiveFilters = searchQuery || selectedCategory !== 'All Categories' ||
        selectedCondition !== 'All' || selectedLocation !== 'All Cities'

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navigation />

            <main className="flex-1">
                <div className="mx-auto max-w-7xl px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">Medical Equipment</h1>
                        <p className="text-muted-foreground">Browse verified medical equipment from trusted vendors across Pakistan</p>
                    </div>

                    {/* Search Bar */}
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search equipment or vendors..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <Button
                            variant="outline"
                            className="gap-2 px-4"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="h-4 w-4" />
                            Filters
                            {hasActiveFilters && (
                                <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">!</span>
                            )}
                        </Button>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="rounded-lg border border-border bg-card p-4 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-foreground">Filter Products</h3>
                                {hasActiveFilters && (
                                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground gap-1">
                                        <X className="h-4 w-4" />
                                        Clear all
                                    </Button>
                                )}
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                {/* Category Filter */}
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Condition Filter */}
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-2 block">Condition</label>
                                    <select
                                        value={selectedCondition}
                                        onChange={(e) => setSelectedCondition(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        {conditions.map((cond) => (
                                            <option key={cond} value={cond}>{cond}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Location Filter */}
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-2 block">Location</label>
                                    <select
                                        value={selectedLocation}
                                        onChange={(e) => setSelectedLocation(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        {locations.map((loc) => (
                                            <option key={loc} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results Count */}
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-sm text-muted-foreground">
                            Showing <strong className="text-foreground">{filteredProducts.length}</strong> products
                        </p>
                    </div>

                    {/* Products Grid */}
                    {filteredProducts.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredProducts.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/product/${product.id}`}
                                    className="group rounded-lg border border-border bg-card overflow-hidden hover:border-primary transition-all hover:shadow-lg"
                                >
                                    <div className={`${product.image} aspect-square`} />
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                                {product.condition}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{product.category}</span>
                                        </div>
                                        <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-2">{product.vendor}</p>
                                        <p className="text-lg font-bold text-primary mb-3">{product.priceDisplay}</p>
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 fill-primary text-primary" />
                                                <span>{product.rating}</span>
                                                <span>({product.reviews})</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                <span>{product.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <Package className="h-12 w-12 text-muted mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
                            <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
                            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}
