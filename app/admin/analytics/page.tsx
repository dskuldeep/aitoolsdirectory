import { prisma } from '@/lib/prisma'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'


export const revalidate = 60

async function getAnalytics() {
  const [totalViews, topTools, topArticles] = await Promise.all([
    prisma.tool.aggregate({
      _sum: { views: true },
    }),
    prisma.tool.findMany({
      where: { approved: true },
      orderBy: { views: 'desc' },
      take: 5,
      select: {
        name: true,
        views: true,
        slug: true,
      },
    }),
    prisma.article.findMany({
      where: { published: true },
      orderBy: { views: 'desc' },
      take: 5,
      select: {
        title: true,
        views: true,
        slug: true,
      },
    }),
  ])

  return {
    totalViews: totalViews._sum.views || 0,
    topTools,
    topArticles,
  }
}

export default async function AnalyticsPage() {
  const analytics = await getAnalytics()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-neutral-600 dark:text-neutral-400">View platform statistics</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.totalViews.toLocaleString()}</div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Across all tools</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analytics.topTools.map((tool, index) => (
                <li key={tool.slug} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                      {index + 1}
                    </span>
                    <span>{tool.name}</span>
                  </div>
                  <span className="text-sm font-medium">{tool.views.toLocaleString()} views</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analytics.topArticles.map((article, index) => (
                <li key={article.slug} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                      {index + 1}
                    </span>
                    <span className="truncate">{article.title}</span>
                  </div>
                  <span className="text-sm font-medium">{article.views.toLocaleString()} views</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

