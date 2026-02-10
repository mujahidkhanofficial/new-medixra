/**
 * Form utilities and helpers for consistent form handling across the app
 */

import { ZodSchema } from 'zod'

export interface ValidationError {
  field: string
  message: string
}

/**
 * Validates form data against a Zod schema and returns formatted errors
 */
export async function validateFormData<T>(
  schema: ZodSchema,
  data: unknown
): Promise<{
  success: boolean
  data?: T
  errors?: ValidationError[]
}> {
  try {
    const validated = await schema.parseAsync(data)
    return { success: true, data: validated }
  } catch (error: any) {
    const errors: ValidationError[] = error.errors?.map((err: any) => ({
      field: err.path.join('.'),
      message: err.message,
    })) || []
    return { success: false, errors }
  }
}

/**
 * Formats validation errors into a map for easy field lookup
 */
export function formatValidationErrors(
  errors: ValidationError[]
): Record<string, string> {
  return errors.reduce(
    (acc, err) => {
      acc[err.field] = err.message
      return acc
    },
    {} as Record<string, string>
  )
}

/**
 * Gets the error message for a specific field
 */
export function getFieldError(
  errors: Record<string, string>,
  fieldName: string
): string | undefined {
  return errors[fieldName]
}

/**
 * Checks if a form has any errors
 */
export function hasFormErrors(errors: Record<string, string>): boolean {
  return Object.keys(errors).length > 0
}

/**
 * Clears error for a specific field
 */
export function clearFieldError(
  errors: Record<string, string>,
  fieldName: string
): Record<string, string> {
  const newErrors = { ...errors }
  delete newErrors[fieldName]
  return newErrors
}
