import { z } from 'zod'

// Helper to generate slug from name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Slug validation regex: lowercase alphanumeric and hyphens only
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// Hex color validation regex
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/

export const storeSchema = z.object({
  name: z
    .string()
    .min(1, 'Store name is required')
    .min(2, 'Store name must be at least 2 characters')
    .max(100, 'Store name must be less than 100 characters'),
  
  slug: z
    .string()
    .min(1, 'Slug is required')
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug must be less than 100 characters')
    .regex(slugRegex, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  
  logo_url: z
    .string()
    .url('Invalid logo URL')
    .optional()
    .nullable(),
  
  theme_colors: z.object({
    primary: z
      .string()
      .regex(hexColorRegex, 'Primary color must be a valid hex color (e.g., #000000)'),
    secondary: z
      .string()
      .regex(hexColorRegex, 'Secondary color must be a valid hex color (e.g., #ffffff)'),
  }),
  
  contact_email: z
    .string()
    .email('Invalid email address')
    .optional()
    .nullable()
    .or(z.literal('')),
  
  shipping_policy: z
    .string()
    .max(5000, 'Shipping policy must be less than 5000 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  
  tax_rate: z
    .number()
    .min(0, 'Tax rate must be positive')
    .max(1, 'Tax rate must be less than 100%'),
})

export type StoreFormData = z.infer<typeof storeSchema>

// Schema for creating a store (all fields required except optional ones)
export const createStoreSchema = storeSchema

// Schema for updating a store (all fields optional)
export const updateStoreSchema = storeSchema.partial()

// Type for form data
export type CreateStoreInput = z.infer<typeof createStoreSchema>
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>
