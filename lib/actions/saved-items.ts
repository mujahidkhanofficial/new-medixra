'use server'

import { createClient } from '@/lib/supabase/server'

export interface SavedItem {
  id: string
  productId: string
  productName: string
  vendor: string
  vendorId: string
  price: string
  image?: string
  category?: string
  savedAt: string
}

export async function getSavedItems(userId: string): Promise<SavedItem[]> {
  try {
    const supabase = await createClient()

    // Query to get user's saved items
    const { data: saved, error } = await supabase
      .from('saved_items')
      .select(
        `id,
        product_id,
        created_at,
        products(name, price, image_url, vendor_id, category),
        vendors(business_name)`
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    const savedItems: SavedItem[] = saved?.map((item: any) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.products?.name || 'Unknown Product',
      vendor: item.vendors?.business_name || 'Unknown Vendor',
      vendorId: item.products?.vendor_id,
      price: `₨ ${item.products?.price?.toLocaleString()}` || 'Price on request',
      image: item.products?.image_url,
      category: item.products?.category,
      savedAt: new Date(item.created_at).toLocaleDateString(),
    })) || []

    return savedItems
  } catch (error) {
    console.error('Error fetching saved items:', error)
    return await getMockSavedItems()
  }
}

export async function getMockSavedItems(): Promise<SavedItem[]> {
  return [
    {
      id: '1',
      productId: 'prod-1',
      productName: 'Portable Ultrasound Machine HM70A',
      vendor: 'MediTech Pakistan',
      vendorId: 'vendor-1',
      price: '₨ 450,000',
      image: 'https://images.unsplash.com/photo-1631217314830-4ed6e3a96e9d?w=400',
      category: 'Imaging Equipment',
      savedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    },
    {
      id: '2',
      productId: 'prod-2',
      productName: 'Advanced ECG Monitor with Display',
      vendor: 'CardioHealth Solutions',
      vendorId: 'vendor-2',
      price: '₨ 95,000',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400',
      category: 'Diagnostic',
      savedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    },
  ]
}

export async function saveItem(userId: string, productId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('saved_items')
      .insert([{ user_id: userId, product_id: productId }])
      .select()

    if (error) throw error
    return { success: true, data: data?.[0] }
  } catch (error) {
    console.error('Error saving item:', error)
    throw error
  }
}

export async function unsaveItem(userId: string, itemId: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('saved_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error removing saved item:', error)
    throw error
  }
}
