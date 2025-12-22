'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { BulkDeleteButton } from './bulk-delete-button'
import { formatDate } from '@/lib/utils'

interface Submission {
  id: number
  toolData: any
  submitterEmail: string
  submitterName: string | null
  createdAt: Date
}

interface SubmissionsTableProps {
  submissions: Submission[]
}

export function SubmissionsTable({ submissions }: SubmissionsTableProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const handleSelectAll = () => {
    if (selectedIds.length === submissions.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(submissions.map((submission) => submission.id))
    }
  }

  const handleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleDeleteComplete = () => {
    setSelectedIds([])
    router.refresh()
  }

  return (
    <>
      {selectedIds.length > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-red-800 dark:text-red-200">
              {selectedIds.length} submission(s) selected
            </span>
          </div>
          <BulkDeleteButton
            selectedIds={selectedIds}
            itemType="submissions"
            onDeleteComplete={handleDeleteComplete}
          />
        </div>
      )}

      <div className="mb-4 flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedIds.length === submissions.length && submissions.length > 0}
            onChange={handleSelectAll}
            className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            Select All ({selectedIds.length}/{submissions.length})
          </span>
        </label>
      </div>

      <div className="space-y-4">
        {submissions.map((submission) => {
          const toolData = submission.toolData as any
          const isSelected = selectedIds.includes(submission.id)
          return (
            <Card
              key={submission.id}
              className={isSelected ? 'border-2 border-primary-500 bg-primary-50 dark:bg-primary-900/20' : ''}
            >
              <CardContent className="p-6">
                <div className="mb-4 flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectOne(submission.id)}
                    className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">{toolData.name}</h3>
                        {toolData.tagline && (
                          <p className="text-neutral-600 dark:text-neutral-400">
                            {toolData.tagline}
                          </p>
                        )}
                      </div>
                      <Badge variant="warning">Pending</Badge>
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Category:</span> {toolData.category}
                      </div>
                      <div>
                        <span className="font-medium">Submitter:</span> {submission.submitterEmail}
                      </div>
                      <div>
                        <span className="font-medium">Submitted:</span>{' '}
                        {formatDate(submission.createdAt)}
                      </div>
                      {toolData.website && (
                        <div>
                          <span className="font-medium">Website:</span>{' '}
                          <a
                            href={toolData.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:underline"
                          >
                            {toolData.website}
                          </a>
                        </div>
                      )}
                    </div>

                    {toolData.description && (
                      <div className="mb-4">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {toolData.description.slice(0, 200)}...
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Link href={`/admin/moderation/${submission.id}`}>
                        <Button variant="primary">Review</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </>
  )
}

