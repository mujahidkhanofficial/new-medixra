'use server'

import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export type UploadState = {
    success: boolean
    url?: string
    error?: string
}

export async function uploadImage(formData: FormData): Promise<UploadState> {
    try {
        const file = formData.get('file') as File
        const bucket = formData.get('bucket') as string || 'products'

        if (!file) {
            return { success: false, error: 'No file provided' }
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return { success: false, error: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' }
        }

        if (file.size > MAX_FILE_SIZE) {
            return { success: false, error: 'File size exceeds 5MB limit.' }
        }

        const supabase = await createClient()
        if (!supabase) return { success: false, error: 'Server configuration error' }

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { success: false, error: 'Unauthorized' }
        }

        // Generate unique path
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}_${uuidv4()}.${fileExt}`

        const arrayBuffer = await file.arrayBuffer()
        const buffer = new Uint8Array(arrayBuffer)

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: false
            })

        if (error) {
            console.error('Upload Error:', error)
            // Retry with other bucket if first one fails (simple fallback logic)
            if (bucket === 'products') {
                // Try product-images as fallback
                const { data: fallbackData, error: fallbackError } = await supabase.storage
                    .from('product-images')
                    .upload(fileName, buffer, {
                        contentType: file.type,
                        upsert: false
                    })

                if (fallbackError) {
                    console.error('Fallback Upload Error:', fallbackError)
                    return { success: false, error: `Upload failed: ${error.message}` }
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(fileName)

                return { success: true, url: publicUrl }
            }

            return { success: false, error: `Upload failed: ${error.message}` }
        }

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName)

        return { success: true, url: publicUrl }

    } catch (error: any) {
        console.error('Server Upload Error:', error)
        return { success: false, error: error.message || 'An unexpected error occurred' }
    }
}
