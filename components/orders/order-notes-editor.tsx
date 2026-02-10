'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { updateOrderNotes } from '@/app/(admin)/orders/actions'
import { Save } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface OrderNotesEditorProps {
  orderId: string
  initialNotes: string
}

export function OrderNotesEditor({ orderId, initialNotes }: OrderNotesEditorProps) {
  const router = useRouter()
  const [notes, setNotes] = useState(initialNotes)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    setSaved(false)
    try {
      const result = await updateOrderNotes(orderId, notes)
      if (result.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        router.refresh()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      alert('Failed to save notes')
    } finally {
      setLoading(false)
    }
  }

  const hasChanges = notes !== initialNotes

  return (
    <div className="space-y-4">
      <Label htmlFor="notes">Admin Notes</Label>
      <Textarea
        id="notes"
        placeholder="Add internal notes about this order..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
      />
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={loading || !hasChanges}
          size="sm"
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Notes'}
        </Button>
        {saved && (
          <span className="text-sm text-green-600 dark:text-green-400">
            ✓ Saved
          </span>
        )}
      </div>
    </div>
  )
}
