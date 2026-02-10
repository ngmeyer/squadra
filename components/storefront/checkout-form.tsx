'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCartStore } from '@/lib/stores/cart'

interface CheckoutFormProps {
  campaignId: string
}

export function CheckoutForm({ campaignId }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const clearCart = useCartStore(state => state.clearCart)

  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    if (!customerName || !customerEmail) {
      setError('Please fill in all required fields')
      return
    }

    setProcessing(true)
    setError(null)

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        throw new Error(submitError.message)
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/confirmation?campaignId=${campaignId}`,
          receipt_email: customerEmail,
          payment_method_data: {
            billing_details: {
              name: customerName,
              email: customerEmail
            }
          }
        },
        redirect: 'if_required'
      })

      if (confirmError) {
        throw new Error(confirmError.message)
      }

      // Payment succeeded
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        clearCart()
        router.push(`/confirmation?campaignId=${campaignId}&paymentIntent=${paymentIntent.id}`)
      }
    } catch (err: any) {
      console.error('Payment error:', err)
      setError(err.message || 'Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
              placeholder="john@example.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentElement />
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-6 text-lg font-semibold"
        size="lg"
      >
        {processing ? 'Processing...' : 'Complete Order'}
      </Button>
    </form>
  )
}
