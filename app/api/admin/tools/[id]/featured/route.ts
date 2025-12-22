import { NextRequest, NextResponse } from 'next/server'

import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateTool } from '@/lib/search'

export const runtime = "edge"

export async function POST(
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

    const updated = await prisma.tool.update({
      where: { id: toolId },
      data: { featured: !tool.featured },
    })

    // Update in search
    try {
      await updateTool({
        id: updated.id.toString(),
        name: updated.name,
        slug: updated.slug,
        tagline: updated.tagline,
        description: updated.description,
        category: updated.category,
        tags: updated.tags,
        pricing: updated.pricing,
        license: updated.license,
        integrations: updated.integrations,
        website: updated.website,
        github: updated.github,
        approved: updated.approved,
        featured: updated.featured,
        createdAt: updated.createdAt.toISOString(),
        views: updated.views,
      })
    } catch (error) {
      console.error('Failed to update tool in search:', error)
    }

    return NextResponse.json({ success: true, tool: updated })
  } catch (error: any) {
    console.error('Toggle featured error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to toggle featured' },
      { status: 500 }
    )
  }
}

