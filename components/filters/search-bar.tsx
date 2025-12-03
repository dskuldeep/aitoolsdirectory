'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (query) {
      params.set('q', query)
    } else {
      params.delete('q')
    }
    params.set('page', '1')
    router.push(`/tools?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row">
      <div className="relative flex-1">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-primary-500" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools by name, tagline, or description..."
          className="group h-12 rounded-xl border-neutral-200 bg-white pl-12 pr-4 text-base shadow-sm transition-all hover:border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:ring-offset-0 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-600 dark:focus:border-primary-500"
        />
      </div>
      <div className="flex gap-3">
        <Select
          name="sort"
          defaultValue={searchParams.get('sort') || 'newest'}
          onChange={(e) => {
            const params = new URLSearchParams(searchParams.toString())
            params.set('sort', e.target.value)
            params.set('page', '1')
            router.push(`/tools?${params.toString()}`)
          }}
          className="h-12 min-w-[160px] rounded-xl border-neutral-200 bg-white shadow-sm transition-all hover:border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:ring-offset-0 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-600 dark:focus:border-primary-500"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="popular">Most Popular</option>
          <option value="name">Name (A-Z)</option>
        </Select>
        <Button
          type="submit"
          size="lg"
          className="h-12 rounded-xl px-6 shadow-md transition-all hover:shadow-lg"
        >
          Search
        </Button>
      </div>
    </form>
  )
}

