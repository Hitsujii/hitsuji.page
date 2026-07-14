import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string | [string, string]
  description?: string
  aside?: ReactNode
}

export default function PageHeader({ title, description, aside }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header__title-row">
        <span className="page-header__sigil" aria-hidden="true">
          {'//'}
        </span>
        <h1>
          {Array.isArray(title) ? (
            <>
              {title[0]} <span>{title[1]}</span>
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
