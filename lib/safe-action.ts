import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export type ActionState<T> = {
    success: boolean
    data?: T
    error?: string
    validationErrors?: Record<string, string[] | undefined>
}

/**
 * Creates a safe server action with input validation and consistent error handling.
 * Usage:
 * export const myAction = publicAction(mySchema, async (data) => { ... })
 */
export function publicAction<T extends z.ZodType<any, any>, R>(
    schema: T,
    handler: (data: z.infer<T>) => Promise<R>
) {
    return async (input: z.infer<T>): Promise<ActionState<R>> => {
        try {
            const validationResult = schema.safeParse(input)

            if (!validationResult.success) {
                return {
                    success: false,
                    validationErrors: validationResult.error.flatten().fieldErrors,
                    error: 'Validation failed'
                }
            }

            const data = await handler(validationResult.data)

            return {
                success: true,
                data
            }
        } catch (error: any) {
            console.error('Action Error:', error)
            return {
                success: false,
                error: error.message || 'An unexpected error occurred'
            }
        }
    }
}

/**
 * Creates an authenticated server action.
 * Usage:
 * export const myAuthAction = authenticatedAction(mySchema, async (data, userId) => { ... })
 */
export function authenticatedAction<T extends z.ZodType<any, any>, R>(
    schema: T,
    handler: (data: z.infer<T>, userId: string) => Promise<R>
) {
    return async (input: z.infer<T>): Promise<ActionState<R>> => {
        try {
            const supabase = await createClient()

            if (!supabase) {
                return {
                    success: false,
                    error: 'Service Unavailable: Database connection failed'
                }
            }

            const { data: { user }, error } = await supabase.auth.getUser()

            if (error || !user) {
                return {
                    success: false,
                    error: 'Unauthorized'
                }
            }

            const validationResult = schema.safeParse(input)

            if (!validationResult.success) {
                return {
                    success: false,
                    validationErrors: validationResult.error.flatten().fieldErrors,
                    error: 'Validation failed'
                }
            }

            const data = await handler(validationResult.data, user.id)

            return {
                success: true,
                data
            }
        } catch (error: any) {
            console.error('Authenticated Action Error:', error)
            return {
                success: false,
                error: error.message || 'An unexpected error occurred'
            }
        }
    }
}
