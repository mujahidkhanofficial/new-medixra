import React from 'react'
import Link from 'next/link'
import { ShieldCheck, MapPin, Calendar, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'

interface TrustSignalsProps {
    vendor: {
        id: string
        name: string
        joinedAt?: string
        city?: string
        phone?: string
        isVerified?: boolean
    }
}

export function TrustSignals({ vendor }: TrustSignalsProps) {
    const joinedDate = vendor.joinedAt ? format(new Date(vendor.joinedAt), 'MMM yyyy') : 'Unknown'

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-sm font-medium text-muted-foreground mb-4">Sold by</p>

                <div className="flex items-start gap-4 mb-4">
                    <Link href={`/shop/${vendor.id}`} className="hover:opacity-80 transition-opacity">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                            {vendor.name.charAt(0).toUpperCase()}
                        </div>
                    </Link>
                    <div>
                        <Link href={`/shop/${vendor.id}`} className="hover:underline">
                            <h3 className="font-bold text-lg flex items-center gap-1.5">
                                {vendor.name}
                                {vendor.isVerified && (
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 fill-blue-500/10" />
                                )}
                            </h3>
                        </Link>
                        <div className="flex flex-col gap-1 mt-1">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Member since {joinedDate}</span>
                            </div>
                            {vendor.city && (
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span>{vendor.city}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {vendor.phone && (
                    <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-3 py-2 rounded-lg border border-green-200 dark:border-green-900">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="font-medium">Phone Number Verified</span>
                    </div>
                )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-200 dark:border-blue-900 flex gap-3">
                <ShieldCheck className="h-5 w-5 text-blue-700 dark:text-blue-400 flex-shrink-0" />
                <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Safety Tips</h4>
                    <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                        1. Meet in a safe, public place.<br />
                        2. Check the item before paying.<br />
                        3. Don't pay in advance for delivery.
                    </p>
                </div>
            </div>
        </div>
    )
}
