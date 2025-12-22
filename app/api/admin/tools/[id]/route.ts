import { NextRequest, NextResponse } from 'next/server'

import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import { z } from 'zod'
import { updateTool, deleteTool as removeToolFromSearch } from '@/lib/search'

export const runtime = "edge"

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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const toolId = parseInt(params.id)
    const body = await request.json()
    const validated = toolSchema.parse(body)

    const existing = await prisma.tool.findUnique({ where: { id: toolId } })
    if (!existing) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
    }

    // Check slug uniqueness if name changed
    let slug = existing.slug
    if (validated.name !== existing.name) {
      slug = slugify(validated.name)
      const slugExists = await prisma.tool.findUnique({ where: { slug } })
      if (slugExists && slugExists.id !== toolId) {
        return NextResponse.json(
          { error: 'A tool with this name already exists' },
          { status: 400 }
        )
      }
    }

    const tool = await prisma.tool.update({
      where: { id: toolId },
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
        approved: validated.approved ?? existing.approved,
        featured: validated.featured ?? existing.featured,
      },
    })

    // Update in search
    try {
      await updateTool({
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
      console.error('Failed to update tool in search:', error)
    }

    return NextResponse.json({ success: true, tool })
  } catch (error: any) {
    console.error('Update tool error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update tool' },
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
    const toolId = parseInt(params.id)

    const tool = await prisma.tool.findUnique({ where: { id: toolId } })
    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
    }

    await prisma.tool.delete({ where: { id: toolId } })

    // Remove from search
    try {
      await removeToolFromSearch(toolId.toString())
    } catch (error) {
      console.error('Failed to remove tool from search:', error)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete tool error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete tool' },
      { status: 500 }
    )
  }
}

