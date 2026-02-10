'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface Campaign {
  id: string
  name: string
}

interface OrdersFiltersProps {
  campaigns: Campaign[]
  currentFilters: {
    status?: string
    campaign?: string
    search?: string
  }
}

export function OrdersFilters({ campaigns, currentFilters }: OrdersFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    router.push(`/orders?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/orders')
  }

  const hasFilters = currentFilters.status || currentFilters.campaign || currentFilters.search

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex-1">
        <Input
          placeholder="Search by customer name, email, or order number..."
          defaultValue={currentFilters.search}
          onChange={(e) => {
            const value = e.target.value
            setTimeout(() => updateFilter('search', value || null), 500)
          }}
        />
      </div>

      <Select
        value={currentFilters.status || 'all'}
        onValueChange={(value) => updateFilter('status', value === 'all' ? null : value)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="shipped">Shipped</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={currentFilters.campaign || 'all'}
        onValueChange={(value) => updateFilter('campaign', value === 'all' ? null : value)}
      >
        <SelectTrigger className="w-full sm:w-[220px]">
          <SelectValue placeholder="Campaign" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Campaigns</SelectItem>
          {campaigns.map((campaign) => (
            <SelectItem key={campaign.id} value={campaign.id}>
              {campaign.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" onClick={clearFilters}>
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>
      )}
    </div>
  )
}
