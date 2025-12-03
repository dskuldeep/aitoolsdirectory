import { SelectHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'flex w-full rounded-button border border-neutral-300 bg-white px-3 py-2 text-base shadow-sm transition-colors',
          'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100',
          className
        )}
        {...props}
      />
    )
  }
)

Select.displayName = 'Select'

