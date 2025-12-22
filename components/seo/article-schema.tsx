import { Article } from '@prisma/client'

interface ArticleSchemaProps {
  article: Article & {
    author: {
      name: string | null
      image: string | null
    }
  }
}

export function ArticleSchema({ article }: ArticleSchemaProps) {
  const image = article.heroImage || `${process.env.NEXTAUTH_URL}/og-image.png`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || article.body.slice(0, 200),
    image: image,
    datePublished: article.publishedAt?.toISOString() || article.createdAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: article.author.name
      ? {
          '@type': 'Person',
          name: article.author.name,
          image: article.author.image || undefined,
        }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'AGI Tracker',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXTAUTH_URL}/logo.png`,
      },
    },
    keywords: article.tags.join(', '),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

