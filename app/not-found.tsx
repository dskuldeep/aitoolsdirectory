'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold">404</h1>
          <p className="mt-4 text-xl text-neutral-600 dark:text-neutral-400">
            Page not found
          </p>
          <Link href="/" className="mt-8 inline-block">
            <Button variant="primary">Go Home</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}

