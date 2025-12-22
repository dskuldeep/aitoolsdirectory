import { NextRequest, NextResponse } from 'next/server'

import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const toolId = parseInt(params.id)

    const tool = await prisma.tool.findUnique({
      where: { id: toolId },
      include: {
        submitter: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
    }

    return NextResponse.json(tool)
  } catch (error: any) {
    console.error('Get tool error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tool' },
      { status: 500 }
    )
  }
}

