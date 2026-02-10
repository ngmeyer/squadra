import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCampaignById } from '@/lib/supabase/queries'

interface ProductEditPageProps {
  params: Promise<{ id: string; productId: string }>
}

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  const { id: campaignId, productId } = await params
  const campaign = await getCampaignById(campaignId)

  if (!campaign) {
    notFound()
  }

  const product = campaign.products?.find((p) => p.id === productId)

  if (!product) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/campaigns/${campaignId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{product.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Edit product details
          </p>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          Product editing interface coming soon. For now, delete and recreate the product if you need to make changes.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Title</p>
          <p className="font-medium">{product.title}</p>
        </div>

        {product.description && (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Description</p>
            <p className="font-medium whitespace-pre-line">{product.description}</p>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Base Price</p>
          <p className="font-medium">${(product.base_price_cents / 100).toFixed(2)}</p>
        </div>

        {product.category && (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
            <p className="font-medium">{product.category}</p>
          </div>
        )}

        {product.images?.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Images</p>
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Product image ${i + 1}`}
                  className="w-full aspect-square object-cover rounded border"
                />
              ))}
            </div>
          </div>
        )}

        {product.variant_groups?.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Variant Groups</p>
            <div className="space-y-2">
              {product.variant_groups.map((group, i) => (
                <div key={i} className="border rounded p-3">
                  <p className="font-medium">{group.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {group.options.map((opt) => opt.value).join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
