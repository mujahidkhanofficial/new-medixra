'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ProductGalleryProps {
    images: { id: string; url: string }[]
    productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
    const [mainEmblaRef, mainEmblaApi] = useEmblaCarousel()
    const [thumbEmblaRef, thumbEmblaApi] = useEmblaCarousel({
        containScroll: 'keepSnaps',
        dragFree: true
    })
    const [selectedIndex, setSelectedIndex] = useState(0)

    const onSelect = useCallback(() => {
        if (!mainEmblaApi || !thumbEmblaApi) return
        setSelectedIndex(mainEmblaApi.selectedScrollSnap())
        thumbEmblaApi.scrollTo(mainEmblaApi.selectedScrollSnap())
    }, [mainEmblaApi, thumbEmblaApi])

    useEffect(() => {
        if (!mainEmblaApi) return
        onSelect()
        mainEmblaApi.on('select', onSelect)
        mainEmblaApi.on('reInit', onSelect)
    }, [mainEmblaApi, onSelect])

    const onThumbClick = useCallback(
        (index: number) => {
            if (!mainEmblaApi) return
            mainEmblaApi.scrollTo(index)
        },
        [mainEmblaApi]
    )

    if (!images || images.length === 0) {
        return (
            <div className="aspect-square bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
                No Images Available
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Main Carousel */}
            <div className="relative group overflow-hidden rounded-xl border border-border bg-muted/30">
                <div ref={mainEmblaRef} className="overflow-hidden">
                    <div className="flex">
                        {images.map((img) => (
                            <div key={img.id} className="relative flex-[0_0_100%] aspect-square min-w-0">
                                <Image
                                    src={img.url}
                                    alt={productName}
                                    fill
                                    className="object-contain"
                                    priority={true}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Buttons */}
                {images.length > 1 && (
                    <>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full shadow-lg"
                            onClick={() => mainEmblaApi?.scrollPrev()}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full shadow-lg"
                            onClick={() => mainEmblaApi?.scrollNext()}
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="overflow-hidden" ref={thumbEmblaRef}>
                    <div className="flex gap-3">
                        {images.map((img, index) => (
                            <button
                                key={img.id}
                                onClick={() => onThumbClick(index)}
                                className={cn(
                                    "relative flex-[0_0_20%] aspect-square rounded-lg overflow-hidden border-2 transition-all",
                                    index === selectedIndex
                                        ? "border-primary ring-2 ring-primary/20"
                                        : "border-transparent opacity-70 hover:opacity-100"
                                )}
                            >
                                <Image
                                    src={img.url}
                                    alt="Thumbnail"
                                    fill
                                    className="object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
