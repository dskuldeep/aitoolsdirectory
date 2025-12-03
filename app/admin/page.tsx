import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const revalidate = 60

async function getStats() {
  const [tools, articles, submissions, users] = await Promise.all([
    prisma.tool.count(),
    prisma.article.count(),
    prisma.submission.count({ where: { status: 'pending' } }),
    prisma.user.count(),
  ])

  const [approvedTools, publishedArticles] = await Promise.all([
    prisma.tool.count({ where: { approved: true } }),
    prisma.article.count({ where: { published: true } }),
  ])

  return {
    tools,
    approvedTools,
    articles,
    publishedArticles,
    pendingSubmissions: submissions,
    users,
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-neutral-600 dark:text-neutral-400">Welcome to the admin dashboard</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.tools}</div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {stats.approvedTools} approved
            </p>
            <Link href="/admin/tools" className="mt-4 block">
              <Button variant="outline" size="sm">
                Manage Tools
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.articles}</div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {stats.publishedArticles} published
            </p>
            <Link href="/admin/articles" className="mt-4 block">
              <Button variant="outline" size="sm">
                Manage Articles
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingSubmissions}</div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Awaiting review</p>
            <Link href="/admin/moderation" className="mt-4 block">
              <Button variant="outline" size="sm">
                Review Submissions
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.users}</div>
            <Link href="/admin/users" className="mt-4 block">
              <Button variant="outline" size="sm">
                Manage Users
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

