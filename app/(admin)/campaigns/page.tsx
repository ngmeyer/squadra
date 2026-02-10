import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your group buying campaigns
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Campaigns</CardTitle>
          <CardDescription>
            You haven&apos;t created any campaigns yet
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Create your first campaign to start collecting orders
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
