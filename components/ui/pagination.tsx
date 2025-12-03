import Link from 'next/link'
import { Button } from './button'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  searchParams?: Record<string, string>
}

export function Pagination({ currentPage, totalPages, baseUrl, searchParams = {} }: PaginationProps) {
  const createUrl = (page: number) => {
    const params = new URLSearchParams({ ...searchParams, page: page.toString() })
    return `${baseUrl}?${params.toString()}`
  }

  if (totalPages <= 1) return null

  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages, start + maxVisible - 1)

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      {currentPage > 1 && (
        <Link href={createUrl(currentPage - 1)}>
          <Button variant="outline" size="sm">
            <ChevronLeftIcon className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>
        </Link>
      )}

      {start > 1 && (
        <>
          <Link href={createUrl(1)}>
            <Button variant={currentPage === 1 ? 'primary' : 'outline'} size="sm">
              1
            </Button>
          </Link>
          {start > 2 && <span className="px-2 text-neutral-500">...</span>}
        </>
      )}

      {pages.map((page) => (
        <Link key={page} href={createUrl(page)}>
          <Button variant={currentPage === page ? 'primary' : 'outline'} size="sm">
            {page}
          </Button>
        </Link>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-2 text-neutral-500">...</span>}
          <Link href={createUrl(totalPages)}>
            <Button variant={currentPage === totalPages ? 'primary' : 'outline'} size="sm">
              {totalPages}
            </Button>
          </Link>
        </>
      )}

      {currentPage < totalPages && (
        <Link href={createUrl(currentPage + 1)}>
          <Button variant="outline" size="sm">
            <span className="sr-only">Next</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </Link>
      )}
    </nav>
  )
}

