'use client'

import { useState } from 'react'
import { BulkDeleteButton } from './bulk-delete-button'

interface SubmissionsBulkSelectProps {
  submissions: Array<{ id: number }>
}

export function SubmissionsBulkSelect({ submissions }: SubmissionsBulkSelectProps) {
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
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
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
        <BulkDeleteButton
          selectedIds={selectedIds}
          itemType="submissions"
          onDeleteComplete={handleDeleteComplete}
        />
      </div>
    </>
  )
}

export function useSubmissionsBulkSelect() {
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const handleSelectAll = (submissionIds: number[]) => {
    if (selectedIds.length === submissionIds.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(submissionIds)
    }
  }

  const handleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  return {
    selectedIds,
    setSelectedIds,
    handleSelectAll,
    handleSelectOne,
  }
}

