'use client'

import { useEffect, useState } from 'react'
import Link from './Link'
import { IconChevronLeft } from './icons/AstroPaperIcons'
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
      className="focus-outline -ms-2 mt-8 mb-2 inline-flex items-center gap-1 hover:text-[color-mix(in_srgb,var(--foreground)_75%,transparent)]"
      aria-label="Go back"
    >
      <IconChevronLeft className="inline-block size-6 rtl:rotate-180" />
      <span>Go back</span>
    </Link>
  )
}
