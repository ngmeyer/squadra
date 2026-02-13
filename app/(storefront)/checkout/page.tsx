'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadStripe, Stripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { CheckoutForm } from '@/components/storefront/checkout-form'
import { useCartStore } from '@/lib/stores/cart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const campaignId = searchParams.get('campaignId')
  const { items, campaignId: cartCampaignId } = useCartStore()
  
  const [clientSecret, setClientSecret] = useState('')
  const [publishableKey, setPublishableKey] = useState('')
  const [stripe, setStripe] = useState<Stripe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Validate cart
    if (items.length === 0) {
      router.push('/')
      return
    }

    if (!campaignId || campaignId !== cartCampaignId) {
      router.push('/')
      return
    }

    // Create payment intent and load Stripe
    const createIntent = async () => {
      try {
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            campaignId,
            items: items.map(item => ({
              variantId: item.variantId,
              quantity: item.quantity,
              customizationValue: item.customizationValue
            }))
          })
        })

        if (!response.ok) {
          throw new Error('Failed to create payment intent')
        }

        const data = await response.json()
        setClientSecret(data.clientSecret)
        setPublishableKey(data.publishableKey)
        
        // Load Stripe with store's publishable key
        const stripeInstance = await loadStripe(data.publishableKey)
        setStripe(stripeInstance)
      } catch (err) {
        console.error('Error:', err)
        setError('Failed to initialize checkout. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    createIntent()
  }, [campaignId, cartCampaignId, items, router])

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const subtotal = items.reduce((sum, item) => sum + (item.priceCents * item.quantity), 0)

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-gray-600">Loading checkout...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600 font-semibold">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.productTitle}</p>
                    <p className="text-gray-600">
                      {Object.entries(item.variantOptions).map(([k, v]) => `${k}: ${v}`).join(', ')}
                    </p>
                    {item.customizationValue && (
                      <p className="text-gray-600 italic">"{item.customizationValue}"</p>
                    )}
                    <p className="text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">{formatPrice(item.priceCents * item.quantity)}</p>
                </div>
              ))}
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <p className="text-xs text-gray-500">Tax calculated at checkout</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Checkout Form */}
        <div className="lg:col-span-2">
          {clientSecret && stripe && (
            <Elements
              stripe={stripe}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe'
                }
              }}
            >
              <CheckoutForm campaignId={campaignId!} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-gray-600">Loading checkout...</p>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
