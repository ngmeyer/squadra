import { Store, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6 mb-6">
        <Store className="h-12 w-12 text-gray-400 dark:text-gray-600" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        No stores yet
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-sm mb-6">
        Stores are your online storefronts. Create one to start managing campaigns, 
        products, and orders for your organization.
      </p>

      <Link href="/stores/new">
        <Button>
          <ShoppingBag className="mr-2 h-4 w-4" />
          Create Your First Store
        </Button>
      </Link>
    </div>
  )
}
