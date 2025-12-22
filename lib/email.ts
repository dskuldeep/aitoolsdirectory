import { Resend } from 'resend'

// Only initialize Resend if API key is provided
const resend = process.env.EMAIL_API_KEY ? new Resend(process.env.EMAIL_API_KEY) : null

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@agitracker.io'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@agitracker.io'

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string | string[]
  subject: string
  html: string
  text?: string
}) {
  // Skip email sending if Resend is not configured
  if (!resend || !process.env.EMAIL_API_KEY) {
    console.warn('Email service not configured. Skipping email send.')
    return null
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    })

    if (error) {
      console.error('Email error:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

export async function sendSubmissionReceivedEmail(submitterEmail: string, submitterName?: string) {
  const name = submitterName || 'there'
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: system-ui, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You for Your Submission!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>We've received your tool submission and our team will review it shortly. You'll receive another email once we've reviewed your submission.</p>
            <p>If you have any questions, feel free to reach out to us.</p>
            <p>Best regards,<br>The AGI Tracker Team</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: submitterEmail,
    subject: 'Your Tool Submission Has Been Received',
    html,
    text: `Hi ${name},\n\nWe've received your tool submission and our team will review it shortly. You'll receive another email once we've reviewed your submission.\n\nBest regards,\nThe AGI Tracker Team`,
  })
}

export async function sendSubmissionApprovedEmail(
  submitterEmail: string,
  toolName: string,
  toolSlug: string,
  submitterName?: string
) {
  const name = submitterName || 'there'
  const toolUrl = `${process.env.NEXTAUTH_URL}/tools/${toolSlug}`
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: system-ui, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Tool Has Been Approved! 🎉</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Great news! Your tool <strong>${toolName}</strong> has been approved and is now live on our directory.</p>
            <p><a href="${toolUrl}" class="button">View Your Tool</a></p>
            <p>Thank you for contributing to AGI Tracker!</p>
            <p>Best regards,<br>The AGI Tracker Team</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: submitterEmail,
    subject: `Your Tool "${toolName}" Has Been Approved`,
    html,
    text: `Hi ${name},\n\nGreat news! Your tool ${toolName} has been approved and is now live on our directory.\n\nView it here: ${toolUrl}\n\nThank you for contributing!\n\nBest regards,\nThe AGI Tracker Team`,
  })
}

export async function sendSubmissionRejectedEmail(
  submitterEmail: string,
  toolName: string,
  reason: string,
  submitterName?: string
) {
  const name = submitterName || 'there'
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: system-ui, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Tool Submission Update</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>We've reviewed your submission for <strong>${toolName}</strong>, but unfortunately we're unable to approve it at this time.</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            <p>If you'd like to resubmit with changes, please feel free to do so.</p>
            <p>Best regards,<br>The AGI Tracker Team</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: submitterEmail,
    subject: `Update on Your Tool Submission: ${toolName}`,
    html,
    text: `Hi ${name},\n\nWe've reviewed your submission for ${toolName}, but unfortunately we're unable to approve it at this time.${reason ? `\n\nReason: ${reason}` : ''}\n\nIf you'd like to resubmit with changes, please feel free to do so.\n\nBest regards,\nThe AGI Tracker Team`,
  })
}

export async function sendAdminNotificationEmail(submissionId: number, toolName: string) {
  const adminUrl = `${process.env.NEXTAUTH_URL}/admin/moderation/${submissionId}`
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: system-ui, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Tool Submission</h1>
          </div>
          <div class="content">
            <p>A new tool submission requires your review:</p>
            <p><strong>${toolName}</strong></p>
            <p><a href="${adminUrl}" class="button">Review Submission</a></p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `New Tool Submission: ${toolName}`,
    html,
    text: `A new tool submission requires your review:\n\n${toolName}\n\nReview it here: ${adminUrl}`,
  })
}

