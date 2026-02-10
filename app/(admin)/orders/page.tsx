import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Search } from 'lucide-react'
import Link from 'next/link'
import { OrdersTable } from '@/components/orders/orders-table'
import { OrdersFilters } from '@/components/orders/orders-filters'

interface SearchParams {
  status?: string
  campaign?: string
  search?: string
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()

  // Build query
  let query = supabase
    .from('orders')
    .select(
      `
      *,
      campaign:campaigns(
        id,
        name,
        store:stores(id, name, created_by)
      )
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })

  // Apply filters
  if (searchParams.status) {
    query = query.eq('status', searchParams.status)
  }

  if (searchParams.campaign) {
    query = query.eq('campaign_id', searchParams.campaign)
  }

  if (searchParams.search) {
    query = query.or(
      `customer_email.ilike.%${searchParams.search}%,customer_name.ilike.%${searchParams.search}%,order_number.ilike.%${searchParams.search}%`
    )
  }

  const { data: orders, error, count } = await query

  // Get campaigns for filter dropdown
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, name, store:stores(created_by)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch orders:', error)
  }

  const hasOrders = orders && orders.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and fulfill customer orders
          </p>
        </div>
      </div>

      <OrdersFilters
        campaigns={campaigns || []}
        currentFilters={{
          status: searchParams.status,
          campaign: searchParams.campaign,
          search: searchParams.search,
        }}
      />

      {!hasOrders ? (
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>
              {searchParams.status || searchParams.campaign || searchParams.search
                ? 'No orders match your filters'
                : 'No orders yet'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchParams.status || searchParams.campaign || searchParams.search
                ? 'Try adjusting your filters'
                : 'Orders from your campaigns will appear here'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              Order History ({count || 0} {count === 1 ? 'order' : 'orders'})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OrdersTable orders={orders} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
