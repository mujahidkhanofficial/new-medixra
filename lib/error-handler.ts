import { ZodError } from 'zod'

/**
 * Error handling utilities for API calls and async operations
 */

export class AppError extends Error {
  constructor(
    public message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const ERROR_MESSAGES = {
  // Auth errors
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  EMAIL_ALREADY_EXISTS: 'This email is already registered.',
  WEAK_PASSWORD: 'Password does not meet security requirements.',
  EMAIL_NOT_CONFIRMED: 'Please verify your email before logging in.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',

  // Validation errors
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  FIELD_REQUIRED: 'This field is required.',
  INVALID_IMAGE: 'Invalid image file. Please use JPG, PNG, or WebP.',

  // Product errors
  PRODUCT_NOT_FOUND: 'Product not found. It may have been removed.',
  PRODUCT_UPLOAD_FAILED: 'Failed to upload product. Please try again.',
  IMAGE_UPLOAD_FAILED: 'Failed to upload image. Please try again.',

  // Network errors
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT: 'Request timed out. Please try again.',

  // Generic
  UNKNOWN_ERROR: 'Something went wrong. Please try again.',
} as const

type ErrorMessage = typeof ERROR_MESSAGES[keyof typeof ERROR_MESSAGES]

/**
 * Converts error objects into user-friendly messages
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ZodError) {
    return error.errors[0]?.message || 'Validation failed. Please check your input.'
  }

  if (error instanceof AppError) {
    return error.message
  }

  if (error instanceof Error) {
    // Check for known error messages
    const message = error.message.toLowerCase()

    if (message.includes('invalid')) {
      return ERROR_MESSAGES.INVALID_CREDENTIALS
    }
    if (message.includes('network') || message.includes('fetch')) {
      return ERROR_MESSAGES.NETWORK_ERROR
    }
    if (message.includes('timeout')) {
      return ERROR_MESSAGES.TIMEOUT
    }
    if (message.includes('rate limit')) {
      return 'Too many attempts. Please wait a moment.'
    }

    // Check if it's a raw Zod error string (fallback)
    if (message.startsWith('[') && message.includes('"code":')) {
      try {
        const zodErrors = JSON.parse(message)
        if (Array.isArray(zodErrors) && zodErrors[0]?.message) {
          return zodErrors[0].message
        }
      } catch {
        // Ignore parse error
      }
    }

    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR
}

/**
 * Safely parse JSON error response from API
 */
export function parseApiError(response: Response): AppError {
  const statusCode = response.status

  // Map common HTTP status codes to user-friendly messages
  const statusMessages: Record<number, string> = {
    400: 'Invalid request. Please check your input.',
    401: 'Unauthorized. Please log in.',
    403: 'You do not have permission to perform this action.',
    404: 'Resource not found.',
    409: 'This item already exists.',
    422: 'Invalid data. Please check your input.',
    500: ERROR_MESSAGES.SERVER_ERROR,
    503: 'Server is temporarily unavailable. Please try again later.',
  }

  const message = statusMessages[statusCode] || ERROR_MESSAGES.UNKNOWN_ERROR

  return new AppError(message, `HTTP_${statusCode}`, statusCode)
}

/**
 * Wrapper for API calls with built-in error handling
 */
export async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      throw parseApiError(response)
    }

    return await response.json() as T
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError(getErrorMessage(error))
  }
}
