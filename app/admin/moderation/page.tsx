import { prisma } from '@/lib/prisma'

import { Card, CardContent } from '@/components/ui/card'
import { BulkApproveButton } from '@/components/admin/bulk-approve-button'
import { SubmissionsTable } from '@/components/admin/submissions-table'

export const runtime = "edge"

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
        <>
          <BulkApproveButton submissionCount={submissions.length} />
          <SubmissionsTable submissions={submissions} />
        </>
      )}
    </div>
  )
}

