import { NextRequest, NextResponse } from 'next/server'

import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteTool as removeToolFromSearch } from '@/lib/search'


export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    const { ids } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid IDs provided' }, { status: 400 })
    }

    // Convert to numbers
    const toolIds = ids.map((id: any) => parseInt(id)).filter((id: number) => !isNaN(id))

    if (toolIds.length === 0) {
      return NextResponse.json({ error: 'No valid tool IDs provided' }, { status: 400 })
    }

    const results = {
      deleted: 0,
      failed: 0,
      errors: [] as string[],
    }

    // Delete each tool
    for (const toolId of toolIds) {
      try {
        const tool = await prisma.tool.findUnique({ where: { id: toolId } })
        
        if (!tool) {
          results.failed++
          results.errors.push(`Tool ${toolId}: Not found`)
          continue
        }

        // Delete from database
        await prisma.tool.delete({ where: { id: toolId } })

        // Remove from search index
        try {
          await removeToolFromSearch(toolId.toString())
        } catch (error) {
          console.error(`Failed to remove tool ${toolId} from search:`, error)
          // Don't fail the deletion if search removal fails
        }

        results.deleted++
      } catch (error: any) {
        console.error(`Failed to delete tool ${toolId}:`, error)
        results.failed++
        results.errors.push(`Tool ${toolId}: ${error.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ${results.deleted} tool(s)${results.failed > 0 ? `, ${results.failed} failed` : ''}`,
      ...results,
    })
  } catch (error: any) {
    console.error('Bulk delete tools error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete tools' },
      { status: 500 }
    )
  }
}

