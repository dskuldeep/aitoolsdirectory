import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Container } from '@/components/layout/container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tag } from '@/components/ui/tag'
import { Pagination } from '@/components/ui/pagination'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatDate, getCanonicalUrl } from '@/lib/utils'
import { SparklesIcon } from '@heroicons/react/24/outline'
import type { Metadata } from 'next'

// Use SSR for blog listing
export const dynamic = 'force-dynamic'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { page?: string }
}): Promise<Metadata> {
  // Canonical URL without page number for SEO
  return {
    alternates: {
      canonical: getCanonicalUrl('/blog'),
    },
  }
}

async function getArticles(searchParams: { page?: string }) {
  const page = parseInt(searchParams.page || '1')
  const limit = 12
  const skip = (page - 1) * limit

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: { published: true },
      skip,
      take: limit,
      orderBy: { publishedAt: 'desc' },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    }),
    prisma.article.count({ where: { published: true } }),
  ])

  return { articles, total, page, limit }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const { articles, total, page, limit } = await getArticles(searchParams)
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8">
        <Container>
          <div className="mb-8">
            <h1 className="mb-4 text-4xl font-bold">Blog & News</h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Latest news, tutorials, and insights about AI tools
            </p>
          </div>

          {articles.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                No articles found.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <Link key={article.id} href={`/blog/${article.slug}`} className="group">
                    <Card className="h-full overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-2xl">
                      {article.heroImage ? (
                        <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900">
                          <img
                            src={article.heroImage}
                            alt={article.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-primary-100 via-primary-50 to-primary-200 dark:from-primary-900 dark:via-primary-800 dark:to-primary-900">
                          <div className="flex h-full w-full items-center justify-center">
                            <SparklesIcon className="h-16 w-16 text-primary-400 dark:text-primary-500" />
                          </div>
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="line-clamp-2 transition-colors group-hover:text-primary-600 dark:group-hover:text-primary-400">
                          {article.title}
                        </CardTitle>
                        {article.excerpt && (
                          <p className="line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
                            {article.excerpt}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4 flex flex-wrap gap-2">
                          {article.tags.slice(0, 3).map((tag) => (
                            <Tag key={tag}>{tag}</Tag>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          {article.author.name && <span>{article.author.name}</span>}
                          {article.publishedAt && (
                            <>
                              <span>•</span>
                              <time dateTime={article.publishedAt.toISOString()}>
                                {formatDate(article.publishedAt)}
                              </time>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    baseUrl="/blog"
                    searchParams={searchParams}
                  />
                </div>
              )}
            </>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  )
}

