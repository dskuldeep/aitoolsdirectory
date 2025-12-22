import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'


export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const tag = searchParams.get('tag') || undefined

    const skip = (page - 1) * limit

    const where: any = {
      published: true,
    }

    if (tag) {
      where.tags = { has: tag }
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: {
          author: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      }),
      prisma.article.count({ where }),
    ])

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Blog API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

