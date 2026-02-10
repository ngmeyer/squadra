'use client'

import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/stores/cart'
import { useState } from 'react'
import { CartDrawer } from './cart-drawer'

export function CartButton() {
  const [isOpen, setIsOpen] = useState(false)
  const itemCount = useCartStore(state => state.getItemCount())

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(true)}
      >
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </Button>
      <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
