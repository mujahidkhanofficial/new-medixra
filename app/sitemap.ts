import { MetadataRoute } from 'next'
import { db } from '@/lib/db/drizzle'
import { products } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { EQUIPMENT_HIERARCHY } from '@/lib/constants'
import { getApprovedEngineers } from '@/lib/actions/engineer'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pakmedinex.com'

    // Get all active products with error handling for connection issues during build
    let allProducts: { id: string; updatedAt: string }[] = []
    let allEngineers: any[] = []

    try {
        allProducts = await db.query.products.findMany({
            where: eq(products.status, 'active'),
            columns: {
                id: true,
                updatedAt: true,
            }
        })
        allEngineers = await getApprovedEngineers()
    } catch (error) {
        // Suppress warning during build step (e.g. Vercel) if DB is not accessible
    }

    const productUrls = allProducts.map((product) => ({
        url: `${baseUrl}/product/${product.id}`,
        lastModified: new Date(product.updatedAt || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    const engineerUrls = allEngineers.map((eng) => ({
        url: `${baseUrl}/engineer/${eng.id}`,
        lastModified: new Date(eng.createdAt || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    const categoryUrls = EQUIPMENT_HIERARCHY.map((category) => ({
        url: `${baseUrl}/products?category=${encodeURIComponent(category.name)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    const baseRoutes = [
        '',
        '/products',
        '/engineers',
        '/vendors',
        '/post-ad',
        '/drap-guidelines',
        '/buyer-protection',
        '/trust-and-safety',
        '/about-us',
        '/terms',
        '/privacy',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    return [...baseRoutes, ...categoryUrls, ...engineerUrls, ...productUrls]
}
