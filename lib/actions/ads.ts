'use server'

import { createClient } from '@/lib/supabase/server'
import { productSchema } from '@/lib/validation'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'

// Safe JSON parsing to prevent crashes from tampered FormData
function safeJsonParse<T>(raw: FormDataEntryValue | null, fallback: T): T {
    if (!raw || typeof raw !== 'string') return fallback
    try { return JSON.parse(raw) } catch { return fallback }
}

// Validate image URLs belong to our Supabase storage
function isValidImageUrl(url: string): boolean {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) return false
    try {
        return url.startsWith(supabaseUrl)
    } catch { return false }
}

export type CreateAdState = {
    success: boolean
    message?: string
    productId?: string
    errors?: Record<string, string[]>
}

const createAdSchema = productSchema.omit({ images: true })

export async function createAd(prevState: any, formData: FormData): Promise<CreateAdState> {
    const supabase = await createClient()
    if (!supabase) return { success: false, message: 'Service Unavailable: Database connection failed' }

    // 1. Get User
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { success: false, message: 'Authentication failed. Please log in.' }
    }

    // 1.5. Authorization: only APPROVED vendors may create ads
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, approval_status')
        .eq('id', user.id)
        .single()

    if (profileError || !profile) {
        return { success: false, message: 'Profile not found. Contact support.' }
    }

    if (profile.role !== 'vendor' && profile.role !== 'user') {
        return { success: false, message: 'Unauthorized: only vendors and individuals can post ads.' }
    }

    if (profile.role === 'vendor' && profile.approval_status !== 'approved') {
        return { success: false, message: 'Vendor account not approved yet.' }
    }

    // 2. Parse Data
    const specialities = safeJsonParse<string[]>(formData.get('specialities'), [])
    const tags = safeJsonParse<string[]>(formData.get('tags'), [])
    const imageUrls = safeJsonParse<string[]>(formData.get('imageUrls'), [])

    // Validate image URLs point to our Supabase storage
    const validatedImageUrls = imageUrls.filter((url: string) => typeof url === 'string' && isValidImageUrl(url))
    if (imageUrls.length > 0 && validatedImageUrls.length === 0) {
        return { success: false, message: 'Invalid image URLs detected. Please re-upload your images.' }
    }

    const priceType = formData.get('priceType') as string || 'fixed'
    // Fix: Use 0 for quote-only ads to pass validation
    const rawPrice = formData.get('price')
    const price = priceType === 'quote' ? 0 : Number(rawPrice)

    const rawData = {
        name: formData.get('name'),
        description: formData.get('description'),
        price,
        category: formData.get('category'),
        condition: formData.get('condition'),
        specialities: specialities,
        brand: formData.get('brand') || undefined,
        warranty: formData.get('warranty') || undefined,
        city: formData.get('city'),
        area: formData.get('area'),
        // New Fields
        model: formData.get('model') || undefined,
        priceType,
        currency: formData.get('currency'),
        ceCertified: formData.get('ceCertified') === 'true',
        fdaApproved: formData.get('fdaApproved') === 'true',
        isoCertified: formData.get('isoCertified') === 'true',
        drapRegistered: formData.get('drapRegistered') === 'true',
        otherCertifications: formData.get('otherCertifications') || undefined,
        originCountry: formData.get('originCountry') || undefined,
        refurbishmentCountry: formData.get('refurbishmentCountry') || undefined,
        installationSupportCountry: formData.get('installationSupportCountry') || undefined,
        amcAvailable: formData.get('amcAvailable') === 'true',
        sparePartsAvailable: formData.get('sparePartsAvailable') === 'true',
        installationIncluded: formData.get('installationIncluded') === 'true',
        tags: tags,
        location: `${formData.get('area')}, ${formData.get('city')}`,
        imageUrls: validatedImageUrls
    }

    // Validation Schema Extension for Server Action
    // We replace 'images' (File[]) with 'imageUrls' (string[])
    const serverActionSchema = createAdSchema.extend({
        imageUrls: z.array(z.string()).min(1, "At least one image is required")
    })

    try {
        const validatedData = serverActionSchema.parse(rawData)

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
                speciality: validatedData.specialities && validatedData.specialities.length > 0 ? JSON.stringify(validatedData.specialities) : null,
                brand: validatedData.brand || null,
                warranty: validatedData.warranty || null,
                city: rawData.city as string,
                area: rawData.area as string,
                location: validatedData.location,
                status: 'active',
                image_url: validatedData.imageUrls[0] || null, // Primary image
                // New Fields Mapped
                model: validatedData.model || null,
                price_type: validatedData.priceType || 'fixed',
                currency: validatedData.currency || 'PKR',
                ce_certified: validatedData.ceCertified || false,
                fda_approved: validatedData.fdaApproved || false,
                iso_certified: validatedData.isoCertified || false,
                drap_registered: validatedData.drapRegistered || false,
                other_certifications: validatedData.otherCertifications || null,
                origin_country: validatedData.originCountry || null,
                refurbishment_country: validatedData.refurbishmentCountry || null,
                installation_support_country: validatedData.installationSupportCountry || null,
                amc_available: validatedData.amcAvailable || false,
                spare_parts_available: validatedData.sparePartsAvailable || false,
                installation_included: validatedData.installationIncluded || false,
                tags: validatedData.tags && validatedData.tags.length > 0 ? JSON.stringify(validatedData.tags) : null,
            })
            .select()
            .single()

        if (error) {
            console.error('SERVER ACTION DB ERROR:', JSON.stringify(error, null, 2))
            return { success: false, message: `Database error: ${error.message} (Code: ${error.code})` }
        }

        // 4. Link Images
        if (validatedData.imageUrls.length > 0) {
            const imageRecords = validatedData.imageUrls.map((url: string, index: number) => ({
                product_id: product.id,
                url: url,
                display_order: index
            }))

            const { error: imageError } = await supabase
                .from('product_images')
                .insert(imageRecords)


            if (imageError) {
                console.error('Error saving image records:', imageError)
                // Product exists but images failed — warn the user
                return { success: true, productId: product.id, message: 'Ad created but some images could not be saved. You may re-upload them later.' }
            }
        }

        revalidatePath('/products', 'page')
        revalidatePath('/', 'layout')
        revalidatePath('/dashboard/vendor', 'layout')
        revalidatePath('/dashboard/user', 'layout')
        // @ts-expect-error Next 15 type mismatch
        revalidateTag('products')

        return { success: true, productId: product.id }

    } catch (e) {
        if (e instanceof z.ZodError) {
            console.error('ZOD VALIDATION ERRORS:', JSON.stringify(e.flatten().fieldErrors, null, 2))
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
        if (!supabase) throw new Error('Service Unavailable: Database connection failed')

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

        revalidatePath('/products', 'page')
        revalidatePath(`/product/${productId}`, 'page')
        revalidatePath('/', 'layout')
        revalidatePath('/dashboard/vendor', 'layout')
        revalidatePath('/dashboard/user', 'layout')
        // @ts-expect-error Next 15 type mismatch
        revalidateTag('products')
        // @ts-expect-error Next 15 type mismatch
        revalidateTag(`product-${productId}`)

        return { success: true }
    } catch (e: any) {
        console.error('Server Action saveAdImages Error:', e)
        return { success: false, message: `Unexpected error saving images: ${e.message}` }
    }
}

export async function deleteAd(productId: string) {
    const supabase = await createClient()
    if (!supabase) return { success: false, message: 'Service Unavailable' }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { success: false, message: 'You must be logged in to delete an ad' }
    }

    try {
        // First check if the ad belongs to the user
        const { data: product, error: findError } = await supabase
            .from('products')
            .select('id')
            .eq('id', productId)
            .eq('vendor_id', user.id)
            .single()

        if (findError || !product) {
            return { success: false, message: 'Ad not found or you are not authorized to delete it' }
        }

        // Delete the ad
        const { error: deleteError } = await supabase
            .from('products')
            .delete()
            .eq('id', productId)

        if (deleteError) {
            return { success: false, message: 'Failed to delete ad' }
        }


        revalidatePath('/dashboard/vendor', 'layout')
        revalidatePath('/dashboard/user', 'layout')
        revalidatePath('/products', 'page')
        revalidatePath('/', 'layout') // Homepage featured items
        // @ts-expect-error Next 15 type mismatch
        revalidateTag('products') // Invalidate product list cache
        // @ts-expect-error Next 15 type mismatch
        revalidateTag(`product-${productId}`) // Invalidate specific product cache

        return { success: true, message: 'Ad deleted successfully' }
    } catch (error) {
        return { success: false, message: 'An unexpected error occurred' }
    }
}

export async function updateAd(
    productId: string,
    prevState: any,
    formData: FormData
): Promise<CreateAdState> {
    const supabase = await createClient()
    if (!supabase) return { success: false, message: 'Service Unavailable: Database connection failed' }

    // 1. Get User
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { success: false, message: 'Authentication failed. Please log in.' }
    }

    // 2. Validate Ownership & Authorization
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || (profile.role !== 'vendor' && profile.role !== 'user')) {
        return { success: false, message: 'Unauthorized.' }
    }

    const { data: existingProduct, error: findError } = await supabase
        .from('products')
        .select('id, vendor_id')
        .eq('id', productId)
        .eq('vendor_id', user.id)
        .single()

    if (findError || !existingProduct) {
        return { success: false, message: 'Ad not found or you are not authorized to edit it.' }
    }

    // 3. Parse Data (Reuse logic from createAd)
    const specialities = safeJsonParse<string[]>(formData.get('specialities'), [])
    const tags = safeJsonParse<string[]>(formData.get('tags'), [])
    const imageUrls = safeJsonParse<string[]>(formData.get('imageUrls'), [])

    const validatedImageUrls = imageUrls.filter((url: string) => typeof url === 'string' && isValidImageUrl(url))
    if (imageUrls.length > 0 && validatedImageUrls.length === 0) {
        return { success: false, message: 'Invalid image URLs detected.' }
    }

    const {
        priceType,
        price,
        rawData
    } = parseProductFormData(formData, specialities, tags, validatedImageUrls)


    // 4. Validate
    // Re-using createAdSchema but we need to ensure it allows updates (id needed?)
    // Actually, createAdSchema is just fields, so it works.
    const serverActionSchema = createAdSchema.extend({
        imageUrls: z.array(z.string()).min(1, "At least one image is required")
    })

    try {
        const validatedData = serverActionSchema.parse(rawData)

        // 5. Update Product
        const { error: updateError } = await supabase
            .from('products')
            .update({
                name: validatedData.name,
                description: validatedData.description,
                price: validatedData.price,
                category: validatedData.category,
                condition: validatedData.condition,
                speciality: validatedData.specialities && validatedData.specialities.length > 0 ? JSON.stringify(validatedData.specialities) : null,
                brand: validatedData.brand || null,
                warranty: validatedData.warranty || null,
                city: rawData.city as string,
                area: rawData.area as string,
                location: validatedData.location,
                image_url: validatedData.imageUrls[0] || null,
                model: validatedData.model || null,
                price_type: validatedData.priceType || 'fixed',
                currency: validatedData.currency || 'PKR',
                ce_certified: validatedData.ceCertified || false,
                fda_approved: validatedData.fdaApproved || false,
                iso_certified: validatedData.isoCertified || false,
                drap_registered: validatedData.drapRegistered || false,
                other_certifications: validatedData.otherCertifications || null,
                origin_country: validatedData.originCountry || null,
                refurbishment_country: validatedData.refurbishmentCountry || null,
                installation_support_country: validatedData.installationSupportCountry || null,
                amc_available: validatedData.amcAvailable || false,
                spare_parts_available: validatedData.sparePartsAvailable || false,
                installation_included: validatedData.installationIncluded || false,
                tags: validatedData.tags && validatedData.tags.length > 0 ? JSON.stringify(validatedData.tags) : null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', productId)

        if (updateError) {
            console.error('UPDATE AD ERROR:', updateError)
            return { success: false, message: `Database error: ${updateError.message}` }
        }

        // 6. Update Images
        // Strategy: Delete all existing, insert new. 
        // A bit heavy but ensures order and correctness without complex diffing.
        // Or better: Upsert? No, IDs change.
        // Delete all -> Insert is safe because images are stored in Storage bucket, 
        // the DB records are just references.
        await supabase.from('product_images').delete().eq('product_id', productId)

        if (validatedData.imageUrls.length > 0) {
            const imageRecords = validatedData.imageUrls.map((url: string, index: number) => ({
                product_id: productId,
                url: url,
                display_order: index
            }))

            const { error: imageError } = await supabase
                .from('product_images')
                .insert(imageRecords)

            if (imageError) {
                console.error('Error saving image records:', imageError)
            }
        }

        revalidatePath('/products', 'page')
        revalidatePath(`/product/${productId}`, 'page')
        revalidatePath('/dashboard/user', 'layout')
        revalidatePath('/dashboard/vendor', 'layout')
        // @ts-expect-error Next 15 type mismatch
        revalidateTag('products')
        // @ts-expect-error Next 15 type mismatch
        revalidateTag(`product-${productId}`)

        return { success: true, productId: productId }

    } catch (e: any) {
        if (e instanceof z.ZodError) {
            return { success: false, errors: e.flatten().fieldErrors as any, message: 'Validation failed' }
        }
        return { success: false, message: e.message || 'An unexpected error occurred' }
    }
}

// Helper to extract form data parsing
function parseProductFormData(formData: FormData, specialities: string[], tags: string[], imageUrls: string[]) {
    const priceType = formData.get('priceType') as string || 'fixed'
    const rawPrice = formData.get('price')
    const price = priceType === 'quote' ? 0 : Number(rawPrice)

    const rawData = {
        name: formData.get('name'),
        description: formData.get('description'),
        price,
        category: formData.get('category'),
        condition: formData.get('condition'),
        specialities: specialities,
        brand: formData.get('brand') || undefined,
        warranty: formData.get('warranty') || undefined,
        city: formData.get('city'),
        area: formData.get('area'),
        model: formData.get('model') || undefined,
        priceType,
        currency: formData.get('currency'),
        ceCertified: formData.get('ceCertified') === 'true',
        fdaApproved: formData.get('fdaApproved') === 'true',
        isoCertified: formData.get('isoCertified') === 'true',
        drapRegistered: formData.get('drapRegistered') === 'true',
        otherCertifications: formData.get('otherCertifications') || undefined,
        originCountry: formData.get('originCountry') || undefined,
        refurbishmentCountry: formData.get('refurbishmentCountry') || undefined,
        installationSupportCountry: formData.get('installationSupportCountry') || undefined,
        amcAvailable: formData.get('amcAvailable') === 'true',
        sparePartsAvailable: formData.get('sparePartsAvailable') === 'true',
        installationIncluded: formData.get('installationIncluded') === 'true',
        tags: tags,
        location: `${formData.get('area')}, ${formData.get('city')}`,
        imageUrls: imageUrls
    }

    return { priceType, price, rawData }
}

