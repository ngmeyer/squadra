import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-01-28.clover'
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { campaignId, items } = body

    if (!campaignId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch campaign and store
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*, stores(*)')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    const taxRate = (campaign.stores as any)?.tax_rate || 0

    // Fetch variants
    const variantIds = items.map((item: any) => item.variantId)
    const { data: variants, error: variantsError } = await supabase
      .from('variants')
      .select('id, price_cents, campaign_product_id, campaign_products(customization_config)')
      .in('id', variantIds)

    if (variantsError || !variants) {
      return NextResponse.json(
        { error: 'Variants not found' },
        { status: 404 }
      )
    }

    // Calculate totals
    let subtotalCents = 0
    for (const item of items) {
      const variant = variants.find((v: any) => v.id === item.variantId)
      if (!variant) {
        return NextResponse.json(
          { error: `Variant ${item.variantId} not found` },
          { status: 404 }
        )
      }

      let itemPrice = variant.price_cents

      // Add customization cost
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

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'usd',
      metadata: {
        campaignId,
        items: JSON.stringify(items)
      },
      automatic_payment_methods: {
        enabled: true
      }
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      subtotalCents,
      taxCents,
      totalCents
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
