/**
 * Common type definitions for forms and components
 */

export interface FormFieldError {
  field: string
  message: string
}

export interface ApiResponse<T = void> {
  success: boolean
  data?: T
  error?: string
  errors?: FormFieldError[]
}

export interface AuthResponse {
  success: boolean
  user?: {
    id: string
    email: string
    role: 'buyer' | 'vendor' | 'admin'
  }
  error?: string
}

export interface PaginationParams {
  page: number
  limit: number
  offset: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}
