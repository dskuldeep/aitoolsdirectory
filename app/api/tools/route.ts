import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category') || undefined
    const tag = searchParams.get('tag') || undefined
    const pricing = searchParams.get('pricing') || undefined
    const license = searchParams.get('license') || undefined
    const sort = searchParams.get('sort') || 'newest'
    const search = searchParams.get('q') || undefined

    const skip = (page - 1) * limit

    const where: any = {
      approved: true,
    }

    if (category) {
      where.category = category
    }

    if (tag) {
      where.tags = { has: tag }
    }

    if (pricing) {
      where.pricing = pricing
    }

    if (license) {
      where.license = license
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { tagline: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ]
    }

    const orderBy: any = {}
    switch (sort) {
      case 'newest':
        orderBy.createdAt = 'desc'
        break
      case 'oldest':
        orderBy.createdAt = 'asc'
        break
      case 'popular':
        orderBy.views = 'desc'
        break
      case 'name':
        orderBy.name = 'asc'
        break
      default:
        orderBy.createdAt = 'desc'
    }

    const [tools, total] = await Promise.all([
      prisma.tool.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.tool.count({ where }),
    ])

    return NextResponse.json({
      tools,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Tools API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tools' },
      { status: 500 }
    )
  }
}

