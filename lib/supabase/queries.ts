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
