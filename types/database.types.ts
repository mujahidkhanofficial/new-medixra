export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    role: 'buyer' | 'vendor' | 'admin'
                    avatar_url: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    role?: 'buyer' | 'vendor' | 'admin'
                    avatar_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    role?: 'buyer' | 'vendor' | 'admin'
                    avatar_url?: string | null
                    created_at?: string
                }
            }
            vendors: {
                Row: {
                    id: string
                    business_name: string
                    description: string | null
                    is_verified: boolean
                    contact_phone: string | null
                    whatsapp_number: string | null
                    city: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    business_name: string
                    description?: string | null
                    is_verified?: boolean
                    contact_phone?: string | null
                    whatsapp_number?: string | null
                    city?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    business_name?: string
                    description?: string | null
                    is_verified?: boolean
                    contact_phone?: string | null
                    whatsapp_number?: string | null
                    city?: string | null
                    created_at?: string
                }
            }
            products: {
                Row: {
                    id: string
                    name: string
                    category: string
                    vendor_id: string
                    price: number
                    description: string
                    condition: 'New' | 'Used' | 'Refurbished'
                    location: string | null
                    image_url: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    category: string
                    vendor_id: string
                    price: number
                    description: string
                    condition: 'New' | 'Used' | 'Refurbished'
                    location?: string | null
                    image_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    category?: string
                    vendor_id?: string
                    price?: number
                    description?: string
                    condition?: 'New' | 'Used' | 'Refurbished'
                    location?: string | null
                    image_url?: string | null
                    created_at?: string
                }
            }
        }
    }
}
