import { NextRequest, NextResponse } from 'next/server'
export const runtime = "edge"

import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import { z } from 'zod'
import { indexTool } from '@/lib/search'

const toolSchema = z.object({
  name: z.string().min(1).max(200),
  tagline: z.string().max(300).optional().nullable(),
  description: z.string().min(50),
  category: z.string().min(1),
  tags: z.array(z.string()).min(1).max(10),
  website: z.string().url().optional().nullable(),
  github: z.string().url().optional().nullable(),
  pricing: z.string().optional().nullable(),
  license: z.string().optional().nullable(),
  integrations: z.array(z.string()).optional(),
  screenshots: z.array(z.any()).optional(),
  approved: z.boolean().optional(),
  featured: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin()
    const body = await request.json()
    const validated = toolSchema.parse(body)

    const slug = slugify(validated.name)
    const existing = await prisma.tool.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { error: 'A tool with this name already exists' },
        { status: 400 }
      )
    }

    const tool = await prisma.tool.create({
      data: {
        slug,
        name: validated.name,
        tagline: validated.tagline || null,
        description: validated.description,
        category: validated.category,
        tags: validated.tags,
        website: validated.website || null,
        github: validated.github || null,
        pricing: validated.pricing || null,
        license: validated.license || null,
        integrations: validated.integrations || [],
        screenshots: validated.screenshots || [],
        approved: validated.approved ?? true,
        featured: validated.featured ?? false,
        approvedBy: user.id,
        approvedAt: new Date(),
      },
    })

    // Index in search
    try {
      await indexTool({
        id: tool.id.toString(),
        name: tool.name,
        slug: tool.slug,
        tagline: tool.tagline,
        description: tool.description,
        category: tool.category,
        tags: tool.tags,
        pricing: tool.pricing,
        license: tool.license,
        integrations: tool.integrations,
        website: tool.website,
        github: tool.github,
        approved: tool.approved,
        featured: tool.featured,
        createdAt: tool.createdAt.toISOString(),
        views: tool.views,
      })
    } catch (error) {
      console.error('Failed to index tool:', error)
    }

    return NextResponse.json({ success: true, tool }, { status: 201 })
  } catch (error: any) {
    console.error('Create tool error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create tool' },
      { status: 500 }
    )
  }
}

