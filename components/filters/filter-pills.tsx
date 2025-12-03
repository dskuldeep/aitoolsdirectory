'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

interface FilterPillProps {
  label: string
  value: string
  param: string
  active?: boolean
}

export function FilterPill({ label, value, param, active }: FilterPillProps) {
  const searchParams = useSearchParams()
  const currentParams = new URLSearchParams(searchParams.toString())
  
  if (value) {
    currentParams.set(param, value)
  } else {
    currentParams.delete(param)
  }

  return (
    <Link
      href={`/tools?${currentParams.toString()}`}
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
        'border border-neutral-200 bg-white shadow-sm',
        'hover:border-primary-400 hover:bg-primary-50 hover:shadow-md hover:scale-105',
        'dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-primary-500 dark:hover:bg-primary-900/30',
        active &&
          'border-primary-500 bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 shadow-md ring-1 ring-primary-200 dark:border-primary-500 dark:from-primary-900/40 dark:to-primary-800/40 dark:text-primary-300 dark:ring-primary-800'
      )}
    >
      {label}
    </Link>
  )
}

interface FilterPillsProps {
  filters: Array<{ label: string; value: string; param: string }>
  activeParam: string
  label?: string
}

export function FilterPills({ filters, activeParam, label }: FilterPillsProps) {
  const searchParams = useSearchParams()
  const activeValue = searchParams.get(activeParam)

  // Filter out any empty values
  const validFilters = filters.filter(
    (filter) => filter.value && filter.value.trim() !== '' && filter.label && filter.label.trim() !== ''
  )

  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      {label && (
        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
          {label}:
        </span>
      )}
      <FilterPill
        label="All"
        value=""
        param={activeParam}
        active={!activeValue}
      />
      {validFilters.map((filter) => (
        <FilterPill
          key={filter.value}
          label={filter.label}
          value={filter.value}
          param={activeParam}
          active={activeValue === filter.value}
        />
      ))}
    </div>
  )
}

