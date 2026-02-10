import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, TrendingUp, DollarSign, ShoppingCart, Package } from 'lucide-react'
import Link from 'next/link'
import { AnalyticsChart } from '@/components/campaigns/analytics-chart'
import { notFound } from 'next/navigation'

interface AnalyticsPageProps {
  params: {
    id: string
  }
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const supabase = await createClient()

  // Get campaign details
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select(
      `
      *,
      store:stores!inner(name, created_by)
    `
    )
    .eq('id', params.id)
    .single()

  if (campaignError || !campaign) {
    notFound()
  }

  // Get all orders for this campaign
  const { data: orders } = await supabase
    .from('orders')
    .select(
      `
      id,
      order_number,
      total_cents,
      status,
      created_at,
      order_items(
        id,
        quantity,
        unit_price_cents,
        total_price_cents,
        variant:variants(
          id,
          sku,
          campaign_product:campaign_products(id, title)
        )
      )
    `
    )
    .eq('campaign_id', params.id)
    .in('status', ['paid', 'shipped'])
    .order('created_at', { ascending: true })

  // Calculate metrics
  const totalOrders = orders?.length || 0
  const totalRevenue = orders?.reduce((sum, order) => sum + order.total_cents, 0) || 0
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Calculate conversion rate (placeholder - need page views tracking)
  const conversionRate = 0 // TODO: Implement page view tracking

  // Group orders by day
  const ordersByDay = new Map<string, { orders: number; revenue: number }>()
  orders?.forEach((order) => {
    const date = new Date(order.created_at).toISOString().split('T')[0]
    const existing = ordersByDay.get(date) || { orders: 0, revenue: 0 }
    ordersByDay.set(date, {
      orders: existing.orders + 1,
      revenue: existing.revenue + order.total_cents,
    })
  })

  const chartData = Array.from(ordersByDay.entries())
    .map(([date, data]) => ({
      date,
      orders: data.orders,
      revenue: data.revenue,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Calculate top products
  const productStats = new Map<
    string,
    { title: string; units: number; revenue: number }
  >()

  orders?.forEach((order) => {
    order.order_items?.forEach((item: any) => {
      const productTitle = item.variant?.campaign_product?.title || 'Unknown'
      const existing = productStats.get(productTitle) || {
        title: productTitle,
        units: 0,
        revenue: 0,
      }
      productStats.set(productTitle, {
        title: productTitle,
        units: existing.units + item.quantity,
        revenue: existing.revenue + item.total_price_cents,
      })
    })
  })

  const topProducts = Array.from(productStats.values())
    .sort((a, b) => b.revenue - a.revenue)
    .map((product) => ({
      ...product,
      percentOfTotal: totalRevenue > 0 ? (product.revenue / totalRevenue) * 100 : 0,
    }))

  // Get variant inventory status
  const { data: variants } = await supabase
    .from('variants')
    .select(
      `
      id,
      sku,
      campaign_product:campaign_products!inner(
        id,
        title,
        campaign_id
      )
    `
    )
    .eq('campaign_product.campaign_id', params.id)

  // Calculate total ordered per variant
  const variantOrderCounts = new Map<string, number>()
  orders?.forEach((order) => {
    order.order_items?.forEach((item: any) => {
      const variantId = item.variant?.id
      if (variantId) {
        const existing = variantOrderCounts.get(variantId) || 0
        variantOrderCounts.set(variantId, existing + item.quantity)
      }
    })
  })

  const variantInventory = variants?.map((variant: any) => ({
    sku: variant.sku,
    productTitle: variant.campaign_product?.title || 'Unknown',
    totalOrdered: variantOrderCounts.get(variant.id) || 0,
  }))

  // Export to CSV function
  const generateCSV = () => {
    const headers = ['Metric', 'Value']
    const metrics = [
      ['Campaign Name', campaign.name],
      ['Total Orders', totalOrders.toString()],
      ['Total Revenue', `$${(totalRevenue / 100).toFixed(2)}`],
      ['Average Order Value', `$${(averageOrderValue / 100).toFixed(2)}`],
      ['', ''],
      ['Top Products', ''],
      ['Product', 'Units Sold', 'Revenue', '% of Total'],
      ...topProducts.map((p) => [
        p.title,
        p.units.toString(),
        `$${(p.revenue / 100).toFixed(2)}`,
        `${p.percentOfTotal.toFixed(1)}%`,
      ]),
    ]

    return [headers, ...metrics].map((row) => row.join(',')).join('\n')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/campaigns/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Campaign
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Campaign Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{campaign.name}</p>
          </div>
        </div>
        <Button
          onClick={() => {
            const csv = generateCSV()
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${campaign.slug}-analytics.csv`
            a.click()
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalRevenue / 100).toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(averageOrderValue / 100).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-gray-500 mt-1">Requires page view tracking</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <AnalyticsChart data={chartData} />

      {/* Top Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts.length === 0 ? (
            <p className="text-sm text-gray-500">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="py-3 px-4 font-medium">Product</th>
                    <th className="py-3 px-4 font-medium text-right">Units Sold</th>
                    <th className="py-3 px-4 font-medium text-right">Revenue</th>
                    <th className="py-3 px-4 font-medium text-right">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, index) => (
                    <tr
                      key={index}
                      className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      <td className="py-3 px-4 font-medium">{product.title}</td>
                      <td className="py-3 px-4 text-right">{product.units}</td>
                      <td className="py-3 px-4 text-right">
                        ${(product.revenue / 100).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {product.percentOfTotal.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Variant Inventory Status */}
      <Card>
        <CardHeader>
          <CardTitle>Variant Inventory Status</CardTitle>
        </CardHeader>
        <CardContent>
          {!variantInventory || variantInventory.length === 0 ? (
            <p className="text-sm text-gray-500">No variants created yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="py-3 px-4 font-medium">Product</th>
                    <th className="py-3 px-4 font-medium">Variant SKU</th>
                    <th className="py-3 px-4 font-medium text-right">Total Ordered</th>
                    <th className="py-3 px-4 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {variantInventory.map((variant, index) => {
                    const status =
                      variant.totalOrdered === 0
                        ? { label: 'No orders', color: 'text-gray-500' }
                        : variant.totalOrdered < 10
                        ? { label: 'Low demand', color: 'text-yellow-600' }
                        : { label: 'Popular', color: 'text-green-600' }

                    return (
                      <tr
                        key={index}
                        className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900"
                      >
                        <td className="py-3 px-4">{variant.productTitle}</td>
                        <td className="py-3 px-4 font-mono text-sm">{variant.sku}</td>
                        <td className="py-3 px-4 text-right">{variant.totalOrdered}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-sm font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
