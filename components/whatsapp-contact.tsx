'use client'

import { MessageCircle, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trackWhatsAppClick } from '@/lib/actions/analytics'
import { useTransition } from 'react'

interface WhatsAppContactProps {
  phoneNumber: string
  name?: string
  message?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline'
  className?: string
  showIcon?: boolean
  fullWidth?: boolean
  productId?: string // Optional product ID for analytics
}

/**
 * WhatsApp Contact Component
 * Creates a WhatsApp contact link with pre-filled message
 * Phone number should be in format: +1234567890 or 1234567890
 */
export default function WhatsAppContact({
  phoneNumber,
  name = 'Contact via WhatsApp',
  message = 'Hi, I am interested in your product.',
  size = 'md',
  variant = 'default',
  className = '',
  showIcon = true,
  fullWidth = false,
  productId
}: WhatsAppContactProps) {
  const [isPending, startTransition] = useTransition()

  // Format phone number - remove non-digits
  const cleanPhone = phoneNumber.replace(/\D/g, '')

  // Create WhatsApp URL with message
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  }

  const handleClick = () => {
      if (productId) {
          startTransition(() => {
              trackWhatsAppClick({ productId })
          })
      }
      window.open(whatsappUrl, '_blank')
  }

  return (
    <Button
      onClick={handleClick}
      className={`gap-2 bg-green-600 hover:bg-green-700 text-white ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      variant={variant === 'outline' ? 'outline' : 'default'} // Keep compatibility but usually green for WA
    >
        {showIcon && <MessageCircle className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} />}
        {name}
    </Button>
  )
}
