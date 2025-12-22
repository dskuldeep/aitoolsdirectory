import { NextRequest, NextResponse } from 'next/server'

import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendSubmissionApprovedEmail } from '@/lib/email'
import { indexTool } from '@/lib/search'
import { slugify } from '@/lib/utils'


export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin()
    const submissionId = parseInt(params.id)

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
    })

    if (!submission || submission.status !== 'pending') {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    const toolData = submission.toolData as any
    const slug = slugify(toolData.name)

    // Check if slug exists
    const existing = await prisma.tool.findUnique({ where: { slug } })
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    // Create tool
    const tool = await prisma.tool.create({
      data: {
        slug: finalSlug,
        name: toolData.name,
        tagline: toolData.tagline,
        description: toolData.description,
        category: toolData.category,
        tags: toolData.tags || [],
        website: toolData.website,
        github: toolData.github,
        pricing: toolData.pricing,
        license: toolData.license,
        integrations: toolData.integrations || [],
        icon: toolData.icon || null,
        screenshots: toolData.screenshots || [],
        approved: true,
        submittedBy: null, // Could link to user if they have an account
        approvedBy: user.id,
        approvedAt: new Date(),
      },
    })

    // Update submission
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: 'approved',
        reviewedBy: user.id,
        reviewedAt: new Date(),
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

    // Send email
    try {
      await sendSubmissionApprovedEmail(
        submission.submitterEmail,
        tool.name,
        tool.slug,
        submission.submitterName || undefined
      )
    } catch (error) {
      console.error('Failed to send email:', error)
    }

    return NextResponse.json({ success: true, tool })
  } catch (error: any) {
    console.error('Approve error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to approve submission' },
      { status: 500 }
    )
  }
}

