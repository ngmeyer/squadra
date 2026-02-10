'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  createCampaign,
  updateCampaign,
  deleteCampaign,
  createCampaignProduct,
  updateCampaignProduct,
  deleteCampaignProduct,
  createVariants,
} from '@/lib/supabase/queries'
import {
  createCampaignSchema,
  updateCampaignSchema,
  createCampaignProductSchema,
  updateCampaignProductSchema,
} from '@/lib/validations/campaign'

// ========== CAMPAIGN ACTIONS ==========

export async function createCampaignAction(formData: FormData) {
  try {
    const data = {
      store_id: formData.get('store_id') as string,
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      opens_at: formData.get('opens_at') as string,
      closes_at: formData.get('closes_at') as string,
      ships_at: formData.get('ships_at') as string,
      ship_to_name: formData.get('ship_to_name') as string,
      ship_to_address: formData.get('ship_to_address') as string,
      ship_to_phone: (formData.get('ship_to_phone') as string) || null,
      custom_message: (formData.get('custom_message') as string) || null,
      status: (formData.get('status') as any) || 'draft',
    }

    // Validate
    const validated = createCampaignSchema.parse(data)

    // Create campaign
    const campaign = await createCampaign(validated)

    revalidatePath('/campaigns')
    return { success: true, campaignId: campaign.id }
  } catch (error: any) {
    console.error('Create campaign error:', error)
    return { success: false, error: error.message || 'Failed to create campaign' }
  }
}

export async function updateCampaignAction(id: string, formData: FormData) {
  try {
    const data: any = {}

    // Only include fields that are present
    const fields = [
      'name',
      'slug',
      'opens_at',
      'closes_at',
      'ships_at',
      'ship_to_name',
      'ship_to_address',
      'ship_to_phone',
      'custom_message',
      'status',
    ]

    fields.forEach((field) => {
      const value = formData.get(field)
      if (value !== null && value !== undefined && value !== '') {
        data[field] = value
      }
    })

    // Validate
    const validated = updateCampaignSchema.parse(data)

    // Update campaign
    await updateCampaign(id, validated)

    revalidatePath('/campaigns')
    revalidatePath(`/campaigns/${id}`)
    return { success: true }
  } catch (error: any) {
    console.error('Update campaign error:', error)
    return { success: false, error: error.message || 'Failed to update campaign' }
  }
}

export async function deleteCampaignAction(id: string) {
  try {
    await deleteCampaign(id)

    revalidatePath('/campaigns')
    redirect('/campaigns')
  } catch (error: any) {
    console.error('Delete campaign error:', error)
    return { success: false, error: error.message || 'Failed to delete campaign' }
  }
}

export async function updateCampaignStatusAction(id: string, status: string) {
  try {
    const formData = new FormData()
    formData.set('status', status)
    return await updateCampaignAction(id, formData)
  } catch (error: any) {
    console.error('Update campaign status error:', error)
    return { success: false, error: error.message || 'Failed to update campaign status' }
  }
}

// ========== PRODUCT ACTIONS ==========

export async function createProductAction(campaignId: string, data: any) {
  try {
    // Parse and validate
    const validated = createCampaignProductSchema.parse({
      ...data,
      campaign_id: campaignId,
    })

    // Create product
    const product = await createCampaignProduct(validated)

    // If variant groups exist, generate variants
    if (validated.variant_groups && validated.variant_groups.length > 0) {
      const variants = generateVariantMatrix(
        validated.variant_groups,
        validated.base_price_cents
      )
      await createVariants(product.id, variants)
    }

    revalidatePath(`/campaigns/${campaignId}`)
    return { success: true, productId: product.id }
  } catch (error: any) {
    console.error('Create product error:', error)
    return { success: false, error: error.message || 'Failed to create product' }
  }
}

export async function updateProductAction(id: string, data: any) {
  try {
    // Validate
    const validated = updateCampaignProductSchema.parse(data)

    // Update product
    const product = await updateCampaignProduct(id, validated)

    revalidatePath(`/campaigns/${product.campaign_id}`)
    return { success: true }
  } catch (error: any) {
    console.error('Update product error:', error)
    return { success: false, error: error.message || 'Failed to update product' }
  }
}

export async function deleteProductAction(id: string, campaignId: string) {
  try {
    await deleteCampaignProduct(id)

    revalidatePath(`/campaigns/${campaignId}`)
    return { success: true }
  } catch (error: any) {
    console.error('Delete product error:', error)
    return { success: false, error: error.message || 'Failed to delete product' }
  }
}

// ========== HELPER FUNCTIONS ==========

/**
 * Generate all variant combinations from variant groups
 */
function generateVariantMatrix(
  variantGroups: Array<{
    name: string
    options: Array<{ value: string; price_adjustment_cents: number }>
  }>,
  basePrice: number
) {
  const variants: Array<{
    sku: string
    option_combo: Record<string, string>
    price_cents: number
    image_url: string | null
  }> = []

  const generate = (
    index: number,
    current: Record<string, string>,
    currentPrice: number
  ) => {
    if (index === variantGroups.length) {
      // Generate SKU from combination
      const skuParts = Object.values(current).map((v) =>
        v.substring(0, 3).toUpperCase()
      )
      const sku = skuParts.join('-') + '-' + Math.random().toString(36).substring(2, 6).toUpperCase()

      variants.push({
        sku,
        option_combo: { ...current },
        price_cents: currentPrice,
        image_url: null,
      })
      return
    }

    const group = variantGroups[index]
    for (const option of group.options) {
      current[group.name] = option.value
      generate(index + 1, current, currentPrice + option.price_adjustment_cents)
    }
  }

  generate(0, {}, basePrice)
  return variants
}
