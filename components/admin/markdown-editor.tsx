'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Blockquote from '@tiptap/extension-blockquote'
import CodeBlock from '@tiptap/extension-code-block'
import { SlashCommand } from '@/components/admin/slash-command'
import { Button } from '@/components/ui/button'
import {
  BoldIcon,
  ItalicIcon,
  ListBulletIcon,
  LinkIcon,
  PhotoIcon,
  ChatBubbleLeftRightIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline'
import 'tippy.js/dist/tippy.css'

interface MarkdownEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export function MarkdownEditor({ content, onChange, placeholder = 'Type "/" for commands or start writing...' }: MarkdownEditorProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadingCount, setUploadingCount] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<any>(null)

  const handleImageClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Define handleImageUpload before useEditor so it can be used in editorProps
  const handleImageUpload = useCallback(async (file: File, insertAtCursor = true) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return null
    }

    setUploading(true)
    setUploadingCount((prev) => prev + 1)
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
      
      // Ensure URL is absolute if needed
      const imageUrl = data.url.startsWith('http') ? data.url : `${window.location.origin}${data.url}`
      
      console.log('Image uploaded successfully:', imageUrl)
      
      if (insertAtCursor && editorRef.current) {
        console.log('Inserting image at cursor:', imageUrl)
        // Use setTimeout to ensure editor is ready
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.chain().focus().setImage({ src: imageUrl }).run()
          }
        }, 100)
      } else if (insertAtCursor) {
        console.warn('Editor ref not available, cannot insert image')
      }
      
      return imageUrl
    } catch (error: any) {
      console.error('Upload error:', error)
      const errorMessage = error.message || 'Failed to upload image. Please check your storage configuration and try again.'
      alert(errorMessage)
      return null
    } finally {
      setUploadingCount((prev) => {
        const newCount = prev - 1
        if (newCount <= 0) {
          setUploading(false)
          return 0
        }
        return newCount
      })
    }
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        blockquote: false, // We'll use our custom blockquote
        codeBlock: false, // We'll use our custom code block
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-600 underline cursor-pointer',
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true, // Allow base64 for pasting from Notion
        HTMLAttributes: {
          class: 'max-w-full rounded-lg my-4',
        },
      }),
      Blockquote.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            class: {
              default: 'notion-callout',
            },
          }
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'notion-code-block',
        },
      }),
      SlashCommand.configure({
        onImageUpload: handleImageClick,
      } as any),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    onCreate: ({ editor }) => {
      editorRef.current = editor
    },
    editorProps: {
      attributes: {
        class: 'notion-editor min-h-[400px] focus:outline-none',
      },
      handlePaste: (view, event, _slice) => {
        const clipboardData = event.clipboardData
        if (!clipboardData) return false
        
        const items = Array.from(clipboardData.items)
        const html = clipboardData.getData('text/html')
        const plainText = clipboardData.getData('text/plain')
        
        // Debug: Log what we're getting
        console.log('Paste detected:', {
          itemsCount: items.length,
          itemTypes: items.map(i => ({ kind: i.kind, type: i.type })),
          hasHtml: !!html,
          hasPlainText: !!plainText,
          htmlPreview: html?.substring(0, 200),
          plainTextPreview: plainText?.substring(0, 200),
        })
        
        // Collect all image files from clipboard
        const imageFiles: Array<{ file: File; name: string }> = []
        items.forEach((item) => {
          if (item.kind === 'file') {
            const file = item.getAsFile()
            if (file && file.type.startsWith('image/')) {
              imageFiles.push({ file, name: file.name })
              console.log('Found image file:', file.name, file.type)
            }
          }
        })
        
        // Handle direct image paste (no HTML)
        if (imageFiles.length > 0 && !html) {
          event.preventDefault()
          imageFiles.forEach(({ file }) => {
            handleImageUpload(file, true)
          })
          return true
        }
        
        // Handle HTML paste with images (from Notion, Google Docs, etc.)
        if (html || plainText) {
          const parser = new DOMParser()
          const doc = html ? parser.parseFromString(html, 'text/html') : null
          const images = doc ? doc.querySelectorAll('img') : []
          
          // Check for image references in text
          const imageFilePattern = /([A-Za-z0-9_\s\-]+\.(png|jpg|jpeg|gif|webp|webm))/gi
          const textMatches = [...(html?.match(imageFilePattern) || []), ...(plainText?.match(imageFilePattern) || [])]
          const uniqueImageRefs = [...new Set(textMatches)]
          
          const hasImageFiles = imageFiles.length > 0
          const hasImageTags = images.length > 0
          const hasImageTextRefs = uniqueImageRefs.length > 0
          
          console.log('Image detection:', {
            hasImageFiles,
            hasImageTags,
            hasImageTextRefs,
            imageRefs: uniqueImageRefs,
            imageFiles: imageFiles.map(f => f.name),
          })
          
          if (hasImageFiles || hasImageTags || hasImageTextRefs) {
            event.preventDefault()
            
            const imageMap = new Map<string, string>() // filename -> uploaded URL
            const imagePromises: Promise<void>[] = []
            
            // Process image files from clipboard
            imageFiles.forEach(({ file, name }) => {
              const promise = handleImageUpload(file, false).then((url) => {
                if (url) {
                  console.log('Uploaded image:', name, '->', url)
                  imageMap.set(name, url)
                  // Also try matching without extension and with different variations
                  const nameWithoutExt = name.replace(/\.(png|jpg|jpeg|gif|webp|webm)$/i, '')
                  imageMap.set(nameWithoutExt, url)
                  // Try with spaces replaced
                  imageMap.set(name.replace(/\s/g, '-'), url)
                  imageMap.set(name.replace(/\s/g, '_'), url)
                }
              })
              imagePromises.push(promise)
            })
            
            // Process base64 images in HTML
            Array.from(images).forEach((img) => {
              const src = img.getAttribute('src')
              if (!src) return
              
              if (src.startsWith('data:image/')) {
                const promise = (async () => {
                  try {
                    const response = await fetch(src)
                    const blob = await response.blob()
                    const file = new File([blob], `pasted-image-${Date.now()}.${blob.type.split('/')[1] || 'png'}`, { 
                      type: blob.type || 'image/png' 
                    })
                    const uploadedUrl = await handleImageUpload(file, false)
                    if (uploadedUrl) {
                      img.setAttribute('src', uploadedUrl)
                    }
                  } catch (error) {
                    console.error('Error processing base64 image:', error)
                  }
                })()
                imagePromises.push(promise)
              }
            })
            
            // Wait for all uploads, then process content
            Promise.all(imagePromises).then(() => {
              let contentToInsert = ''
              
              if (doc) {
                contentToInsert = doc.body.innerHTML
              } else if (plainText) {
                // If no HTML, use plain text and convert line breaks
                contentToInsert = plainText.split('\n').map(line => `<p>${line}</p>`).join('')
              }
              
              // Replace image filename references with actual image tags
              imageMap.forEach((url, fileName) => {
                // Try multiple patterns to match the filename
                const patterns = [
                  // Exact match
                  new RegExp(`\\b${fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'),
                  // With any whitespace around it
                  new RegExp(`\\s*${fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'gi'),
                  // In various HTML contexts
                  new RegExp(`>([^<]*${fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^<]*)<`, 'gi'),
                ]
                
                patterns.forEach((pattern) => {
                  contentToInsert = contentToInsert.replace(pattern, (match, _p1) => {
                    // Don't replace if it's already in an img tag or link
                    if (match.includes('<img') || match.includes('src=') || match.includes('href=') || match.includes('</a>')) {
                      return match
                    }
                    // Replace with image tag
                    return `<img src="${url}" alt="${fileName}" class="max-w-full rounded-lg my-4" />`
                  })
                })
              })
              
              // Also handle text references that might be standalone
              uniqueImageRefs.forEach((ref) => {
                imageMap.forEach((url, fileName) => {
                  if (ref.includes(fileName) || fileName.includes(ref.replace(/\.(png|jpg|jpeg|gif|webp|webm)$/i, ''))) {
                    const escapedRef = ref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                    contentToInsert = contentToInsert.replace(
                      new RegExp(escapedRef, 'g'),
                      (match) => {
                        if (match.includes('<img') || match.includes('src=')) {
                          return match
                        }
                        return `<img src="${url}" alt="${ref}" class="max-w-full rounded-lg my-4" />`
                      }
                    )
                  }
                })
              })
              
              console.log('Inserting content:', contentToInsert.substring(0, 500))
              console.log('Image map:', Array.from(imageMap.entries()))
              
              // If we have image files but no matches were replaced, try a more aggressive approach
              if (imageMap.size > 0) {
                // Try to find and replace any remaining image references
                const allImageRefs = contentToInsert.match(/[A-Za-z0-9_\s\-]+\.(png|jpg|jpeg|gif|webp|webm)/gi) || []
                allImageRefs.forEach((ref) => {
                  imageMap.forEach((url, fileName) => {
                    // Try fuzzy matching
                    const refName = ref.toLowerCase().trim()
                    const fileNameLower = fileName.toLowerCase().trim()
                    const fileNameNoExt = fileNameLower.replace(/\.(png|jpg|jpeg|gif|webp|webm)$/i, '')
                    const refNoExt = refName.replace(/\.(png|jpg|jpeg|gif|webp|webm)$/i, '')
                    
                    if (refName === fileNameLower || refNoExt === fileNameNoExt || 
                        refName.includes(fileNameNoExt) || fileNameNoExt.includes(refNoExt)) {
                      const escapedRef = ref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                      contentToInsert = contentToInsert.replace(
                        new RegExp(escapedRef, 'gi'),
                        (match) => {
                          if (match.includes('<img') || match.includes('src=') || match.includes('href=')) {
                            return match
                          }
                          return `<img src="${url}" alt="${ref}" class="max-w-full rounded-lg my-4" />`
                        }
                      )
                    }
                  })
                })
              }
              
              // Insert the processed content
              if (editorRef.current) {
                editorRef.current.commands.insertContent(contentToInsert, {
                  parseOptions: {
                    preserveWhitespace: 'full',
                  },
                })
              }
            })
            
            return true
          }
        }
        
        return false // Let TipTap handle the paste normally
      },
    },
  })

  if (!editor || !isMounted) {
    return (
      <div className="notion-editor-wrapper rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
        <div className="p-6">
          <div className="notion-editor min-h-[400px] text-neutral-400">Loading editor...</div>
        </div>
      </div>
    )
  }


  const addImageFromUrl = () => {
    const url = window.prompt('Enter image URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const toggleCallout = () => {
    if (editor.isActive('blockquote')) {
      editor.chain().focus().toggleBlockquote().run()
    } else {
      editor.chain().focus().toggleBlockquote().run()
    }
  }

  return (
    <div className="notion-editor-wrapper rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm transition-all focus-within:border-primary-400 focus-within:shadow-md">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (file) {
            await handleImageUpload(file, true)
          }
          // Reset the input so the same file can be selected again
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        }}
      />

      {/* Floating Toolbar - appears on selection */}
      {editor.state.selection.empty ? null : (
        <div className="flex items-center gap-1 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-2 rounded-t-lg">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`h-8 w-8 p-0 ${editor.isActive('heading', { level: 1 }) ? 'bg-neutral-200 dark:bg-neutral-700' : ''}`}
            title="Heading 1"
          >
            <span className="text-xs font-bold">H1</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`h-8 w-8 p-0 ${editor.isActive('heading', { level: 2 }) ? 'bg-neutral-200 dark:bg-neutral-700' : ''}`}
            title="Heading 2"
          >
            <span className="text-xs font-bold">H2</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`h-8 w-8 p-0 ${editor.isActive('heading', { level: 3 }) ? 'bg-neutral-200 dark:bg-neutral-700' : ''}`}
            title="Heading 3"
          >
            <span className="text-xs font-bold">H3</span>
          </Button>
          <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-700 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('bold') ? 'bg-neutral-200 dark:bg-neutral-700' : ''}`}
            title="Bold"
          >
            <BoldIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('italic') ? 'bg-neutral-200 dark:bg-neutral-700' : ''}`}
            title="Italic"
          >
            <ItalicIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('code') ? 'bg-neutral-200 dark:bg-neutral-700' : ''}`}
            title="Code"
          >
            <CodeBracketIcon className="h-4 w-4" />
          </Button>
          <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-700 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('bulletList') ? 'bg-neutral-200 dark:bg-neutral-700' : ''}`}
            title="Bullet List"
          >
            <ListBulletIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('orderedList') ? 'bg-neutral-200 dark:bg-neutral-700' : ''}`}
            title="Numbered List"
          >
            <span className="text-xs">1.</span>
          </Button>
          <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-700 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleCallout}
            className={`h-8 w-8 p-0 ${editor.isActive('blockquote') ? 'bg-neutral-200 dark:bg-neutral-700' : ''}`}
            title="Callout"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
          </Button>
          <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-700 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addLink}
            className={`h-8 w-8 p-0 ${editor.isActive('link') ? 'bg-neutral-200 dark:bg-neutral-700' : ''}`}
            title="Add Link"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleImageClick}
            disabled={uploading}
            className="h-8 w-8 p-0"
            title="Upload Image"
          >
            <PhotoIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addImageFromUrl}
            className="h-8 w-8 p-0"
            title="Add Image from URL"
          >
            <span className="text-xs">URL</span>
          </Button>
        </div>
      )}

      {/* Editor */}
      <div className="p-6">
        {uploading && (
          <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            {uploadingCount > 1 
              ? `Uploading ${uploadingCount} images...` 
              : 'Uploading image...'}
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
