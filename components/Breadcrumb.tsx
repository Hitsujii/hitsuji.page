'use client'

import { usePathname } from 'next/navigation'
import Link from './Link'

const labels: Record<string, string> = {
  blog: 'Posts',
  posts: 'Posts',
  tags: 'Tags',
  about: 'About',
  projects: 'Projects',
  search: 'Search',
  archives: 'Archives',
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function formatSegment(segment: string, index: number) {
  const decoded = safeDecode(segment)

  if (labels[decoded]) return labels[decoded]

  const text = decoded.replaceAll('-', ' ')
  return index > 0 ? text.toLowerCase() : text.replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function Breadcrumb() {
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
    <nav className="app-layout mt-8 mb-1" aria-label="breadcrumb">
      <ul className="font-light [&>li]:inline">
        <li>
          <Link href="/" className="opacity-80 hover:opacity-100">
            Home
          </Link>{' '}
          <span aria-hidden="true" className="opacity-80">
            &raquo;
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

          return (
            <li key={`${segment}-${index}`}>
              {isLast ? (
                <span
                  className={index > 0 ? 'lowercase opacity-75' : 'capitalize opacity-75'}
                  aria-current="page"
                >
                  {formatSegment(segment, index)}
                </span>
              ) : (
                <>
                  <Link href={href} className="capitalize opacity-70 hover:opacity-100">
                    {formatSegment(segment, index)}
                  </Link>{' '}
                  <span aria-hidden="true" className="opacity-70">
                    &raquo;
                  </span>{' '}
                </>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
