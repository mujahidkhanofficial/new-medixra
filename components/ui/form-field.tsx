'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/ui/form-error'

interface FormFieldProps {
  label?: string
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string
  helpText?: string
}

export function FormField({
  label,
  error,
  required = false,
  children,
  className = 'space-y-2',
  helpText,
}: FormFieldProps) {
  return (
    <div className={className}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {children}
      {error && <FieldError message={error} />}
      {helpText && !error && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
    </div>
  )
}
