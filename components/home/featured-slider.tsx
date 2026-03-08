"use client"

import * as React from "react"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { ProductCard } from "@/components/product/product-card"
import Autoplay from "embla-carousel-autoplay"

interface FeaturedSliderProps {
    products: any[]
    savedIds: string[]
}

export function FeaturedSlider({ products, savedIds }: FeaturedSliderProps) {
    if (!products || products.length === 0) return null

    // Embla's "loop" requires more items in the array than what fits on the screen.
    // If we only have 4 products but show 4 on desktop, it won't scroll.
    // Solution: Artificially duplicate the array until we have at least 8 items.
    let displayProducts = [...products]
    if (products.length > 0 && products.length < 8) {
        const duplicationFactor = Math.ceil(8 / products.length)
        displayProducts = Array(duplicationFactor).fill(products).flat()
    }

    const plugin = React.useRef(
        Autoplay({ delay: 4000, stopOnInteraction: false })
    )

    return (
        <div className="relative w-full max-w-full group/slider px-2 md:px-12">
            <Carousel
                opts={{
                    align: "start",
                    loop: true,
                }}
                // @ts-ignore - Embla plugin signature mismatch upstream
                plugins={[plugin.current]}
                onMouseEnter={() => plugin.current.stop()}
                onMouseLeave={() => plugin.current.play()}
                className="w-full"
            >
                <CarouselContent className="-ml-2 md:-ml-4">
                    {displayProducts.map((product, index) => (
                        <CarouselItem key={`${product.id}-${index}`} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                            <div className="h-full py-2">
                                <ProductCard
                                    product={product}
                                    isSaved={savedIds.includes(product.id)}
                                />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                {/* Navigation Buttons (Hidden on mobile, appear on hover for Desktop) */}
                <div className="hidden lg:block opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300">
                    <CarouselPrevious className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 border-white/20 hover:bg-primary hover:text-white" />
                    <CarouselNext className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 border-white/20 hover:bg-primary hover:text-white" />
                </div>
            </Carousel>
        </div>
    )
}
