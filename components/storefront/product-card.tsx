'use client'

import { useState, useMemo } from 'react'
import { ImageGallery } from './image-gallery'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCartStore } from '@/lib/stores/cart'
import { cn } from '@/lib/utils'

interface VariantGroup {
  name: string
  options: string[]
}

interface Variant {
  id: string
  sku: string
  option_combo: Record<string, string>
  price_cents: number
  image_url: string | null
}

interface CustomizationConfig {
  type: 'none' | 'optional' | 'required'
  label: string
  placeholder: string
  max_length: number
  price_cents: number
}

interface ProductCardProps {
  productId: string
  campaignId: string
  title: string
  description: string | null
  images: string[]
  variantGroups: VariantGroup[]
  variants: Variant[]
  customizationConfig: CustomizationConfig
}

export function ProductCard({
  productId,
  campaignId,
  title,
  description,
  images,
  variantGroups,
  variants,
  customizationConfig
}: ProductCardProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [customizationValue, setCustomizationValue] = useState('')
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore(state => state.addItem)

  // Find matching variant based on selected options
  const selectedVariant = useMemo(() => {
    return variants.find(variant => {
      return Object.entries(selectedOptions).every(
        ([key, value]) => variant.option_combo[key] === value
      )
    })
  }, [variants, selectedOptions])

  // Get current display images (variant image or product images)
  const displayImages = useMemo(() => {
    if (selectedVariant?.image_url) {
      return [selectedVariant.image_url, ...images.filter(img => img !== selectedVariant.image_url)]
    }
    return images
  }, [selectedVariant, images])

  // Calculate price range
  const priceRange = useMemo(() => {
    if (variants.length === 0) return { min: 0, max: 0 }
    const prices = variants.map(v => v.price_cents)
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    }
  }, [variants])

  const handleOptionChange = (groupName: string, option: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [groupName]: option
    }))
  }

  const handleAddToCart = () => {
    if (!selectedVariant) {
      alert('Please select all options')
      return
    }

    if (customizationConfig.type === 'required' && !customizationValue.trim()) {
      alert(`Please provide ${customizationConfig.label}`)
      return
    }

    addItem(campaignId, {
      variantId: selectedVariant.id,
      productId,
      productTitle: title,
      variantSku: selectedVariant.sku,
      variantOptions: selectedVariant.option_combo,
      imageUrl: selectedVariant.image_url || images[0] || null,
      priceCents: selectedVariant.price_cents + (customizationValue ? customizationConfig.price_cents : 0),
      customizationValue: customizationValue || undefined,
      quantity
    })

    // Reset form
    setQuantity(1)
    setCustomizationValue('')
  }

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      {/* Image Gallery */}
      <ImageGallery images={displayImages} alt={title} />

      {/* Product Info */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        {description && (
          <p className="text-gray-600 mt-2">{description}</p>
        )}
        <div className="mt-3">
          {priceRange.min === priceRange.max ? (
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(priceRange.min)}
            </p>
          ) : (
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
            </p>
          )}
          {selectedVariant && (
            <p className="text-lg text-blue-600 font-semibold mt-1">
              Selected: {formatPrice(selectedVariant.price_cents)}
            </p>
          )}
        </div>
      </div>

      {/* Variant Selection */}
      {variantGroups.map(group => (
        <div key={group.name} className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">{group.name}</Label>
          <div className="flex flex-wrap gap-2">
            {group.options.map(option => {
              const isSelected = selectedOptions[group.name] === option
              return (
                <button
                  key={option}
                  onClick={() => handleOptionChange(group.name, option)}
                  className={cn(
                    "px-4 py-2 rounded-md border-2 font-medium transition-all",
                    isSelected
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  )}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Customization */}
      {customizationConfig.type !== 'none' && (
        <div className="space-y-2">
          <Label htmlFor={`custom-${productId}`} className="text-sm font-medium text-gray-700">
            {customizationConfig.label}
            {customizationConfig.type === 'required' && (
              <span className="text-red-500 ml-1">*</span>
            )}
            {customizationConfig.price_cents > 0 && (
              <span className="text-sm text-gray-500 ml-2">
                (+{formatPrice(customizationConfig.price_cents)})
              </span>
            )}
          </Label>
          <Input
            id={`custom-${productId}`}
            value={customizationValue}
            onChange={(e) => setCustomizationValue(e.target.value)}
            placeholder={customizationConfig.placeholder}
            maxLength={customizationConfig.max_length}
          />
          {customizationConfig.max_length > 0 && (
            <p className="text-xs text-gray-500">
              {customizationValue.length} / {customizationConfig.max_length} characters
            </p>
          )}
        </div>
      )}

      {/* Quantity */}
      <div className="space-y-2">
        <Label htmlFor={`qty-${productId}`} className="text-sm font-medium text-gray-700">
          Quantity
        </Label>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
          >
            -
          </Button>
          <Input
            id={`qty-${productId}`}
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 text-center"
            min={1}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(quantity + 1)}
          >
            +
          </Button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={!selectedVariant}
        className="w-full py-6 text-lg font-semibold"
        size="lg"
      >
        Add to Cart
      </Button>
    </div>
  )
}
