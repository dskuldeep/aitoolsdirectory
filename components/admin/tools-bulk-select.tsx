'use client'

import { useState } from 'react'
import { BulkDeleteButton } from './bulk-delete-button'

interface ToolsBulkSelectProps {
  tools: Array<{ id: number; name: string }>
}

export function ToolsBulkSelect({ tools }: ToolsBulkSelectProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const handleSelectAll = () => {
    if (selectedIds.length === tools.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(tools.map((tool) => tool.id))
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
              checked={selectedIds.length === tools.length && tools.length > 0}
              onChange={handleSelectAll}
              className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Select All ({selectedIds.length}/{tools.length})
            </span>
          </label>
        </div>
        <BulkDeleteButton
          selectedIds={selectedIds}
          itemType="tools"
          onDeleteComplete={handleDeleteComplete}
        />
      </div>
      <input type="hidden" name="selectedIds" value={JSON.stringify(selectedIds)} />
    </>
  )
}

export function useToolsBulkSelect() {
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const handleSelectAll = (toolIds: number[]) => {
    if (selectedIds.length === toolIds.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(toolIds)
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

