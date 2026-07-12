'use client'

import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import { IconArrowLeft, IconArrowNarrowUp } from './icons/AstroPaperIcons'

export default function BackToTopButton() {
  const [scrollPercent, setScrollPercent] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const rootElement = document.documentElement
    let frameId: number | null = null

    const updateScrollState = () => {
      frameId = null
      const scrollTotal = rootElement.scrollHeight - rootElement.clientHeight
      const scrollTop = rootElement.scrollTop
      const nextPercent =
        scrollTotal > 0
          ? Math.min(100, Math.max(0, Math.floor((scrollTop / scrollTotal) * 100)))
          : 0

      setScrollPercent(nextPercent)
      setVisible(scrollTotal > 0 && scrollTop / scrollTotal > 0.3)
    }

    const handleScroll = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateScrollState)
      }
    }

    updateScrollState()

    document.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      document.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [])

  const progressStyle = {
    backgroundImage: `conic-gradient(var(--primary), var(--primary) ${scrollPercent}%, transparent ${scrollPercent}%)`,
  } as CSSProperties

  const topProgressStyle = {
    width: `${scrollPercent}%`,
  } as CSSProperties

  return (
    <>
      <div className="progress-container fixed top-0 left-0 z-10 h-1 w-full bg-[var(--background)]">
        <div id="myBar" className="progress-bar h-1 bg-[var(--primary)]" style={topProgressStyle} />
      </div>

      <div
        id="btt-btn-container"
        className={[
          'fixed inset-e-4 bottom-8 z-50',
          'md:sticky md:inset-e-auto md:float-end md:me-1',
          'transition duration-500',
          visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-14 opacity-0',
        ].join(' ')}
        aria-hidden={!visible}
      >
        <button
          data-button="back-to-top"
          type="button"
          className={[
            'group relative bg-[var(--background)] px-2 py-1',
            'size-14 rounded-full shadow-xl',
            'md:h-8 md:w-fit md:rounded-md md:shadow-none md:focus-visible:rounded-none',
            'md:bg-[color-mix(in_srgb,var(--background)_35%,transparent)] md:bg-clip-padding md:backdrop-blur-lg',
          ].join(' ')}
          aria-label="Back to top"
          tabIndex={visible ? undefined : -1}
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                ? 'auto'
                : 'smooth',
            })
          }
        >
          <span
            id="progress-indicator"
            aria-hidden="true"
            className="absolute inset-0 -z-10 block size-14 scale-110 rounded-full bg-transparent md:hidden md:h-8 md:rounded-md"
            style={progressStyle}
          />

          <IconArrowLeft className="inline-block rotate-90 md:hidden" />

          <span className="sr-only text-sm group-hover:text-[var(--primary-hover)] md:not-sr-only">
            <IconArrowNarrowUp className="inline-block size-4" />
            Back to top
          </span>
        </button>
      </div>
    </>
  )
}
