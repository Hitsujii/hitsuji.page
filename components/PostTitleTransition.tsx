import type { CSSProperties, ReactNode } from 'react'
import { contentTitleViewTransitionName } from './view-transitions'

type Props = {
  title?: string
  transitionKey?: string
  children: ReactNode
}

export default function PostTitleTransition({ title, transitionKey, children }: Props) {
  const key = transitionKey ?? title

  return (
    <span
      className="inline-block"
      style={
        key
          ? ({ viewTransitionName: contentTitleViewTransitionName(key) } as CSSProperties)
          : undefined
      }
    >
      {children}
    </span>
  )
}
