import { Suspense } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Container } from '@/components/layout/container'
import { Pagination } from '@/components/ui/pagination'
import { ToolCard } from '@/components/tools/tool-card'
import { SearchBar } from '@/components/filters/search-bar'
import { FilterPills } from '@/components/filters/filter-pills'
import { prisma } from '@/lib/prisma'
import { SparklesIcon, FunnelIcon } from '@heroicons/react/24/outline'

// Use SSR for tools listing
export const dynamic = 'force-dynamic'

async function getTools(searchParams: {
  page?: string
  category?: string
  tag?: string
  pricing?: string
  license?: string
  sort?: string
  q?: string
}) {
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const skip = (page - 1) * limit

  const where: any = {
    approved: true,
  }

  if (searchParams.category) {
    where.category = searchParams.category
  }

  if (searchParams.tag) {
    where.tags = { has: searchParams.tag }
  }

  if (searchParams.pricing) {
    where.pricing = searchParams.pricing
  }

  if (searchParams.license) {
    where.license = searchParams.license
  }

  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q, mode: 'insensitive' } },
      { tagline: { contains: searchParams.q, mode: 'insensitive' } },
      { description: { contains: searchParams.q, mode: 'insensitive' } },
      { tags: { has: searchParams.q } },
    ]
  }

  const orderBy: any = {}
  switch (searchParams.sort) {
    case 'newest':
      orderBy.createdAt = 'desc'
      break
    case 'oldest':
      orderBy.createdAt = 'asc'
      break
    case 'popular':
      orderBy.views = 'desc'
      break
    case 'name':
      orderBy.name = 'asc'
      break
    default:
      orderBy.createdAt = 'desc'
  }

  const [tools, total] = await Promise.all([
    prisma.tool.findMany({
      where,
      skip,
      take: limit,
      orderBy,
    }),
    prisma.tool.count({ where }),
  ])

  return { tools, total, page, limit }
}

async function getCategories() {
  const tools = await prisma.tool.findMany({
    where: { approved: true },
    select: { category: true },
  })

  const categories = Array.from(new Set(tools.map((t) => t.category)))
  return categories.sort()
}

async function getUniqueValues(field: 'pricing' | 'license') {
  const tools = await prisma.tool.findMany({
    where: { approved: true },
    select: { [field]: true },
  })

  const values = Array.from(
    new Set(
      tools
        .map((t) => t[field])
        .filter((v): v is string => v !== null && v !== undefined && v.trim() !== '')
    )
  )
  return values.sort()
}

function ToolsContent({
  searchParams,
  tools,
  total,
  page,
  limit,
  categories,
  pricingOptions,
  licenseOptions,
}: {
  searchParams: {
    page?: string
    category?: string
    tag?: string
    pricing?: string
    license?: string
    sort?: string
    q?: string
  }
  tools: any[]
  total: number
  page: number
  limit: number
  categories: string[]
  pricingOptions: string[]
  licenseOptions: string[]
}) {
  const totalPages = Math.ceil(total / limit)

  return (
    <>
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold">AI Tools Directory</h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Discover {total} AI tools for productivity, development, and creativity
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <Suspense fallback={<div className="h-12 animate-pulse rounded-xl bg-neutral-200" />}>
          <SearchBar />
        </Suspense>

        {/* Filter Pills - Single Line */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {/* Categories */}
          <Suspense fallback={<div className="h-7 w-20 animate-pulse rounded-full bg-neutral-200" />}>
            <FilterPills
              filters={categories.map((cat) => ({
                label: cat,
                value: cat,
                param: 'category',
              }))}
              activeParam="category"
              label="Categories"
            />
          </Suspense>

          {/* Pricing */}
          {pricingOptions.length > 0 && (
            <Suspense fallback={<div className="h-7 w-20 animate-pulse rounded-full bg-neutral-200" />}>
              <FilterPills
                filters={pricingOptions.map((opt) => ({
                  label: opt,
                  value: opt,
                  param: 'pricing',
                }))}
                activeParam="pricing"
                label="Pricing"
              />
            </Suspense>
          )}

          {/* License */}
          {licenseOptions.length > 0 && (
            <Suspense fallback={<div className="h-7 w-20 animate-pulse rounded-full bg-neutral-200" />}>
              <FilterPills
                filters={licenseOptions.map((opt) => ({
                  label: opt,
                  value: opt,
                  param: 'license',
                }))}
                activeParam="license"
                label="License"
              />
            </Suspense>
          )}
        </div>
      </div>

      {/* Tools Grid */}
      {tools.length === 0 ? (
        <div className="py-20 text-center">
          <SparklesIcon className="mx-auto mb-4 h-16 w-16 text-neutral-400" />
          <p className="text-xl font-medium text-neutral-600 dark:text-neutral-400">
            No tools found
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            Try adjusting your filters or search terms
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} showFeatured={true} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl="/tools"
                searchParams={searchParams}
              />
            </div>
          )}
        </>
      )}
    </>
  )
}

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: {
    page?: string
    category?: string
    tag?: string
    pricing?: string
    license?: string
    sort?: string
    q?: string
  }
}) {
  const [tools, categories, pricingOptions, licenseOptions] = await Promise.all([
    getTools(searchParams).then((r) => r.tools),
    getCategories(),
    getUniqueValues('pricing'),
    getUniqueValues('license'),
  ])

  const { total, page, limit } = await getTools(searchParams)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8">
        <Container>
          <ToolsContent
            searchParams={searchParams}
            tools={tools}
            total={total}
            page={page}
            limit={limit}
            categories={categories}
            pricingOptions={pricingOptions}
            licenseOptions={licenseOptions}
          />
        </Container>
      </main>
      <Footer />
    </div>
  )
}

