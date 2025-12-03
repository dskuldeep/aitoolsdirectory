'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { TrashIcon } from '@heroicons/react/24/outline'

interface ArticleActionsProps {
  article: {
    id: number
  }
}

export function ArticleActions({ article }: ArticleActionsProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/articles/${article.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete article')
      router.refresh()
    } catch (error) {
      console.error('Error deleting article:', error)
      alert('Failed to delete article')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={deleting}
      title="Delete article"
    >
      <TrashIcon className="h-4 w-4 text-red-600" />
    </Button>
  )
}

