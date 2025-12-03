'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface AdminHeaderProps {
  user: {
    name: string | null
    email: string
    role: string
  }
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="fixed top-0 left-64 right-0 z-10 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-8 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-sm text-neutral-600 hover:text-primary-600 dark:text-neutral-400">
          ← Back to Site
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {user.name || user.email}
        </span>
        <Button variant="outline" size="sm" onClick={() => signOut()}>
          Sign Out
        </Button>
      </div>
    </header>
  )
}

