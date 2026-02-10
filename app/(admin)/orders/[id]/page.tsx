import { notFound } from 'next/navigation'
import { getOrderById } from '../actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { OrderStatusManager } from '@/components/orders/order-status-manager'
import { OrderNotesEditor } from '@/components/orders/order-notes-editor'
import { PackingList } from '@/components/orders/packing-list'
import { formatDistanceToNow } from 'date-fns'
import { ArrowLeft, Package, User, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { order, error } = await getOrderById(params.id)

  if (error || !order) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/orders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Order {order.order_number}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Placed {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Name
              </div>
              <div className="text-base">{order.customer_name}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Email
              </div>
              <div className="text-base">{order.customer_email}</div>
            </div>
            {order.customer_phone && (
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Phone
                </div>
                <div className="text-base">{order.customer_phone}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Campaign & Shipping Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Campaign & Shipping
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Campaign
              </div>
              <div className="text-base">{order.campaign.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Ship To
              </div>
              <div className="text-base whitespace-pre-line">
                {order.campaign.ship_to_address}
              </div>
            </div>
            {order.campaign.ships_at && (
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Expected Ship Date
                </div>
                <div className="text-base">
                  {new Date(order.campaign.ships_at).toLocaleDateString()}
                </div>
              </div>
            )}
            {order.tracking_number && (
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Tracking Number
                </div>
                <div className="text-base font-mono">{order.tracking_number}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.order_items.map((item: any) => (
              <div key={item.id} className="flex items-start justify-between py-4 border-b last:border-0">
                <div className="flex-1">
                  <div className="font-medium">{item.variant.campaign_product.title}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-1">
                    {Object.entries(item.variant.option_combo).map(([key, value]) => (
                      <div key={key}>
                        {key}: {String(value)}
                      </div>
                    ))}
                    {item.customization_value && (
                      <div className="italic">
                        Customization: {item.customization_value}
                      </div>
                    )}
                    <div>Quantity: {item.quantity}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    ${(item.total_price_cents / 100).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    ${(item.unit_price_cents / 100).toFixed(2)} each
                  </div>
                </div>
              </div>
            ))}

            <div className="space-y-2 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span>${(order.subtotal_cents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Tax</span>
                <span>${(order.tax_cents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span>${(order.total_cents / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Payment Status
            </div>
            <div className="text-base">
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
          {order.stripe_payment_intent_id && (
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Stripe Payment Intent
              </div>
              <div className="text-base font-mono text-sm">
                {order.stripe_payment_intent_id}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Management */}
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>
            Update order status and add notes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <OrderStatusManager
            orderId={order.id}
            currentStatus={order.status}
            trackingNumber={order.tracking_number}
          />
          <OrderNotesEditor
            orderId={order.id}
            initialNotes={order.notes || ''}
          />
        </CardContent>
      </Card>

      {/* Packing List */}
      <PackingList order={order} />
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
    <Badge variant={variants[status] || 'default'}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}
