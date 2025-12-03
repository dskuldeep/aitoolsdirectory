import { Tool } from '@prisma/client'

interface SoftwareApplicationSchemaProps {
  tool: Tool & {
    submitter?: {
      name: string | null
    } | null
  }
}

export function SoftwareApplicationSchema({ tool }: SoftwareApplicationSchemaProps) {
  const screenshots = tool.screenshots as any
  const baseUrl = process.env.NEXTAUTH_URL || 'https://example.com'
  const image = screenshots?.[0]?.url || `${baseUrl}/og-image.png`

  const schema: any = {
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
    image: image,
    url: tool.website || `${baseUrl}/tools/${tool.slug}`,
    datePublished: tool.createdAt.toISOString(),
    keywords: tool.tags.join(', '),
  }

  if (tool.views > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      ratingCount: Math.floor(tool.views / 10),
    }
  }

  if (tool.submitter?.name) {
    schema.author = {
      '@type': 'Person',
      name: tool.submitter.name,
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 0) }}
    />
  )
}

