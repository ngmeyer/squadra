'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function EmailPreferences() {
  const [preferences, setPreferences] = useState({
    orderConfirmation: true,
    orderShipped: true,
    campaignUpdates: true,
    weeklyDigest: false,
    marketingEmails: false,
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.success('Email preferences saved')
    setIsSaving(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Preferences</CardTitle>
        <CardDescription>
          Control which emails you receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="order-confirmation">Order Confirmations</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Receive emails when customers place orders
              </p>
            </div>
            <Switch
              id="order-confirmation"
              checked={preferences.orderConfirmation}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, orderConfirmation: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="order-shipped">Shipping Notifications</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Get notified when orders are marked as shipped
              </p>
            </div>
            <Switch
              id="order-shipped"
              checked={preferences.orderShipped}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, orderShipped: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="campaign-updates">Campaign Updates</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Updates about your active campaigns
              </p>
            </div>
            <Switch
              id="campaign-updates"
              checked={preferences.campaignUpdates}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, campaignUpdates: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weekly-digest">Weekly Digest</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Weekly summary of your store performance
              </p>
            </div>
            <Switch
              id="weekly-digest"
              checked={preferences.weeklyDigest}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, weeklyDigest: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing-emails">Marketing & Tips</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Product updates, tips, and promotional content
              </p>
            </div>
            <Switch
              id="marketing-emails"
              checked={preferences.marketingEmails}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, marketingEmails: checked })
              }
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Button>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Note: Some transactional emails (like order confirmations) may still be sent for legal
          or operational reasons.
        </p>
      </CardContent>
    </Card>
  )
}
