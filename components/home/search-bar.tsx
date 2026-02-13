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
        <form onSubmit={handleSearch} className="mx-auto max-w-2xl">
            <div className="flex gap-2 rounded-full border border-border bg-card p-2 shadow-lg">
                <Search className="ml-3 h-5 w-5 text-muted-foreground self-center" />
                <input
                    type="text"
                    placeholder="Search equipment, vendors, or services..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground p-2"
                />
                <Button type="submit" className="font-medium">
                    Search
                </Button>
            </div>
        </form>
    )
}
