'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { LogoUpload } from '@/components/store/logo-upload'
import { createStoreAction } from '../actions'
import { createStoreSchema, generateSlug, type CreateStoreInput } from '@/lib/validations/store'

export default function NewStorePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateStoreInput>({
    resolver: zodResolver(createStoreSchema),
    defaultValues: {
      name: '',
      slug: '',
      logo_url: null,
      theme_colors: {
        primary: '#000000',
        secondary: '#ffffff',
      },
      contact_email: '',
      shipping_policy: '',
      tax_rate: 0,
    },
  })

  const name = watch('name')
  const logoUrl = watch('logo_url')

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setValue('name', newName)
    
    // Only auto-generate if slug hasn't been manually edited
    const currentSlug = watch('slug')
    if (!currentSlug || currentSlug === generateSlug(name)) {
      setValue('slug', generateSlug(newName))
    }
  }

  const onSubmit = async (data: CreateStoreInput) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await createStoreAction(data)

      if (result.success) {
        router.push('/stores')
        router.refresh()
      } else {
        setError(result.error || 'Failed to create store')
      }
    } catch (err) {
      console.error('Error creating store:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/stores">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Store</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Set up a new online store for your organization
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Store Details</CardTitle>
            <CardDescription>
              Enter the basic information for your store
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Store Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Store Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Dana Hills Swim Team"
                {...register('name')}
                onChange={handleNameChange}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">
                Store Slug <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  /store/
                </span>
                <Input
                  id="slug"
                  placeholder="dana-hills-swim-team"
                  {...register('slug')}
                  disabled={isSubmitting}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Lowercase letters, numbers, and hyphens only
              </p>
              {errors.slug && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.slug.message}
                </p>
              )}
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Store Logo</Label>
              <LogoUpload
                value={logoUrl}
                onChange={(url) => setValue('logo_url', url)}
                disabled={isSubmitting}
              />
              {errors.logo_url && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.logo_url.message}
                </p>
              )}
            </div>

            {/* Theme Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary_color">Primary Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="primary_color"
                    type="color"
                    {...register('theme_colors.primary')}
                    disabled={isSubmitting}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    type="text"
                    {...register('theme_colors.primary')}
                    disabled={isSubmitting}
                    className="flex-1 font-mono text-sm"
                    placeholder="#000000"
                  />
                </div>
                {errors.theme_colors?.primary && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.theme_colors.primary.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary_color">Secondary Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="secondary_color"
                    type="color"
                    {...register('theme_colors.secondary')}
                    disabled={isSubmitting}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    type="text"
                    {...register('theme_colors.secondary')}
                    disabled={isSubmitting}
                    className="flex-1 font-mono text-sm"
                    placeholder="#ffffff"
                  />
                </div>
                {errors.theme_colors?.secondary && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.theme_colors.secondary.message}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Email */}
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                placeholder="contact@example.com"
                {...register('contact_email')}
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Optional - displayed to customers
              </p>
              {errors.contact_email && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.contact_email.message}
                </p>
              )}
            </div>

            {/* Tax Rate */}
            <div className="space-y-2">
              <Label htmlFor="tax_rate">Tax Rate</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="tax_rate"
                  type="number"
                  step="0.0001"
                  min="0"
                  max="1"
                  placeholder="0.0825"
                  {...register('tax_rate', { valueAsNumber: true })}
                  disabled={isSubmitting}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  (e.g., 0.0825 for 8.25%)
                </span>
              </div>
              {errors.tax_rate && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.tax_rate.message}
                </p>
              )}
            </div>

            {/* Shipping Policy */}
            <div className="space-y-2">
              <Label htmlFor="shipping_policy">Shipping Policy</Label>
              <Textarea
                id="shipping_policy"
                placeholder="Describe your shipping policy, delivery times, and costs..."
                rows={4}
                {...register('shipping_policy')}
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Optional - displayed to customers during checkout
              </p>
              {errors.shipping_policy && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.shipping_policy.message}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Store
              </Button>
              <Link href="/stores">
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
