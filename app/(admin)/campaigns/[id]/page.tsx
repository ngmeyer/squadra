import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Package, BarChart3 } from 'lucide-react'
import { getCampaignById } from '@/lib/supabase/queries'
import { StatusBadge } from '@/components/campaigns/status-badge'
import { formatDate, formatDateTime } from '@/lib/utils/dates'

interface CampaignDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { id } = await params
  const campaign = await getCampaignById(id)

  if (!campaign) {
    notFound()
  }

  const products = campaign.products || []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/campaigns">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
            <StatusBadge status={campaign.status} />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Campaign details and products
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/campaigns/${id}/analytics`}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/campaigns/${id}/products/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Campaign Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Slug</p>
              <p className="font-medium">{campaign.slug}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Opens</p>
              <p className="font-medium">{formatDateTime(campaign.opens_at)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Closes</p>
              <p className="font-medium">{formatDateTime(campaign.closes_at)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ships</p>
              <p className="font-medium">{formatDate(campaign.ships_at)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ship To</p>
              <p className="font-medium">{campaign.ship_to_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
              <p className="font-medium whitespace-pre-line">{campaign.ship_to_address}</p>
            </div>
            {campaign.ship_to_phone && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                <p className="font-medium">{campaign.ship_to_phone}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {campaign.custom_message && (
        <Card>
          <CardHeader>
            <CardTitle>Custom Message</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{campaign.custom_message}</p>
          </CardContent>
        </Card>
      )}

      {/* Products */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                {products.length} product{products.length !== 1 ? 's' : ''} in this campaign
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/campaigns/${id}/products/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                No products yet. Add your first product to get started.
              </p>
              <Button asChild>
                <Link href={`/campaigns/${id}/products/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/campaigns/${id}/products/${product.id}`}
                  className="group border rounded-lg overflow-hidden hover:border-blue-500 transition-colors"
                >
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium group-hover:text-blue-600 transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      ${(product.base_price_cents / 100).toFixed(2)}
                    </p>
                    {product.category && (
                      <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
