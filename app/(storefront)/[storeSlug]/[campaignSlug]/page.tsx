import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Countdown } from '@/components/storefront/countdown'
import { ProductCard } from '@/components/storefront/product-card'

interface CampaignPageProps {
  params: Promise<{ storeSlug: string; campaignSlug: string }>
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  const { storeSlug, campaignSlug } = await params
  const supabase = await createClient()

  // Fetch store
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', storeSlug)
    .single()

  if (!store) {
    notFound()
  }

  // Fetch campaign
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('store_id', store.id)
    .eq('slug', campaignSlug)
    .single()

  if (!campaign) {
    notFound()
  }

  // Check if campaign is active and open
  const now = new Date()
  const opensAt = new Date(campaign.opens_at)
  const closesAt = new Date(campaign.closes_at)
  const isOpen = now >= opensAt && now <= closesAt && campaign.status === 'active'

  if (!isOpen) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-yellow-800 mb-2">Campaign Not Available</h1>
          <p className="text-yellow-700">
            {now < opensAt
              ? `This campaign opens on ${opensAt.toLocaleDateString()}`
              : 'This campaign has closed'}
          </p>
        </div>
      </div>
    )
  }

  // Fetch products with variants
  const { data: products } = await supabase
    .from('campaign_products')
    .select(`
      *,
      variants (*)
    `)
    .eq('campaign_id', campaign.id)
    .eq('status', 'active')
    .order('sort_order', { ascending: true })

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Campaign Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{campaign.name}</h1>
            {campaign.custom_message && (
              <p className="text-lg text-gray-600 mt-2">{campaign.custom_message}</p>
            )}
          </div>
        </div>

        {/* Countdown Timer */}
        <Countdown targetDate={closesAt} />
      </div>

      {/* Products Grid */}
      {!products || products.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <p className="text-gray-500">No products available yet.</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              productId={product.id}
              campaignId={campaign.id}
              title={product.title}
              description={product.description}
              images={(product.images as string[]) || []}
              variantGroups={(product.variant_groups as any[]) || []}
              variants={(product.variants as any[]) || []}
              customizationConfig={product.customization_config as any}
            />
          ))}
        </div>
      )}
    </div>
  )
}
