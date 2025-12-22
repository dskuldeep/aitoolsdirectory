'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ToolActions } from './tool-actions'
import { BulkDeleteButton } from './bulk-delete-button'
import { formatDate } from '@/lib/utils'

interface Tool {
  id: number
  name: string
  tagline: string | null
  category: string
  approved: boolean
  featured: boolean
  views: number
  createdAt: Date
  slug: string
  submitter: {
    name: string | null
    email: string
  } | null
}

interface ToolsTableProps {
  tools: Tool[]
}

export function ToolsTable({ tools }: ToolsTableProps) {
  const router = useRouter()
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
    router.refresh()
  }

  return (
    <>
      {selectedIds.length > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-red-800 dark:text-red-200">
              {selectedIds.length} tool(s) selected
            </span>
          </div>
          <BulkDeleteButton
            selectedIds={selectedIds}
            itemType="tools"
            onDeleteComplete={handleDeleteComplete}
          />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.length === tools.length && tools.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Views
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {tools.map((tool) => (
              <tr
                key={tool.id}
                className={`hover:bg-neutral-50 dark:hover:bg-neutral-900 ${
                  selectedIds.includes(tool.id) ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(tool.id)}
                    onChange={() => handleSelectOne(tool.id)}
                    className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium">{tool.name}</div>
                  {tool.tagline && (
                    <div className="text-sm text-neutral-500">{tool.tagline}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <Badge variant="primary">{tool.category}</Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {tool.approved ? (
                      <Badge variant="success">Approved</Badge>
                    ) : (
                      <Badge variant="warning">Pending</Badge>
                    )}
                    {tool.featured && <Badge variant="primary">Featured</Badge>}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{tool.views}</td>
                <td className="px-6 py-4 text-sm text-neutral-500">
                  {formatDate(tool.createdAt)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/tools/${tool.slug}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                    <Link href={`/admin/tools/${tool.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <ToolActions tool={tool} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

