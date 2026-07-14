'use client'

import type { CSSProperties } from 'react'
import Link from '@/components/Link'
import { slug } from 'github-slugger'
import { IconHash } from './icons/AstroPaperIcons'
import { tagViewTransitionName } from './view-transitions'

interface Props {
  text: string
  size?: 'sm' | 'lg'
  count?: number
  transition?: boolean
}

export default function Tag({ text, size = 'sm', count, transition = true }: Props) {
  const tagSlug = slug(text)
  const label = text.split(' ').join('-')
  const style = transition
    ? ({ viewTransitionName: tagViewTransitionName(text) } as CSSProperties)
    : undefined

  return (
    <Link
      href={`/tags/${tagSlug}`}
      style={style}
      className={[
        'tag-link inline-flex items-center gap-0.5 border-b-2 border-dashed border-[var(--foreground)]',
        'text-[var(--foreground)] visited:text-[var(--foreground)]',
        'hover:-mt-0.5 hover:border-[var(--primary)] hover:text-[var(--primary-hover)]',
        'focus-visible:border-transparent focus-visible:text-[var(--primary)]',
        size === 'lg' ? 'text-lg' : 'text-sm',
      ].join(' ')}
      aria-label={count ? `View ${count} posts tagged ${label}` : `View posts tagged ${label}`}
    >
      <IconHash className={size === 'lg' ? 'size-5 opacity-80' : 'size-4 opacity-80'} />
      <span>{label}</span>
      {typeof count === 'number' && (
        <span className="ml-1 text-sm text-[var(--text-muted)]">({count})</span>
      )}
    </Link>
  )
}
