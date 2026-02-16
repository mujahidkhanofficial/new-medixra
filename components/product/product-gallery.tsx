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
            <div className="relative group overflow-hidden bg-gray-50/50 aspect-4/3 flex items-center justify-center">
                <div ref={mainEmblaRef} className="overflow-hidden w-full h-full">
                    <div className="flex h-full">
                        {images.map((img) => (
                            <div key={img.id} className="relative flex-[0_0_100%] h-full min-w-0">
                                <Image
                                    src={img.url}
                                    alt={productName}
                                    fill
                                    className="object-contain p-2"
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
                            className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all rounded-full shadow-lg bg-white/90 hover:bg-white border hover:scale-105"
                            onClick={() => mainEmblaApi?.scrollPrev()}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all rounded-full shadow-lg bg-white/90 hover:bg-white border hover:scale-105"
                            onClick={() => mainEmblaApi?.scrollNext()}
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="overflow-hidden px-1" ref={thumbEmblaRef}>
                    <div className="flex gap-3">
                        {images.map((img, index) => (
                            <button
                                key={img.id}
                                onClick={() => onThumbClick(index)}
                                className={cn(
                                    "relative flex-[0_0_16%] aspect-square rounded-lg overflow-hidden border transition-all",
                                    index === selectedIndex
                                        ? "border-primary ring-2 ring-primary/20 ring-offset-1"
                                        : "border-transparent opacity-60 hover:opacity-100 hover:border-gray-200"
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
