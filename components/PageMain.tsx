import type { ReactNode } from 'react'
import RememberBackUrl from './RememberBackUrl'

type PageMainProps = {
  title: string | [string, string]
  description?: string
  children: ReactNode
  className?: string
}

export default function PageMain({ title, description, children, className = '' }: PageMainProps) {
  return (
    <>
      <RememberBackUrl />
      <main id="main-content" className={['app-layout pb-4', className].filter(Boolean).join(' ')}>
        <h1 className="text-2xl font-semibold sm:text-3xl">
          {Array.isArray(title) ? (
            <>
              {title[0]} <span className="text-[var(--primary)]">{title[1]}</span>
            </>
          ) : (
            title
          )}
        </h1>
        {description && <p className="mt-2 mb-6 italic">{description}</p>}
        {children}
      </main>
    </>
  )
}
