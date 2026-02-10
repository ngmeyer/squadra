'use server'

import { createClient } from '@/lib/supabase/server'
import { sendEmailTemplate } from '@/lib/email/client'
import OrderShippedEmail from '@/lib/email/templates/order-shipped'
import { revalidatePath } from 'next/cache'

export interface OrderItem {
  id: string
  quantity: number
  unit_price_cents: number
  total_price_cents: number
  customization_value: string | null
  variant: {
    id: string
    sku: string
    option_combo: Record<string, string>
    campaign_product: {
      title: string
    }
  }
}

export interface Order {
  id: string
  order_number: string
  customer_email: string
  customer_name: string
  customer_phone: string | null
  status: 'pending' | 'paid' | 'shipped' | 'cancelled'
  subtotal_cents: number
  tax_cents: number
  total_cents: number
  tracking_number: string | null
  shipped_at: string | null
  cancelled_at: string | null
  cancellation_reason: string | null
  notes: string | null
  created_at: string
  campaign: {
    id: string
    name: string
    ship_to_address: string
    store: {
      name: string
      contact_email: string
    }
  }
  order_items: OrderItem[]
}

/**
 * Mark an order as shipped
 */
export async function markAsShipped(
  orderId: string,
  trackingNumber?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Update order status
    const { data: order, error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'shipped',
        shipped_at: new Date().toISOString(),
        tracking_number: trackingNumber || null,
      })
      .eq('id', orderId)
      .select(
        `
        *,
        campaign:campaigns(
          id,
          name,
          ship_to_address,
          store:stores(name, contact_email)
        )
      `
      )
      .single()

    if (updateError) {
      console.error('Failed to update order:', updateError)
      return { success: false, error: updateError.message }
    }

    // Send shipped email
    try {
      await sendEmailTemplate(
        order.customer_email,
        `Your order #${order.order_number} has shipped!`,
        OrderShippedEmail({
          orderNumber: order.order_number,
          customerName: order.customer_name,
          trackingNumber: trackingNumber,
          shipToAddress: order.campaign.ship_to_address,
          storeName: order.campaign.store.name,
          storeContactEmail: order.campaign.store.contact_email,
        })
      )
    } catch (emailError) {
      console.error('Failed to send shipped email:', emailError)
      // Don't fail the operation if email fails
    }

    revalidatePath('/orders')
    revalidatePath(`/orders/${orderId}`)

    return { success: true }
  } catch (error) {
    console.error('Error marking order as shipped:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Cancel an order
 */
export async function cancelOrder(
  orderId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason || null,
      })
      .eq('id', orderId)

    if (error) {
      console.error('Failed to cancel order:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/orders')
    revalidatePath(`/orders/${orderId}`)

    return { success: true }
  } catch (error) {
    console.error('Error cancelling order:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Update order notes
 */
export async function updateOrderNotes(
  orderId: string,
  notes: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('orders')
      .update({ notes })
      .eq('id', orderId)

    if (error) {
      console.error('Failed to update order notes:', error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/orders/${orderId}`)

    return { success: true }
  } catch (error) {
    console.error('Error updating order notes:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get all orders with filters
 */
export async function getOrders(filters?: {
  status?: string
  campaignId?: string
  search?: string
}) {
  const supabase = await createClient()

  let query = supabase
    .from('orders')
    .select(
      `
      *,
      campaign:campaigns(
        id,
        name,
        store:stores(id, name, created_by)
      )
    `
    )
    .order('created_at', { ascending: false })

  // Apply filters
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.campaignId) {
    query = query.eq('campaign_id', filters.campaignId)
  }

  if (filters?.search) {
    query = query.or(
      `customer_email.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,order_number.ilike.%${filters.search}%`
    )
  }

  const { data, error } = await query

  if (error) {
    console.error('Failed to fetch orders:', error)
    return { orders: [], error: error.message }
  }

  return { orders: data || [], error: null }
}

/**
 * Get a single order with full details
 */
export async function getOrderById(orderId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      campaign:campaigns(
        id,
        name,
        slug,
        ship_to_address,
        ships_at,
        store:stores(id, name, slug, contact_email, created_by)
      ),
      order_items(
        id,
        quantity,
        unit_price_cents,
        total_price_cents,
        customization_value,
        variant:variants(
          id,
          sku,
          option_combo,
          campaign_product:campaign_products(title, images)
        )
      )
    `
    )
    .eq('id', orderId)
    .single()

  if (error) {
    console.error('Failed to fetch order:', error)
    return { order: null, error: error.message }
  }

  return { order: data, error: null }
}
