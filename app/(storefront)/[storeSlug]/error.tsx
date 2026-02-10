'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function StoreError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Store error:', error)
  }, [error])

  return (
    <div className="max-w-2xl mx-auto py-12">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 rounded-full p-4">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-gray-900">Something Went Wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-gray-600">
            We encountered an error while loading the store.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => window.location.href = '/'} variant="outline">
              Go Home
            </Button>
            <Button onClick={reset}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
