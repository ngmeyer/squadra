'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Store {
  id: string
  name: string
  slug: string
}

interface StorePreferencesProps {
  stores: Store[]
}

export function StorePreferences({ stores }: StorePreferencesProps) {
  const [defaultStore, setDefaultStore] = useState(stores[0]?.id || '')
  const [defaultView, setDefaultView] = useState('dashboard')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.success('Store preferences saved')
    setIsSaving(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Store Preferences</CardTitle>
        <CardDescription>
          Set your default store and view preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="default-store">Default Store</Label>
          <Select value={defaultStore} onValueChange={setDefaultStore}>
            <SelectTrigger id="default-store">
              <SelectValue placeholder="Select a store" />
            </SelectTrigger>
            <SelectContent>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            The store to show by default when creating campaigns
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="default-view">Default Landing Page</Label>
          <Select value={defaultView} onValueChange={setDefaultView}>
            <SelectTrigger id="default-view">
              <SelectValue placeholder="Select a view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dashboard">Dashboard</SelectItem>
              <SelectItem value="stores">Stores</SelectItem>
              <SelectItem value="campaigns">Campaigns</SelectItem>
              <SelectItem value="orders">Orders</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            The page you see when you log in
          </p>
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Button>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Note: Preference storage functionality coming soon. Changes are currently local only.
        </p>
      </CardContent>
    </Card>
  )
}
