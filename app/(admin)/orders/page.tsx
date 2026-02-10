import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package } from 'lucide-react'

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage and fulfill customer orders
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>
            No orders yet
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Orders from your campaigns will appear here
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
