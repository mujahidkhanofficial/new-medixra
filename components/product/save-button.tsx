'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toggleSaveProduct } from '@/lib/actions/saved-items'
import { toast } from 'sonner'
import { useAuth } from '@/components/providers/auth-provider'
import { useRouter } from 'next/navigation'

interface SaveButtonProps {
    productId: string
    initialIsSaved: boolean
    className?: string
    iconClassName?: string
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
}

export function SaveButton({
    productId,
    initialIsSaved,
    className,
    iconClassName,
    variant = "outline",
    size = "icon"
}: SaveButtonProps) {
    const [isSaved, setIsSaved] = useState(initialIsSaved)
    const [isLoading, setIsLoading] = useState(false)
    const { user } = useAuth()
    const router = useRouter()

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault() // Prevent navigation if used inside a Link
        e.stopPropagation()

        if (!user) {
            toast.error('Please login to save items')
            router.push('/login')
            return
        }

        setIsLoading(true)
        // Optimistic UI
        const newState = !isSaved
        setIsSaved(newState)

        try {
            await toggleSaveProduct(user.id, productId, !newState) // Passing OLD state to action logic if needed, but action toggles based on current DB state mostly. Wait.
            // My action `toggleSaveProduct` takes `isSaved` as boolean. 
            // In step 612: `if (isSaved) { delete } else { insert }`
            // So I should pass the PREVIOUS state (true -> delete, false -> insert).
            // Yes, `!newState` is the previous state. Correct.

            toast.success(newState ? 'Item saved' : 'Item removed')
        } catch (error) {
            setIsSaved(!newState) // Revert
            toast.error('Failed to update')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            variant={variant}
            size={size}
            className={className || "h-12 w-12 bg-transparent hover:bg-muted"}
            onClick={handleToggle}
            disabled={isLoading}
            aria-label={isSaved ? "Unsave product" : "Save product"}
        >
            <Heart className={`transition-colors ${isSaved ? 'fill-primary text-primary' : 'text-muted-foreground'} ${iconClassName || 'h-5 w-5'}`} />
        </Button>
    )
}
