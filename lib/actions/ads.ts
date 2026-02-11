'use server'

import { createClient } from '@/lib/supabase/server'
import { productSchema } from '@/lib/validation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export type CreateAdState = {
    success: boolean
    message?: string
    productId?: string
    errors?: Record<string, string[]>
}

const createAdSchema = productSchema.omit({ images: true })

export async function createAd(prevState: any, formData: FormData): Promise<CreateAdState> {
    const supabase = await createClient()

    // 1. Get User
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { success: false, message: 'Authentication failed. Please log in.' }
    }

    // 2. Parse Data
    const rawData = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: Number(formData.get('price')),
        category: formData.get('category'),
        condition: formData.get('condition'),
        speciality: formData.get('speciality'),
        brand: formData.get('brand'),
        warranty: formData.get('warranty'),
        city: formData.get('city'),
        area: formData.get('area'),
        imageUrls: formData.get('imageUrls') ? JSON.parse(formData.get('imageUrls') as string) : []
    }

    const city = rawData.city as string
    const area = rawData.area as string
    const location = `${area}, ${city}`

    try {
        const validatedData = createAdSchema.parse({
            ...rawData,
            location: location
        })

        // 3. Insert Product
        const { data: product, error } = await supabase
            .from('products')
            .insert({
                vendor_id: user.id,
                name: validatedData.name,
                description: validatedData.description,
                price: validatedData.price,
                category: validatedData.category,
                condition: validatedData.condition,
                speciality: validatedData.speciality || null,
                brand: validatedData.brand || null,
                warranty: validatedData.warranty || null,
                city: city,
                area: area,
                location: location,
                status: 'active',
                image_url: rawData.imageUrls[0] || null // Set primary image immediately
            })
            .select()
            .single()

        if (error) {
            console.error('SERVER ACTION DB ERROR:', JSON.stringify(error, null, 2))
            return { success: false, message: `Database error: ${error.message} (Code: ${error.code})` }
        }

        // 4. Link Images (if any)
        if (rawData.imageUrls.length > 0) {
            const imageRecords = rawData.imageUrls.map((url: string, index: number) => ({
                product_id: product.id,
                url: url,
                display_order: index
            }))

            const { error: imageError } = await supabase
                .from('product_images')
                .insert(imageRecords)

            if (imageError) {
                console.error('Error saving image records:', imageError)
                // We don't rollback here as the product is valid, but we log it.
            }
        }

        revalidatePath('/products')

        return { success: true, productId: product.id }

    } catch (e) {
        if (e instanceof z.ZodError) {
            const fieldErrors = e.flatten().fieldErrors
            const errors: Record<string, string[]> = {}
            for (const key in fieldErrors) {
                if (fieldErrors[key]) errors[key] = fieldErrors[key]!
            }
            return { success: false, errors, message: 'Validation failed' }
        }
        console.error('Server Action Error:', e)
        return { success: false, message: 'An unexpected error occurred' }
    }
}

export async function saveAdImages(productId: string, imageUrls: string[]) {
    try {
        const supabase = await createClient()

        if (!imageUrls.length) return { success: true }

        // 1. Insert Images
        const records = imageUrls.map((url, index) => ({
            product_id: productId,
            url: url,
            display_order: index
        }))

        const { error: insertError } = await supabase
            .from('product_images')
            .insert(records)

        if (insertError) {
            console.error('Error saving image records:', JSON.stringify(insertError, null, 2))
            return { success: false, message: `Failed to save images: ${insertError.message}` }
        }

        // 2. Update Main Product Image
        const { error: updateError } = await supabase
            .from('products')
            .update({ image_url: imageUrls[0] })
            .eq('id', productId)

        if (updateError) {
            console.error('Error updating product image_url:', JSON.stringify(updateError, null, 2))
            // We don't fail the whole request if just the thumbnail update fails, but good to know
        }

        revalidatePath('/products')
        revalidatePath(`/product/${productId}`)

        return { success: true }
    } catch (e: any) {
        console.error('Server Action saveAdImages Error:', e)
        return { success: false, message: `Unexpected error saving images: ${e.message}` }
    }
}

