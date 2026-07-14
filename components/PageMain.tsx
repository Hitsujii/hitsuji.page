import type { ReactNode } from 'react'
import RememberBackUrl from './RememberBackUrl'
import PageHeader from './PageHeader'

type PageMainProps = {
  title: string | [string, string]
  description?: string
  children: ReactNode
  className?: string
  titleTransitionKey?: string
  accentViewTransitionName?: string
}

export default function PageMain({
  title,
  description,
  children,
  className = '',
  titleTransitionKey,
  accentViewTransitionName,
}: PageMainProps) {
  return (
    <>
      <RememberBackUrl />
      <main id="main-content" className={['app-layout pb-4', className].filter(Boolean).join(' ')}>
        <PageHeader
          title={title}
          description={description}
          titleTransitionKey={titleTransitionKey}
          accentViewTransitionName={accentViewTransitionName}
        />
        {children}
      </main>
    </>
  )
}
