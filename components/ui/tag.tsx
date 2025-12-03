import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary'
}

export const Tag = forwardRef<HTMLSpanElement, TagProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-md px-2 py-1 text-sm font-medium transition-colors',
          {
            'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700':
              variant === 'default',
            'bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-300 dark:hover:bg-primary-800':
              variant === 'primary',
          },
          className
        )}
        {...props}
      />
    )
  }
)

Tag.displayName = 'Tag'

