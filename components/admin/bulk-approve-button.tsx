'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface BulkApproveButtonProps {
  submissionCount: number
}

export function BulkApproveButton({ submissionCount }: BulkApproveButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleBulkApprove = async () => {
    if (submissionCount === 0) return

    const confirmed = confirm(
      `Are you sure you want to approve all ${submissionCount} pending submission(s)? This action cannot be undone.`
    )

    if (!confirmed) return

    setLoading(true)
    try {
      const response = await fetch('/api/admin/moderation/approve-all', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve submissions')
      }

      alert(
        `Successfully approved ${data.approved} submission(s)${
          data.failed > 0 ? `\n${data.failed} failed: ${data.errors.join(', ')}` : ''
        }`
      )

      router.push('/admin/moderation')
      router.refresh()
    } catch (error: any) {
      alert(`Failed to approve submissions: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (submissionCount === 0) {
    return null
  }

  return (
    <Button
      variant="primary"
      onClick={handleBulkApprove}
      disabled={loading}
      className="mb-4"
    >
      {loading ? 'Approving All...' : `Approve All (${submissionCount})`}
    </Button>
  )
}

