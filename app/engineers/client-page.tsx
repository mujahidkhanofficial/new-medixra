'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, MapPin, CheckCircle, Award, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { incrementEngineerViews, incrementEngineerWhatsappClicks } from '@/lib/actions/engineer'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export interface Engineer {
    id: string
    name: string
    city: string
    phone: string
    speciality: string
    specialitiesList: string[]
    experience: string
    verified: boolean
    rating: number
    reviews: number
    responseTime: string
    certifications: string[]
    avatarUrl?: string
    image: string
    whatsapp: string
}

export default function EngineersClientPage({ initialEngineers }: { initialEngineers: any[] }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCity, setSelectedCity] = useState('all')
    const [viewedEngs, setViewedEngs] = useState<Record<string, boolean>>({})

    // Extract unique cities from engineers + default 'all'
    const cities = useMemo(() => {
        const uniqueCities = new Set(initialEngineers.map(t => t.city).filter(Boolean))
        return ['all', ...Array.from(uniqueCities).sort()]
    }, [initialEngineers])

    const filteredEngineers = initialEngineers.filter((eng) => {
        const matchesSearch = eng.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            eng.speciality.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCity = selectedCity === 'all' || eng.city === selectedCity
        return matchesSearch && matchesCity
    })

    // Track views when engineers appear in the filtered list
    useEffect(() => {
        const sessionViewed = JSON.parse(sessionStorage.getItem('viewedEngs') || '{}')
        let hasNewViews = false

        filteredEngineers.forEach(eng => {
            if (!sessionViewed[eng.id]) {
                sessionViewed[eng.id] = true
                hasNewViews = true
                // Fire and forget server action
                incrementEngineerViews(eng.id).catch(console.error)
            }
        })

        if (hasNewViews) {
            sessionStorage.setItem('viewedEngs', JSON.stringify(sessionViewed))
            setViewedEngs(sessionViewed)
        }
    }, [filteredEngineers])

    return (
        <div className="flex-1">
            {/* Hero Section */}
            <section className="border-b border-border bg-linear-to-b from-primary/5 to-background py-12 md:py-16">
                <div className="mx-auto max-w-screen-2xl px-4">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-foreground md:text-4xl mb-2">Equipment Repair & Maintenance</h1>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Connect with certified engineers for professional equipment repair, maintenance, and calibration services
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="mx-auto max-w-2xl">
                        <div className="flex gap-2 rounded-lg border border-border bg-card p-2 shadow-lg">
                            <Search className="ml-3 h-5 w-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by engineer name or specialty..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="mx-auto max-w-screen-2xl px-4 py-12">
                {/* Filters */}
                <div className="mb-8">
                    <h3 className="font-semibold text-foreground mb-4">Filter by City</h3>
                    <div className="flex flex-wrap gap-2">
                        {cities.map((city) => (
                            <button
                                key={city}
                                onClick={() => setSelectedCity(city)}
                                className={`px-4 py-2 rounded-full font-medium transition-colors text-sm ${selectedCity === city
                                    ? 'bg-primary text-primary-foreground'
                                    : 'border border-border bg-background text-foreground hover:border-primary'
                                    }`}
                            >
                                {city === 'all' ? 'All Cities' : city}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Engineers Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredEngineers.map((eng) => (
                        <div
                            key={eng.id}
                            className="group flex flex-col rounded-xl border border-border bg-card hover:border-primary/50 transition-all hover:shadow-md overflow-hidden relative"
                        >
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex items-start gap-3 mb-4">
                                    <Avatar className="h-12 w-12 border-2 border-primary/10">
                                        <AvatarImage src={eng.avatarUrl} alt={eng.name} />
                                        <AvatarFallback className="bg-primary/5 text-primary text-sm font-bold">
                                            {eng.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <h3 className="font-bold text-foreground line-clamp-1">{eng.name}</h3>
                                            {eng.verified && (
                                                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {eng.city || 'Not specified'}
                                        </p>
                                    </div>
                                </div>

                                {/* Specialities Badges */}
                                <div className="mb-4 flex-1">
                                    <div className="flex flex-wrap gap-1.5">
                                        {eng.specialitiesList?.slice(0, 3).map((s: string, i: number) => (
                                            <Badge key={i} variant="secondary" className="font-medium bg-primary/10 text-primary hover:bg-primary/20 text-[10px] px-2 py-0.5">
                                                {s}
                                            </Badge>
                                        ))}
                                        {eng.specialitiesList?.length > 3 && (
                                            <Badge variant="outline" className="font-medium text-[10px] px-2 py-0.5">
                                                +{eng.specialitiesList.length - 3} more
                                            </Badge>
                                        )}
                                        {(!eng.specialitiesList || eng.specialitiesList.length === 0) && (
                                            <span className="text-xs text-muted-foreground italic">No specialties listed</span>
                                        )}
                                    </div>
                                </div>

                                {/* Info Grid */}
                                <div className="grid grid-cols-2 gap-2 mb-5 p-3 rounded-lg bg-muted/40 border border-border/50">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Experience</p>
                                        <p className="text-xs text-foreground font-semibold flex items-center gap-1">
                                            <Award className="h-3 w-3 text-primary/70" />
                                            {eng.experience}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Status</p>
                                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                                            <Zap className="h-3 w-3" />
                                            Available
                                        </span>
                                    </div>
                                </div>


                                <Button
                                    onClick={() => {
                                        incrementEngineerWhatsappClicks(eng.id).catch(console.error)
                                        const message = encodeURIComponent(`Hi! I need repair/maintenance service for my medical equipment. Found you on Pakmedinex.`)
                                        if (eng.whatsapp) {
                                            window.open(`https://wa.me/${eng.whatsapp}?text=${message}`, '_blank')
                                        } else {
                                            alert('This engineer has not provided a contact number.')
                                        }
                                    }}
                                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white gap-2"
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    Contact on WhatsApp
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* No Results */}
                {filteredEngineers.length === 0 && (
                    <div className="text-center py-16">
                        <Search className="h-12 w-12 text-muted mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No engineers found</h3>
                        <p className="text-muted-foreground">Try adjusting your search criteria</p>
                    </div>
                )}
            </div>
        </div>
    )
}
