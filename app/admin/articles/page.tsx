import { prisma } from '@/lib/prisma'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { ArticleActions } from '@/components/admin/article-actions'

export const runtime = "edge"

export const revalidate = 60

async function getArticles() {
  return prisma.article.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })
}

export default async function AdminArticlesPage() {
  const articles = await getArticles()

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Articles</h1>
          <p className="text-neutral-600 dark:text-neutral-400">Manage all articles</p>
        </div>
        <Link href="/admin/articles/new">
          <Button variant="primary">Add New Article</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Author
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
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                    <td className="px-6 py-4">
                      <div className="font-medium">{article.title}</div>
                      {article.excerpt && (
                        <div className="text-sm text-neutral-500">{article.excerpt.slice(0, 100)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">{article.author.name || article.author.email}</td>
                    <td className="px-6 py-4">
                      {article.published ? (
                        <Badge variant="success">Published</Badge>
                      ) : (
                        <Badge variant="warning">Draft</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">{article.views}</td>
                    <td className="px-6 py-4 text-sm text-neutral-500">
                      {formatDate(article.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {article.published && (
                          <Link href={`/blog/${article.slug}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        )}
                        <Link href={`/admin/articles/${article.id}/edit`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <ArticleActions article={article} />
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

