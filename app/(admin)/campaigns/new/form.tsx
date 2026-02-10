'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createCampaignAction } from '../actions'
import { generateCampaignSlug } from '@/lib/validations/campaign'

interface NewCampaignFormProps {
  defaultStoreId: string
}

export default function NewCampaignForm({ defaultStoreId }: NewCampaignFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    opens_at: '',
    closes_at: '',
    ships_at: '',
    ship_to_name: '',
    ship_to_address: '',
    ship_to_phone: '',
    custom_message: '',
  })

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateCampaignSlug(name),
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = new FormData()
    form.set('store_id', defaultStoreId)
    Object.entries(formData).forEach(([key, value]) => {
      form.set(key, value)
    })

    const result = await createCampaignAction(form)

    if (result.success) {
      router.push(`/campaigns/${result.campaignId}`)
    } else {
      setError(result.error || 'Failed to create campaign')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/campaigns">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Campaign</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Set up a new group buying campaign
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>Basic information about your campaign</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Winter 2024 Team Gear"
                required
              />
            </div>

            <div>
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="winter-2024-team-gear"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be part of your campaign URL
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Timeline</CardTitle>
            <CardDescription>When the campaign opens, closes, and ships</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="opens_at">Opens At *</Label>
                <Input
                  id="opens_at"
                  type="datetime-local"
                  value={formData.opens_at}
                  onChange={(e) => setFormData({ ...formData, opens_at: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="closes_at">Closes At *</Label>
                <Input
                  id="closes_at"
                  type="datetime-local"
                  value={formData.closes_at}
                  onChange={(e) => setFormData({ ...formData, closes_at: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ships_at">Ships On *</Label>
              <Input
                id="ships_at"
                type="date"
                value={formData.ships_at}
                onChange={(e) => setFormData({ ...formData, ships_at: e.target.value })}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Expected delivery/pickup date
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Info */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping/Delivery Information</CardTitle>
            <CardDescription>Where to send the order</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ship_to_name">Name *</Label>
              <Input
                id="ship_to_name"
                value={formData.ship_to_name}
                onChange={(e) => setFormData({ ...formData, ship_to_name: e.target.value })}
                placeholder="John's Swim Club"
                required
              />
            </div>

            <div>
              <Label htmlFor="ship_to_address">Address *</Label>
              <Textarea
                id="ship_to_address"
                value={formData.ship_to_address}
                onChange={(e) => setFormData({ ...formData, ship_to_address: e.target.value })}
                placeholder="123 Main St&#10;City, State 12345"
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="ship_to_phone">Phone</Label>
              <Input
                id="ship_to_phone"
                type="tel"
                value={formData.ship_to_phone}
                onChange={(e) => setFormData({ ...formData, ship_to_phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
          </CardContent>
        </Card>

        {/* Custom Message */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Message (Optional)</CardTitle>
            <CardDescription>A message displayed on the campaign storefront</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              id="custom_message"
              value={formData.custom_message}
              onChange={(e) => setFormData({ ...formData, custom_message: e.target.value })}
              placeholder="Welcome to our team gear campaign! Orders will be shipped to the pool..."
              rows={4}
            />
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
            <Link href="/campaigns">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Campaign
          </Button>
        </div>
      </form>
    </div>
  )
}
