'use client'

import { useEffect, useRef } from 'react'
import { incrementProductView } from '@/lib/actions/analytics'

export function ViewTracker({ productId }: { productId: string }) {
    const hasViewedQuery = useRef(false)

    useEffect(() => {
        if (hasViewedQuery.current) return

        const trackView = async () => {
            // Basic strict mode guard
            hasViewedQuery.current = true
            await incrementProductView(productId)
        }

        trackView()
    }, [productId])

    return null
}
