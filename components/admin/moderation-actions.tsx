'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ApproveSubmissionButton({ submissionId }: { submissionId: number }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this submission?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/moderation/${submissionId}/approve`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to approve')

      router.push('/admin/moderation')
      router.refresh()
    } catch (error) {
      alert('Failed to approve submission')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="primary" className="w-full" onClick={handleApprove} disabled={loading}>
      {loading ? 'Approving...' : 'Approve'}
    </Button>
  )
}

export function RejectSubmissionButton({ submissionId }: { submissionId: number }) {
  const [loading, setLoading] = useState(false)
  const [showReason, setShowReason] = useState(false)
  const [reason, setReason] = useState('')
  const router = useRouter()

  const handleReject = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    if (!confirm('Are you sure you want to reject this submission?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/moderation/${submissionId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })

      if (!response.ok) throw new Error('Failed to reject')

      router.push('/admin/moderation')
      router.refresh()
    } catch (error) {
      alert('Failed to reject submission')
    } finally {
      setLoading(false)
    }
  }

  if (!showReason) {
    return (
      <Button
        variant="danger"
        className="w-full"
        onClick={() => setShowReason(true)}
      >
        Reject
      </Button>
    )
  }

  return (
    <div className="space-y-2">
      <Input
        placeholder="Reason for rejection..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <div className="flex gap-2">
        <Button
          variant="danger"
          className="flex-1"
          onClick={handleReject}
          disabled={loading}
        >
          {loading ? 'Rejecting...' : 'Confirm Reject'}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setShowReason(false)
            setReason('')
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}

