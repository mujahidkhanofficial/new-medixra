import { ReactNode } from 'react'
import { Star } from 'lucide-react'

interface DashboardHeaderProps {
    title: string
    subtitle?: string
    rating?: number
    reviewsCount?: number
    joinDate?: string
    location?: string
    actions?: ReactNode
    contactChildren?: ReactNode
}

export function DashboardHeader({
    title,
    subtitle,
    rating,
    reviewsCount,
    joinDate,
    location,
    actions,
    contactChildren
}: DashboardHeaderProps) {
    return (
        <div className="mb-8 rounded-lg border border-border bg-card p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>

                    {/* Optional Rating section for Vendors */}
                    {rating !== undefined && (
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-4 w-4 ${i < rating ? 'fill-accent text-accent' : 'text-muted'}`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-muted-foreground">({reviewsCount || 0} reviews)</span>
                        </div>
                    )}

                    {/* Subtitle / User meta */}
                    {subtitle && (
                        <p className="text-muted-foreground mb-4">
                            {subtitle}
                        </p>
                    )}

                    {/* Vendor specific meta */}
                    {(location || joinDate) && (
                        <p className="text-sm text-muted-foreground mb-4">
                            {location && `${location} • `}
                            {joinDate && `Member since ${joinDate}`}
                        </p>
                    )}

                    {/* Optional Contact info for Vendors */}
                    {contactChildren && (
                        <div className="space-y-2 mb-4">
                            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Contact Information</p>
                            {contactChildren}
                        </div>
                    )}
                </div>

                {/* Action Buttons (Edit Profile, Add Product, WhatsApp, etc) */}
                {actions && (
                    <div className="flex flex-col sm:flex-row gap-3">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    )
}
