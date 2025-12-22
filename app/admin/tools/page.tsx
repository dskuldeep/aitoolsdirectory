import { prisma } from '@/lib/prisma'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ToolsTable } from '@/components/admin/tools-table'

export const runtime = "edge"

export const revalidate = 60

async function getTools() {
  return prisma.tool.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      submitter: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })
}

export default async function AdminToolsPage() {
  const tools = await getTools()

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tools</h1>
          <p className="text-neutral-600 dark:text-neutral-400">Manage all tools</p>
        </div>
        <Link href="/admin/tools/new">
          <Button variant="primary">Add New Tool</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <ToolsTable tools={tools} />
        </CardContent>
      </Card>
    </div>
  )
}

