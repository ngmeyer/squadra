import { Suspense } from 'react'
import { Plus, Store as StoreIcon, ExternalLink, Pencil } from 'lucide-react'
import { DuplicateStoreButton } from '@/components/stores/duplicate-store-button'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getStores } from '@/lib/supabase/queries'
import { EmptyState } from '@/components/stores/empty-state'
import { formatDistanceToNow } from 'date-fns'

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      ))}
    </div>
  )
}

async function StoresList() {
  const stores = await getStores()

  if (stores.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Stores</CardTitle>
        <CardDescription>
          Manage your online stores and their settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.map((store) => (
              <TableRow key={store.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    {store.logo_url ? (
                      <img
                        src={store.logo_url}
                        alt={store.name}
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <StoreIcon className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                    <span>{store.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {store.slug}
                  </code>
                </TableCell>
                <TableCell>
                  <Badge variant="default">Active</Badge>
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-400">
                  {formatDistanceToNow(new Date(store.created_at), { addSuffix: true })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/stores/${store.id}`}>
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DuplicateStoreButton storeId={store.id} storeName={store.name} />
                    <Link href={`/store/${store.slug}`} target="_blank">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

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
        <Link href="/stores/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Store
          </Button>
        </Link>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <StoresList />
      </Suspense>
    </div>
  )
}
