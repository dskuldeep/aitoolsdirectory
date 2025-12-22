'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { submissionSchema, type SubmissionInput } from '@/lib/validation'
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'

const CATEGORIES = [
  'Productivity',
  'Development',
  'Design',
  'Writing',
  'Marketing',
  'Analytics',
  'Customer Support',
  'Education',
  'Other',
]

const PRICING_OPTIONS = ['Free', 'Freemium', 'Paid', 'Open Source', 'Enterprise']

export default function SubmitPage() {
  const [screenshots, setScreenshots] = useState<Array<{ url: string; alt?: string; imageId?: string }>>([])
  const [iconUrl, setIconUrl] = useState<string>('')
  const [iconImageId, setIconImageId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadingIcon, setUploadingIcon] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SubmissionInput>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      toolData: {
        tags: [],
        integrations: [],
      },
    },
  })

  const tags = watch('toolData.tags') || []

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/public', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      setScreenshots([...screenshots, { url: data.url, alt: '', imageId: data.id }])
    } catch (err: any) {
      setError(err.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingIcon(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/public', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      setIconUrl(data.url)
      setIconImageId(data.id)
    } catch (err: any) {
      setError(err.message || 'Failed to upload icon')
    } finally {
      setUploadingIcon(false)
    }
  }

  const handleIconUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setIconUrl(url)
    setIconImageId(null) // Clear imageId when using URL
  }

  const removeScreenshot = (index: number) => {
    setScreenshots(screenshots.filter((_, i) => i !== index))
  }

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setValue('toolData.tags', [...tags, tag])
    }
  }

  const removeTag = (tag: string) => {
    setValue(
      'toolData.tags',
      tags.filter((t) => t !== tag)
    )
  }

  const onSubmit = async (data: SubmissionInput) => {
    setSubmitting(true)
    setError(null)

    try {
      const payload = {
        ...data,
        toolData: {
          ...data.toolData,
          icon: iconUrl || undefined,
          screenshots,
        },
        iconImageId: iconImageId || undefined,
        screenshotImageIds: screenshots.map(s => s.imageId).filter(Boolean),
        honeypot: '', // Honeypot field
      }

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Submission failed')
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to submit tool')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-16">
          <Container size="md">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-2xl text-green-600">Submission Received!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-neutral-600 dark:text-neutral-400">
                  Thank you for submitting your tool. We've received your submission and our team
                  will review it shortly.
                </p>
                <p className="mb-6 text-sm text-neutral-500">
                  You'll receive an email confirmation and another email once we've reviewed your
                  submission.
                </p>
                <div className="flex justify-center gap-4">
                  <Button variant="primary" onClick={() => window.location.href = '/'}>
                    Go Home
                  </Button>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Submit Another
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Container>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8">
        <Container size="md">
          <div className="mb-8">
            <h1 className="mb-4 text-4xl font-bold">Submit Your AI Tool</h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Share your AI tool with our community. Fill out the form below and we'll review it
              shortly.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Honeypot field */}
            <input type="text" name="honeypot" style={{ display: 'none' }} tabIndex={-1} />

            {/* Tool Information */}
            <Card>
              <CardHeader>
                <CardTitle>Tool Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Tool Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register('toolData.name')}
                    placeholder="e.g., ChatGPT"
                    aria-invalid={errors.toolData?.name ? 'true' : 'false'}
                  />
                  {errors.toolData?.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.toolData.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Tagline</label>
                  <Input
                    {...register('toolData.tagline')}
                    placeholder="A short description of your tool"
                  />
                  {errors.toolData?.tagline && (
                    <p className="mt-1 text-sm text-red-600">{errors.toolData.tagline.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Icon</label>
                  <div className="space-y-2">
                    <Input
                      value={iconUrl}
                      onChange={handleIconUrlChange}
                      type="url"
                      placeholder="https://example.com/icon.png"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-neutral-500">or</span>
                      <label className="flex cursor-pointer items-center gap-2 rounded-button border border-neutral-300 bg-white px-3 py-2 text-sm transition-colors hover:border-primary-500 dark:border-neutral-700 dark:bg-neutral-800">
                        <PhotoIcon className="h-4 w-4" />
                        <span>{uploadingIcon ? 'Uploading...' : 'Upload Icon'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleIconUpload}
                          className="hidden"
                          disabled={uploadingIcon}
                        />
                      </label>
                    </div>
                    {iconUrl && (
                      <div className="mt-2 flex items-center gap-2">
                        <img
                          src={iconUrl}
                          alt="Icon preview"
                          className="h-16 w-16 rounded-md object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIconUrl('')
                            setIconImageId(null)
                          }}
                          className="rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  {errors.toolData?.icon && (
                    <p className="mt-1 text-sm text-red-600">{errors.toolData.icon.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('toolData.description')}
                    rows={6}
                    className="flex w-full rounded-button border border-neutral-300 bg-white px-3 py-2 text-base shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                    placeholder="Describe your tool in detail..."
                  />
                  {errors.toolData?.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.toolData.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('toolData.category')}
                    className="flex w-full rounded-button border border-neutral-300 bg-white px-3 py-2 text-base shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {errors.toolData?.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.toolData.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Tags <span className="text-red-500">*</span>
                  </label>
                  <div className="mb-2 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-md bg-primary-100 px-2 py-1 text-sm text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-primary-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <Input
                    placeholder="Add a tag and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const value = e.currentTarget.value.trim()
                        if (value) {
                          addTag(value)
                          e.currentTarget.value = ''
                        }
                      }
                    }}
                  />
                  {errors.toolData?.tags && (
                    <p className="mt-1 text-sm text-red-600">{errors.toolData.tags.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Links */}
            <Card>
              <CardHeader>
                <CardTitle>Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Website</label>
                  <Input
                    {...register('toolData.website')}
                    type="url"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">GitHub</label>
                  <Input
                    {...register('toolData.github')}
                    type="url"
                    placeholder="https://github.com/username/repo"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Pricing</label>
                  <select
                    {...register('toolData.pricing')}
                    className="flex w-full rounded-button border border-neutral-300 bg-white px-3 py-2 text-base shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  >
                    <option value="">Select pricing model</option>
                    {PRICING_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">License</label>
                  <Input
                    {...register('toolData.license')}
                    placeholder="e.g., MIT, Apache 2.0"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Screenshots */}
            <Card>
              <CardHeader>
                <CardTitle>Screenshots</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {screenshots.map((screenshot, index) => (
                    <div key={index} className="relative aspect-video overflow-hidden rounded-card">
                      <img
                        src={screenshot.url}
                        alt={screenshot.alt || `Screenshot ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeScreenshot(index)}
                        className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {screenshots.length < 5 && (
                    <label className="flex aspect-video cursor-pointer items-center justify-center rounded-card border-2 border-dashed border-neutral-300 hover:border-primary-500 dark:border-neutral-700">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      {uploading ? (
                        <span className="text-sm text-neutral-500">Uploading...</span>
                      ) : (
                        <PhotoIcon className="h-8 w-8 text-neutral-400" />
                      )}
                    </label>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submitter Info */}
            <Card>
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register('submitterEmail')}
                    type="email"
                    placeholder="your@email.com"
                  />
                  {errors.submitterEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.submitterEmail.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Name</label>
                  <Input
                    {...register('submitterName')}
                    placeholder="Your name (optional)"
                  />
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-900 dark:text-red-200">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => window.history.back()}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting || uploading}>
                {submitting ? 'Submitting...' : 'Submit Tool'}
              </Button>
            </div>
          </form>
        </Container>
      </main>
      <Footer />
    </div>
  )
}

