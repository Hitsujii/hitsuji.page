'use client'

import { useEffect, useState } from 'react'
import Link from './Link'
import { normalizeAppPath } from './path-utils'

type BackButtonProps = {
  fallbackHref: string
}

export default function BackButton({ fallbackHref }: BackButtonProps) {
  const [href, setHref] = useState(normalizeAppPath(fallbackHref))

  useEffect(() => {
    const currentHref = normalizeAppPath(
      `${window.location.pathname}${window.location.search}${window.location.hash}`
    )
    const fallback = normalizeAppPath(fallbackHref)
    const storedBackUrl = sessionStorage.getItem('backUrl')
    const normalizedStoredBackUrl = storedBackUrl ? normalizeAppPath(storedBackUrl) : ''

    // Rewrite old broken values such as /next-paper/next-paper/ immediately.
    if (storedBackUrl && normalizedStoredBackUrl !== storedBackUrl) {
      sessionStorage.setItem('backUrl', normalizedStoredBackUrl)
    }

    if (normalizedStoredBackUrl && normalizedStoredBackUrl !== currentHref) {
      setHref(normalizedStoredBackUrl)
      return
    }

    setHref(fallback)
  }, [fallbackHref])

  return (
    <Link
      id="back-button"
      href={href}
      className="focus-outline -ms-2 mt-6 mb-2 inline-flex min-h-11 items-center px-2 text-sm text-[var(--text-muted)] hover:text-[var(--link-hover)]"
      aria-label="Go back"
    >
      <span aria-hidden="true">[← back]</span>
    </Link>
  )
}
