import { MetadataRoute } from 'next'
import { db } from '@/lib/db/drizzle'
import { products } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://medixra.com'

  // Get all active products with error handling for connection issues during build
  let allProducts: { id: string; updatedAt: string }[] = []
  try {
    allProducts = await db.query.products.findMany({
        where: eq(products.status, 'active'),
        columns: {
            id: true,
            updatedAt: true,
        }
    })
  } catch (error) {
    // If database connection fails during build, skip product URLs
    // Static routes will still be included in sitemap
    console.warn('Could not fetch products for sitemap, using static routes only:', error)
  }

  const productUrls = allProducts.map((product) => ({
      url: `${baseUrl}/product/${product.id}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: 'daily' as const,
      priority: 0.8,
  }))

  return [
      {
          url: baseUrl,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 1,
      },
      {
          url: `${baseUrl}/products`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.9,
      },
      {
          url: `${baseUrl}/about-us`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.5,
      },
      ...productUrls,
  ]
}
