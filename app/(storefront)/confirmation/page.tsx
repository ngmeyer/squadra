'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const clearCart = useCartStore(state => state.clearCart)
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const paymentIntentId = searchParams.get('payment_intent')
  const campaignId = searchParams.get('campaignId')

  useEffect(() => {
    // Clear cart on mount
    clearCart()

    // Fetch order details
    const fetchOrder = async () => {
      if (!paymentIntentId) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/orders/by-payment-intent/${paymentIntentId}`)
        if (response.ok) {
          const data = await response.json()
          setOrder(data)
        }
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [paymentIntentId, clearCart])

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-gray-600">Loading order details...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-3xl">Order Confirmed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600">Thank you for your order.</p>
            {order && (
              <p className="text-lg font-semibold text-gray-900 mt-2">
                Order #{order.order_number}
              </p>
            )}
          </div>

          {order && (
            <>
              <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                <h3 className="font-semibold text-gray-900">Order Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(order.subtotal_cents)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">{formatPrice(order.tax_cents)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-lg">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold">{formatPrice(order.total_cents)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• A confirmation email has been sent to {order.customer_email}</li>
                  <li>• You'll receive shipping updates as your order is processed</li>
                  <li>• Save your order number for reference: {order.order_number}</li>
                </ul>
              </div>
            </>
          )}

          <div className="flex gap-4">
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="flex-1"
            >
              Back to Store
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}
