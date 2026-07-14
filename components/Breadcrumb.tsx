'use client'

import { usePathname } from 'next/navigation'
import Link from './Link'
import DesktopIcon from './desktop/DesktopIcon'

const labels: Record<string, string> = {
  blog: 'Posts',
  posts: 'Posts',
  tags: 'Tags',
  about: 'About',
  projects: 'Projects',
  search: 'Search',
  archives: 'Archives',
  notes: 'Notes',
}
const windowsRoot = 'C:\\HITSUJI.PAGE'
const windowsSeparator = '\\'

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function formatSegment(segment: string, index: number, label?: string) {
  if (label) return label

  const decoded = safeDecode(segment)

  if (labels[decoded]) return labels[decoded]

  const text = decoded
    .replace(/(\d+)-(\d+|x)/gi, (_, left: string, right: string) => {
      const section = right.toLowerCase()
      return `${Number(left)}.${section === 'x' ? 'x' : Number(section)}`
    })
    .replaceAll('-', ' ')

  return index === 0 ? text.replace(/^\w/, (char) => char.toUpperCase()) : text
}

type BreadcrumbProps = {
  labelsByHref?: Record<string, string>
}

export default function Breadcrumb({ labelsByHref = {} }: BreadcrumbProps) {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return null

  const visibleSegments =
    segments[0] === 'blog' && segments[1] === 'page'
      ? [`Posts (page ${segments[2] || 1})`]
      : segments[0] === 'tags' && segments[2] === 'page'
        ? ['Tags', `${segments[1]}${segments[3] ? ` (page ${segments[3]})` : ''}`]
        : segments[0] === 'blog'
          ? ['Posts']
          : segments

  return (
    <nav className="breadcrumb-bar app-layout mt-8 mb-1" aria-label="breadcrumb">
      <div className="breadcrumb-bar__inner">
        <span className="breadcrumb-bar__label" aria-hidden="true">
          Address
        </span>
        <div className="breadcrumb-bar__field">
          <span className="breadcrumb-bar__icon" aria-hidden="true">
            <DesktopIcon variant="computer" />
          </span>
          <ul className="breadcrumb-list font-light">
            <li>
              <Link
                href="/"
                aria-label="Home"
                className="text-[var(--text-muted)] hover:text-[var(--link-hover)]"
              >
                {windowsRoot}
              </Link>{' '}
              <span aria-hidden="true" className="breadcrumb-separator">
                {windowsSeparator}
              </span>{' '}
            </li>

            {visibleSegments.map((segment, index) => {
              const isLast = index === visibleSegments.length - 1
              const href =
                segment === 'Posts' || String(segment).startsWith('Posts ')
                  ? '/blog'
                  : segment === 'Tags'
                    ? '/tags'
                    : `/${segments.slice(0, index + 1).join('/')}`

              const label = labelsByHref[href]

              return (
                <li key={`${segment}-${index}`}>
                  {isLast ? (
                    <span className="text-[var(--text-muted)]" aria-current="page">
                      {formatSegment(segment, index, label)}
                    </span>
                  ) : (
                    <>
                      <Link
                        href={href}
                        className="text-[var(--text-muted)] hover:text-[var(--link-hover)]"
                      >
                        {formatSegment(segment, index, label)}
                      </Link>{' '}
                      <span aria-hidden="true" className="breadcrumb-separator">
                        {windowsSeparator}
                      </span>{' '}
                    </>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </nav>
  )
}
