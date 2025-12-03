'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { StarIcon, TrashIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

interface ToolActionsProps {
  tool: {
    id: number
    featured: boolean
  }
}

export function ToolActions({ tool }: ToolActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleToggleFeatured = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/tools/${tool.id}/featured`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to toggle featured')
      router.refresh()
    } catch (error) {
      console.error('Error toggling featured:', error)
      alert('Failed to toggle featured status')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this tool? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/tools/${tool.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete tool')
      router.refresh()
    } catch (error) {
      console.error('Error deleting tool:', error)
      alert('Failed to delete tool')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleFeatured}
        disabled={loading}
        title={tool.featured ? 'Remove from featured' : 'Mark as featured'}
      >
        {tool.featured ? (
          <StarIconSolid className="h-4 w-4 text-yellow-500" />
        ) : (
          <StarIcon className="h-4 w-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={deleting}
        title="Delete tool"
      >
        <TrashIcon className="h-4 w-4 text-red-600" />
      </Button>
    </>
  )
}

