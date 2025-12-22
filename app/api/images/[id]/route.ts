import { NextRequest, NextResponse } from 'next/server'
export const runtime = "edge"

import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const image = await prisma.image.findUnique({
      where: { id: params.id },
    })

    if (!image) {
      return new NextResponse('Image not found', { status: 404 })
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(image.data, 'base64')

    // Return image with proper content type
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': image.contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Image retrieval error:', error)
    return new NextResponse('Error retrieving image', { status: 500 })
  }
}

