'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface HeroImageUploadProps {
  value: string
  onChange: (url: string) => void
  error?: string
}

export function HeroImageUpload({ value, onChange, error }: HeroImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      alert('File too large (max 10MB)')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      
      if (!data.url) {
        throw new Error('No URL returned from upload')
      }

      // Convert to absolute URL for preview
      const imageUrl = data.url.startsWith('http') ? data.url : `${window.location.origin}${data.url}`
      
      setPreview(imageUrl)
      onChange(data.url) // Store the relative URL
    } catch (error: any) {
      console.error('Upload error:', error)
      alert(`Failed to upload image: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUrlChange = (url: string) => {
    onChange(url)
    // Convert relative URLs to absolute for preview
    if (url && !url.startsWith('http')) {
      setPreview(`${window.location.origin}${url}`)
    } else {
      setPreview(url || null)
    }
  }

  // Update preview when value changes externally
  useEffect(() => {
    if (value) {
      if (value.startsWith('http')) {
        setPreview(value)
      } else if (value.startsWith('/')) {
        setPreview(`${window.location.origin}${value}`)
      } else {
        setPreview(value)
      }
    } else {
      setPreview(null)
    }
  }, [value])

  const handleRemove = () => {
    onChange('')
    setPreview(null)
    if (urlInputRef.current) {
      urlInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <label className="mb-1 block text-sm font-medium">Hero Image</label>
      
      {/* Preview */}
      {preview && (
        <div className="relative w-full max-w-md">
          <img
            src={preview}
            alt="Hero preview"
            className="h-48 w-full rounded-lg object-cover border border-neutral-200 dark:border-neutral-700"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 transition-colors"
            title="Remove image"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2"
        >
          <PhotoIcon className="h-4 w-4" />
          {uploading ? 'Uploading...' : 'Upload Image'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        <span className="flex items-center text-sm text-neutral-500">or</span>
        <Input
          ref={urlInputRef}
          type="url"
          placeholder="https://example.com/image.jpg"
          defaultValue={value && value.startsWith('http') ? value : ''}
          onChange={(e) => handleUrlChange(e.target.value)}
          className="flex-1"
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      <p className="text-xs text-neutral-500">
        Upload an image or enter a URL. Recommended size: 1200x630px
      </p>
    </div>
  )
}

