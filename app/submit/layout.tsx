import { getCanonicalUrl } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Submit Your Tool | AI Tool Directory',
  description: 'Submit your AI tool to be featured in our directory. Help others discover great AI tools.',
  alternates: {
    canonical: getCanonicalUrl('/submit'),
  },
}

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

