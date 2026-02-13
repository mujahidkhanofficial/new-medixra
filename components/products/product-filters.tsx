'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'

interface ProductFiltersProps {
    categories: string[]
    conditions: string[]
    locations: string[]
    specialties: string[]
    selectedCategory: string
    selectedCondition: string
    selectedLocation: string
    selectedSpeciality: string
    priceRange: [number, number]
    onCategoryChange: (category: string) => void
    onConditionChange: (condition: string) => void
    onLocationChange: (location: string) => void
    onSpecialityChange: (speciality: string) => void
    onPriceRangeChange: (range: [number, number]) => void
    onClearFilters: () => void
}

export function ProductFilters({
    categories,
    conditions,
    locations,
    specialties,
    selectedCategory,
    selectedCondition,
    selectedLocation,
    selectedSpeciality,
    priceRange,
    onCategoryChange,
    onConditionChange,
    onLocationChange,
    onSpecialityChange,
    onPriceRangeChange,
    onClearFilters,
}: ProductFiltersProps) {
    const [localPrice, setLocalPrice] = useState(priceRange)

    // Sync local price state with prop
    useEffect(() => {
        setLocalPrice(priceRange)
    }, [priceRange])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Filters</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                    className="h-8 px-2 text-muted-foreground hover:text-primary"
                >
                    Clear all
                </Button>
            </div>

            <Separator />

            <Accordion type="multiple" defaultValue={['category', 'price', 'condition', 'location', 'speciality']} className="w-full">
                {/* Categories */}
                <AccordionItem value="category">
                    <AccordionTrigger>Category</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2 pt-2">
                            <select
                                value={selectedCategory}
                                onChange={(e) => onCategoryChange(e.target.value)}
                                className="w-full h-10 px-4 rounded-full bg-secondary/50 text-sm focus:outline-none focus:ring-0"
                            >
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Price Range */}
                <AccordionItem value="price">
                    <AccordionTrigger>Price Range</AccordionTrigger>
                    <AccordionContent>
                        <div className="pt-2 px-1">
                            <Slider
                                defaultValue={[0, 1000000]}
                                max={1000000}
                                step={5000}
                                value={localPrice}
                                onValueChange={(val) => setLocalPrice(val as [number, number])}
                                onValueCommit={(val) => onPriceRangeChange(val as [number, number])}
                                className="mb-4"
                            />
                            <div className="flex items-center justify-between text-sm">
                                <span className="border rounded px-2 py-1">₨ {localPrice[0].toLocaleString()}</span>
                                <span className="text-muted-foreground">-</span>
                                <span className="border rounded px-2 py-1">₨ {localPrice[1].toLocaleString()}</span>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Condition */}
                <AccordionItem value="condition">
                    <AccordionTrigger>Condition</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2">
                            {conditions.map((condition) => (
                                <div key={condition} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`cond-${condition}`}
                                        checked={selectedCondition === condition}
                                        onCheckedChange={() => onConditionChange(condition)}
                                    />
                                    <label
                                        htmlFor={`cond-${condition}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {condition}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Speciality */}
                <AccordionItem value="speciality">
                    <AccordionTrigger>Speciality</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2 pt-2">
                            <select
                                value={selectedSpeciality}
                                onChange={(e) => onSpecialityChange(e.target.value)}
                                className="w-full h-10 px-4 rounded-full bg-secondary/50 text-sm focus:outline-none focus:ring-0"
                            >
                                {specialties.map((speciality) => (
                                    <option key={speciality} value={speciality}>
                                        {speciality}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Location */}
                <AccordionItem value="location">
                    <AccordionTrigger>Location</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2 pt-2">
                            <select
                                value={selectedLocation}
                                onChange={(e) => onLocationChange(e.target.value)}
                                className="w-full h-10 px-4 rounded-full bg-secondary/50 text-sm focus:outline-none focus:ring-0"
                            >
                                {locations.map((location) => (
                                    <option key={location} value={location}>
                                        {location}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}
