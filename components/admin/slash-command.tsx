'use client'

import { useCallback, useEffect, useState } from 'react'
import { Extension } from '@tiptap/core'
import { ReactRenderer } from '@tiptap/react'
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion'
import {
  PhotoIcon,
  ChatBubbleLeftRightIcon,
  ListBulletIcon,
  HashtagIcon,
  CodeBracketIcon,
  LinkIcon,
} from '@heroicons/react/24/outline'

export interface SlashCommandItem {
  title: string
  description: string
  icon: React.ReactNode
  command: (editor: any) => void
}

const getSuggestionItems = (query: string): SlashCommandItem[] => {
  const baseItems: SlashCommandItem[] = [
    {
      title: 'Heading 1',
      description: 'Big section heading',
      icon: <HashtagIcon className="h-5 w-5" />,
      command: (editor) => {
        editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from }).toggleHeading({ level: 1 }).run()
      },
    },
    {
      title: 'Heading 2',
      description: 'Medium section heading',
      icon: <HashtagIcon className="h-5 w-5" />,
      command: (editor) => {
        editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from }).toggleHeading({ level: 2 }).run()
      },
    },
    {
      title: 'Heading 3',
      description: 'Small section heading',
      icon: <HashtagIcon className="h-5 w-5" />,
      command: (editor) => {
        editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from }).toggleHeading({ level: 3 }).run()
      },
    },
    {
      title: 'Bullet List',
      description: 'Create a bulleted list',
      icon: <ListBulletIcon className="h-5 w-5" />,
      command: (editor) => {
        editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from }).toggleBulletList().run()
      },
    },
    {
      title: 'Numbered List',
      description: 'Create a numbered list',
      icon: <span className="text-sm font-bold">1.</span>,
      command: (editor) => {
        editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from }).toggleOrderedList().run()
      },
    },
    {
      title: 'Callout',
      description: 'Add a callout or quote',
      icon: <ChatBubbleLeftRightIcon className="h-5 w-5" />,
      command: (editor) => {
        editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from }).toggleBlockquote().run()
      },
    },
    {
      title: 'Code Block',
      description: 'Add a code block',
      icon: <CodeBracketIcon className="h-5 w-5" />,
      command: (editor) => {
        editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from }).toggleCodeBlock().run()
      },
    },
    {
      title: 'Upload Image',
      description: 'Upload an image from your computer',
      icon: <PhotoIcon className="h-5 w-5" />,
      command: (editor) => {
        editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from }).run()
        // Trigger will be handled by SlashCommandList component
      },
    },
    {
      title: 'Image from URL',
      description: 'Add an image from a URL',
      icon: <LinkIcon className="h-5 w-5" />,
      command: (editor) => {
        editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from }).run()
        const url = window.prompt('Enter image URL:')
        if (url) {
          editor.chain().focus().setImage({ src: url }).run()
        }
      },
    },
  ]

  if (!query) {
    return baseItems
  }

  return baseItems.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase())
  )
}

function SlashCommandList({
  items,
  command,
  onImageUpload,
}: {
  items: SlashCommandItem[]
  command: (item: SlashCommandItem) => void
  onImageUpload: () => void
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = useCallback(
    (index: number) => {
      const item = items[index]
      if (item) {
        // Update the command to use the actual onImageUpload
        if (item.title === 'Upload Image') {
          onImageUpload()
        } else {
          command(item)
        }
      }
    },
    [items, command, onImageUpload]
  )

  useEffect(() => {
    const navigationKeys = ['ArrowUp', 'ArrowDown', 'Enter']
    const onKeyDown = (e: KeyboardEvent) => {
      if (navigationKeys.includes(e.key)) {
        e.preventDefault()
        if (e.key === 'ArrowUp') {
          setSelectedIndex((selectedIndex + items.length - 1) % items.length)
          return true
        }
        if (e.key === 'ArrowDown') {
          setSelectedIndex((selectedIndex + 1) % items.length)
          return true
        }
        if (e.key === 'Enter') {
          selectItem(selectedIndex)
          return true
        }
      }
      return false
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [selectedIndex, items, selectItem])

  useEffect(() => {
    setSelectedIndex(0)
  }, [items])

  return (
    <div className="slash-command-menu z-50 min-w-[280px] rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
      {items.length ? (
        items.map((item, index) => (
          <button
            key={index}
            className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
              index === selectedIndex
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700'
            }`}
            onClick={() => selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded bg-neutral-100 dark:bg-neutral-700">
              {item.icon}
            </div>
            <div className="flex-1">
              <div className="font-medium">{item.title}</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">{item.description}</div>
            </div>
          </button>
        ))
      ) : (
        <div className="px-3 py-2 text-sm text-neutral-500">No results</div>
      )}
    </div>
  )
}

export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      ...this.parent?.(),
      onImageUpload: () => {},
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: { editor: any; range: any; props: SlashCommandItem }) => {
          if (editor && props) {
            props.command(editor)
          }
        },
        items: ({ query }: { query: string }) => {
          return getSuggestionItems(query)
        },
      } as Partial<SuggestionOptions<SlashCommandItem>>,
    }
  },

  addProseMirrorPlugins() {
    // Capture options and editor in closure
    const options = this.options || {}
    const editor = this.editor
    const onImageUpload = options.onImageUpload || (() => {})
    
    return [
      Suggestion({
        editor: editor,
        char: options.suggestion?.char || '/',
        command: options.suggestion?.command || (() => {}),
        items: options.suggestion?.items || (() => []),
        render: () => {
          let component: ReactRenderer | null = null
          let popup: any = null
          let tippyInstance: any = null

          // Lazy load tippy only on client
          const getTippy = async () => {
            if (typeof window === 'undefined') return null
            if (tippyInstance) return tippyInstance
            
            const tippyModule = await import('tippy.js')
            tippyInstance = tippyModule.default
            return tippyInstance
          }

          return {
            onStart: (props: any) => {
              // Only run on client side
              if (typeof window === 'undefined') return

              // Load tippy synchronously if available, otherwise load it
              getTippy().then((tippy) => {
                if (!tippy) return

                component = new ReactRenderer(SlashCommandList, {
                  props: {
                    ...props,
                    onImageUpload: onImageUpload,
                  },
                  editor: props.editor,
                })

                if (!props.clientRect) {
                  return
                }

                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                })
              })
            },
            onUpdate: (props: any) => {
              if (typeof window === 'undefined' || !component) return

              component.updateProps({
                ...props,
                onImageUpload: onImageUpload,
              })

              if (!props.clientRect) {
                return
              }

              if (popup && popup[0]) {
                popup[0].setProps({
                  getReferenceClientRect: props.clientRect,
                })
              }
            },
            onKeyDown: (props: any) => {
              if (!component) return false

              if (props.event.key === 'Escape') {
                if (popup && popup[0]) {
                  popup[0].hide()
                }
                return true
              }

              return component.ref?.onKeyDown(props)
            },
            onExit: () => {
              if (popup && popup[0]) {
                popup[0].destroy()
              }
              if (component) {
                component.destroy()
              }
            },
          }
        },
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from)
          return $from.parent.type.name !== 'codeBlock'
        },
      }),
    ]
  },
})
