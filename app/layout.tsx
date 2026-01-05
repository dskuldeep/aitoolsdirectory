import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'AGI Tracker - Discover the Best AI Tools',
    template: '%s | AGI Tracker',
  },
  description:
    'Discover and explore the best AI tools for productivity, development, design, and more. Submit your AI tool or read the latest news.',
  keywords: ['AI tools', 'artificial intelligence', 'productivity', 'software'],
  authors: [{ name: 'AGI Tracker' }],
  creator: 'AGI Tracker',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXTAUTH_URL || 'https://agitracker.io',
    siteName: 'AGI Tracker',
    title: 'AGI Tracker - Discover the Best AI Tools',
    description:
      'Discover and explore the best AI tools for productivity, development, design, and more.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AGI Tracker',
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
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-FTN0C9FEWL"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-FTN0C9FEWL');
          `}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

