import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Container } from '@/components/layout/container'
import { Tag } from '@/components/ui/tag'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import readingTime from 'reading-time'
import sanitizeHtml from 'sanitize-html'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'

// Use SSR for blog articles
export const dynamic = 'force-dynamic'

async function getArticle(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  })

  if (!article || !article.published) {
    return null
  }

  // Increment views
  await prisma.article.update({
    where: { id: article.id },
    data: { views: { increment: 1 } },
  })

  return article
}

async function getRelatedArticles(articleId: number, tags: string[]) {
  return prisma.article.findMany({
    where: {
      id: { not: articleId },
      published: true,
      tags: { hasSome: tags },
    },
    take: 3,
    orderBy: { publishedAt: 'desc' },
  })
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!article || !article.published) {
    return {}
  }

  const description = article.excerpt || article.body.slice(0, 160)
  const image = article.heroImage || `${process.env.NEXTAUTH_URL}/og-image.png`
  const baseUrl = process.env.NEXTAUTH_URL || 'https://agitracker.io'
  const canonicalUrl = `${baseUrl}/blog/${params.slug}`

  return {
    title: article.title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: article.title,
      description,
      images: [image],
      type: 'article',
      url: canonicalUrl,
      publishedTime: article.publishedAt?.toISOString(),
      authors: article.author.name ? [article.author.name] : [],
      tags: article.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: [image],
    },
  }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug)

  if (!article) {
    notFound()
  }

  const relatedArticles = await getRelatedArticles(article.id, article.tags)
  const readTime = readingTime(article.body)

  const baseUrl = process.env.NEXTAUTH_URL || 'https://agitracker.io'
  const schemaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || article.body.slice(0, 200),
    image: article.heroImage || `${baseUrl}/og-image.png`,
    datePublished: article.publishedAt?.toISOString() || article.createdAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    publisher: {
      '@type': 'Organization',
      name: 'AGI Tracker',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    keywords: article.tags.join(', '),
    ...(article.author.name && {
      author: {
        '@type': 'Person',
        name: article.author.name,
        ...(article.author.image && { image: article.author.image }),
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
          <Container size="md">
            <article>
              {/* Hero Image */}
              {article.heroImage && (
                <div className="mb-10 overflow-hidden rounded-2xl border border-neutral-200 shadow-xl dark:border-neutral-700">
                  <div className="aspect-video w-full overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900">
                    <img
                      src={article.heroImage}
                      alt={article.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Header */}
              <header className="mb-8">
                <h1 className="mb-4 text-4xl font-bold">{article.title}</h1>
                {article.excerpt && (
                  <p className="mb-6 text-xl text-neutral-600 dark:text-neutral-400">
                    {article.excerpt}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                  {article.author.name && (
                    <div className="flex items-center gap-2">
                      {article.author.image && (
                        <img
                          src={article.author.image}
                          alt={article.author.name}
                          className="h-8 w-8 rounded-full"
                        />
                      )}
                      <span>{article.author.name}</span>
                    </div>
                  )}
                  {article.publishedAt && (
                    <>
                      <span>•</span>
                      <time dateTime={article.publishedAt.toISOString()}>
                        {formatDate(article.publishedAt)}
                      </time>
                    </>
                  )}
                  <span>•</span>
                  <span>{readTime.text}</span>
                </div>

                {article.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                )}
              </header>

              {/* Content */}
              {(() => {
                // Detect if content is HTML (starts with <) or markdown
                const isHTML = article.body.trim().startsWith('<') && 
                              (article.body.includes('<p>') || 
                               article.body.includes('<div>') || 
                               article.body.includes('<h1>') ||
                               article.body.includes('<img'))
                
                if (isHTML) {
                  // HTML content from TipTap
                  return (
                    <div 
                      className="prose prose-lg prose-neutral dark:prose-invert max-w-none article-content"
                      dangerouslySetInnerHTML={{ 
                        __html: sanitizeHtml(article.body, {
                          allowedTags: ['p', 'br', 'strong', 'em', 'u', 'b', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img', 'hr', 'div', 'span'],
                          allowedAttributes: {
                            'a': ['href', 'title', 'target', 'rel'],
                            'img': ['src', 'alt', 'title', 'width', 'height', 'class', 'style'],
                            '*': ['class'],
                          },
                          allowedSchemes: ['http', 'https', 'data'],
                          allowedSchemesByTag: {
                            img: ['http', 'https', 'data'],
                          },
                        })
                      }}
                    />
                  )
                } else {
                  // Markdown content (legacy)
                  return (
                    <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none article-content">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]} 
                        rehypePlugins={[rehypeSanitize]}
                        components={{
                          img: ({ node: _node, ...props }) => (
                            <img {...props} alt="" className="max-w-full rounded-lg my-4 shadow-md" />
                          ),
                        }}
                      >
                        {article.body}
                      </ReactMarkdown>
                    </div>
                  )
                }
              })()}

              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <div className="mt-12 border-t border-neutral-200 pt-8 dark:border-neutral-800">
                  <h2 className="mb-6 text-2xl font-semibold">Related Articles</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {relatedArticles.map((related) => (
                      <a
                        key={related.id}
                        href={`/blog/${related.slug}`}
                        className="rounded-card border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-800"
                      >
                        <h3 className="font-semibold">{related.title}</h3>
                        {related.excerpt && (
                          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                            {related.excerpt}
                          </p>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </article>
          </Container>
        </main>
        <Footer />
      </div>
    </>
  )
}

