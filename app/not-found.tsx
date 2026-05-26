import Link from '@/components/Link'

export default function NotFound() {
  return (
    <main id="main-content" className="app-layout flex flex-1 items-center justify-center">
      <div className="mb-14 flex flex-col items-center justify-center text-center">
        <h1 className="text-9xl font-bold text-[var(--accent)]">404</h1>
        <span aria-hidden="true">¯\_(ツ)_/¯</span>
        <p className="mt-4 text-2xl sm:text-3xl">Page Not Found</p>
        <Link
          href="/"
          className="my-6 text-lg underline decoration-dashed underline-offset-8 hover:text-[var(--accent)]"
        >
          Go back home
        </Link>
      </div>
    </main>
  )
}
