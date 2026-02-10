'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface ChartData {
  date: string
  orders: number
  revenue: number
}

interface AnalyticsChartProps {
  data: ChartData[]
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  const [view, setView] = useState<'orders' | 'revenue'>('orders')

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {view === 'orders' ? 'Orders Over Time' : 'Revenue Over Time'}
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant={view === 'orders' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('orders')}
          >
            Orders
          </Button>
          <Button
            variant={view === 'revenue' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('revenue')}
          >
            Revenue
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {view === 'orders' ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getMonth() + 1}/${date.getDate()}`
                }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(value) => {
                  const date = new Date(value as string)
                  return date.toLocaleDateString()
                }}
                formatter={(value) => [`${value || 0} orders`, 'Orders']}
              />
              <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getMonth() + 1}/${date.getDate()}`
                }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 100).toFixed(0)}`}
              />
              <Tooltip
                labelFormatter={(value) => {
                  const date = new Date(value as string)
                  return date.toLocaleDateString()
                }}
                formatter={(value) => [
                  `$${((Number(value) || 0) / 100).toFixed(2)}`,
                  'Revenue',
                ]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
