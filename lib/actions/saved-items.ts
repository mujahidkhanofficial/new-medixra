'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db/drizzle'
import { savedItems, products, vendors, profiles } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export interface SavedItem {
  id: string
  productId: string
  productName: string
  vendor: string
  vendorId: string
  price: string
  image?: string | null
  category?: string
  savedAt: string
  location?: string | null
  condition?: string | null
  productCreatedAt: string
}

export async function getSavedItems(userId: string): Promise<SavedItem[]> {
  try {
    // Using Drizzle with explicit joins since relations might be missing or complex
    const items = await db
      .select({
        id: savedItems.id,
        productId: savedItems.productId,
        savedAt: savedItems.createdAt,
        productName: products.name,
        productPrice: products.price,
        productCurrency: products.currency,
        productImage: products.imageUrl,
        productCategory: products.category,
        productLocation: products.location,
        productCondition: products.condition,
        productCreatedAt: products.createdAt,
        vendorId: products.vendorId,
        vendorName: vendors.businessName,
        profileName: profiles.fullName,
      })
      .from(savedItems)
      .innerJoin(products, eq(savedItems.productId, products.id))
      .leftJoin(vendors, eq(products.vendorId, vendors.id))
      .leftJoin(profiles, eq(products.vendorId, profiles.id))
      .where(eq(savedItems.userId, userId))
      .orderBy(desc(savedItems.createdAt))

    return items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      vendor: item.vendorName || item.profileName || 'Unknown Vendor',
      vendorId: item.vendorId,
      price: `${item.productCurrency || 'PKR'} ${Number(item.productPrice).toLocaleString()}`,
      image: item.productImage,
      category: item.productCategory,
      location: item.productLocation,
      condition: item.productCondition,
      productCreatedAt: item.productCreatedAt,
      savedAt: new Date(item.savedAt).toLocaleDateString(),
    }))
  } catch (error) {
    console.error('Error fetching saved items:', error)
    return []
  }
}

export async function saveItem(userId: string, productId: string) {
  try {
    await db.insert(savedItems).values({
      userId,
      productId,
    })

    revalidatePath('/dashboard/saved-items')
    revalidatePath(`/product/${productId}`)
    return { success: true }
  } catch (error: any) {
    // Ignore duplicate key error safely
    if (error.code === '23505') return { success: true }
    console.error('Error saving item:', error)
    throw error
  }
}

export async function unsaveItem(userId: string, itemId: string) {
  try {
    // itemId here refers to the saved_items primary key? 
    // Usually UI passes the saved_items.id. 
    // But sometimes we want to unsave by productId.
    // Let's support both or check usage. 
    // Reviewing usage in page.tsx: it passes item.id (which comes from savedItems.id).

    await db.delete(savedItems).where(
      and(
        eq(savedItems.id, itemId),
        eq(savedItems.userId, userId)
      )
    )

    revalidatePath('/dashboard/saved-items')
    return { success: true }
  } catch (error) {
    console.error('Error removing saved item:', error)
    throw error
  }
}

export async function toggleSaveProduct(userId: string, productId: string, isSaved: boolean) {
  if (isSaved) {
    // Unsave by productId
    await db.delete(savedItems).where(
      and(
        eq(savedItems.productId, productId),
        eq(savedItems.userId, userId)
      )
    )
  } else {
    await saveItem(userId, productId)
  }
  revalidatePath(`/product/${productId}`)
  revalidatePath('/dashboard/saved-items')
  revalidatePath('/dashboard/user')
  return { success: true }
}

export async function checkSavedStatus(userId: string, productId: string) {
  const item = await db.query.savedItems.findFirst({
    where: and(
      eq(savedItems.userId, userId),
      eq(savedItems.productId, productId)
    )
  })
  return !!item
}

export async function getSavedProductIds(userId: string) {
  if (!userId) return []
  const items = await db
    .select({ productId: savedItems.productId })
    .from(savedItems)
    .where(eq(savedItems.userId, userId))

  return items.map(item => item.productId)
}
