'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { ProductFilters } from './product-filters'

// Re-export constants to share with server component if needed, 
// but for now we hardcode them here or pass them as props.
import {
    PRODUCT_CATEGORIES,
    CONDITIONS,
    CITIES,
    SPECIALTIES
} from '@/lib/constants'

const categories = ['All Categories', ...PRODUCT_CATEGORIES]
const conditions = ['All', ...CONDITIONS]
const locations = ['All Pakistan', ...CITIES]
const specialties = ['All Specialties', ...SPECIALTIES]

export function ProductFiltersClient() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Create Query String Helper
    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            if (value && value !== 'All' && value !== 'All Categories' && value !== 'All Pakistan' && value !== 'All Specialties') {
                params.set(name, value)
            } else {
                params.delete(name)
            }
            return params.toString()
        },
        [searchParams]
    )

    // State derived from URL
    const selectedCategory = searchParams.get('category') || 'All Categories'
    const selectedCondition = searchParams.get('condition') || 'All'
    const selectedLocation = searchParams.get('city') || 'All Pakistan'
    const selectedSpeciality = searchParams.get('speciality') || 'All Specialties'

    // Price is a bit trickier as it's a range
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : 0
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 1000000
    const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice])

    // Update local price state when URL changes (e.g. clear filters)
    useEffect(() => {
        const min = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : 0
        const max = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 1000000
        setPriceRange([min, max])
    }, [searchParams])

    const updateFilter = (name: string, value: string) => {
        router.push(`/products?${createQueryString(name, value)}`, { scroll: false })
    }

    const updatePrice = (range: [number, number]) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('minPrice', range[0].toString())
        params.set('maxPrice', range[1].toString())
        router.push(`/products?${params.toString()}`, { scroll: false })
    }

    const clearFilters = () => {
        // preserve query if needed, or clear everything
        const params = new URLSearchParams()
        if (searchParams.get('q')) {
            params.set('q', searchParams.get('q')!)
        }
        router.push(`/products?${params.toString()}`)
    }

    return (
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
            onCategoryChange={(val) => updateFilter('category', val)}
            onConditionChange={(val) => updateFilter('condition', val)}
            onLocationChange={(val) => updateFilter('city', val)}
            onSpecialityChange={(val) => updateFilter('speciality', val)}
            onPriceRangeChange={updatePrice}
            onClearFilters={clearFilters}
        />
    )
}
