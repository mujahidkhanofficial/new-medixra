'use server'

import { db } from '@/lib/db/drizzle'
import { products, profiles, productImages } from '@/lib/db/schema'
import { eq, desc, and, or, ilike, gte, lte, sql } from 'drizzle-orm'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { authenticatedAction } from '@/lib/safe-action'
import { z } from 'zod'

export type Product = {
    id: string
    name: string
    category: string
    vendor_id: string
    vendor_name?: string
    vendor_avatar?: string
    vendor_phone?: string
    vendor_whatsapp?: string
    vendor_city?: string
    vendor_joined_at?: string
    vendor_verified?: boolean
    price: number
    description: string
    condition: 'New' | 'Used' | 'Refurbished'
    location: string
    image_url: string
    created_at: string
    speciality?: string | null
    brand?: string | null
    warranty?: string | null
    views?: number
    images?: { id: string; url: string }[]
    // New Fields
    model?: string | null
    price_type?: string
    currency?: string
    ce_certified?: boolean
    fda_approved?: boolean
    iso_certified?: boolean
    drap_registered?: boolean
    other_certifications?: string | null
    origin_country?: string | null
    refurbishment_country?: string | null
    installation_support_country?: string | null
    amc_available?: boolean
    spare_parts_available?: boolean
    installation_included?: boolean
    tags?: string[] | null
}

export type ProductFilterOptions = {
    query?: string
    category?: string
    city?: string
    minPrice?: number
    maxPrice?: number
    condition?: string
    limit?: number
}

export async function getProducts(options: ProductFilterOptions = {}) {
    const getCachedProducts = unstable_cache(
        async () => {
            try {
                const conditions = [eq(products.status, 'active')];

                if (options.category && options.category !== 'All Categories') {
                    conditions.push(eq(products.category, options.category));
                }

                if (options.condition && options.condition !== 'All') {
                    conditions.push(eq(products.condition, options.condition as "New" | "Used" | "Refurbished"));
                }

                if (options.city && options.city !== 'All Pakistan') {
                    conditions.push(or(
                        eq(products.city, options.city),
                        ilike(products.location, `%${options.city}%`)
                    )!);
                }

                if (options.minPrice !== undefined) {
                    conditions.push(gte(products.price, options.minPrice.toString()));
                }

                if (options.maxPrice !== undefined && options.maxPrice < 10000000) {
                    conditions.push(lte(products.price, options.maxPrice.toString()));
                }

                let orderByClause: any[] = [desc(products.createdAt)];
                let extras = {};

                if (options.query) {
                    const searchQuery = sql`plainto_tsquery('english', ${options.query})`;
                    conditions.push(sql`${products.searchVector} @@ ${searchQuery}`);

                    // Add ranking
                    extras = {
                        rank: sql<number>`ts_rank(${products.searchVector}, ${searchQuery})`.as('rank')
                    };
                    orderByClause = [desc(sql`rank`)];
                }

                const data = await db.query.products.findMany({
                    where: and(...conditions),
                    orderBy: orderByClause,
                    limit: options.limit,
                    extras: extras,
                    with: {
                        vendor: {
                            columns: {
                                fullName: true,
                                city: true
                            }
                        },
                        productImages: {
                            columns: {
                                url: true
                            }
                        }
                    }
                });

                return data.map((p) => ({
                    id: p.id,
                    name: p.name,
                    category: p.category,
                    vendor_id: p.vendorId,
                    price: Number(p.price),
                    description: p.description || '',
                    condition: p.condition as "New" | "Used" | "Refurbished",
                    speciality: p.speciality,
                    brand: p.brand,
                    warranty: p.warranty,
                    location: p.location || '',
                    city: p.city,
                    area: p.area,
                    image_url: p.imageUrl || (p.productImages && p.productImages[0]?.url) || '',
                    views: p.views || 0,
                    whatsapp_clicks: p.whatsappClicks || 0,
                    status: p.status as any,
                    created_at: p.createdAt,
                    updated_at: p.updatedAt,
                    vendor_name: p.vendor?.fullName || 'Unknown Vendor',
                }));

            } catch (error) {
                console.error('Error fetching products detailed:', JSON.stringify(error, null, 2));
                return [];
            }
        },
        ['products-list', JSON.stringify(options)],
        { tags: ['products'], revalidate: 3600 }
    );

    return getCachedProducts();
}

export async function getProductById(id: string) {
    const getCachedProduct = unstable_cache(
        async () => {
            try {
                const product = await db.query.products.findFirst({
                    where: eq(products.id, id),
                    with: {
                        vendor: {
                            with: {
                                vendors: true // Fetch vendor business details
                            }
                        },
                        productImages: {
                            columns: {
                                id: true,
                                url: true,
                                displayOrder: true
                            },
                            orderBy: (images, { asc }) => [asc(images.displayOrder)]
                        }
                    }
                });

                if (!product) {
                    return null;
                }

                const vendorProfile = product.vendor;
                const vendorProDetails = vendorProfile?.vendors && vendorProfile.vendors.length > 0 ? vendorProfile.vendors[0] : null;

                return {
                    id: product.id,
                    name: product.name,
                    category: product.category,
                    vendor_id: product.vendorId,
                    price: Number(product.price),
                    description: product.description || '',
                    condition: product.condition as "New" | "Used" | "Refurbished",
                    speciality: product.speciality,
                    brand: product.brand,
                    warranty: product.warranty,
                    location: product.location || '',
                    city: product.city,
                    area: product.area,
                    image_url: product.imageUrl || (product.productImages && product.productImages[0]?.url) || '',
                    views: product.views || 0,
                    whatsapp_clicks: product.whatsappClicks || 0,
                    status: product.status as any,
                    created_at: product.createdAt,
                    updated_at: product.updatedAt,

                    vendor_name: vendorProfile?.fullName || 'Medixra Member',
                    vendor_avatar: vendorProfile?.avatarUrl,
                    vendor_phone: vendorProfile?.phone,
                    vendor_city: vendorProfile?.city,
                    vendor_joined_at: vendorProfile?.createdAt,
                    vendor_whatsapp: vendorProDetails?.whatsappNumber || vendorProfile?.phone,
                    vendor_verified: vendorProDetails?.isVerified || false,
                    images: product.productImages?.map(img => ({ id: img.id, url: img.url })) || [],

                    // New Fields mapped
                    model: product.model,
                    price_type: product.priceType,
                    currency: product.currency,
                    ce_certified: product.ceCertified,
                    fda_approved: product.fdaApproved,
                    iso_certified: product.isoCertified,
                    drap_registered: product.drapRegistered,
                    other_certifications: product.otherCertifications,
                    origin_country: product.originCountry,
                    refurbishment_country: product.refurbishmentCountry,
                    installation_support_country: product.installationSupportCountry,
                    amc_available: product.amcAvailable,
                    spare_parts_available: product.sparePartsAvailable,
                    installation_included: product.installationIncluded,
                    tags: product.tags ? JSON.parse(product.tags) as string[] : []
                };
            } catch (error) {
                console.error('Error fetching product:', error);
                return null;
            }
        },
        [`product-${id}`],
        { tags: ['products', `product-${id}`], revalidate: 3600 }
    );

    return getCachedProduct();
}

export async function getVendorProducts(vendorId: string) {
    const getCachedVendorProducts = unstable_cache(
        async () => {
            try {
                const data = await db.query.products.findMany({
                    where: eq(products.vendorId, vendorId),
                    orderBy: [desc(products.createdAt)],
                    with: {
                        productImages: {
                            columns: {
                                url: true
                            }
                        }
                    }
                });

                return data.map((p) => ({
                    id: p.id,
                    name: p.name,
                    category: p.category,
                    vendor_id: p.vendorId,
                    price: Number(p.price),
                    description: p.description || '',
                    condition: p.condition as "New" | "Used" | "Refurbished",
                    speciality: p.speciality,
                    brand: p.brand,
                    warranty: p.warranty,
                    location: p.location || '',
                    city: p.city,
                    area: p.area,
                    image_url: p.imageUrl || (p.productImages && p.productImages[0]?.url) || '',
                    views: p.views || 0,
                    whatsapp_clicks: p.whatsappClicks || 0,
                    status: p.status as any,
                    created_at: p.createdAt,
                    updated_at: p.updatedAt,
                }));

            } catch (error) {
                return [];
            }
        },
        [`vendor-products-${vendorId}`],
        { tags: ['products', `vendor-${vendorId}`], revalidate: 600 }
    );

    return getCachedVendorProducts();
}

export const deleteProduct = authenticatedAction(
    z.object({ productId: z.string().uuid() }),
    async ({ productId }, userId) => {
        const product = await db.query.products.findFirst({
            where: eq(products.id, productId),
            columns: { vendorId: true }
        })

        if (!product) {
            throw new Error('Product not found')
        }

        if (product.vendorId !== userId) {
            throw new Error('Unauthorized: You do not own this product')
        }

        await db.delete(products).where(eq(products.id, productId));

        revalidatePath('/dashboard/vendor');
        revalidatePath('/products');
        revalidatePath('/'); // Homepage featured items
        // revalidateTag('products'); // Invalidate product cache

        return { success: true };
    }
);

export const updateProduct = authenticatedAction(
    z.object({
        productId: z.string().uuid(),
        name: z.string().min(3, 'Product name must be at least 3 characters').optional(),
        description: z.string().min(10, 'Description must be at least 10 characters').optional(),
        price: z.string().optional(),
        category: z.string().optional(),
        condition: z.enum(['New', 'Used', 'Refurbished']).optional(),
        speciality: z.string().optional(),
        brand: z.string().optional(),
        warranty: z.string().optional(),
        city: z.string().optional(),
        location: z.string().optional(),
        area: z.string().optional(),
    }),
    async (data, userId) => {
        const product = await db.query.products.findFirst({
            where: eq(products.id, data.productId),
            columns: { vendorId: true }
        })

        if (!product) {
            throw new Error('Product not found')
        }

        if (product.vendorId !== userId) {
            throw new Error('Unauthorized: You do not own this product')
        }

        const updateData: any = {
            updated_at: new Date().toISOString()
        }

        if (data.name) updateData.name = data.name
        if (data.description) updateData.description = data.description
        if (data.price) updateData.price = data.price
        if (data.category) updateData.category = data.category
        if (data.condition) updateData.condition = data.condition
        if (data.speciality) updateData.speciality = data.speciality
        if (data.brand) updateData.brand = data.brand
        if (data.warranty) updateData.warranty = data.warranty
        if (data.city) updateData.city = data.city
        if (data.location) updateData.location = data.location
        if (data.area) updateData.area = data.area

        await db.update(products).set(updateData).where(eq(products.id, data.productId));

        revalidatePath('/dashboard/vendor');
        revalidatePath('/products');
        revalidatePath(`/product/${data.productId}`);
        revalidatePath('/'); // Homepage featured items
        // revalidateTag('products'); // Invalidate product list cache
        // revalidateTag(`product-${data.productId}`); // Invalidate specific product cache

        return { success: true };
    }
);
