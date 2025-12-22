'use client'
export const runtime = "edge"


import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const toolSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  tagline: z.string().max(300).optional(),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  category: z.string().min(1, 'Category is required'),
  tags: z.string().min(1, 'At least one tag is required'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  github: z.string().url('Invalid URL').optional().or(z.literal('')),
  pricing: z.string().optional(),
  license: z.string().optional(),
  integrations: z.string().optional(),
  screenshots: z.string().optional(),
  approved: z.boolean().default(true),
  featured: z.boolean().default(false),
})

type ToolFormData = z.infer<typeof toolSchema>

const CATEGORIES = [
  'Productivity',
  'Development',
  'Design',
  'Marketing',
  'Writing',
  'Analytics',
  'Other',
]

const PRICING_OPTIONS = ['Free', 'Freemium', 'Paid', 'Open Source', 'Enterprise']

export default function NewToolPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ToolFormData>({
    resolver: zodResolver(toolSchema),
    defaultValues: {
      approved: true,
      featured: false,
    },
  })

  const onSubmit = async (data: ToolFormData) => {
    setLoading(true)
    setError('')

    try {
      const tags = data.tags.split(',').map((t) => t.trim()).filter(Boolean)
      const integrations = data.integrations
        ? data.integrations.split(',').map((i) => i.trim()).filter(Boolean)
        : []
      const screenshots = data.screenshots
        ? data.screenshots.split(',').map((s) => s.trim()).filter(Boolean).map((url) => ({ url }))
        : []

      const response = await fetch('/api/admin/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          tagline: data.tagline || null,
          website: data.website || null,
          github: data.github || null,
          pricing: data.pricing || null,
          license: data.license || null,
          tags,
          integrations,
          screenshots,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create tool')
      }

      router.push('/admin/tools')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add New Tool</h1>
        <p className="text-neutral-600 dark:text-neutral-400">Create a new tool listing</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tool Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Name *</label>
                <Input {...register('name')} placeholder="Tool Name" />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Category *</label>
                <select
                  {...register('category')}
                  className="flex w-full rounded-button border border-neutral-300 bg-white px-3 py-2 text-base shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Tagline</label>
              <Input {...register('tagline')} placeholder="Short tagline" />
              {errors.tagline && (
                <p className="mt-1 text-sm text-red-600">{errors.tagline.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Description *</label>
              <textarea
                {...register('description')}
                rows={6}
                className="flex w-full rounded-button border border-neutral-300 bg-white px-3 py-2 text-base shadow-sm transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                placeholder="Detailed description (at least 50 characters)"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Tags *</label>
              <Input
                {...register('tags')}
                placeholder="tag1, tag2, tag3"
              />
              <p className="mt-1 text-xs text-neutral-500">Separate tags with commas</p>
              {errors.tags && (
                <p className="mt-1 text-sm text-red-600">{errors.tags.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Website URL</label>
                <Input {...register('website')} type="url" placeholder="https://agitracker.io" />
                {errors.website && (
                  <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">GitHub URL</label>
                <Input {...register('github')} type="url" placeholder="https://github.com/..." />
                {errors.github && (
                  <p className="mt-1 text-sm text-red-600">{errors.github.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Pricing</label>
                <select
                  {...register('pricing')}
                  className="flex w-full rounded-button border border-neutral-300 bg-white px-3 py-2 text-base shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  <option value="">Select pricing</option>
                  {PRICING_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">License</label>
                <Input {...register('license')} placeholder="MIT, Apache, etc." />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Integrations</label>
              <Input
                {...register('integrations')}
                placeholder="Slack, Discord, Notion (comma-separated)"
              />
              <p className="mt-1 text-xs text-neutral-500">Separate with commas</p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Screenshot URLs</label>
              <Input
                {...register('screenshots')}
                placeholder="https://agitracker.io/screenshot1.png, https://agitracker.io/screenshot2.png"
              />
              <p className="mt-1 text-xs text-neutral-500">Separate URLs with commas</p>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('approved')}
                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm">Approved</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('featured')}
                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm">Featured</span>
              </label>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Tool'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

