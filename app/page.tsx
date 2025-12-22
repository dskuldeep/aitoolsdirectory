import Link from 'next/link'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolCard } from '@/components/tools/tool-card'
import { prisma } from '@/lib/prisma'
import { formatDate, getCanonicalUrl } from '@/lib/utils'
import { SparklesIcon, RocketLaunchIcon } from '@heroicons/react/24/outline'
import type { Metadata } from 'next'


// Use SSR for homepage
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  alternates: {
    canonical: getCanonicalUrl('/'),
  },
}

async function getFeaturedTools() {
  return prisma.tool.findMany({
    where: { approved: true, featured: true },
    take: 6,
    orderBy: { createdAt: 'desc' },
  })
}

async function getLatestArticles() {
  return prisma.article.findMany({
    where: { published: true },
    take: 3,
    orderBy: { publishedAt: 'desc' },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
  })
}

async function getCategories() {
  const tools = await prisma.tool.findMany({
    where: { approved: true },
    select: { category: true },
  })

  const categoryCounts = tools.reduce((acc, tool) => {
    acc[tool.category] = (acc[tool.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
}

export default async function HomePage() {
  const [featuredTools, latestArticles, categories] = await Promise.all([
    getFeaturedTools(),
    getLatestArticles(),
    getCategories(),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-neutral-200 py-32 dark:border-neutral-800">
          {/* Background images */}
          <div className="absolute inset-0 z-0">
            <img
              src="/hero-bg-light-c.png"
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-70 dark:hidden"
            />
            <img
              src="/hero-bg-dark.png"
              alt=""
              className="absolute inset-0 hidden h-full w-full object-cover opacity-80 dark:block"
            />
            {/* Subtle gradient overlay to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/60 dark:from-neutral-900/50 dark:via-transparent dark:to-neutral-900/70" />
          </div>
          
          <Container className="relative z-10">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-gradient-to-r from-primary-500 to-primary-600 p-4 shadow-lg">
                  <SparklesIcon className="h-12 w-12 text-white" />
                </div>
              </div>
              <h1 className="mb-6 bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-6xl font-bold tracking-tight text-transparent dark:from-neutral-100 dark:to-neutral-300">
                Discover the Best AI Tools
              </h1>
              <p className="mb-10 text-xl text-neutral-600 dark:text-neutral-400">
                Explore a curated directory of AI tools for productivity, development, design, and
                more. Find the perfect tool for your needs.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/tools">
                  <Button size="lg" className="group">
                    <RocketLaunchIcon className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    Browse Tools
                  </Button>
                </Link>
                <Link href="/submit">
                  <Button variant="outline" size="lg">
                    Submit Your Tool
                  </Button>
                </Link>
              </div>
            </div>
          </Container>
        </section>

        {/* Featured Tools */}
        {featuredTools.length > 0 && (
          <section className="py-16">
            <Container>
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-3xl font-bold">Featured Tools</h2>
                <Link href="/tools">
                  <Button variant="outline">View All</Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featuredTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} showFeatured={true} />
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <section className="bg-gradient-to-b from-neutral-50 to-white py-16 dark:from-neutral-900 dark:to-neutral-800">
            <Container>
              <h2 className="mb-8 text-3xl font-bold">Browse by Category</h2>
              <div className="grid grid-cols-2 gap-5 md:grid-cols-5">
                {categories.map(({ category, count }) => (
                  <Link
                    key={category}
                    href={`/tools?category=${encodeURIComponent(category)}`}
                    className="group rounded-card bg-white p-6 text-center transition-all hover:scale-105 hover:shadow-lg dark:bg-neutral-800"
                  >
                    <div className="mb-2 flex justify-center">
                      <div className="rounded-full bg-gradient-to-br from-primary-100 to-primary-200 p-3 transition-transform group-hover:scale-110 dark:from-primary-900 dark:to-primary-800">
                        <SparklesIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                      </div>
                    </div>
                    <h3 className="font-semibold transition-colors group-hover:text-primary-600 dark:group-hover:text-primary-400">
                      {category}
                    </h3>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                      {count} {count === 1 ? 'tool' : 'tools'}
                    </p>
                  </Link>
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* Latest News */}
        {latestArticles.length > 0 && (
          <section className="py-16">
            <Container>
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-3xl font-bold">Latest News</h2>
                <Link href="/blog">
                  <Button variant="outline">View All</Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {latestArticles.map((article) => (
                  <Link key={article.id} href={`/blog/${article.slug}`} className="group">
                    <Card className="h-full overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-2xl">
                      {article.heroImage && (
                        <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900">
                          <img
                            src={article.heroImage}
                            alt={article.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
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
            </Container>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}

