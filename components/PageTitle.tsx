import type { ReactNode } from 'react'
import PostTitleTransition from './PostTitleTransition'

interface Props {
  children: ReactNode
  viewTransitionTitle?: string
  asChild?: boolean
}

export default function PageTitle({ children, viewTransitionTitle, asChild = false }: Props) {
  const title = viewTransitionTitle ?? (typeof children === 'string' ? children : undefined)

  if (asChild) {
    return (
      <PostTitleTransition title={title}>
        <span className="inline-block">{children}</span>
      </PostTitleTransition>
    )
  }

  return (
    <PostTitleTransition title={title}>
      <h1 className="inline-block text-2xl font-bold text-[var(--primary)] sm:text-3xl">
        {children}
      </h1>
    </PostTitleTransition>
  )
}
