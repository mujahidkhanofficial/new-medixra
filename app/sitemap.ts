import { MetadataRoute } from 'next'
import { db } from '@/lib/db/drizzle'
import { products } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { EQUIPMENT_HIERARCHY } from '@/lib/constants'
import { getApprovedTechnicians } from '@/lib/actions/technician'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://medixra.com'

    // Get all active products with error handling for connection issues during build
    let allProducts: { id: string; updatedAt: string }[] = []
    let allTechnicians: any[] = []

    try {
        allProducts = await db.query.products.findMany({
            where: eq(products.status, 'active'),
            columns: {
                id: true,
                updatedAt: true,
            }
        })
        allTechnicians = await getApprovedTechnicians()
    } catch (error) {
        // Suppress warning during build step (e.g. Vercel) if DB is not accessible
    }

    const productUrls = allProducts.map((product) => ({
        url: `${baseUrl}/product/${product.id}`,
        lastModified: new Date(product.updatedAt || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    const technicianUrls = allTechnicians.map((tech) => ({
        url: `${baseUrl}/technician/${tech.id}`,
        lastModified: new Date(tech.createdAt || new Date()),
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
        '/technicians',
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

    return [...baseRoutes, ...categoryUrls, ...technicianUrls, ...productUrls]
}
