import type { Metadata } from 'next'
import Link from '@/components/Link'
import { genPageMetadata } from 'app/seo'
import LearningLogRedirect from './LearningLogRedirect'

export const metadata: Metadata = genPageMetadata({
  title: 'History',
  description: 'Learning logs now live in the history stream on the homepage.',
  alternates: { canonical: '/' },
  robots: { index: false, follow: true },
})

export default function LearningLogRedirectPage() {
  return (
    <>
      <LearningLogRedirect />

      <main id="main-content" className="app-layout py-16">
        <p className="text-sm text-[var(--text-muted)]">
          logs moved to <Link href="/#history">~/latest</Link>
        </p>
      </main>
    </>
  )
}
