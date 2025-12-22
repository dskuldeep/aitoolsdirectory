import { NextRequest, NextResponse } from 'next/server'
export const runtime = "edge"

import { prisma } from '@/lib/prisma'
import { submissionSchema } from '@/lib/validation'
import { sendSubmissionReceivedEmail, sendAdminNotificationEmail } from '@/lib/email'
import { slugify } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Honeypot check
    if (body.honeypot) {
      return NextResponse.json({ error: 'Spam detected' }, { status: 400 })
    }

    // Validate input
    const validated = submissionSchema.parse(body)

    // CAPTCHA verification (if provided)
    if (validated.recaptchaToken && process.env.RECAPTCHA_SECRET_KEY) {
      const captchaResponse = await fetch(
        `https://www.google.com/recaptcha/api/siteverify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            secret: process.env.RECAPTCHA_SECRET_KEY,
            response: validated.recaptchaToken,
          }),
        }
      )

      const captchaData = await captchaResponse.json()
      if (!captchaData.success) {
        return NextResponse.json({ error: 'CAPTCHA verification failed' }, { status: 400 })
      }
    }

    // Generate slug if not provided
    const slug = validated.toolData.slug || slugify(validated.toolData.name)

    // Check if slug already exists
    const existingTool = await prisma.tool.findUnique({
      where: { slug },
    })

    if (existingTool) {
      return NextResponse.json(
        { error: 'A tool with this name already exists' },
        { status: 400 }
      )
    }

    // Extract image IDs from body (not in validation schema, but needed for storage)
    const iconImageId = body.iconImageId as string | undefined
    const screenshotImageIds = (body.screenshotImageIds as string[] | undefined) || []

    // Verify that image IDs exist in database (if provided)
    if (iconImageId) {
      const iconImage = await prisma.image.findUnique({
        where: { id: iconImageId },
      })
      if (!iconImage) {
        return NextResponse.json({ error: 'Invalid icon image ID' }, { status: 400 })
      }
    }

    if (screenshotImageIds.length > 0) {
      const screenshotImages = await prisma.image.findMany({
        where: { id: { in: screenshotImageIds } },
      })
      if (screenshotImages.length !== screenshotImageIds.length) {
        return NextResponse.json({ error: 'Invalid screenshot image ID(s)' }, { status: 400 })
      }
    }

    // Build screenshots array from uploaded image IDs
    const screenshotsFromUploads = screenshotImageIds.map((imageId: string) => ({
      url: `/api/images/${imageId}`,
      alt: '',
      imageId,
    }))

    // Get existing screenshots from toolData (URL-based screenshots)
    const existingScreenshots = (validated.toolData.screenshots || []).map((screenshot: any) => ({
      ...screenshot,
      // Keep existing imageId if present, otherwise undefined
      imageId: screenshot.imageId || undefined,
    }))

    // Combine: first uploaded screenshots (from image IDs), then URL-based screenshots
    const allScreenshots = [...screenshotsFromUploads, ...existingScreenshots]

    // Set icon URL if iconImageId is provided but icon URL is not
    let iconUrl = validated.toolData.icon
    if (iconImageId && !iconUrl) {
      iconUrl = `/api/images/${iconImageId}`
    }

    // Prepare toolData with image references
    const toolDataWithImages = {
      ...validated.toolData,
      icon: iconUrl || undefined,
      iconImageId: iconImageId || undefined,
      screenshots: allScreenshots.length > 0 ? allScreenshots : undefined,
      screenshotImageIds: screenshotImageIds.length > 0 ? screenshotImageIds : undefined,
    }

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        toolData: toolDataWithImages as any,
        submitterEmail: validated.submitterEmail,
        submitterName: validated.submitterName,
        status: 'pending',
      },
    })

    // Send emails
    try {
      await sendSubmissionReceivedEmail(
        validated.submitterEmail,
        validated.submitterName
      )
      await sendAdminNotificationEmail(submission.id, validated.toolData.name)
    } catch (emailError) {
      console.error('Failed to send emails:', emailError)
      // Don't fail the submission if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Submission received! We\'ll review it shortly.',
        submissionId: submission.id,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Submission error:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to submit tool' },
      { status: 500 }
    )
  }
}

