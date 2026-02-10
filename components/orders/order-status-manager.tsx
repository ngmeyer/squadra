'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { markAsShipped, cancelOrder } from '@/app/(admin)/orders/actions'
import { Package, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface OrderStatusManagerProps {
  orderId: string
  currentStatus: string
  trackingNumber: string | null
}

export function OrderStatusManager({
  orderId,
  currentStatus,
  trackingNumber,
}: OrderStatusManagerProps) {
  const router = useRouter()
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [tracking, setTracking] = useState(trackingNumber || '')
  const [cancelReason, setCancelReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleMarkAsShipped = async () => {
    setLoading(true)
    try {
      const result = await markAsShipped(orderId, tracking || undefined)
      if (result.success) {
        setShippingDialogOpen(false)
        router.refresh()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      alert('Failed to mark order as shipped')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    setLoading(true)
    try {
      const result = await cancelOrder(orderId, cancelReason || undefined)
      if (result.success) {
        setCancelDialogOpen(false)
        router.refresh()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      alert('Failed to cancel order')
    } finally {
      setLoading(false)
    }
  }

  const canShip = currentStatus === 'paid'
  const canCancel = currentStatus !== 'cancelled' && currentStatus !== 'shipped'

  return (
    <div className="flex flex-wrap gap-3">
      <Dialog open={shippingDialogOpen} onOpenChange={setShippingDialogOpen}>
        <DialogTrigger asChild>
          <Button disabled={!canShip} variant="default">
            <Package className="h-4 w-4 mr-2" />
            Mark as Shipped
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Order as Shipped</DialogTitle>
            <DialogDescription>
              This will update the order status and send a shipping confirmation email to the customer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tracking">Tracking Number (Optional)</Label>
              <Input
                id="tracking"
                placeholder="Enter tracking number"
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShippingDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleMarkAsShipped} disabled={loading}>
              {loading ? 'Processing...' : 'Mark as Shipped'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogTrigger asChild>
          <Button disabled={!canCancel} variant="destructive">
            <XCircle className="h-4 w-4 mr-2" />
            Cancel Order
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              This will cancel the order. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Cancellation Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for cancellation"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={loading}
            >
              Back
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={loading}
            >
              {loading ? 'Cancelling...' : 'Cancel Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {currentStatus === 'shipped' && trackingNumber && (
        <div className="w-full mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tracking Number
          </div>
          <div className="font-mono text-base">{trackingNumber}</div>
        </div>
      )}
    </div>
  )
}
