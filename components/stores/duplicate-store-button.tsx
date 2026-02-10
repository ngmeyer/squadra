'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy } from 'lucide-react'
import { duplicateStoreAction } from '@/app/(admin)/stores/actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface DuplicateStoreButtonProps {
  storeId: string
  storeName: string
}

export function DuplicateStoreButton({ storeId, storeName }: DuplicateStoreButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [newName, setNewName] = useState(`${storeName} (Copy)`)
  const [isLoading, setIsLoading] = useState(false)

  const handleDuplicate = async () => {
    if (!newName.trim()) {
      toast.error('Please enter a store name')
      return
    }

    setIsLoading(true)

    try {
      const result = await duplicateStoreAction(storeId, newName.trim())

      if (result.success && result.data) {
        toast.success('Store duplicated successfully')
        setIsOpen(false)
        router.push(`/stores/${result.data.id}`)
      } else {
        toast.error(result.error || 'Failed to duplicate store')
      }
    } catch (error) {
      console.error('Error duplicating store:', error)
      toast.error('Failed to duplicate store')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        title="Duplicate store"
      >
        <Copy className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Store</DialogTitle>
            <DialogDescription>
              Create a copy of &quot;{storeName}&quot; with all its settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">New Store Name</Label>
              <Input
                id="new-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter new store name"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                The URL slug will be automatically generated from this name
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleDuplicate} disabled={isLoading}>
              {isLoading ? 'Duplicating...' : 'Duplicate Store'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
