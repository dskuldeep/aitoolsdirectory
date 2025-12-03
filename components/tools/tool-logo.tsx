'use client'

import { SparklesIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'

interface ToolLogoProps {
  website: string | null | undefined
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ToolLogo({ website, name, size = 'md', className = '' }: ToolLogoProps) {
  const [logoError, setLogoError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState<string | null>(null)
  const [hasTriedFallback, setHasTriedFallback] = useState(false)

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-20 w-20',
  }

  const paddingClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  }

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  }

  // Initialize logo URL
  useEffect(() => {
    if (website && !currentSrc) {
      try {
        const domain = new URL(website).hostname.replace('www.', '')
        setCurrentSrc(`https://logo.clearbit.com/${domain}`)
      } catch {
        setLogoError(true)
      }
    }
  }, [website, currentSrc])

  const handleError = () => {
    if (!hasTriedFallback && website) {
      try {
        const domain = new URL(website).hostname.replace('www.', '')
        setCurrentSrc(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`)
        setHasTriedFallback(true)
      } catch {
        setLogoError(true)
      }
    } else {
      setLogoError(true)
    }
  }

  if (!website || logoError) {
    return (
      <div
        className={`${sizeClasses[size]} flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 ring-2 ring-neutral-200 dark:from-primary-900 dark:to-primary-800 dark:ring-neutral-700 ${className}`}
      >
        <SparklesIcon className={`${iconSizes[size]} text-primary-600 dark:text-primary-400`} />
      </div>
    )
  }

  return (
    <div
      className={`${sizeClasses[size]} overflow-hidden rounded-xl bg-white ring-2 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700 ${className}`}
    >
      {currentSrc && (
        <img
          src={currentSrc}
          alt={`${name} logo`}
          className={`h-full w-full object-contain ${paddingClasses[size]} dark:brightness-110 dark:contrast-110`}
          onError={handleError}
        />
      )}
    </div>
  )
}

