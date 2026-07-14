import Link from '@/components/Link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: false },
  alternates: { canonical: null },
}

export default function NotFound() {
  return (
    <main id="main-content" className="app-layout flex flex-1 items-center justify-center">
      <div className="mb-14 w-full max-w-xl border-l border-[var(--border-strong)] pl-5">
        <p className="text-xs text-[var(--primary)]">$ hitsuji++ ./requested-page.cpp</p>
        <h1 className="mt-2 text-5xl font-bold text-[var(--foreground-strong)]">404</h1>
        <p className="mt-5 text-sm text-[var(--foreground)]">
          <span className="text-[var(--destructive)]">fatal error:</span> page.hpp: No such file or
          directory
        </p>
        <p className="mt-1 text-sm text-[var(--text-muted)]">compilation terminated.</p>
        <Link
          href="/"
          className="mt-7 inline-flex min-h-11 items-center text-sm text-[var(--link)] underline decoration-dashed underline-offset-4 hover:text-[var(--link-hover)]"
        >
          [cd ~]
        </Link>
      </div>
    </main>
  )
}
