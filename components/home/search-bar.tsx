'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function HomeSearchBar() {
    const router = useRouter()
    const [query, setQuery] = useState('')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            router.push(`/products?q=${encodeURIComponent(query.trim())}`)
        }
    }

    return (
        <form onSubmit={handleSearch} className="w-full relative group">
            <div className="absolute -inset-0.5 bg-linear-to-r from-primary/30 to-primary/10 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500" />
            <div className="relative flex items-center gap-2 rounded-full border border-border/80 bg-background/95 backdrop-blur-xl p-2 sm:p-2.5 shadow-2xl transition-all duration-300 hover:border-primary/50 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10">
                <Search className="ml-4 h-5 w-5 text-muted-foreground shrink-0" />
                <input
                    type="text"
                    placeholder="Search equipment, vendors, or services..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-transparent px-2 py-2 text-base outline-none text-foreground placeholder-muted-foreground font-medium w-full"
                />
                <Button type="submit" size="lg" className="rounded-full px-8 font-semibold shrink-0 shadow-md">
                    Search
                </Button>
            </div>
        </form>
    )
}
