'use client'

import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormErrorProps {
  message?: string
  className?: string
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-md bg-destructive/10 text-destructive text-sm',
        className
      )}
      role="alert"
    >
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

interface FieldErrorProps {
  message?: string | string[]
}

export function FieldError({ message }: FieldErrorProps) {
  if (!message || (Array.isArray(message) && message.length === 0)) return null

  if (Array.isArray(message)) {
    return (
      <div className="mt-1.5 space-y-1">
        {message.map((msg, i) => (
          <p key={i} className="text-xs text-destructive flex items-start gap-1.5 leading-snug">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>{msg}</span>
          </p>
        ))}
      </div>
    )
  }

  return (
    <p className="text-xs text-destructive mt-1.5 flex items-start gap-1.5 leading-snug">
      <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
      <span>{message}</span>
    </p>
  )
}
