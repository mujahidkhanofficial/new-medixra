'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Eye, MessageCircle } from 'lucide-react'

interface WhatsappUnmaskProps {
    phoneNumber: string | null | undefined
    defaultText?: string
}

export default function WhatsappUnmask({ phoneNumber, defaultText }: WhatsappUnmaskProps) {
    const [isUnmasked, setIsUnmasked] = useState(false)

    if (!phoneNumber) {
        return (
            <div className="text-sm text-gray-400 italic font-medium px-4 py-2 bg-gray-50 rounded-lg">
                No phone number provided
            </div>
        )
    }

    if (!isUnmasked) {
        return (
            <Button
                onClick={() => setIsUnmasked(true)}
                className="bg-gray-900 hover:bg-gray-800 text-white shadow-sm flex items-center gap-2 px-6"
            >
                <Eye className="h-4 w-4" /> Unmask Mobile Number
            </Button>
        )
    }

    // Clean number for WhatsApp API (remove +, spaces, dashes)
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '')
    const whatsappUrl = `https://wa.me/${cleanNumber}${defaultText ? `?text=${encodeURIComponent(defaultText)}` : ''}`

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-md shadow-sm transition-colors"
        >
            <MessageCircle className="h-5 w-5" />
            Chat: {phoneNumber}
        </a>
    )
}
