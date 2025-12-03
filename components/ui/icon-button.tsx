'use client'

import { cn } from '@/lib/utils'

interface IconButtonProps {
  href: string
  variant?: 'primary' | 'outline'
  children: React.ReactNode
  className?: string
}

export function IconButton({ href, variant = 'primary', children, className }: IconButtonProps) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={cn(
        'inline-flex items-center justify-center rounded-button font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 w-full',
        variant === 'primary' 
          ? 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 px-4 py-2 text-base'
          : 'border border-neutral-300 bg-transparent hover:bg-neutral-50 focus:ring-neutral-500 dark:border-neutral-700 dark:hover:bg-neutral-800 px-4 py-2 text-base',
        className
      )}
    >
      {children}
      <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  )
}
