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
                    role: 'user' | 'vendor' | 'technician' | 'admin'
                    approval_status: 'approved' | 'pending' | 'rejected'
                    status: 'active' | 'suspended'
                    avatar_url: string | null
                    phone: string | null
                    city: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    role?: 'user' | 'vendor' | 'technician' | 'admin'
                    approval_status?: 'approved' | 'pending' | 'rejected'
                    status?: 'active' | 'suspended'
                    avatar_url?: string | null
                    phone?: string | null
                    city?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    role?: 'user' | 'vendor' | 'technician' | 'admin'
                    approval_status?: 'approved' | 'pending' | 'rejected'
                    status?: 'active' | 'suspended'
                    avatar_url?: string | null
                    phone?: string | null
                    city?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
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
                    showroom_slug: string | null
                    banner_url: string | null
                    is_featured: boolean
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
                    showroom_slug?: string | null
                    banner_url?: string | null
                    is_featured?: boolean
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
                    showroom_slug?: string | null
                    banner_url?: string | null
                    is_featured?: boolean
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "vendors_id_fkey"
                        columns: ["id"]
                        isOneToOne: true
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            technicians: {
                Row: {
                    id: string
                    speciality: string | null
                    experience_years: string | null
                    is_verified: boolean
                    city: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    speciality?: string | null
                    experience_years?: string | null
                    is_verified?: boolean
                    city?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    speciality?: string | null
                    experience_years?: string | null
                    is_verified?: boolean
                    city?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "technicians_id_fkey"
                        columns: ["id"]
                        isOneToOne: true
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
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
                    speciality: string | null
                    brand: string | null
                    warranty: string | null
                    location: string | null
                    city: string | null
                    area: string | null
                    image_url: string | null
                    views: number
                    whatsapp_clicks: number
                    status: 'active' | 'pending' | 'sold' | 'expired' | 'archived'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    category: string
                    vendor_id: string
                    price: number
                    description: string
                    condition: 'New' | 'Used' | 'Refurbished'
                    speciality?: string | null
                    brand?: string | null
                    warranty?: string | null
                    location?: string | null
                    city?: string | null
                    area?: string | null
                    image_url?: string | null
                    views?: number
                    whatsapp_clicks?: number
                    status?: 'active' | 'pending' | 'sold' | 'expired' | 'archived'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    category?: string
                    vendor_id?: string
                    price?: number
                    description?: string
                    condition?: 'New' | 'Used' | 'Refurbished'
                    speciality?: string | null
                    brand?: string | null
                    warranty?: string | null
                    location?: string | null
                    city?: string | null
                    area?: string | null
                    image_url?: string | null
                    views?: number
                    whatsapp_clicks?: number
                    status?: 'active' | 'pending' | 'sold' | 'expired' | 'archived'
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "products_vendor_id_fkey"
                        columns: ["vendor_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            product_images: {
                Row: {
                    id: string
                    product_id: string
                    url: string
                    display_order: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    product_id: string
                    url: string
                    display_order?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    product_id?: string
                    url?: string
                    display_order?: number
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "product_images_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    }
                ]
            }
            saved_items: {
                Row: {
                    id: string
                    user_id: string
                    product_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    product_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    product_id?: string
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "saved_items_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "saved_items_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
