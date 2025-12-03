'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

interface FilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  filters: {
    category?: string
    pricing?: string
    license?: string
    tags?: string[]
  }
  onFilterChange: (filters: any) => void
  categories: string[]
  pricingOptions: string[]
  licenseOptions: string[]
}

export function FilterDrawer({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  categories,
  pricingOptions,
  licenseOptions,
}: FilterDrawerProps) {
  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-xl dark:bg-neutral-900">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium">Category</label>
                <Select
                  value={filters.category || ''}
                  onChange={(e) => onFilterChange({ ...filters, category: e.target.value || undefined })}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Pricing</label>
                <Select
                  value={filters.pricing || ''}
                  onChange={(e) => onFilterChange({ ...filters, pricing: e.target.value || undefined })}
                >
                  <option value="">All Pricing</option>
                  {pricingOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">License</label>
                <Select
                  value={filters.license || ''}
                  onChange={(e) => onFilterChange({ ...filters, license: e.target.value || undefined })}
                >
                  <option value="">All Licenses</option>
                  {licenseOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
          <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
            <Button variant="primary" className="w-full" onClick={onClose}>
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

