'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, subDays, startOfDay } from 'date-fns'

interface Order {
  created_at: string
  total_cents: number
  status: string
}

interface RevenueChartProps {
  orders: Order[]
}

export function RevenueChart({ orders }: RevenueChartProps) {
  // Group orders by day for the last 30 days
  const days = 30
  const now = new Date()
  
  const data = []
  for (let i = days - 1; i >= 0; i--) {
    const date = startOfDay(subDays(now, i))
    const dayOrders = orders.filter((order) => {
      const orderDate = startOfDay(new Date(order.created_at))
      return orderDate.getTime() === date.getTime() && order.status === 'paid'
    })
    
    const revenue = dayOrders.reduce((sum, order) => sum + order.total_cents, 0) / 100
    
    data.push({
      date: format(date, 'MMM d'),
      revenue: revenue,
      orders: dayOrders.length,
    })
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            dataKey="date"
            className="text-xs"
            tick={{ fill: 'currentColor' }}
            tickLine={{ stroke: 'currentColor' }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: 'currentColor' }}
            tickLine={{ stroke: 'currentColor' }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: any, name: any) => {
              if (value === undefined || value === null) return ['', '']
              if (name === 'revenue') return [`$${value.toFixed(2)}`, 'Revenue']
              return [value, 'Orders']
            }}
          />
          <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
