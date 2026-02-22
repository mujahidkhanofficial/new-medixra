import Link from 'next/link'
import { Package, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { getProducts } from '@/lib/actions/products'
import { ProductFiltersClient } from '@/components/products/product-filters-client'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { createClient } from '@/lib/supabase/server'
import { getSavedProductIds } from '@/lib/actions/saved-items'
import { ProductCard } from '@/components/product/product-card'
import type { Metadata } from 'next'

// Force dynamic rendering since we depend on searchParams
export const dynamic = 'force-dynamic'

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const params = await searchParams;
    const query = typeof params.q === 'string' ? params.q : undefined;
    const category = typeof params.category === 'string' ? params.category : undefined;

    let titleText = 'All Medical Equipment | Direct Medical Equipment Marketplace';
    let descriptionText = 'Browse verified new, refurbished, and pre-owned medical equipment directly from trusted vendors across Pakistan. Zero commissions.';

    if (query) {
        titleText = `Buy ${query} in Pakistan | Medixra Marketplace`;
        descriptionText = `Find the best prices for ${query} from verified medical equipment vendors. Connect directly on WhatsApp with zero markup.`;
    } else if (category) {
        titleText = `${category} Equipment | Direct Medical Equipment Network`;
        descriptionText = `Explore our comprehensive catalog of ${category} equipment. Connect with certified vendors and technicians instantly.`;
    }

    return {
        title: titleText,
        description: descriptionText,
        openGraph: {
            title: titleText,
            description: descriptionText,
            type: 'website',
            siteName: 'Medixra',
            locale: 'en_PK'
        }
    }
}

export default async function ProductsPage({ searchParams }: Props) {
    const params = await searchParams;

    // Parse search params
    const query = typeof params.q === 'string' ? params.q : undefined
    const category = typeof params.category === 'string' ? params.category : undefined
    const city = typeof params.city === 'string' ? params.city : undefined
    const minPrice = typeof params.minPrice === 'string' ? Number(params.minPrice) : undefined
    const maxPrice = typeof params.maxPrice === 'string' ? Number(params.maxPrice) : undefined
    const condition = typeof params.condition === 'string' ? params.condition : undefined
    const specialty = typeof params.speciality === 'string' ? params.speciality : undefined

    const products = await getProducts({
        query,
        category,
        city,
        minPrice,
        maxPrice,
        condition
    })

    const supabase = await createClient()
    let user = null
    if (supabase) {
        const { data } = await supabase.auth.getUser()
        user = data.user
    }
    const savedIds = user ? await getSavedProductIds(user.id) : []

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navigation />

            <main className="flex-1">
                <div className="mx-auto max-w-screen-2xl px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">Medical Equipment</h1>
                        <p className="text-muted-foreground">Browse verified medical equipment from trusted vendors across Pakistan</p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Filters (Desktop) */}
                        <aside className="hidden lg:block w-64 shrink-0">
                            <div className="sticky top-24">
                                <ProductFiltersClient />
                            </div>
                        </aside>

                        {/* Main Content */}
                        <div className="flex-1">
                            {/* Mobile Filters Trigger */}
                            <div className="lg:hidden mb-6 sticky top-[64px] z-30 bg-background/95 backdrop-blur py-2">
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" className="w-full gap-2">
                                            <SlidersHorizontal className="h-4 w-4" />
                                            Filters & Search
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                                        <SheetHeader className="mb-6">
                                            <SheetTitle>Filters</SheetTitle>
                                        </SheetHeader>
                                        <ProductFiltersClient />
                                    </SheetContent>
                                </Sheet>
                            </div>

                            {/* Search Query Display */}
                            {query && (
                                <div className="mb-4">
                                    <p className="text-muted-foreground">Search results for "<span className="font-semibold text-foreground">{query}</span>"</p>
                                </div>
                            )}

                            {/* Results Count */}
                            <div className="flex items-center justify-between mb-6">
                                <p className="text-sm text-muted-foreground">
                                    Showing <strong className="text-foreground">{products.length}</strong> products
                                </p>
                            </div>

                            {/* Products Grid */}
                            {products.length > 0 ? (
                                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                    {products.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            isSaved={savedIds.includes(product.id)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-card rounded-lg border border-border">
                                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
                                    <p className="text-muted-foreground mb-4">Try adjusting your filters or search query</p>
                                    <Button variant="outline" asChild><Link href="/products">Clear Filters</Link></Button>
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
