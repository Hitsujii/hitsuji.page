import type { CSSProperties, ReactNode } from 'react'
import { pageTitleViewTransitionName } from './view-transitions'

type PageHeaderProps = {
  title: string | [string, string]
  description?: string
  aside?: ReactNode
  titleTransitionKey?: string
  accentViewTransitionName?: string
}

export default function PageHeader({
  title,
  description,
  aside,
  titleTransitionKey,
  accentViewTransitionName,
}: PageHeaderProps) {
  const titleStyle =
    titleTransitionKey && !accentViewTransitionName
      ? ({ viewTransitionName: pageTitleViewTransitionName(titleTransitionKey) } as CSSProperties)
      : undefined
  const accentStyle = accentViewTransitionName
    ? ({ viewTransitionName: accentViewTransitionName } as CSSProperties)
    : undefined

  return (
    <header className="page-header">
      <div className="page-header__title-row">
        <h1 style={titleStyle}>
          {Array.isArray(title) ? (
            <>
              {title[0]} <span style={accentStyle}>{title[1]}</span>
            </>
          ) : (
            title
          )}
        </h1>
        {aside}
      </div>

      {description && <p>{description}</p>}
    </header>
  )
}
