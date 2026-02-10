'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createStore, updateStore, deleteStore, getStoreById } from '@/lib/supabase/queries'
import { createStoreSchema, updateStoreSchema } from '@/lib/validations/store'
import type { CreateStoreInput, UpdateStoreInput } from '@/lib/validations/store'

export async function createStoreAction(data: CreateStoreInput) {
  try {
    // Validate input
    const validated = createStoreSchema.parse(data)

    // Create store
    const store = await createStore(validated)

    // Revalidate pages
    revalidatePath('/stores')
    revalidatePath('/')

    return { success: true, data: store }
  } catch (error) {
    console.error('Error creating store:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to create store' }
  }
}

export async function updateStoreAction(id: string, data: UpdateStoreInput) {
  try {
    // Validate input
    const validated = updateStoreSchema.parse(data)

    // Update store
    const store = await updateStore(id, validated)

    // Revalidate pages
    revalidatePath('/stores')
    revalidatePath(`/stores/${id}`)
    revalidatePath('/')

    return { success: true, data: store }
  } catch (error) {
    console.error('Error updating store:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to update store' }
  }
}

export async function deleteStoreAction(id: string) {
  try {
    // Delete store
    await deleteStore(id)

    // Revalidate pages
    revalidatePath('/stores')
    revalidatePath('/')

    return { success: true }
  } catch (error) {
    console.error('Error deleting store:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to delete store' }
  }
}

export async function duplicateStoreAction(storeId: string, newName: string) {
  try {
    // Get the original store
    const originalStore = await getStoreById(storeId)
    if (!originalStore) {
      return { success: false, error: 'Store not found' }
    }

    // Generate a slug from the new name
    const newSlug = newName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Create the duplicated store
    const duplicatedStore = await createStore({
      name: newName,
      slug: newSlug,
      logo_url: originalStore.logo_url,
      theme_colors: originalStore.theme_colors,
      contact_email: originalStore.contact_email,
      shipping_policy: originalStore.shipping_policy,
      tax_rate: originalStore.tax_rate,
    })

    // Revalidate pages
    revalidatePath('/stores')
    revalidatePath('/')

    return { success: true, data: duplicatedStore }
  } catch (error) {
    console.error('Error duplicating store:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to duplicate store' }
  }
}
