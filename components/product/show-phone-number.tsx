'use client'

import { useState } from 'react'
import { Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShowPhoneNumberProps {
    phoneNumber?: string
}

export function ShowPhoneNumber({ phoneNumber }: ShowPhoneNumberProps) {
    const [revealed, setRevealed] = useState(false)

    if (!phoneNumber) {
        return (
            <Button variant="outline" disabled className="w-full h-12 text-base font-medium border-gray-200 text-gray-400">
                <Phone className="mr-2 h-4 w-4" />
                Phone Unavailable
            </Button>
        )
    }

    if (revealed) {
        return (
            <Button
                variant="outline"
                className="w-full h-12 text-base font-medium border-primary text-primary hover:bg-primary/5"
                asChild
            >
                <a href={`tel:${phoneNumber}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    {phoneNumber}
                </a>
            </Button>
        )
    }

    return (
        <Button
            variant="outline"
            onClick={() => setRevealed(true)}
            className="w-full h-12 text-base font-medium border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
        >
            <Phone className="mr-2 h-4 w-4" />
            Show Phone Number
        </Button>
    )
}
