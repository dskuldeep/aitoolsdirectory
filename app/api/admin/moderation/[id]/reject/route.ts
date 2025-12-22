import { NextRequest, NextResponse } from 'next/server'

import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendSubmissionRejectedEmail } from '@/lib/email'

export const runtime = "edge"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin()
    const submissionId = parseInt(params.id)
    const body = await request.json()
    const { reason } = body

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
    })

    if (!submission || submission.status !== 'pending') {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    const toolData = submission.toolData as any

    // Update submission
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: 'rejected',
        reviewedBy: user.id,
        reviewedAt: new Date(),
        rejectionReason: reason || 'No reason provided',
      },
    })

    // Send email
    try {
      await sendSubmissionRejectedEmail(
        submission.submitterEmail,
        toolData.name,
        reason || 'No reason provided',
        submission.submitterName || undefined
      )
    } catch (error) {
      console.error('Failed to send email:', error)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Reject error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to reject submission' },
      { status: 500 }
    )
  }
}

