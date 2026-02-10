'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createStore, updateStore, deleteStore } from '@/lib/supabase/queries'
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
