import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const revalidate = 60

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tool = await prisma.tool.findUnique({
      where: {
        id: parseInt(params.id),
      },
      include: {
        submitter: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!tool || !tool.approved) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
    }

    // Increment views
    await prisma.tool.update({
      where: { id: tool.id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json(tool)
  } catch (error: any) {
    console.error('Tool API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tool' },
      { status: 500 }
    )
  }
}

