import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://agitracker.io'

  let tools: Array<{ slug: string; updatedAt: Date }> = []
  let articles: Array<{ slug: string; updatedAt: Date }> = []
  
  // Skip database queries during build/export phase
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.NEXT_PHASE === 'phase-export'
  
  if (isBuildPhase || !process.env.DATABASE_URL) {
    console.warn('Skipping database query during build phase or DATABASE_URL not available')
    tools = []
    articles = []
  } else {
    try {
      // Get all approved tools
      tools = await prisma.tool.findMany({
      where: { approved: true },
      select: { slug: true, updatedAt: true },
    })

    // Get all published articles
    articles = await prisma.article.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      })
    } catch (error) {
      console.error('Failed to fetch data for sitemap:', error)
      // Return basic sitemap if database is not available
      tools = []
      articles = []
    }
  }

  const toolEntries: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: tool.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/blog/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...toolEntries,
    ...articleEntries,
  ]
}

