import { getUser } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Store, Megaphone, Package, Plus, ArrowRight, DollarSign, TrendingUp, ShoppingCart, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { RevenueChart } from '@/components/dashboard/revenue-chart'

export default async function AdminDashboard() {
  const user = await getUser()

  if (!user) {
    return null
  }

  const supabase = await createClient()

  // Fetch stores
  const { data: stores } = await supabase
    .from('stores')
    .select('id, name')
    .eq('created_by', user.id)

  const totalStores = stores?.length || 0

  // Fetch campaigns
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, name, slug, status, closes_at, store:stores!inner(created_by, id, slug)')
    .eq('store.created_by', user.id)
    .order('created_at', { ascending: false })

  const activeCampaigns = campaigns?.filter((c) => c.status === 'active').length || 0

  // Fetch orders
  const { data: allOrders } = await supabase
    .from('orders')
    .select(
      `
      *,
      campaign:campaigns!inner(
        store:stores!inner(created_by)
      )
    `
    )
    .eq('campaign.store.created_by', user.id)

  const totalOrders = allOrders?.length || 0
  const pendingOrders = allOrders?.filter((o) => o.status === 'paid' && !o.shipped_at).length || 0

  // Calculate this month's revenue
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const thisMonthOrders = allOrders?.filter((o) => {
    const orderDate = new Date(o.created_at)
    return orderDate >= startOfMonth && o.status === 'paid'
  }) || []

  const revenueThisMonth = thisMonthOrders.reduce((sum, order) => sum + order.total_cents, 0)
  const ordersThisMonth = thisMonthOrders.length

  // Calculate average order value
  const paidOrders = allOrders?.filter((o) => o.status === 'paid') || []
  const averageOrderValue = paidOrders.length > 0
    ? paidOrders.reduce((sum, order) => sum + order.total_cents, 0) / paidOrders.length
    : 0

  // Get top selling products
  const { data: topProducts } = await supabase
    .from('order_items')
    .select(
      `
      quantity,
      variant:variants(
        campaign_product:campaign_products(
          title,
          campaign:campaigns(
            store:stores!inner(created_by)
          )
        )
      ),
      order:orders!inner(status)
    `
    )
    .eq('variant.campaign_product.campaign.store.created_by', user.id)
    .eq('order.status', 'paid')

  // Aggregate product sales
  const productSales = topProducts?.reduce((acc: any, item: any) => {
    const title = item.variant?.campaign_product?.title
    if (title) {
      if (!acc[title]) {
        acc[title] = 0
      }
      acc[title] += item.quantity
    }
    return acc
  }, {}) || {}

  const topSellingProducts = Object.entries(productSales)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 5)
    .map(([title, quantity]) => ({ title, quantity }))

  // Recent orders
  const recentOrders = allOrders?.slice(0, 5) || []

  // Campaigns closing soon (within 48 hours)
  const fortyEightHoursFromNow = new Date()
  fortyEightHoursFromNow.setHours(fortyEightHoursFromNow.getHours() + 48)

  const campaignsClosingSoon = campaigns?.filter((c) => {
    if (c.status !== 'active') return false
    const closesAt = new Date(c.closes_at)
    return closesAt <= fortyEightHoursFromNow && closesAt > now
  }).slice(0, 5) || []

  const greeting = getGreeting()
  const userName = user.email?.split('@')[0] || 'there'

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {greeting}, {userName}!
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Here&apos;s what&apos;s happening with your campaigns today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(revenueThisMonth / 100).toFixed(2)}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              From {ordersThisMonth} {ordersThisMonth === 1 ? 'order' : 'orders'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Order Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(averageOrderValue / 100).toFixed(2)}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Across all orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Campaigns
            </CardTitle>
            <Megaphone className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCampaigns}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {totalStores} {totalStores === 1 ? 'store' : 'stores'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Orders to Ship
            </CardTitle>
            <Package className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Need fulfillment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      {paidOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
            <CardDescription>
              Daily revenue from paid orders (last 30 days)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart orders={paidOrders} />
          </CardContent>
        </Card>
      )}

      {/* Campaigns Closing Soon */}
      {campaignsClosingSoon.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <CardTitle className="text-orange-900 dark:text-orange-100">
                Campaigns Closing Soon
              </CardTitle>
            </div>
            <CardDescription className="text-orange-700 dark:text-orange-300">
              These campaigns will close within 48 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {campaignsClosingSoon.map((campaign: any) => {
                const closesAt = new Date(campaign.closes_at)
                const hoursUntilClose = Math.round(
                  (closesAt.getTime() - now.getTime()) / (1000 * 60 * 60)
                )

                return (
                  <Link
                    key={campaign.id}
                    href={`/campaigns/${campaign.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="font-medium">{campaign.name}</div>
                      <div className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300">
                        <Clock className="h-3 w-3" />
                        Closes in {hoursUntilClose} {hoursUntilClose === 1 ? 'hour' : 'hours'}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Products */}
      {topSellingProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>
              Best performers across all campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSellingProducts.map((product: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-sm font-semibold text-blue-700 dark:text-blue-300">
                      {index + 1}
                    </div>
                    <div className="font-medium">{product.title}</div>
                  </div>
                  <Badge variant="secondary">{product.quantity} sold</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  Latest orders from your campaigns
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/orders">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order: any) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="font-medium font-mono text-sm">
                      {order.order_number}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {order.customer_name} • {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold">
                        ${(order.total_cents / 100).toFixed(2)}
                      </div>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Get started with the most common tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Button asChild variant="outline" className="h-auto py-6 justify-start">
            <Link href="/stores">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2">
                  <Store className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Manage Stores</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    View or create stores
                  </div>
                </div>
              </div>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto py-6 justify-start">
            <Link href="/campaigns">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 dark:bg-green-900 p-2">
                  <Megaphone className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Campaigns</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Launch or manage
                  </div>
                </div>
              </div>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto py-6 justify-start">
            <Link href="/orders">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-2">
                  <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">View Orders</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Manage fulfillment
                  </div>
                </div>
              </div>
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Getting Started Guide (shown when no stores exist) */}
      {totalStores === 0 && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">
              🎉 Welcome to Squadra!
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              Let&apos;s get you set up in just a few steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Badge variant="outline" className="bg-white dark:bg-gray-900">
                  1
                </Badge>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Create your first store
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Set up your shop details and payment settings
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge variant="outline" className="bg-white dark:bg-gray-900">
                  2
                </Badge>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Launch a campaign
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Choose a product and set your group buying tiers
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge variant="outline" className="bg-white dark:bg-gray-900">
                  3
                </Badge>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Share with your community
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Get your unique campaign link and start collecting orders
                  </div>
                </div>
              </li>
            </ol>
            <div className="mt-6">
              <Button asChild>
                <Link href="/stores">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Store
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function OrderStatusBadge({ status }: { status: string }) {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'outline',
    paid: 'default',
    shipped: 'secondary',
    cancelled: 'destructive',
  }

  return (
    <Badge variant={variants[status] || 'default'} className="text-xs">
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}
