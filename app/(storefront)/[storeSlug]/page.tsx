import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface StorePageProps {
  params: Promise<{ storeSlug: string }>
}

export default async function StorePage({ params }: StorePageProps) {
  const { storeSlug } = await params
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

  // Fetch active campaigns
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('store_id', store.id)
    .eq('status', 'active')
    .order('opens_at', { ascending: false })

  const now = new Date()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Store Header */}
      <div className="text-center space-y-4">
        {store.logo_url && (
          <div className="flex justify-center">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-white shadow-lg">
              <Image
                src={store.logo_url}
                alt={store.name}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}
        <h1 className="text-4xl font-bold text-gray-900">{store.name}</h1>
        <p className="text-gray-600">Welcome to our store!</p>
      </div>

      {/* Active Campaigns */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Active Campaigns</h2>
        
        {!campaigns || campaigns.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No active campaigns at this time.</p>
              <p className="text-sm text-gray-400 mt-2">Check back soon!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {campaigns.map((campaign) => {
              const opensAt = new Date(campaign.opens_at)
              const closesAt = new Date(campaign.closes_at)
              const isOpen = now >= opensAt && now <= closesAt

              return (
                <Link
                  key={campaign.id}
                  href={`/${storeSlug}/${campaign.slug}`}
                  className="block transition-transform hover:scale-105"
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-xl">{campaign.name}</CardTitle>
                        {isOpen ? (
                          <Badge variant="default" className="bg-green-600">Open</Badge>
                        ) : (
                          <Badge variant="secondary">Coming Soon</Badge>
                        )}
                      </div>
                      <CardDescription>
                        {campaign.custom_message || 'Preorder campaign'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Opens:</span>{' '}
                          {opensAt.toLocaleDateString()}
                        </p>
                        <p>
                          <span className="font-medium">Closes:</span>{' '}
                          {closesAt.toLocaleDateString()}
                        </p>
                        {campaign.ships_at && (
                          <p>
                            <span className="font-medium">Ships:</span>{' '}
                            {new Date(campaign.ships_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
