import type { CSSProperties, ReactNode } from 'react'
import { postTitleViewTransitionName } from './view-transitions'

type Props = {
  title: string | undefined
  children: ReactNode
}

export default function PostTitleTransition({ title, children }: Props) {
  return (
    <span
      className="inline-block"
      style={{ viewTransitionName: postTitleViewTransitionName(title) } as CSSProperties}
    >
      {children}
    </span>
  )
}
