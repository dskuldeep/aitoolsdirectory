'use client'

import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'
import { MagnifyingGlassIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline'

export function Header() {
  const { data: session } = useSession()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/80">
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-primary-600 dark:text-primary-400">
              AI Tool Directory
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <Link
                href="/tools"
                className="text-sm font-medium text-neutral-700 transition-colors hover:text-primary-600 dark:text-neutral-300 dark:hover:text-primary-400"
              >
                Tools
              </Link>
              <Link
                href="/blog"
                className="text-sm font-medium text-neutral-700 transition-colors hover:text-primary-600 dark:text-neutral-300 dark:hover:text-primary-400"
              >
                Blog
              </Link>
              <Link
                href="/submit"
                className="text-sm font-medium text-neutral-700 transition-colors hover:text-primary-600 dark:text-neutral-300 dark:hover:text-primary-400"
              >
                Submit Tool
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/tools"
              className="p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>
            {session ? (
              <>
                {((session.user as any)?.role === 'admin' ||
                  (session.user as any)?.role === 'editor') && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm">
                      Admin
                    </Button>
                  </Link>
                )}
                <Button variant="outline" size="sm" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Button variant="primary" size="sm" onClick={() => signIn()}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

