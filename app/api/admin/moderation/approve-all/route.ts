import { NextRequest, NextResponse } from 'next/server'
export const runtime = "edge"

import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendSubmissionApprovedEmail } from '@/lib/email'
import { indexTool } from '@/lib/search'
import { slugify } from '@/lib/utils'

export async function POST(_request: NextRequest) {
  try {
    const user = await requireAdmin()

    // Get all pending submissions
    const pendingSubmissions = await prisma.submission.findMany({
      where: { status: 'pending' },
    })

    if (pendingSubmissions.length === 0) {
      return NextResponse.json(
        { success: true, message: 'No pending submissions to approve', approved: 0, failed: 0 },
        { status: 200 }
      )
    }

    const results = {
      approved: 0,
      failed: 0,
      errors: [] as string[],
    }

    // Process each submission
    for (const submission of pendingSubmissions) {
      try {
        const toolData = submission.toolData as any
        const slug = slugify(toolData.name)

        // Check if slug exists
        const existing = await prisma.tool.findUnique({ where: { slug } })
        const finalSlug = existing ? `${slug}-${Date.now()}-${submission.id}` : slug

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
            submittedBy: null,
            approvedBy: user.id,
            approvedAt: new Date(),
          },
        })

        // Update submission
        await prisma.submission.update({
          where: { id: submission.id },
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
          console.error(`Failed to index tool ${tool.id}:`, error)
          // Don't fail the approval if indexing fails
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
          console.error(`Failed to send email for submission ${submission.id}:`, error)
          // Don't fail the approval if email fails
        }

        results.approved++
      } catch (error: any) {
        console.error(`Failed to approve submission ${submission.id}:`, error)
        results.failed++
        results.errors.push(`Submission ${submission.id} (${(submission.toolData as any).name}): ${error.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Approved ${results.approved} submission(s)${results.failed > 0 ? `, ${results.failed} failed` : ''}`,
      ...results,
    })
  } catch (error: any) {
    console.error('Bulk approve error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to approve submissions' },
      { status: 500 }
    )
  }
}

