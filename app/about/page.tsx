import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Container } from '@/components/layout/container'
import { getCanonicalUrl } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About | AI Tool Directory',
  description: 'Learn about the AI Tool Directory and our mission to help you discover the best AI tools.',
  alternates: {
    canonical: getCanonicalUrl('/about'),
  },
}

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-8 text-4xl font-bold">About</h1>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                AI Tool Directory is a curated platform dedicated to helping you discover the best AI tools
                for productivity, development, design, and creativity.
              </p>
              <h2 className="mt-8 text-2xl font-semibold">Our Mission</h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                We aim to make it easy for individuals and teams to find, evaluate, and use AI tools that
                can enhance their workflow and productivity. Our directory is carefully curated to ensure
                quality and relevance.
              </p>
              <h2 className="mt-8 text-2xl font-semibold">What We Do</h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                We maintain a comprehensive directory of AI tools across various categories, provide
                detailed information about each tool, and publish articles and guides to help you make
                informed decisions.
              </p>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  )
}

