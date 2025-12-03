'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tag } from '@/components/ui/tag'
import { Badge } from '@/components/ui/badge'
import { getLogoUrlSync } from '@/lib/logos'
import { SparklesIcon, StarIcon } from '@heroicons/react/24/solid'

interface ToolCardProps {
  tool: {
    id: number
    slug: string
    name: string
    tagline: string | null
    category: string
    tags: string[]
    pricing: string | null
    website: string | null
    featured?: boolean
    views?: number
  }
  showFeatured?: boolean
}

export function ToolCard({ tool, showFeatured = false }: ToolCardProps) {
  const logoUrl = getLogoUrlSync(tool.website)

  return (
    <Link href={`/tools/${tool.slug}`} className="group">
      <Card className="relative h-full overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-2xl">
        {/* Featured Badge */}
        {tool.featured && showFeatured && (
          <div className="absolute right-3 top-3 z-10">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
              <StarIcon className="mr-1 h-3 w-3" />
              Featured
            </Badge>
          </div>
        )}

        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="relative flex-shrink-0">
              <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-white ring-2 ring-neutral-200 transition-all group-hover:ring-primary-400 dark:bg-neutral-800 dark:ring-neutral-700">
                {logoUrl && logoUrl !== '/placeholder-logo.svg' ? (
                  <Image
                    src={logoUrl}
                    alt={`${tool.name} logo`}
                    fill
                    className="object-contain p-2 dark:brightness-110 dark:contrast-110"
                    sizes="64px"
                    unoptimized
                    onError={(e) => {
                      // Fallback to Google Favicon if Clearbit fails
                      const target = e.target as HTMLImageElement
                      if (tool.website) {
                        try {
                          const domain = new URL(tool.website).hostname.replace('www.', '')
                          target.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
                        } catch {
                          target.src = '/placeholder-logo.svg'
                        }
                      } else {
                        target.src = '/placeholder-logo.svg'
                      }
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800">
                    <SparklesIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Title and Tagline */}
            <div className="flex-1 min-w-0">
              <h3 className="mb-1 line-clamp-2 text-lg font-bold text-neutral-900 transition-colors group-hover:text-primary-600 dark:text-neutral-100 dark:group-hover:text-primary-400">
                {tool.name}
              </h3>
              {tool.tagline && (
                <p className="line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {tool.tagline}
                </p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Category and Tags */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge
              variant="primary"
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white"
            >
              {tool.category}
            </Badge>
            {tool.tags.slice(0, 2).map((tag) => (
              <Tag key={tag} variant="default" className="text-xs">
                {tag}
              </Tag>
            ))}
            {tool.tags.length > 2 && (
              <span className="text-xs text-neutral-500">+{tool.tags.length - 2}</span>
            )}
          </div>

          {/* Pricing and Stats */}
          <div className="flex items-center justify-between border-t border-neutral-200 pt-3 dark:border-neutral-800">
            {tool.pricing && (
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                {tool.pricing}
              </span>
            )}
            {tool.views !== undefined && tool.views > 0 && (
              <div className="flex items-center gap-1 text-xs text-neutral-500">
                <span>{tool.views.toLocaleString()}</span>
                <span>views</span>
              </div>
            )}
          </div>
        </CardContent>

        {/* Hover gradient overlay */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-50/0 via-primary-50/0 to-primary-50/0 transition-all duration-300 group-hover:from-primary-50/50 group-hover:via-primary-50/30 group-hover:to-primary-50/50 dark:group-hover:from-primary-900/20 dark:group-hover:via-primary-900/10 dark:group-hover:to-primary-900/20" />
      </Card>
    </Link>
  )
}

