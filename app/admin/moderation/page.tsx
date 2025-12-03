import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export const revalidate = 60

async function getSubmissions() {
  return prisma.submission.findMany({
    where: { status: 'pending' },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function ModerationPage() {
  const submissions = await getSubmissions()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Moderation Queue</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Review and approve tool submissions
        </p>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-neutral-600 dark:text-neutral-400">
              No pending submissions. Great job!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => {
            const toolData = submission.toolData as any
            return (
              <Card key={submission.id}>
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{toolData.name}</h3>
                      {toolData.tagline && (
                        <p className="text-neutral-600 dark:text-neutral-400">
                          {toolData.tagline}
                        </p>
                      )}
                    </div>
                    <Badge variant="warning">Pending</Badge>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Category:</span> {toolData.category}
                    </div>
                    <div>
                      <span className="font-medium">Submitter:</span> {submission.submitterEmail}
                    </div>
                    <div>
                      <span className="font-medium">Submitted:</span>{' '}
                      {formatDate(submission.createdAt)}
                    </div>
                    {toolData.website && (
                      <div>
                        <span className="font-medium">Website:</span>{' '}
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
                  </div>

                  {toolData.description && (
                    <div className="mb-4">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {toolData.description.slice(0, 200)}...
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link href={`/admin/moderation/${submission.id}`}>
                      <Button variant="primary">Review</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

