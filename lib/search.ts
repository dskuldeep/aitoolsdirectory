import { MeiliSearch } from 'meilisearch'

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_MASTER_KEY,
})

const INDEX_NAME = 'tools'

export interface ToolDocument {
  id: string
  name: string
  slug: string
  tagline: string | null
  description: string
  category: string
  tags: string[]
  pricing: string | null
  license: string | null
  integrations: string[]
  website: string | null
  github: string | null
  approved: boolean
  featured: boolean
  createdAt: string
  views: number
}

export async function initializeSearchIndex() {
  try {
    const index = client.index(INDEX_NAME)

    // Configure searchable attributes
    await index.updateSearchableAttributes([
      'name',
      'tagline',
      'description',
      'category',
      'tags',
    ])

    // Configure filterable attributes
    await index.updateFilterableAttributes([
      'category',
      'tags',
      'pricing',
      'license',
      'integrations',
      'approved',
      'featured',
    ])

    // Configure sortable attributes
    await index.updateSortableAttributes(['createdAt', 'views'])

    // Configure ranking rules
    await index.updateRankingRules([
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness',
    ])

    console.log('Search index initialized')
  } catch (error) {
    console.error('Failed to initialize search index:', error)
    throw error
  }
}

export async function indexTool(tool: ToolDocument) {
  try {
    const index = client.index(INDEX_NAME)
    await index.addDocuments([tool])
    return true
  } catch (error) {
    console.error('Failed to index tool:', error)
    return false
  }
}

export async function updateTool(tool: ToolDocument) {
  try {
    const index = client.index(INDEX_NAME)
    await index.updateDocuments([tool])
    return true
  } catch (error) {
    console.error('Failed to update tool:', error)
    return false
  }
}

export async function deleteTool(toolId: string) {
  try {
    const index = client.index(INDEX_NAME)
    await index.deleteDocument(toolId)
    return true
  } catch (error) {
    console.error('Failed to delete tool:', error)
    return false
  }
}

export interface SearchOptions {
  q?: string
  filters?: string
  sort?: string[]
  page?: number
  limit?: number
  facets?: string[]
}

export interface SearchResult {
  hits: ToolDocument[]
  total: number
  page: number
  limit: number
  facets?: Record<string, Record<string, number>>
}

export async function searchTools(options: SearchOptions = {}): Promise<SearchResult> {
  try {
    const {
      q = '',
      filters,
      sort = ['createdAt:desc'],
      page = 1,
      limit = 20,
      facets = ['category', 'tags', 'pricing', 'license'],
    } = options

    const index = client.index(INDEX_NAME)

    const searchParams: any = {
      limit,
      offset: (page - 1) * limit,
      sort,
      facetsDistribution: facets,
    }

    if (filters) {
      searchParams.filter = filters
    }

    const response = await index.search(q, searchParams)

    return {
      hits: response.hits as ToolDocument[],
      total: response.estimatedTotalHits || 0,
      page,
      limit,
      facets: response.facetsDistribution,
    }
  } catch (error) {
    console.error('Search error:', error)
    return {
      hits: [],
      total: 0,
      page: options.page || 1,
      limit: options.limit || 20,
    }
  }
}

export async function syncAllTools() {
  try {
    const { prisma } = await import('@/lib/prisma')
    const tools = await prisma.tool.findMany({
      where: { approved: true },
    })

    const documents: ToolDocument[] = tools.map((tool) => ({
      id: tool.id.toString(),
      name: tool.name,
      slug: tool.slug,
      tagline: tool.tagline,
      description: tool.description,
      category: tool.category,
      tags: tool.tags,
      pricing: tool.pricing || null,
      license: tool.license || null,
      integrations: tool.integrations,
      website: tool.website || null,
      github: tool.github || null,
      approved: tool.approved,
      featured: tool.featured,
      createdAt: tool.createdAt.toISOString(),
      views: tool.views,
    }))

    const index = client.index(INDEX_NAME)
    await index.addDocuments(documents)

    console.log(`Synced ${documents.length} tools to search index`)
    return documents.length
  } catch (error) {
    console.error('Failed to sync tools:', error)
    throw error
  }
}

