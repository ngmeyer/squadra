import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/service'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY')
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('Missing STRIPE_WEBHOOK_SECRET')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-01-28.clover'
})

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    await handlePaymentSuccess(paymentIntent)
  }

  return NextResponse.json({ received: true })
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    const supabase = createClient()

    // Extract metadata
    const campaignId = paymentIntent.metadata.campaignId
    const items = JSON.parse(paymentIntent.metadata.items || '[]')
    const customerEmail = paymentIntent.receipt_email || ''
    const customerName = paymentIntent.shipping?.name || paymentIntent.metadata.customerName || ''

    if (!campaignId || items.length === 0) {
      console.error('Invalid payment intent metadata')
      return
    }

    // Fetch variants to calculate prices
    const variantIds = items.map((item: any) => item.variantId)
    const { data: variants } = await supabase
      .from('variants')
      .select('id, price_cents, campaign_product_id, campaign_products(customization_config)')
      .in('id', variantIds) as {
        data: Array<{
          id: string
          price_cents: number
          campaign_product_id: string
          campaign_products: { customization_config: any } | null
        }> | null
      }

    if (!variants) {
      console.error('Variants not found')
      return
    }

    // Fetch campaign to get store_id
    const { data: campaignData } = await supabase
      .from('campaigns')
      .select('store_id')
      .eq('id', campaignId)
      .single() as { data: { store_id: string } | null }

    if (!campaignData) {
      console.error('Campaign not found')
      return
    }

    // Fetch store to get tax rate
    const { data: storeData } = await supabase
      .from('stores')
      .select('tax_rate')
      .eq('id', campaignData.store_id)
      .single() as { data: { tax_rate: number } | null }

    const taxRate = storeData?.tax_rate || 0

    // Calculate totals
    let subtotalCents = 0
    for (const item of items) {
      const variant = variants.find((v: any) => v.id === item.variantId)
      if (!variant) continue

      let itemPrice = variant.price_cents
      if (item.customizationValue) {
        const customConfig = (variant.campaign_products as any)?.customization_config
        if (customConfig?.price_cents) {
          itemPrice += customConfig.price_cents
        }
      }

      subtotalCents += itemPrice * item.quantity
    }

    const taxCents = Math.round(subtotalCents * taxRate)
    const totalCents = subtotalCents + taxCents

    // Create order
    const { data: order, error: orderError } = await (supabase
      .from('orders')
      .insert({
        campaign_id: campaignId,
        customer_email: customerEmail,
        customer_name: customerName,
        subtotal_cents: subtotalCents,
        tax_cents: taxCents,
        total_cents: totalCents,
        stripe_payment_intent_id: paymentIntent.id,
        status: 'paid'
      } as any)
      .select()
      .single() as any)

    if (orderError) {
      console.error('Error creating order:', orderError)
      return
    }

    // Create order items
    const orderItems = []
    for (const item of items) {
      const variant = variants.find((v: any) => v.id === item.variantId)
      if (!variant) continue

      let itemPrice = variant.price_cents
      if (item.customizationValue) {
        const customConfig = (variant.campaign_products as any)?.customization_config
        if (customConfig?.price_cents) {
          itemPrice += customConfig.price_cents
        }
      }

      orderItems.push({
        order_id: order.id,
        variant_id: item.variantId,
        customization_value: item.customizationValue || null,
        quantity: item.quantity,
        unit_price_cents: itemPrice,
        total_price_cents: itemPrice * item.quantity
      })
    }

    const { error: itemsError } = await (supabase
      .from('order_items')
      .insert(orderItems as any) as any)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      return
    }

    // TODO: Update variant order counts (requires DB function)
    // for (const item of items) {
    //   await supabase.rpc('increment_variant_orders', {
    //     variant_id: item.variantId,
    //     quantity: item.quantity
    //   })
    // }

    console.log('Order created successfully:', order.id)
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}
