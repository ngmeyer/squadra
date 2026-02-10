import { createClient, requireAuth } from './server'

export interface Store {
  id: string
  slug: string
  name: string
  logo_url: string | null
  theme_colors: {
    primary: string
    secondary: string
  }
  contact_email: string | null
  shipping_policy: string | null
  tax_rate: number
  created_by: string
  created_at: string
}

export interface CreateStoreData {
  slug: string
  name: string
  logo_url?: string | null
  theme_colors?: {
    primary: string
    secondary: string
  }
  contact_email?: string | null
  shipping_policy?: string | null
  tax_rate?: number
}

export interface UpdateStoreData {
  slug?: string
  name?: string
  logo_url?: string | null
  theme_colors?: {
    primary: string
    secondary: string
  }
  contact_email?: string | null
  shipping_policy?: string | null
  tax_rate?: number
}

/**
 * Get all stores for the current user
 */
export async function getStores(): Promise<Store[]> {
  const supabase = await createClient()
  const user = await requireAuth()

  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching stores:', error)
    throw new Error('Failed to fetch stores')
  }

  return data || []
}

/**
 * Get a single store by ID
 */
export async function getStoreById(id: string): Promise<Store | null> {
  const supabase = await createClient()
  const user = await requireAuth()

  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('id', id)
    .eq('created_by', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching store:', error)
    throw new Error('Failed to fetch store')
  }

  return data
}

/**
 * Get a store by slug (for public URLs)
 */
export async function getStoreBySlug(slug: string): Promise<Store | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching store by slug:', error)
    throw new Error('Failed to fetch store')
  }

  return data
}

/**
 * Create a new store
 */
export async function createStore(data: CreateStoreData): Promise<Store> {
  const supabase = await createClient()
  const user = await requireAuth()

  const { data: store, error } = await supabase
    .from('stores')
    .insert({
      ...data,
      created_by: user.id,
      theme_colors: data.theme_colors || { primary: '#000000', secondary: '#ffffff' },
      tax_rate: data.tax_rate || 0,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating store:', error)
    if (error.code === '23505') {
      throw new Error('A store with this slug already exists')
    }
    throw new Error('Failed to create store')
  }

  return store
}

/**
 * Update a store
 */
export async function updateStore(id: string, data: UpdateStoreData): Promise<Store> {
  const supabase = await createClient()
  const user = await requireAuth()

  const { data: store, error } = await supabase
    .from('stores')
    .update(data)
    .eq('id', id)
    .eq('created_by', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating store:', error)
    if (error.code === '23505') {
      throw new Error('A store with this slug already exists')
    }
    throw new Error('Failed to update store')
  }

  return store
}

/**
 * Delete a store (soft delete by setting deleted_at)
 * Note: For now we'll do a hard delete, but in production you'd want soft delete
 */
export async function deleteStore(id: string): Promise<void> {
  const supabase = await createClient()
  const user = await requireAuth()

  const { error } = await supabase
    .from('stores')
    .delete()
    .eq('id', id)
    .eq('created_by', user.id)

  if (error) {
    console.error('Error deleting store:', error)
    throw new Error('Failed to delete store')
  }
}

/**
 * Check if a slug is available
 */
export async function isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
  const supabase = await createClient()

  let query = supabase
    .from('stores')
    .select('id')
    .eq('slug', slug)

  if (excludeId) {
    query = query.neq('id', excludeId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error checking slug:', error)
    return false
  }

  return !data || data.length === 0
}

// ========== CAMPAIGNS ==========

export type CampaignStatus = 'draft' | 'active' | 'closed' | 'archived'

export interface Campaign {
  id: string
  store_id: string
  name: string
  slug: string
  opens_at: string
  closes_at: string
  ships_at: string
  ship_to_name: string
  ship_to_address: string
  ship_to_phone: string | null
  custom_message: string | null
  status: CampaignStatus
  created_at: string
  updated_at: string
}

export interface CreateCampaignData {
  store_id: string
  name: string
  slug: string
  opens_at: string
  closes_at: string
  ships_at: string
  ship_to_name: string
  ship_to_address: string
  ship_to_phone?: string | null
  custom_message?: string | null
  status?: CampaignStatus
}

export interface UpdateCampaignData {
  name?: string
  slug?: string
  opens_at?: string
  closes_at?: string
  ships_at?: string
  ship_to_name?: string
  ship_to_address?: string
  ship_to_phone?: string | null
  custom_message?: string | null
  status?: CampaignStatus
}

/**
 * Get all campaigns for a store
 */
export async function getCampaigns(storeId: string): Promise<Campaign[]> {
  const supabase = await createClient()
  const user = await requireAuth()

  // Verify user owns the store
  const store = await getStoreById(storeId)
  if (!store) {
    throw new Error('Store not found or access denied')
  }

  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching campaigns:', error)
    throw new Error('Failed to fetch campaigns')
  }

  return data || []
}

/**
 * Get a single campaign by ID (with products)
 */
export async function getCampaignById(id: string): Promise<(Campaign & { products?: CampaignProduct[] }) | null> {
  const supabase = await createClient()
  const user = await requireAuth()

  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      store:stores!inner(created_by),
      products:campaign_products(*)
    `)
    .eq('id', id)
    .eq('store.created_by', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching campaign:', error)
    throw new Error('Failed to fetch campaign')
  }

  return data
}

/**
 * Get a campaign by slug (public access)
 */
export async function getCampaignBySlug(storeSlug: string, campaignSlug: string): Promise<(Campaign & { store?: Store; products?: CampaignProduct[] }) | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      store:stores!inner(*),
      products:campaign_products(*)
    `)
    .eq('store.slug', storeSlug)
    .eq('slug', campaignSlug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching campaign by slug:', error)
    throw new Error('Failed to fetch campaign')
  }

  return data
}

/**
 * Create a new campaign
 */
export async function createCampaign(data: CreateCampaignData): Promise<Campaign> {
  const supabase = await createClient()
  const user = await requireAuth()

  // Verify user owns the store
  const store = await getStoreById(data.store_id)
  if (!store) {
    throw new Error('Store not found or access denied')
  }

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .insert({
      ...data,
      status: data.status || 'draft',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating campaign:', error)
    if (error.code === '23505') {
      throw new Error('A campaign with this slug already exists for this store')
    }
    throw new Error('Failed to create campaign')
  }

  return campaign
}

/**
 * Update a campaign
 */
export async function updateCampaign(id: string, data: UpdateCampaignData): Promise<Campaign> {
  const supabase = await createClient()
  const user = await requireAuth()

  // Verify user owns the campaign through the store
  const campaign = await getCampaignById(id)
  if (!campaign) {
    throw new Error('Campaign not found or access denied')
  }

  const { data: updated, error } = await supabase
    .from('campaigns')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating campaign:', error)
    if (error.code === '23505') {
      throw new Error('A campaign with this slug already exists for this store')
    }
    throw new Error('Failed to update campaign')
  }

  return updated
}

/**
 * Delete a campaign
 */
export async function deleteCampaign(id: string): Promise<void> {
  const supabase = await createClient()
  const user = await requireAuth()

  // Verify user owns the campaign
  const campaign = await getCampaignById(id)
  if (!campaign) {
    throw new Error('Campaign not found or access denied')
  }

  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting campaign:', error)
    throw new Error('Failed to delete campaign')
  }
}

/**
 * Update campaign statuses based on dates
 * - draft → active when opens_at <= now
 * - active → closed when closes_at <= now
 */
export async function updateCampaignStatuses(): Promise<{
  activated: number
  closed: number
}> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  // Activate draft campaigns
  const { data: activated, error: activateError } = await supabase
    .from('campaigns')
    .update({ status: 'active' })
    .eq('status', 'draft')
    .lte('opens_at', now)
    .select('id')

  if (activateError) {
    console.error('Error activating campaigns:', activateError)
    throw new Error('Failed to activate campaigns')
  }

  // Close active campaigns
  const { data: closed, error: closeError } = await supabase
    .from('campaigns')
    .update({ status: 'closed' })
    .eq('status', 'active')
    .lte('closes_at', now)
    .select('id')

  if (closeError) {
    console.error('Error closing campaigns:', closeError)
    throw new Error('Failed to close campaigns')
  }

  return {
    activated: activated?.length || 0,
    closed: closed?.length || 0,
  }
}

// ========== CAMPAIGN PRODUCTS ==========

export type ProductStatus = 'active' | 'hidden' | 'sold_out'

export interface VariantGroup {
  name: string
  options: Array<{
    value: string
    price_adjustment_cents: number
  }>
}

export interface CustomizationConfig {
  enabled: boolean
  type: 'none' | 'optional' | 'required'
  label: string
  placeholder?: string
  max_length?: number
  price_cents?: number
}

export interface CampaignProduct {
  id: string
  campaign_id: string
  title: string
  description: string | null
  base_price_cents: number
  category: string | null
  images: string[]
  variant_groups: VariantGroup[]
  customization_config: CustomizationConfig
  status: ProductStatus
  created_at: string
  updated_at: string
}

export interface CreateCampaignProductData {
  campaign_id: string
  title: string
  description?: string | null
  base_price_cents: number
  category?: string | null
  images?: string[]
  variant_groups?: VariantGroup[]
  customization_config?: CustomizationConfig
  status?: ProductStatus
}

export interface UpdateCampaignProductData {
  title?: string
  description?: string | null
  base_price_cents?: number
  category?: string | null
  images?: string[]
  variant_groups?: VariantGroup[]
  customization_config?: CustomizationConfig
  status?: ProductStatus
}

/**
 * Get all products for a campaign
 */
export async function getCampaignProducts(campaignId: string): Promise<CampaignProduct[]> {
  const supabase = await createClient()
  const user = await requireAuth()

  // Verify user owns the campaign
  const campaign = await getCampaignById(campaignId)
  if (!campaign) {
    throw new Error('Campaign not found or access denied')
  }

  const { data, error } = await supabase
    .from('campaign_products')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching campaign products:', error)
    throw new Error('Failed to fetch campaign products')
  }

  return data || []
}

/**
 * Create a new campaign product
 */
export async function createCampaignProduct(data: CreateCampaignProductData): Promise<CampaignProduct> {
  const supabase = await createClient()
  const user = await requireAuth()

  // Verify user owns the campaign
  const campaign = await getCampaignById(data.campaign_id)
  if (!campaign) {
    throw new Error('Campaign not found or access denied')
  }

  const { data: product, error } = await supabase
    .from('campaign_products')
    .insert({
      ...data,
      images: data.images || [],
      variant_groups: data.variant_groups || [],
      customization_config: data.customization_config || {
        enabled: false,
        type: 'none',
        label: '',
      },
      status: data.status || 'active',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating campaign product:', error)
    throw new Error('Failed to create campaign product')
  }

  return product
}

/**
 * Update a campaign product
 */
export async function updateCampaignProduct(id: string, data: UpdateCampaignProductData): Promise<CampaignProduct> {
  const supabase = await createClient()
  const user = await requireAuth()

  // Get product to verify ownership
  const { data: existing, error: fetchError } = await supabase
    .from('campaign_products')
    .select(`
      *,
      campaign:campaigns!inner(
        store:stores!inner(created_by)
      )
    `)
    .eq('id', id)
    .single()

  if (fetchError || !existing || existing.campaign?.store?.created_by !== user.id) {
    throw new Error('Product not found or access denied')
  }

  const { data: updated, error } = await supabase
    .from('campaign_products')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating campaign product:', error)
    throw new Error('Failed to update campaign product')
  }

  return updated
}

/**
 * Delete a campaign product
 */
export async function deleteCampaignProduct(id: string): Promise<void> {
  const supabase = await createClient()
  const user = await requireAuth()

  // Get product to verify ownership
  const { data: existing, error: fetchError } = await supabase
    .from('campaign_products')
    .select(`
      *,
      campaign:campaigns!inner(
        store:stores!inner(created_by)
      )
    `)
    .eq('id', id)
    .single()

  if (fetchError || !existing || existing.campaign?.store?.created_by !== user.id) {
    throw new Error('Product not found or access denied')
  }

  const { error } = await supabase
    .from('campaign_products')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting campaign product:', error)
    throw new Error('Failed to delete campaign product')
  }
}

// ========== VARIANTS ==========

export interface Variant {
  id: string
  campaign_product_id: string
  sku: string
  option_combo: Record<string, string>
  price_cents: number
  image_url: string | null
  created_at: string
}

export interface CreateVariantData {
  campaign_product_id: string
  sku: string
  option_combo: Record<string, string>
  price_cents: number
  image_url?: string | null
}

/**
 * Create multiple variants at once (for variant matrix)
 */
export async function createVariants(productId: string, variants: Omit<CreateVariantData, 'campaign_product_id'>[]): Promise<Variant[]> {
  const supabase = await createClient()
  const user = await requireAuth()

  // Verify user owns the product
  const { data: existing, error: fetchError } = await supabase
    .from('campaign_products')
    .select(`
      *,
      campaign:campaigns!inner(
        store:stores!inner(created_by)
      )
    `)
    .eq('id', productId)
    .single()

  if (fetchError || !existing || existing.campaign?.store?.created_by !== user.id) {
    throw new Error('Product not found or access denied')
  }

  const variantsToInsert = variants.map(v => ({
    ...v,
    campaign_product_id: productId,
  }))

  const { data, error } = await supabase
    .from('variants')
    .insert(variantsToInsert)
    .select()

  if (error) {
    console.error('Error creating variants:', error)
    throw new Error('Failed to create variants')
  }

  return data || []
}
