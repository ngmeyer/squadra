// Generated TypeScript types for Supabase database schema
// Based on supabase/schema.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// =============================================================================
// ENUMS
// =============================================================================

export type CampaignStatus = 'draft' | 'active' | 'closed' | 'archived'
export type ProductStatus = 'draft' | 'active' | 'hidden'
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled'
export type CustomizationType = 'none' | 'optional' | 'required'

// =============================================================================
// DATABASE TYPES
// =============================================================================

export interface Database {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string
          slug: string
          name: string
          logo_url: string | null
          theme_colors: Json
          contact_email: string
          shipping_policy: string | null
          tax_rate: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          logo_url?: string | null
          theme_colors?: Json
          contact_email: string
          shipping_policy?: string | null
          tax_rate?: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          logo_url?: string | null
          theme_colors?: Json
          contact_email?: string
          shipping_policy?: string | null
          tax_rate?: number
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          store_id: string
          name: string
          slug: string
          opens_at: string
          closes_at: string
          ships_at: string | null
          ship_to_name: string
          ship_to_address: string
          ship_to_phone: string
          custom_message: string | null
          status: CampaignStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          name: string
          slug: string
          opens_at: string
          closes_at: string
          ships_at?: string | null
          ship_to_name: string
          ship_to_address: string
          ship_to_phone: string
          custom_message?: string | null
          status?: CampaignStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          name?: string
          slug?: string
          opens_at?: string
          closes_at?: string
          ships_at?: string | null
          ship_to_name?: string
          ship_to_address?: string
          ship_to_phone?: string
          custom_message?: string | null
          status?: CampaignStatus
          created_at?: string
          updated_at?: string
        }
      }
      campaign_products: {
        Row: {
          id: string
          campaign_id: string
          title: string
          description: string | null
          base_price_cents: number
          category: string | null
          images: Json
          variant_groups: Json
          customization_config: Json
          status: ProductStatus
          sort_order: number
          total_ordered: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          title: string
          description?: string | null
          base_price_cents: number
          category?: string | null
          images?: Json
          variant_groups?: Json
          customization_config?: Json
          status?: ProductStatus
          sort_order?: number
          total_ordered?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          title?: string
          description?: string | null
          base_price_cents?: number
          category?: string | null
          images?: Json
          variant_groups?: Json
          customization_config?: Json
          status?: ProductStatus
          sort_order?: number
          total_ordered?: number
          created_at?: string
          updated_at?: string
        }
      }
      variants: {
        Row: {
          id: string
          campaign_product_id: string
          sku: string
          option_combo: Json
          price_cents: number
          image_url: string | null
          total_ordered: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_product_id: string
          sku: string
          option_combo?: Json
          price_cents: number
          image_url?: string | null
          total_ordered?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_product_id?: string
          sku?: string
          option_combo?: Json
          price_cents?: number
          image_url?: string | null
          total_ordered?: number
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          campaign_id: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          subtotal_cents: number
          tax_cents: number
          total_cents: number
          stripe_payment_intent_id: string | null
          stripe_checkout_session_id: string | null
          status: OrderStatus
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: string
          campaign_id: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          subtotal_cents: number
          tax_cents?: number
          total_cents: number
          stripe_payment_intent_id?: string | null
          stripe_checkout_session_id?: string | null
          status?: OrderStatus
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          campaign_id?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          subtotal_cents?: number
          tax_cents?: number
          total_cents?: number
          stripe_payment_intent_id?: string | null
          stripe_checkout_session_id?: string | null
          status?: OrderStatus
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          variant_id: string
          customization_value: string | null
          quantity: number
          unit_price_cents: number
          total_price_cents: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          variant_id: string
          customization_value?: string | null
          quantity?: number
          unit_price_cents: number
          total_price_cents: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          variant_id?: string
          customization_value?: string | null
          quantity?: number
          unit_price_cents?: number
          total_price_cents?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      campaign_status: CampaignStatus
      product_status: ProductStatus
      order_status: OrderStatus
      customization_type: CustomizationType
    }
  }
}

// =============================================================================
// HELPER TYPES
// =============================================================================

// Store with theme colors typed
export interface StoreThemeColors {
  primary: string
  secondary: string
}

// Product customization config typed
export interface ProductCustomizationConfig {
  type: CustomizationType
  label: string
  placeholder: string
  max_length: number
  price_cents: number
}

// Variant option combo typed
export interface VariantOptionCombo {
  [key: string]: string // e.g., { "Size": "Large", "Color": "Navy" }
}

// Variant group structure
export interface VariantGroup {
  name: string // e.g., "Size"
  options: VariantOption[]
}

export interface VariantOption {
  value: string // e.g., "Large"
  label: string // e.g., "L"
  price_modifier_cents: number // +$200 for XL
}

// Product image structure
export interface ProductImage {
  url: string
  alt: string
  is_primary?: boolean
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

// =============================================================================
// CONVENIENCE EXPORTS
// =============================================================================

export type Store = Tables<'stores'>
export type StoreInsert = TablesInsert<'stores'>
export type StoreUpdate = TablesUpdate<'stores'>

export type Campaign = Tables<'campaigns'>
export type CampaignInsert = TablesInsert<'campaigns'>
export type CampaignUpdate = TablesUpdate<'campaigns'>

export type CampaignProduct = Tables<'campaign_products'>
export type CampaignProductInsert = TablesInsert<'campaign_products'>
export type CampaignProductUpdate = TablesUpdate<'campaign_products'>

export type Variant = Tables<'variants'>
export type VariantInsert = TablesInsert<'variants'>
export type VariantUpdate = TablesUpdate<'variants'>

export type Order = Tables<'orders'>
export type OrderInsert = TablesInsert<'orders'>
export type OrderUpdate = TablesUpdate<'orders'>

export type OrderItem = Tables<'order_items'>
export type OrderItemInsert = TablesInsert<'order_items'>
export type OrderItemUpdate = TablesUpdate<'order_items'>

// =============================================================================
// JOINED/EXTENDED TYPES
// =============================================================================

export interface CampaignWithStore extends Campaign {
  store: Store
}

export interface CampaignProductWithVariants extends CampaignProduct {
  variants: Variant[]
}

export interface OrderWithItems extends Order {
  order_items: (OrderItem & {
    variant: Variant & {
      campaign_product: CampaignProduct
    }
  })[]
}

export interface OrderItemWithDetails extends OrderItem {
  variant: Variant
  product: CampaignProduct
}
