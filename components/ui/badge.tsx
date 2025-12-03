import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          {
            'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200':
              variant === 'default',
            'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200':
              variant === 'primary',
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200':
              variant === 'success',
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200':
              variant === 'warning',
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200':
              variant === 'danger',
          },
          className
        )}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

