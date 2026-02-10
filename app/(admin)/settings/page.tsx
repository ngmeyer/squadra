import { getUser } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { EmailPreferences } from '@/components/settings/email-preferences'
import { StorePreferences } from '@/components/settings/store-preferences'

export default async function SettingsPage() {
  const user = await getUser()
  const supabase = await createClient()

  // Get user stores
  const { data: stores } = await supabase
    .from('stores')
    .select('id, name, slug')
    .eq('created_by', user?.id || '')
    .order('name', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Your account information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              defaultValue={user?.email || ''}
              disabled
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your email address cannot be changed
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Account ID</h3>
            <code className="block text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded break-all">
              {user?.id}
            </code>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Member Since</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Unknown'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Email Preferences */}
      <EmailPreferences />

      {/* Store Preferences */}
      {stores && stores.length > 0 && <StorePreferences stores={stores} />}

      {/* Password Section */}
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Change your password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" disabled />
          </div>
          <Button disabled>Update Password</Button>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Password changes are managed through Supabase Auth. Coming soon.
          </p>
        </CardContent>
      </Card>

      {/* API Access */}
      <Card>
        <CardHeader>
          <CardTitle>API Access</CardTitle>
          <CardDescription>
            Manage API keys and webhooks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            API access and webhook management will be available in a future update.
          </p>
          <Button variant="outline" disabled>
            Generate API Key
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Export Your Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Download all your stores, campaigns, and order data
            </p>
            <Button variant="outline" disabled>
              Export Data
            </Button>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
              Delete Account
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <Button variant="destructive" disabled>
              Delete Account
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Account deletion functionality coming soon
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
