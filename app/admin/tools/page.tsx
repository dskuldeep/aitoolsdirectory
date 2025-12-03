import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { ToolActions } from '@/components/admin/tool-actions'

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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {tools.map((tool) => (
                  <tr key={tool.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                    <td className="px-6 py-4">
                      <div className="font-medium">{tool.name}</div>
                      {tool.tagline && (
                        <div className="text-sm text-neutral-500">{tool.tagline}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="primary">{tool.category}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {tool.approved ? (
                          <Badge variant="success">Approved</Badge>
                        ) : (
                          <Badge variant="warning">Pending</Badge>
                        )}
                        {tool.featured && <Badge variant="primary">Featured</Badge>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{tool.views}</td>
                    <td className="px-6 py-4 text-sm text-neutral-500">
                      {formatDate(tool.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/tools/${tool.slug}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                        <Link href={`/admin/tools/${tool.id}/edit`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <ToolActions tool={tool} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

