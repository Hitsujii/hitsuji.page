import type { ReactNode } from 'react'
import RememberBackUrl from './RememberBackUrl'
import PageHeader from './PageHeader'

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
        <PageHeader title={title} description={description} />
        {children}
      </main>
    </>
  )
}
