import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ApproveSubmissionButton, RejectSubmissionButton } from '@/components/admin/moderation-actions'
import { formatDate } from '@/lib/utils'

export const revalidate = 60

async function getSubmission(id: number) {
  return prisma.submission.findUnique({
    where: { id },
  })
}

export default async function SubmissionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const submission = await getSubmission(parseInt(params.id))

  if (!submission) {
    notFound()
  }

  const toolData = submission.toolData as any

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Review Submission</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Review and approve or reject this tool submission
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{toolData.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {toolData.tagline && (
                <div>
                  <h3 className="mb-2 font-semibold">Tagline</h3>
                  <p>{toolData.tagline}</p>
                </div>
              )}

              <div>
                <h3 className="mb-2 font-semibold">Description</h3>
                <p className="whitespace-pre-wrap">{toolData.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="mb-2 font-semibold">Category</h3>
                  <Badge variant="primary">{toolData.category}</Badge>
                </div>
                {toolData.pricing && (
                  <div>
                    <h3 className="mb-2 font-semibold">Pricing</h3>
                    <p>{toolData.pricing}</p>
                  </div>
                )}
              </div>

              {toolData.tags && toolData.tags.length > 0 && (
                <div>
                  <h3 className="mb-2 font-semibold">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {toolData.tags.map((tag: string) => (
                      <Badge key={tag} variant="default">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {toolData.website && (
                <div>
                  <h3 className="mb-2 font-semibold">Website</h3>
                  <a
                    href={toolData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    {toolData.website}
                  </a>
                </div>
              )}

              {toolData.github && (
                <div>
                  <h3 className="mb-2 font-semibold">GitHub</h3>
                  <a
                    href={toolData.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    {toolData.github}
                  </a>
                </div>
              )}

              {toolData.screenshots && toolData.screenshots.length > 0 && (
                <div>
                  <h3 className="mb-2 font-semibold">Screenshots</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {toolData.screenshots.map((screenshot: any, index: number) => (
                      <img
                        key={index}
                        src={screenshot.url}
                        alt={screenshot.alt || `Screenshot ${index + 1}`}
                        className="rounded-md"
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submission Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-neutral-500">
                  Status
                </h3>
                <Badge variant="warning">{submission.status}</Badge>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-neutral-500">
                  Submitter
                </h3>
                <p className="text-sm">{submission.submitterEmail}</p>
                {submission.submitterName && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {submission.submitterName}
                  </p>
                )}
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-neutral-500">
                  Submitted
                </h3>
                <p className="text-sm">{formatDate(submission.createdAt)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ApproveSubmissionButton submissionId={submission.id} />
              <RejectSubmissionButton submissionId={submission.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

