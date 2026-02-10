'use client'

import { useEffect } from 'react'
import { X, Minus, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/stores/cart'
import { useRouter } from 'next/navigation'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter()
  const { items, campaignId, updateQuantity, removeItem, getSubtotal } = useCartStore()

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const handleCheckout = () => {
    if (!campaignId) return
    onClose()
    router.push(`/checkout?campaignId=${campaignId}`)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.variantId}-${item.customizationValue || ''}`} className="border rounded-lg p-4 space-y-3">
                  <div className="flex gap-4">
                    {/* Image */}
                    {item.imageUrl && (
                      <div className="relative w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.productTitle}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{item.productTitle}</h3>
                      <div className="text-sm text-gray-600 space-y-1 mt-1">
                        {Object.entries(item.variantOptions).map(([key, value]) => (
                          <p key={key}>
                            {key}: <span className="font-medium">{value}</span>
                          </p>
                        ))}
                        {item.customizationValue && (
                          <p className="italic">"{item.customizationValue}"</p>
                        )}
                      </div>
                      <p className="text-lg font-bold text-gray-900 mt-2">
                        {formatPrice(item.priceCents * item.quantity)}
                      </p>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeItem(item.variantId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-6 space-y-4">
            <div className="flex items-center justify-between text-lg">
              <span className="font-medium text-gray-700">Subtotal</span>
              <span className="font-bold text-gray-900">{formatPrice(getSubtotal())}</span>
            </div>
            <Button
              onClick={handleCheckout}
              className="w-full py-6 text-lg font-semibold"
              size="lg"
            >
              Checkout
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
