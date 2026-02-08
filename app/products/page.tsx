'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Filter, X, MapPin, Star, Package, Loader2, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'
import { ProductFilters } from '@/components/products/product-filters'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

type Product = Database['public']['Tables']['products']['Row'] & {
    vendor?: {
        full_name: string | null
        city: string | null
        rating?: number
        reviews_count?: number
    }
}

const categories = [
    'All Categories',
    'Imaging Equipment',
    'Monitoring Equipment',
    'Diagnostic Equipment',
    'Respiratory Equipment',
    'Sterilization Equipment',
    'Surgical Equipment',
    'Laboratory Equipment',
    'Dental Equipment',
    'Hospital Furniture',
    'Physiotherapy Equipment',
    'OT Equipment',
    'Cardiology Equipment',
    'Gynecology & Infant Care',
    'Ambulance & Emergency',
    'Refurbished & Parts',
    'Consumables & Accessories'
]

const conditions = ['All', 'New', 'Refurbished', 'Used']
const locations = [
    'All Pakistan',
    'Karachi',
    'Lahore',
    'Islamabad',
    'Rawalpindi',
    'Faisalabad',
    'Multan',
    'Peshawar',
    'Quetta',
    'Hyderabad',
    'Gujranwala',
    'Sialkot',
    'Sargodha',
    'Bahawalpur',
    'Jhang',
    'Mardan',
    'Abbottabad',
    'Dera Ghazi Khan',
    'Sukkur',
    'Larkana',
    'Mirpur Khas'
]

const specialties = [
    'All Specialties',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Radiology',
    'Dermatology',
    'ICU / Critical Care',
    'General Surgery',
    'Gynecology'
]

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All Categories')
    const [selectedCondition, setSelectedCondition] = useState('All')
    const [selectedLocation, setSelectedLocation] = useState('All Pakistan')
    const [selectedSpeciality, setSelectedSpeciality] = useState('All Specialties')
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000])

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true)
            const supabase = createClient()

            try {
                // Try to fetch from Supabase
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (error) {
                    console.warn('Database table missing or inaccessible. Using mock data for now.')
                    throw error
                }

                if (data && data.length > 0) {
                    setProducts(data as any)
                } else {
                    // Fallback to mock data if table empty
                    setProducts(MOCK_PRODUCTS)
                }
            } catch (error: any) {
                console.error('Fetch error:', error.message)
                // Use mock data on any fetch failure (like table not found)
                setProducts(MOCK_PRODUCTS)
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [])

    const MOCK_PRODUCTS: Product[] = [
        {
            id: '1',
            name: 'Mindray BeneVision N12 Patient Monitor',
            category: 'Monitoring Equipment',
            price: 450000,
            condition: 'New',
            location: 'Karachi',
            description: 'Advanced patient monitoring system...',
            vendor_id: 'mock-1',
            created_at: new Date().toISOString(),
            image_url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
            vendor: { full_name: 'MediQuip Solutions', city: 'Karachi' }
        } as any,
        {
            id: '2',
            name: 'GE Voluson E10 Ultrasound Machine',
            category: 'Imaging Equipment',
            price: 2800000,
            condition: 'Refurbished',
            location: 'Lahore',
            description: 'Premium 4D ultrasound system...',
            vendor_id: 'mock-2',
            created_at: new Date().toISOString(),
            image_url: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=800',
            vendor: { full_name: 'Elite Health Systems', city: 'Lahore' }
        } as any,
        {
            id: '3',
            name: 'Philips Respironics V60 Ventilator',
            category: 'Respiratory Equipment',
            price: 850000,
            condition: 'Used',
            location: 'Islamabad',
            description: 'Non-invasive ventilation system...',
            vendor_id: 'mock-3',
            created_at: new Date().toISOString(),
            image_url: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&q=80&w=800',
            vendor: { full_name: 'Islamabad Medical Store', city: 'Islamabad' }
        } as any
    ]

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const vendorName = product.vendor?.full_name || 'Unknown Vendor'
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                vendorName.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory
            const matchesCondition = selectedCondition === 'All' || product.condition === selectedCondition
            const matchesLocation = selectedLocation === 'All Pakistan' || (product.vendor?.city || product.location) === selectedLocation
            const matchesSpeciality = selectedSpeciality === 'All Specialties' || true // Assuming products don't have specialty field yet, or mapping from category? For now enabling UI.
            // TODO: If products have specialty, add check: product.specialty === selectedSpeciality
            // If specialty is implied by category, maybe mapped. For now, we will add UI but logic might be placeholder if field missing.
            const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]

            return matchesSearch && matchesCategory && matchesCondition && matchesLocation && matchesPrice && matchesSpeciality
        })
    }, [products, searchQuery, selectedCategory, selectedCondition, selectedLocation, priceRange, selectedSpeciality])

    const clearFilters = () => {
        setSearchQuery('')
        setSelectedCategory('All Categories')
        setSelectedCondition('All')
        setSelectedLocation('All Pakistan')
        setSelectedSpeciality('All Specialties')
        setPriceRange([0, 1000000])
    }

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

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Filters (Desktop) */}
                        <aside className="hidden lg:block w-64 flex-shrink-0">
                            <div className="sticky top-24">
                                <ProductFilters
                                    categories={categories}
                                    conditions={conditions}
                                    locations={locations}
                                    specialties={specialties}
                                    selectedCategory={selectedCategory}
                                    selectedCondition={selectedCondition}
                                    selectedLocation={selectedLocation}
                                    selectedSpeciality={selectedSpeciality}
                                    priceRange={priceRange}
                                    onCategoryChange={setSelectedCategory}
                                    onConditionChange={setSelectedCondition}
                                    onLocationChange={setSelectedLocation}
                                    onSpecialityChange={setSelectedSpeciality}
                                    onPriceRangeChange={setPriceRange}
                                    onClearFilters={clearFilters}
                                />
                            </div>
                        </aside>

                        {/* Main Content */}
                        <div className="flex-1">
                            {/* ... Search ... */}
                            <div className="flex gap-4 mb-6 sticky top-[64px] z-30 bg-background/95 backdrop-blur py-2 lg:static lg:bg-transparent lg:py-0">
                                {/* ... search input ... */}
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search equipment or vendors..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" className="lg:hidden gap-2">
                                            <SlidersHorizontal className="h-4 w-4" />
                                            Filters
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                                        <SheetHeader className="mb-6">
                                            <SheetTitle>Filters</SheetTitle>
                                        </SheetHeader>
                                        <ProductFilters
                                            categories={categories}
                                            conditions={conditions}
                                            locations={locations}
                                            specialties={specialties}
                                            selectedCategory={selectedCategory}
                                            selectedCondition={selectedCondition}
                                            selectedLocation={selectedLocation}
                                            selectedSpeciality={selectedSpeciality}
                                            priceRange={priceRange}
                                            onCategoryChange={setSelectedCategory}
                                            onConditionChange={setSelectedCondition}
                                            onLocationChange={setSelectedLocation}
                                            onSpecialityChange={setSelectedSpeciality}
                                            onPriceRangeChange={setPriceRange}
                                            onClearFilters={clearFilters}
                                        />
                                    </SheetContent>
                                </Sheet>
                            </div>

                            {/* Results Count */}
                            <div className="flex items-center justify-between mb-6">
                                <p className="text-sm text-muted-foreground">
                                    Showing <strong className="text-foreground">{filteredProducts.length}</strong> products
                                </p>
                            </div>

                            {/* Products Grid */}
                            {loading ? (
                                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="h-[350px] rounded-lg bg-muted animate-pulse" />
                                    ))}
                                </div>
                            ) : filteredProducts.length > 0 ? (
                                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                    {filteredProducts.map((product) => (
                                        <Link
                                            key={product.id}
                                            href={`/product/${product.id}`}
                                            className="group rounded-lg border border-border bg-card overflow-hidden hover:border-primary transition-all hover:shadow-lg"
                                        >
                                            <div className="relative aspect-square bg-muted">
                                                {product.image_url ? (
                                                    <Image
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover transition-transform group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
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
                                                <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
                                                <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                                                    {product.name}
                                                </h3>
                                                <p className="text-lg font-bold text-primary mb-3">
                                                    ₨ {product.price.toLocaleString()}
                                                </p>
                                                <div className="flex items-center justify-between text-sm text-muted-foreground pt-3 border-t border-border">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        <span className="truncate max-w-[100px]">{product.vendor?.city || product.location || 'Pakistan'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-card rounded-lg border border-border">
                                    <Package className="h-12 w-12 text-muted mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
                                    <p className="text-muted-foreground mb-4">Try adjusting your pricing or filters</p>
                                    <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
