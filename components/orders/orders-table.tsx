'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, Download, Package } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { bulkMarkAsShippedAction } from '@/app/(admin)/orders/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  status: 'pending' | 'paid' | 'shipped' | 'cancelled'
  total_cents: number
  created_at: string
  campaign: {
    id: string
    name: string
  }
}

interface OrdersTableProps {
  orders: Order[]
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const router = useRouter()
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [isProcessing, setIsProcessing] = useState(false)

  const toggleOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders)
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId)
    } else {
      newSelected.add(orderId)
    }
    setSelectedOrders(newSelected)
  }

  const toggleAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set())
    } else {
      setSelectedOrders(new Set(orders.map((o) => o.id)))
    }
  }

  const handleBulkMarkAsShipped = async () => {
    if (selectedOrders.size === 0) return

    setIsProcessing(true)
    try {
      const orderIds = Array.from(selectedOrders)
      const result = await bulkMarkAsShippedAction(orderIds)

      if (result.success) {
        toast.success(`${orderIds.length} order(s) marked as shipped`)
        setSelectedOrders(new Set())
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to mark orders as shipped')
      }
    } catch (error) {
      console.error('Error marking orders as shipped:', error)
      toast.error('Failed to mark orders as shipped')
    } finally {
      setIsProcessing(false)
    }
  }

  const exportToCSV = (selectedOnly = false) => {
    const ordersToExport = selectedOnly
      ? orders.filter((o) => selectedOrders.has(o.id))
      : orders

    if (ordersToExport.length === 0) {
      toast.error('No orders to export')
      return
    }

    const headers = [
      'Order Number',
      'Customer Name',
      'Customer Email',
      'Campaign',
      'Status',
      'Total',
      'Date',
    ]

    const rows = ordersToExport.map((order) => [
      order.order_number,
      order.customer_name,
      order.customer_email,
      order.campaign.name,
      order.status,
      (order.total_cents / 100).toFixed(2),
      new Date(order.created_at).toLocaleDateString(),
    ])

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast.success(`Exported ${ordersToExport.length} order(s)`)
  }

  return (
    <div>
      {/* Bulk Action Bar */}
      {selectedOrders.size > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg border bg-blue-50 dark:bg-blue-900/20 p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {selectedOrders.size} order(s) selected
            </span>
            <Button
              variant="default"
              size="sm"
              onClick={handleBulkMarkAsShipped}
              disabled={isProcessing}
            >
              <Package className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Mark as Shipped'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV(true)}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Selected
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedOrders(new Set())}
          >
            Clear Selection
          </Button>
        </div>
      )}

      {/* Export All Button */}
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={() => exportToCSV(false)}>
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50 dark:bg-gray-800">
                <th className="px-4 py-3 text-left">
                  <Checkbox
                    checked={
                      orders.length > 0 && selectedOrders.size === orders.length
                    }
                    onCheckedChange={toggleAll}
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Order #
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Campaign
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedOrders.has(order.id)}
                      onCheckedChange={() => toggleOrder(order.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-mono text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {order.customer_name}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">
                        {order.customer_email}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {order.campaign.name}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                    ${(order.total_cents / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(order.created_at), {
                      addSuffix: true,
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function OrderStatusBadge({ status }: { status: string }) {
  const variants: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
  > = {
    pending: 'outline',
    paid: 'default',
    shipped: 'secondary',
    cancelled: 'destructive',
  }

  return (
    <Badge variant={variants[status] || 'default'}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}
