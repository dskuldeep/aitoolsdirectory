'use client'
export const runtime = "edge"


import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MarkdownEditor } from '@/components/admin/markdown-editor'
import { HeroImageUpload } from '@/components/admin/hero-image-upload'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const articleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  excerpt: z.string().max(500).optional(),
  body: z.string().min(100, 'Body must be at least 100 characters'),
  tags: z.string().optional(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  heroImage: z.string().optional().or(z.literal('')),
})

type ArticleFormData = z.infer<typeof articleSchema>

export default function NewArticlePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [body, setBody] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      published: false,
      featured: false,
    },
  })

  const onSubmit = async (data: ArticleFormData) => {
    setLoading(true)
    setError('')

    try {
      const tags = data.tags
        ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : []

      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          body,
          excerpt: data.excerpt || null,
          heroImage: data.heroImage || null,
          tags,
          publishedAt: data.published ? new Date().toISOString() : null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create article')
      }

      router.push('/admin/articles')
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
        <h1 className="text-3xl font-bold">Add New Article</h1>
        <p className="text-neutral-600 dark:text-neutral-400">Create a new blog article</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Article Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium">Title *</label>
              <Input {...register('title')} placeholder="Article Title" />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Excerpt</label>
              <textarea
                {...register('excerpt')}
                rows={3}
                className="flex w-full rounded-button border border-neutral-300 bg-white px-3 py-2 text-base shadow-sm transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                placeholder="Short excerpt for preview"
              />
              {errors.excerpt && (
                <p className="mt-1 text-sm text-red-600">{errors.excerpt.message}</p>
              )}
            </div>

            <div>
              <HeroImageUpload
                value={watch('heroImage') || ''}
                onChange={(url) => setValue('heroImage', url, { shouldValidate: true })}
                error={errors.heroImage?.message}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Body *</label>
              <MarkdownEditor
                content={body}
                onChange={(content) => {
                  setBody(content)
                  setValue('body', content, { shouldValidate: true })
                }}
                placeholder="Write your article content here..."
              />
              {errors.body && (
                <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Tags</label>
              <Input
                {...register('tags')}
                placeholder="tag1, tag2, tag3"
              />
              <p className="mt-1 text-xs text-neutral-500">Separate tags with commas</p>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('published')}
                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm">Published</span>
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
                {loading ? 'Creating...' : 'Create Article'}
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

