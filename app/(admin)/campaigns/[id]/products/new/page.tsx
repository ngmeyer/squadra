'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Loader2, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { createProductAction } from '../../../actions'
import { ImageUpload } from '@/components/products/image-upload'
import { VariantBuilder } from '@/components/products/variant-builder'
import { VariantGroup, CustomizationConfig } from '@/lib/supabase/queries'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

export default function NewProductPage() {
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    base_price: '',
    category: '',
    images: [] as string[],
    variant_groups: [] as VariantGroup[],
    customization_config: {
      enabled: false,
      type: 'none' as 'none' | 'optional' | 'required',
      label: '',
      placeholder: '',
      max_length: 50,
      price_cents: 0,
    } as CustomizationConfig,
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const basePriceCents = Math.round(parseFloat(formData.base_price) * 100)

      const result = await createProductAction(campaignId, {
        title: formData.title,
        description: formData.description || null,
        base_price_cents: basePriceCents,
        category: formData.category || null,
        images: formData.images,
        variant_groups: formData.variant_groups,
        customization_config: formData.customization_config,
      })

      if (result.success) {
        router.push(`/campaigns/${campaignId}`)
      } else {
        setError(result.error || 'Failed to create product')
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create product')
      setLoading(false)
    }
  }

  const updateCustomization = (field: keyof CustomizationConfig, value: any) => {
    setFormData({
      ...formData,
      customization_config: {
        ...formData.customization_config,
        [field]: value,
      },
    })
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/campaigns/${campaignId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Product</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create a new product for this campaign
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>Basic details about the product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Navy Team Hoodie"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Comfortable fleece hoodie with team logo..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="base_price">Base Price *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="base_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    placeholder="0.00"
                    className="pl-7"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Apparel, Equipment, etc."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
            <CardDescription>Upload images of your product</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              images={formData.images}
              onChange={(images) => setFormData({ ...formData, images })}
              maxImages={10}
            />
          </CardContent>
        </Card>

        {/* Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Product Variants</CardTitle>
            <CardDescription>
              Create options like Size, Color, etc. with different prices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VariantBuilder
              variantGroups={formData.variant_groups}
              onChange={(groups) => setFormData({ ...formData, variant_groups: groups })}
              basePrice={parseFloat(formData.base_price || '0') * 100}
            />
          </CardContent>
        </Card>

        {/* Customization */}
        <Card>
          <CardHeader>
            <CardTitle>Customization Options</CardTitle>
            <CardDescription>
              Allow customers to add custom text (e.g., name on jersey)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="customization_enabled">Enable Customization</Label>
              <Switch
                id="customization_enabled"
                checked={formData.customization_config.enabled}
                onCheckedChange={(checked) => {
                  updateCustomization('enabled', checked)
                  if (!checked) {
                    updateCustomization('type', 'none')
                  }
                }}
              />
            </div>

            {formData.customization_config.enabled && (
              <>
                <div>
                  <Label htmlFor="customization_type">Type *</Label>
                  <Select
                    value={formData.customization_config.type}
                    onValueChange={(value) => updateCustomization('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="optional">Optional</SelectItem>
                      <SelectItem value="required">Required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="customization_label">Label *</Label>
                  <Input
                    id="customization_label"
                    value={formData.customization_config.label}
                    onChange={(e) => updateCustomization('label', e.target.value)}
                    placeholder="e.g., Swimmer Name"
                    required={formData.customization_config.enabled}
                  />
                </div>

                <div>
                  <Label htmlFor="customization_placeholder">Placeholder</Label>
                  <Input
                    id="customization_placeholder"
                    value={formData.customization_config.placeholder}
                    onChange={(e) => updateCustomization('placeholder', e.target.value)}
                    placeholder="e.g., Enter name..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customization_max_length">Max Length</Label>
                    <Input
                      id="customization_max_length"
                      type="number"
                      min="1"
                      value={formData.customization_config.max_length}
                      onChange={(e) =>
                        updateCustomization('max_length', parseInt(e.target.value))
                      }
                    />
                  </div>

                  {formData.customization_config.type === 'optional' && (
                    <div>
                      <Label htmlFor="customization_price">Additional Price</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          id="customization_price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={(formData.customization_config.price_cents || 0) / 100}
                          onChange={(e) =>
                            updateCustomization(
                              'price_cents',
                              Math.round(parseFloat(e.target.value || '0') * 100)
                            )
                          }
                          className="pl-7"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href={`/campaigns/${campaignId}`}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Product
          </Button>
        </div>
      </form>
    </div>
  )
}
