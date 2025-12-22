import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'


export const revalidate = 60

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const article = await prisma.article.findUnique({
      where: {
        slug: params.slug,
      },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    })

    if (!article || !article.published) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Increment views
    await prisma.article.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json(article)
  } catch (error: any) {
    console.error('Article API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch article' },
      { status: 500 }
    )
  }
}

