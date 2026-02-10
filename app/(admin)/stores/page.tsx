import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function StoresPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stores</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your online stores
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Store
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Stores</CardTitle>
          <CardDescription>
            You haven&apos;t created any stores yet
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Create your first store to start selling
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Store
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
