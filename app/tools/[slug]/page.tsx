import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Container } from '@/components/layout/container'
import { Tag } from '@/components/ui/tag'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import { IconButton } from '@/components/ui/icon-button'
import { ToolLogo } from '@/components/tools/tool-logo'

// Use SSR for tool pages
export const dynamic = 'force-dynamic'

async function getTool(slug: string) {
  const tool = await prisma.tool.findUnique({
    where: { slug },
    include: {
      submitter: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!tool || !tool.approved) {
    return null
  }

  // Increment views
  await prisma.tool.update({
    where: { id: tool.id },
    data: { views: { increment: 1 } },
  })

  return tool
}

async function getRelatedTools(toolId: number, category: string, tags: string[]) {
  return prisma.tool.findMany({
    where: {
      id: { not: toolId },
      approved: true,
      OR: [
        { category },
        { tags: { hasSome: tags } },
      ],
    },
    take: 4,
    orderBy: { views: 'desc' },
  })
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const tool = await prisma.tool.findUnique({
    where: { slug: params.slug },
  })

  if (!tool || !tool.approved) {
    return {}
  }

  const description = tool.tagline || tool.description.slice(0, 160)
  const screenshots = tool.screenshots as any
  const image = screenshots?.[0]?.url || `${process.env.NEXTAUTH_URL}/og-image.png`

  return {
    title: tool.name,
    description,
    openGraph: {
      title: tool.name,
      description,
      images: [image],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.name,
      description,
      images: [image],
    },
  }
}

export default async function ToolPage({ params }: { params: { slug: string } }) {
  const tool = await getTool(params.slug)

  if (!tool) {
    notFound()
  }

  const relatedTools = await getRelatedTools(tool.id, tool.category, tool.tags)
  const screenshots = tool.screenshots as any

  const schemaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.tagline || tool.description.slice(0, 200),
    applicationCategory: tool.category,
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: tool.pricing || 'Free',
      priceCurrency: 'USD',
    },
    image: (tool.screenshots as any)?.[0]?.url || `${process.env.NEXTAUTH_URL || 'https://example.com'}/og-image.png`,
    url: tool.website || `${process.env.NEXTAUTH_URL || 'https://example.com'}/tools/${tool.slug}`,
    datePublished: tool.createdAt.toISOString(),
    keywords: tool.tags.join(', '),
    ...(tool.views > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.5',
        ratingCount: Math.floor(tool.views / 10),
      },
    }),
    ...(tool.submitter?.name && {
      author: {
        '@type': 'Person',
        name: tool.submitter.name,
      },
    }),
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: schemaJson }}
      />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-8">
          <Container size="lg">
            <div className="mb-8">
              <nav className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
                <a href="/" className="hover:text-primary-600">
                  Home
                </a>
                {' / '}
                <a href="/tools" className="hover:text-primary-600">
                  Tools
                </a>
                {' / '}
                <span className="text-neutral-900 dark:text-neutral-100">{tool.name}</span>
              </nav>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="mb-8">
                  <div className="mb-4 flex items-start gap-4">
                    {/* Tool Logo */}
                    {tool.website && (
                      <div className="relative flex-shrink-0">
                        <ToolLogo website={tool.website} name={tool.name} size="lg" className="ring-4 ring-neutral-100 dark:ring-neutral-700 rounded-2xl" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h1 className="mb-2 text-4xl font-bold">{tool.name}</h1>
                      {tool.tagline && (
                        <p className="text-xl text-neutral-600 dark:text-neutral-400">{tool.tagline}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Screenshots */}
                {screenshots && screenshots.length > 0 && (
                  <div className="mb-8">
                    <h2 className="mb-4 text-2xl font-semibold">Screenshots</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {screenshots.map((screenshot: any, index: number) => (
                        <div
                          key={index}
                          className="group relative overflow-hidden rounded-card border border-neutral-200 shadow-md transition-transform hover:scale-[1.02] hover:shadow-xl dark:border-neutral-700"
                        >
                          <div className="aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                            <img
                              src={screenshot.url}
                              alt={screenshot.alt || `${tool.name} screenshot ${index + 1}`}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="mb-8 rounded-card bg-white p-6 dark:bg-neutral-800">
                  <h2 className="mb-4 text-2xl font-semibold">About</h2>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                      {tool.description}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Related Tools */}
                {relatedTools.length > 0 && (
                  <div>
                    <h2 className="mb-4 text-2xl font-semibold">Related Tools</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {relatedTools.map((related) => (
                        <a
                          key={related.id}
                          href={`/tools/${related.slug}`}
                          className="rounded-card border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-800"
                        >
                          <h3 className="font-semibold">{related.name}</h3>
                          {related.tagline && (
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                              {related.tagline}
                            </p>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  {/* Meta Panel */}
                  <div className="rounded-card border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-800">
                    <div className="space-y-4">
                      <div>
                        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-neutral-500">
                          Category
                        </h3>
                        <Badge variant="primary">{tool.category}</Badge>
                      </div>

                      {tool.tags.length > 0 && (
                        <div>
                          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-neutral-500">
                            Tags
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {tool.tags.map((tag) => (
                              <Tag key={tag}>{tag}</Tag>
                            ))}
                          </div>
                        </div>
                      )}

                      {tool.pricing && (
                        <div>
                          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-neutral-500">
                            Pricing
                          </h3>
                          <p>{tool.pricing}</p>
                        </div>
                      )}

                      {tool.license && (
                        <div>
                          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-neutral-500">
                            License
                          </h3>
                          <p>{tool.license}</p>
                        </div>
                      )}

                      {tool.integrations.length > 0 && (
                        <div>
                          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-neutral-500">
                            Integrations
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {tool.integrations.map((integration) => (
                              <Badge key={integration} variant="default">
                                {integration}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-neutral-500">
                          Listed
                        </h3>
                        <p className="text-sm">{formatDate(tool.createdAt)}</p>
                      </div>

                      {tool.submitter && (
                        <div>
                          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-neutral-500">
                            Contributor
                          </h3>
                          <p className="text-sm">{tool.submitter.name}</p>
                        </div>
                      )}

                      <div className="pt-4">
                        {tool.website && (
                          <IconButton href={tool.website} variant="primary">
                            Visit Website
                          </IconButton>
                        )}
                        {tool.github && (
                          <IconButton href={tool.github} variant="outline" className="mt-2 block">
                            View on GitHub
                          </IconButton>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    </>
  )
}

