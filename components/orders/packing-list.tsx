'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Printer } from 'lucide-react'

interface PackingListProps {
  order: any
}

export function PackingList({ order }: PackingListProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})

  // Group items by product and variant
  const groupedItems = order.order_items.reduce((acc: any, item: any) => {
    const key = `${item.variant.campaign_product.title}-${JSON.stringify(item.variant.option_combo)}`
    
    if (!acc[key]) {
      acc[key] = {
        productTitle: item.variant.campaign_product.title,
        variantOptions: item.variant.option_combo,
        items: [],
        totalQuantity: 0,
      }
    }
    
    acc[key].items.push(item)
    acc[key].totalQuantity += item.quantity
    
    return acc
  }, {})

  const handlePrint = () => {
    window.print()
  }

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <Card className="print:border-0 print:shadow-none">
      <CardHeader className="print:pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Packing List</CardTitle>
            <CardDescription>
              Order #{order.order_number} • {order.campaign.name}
            </CardDescription>
          </div>
          <Button onClick={handlePrint} variant="outline" className="print:hidden">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ship To Info - Print only */}
        <div className="hidden print:block mb-6 pb-4 border-b">
          <div className="font-semibold mb-2">Ship To:</div>
          <div className="whitespace-pre-line text-sm">
            {order.campaign.ship_to_address}
          </div>
        </div>

        <div className="space-y-6">
          {Object.values(groupedItems).map((group: any, index: number) => (
            <div key={index} className="border-b pb-4 last:border-0">
              <div className="font-semibold text-lg mb-2">
                {group.productTitle}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {Object.entries(group.variantOptions).map(([key, value]) => (
                  <div key={key}>
                    {key}: {String(value)}
                  </div>
                ))}
                <div className="font-semibold mt-1">
                  Total Quantity: {group.totalQuantity}
                </div>
              </div>

              {/* Individual items with customizations */}
              {group.items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 py-2 border-t print:border-gray-300"
                >
                  <Checkbox
                    checked={checkedItems[item.id] || false}
                    onCheckedChange={() => toggleItem(item.id)}
                    className="print:border-2 print:border-black mt-1"
                  />
                  <div className="flex-1">
                    <div className="text-sm">
                      Qty: {item.quantity}
                      {item.customization_value && (
                        <div className="text-gray-600 dark:text-gray-400 italic mt-1">
                          Customization: {item.customization_value}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t print:border-gray-300">
          <div className="flex justify-between font-semibold">
            <span>Total Items:</span>
            <span>
              {order.order_items.reduce(
                (sum: number, item: any) => sum + item.quantity,
                0
              )}
            </span>
          </div>
        </div>

        {/* Signature Line - Print only */}
        <div className="hidden print:block mt-12 pt-8 border-t border-gray-300">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <div className="text-sm text-gray-600 mb-2">Packed By:</div>
              <div className="border-b border-gray-400 pb-2"></div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600 mb-2">Date:</div>
              <div className="border-b border-gray-400 pb-2"></div>
            </div>
          </div>
        </div>
      </CardContent>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block,
          .print\\:block * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
          nav,
          header,
          footer {
            display: none !important;
          }
        }
      `}</style>
    </Card>
  )
}
