'use server'

import { db } from '@/lib/db/drizzle'
import { profiles, products } from '@/lib/db/schema'
import { eq, desc, and, ilike, or, sql } from 'drizzle-orm'
import { authenticatedAction, adminAction } from '@/lib/safe-action'
import { z } from 'zod'
import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createNotification } from './notifications'

// Helper to verification is now handled by adminAction


const GetProductsSchema = z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
    search: z.string().optional(),
    status: z.string().optional(),
    category: z.string().optional()
})

export const adminGetAllProducts = adminAction(
    GetProductsSchema,
    async ({ page, limit, search, status, category }, adminId) => {
        // CheckAdmin is handled by adminAction wrapper

        const offset = (page - 1) * limit

        const conditions = []

        if (search) {
            const searchTerm = `%${search}%`
            conditions.push(or(
                ilike(products.name, searchTerm),
                ilike(products.brand, searchTerm),
                ilike(products.model, searchTerm)
            ))
        }

        if (status && status !== 'all') {
            conditions.push(eq(products.status, status))
        }

        if (category && category !== 'all') {
            conditions.push(eq(products.category, category))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const [data, totalResult] = await Promise.all([
            db.select({
                id: products.id,
                name: products.name,
                category: products.category,
                price: products.price,
                status: products.status,
                brand: products.brand,
                model: products.model,
                createdAt: products.createdAt,
                vendorName: profiles.fullName,
                vendorEmail: profiles.email,
                imageUrl: products.imageUrl
            })
                .from(products)
                .leftJoin(profiles, eq(products.vendorId, profiles.id))
                .where(whereClause)
                .orderBy(desc(products.createdAt))
                .limit(limit)
                .offset(offset),

            db.select({ count: sql<number>`count(*)::int` })
                .from(products)
                .where(whereClause)
        ])

        return {
            products: data,
            total: totalResult[0].count,
            totalPages: Math.ceil(totalResult[0].count / limit)
        }
    }
)

const ProductActionSchema = z.object({
    productId: z.string()
})

const ToggleProductStatusSchema = z.object({
    productId: z.string(),
    status: z.enum(['active', 'suspended', 'sold'])
})

export const adminDeleteProduct = adminAction(
    ProductActionSchema,
    async ({ productId }, adminId) => {
        // CheckAdmin is handled by adminAction wrapper

        await db.delete(products).where(eq(products.id, productId))

        revalidatePath('/admin')
        return { success: true }
    }
)

export const adminUpdateProductStatus = adminAction(
    ToggleProductStatusSchema,
    async ({ productId, status }, adminId) => {
        // CheckAdmin is handled by adminAction wrapper

        // Fetch product to get vendorId and name
        const product = await db.query.products.findFirst({
            where: eq(products.id, productId),
            columns: { vendorId: true, name: true }
        })

        if (!product) return { success: false, message: 'Product not found' }

        await db.update(products)
            .set({ status })
            .where(eq(products.id, productId))

        // Notify vendor if suspended
        if (status === 'suspended') {
            await createNotification(
                product.vendorId,
                'ad_suspended',
                'Action Required: Ad Suspended',
                `Your ad "${product.name}" has been suspended. Please check your dashboard or contact support.`,
                `/dashboard/vendor`
            )
        } else if (status === 'active') {
            await createNotification(
                product.vendorId,
                'ad_approved',
                'Ad Reactivated',
                `Your ad "${product.name}" is now active and visible to buyers.`,
                `/product/${productId}`
            )
        }

        revalidatePath('/admin')
        revalidatePath(`/product/${productId}`)
        revalidatePath('/', 'layout') // Force clear all data cache to ensure status update is reflected everywhere

        return { success: true }
    }
)
