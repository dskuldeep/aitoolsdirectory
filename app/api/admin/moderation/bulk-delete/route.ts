import { NextRequest, NextResponse } from 'next/server'

import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = "edge"

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    const { ids } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid IDs provided' }, { status: 400 })
    }

    // Convert to numbers
    const submissionIds = ids.map((id: any) => parseInt(id)).filter((id: number) => !isNaN(id))

    if (submissionIds.length === 0) {
      return NextResponse.json({ error: 'No valid submission IDs provided' }, { status: 400 })
    }

    const results = {
      deleted: 0,
      failed: 0,
      errors: [] as string[],
    }

    // Delete each submission
    for (const submissionId of submissionIds) {
      try {
        const submission = await prisma.submission.findUnique({ where: { id: submissionId } })
        
        if (!submission) {
          results.failed++
          results.errors.push(`Submission ${submissionId}: Not found`)
          continue
        }

        // Delete from database
        await prisma.submission.delete({ where: { id: submissionId } })

        results.deleted++
      } catch (error: any) {
        console.error(`Failed to delete submission ${submissionId}:`, error)
        results.failed++
        results.errors.push(`Submission ${submissionId}: ${error.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ${results.deleted} submission(s)${results.failed > 0 ? `, ${results.failed} failed` : ''}`,
      ...results,
    })
  } catch (error: any) {
    console.error('Bulk delete submissions error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete submissions' },
      { status: 500 }
    )
  }
}

