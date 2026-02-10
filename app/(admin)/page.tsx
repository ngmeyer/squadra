import { getUser } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Store, Megaphone, Package, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const user = await getUser()

  if (!user) {
    return null
  }

  // TODO: Fetch actual data from Supabase
  // For now, using placeholder data
  const stats = {
    totalStores: 0,
    activeCampaigns: 0,
    totalOrders: 0,
    pendingOrders: 0,
  }

  const recentActivity: Array<{
    id: string
    type: string
    message: string
    timestamp: Date
  }> = [
    // Placeholder - will be replaced with actual data
  ]

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
            <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
            <Store className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStores}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Create your first store to get started
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Campaigns
            </CardTitle>
            <Megaphone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Orders
            </CardTitle>
            <Package className="h-4 w-4 text-orange-500 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Need fulfillment
            </p>
          </CardContent>
        </Card>
      </div>

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
            <Link href="/admin/stores">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2">
                  <Store className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Create Store</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Set up a new shop
                  </div>
                </div>
              </div>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto py-6 justify-start">
            <Link href="/admin/campaigns">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 dark:bg-green-900 p-2">
                  <Megaphone className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">New Campaign</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Launch group buy
                  </div>
                </div>
              </div>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto py-6 justify-start">
            <Link href="/admin/orders">
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

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates from your campaigns
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/orders">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
              <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
                No activity yet
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by creating your first store and campaign.
              </p>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/admin/stores">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Store
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Activity items will go here */}
              {recentActivity.map((item, index) => (
                <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                  {/* Activity item content */}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Getting Started Guide (shown when no stores exist) */}
      {stats.totalStores === 0 && (
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
                <Link href="/admin/stores">
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

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}
