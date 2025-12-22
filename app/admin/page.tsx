import { prisma } from '@/lib/prisma'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const runtime = "edge"

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getStats() {
  try {
    const [tools, articles, submissions, users] = await Promise.all([
      prisma.tool.count().catch(() => 0),
      prisma.article.count().catch(() => 0),
      prisma.submission.count({ where: { status: 'pending' } }).catch(() => 0),
      prisma.user.count().catch(() => 0),
    ])

    const [approvedTools, publishedArticles] = await Promise.all([
      prisma.tool.count({ where: { approved: true } }).catch(() => 0),
      prisma.article.count({ where: { published: true } }).catch(() => 0),
    ])

    return {
      tools,
      approvedTools,
      articles,
      publishedArticles,
      pendingSubmissions: submissions,
      users,
    }
  } catch (error) {
    console.error('[getStats] Error:', error)
    // Return default stats on error
    return {
      tools: 0,
      approvedTools: 0,
      articles: 0,
      publishedArticles: 0,
      pendingSubmissions: 0,
      users: 0,
    }
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

