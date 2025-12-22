import { NextRequest, NextResponse } from 'next/server'

import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import { z } from 'zod'


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

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin()
    const body = await request.json()
    const validated = articleSchema.parse(body)

    const slug = slugify(validated.title)
    const existing = await prisma.article.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { error: 'An article with this title already exists' },
        { status: 400 }
      )
    }

    const article = await prisma.article.create({
      data: {
        slug,
        title: validated.title,
        excerpt: validated.excerpt || null,
        body: validated.body,
        tags: validated.tags || [],
        published: validated.published ?? false,
        featured: validated.featured ?? false,
        heroImage: validated.heroImage || null,
        publishedAt: validated.published && validated.publishedAt
          ? new Date(validated.publishedAt)
          : validated.published
          ? new Date()
          : null,
        authorId: user.id,
      },
    })

    return NextResponse.json({ success: true, article }, { status: 201 })
  } catch (error: any) {
    console.error('Create article error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create article' },
      { status: 500 }
    )
  }
}

