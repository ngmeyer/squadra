'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { LogoUpload } from '@/components/store/logo-upload'
import { updateStoreAction, deleteStoreAction } from '../actions'
import { updateStoreSchema, type UpdateStoreInput } from '@/lib/validations/store'
import { createClient } from '@/lib/supabase/client'
import type { Store } from '@/lib/supabase/queries'

export default function EditStorePage({ params }: { params: Promise<{ id: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [store, setStore] = useState<Store | null>(null)

  const supabase = createClient()

  // Resolve params
  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  // Fetch store data
  useEffect(() => {
    if (!resolvedParams) return

    const fetchStore = async () => {
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .eq('id', resolvedParams.id)
          .single()

        if (error) throw error
        if (!data) throw new Error('Store not found')

        setStore(data)
      } catch (err) {
        console.error('Error fetching store:', err)
        setError('Failed to load store')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStore()
  }, [resolvedParams, supabase])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UpdateStoreInput>({
    resolver: zodResolver(updateStoreSchema),
  })

  const logoUrl = watch('logo_url')

  // Reset form when store data is loaded
  useEffect(() => {
    if (store) {
      reset({
        name: store.name,
        slug: store.slug,
        logo_url: store.logo_url,
        theme_colors: store.theme_colors,
        contact_email: store.contact_email || '',
        shipping_policy: store.shipping_policy || '',
        tax_rate: store.tax_rate,
      })
    }
  }, [store, reset])

  const onSubmit = async (data: UpdateStoreInput) => {
    if (!resolvedParams) return

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await updateStoreAction(resolvedParams.id, data)

      if (result.success) {
        router.push('/stores')
        router.refresh()
      } else {
        setError(result.error || 'Failed to update store')
      }
    } catch (err) {
      console.error('Error updating store:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!resolvedParams) return

    setIsDeleting(true)
    setError(null)

    try {
      const result = await deleteStoreAction(resolvedParams.id)

      if (result.success) {
        router.push('/stores')
        router.refresh()
      } else {
        setError(result.error || 'Failed to delete store')
      }
    } catch (err) {
      console.error('Error deleting store:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!store) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/stores">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Store Not Found</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600 dark:text-gray-400">
              The store you're looking for doesn't exist or you don't have access to it.
            </p>
            <Link href="/stores" className="mt-4 inline-block">
              <Button>Back to Stores</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/stores">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Store</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Update your store settings
            </p>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isDeleting}>
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete Store
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete <strong>{store.name}</strong> and all associated data.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Store
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Store Details</CardTitle>
            <CardDescription>
              Update the information for your store
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
              <Label htmlFor="name">Store Name</Label>
              <Input
                id="name"
                placeholder="e.g., Dana Hills Swim Team"
                {...register('name')}
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
              <Label htmlFor="slug">Store Slug</Label>
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
                Save Changes
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
