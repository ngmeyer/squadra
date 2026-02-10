import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import Link from 'next/link'

export default function StoreNotFound() {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gray-100 rounded-full p-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
          </div>
          <CardTitle className="text-2xl text-gray-900">Store Not Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-gray-600">
            The store you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
