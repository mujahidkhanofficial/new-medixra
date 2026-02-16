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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Sold By</h3>

            <Link href={`/shop/${vendor.id}`} className="flex items-center gap-4 group mb-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                    {vendor.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 truncate group-hover:text-primary transition-colors flex items-center gap-1.5">
                        {vendor.name}
                        {vendor.isVerified && <CheckCircle2 className="h-4 w-4 text-blue-500 fill-blue-50/50" />}
                    </h4>
                    <div className="flex flex-wrap items-center text-xs text-muted-foreground gap-2 mt-1">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Since {joinedDate}
                        </span>
                        {vendor.city && (
                            <>
                                <span className="text-gray-300">•</span>
                                <span className="flex items-center gap-1 truncate" title="Seller Location">
                                    <MapPin className="h-3 w-3" /> From {vendor.city}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </Link>

            <div className="space-y-3 pt-4 border-t border-gray-100">
                {vendor.phone && (
                    <div className="flex items-center gap-2.5 text-xs text-green-700 bg-green-50 px-3 py-2.5 rounded-lg border border-green-100/50">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="font-medium">Identity Verified</span>
                    </div>
                )}

                <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-gray-50/50 border border-gray-100 text-xs text-gray-600">
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        Safe Trading Tips
                    </div>
                    <p className="leading-relaxed pl-3.5 opacity-80">
                        Meet in public, inspect item, don't pay in advance.
                    </p>
                </div>
            </div>
        </div>
    )
}
