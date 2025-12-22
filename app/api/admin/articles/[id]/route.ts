import { NextRequest, NextResponse } from 'next/server'

import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import { z } from 'zod'

export const runtime = "edge"

const articleSchema = z.object({
  title: z.string().min(1).max(200),
  excerpt: z.string().max(500).optional().nullable(),
  body: z.string().min(100),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  heroImage: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val || val === '') return true
        // Allow URLs or relative paths starting with /api/images/
        return z.string().url().safeParse(val).success || val.startsWith('/api/images/')
      },
      { message: 'Hero image must be a valid URL or an uploaded image path' }
    ),
  publishedAt: z.string().datetime().optional().nullable(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const articleId = parseInt(params.id)
    const body = await request.json()
    const validated = articleSchema.parse(body)

    const existing = await prisma.article.findUnique({ where: { id: articleId } })
    if (!existing) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Check slug uniqueness if title changed
    let slug = existing.slug
    if (validated.title !== existing.title) {
      slug = slugify(validated.title)
      const slugExists = await prisma.article.findUnique({ where: { slug } })
      if (slugExists && slugExists.id !== articleId) {
        return NextResponse.json(
          { error: 'An article with this title already exists' },
          { status: 400 }
        )
      }
    }

    const article = await prisma.article.update({
      where: { id: articleId },
      data: {
        slug,
        title: validated.title,
        excerpt: validated.excerpt || null,
        body: validated.body,
        tags: validated.tags || [],
        published: validated.published ?? existing.published,
        featured: validated.featured ?? existing.featured,
        heroImage: validated.heroImage || null,
        publishedAt:
          validated.published && !existing.publishedAt && !validated.publishedAt
            ? new Date()
            : validated.publishedAt
            ? new Date(validated.publishedAt)
            : existing.publishedAt,
      },
    })

    return NextResponse.json({ success: true, article })
  } catch (error: any) {
    console.error('Update article error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update article' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const articleId = parseInt(params.id)

    const article = await prisma.article.findUnique({ where: { id: articleId } })
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    await prisma.article.delete({ where: { id: articleId } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete article error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete article' },
      { status: 500 }
    )
  }
}

