import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Container } from '@/components/layout/container'

export const metadata = {
  title: 'Privacy Policy | AI Tool Directory',
  description: 'Privacy Policy for AI Tool Directory.',
}

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-8 text-4xl font-bold">Privacy Policy</h1>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Last updated: {new Date().toLocaleDateString()}</p>
              <h2 className="mt-8 text-2xl font-semibold">Information We Collect</h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                We collect information that you provide directly to us, such as when you create an account,
                submit a tool, or contact us.
              </p>
              <h2 className="mt-8 text-2xl font-semibold">How We Use Your Information</h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                We use the information we collect to provide, maintain, and improve our services, process
                your submissions, and communicate with you.
              </p>
              <h2 className="mt-8 text-2xl font-semibold">Data Security</h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                We implement appropriate security measures to protect your personal information against
                unauthorized access, alteration, disclosure, or destruction.
              </p>
              <h2 className="mt-8 text-2xl font-semibold">Contact Us</h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                If you have any questions about this Privacy Policy, please contact us.
              </p>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  )
}

