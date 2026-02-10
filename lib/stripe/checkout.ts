'use server'

import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-01-28.clover'
})

interface CreatePaymentIntentParams {
  campaignId: string
  items: Array<{
    variantId: string
    quantity: number
    customizationValue?: string
  }>
  customerEmail: string
  customerName: string
}

export async function createPaymentIntent(params: CreatePaymentIntentParams) {
  const supabase = await createClient()

  try {
    // Fetch campaign to get store tax rate
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('store_id, stores(tax_rate)')
      .eq('id', params.campaignId)
      .single()

    if (campaignError || !campaign) {
      throw new Error('Campaign not found')
    }

    const taxRate = (campaign.stores as any)?.tax_rate || 0

    // Fetch variants to calculate total
    const variantIds = params.items.map(item => item.variantId)
    const { data: variants, error: variantsError } = await supabase
      .from('variants')
      .select('id, price_cents, campaign_product_id, campaign_products(customization_config)')
      .in('id', variantIds)

    if (variantsError || !variants) {
      throw new Error('Variants not found')
    }

    // Calculate subtotal
    let subtotalCents = 0
    for (const item of params.items) {
      const variant = variants.find(v => v.id === item.variantId)
      if (!variant) {
        throw new Error(`Variant ${item.variantId} not found`)
      }

      let itemPrice = variant.price_cents
      
      // Add customization cost if applicable
      if (item.customizationValue) {
        const customConfig = (variant.campaign_products as any)?.customization_config
        if (customConfig?.price_cents) {
          itemPrice += customConfig.price_cents
        }
      }

      subtotalCents += itemPrice * item.quantity
    }

    // Calculate tax
    const taxCents = Math.round(subtotalCents * taxRate)
    const totalCents = subtotalCents + taxCents

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'usd',
      metadata: {
        campaignId: params.campaignId,
        customerEmail: params.customerEmail,
        customerName: params.customerName,
        items: JSON.stringify(params.items)
      },
      automatic_payment_methods: {
        enabled: true
      }
    })

    return {
      clientSecret: paymentIntent.client_secret,
      subtotalCents,
      taxCents,
      totalCents
    }
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw error
  }
}
