import { sendEmail } from './client'
import { createClient } from '@/lib/supabase/server'

/**
 * Send new order notification to store owner
 */
export async function sendNewOrderNotification(orderId: string) {
  try {
    const supabase = await createClient()

    const { data: order } = await supabase
      .from('orders')
      .select(
        `
        *,
        campaign:campaigns(
          name,
          store:stores(name, contact_email, created_by)
        )
      `
      )
      .eq('id', orderId)
      .single()

    if (!order) {
      console.error('Order not found for notification')
      return
    }

    const storeEmail = order.campaign.store.contact_email

    const html = `
      <h2>New Order Received! 🎉</h2>
      <p>You have a new order from ${order.customer_name}.</p>
      
      <h3>Order Details:</h3>
      <ul>
        <li><strong>Order Number:</strong> ${order.order_number}</li>
        <li><strong>Customer:</strong> ${order.customer_name} (${order.customer_email})</li>
        <li><strong>Campaign:</strong> ${order.campaign.name}</li>
        <li><strong>Total:</strong> $${(order.total_cents / 100).toFixed(2)}</li>
        <li><strong>Status:</strong> ${order.status}</li>
      </ul>
      
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}" style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          View Order
        </a>
      </p>
      
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        ${order.campaign.store.name} • Powered by Squadra
      </p>
    `

    await sendEmail({
      to: storeEmail,
      subject: `New Order: ${order.order_number}`,
      html,
    })

    console.log('New order notification sent to:', storeEmail)
  } catch (error) {
    console.error('Failed to send new order notification:', error)
  }
}

/**
 * Send daily summary email to store owner
 */
export async function sendDailySummaryEmail(storeId: string) {
  try {
    const supabase = await createClient()

    // Get store info
    const { data: store } = await supabase
      .from('stores')
      .select('name, contact_email')
      .eq('id', storeId)
      .single()

    if (!store) {
      console.error('Store not found')
      return
    }

    // Get today's orders
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: orders, count } = await supabase
      .from('orders')
      .select(
        `
        *,
        campaign:campaigns!inner(store_id)
      `,
        { count: 'exact' }
      )
      .eq('campaign.store_id', storeId)
      .gte('created_at', today.toISOString())

    if (!orders || orders.length === 0) {
      console.log('No orders today for store:', storeId)
      return
    }

    const totalRevenue = orders.reduce((sum, order) => sum + order.total_cents, 0)
    const paidOrders = orders.filter((o) => o.status === 'paid').length
    const pendingOrders = orders.filter((o) => o.status === 'pending').length

    const html = `
      <h2>Daily Summary for ${store.name}</h2>
      <p>Here's your summary for ${today.toLocaleDateString()}:</p>
      
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Today's Stats</h3>
        <ul style="list-style: none; padding: 0;">
          <li style="margin: 10px 0;"><strong>Total Orders:</strong> ${count}</li>
          <li style="margin: 10px 0;"><strong>Paid Orders:</strong> ${paidOrders}</li>
          <li style="margin: 10px 0;"><strong>Pending Orders:</strong> ${pendingOrders}</li>
          <li style="margin: 10px 0;"><strong>Total Revenue:</strong> $${(totalRevenue / 100).toFixed(2)}</li>
        </ul>
      </div>
      
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders" style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          View All Orders
        </a>
      </p>
      
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        ${store.name} • Powered by Squadra
      </p>
    `

    await sendEmail({
      to: store.contact_email,
      subject: `Daily Summary - ${store.name}`,
      html,
    })

    console.log('Daily summary sent to:', store.contact_email)
  } catch (error) {
    console.error('Failed to send daily summary:', error)
  }
}

/**
 * Send campaign closing reminder to store owner
 */
export async function sendCampaignClosingReminder(campaignId: string) {
  try {
    const supabase = await createClient()

    const { data: campaign } = await supabase
      .from('campaigns')
      .select(
        `
        *,
        store:stores(name, contact_email)
      `
      )
      .eq('id', campaignId)
      .single()

    if (!campaign) {
      console.error('Campaign not found')
      return
    }

    const closesAt = new Date(campaign.closes_at)
    const now = new Date()
    const hoursRemaining = Math.round((closesAt.getTime() - now.getTime()) / (1000 * 60 * 60))

    const html = `
      <h2>Campaign Closing Soon ⏰</h2>
      <p>Your campaign <strong>${campaign.name}</strong> will close in approximately ${hoursRemaining} hours.</p>
      
      <p>Closing time: ${closesAt.toLocaleString()}</p>
      
      <p>Make sure you're ready to fulfill orders after the campaign closes!</p>
      
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/campaigns/${campaign.id}" style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          View Campaign
        </a>
      </p>
      
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        ${campaign.store.name} • Powered by Squadra
      </p>
    `

    await sendEmail({
      to: campaign.store.contact_email,
      subject: `Campaign Closing Soon: ${campaign.name}`,
      html,
    })

    console.log('Campaign closing reminder sent')
  } catch (error) {
    console.error('Failed to send campaign closing reminder:', error)
  }
}
