import { prisma } from '@/lib/prisma'
import { Article, User } from '@prisma/client'

type ArticleWithAuthor = Article & {
  author: {
    name: string | null
    email: string
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://agitracker.io'

  let articles: ArticleWithAuthor[] = []
  
  // Skip database queries during build/export phase
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.NEXT_PHASE === 'phase-export'
  
  if (isBuildPhase || !process.env.DATABASE_URL) {
    console.warn('Skipping database query during build phase or DATABASE_URL not available')
    articles = []
  } else {
    try {
      articles = await prisma.article.findMany({
    where: { published: true },
    take: 20,
    orderBy: { publishedAt: 'desc' },
    include: {
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
      })
    } catch (error) {
      console.error('Failed to fetch articles for feed:', error)
      // Return empty feed if database is not available
      articles = []
    }
  }

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AGI Tracker Blog</title>
    <description>Latest news and articles about AI tools</description>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${articles
      .map(
        (article) => `
    <item>
      <title>${escapeXml(article.title)}</title>
      <description>${escapeXml(article.excerpt || article.body.slice(0, 200))}</description>
      <link>${baseUrl}/blog/${article.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${article.slug}</guid>
      <pubDate>${(article.publishedAt || article.createdAt).toUTCString()}</pubDate>
      ${article.author.name ? `<author>${escapeXml(article.author.email)} (${escapeXml(article.author.name)})</author>` : ''}
      ${article.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join('')}
    </item>`
      )
      .join('')}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}

function escapeXml(unsafe: string) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

