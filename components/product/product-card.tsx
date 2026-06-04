import Link from 'next/link'
import Image from 'next/image'
import { Package } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { SaveButton } from './save-button'

interface ProductCardProps {
    product: {
        id: string
        name: string
        price: number | string
        currency?: string | null
        image_url?: string | null
        location?: string | null
        created_at?: string | Date
        condition?: string | null
        category?: string | null
        speciality?: string | null
        vendor_name?: string | null
        tags?: string[] | null
    }
    isSaved: boolean
}

export function ProductCard({ product, isSaved }: ProductCardProps) {
    const timeAgo = product.created_at
        ? formatDistanceToNow(new Date(product.created_at), { addSuffix: true })
        : ''

    const priceDisplay = typeof product.price === 'number'
        ? `${product.currency || 'Rs'} ${product.price.toLocaleString()}`
        : product.price

    // Extract all tags (categories, specialities, tags)
    const displayTags: string[] = []
    const addTags = (raw: string | string[] | null | undefined) => {
        if (!raw) return
        if (Array.isArray(raw)) {
            raw.forEach(t => { if (t && !displayTags.includes(t)) displayTags.push(t) })
            return
        }
        try {
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed)) {
                parsed.forEach(t => { if (t && !displayTags.includes(t)) displayTags.push(t) })
            } else if (typeof parsed === 'string' && !displayTags.includes(parsed)) {
                displayTags.push(parsed)
            }
        } catch {
            if (!displayTags.includes(raw)) displayTags.push(raw)
        }
    }

    addTags(product.category)
    addTags(product.speciality)
    addTags(product.tags)

    // Show up to 3 tags on the card to avoid layout break
    const visibleTags = displayTags.slice(0, 3)
    const extraTagsCount = displayTags.length - visibleTags.length

    return (
        <div className="group flex flex-col h-full bg-card rounded-lg overflow-hidden border border-border hover:shadow-md transition-shadow">
            {/* Image Container */}
            <div className="relative h-48 w-full bg-muted">
                <Link href={`/product/${product.id}`} className="block h-full w-full">
                    {product.image_url ? (
                        <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Package className="h-10 w-10" />
                        </div>
                    )}
                </Link>
                {/* Condition Tag */}
                {product.condition && (
                    <div className="absolute top-2 left-2 pointer-events-none">
                        <span className="bg-background/90 backdrop-blur text-xs font-semibold px-2 py-1 rounded shadow-sm border border-border">
                            {product.condition}
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3 flex flex-col flex-1 gap-1">
                {/* Price & Heart */}
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-primary truncate leading-tight" suppressHydrationWarning>
                        {priceDisplay}
                    </h3>
                    <SaveButton
                        productId={product.id}
                        initialIsSaved={isSaved}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 -mt-1 -mr-1 hover:bg-transparent"
                        iconClassName="h-5 w-5"
                    />
                </div>

                {/* Visual Tags */}
                <div className="flex flex-wrap gap-1.5 mt-1 mb-0.5">
                    {visibleTags.length > 0 ? (
                        visibleTags.map(tag => (
                            <span key={tag} className="text-[10px] font-semibold tracking-wide text-primary bg-primary/10 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                                {tag}
                            </span>
                        ))
                    ) : (
                        <span className="text-[10px] font-semibold tracking-wide text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            Medical Equipment
                        </span>
                    )}
                    {extraTagsCount > 0 && (
                        <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            +{extraTagsCount}
                        </span>
                    )}
                </div>

                {/* Title */}
                <Link href={`/product/${product.id}`} className="block group-hover:text-primary transition-colors">
                    <h4 className="text-sm font-medium text-foreground line-clamp-2" title={product.name}>
                        {product.name}
                    </h4>
                </Link>

                {/* Location & Time */}
                <div className="mt-auto pt-2 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="truncate" suppressHydrationWarning>{product.location || 'Pakistan'}</span>
                    </div>
                    {timeAgo && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span className="truncate" suppressHydrationWarning>{timeAgo}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
