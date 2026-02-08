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
        }
    }
}
