import { z } from 'zod'

// Helper to generate slug from name
export function generateCampaignSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Slug validation regex: lowercase alphanumeric and hyphens only
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// Campaign status enum
export const campaignStatusSchema = z.enum(['draft', 'active', 'closed', 'archived'])

// Variant group option schema
export const variantOptionSchema = z.object({
  value: z.string().min(1, 'Option value is required'),
  price_adjustment_cents: z.number().int('Price adjustment must be an integer'),
})

// Variant group schema
export const variantGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required (e.g., Size, Color)'),
  options: z.array(variantOptionSchema).min(1, 'At least one option is required'),
})

// Customization config schema
export const customizationConfigSchema = z.object({
  enabled: z.boolean(),
  type: z.enum(['none', 'optional', 'required']),
  label: z.string(),
  placeholder: z.string().optional(),
  max_length: z.number().int().positive().optional(),
  price_cents: z.number().int().nonnegative().optional(),
})

// Campaign schema
export const campaignSchema = z.object({
  store_id: z.string().uuid('Invalid store ID'),
  
  name: z
    .string()
    .min(1, 'Campaign name is required')
    .min(3, 'Campaign name must be at least 3 characters')
    .max(200, 'Campaign name must be less than 200 characters'),
  
  slug: z
    .string()
    .min(1, 'Slug is required')
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug must be less than 100 characters')
    .regex(slugRegex, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  
  opens_at: z.string().datetime('Invalid datetime format'),
  closes_at: z.string().datetime('Invalid datetime format'),
  ships_at: z.string().datetime('Invalid datetime format'),
  
  ship_to_name: z
    .string()
    .min(1, 'Ship to name is required')
    .max(200, 'Name must be less than 200 characters'),
  
  ship_to_address: z
    .string()
    .min(1, 'Ship to address is required')
    .max(1000, 'Address must be less than 1000 characters'),
  
  ship_to_phone: z
    .string()
    .max(50, 'Phone must be less than 50 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  
  custom_message: z
    .string()
    .max(5000, 'Message must be less than 5000 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  
  status: campaignStatusSchema.default('draft'),
})
  .refine((data) => new Date(data.opens_at) < new Date(data.closes_at), {
    message: 'Campaign must open before it closes',
    path: ['closes_at'],
  })
  .refine((data) => new Date(data.closes_at) < new Date(data.ships_at), {
    message: 'Campaign must close before it ships',
    path: ['ships_at'],
  })

// Product schema
export const campaignProductSchema = z.object({
  campaign_id: z.string().uuid('Invalid campaign ID'),
  
  title: z
    .string()
    .min(1, 'Product title is required')
    .min(3, 'Product title must be at least 3 characters')
    .max(200, 'Product title must be less than 200 characters'),
  
  description: z
    .string()
    .max(5000, 'Description must be less than 5000 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  
  base_price_cents: z
    .number()
    .int('Price must be an integer (cents)')
    .positive('Price must be positive'),
  
  category: z
    .string()
    .max(100, 'Category must be less than 100 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  
  images: z.array(z.string().url('Invalid image URL')).default([]),
  
  variant_groups: z.array(variantGroupSchema).default([]),
  
  customization_config: customizationConfigSchema.default({
    enabled: false,
    type: 'none',
    label: '',
  }),
  
  status: z.enum(['active', 'hidden', 'sold_out']).default('active'),
})

// Variant schema
export const variantSchema = z.object({
  campaign_product_id: z.string().uuid('Invalid product ID'),
  sku: z.string().min(1, 'SKU is required').max(100, 'SKU must be less than 100 characters'),
  option_combo: z.record(z.string(), z.string()),
  price_cents: z.number().int('Price must be an integer (cents)').positive('Price must be positive'),
  image_url: z.string().url('Invalid image URL').optional().nullable(),
})

// Type exports
export type CampaignFormData = z.infer<typeof campaignSchema>
export type CampaignProductFormData = z.infer<typeof campaignProductSchema>
export type VariantFormData = z.infer<typeof variantSchema>
export type VariantGroupFormData = z.infer<typeof variantGroupSchema>
export type CustomizationConfigFormData = z.infer<typeof customizationConfigSchema>

// Schema for creating (all fields required)
export const createCampaignSchema = campaignSchema
export const createCampaignProductSchema = campaignProductSchema
export const createVariantSchema = variantSchema

// Schema for updating (all fields optional except IDs)
export const updateCampaignSchema = campaignSchema.omit({ store_id: true }).partial()
export const updateCampaignProductSchema = campaignProductSchema.omit({ campaign_id: true }).partial()
export const updateVariantSchema = variantSchema.omit({ campaign_product_id: true }).partial()
