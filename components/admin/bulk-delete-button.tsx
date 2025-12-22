'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface BulkDeleteButtonProps {
  selectedIds: number[]
  itemType: 'tools' | 'submissions'
  onDeleteComplete?: () => void
}

const API_ROUTES = {
  tools: '/api/admin/tools/bulk-delete',
  submissions: '/api/admin/moderation/bulk-delete',
}

export function BulkDeleteButton({ selectedIds, itemType, onDeleteComplete }: BulkDeleteButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return

    const itemName = itemType === 'tools' ? 'tool(s)' : 'submission(s)'
    const confirmed = confirm(
      `Are you sure you want to delete ${selectedIds.length} ${itemName}? This action cannot be undone.`
    )

    if (!confirmed) return

    setLoading(true)
    try {
      const response = await fetch(API_ROUTES[itemType], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete items')
      }

      alert(
        `Successfully deleted ${data.deleted} ${itemName}${
          data.failed > 0 ? `\n${data.failed} failed: ${data.errors.join(', ')}` : ''
        }`
      )

      if (onDeleteComplete) {
        onDeleteComplete()
      }
      router.refresh()
    } catch (error: any) {
      alert(`Failed to delete ${itemType}: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (selectedIds.length === 0) {
    return null
  }

  return (
    <Button
      variant="outline"
      onClick={handleBulkDelete}
      disabled={loading}
      className="mb-4 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
    >
      {loading ? 'Deleting...' : `Delete Selected (${selectedIds.length})`}
    </Button>
  )
}

