import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  variantId: string
  productId: string
  productTitle: string
  variantSku: string
  variantOptions: Record<string, string> // e.g. { Size: "L", Color: "Blue" }
  imageUrl: string | null
  priceCents: number
  quantity: number
  customizationValue?: string
}

interface CartState {
  items: CartItem[]
  campaignId: string | null
  
  // Actions
  addItem: (campaignId: string, item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  updateCustomization: (variantId: string, customizationValue: string) => void
  clearCart: () => void
  getItemCount: () => number
  getSubtotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      campaignId: null,

      addItem: (campaignId, item) => {
        const state = get()
        
        // If cart has items from different campaign, clear it
        if (state.campaignId && state.campaignId !== campaignId) {
          set({ items: [], campaignId })
        }

        // Check if item already exists in cart
        const existingItemIndex = state.items.findIndex(
          i => i.variantId === item.variantId && i.customizationValue === item.customizationValue
        )

        if (existingItemIndex >= 0) {
          // Update quantity
          const updatedItems = [...state.items]
          updatedItems[existingItemIndex].quantity += item.quantity || 1
          set({ items: updatedItems })
        } else {
          // Add new item
          set({
            items: [...state.items, { ...item, quantity: item.quantity || 1 }],
            campaignId
          })
        }
      },

      removeItem: (variantId) => {
        set(state => ({
          items: state.items.filter(item => item.variantId !== variantId)
        }))
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId)
          return
        }

        set(state => ({
          items: state.items.map(item =>
            item.variantId === variantId ? { ...item, quantity } : item
          )
        }))
      },

      updateCustomization: (variantId, customizationValue) => {
        set(state => ({
          items: state.items.map(item =>
            item.variantId === variantId ? { ...item, customizationValue } : item
          )
        }))
      },

      clearCart: () => {
        set({ items: [], campaignId: null })
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + (item.priceCents * item.quantity), 0)
      }
    }),
    {
      name: 'squadra-cart-storage'
    }
  )
)
