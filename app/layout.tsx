import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'AI Tool Directory - Discover the Best AI Tools',
    template: '%s | AI Tool Directory',
  },
  description:
    'Discover and explore the best AI tools for productivity, development, design, and more. Submit your AI tool or read the latest news.',
  keywords: ['AI tools', 'artificial intelligence', 'productivity', 'software'],
  authors: [{ name: 'AI Tool Directory' }],
  creator: 'AI Tool Directory',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXTAUTH_URL || 'https://example.com',
    siteName: 'AI Tool Directory',
    title: 'AI Tool Directory - Discover the Best AI Tools',
    description:
      'Discover and explore the best AI tools for productivity, development, design, and more.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Tool Directory',
    description: 'Discover and explore the best AI tools',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

