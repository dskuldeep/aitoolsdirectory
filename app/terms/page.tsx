import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Container } from '@/components/layout/container'
import { getCanonicalUrl } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | AI Tool Directory',
  description: 'Terms of Service for AI Tool Directory.',
  alternates: {
    canonical: getCanonicalUrl('/terms'),
  },
}

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-8 text-4xl font-bold">Terms of Service</h1>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Last updated: {new Date().toLocaleDateString()}</p>
              <h2 className="mt-8 text-2xl font-semibold">Acceptance of Terms</h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                By accessing and using this website, you accept and agree to be bound by the terms and
                provision of this agreement.
              </p>
              <h2 className="mt-8 text-2xl font-semibold">Use License</h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                Permission is granted to temporarily access the materials on AI Tool Directory for
                personal, non-commercial transitory viewing only.
              </p>
              <h2 className="mt-8 text-2xl font-semibold">User Submissions</h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                You are responsible for the content you submit. By submitting content, you grant us the
                right to use, modify, and display that content.
              </p>
              <h2 className="mt-8 text-2xl font-semibold">Limitations</h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                In no event shall AI Tool Directory or its suppliers be liable for any damages arising out
                of the use or inability to use the materials on this website.
              </p>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  )
}

