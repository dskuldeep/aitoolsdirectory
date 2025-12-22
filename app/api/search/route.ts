import { NextRequest, NextResponse } from 'next/server'

import { searchTools } from '@/lib/search'

export const runtime = "edge"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get('q') || ''
    const filters = searchParams.get('filters') || undefined
    const sort = searchParams.get('sort')?.split(',') || ['createdAt:desc']
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const facets = searchParams.get('facets')?.split(',') || ['category', 'tags', 'pricing']

    const result = await searchTools({
      q,
      filters,
      sort,
      page,
      limit,
      facets,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    )
  }
}

